// Phase 18 live gate. Usage: node verify-live.mjs <pushed-sha>
// Waits for the Deploy run for that SHA to succeed, then crawls internal links. Exits 1 on failure.
import { execFileSync } from 'node:child_process';

const ORIGIN = 'https://danbeng.github.io';
const BASE = '/toolsforfree';
const PREFIX = `${ORIGIN}${BASE}`;
const sha = process.argv[2];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const die = (m) => {
  console.error(`FAIL: ${m}`);
  process.exit(1);
};
if (!/^[0-9a-f]{40}$/.test(sha ?? '')) die('pass the full 40-char pushed SHA');

async function waitForDeploy() {
  const deadline = Date.now() + 20 * 60 * 1000;
  while (Date.now() < deadline) {
    const raw = execFileSync(
      'gh',
      ['run', 'list', '--workflow', 'Deploy', '--commit', sha, '--limit', '5', '--json', 'databaseId,status,conclusion'],
      { encoding: 'utf8' },
    );
    const runs = JSON.parse(raw);
    const done = runs.find((r) => r.status === 'completed');
    if (done) {
      if (done.conclusion !== 'success') die(`Deploy run ${done.databaseId} for ${sha} concluded ${done.conclusion}`);
      console.log(`Deploy run ${done.databaseId} succeeded for ${sha}`);
      return;
    }
    await sleep(20000);
  }
  die(`no successful Deploy run for ${sha} within 20 minutes`);
}

async function get(url) {
  const res = await fetch(url, { redirect: 'manual', headers: { 'cache-control': 'no-cache' } });
  const body = res.status === 200 || res.status === 404 ? await res.text() : '';
  return { status: res.status, location: res.headers.get('location'), body };
}

const hrefs = (html) => [...html.matchAll(/\s(?:href|src)="([^"]*)"/g)].map((m) => m[1]);

async function loadSeed(path, expectStatus) {
  const url = `${PREFIX}${path}`;
  const deadline = Date.now() + 10 * 60 * 1000;
  let last;
  while (Date.now() < deadline) {
    last = await get(url);
    // Fresh = serves base-prefixed links and no placeholder origin. Noindex 404 carries no
    // canonical (D-09 amended), so a stale 404 that still has one cannot pass.
    const fresh =
      last.body.includes(`href="${BASE}/"`) &&
      !last.body.includes('https://example.com/') &&
      (expectStatus !== 404 || !/<link\b[^>]*rel="canonical"/.test(last.body));
    if (last.status === expectStatus && fresh) return last.body;
    await sleep(15000);
  }
  die(`seed ${url} never served the new build (last status ${last?.status})`);
}

async function checkUrl(url) {
  const first = await get(url);
  if (first.status === 200) return;
  if (first.status === 301 && first.location) {
    const target = new URL(first.location, url).href;
    if (target !== `${url.replace(/[?#].*$/, '')}/`) die(`${url} 301 to ${target}, not its slashed form`);
    const hop = await get(target);
    if (hop.status !== 200) die(`${url} 301 then ${hop.status}`);
    return;
  }
  die(`${url} returned ${first.status}`);
}

await waitForDeploy();

const seeds = [
  ['/', 200],
  ['/zh/', 200],
  ['/tools/json-formatter/', 200],
  ['/this-path-is-not-a-tool/', 404],
];
const targets = new Set();
const pages = {};
for (const [path, status] of seeds) {
  const html = await loadSeed(path, status);
  pages[path] = html;
  for (const raw of hrefs(html)) {
    if (raw.startsWith('//')) die(`protocol-relative href on ${path}: ${raw}`);
    let abs;
    if (raw.startsWith('/')) {
      if (raw !== BASE && !raw.startsWith(`${BASE}/`)) die(`href on ${path} lacks ${BASE}/: ${raw}`);
      abs = `${ORIGIN}${raw}`;
    } else if (raw.startsWith(`${ORIGIN}/`)) {
      abs = raw;
    } else {
      continue;
    }
    if (abs.includes(`/zh${BASE}`)) die(`href on ${path} has /zh${BASE}: ${raw}`);
    targets.add(abs.replace(/#.*$/, ''));
  }
}

const lang = (html) =>
  hrefs((html.match(/<nav class="lang-switch"[\s\S]*?<\/nav>/) || [''])[0]);
const expectLang = {
  '/tools/json-formatter/': [`${BASE}/tools/json-formatter/`, `${BASE}/zh/tools/json-formatter/`],
  '/this-path-is-not-a-tool/': [`${BASE}/`, `${BASE}/zh/`],
};
for (const [path, want] of Object.entries(expectLang)) {
  const got = lang(pages[path]);
  if (got.join('|') !== want.join('|')) die(`LangSwitch on ${path}: ${got.join(', ')}`);
}
if (pages['/this-path-is-not-a-tool/'].includes('/zh/404/')) die('404 body links /zh/404/');
if (!pages['/this-path-is-not-a-tool/'].includes('<meta name="robots" content="noindex"')) die('404 lost noindex');
if (/<link\b[^>]*rel="canonical"/.test(pages['/this-path-is-not-a-tool/'])) die('404 still has a canonical');
if (/<link\b[^>]*rel="alternate"/.test(pages['/this-path-is-not-a-tool/'])) die('404 has alternates');
for (const path of ['/', '/zh/', '/tools/json-formatter/']) {
  const canon = pages[path].match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]*)"/)?.[1];
  if (canon !== `${PREFIX}${path}`) die(`canonical on ${path} is ${canon}, want ${PREFIX}${path}`);
}

targets.add(`${PREFIX}/robots.txt`);
targets.add(`${PREFIX}/sitemap-index.xml`);
if (targets.size < 20) die(`only ${targets.size} internal URLs extracted`);

for (const url of targets) await checkUrl(url);

const robots = await get(`${PREFIX}/robots.txt`);
if (robots.status !== 200) die('robots.txt not 200');
if (!robots.body.includes(`Sitemap: ${PREFIX}/sitemap-index.xml`)) die('live robots Sitemap line wrong');

console.log(`PASS live: ${targets.size} internal URLs returned 200 (or one 301 to slashed form then 200)`);
