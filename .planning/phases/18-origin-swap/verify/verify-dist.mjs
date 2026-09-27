// Phase 18 local gate. Usage: node verify-dist.mjs <tracer|links|origin|all>
// Run from the repo root after `npm run build`. Exits 1 on any failure.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const BASE = '/toolsforfree';
const ORIGIN = 'https://danbeng.github.io';
const PREFIX = `${ORIGIN}${BASE}`;
const DIST = 'dist';
const scope = process.argv[2] ?? 'all';
const failures = [];
const fail = (m) => failures.push(m);

if (!['tracer', 'links', 'origin', 'all'].includes(scope)) {
  console.error(`unknown scope ${scope}`);
  process.exit(2);
}
if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/index.html missing - run npm run build first');
  process.exit(1);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const read = (p) => readFileSync(p, 'utf8');
const rel = (p) => relative(DIST, p).split(sep).join('/');
const attrs = (html, name) =>
  [...html.matchAll(new RegExp(`\\s${name}="([^"]*)"`, 'g'))].map((m) => m[1]);

function resolvesInDist(url) {
  const clean = url.replace(/[?#].*$/, '');
  if (clean !== BASE && !clean.startsWith(`${BASE}/`)) return false;
  const logical = clean.slice(BASE.length) || '/';
  const target = join(DIST, ...logical.split('/').filter(Boolean));
  if (logical.endsWith('/')) return existsSync(join(target, 'index.html'));
  return existsSync(target) && statSync(target).isFile();
}

function checkTracer() {
  const pages = {
    'index.html': { en: `${BASE}/`, zh: `${BASE}/zh/`, logo: `${BASE}/`, nav: '' },
    'zh/index.html': { en: `${BASE}/`, zh: `${BASE}/zh/`, logo: `${BASE}/zh/`, nav: '/zh' },
    'tools/json-formatter/index.html': {
      en: `${BASE}/tools/json-formatter/`,
      zh: `${BASE}/zh/tools/json-formatter/`,
      logo: `${BASE}/`,
      nav: '',
    },
    'zh/tools/json-formatter/index.html': {
      en: `${BASE}/tools/json-formatter/`,
      zh: `${BASE}/zh/tools/json-formatter/`,
      logo: `${BASE}/zh/`,
      nav: '/zh',
    },
  };
  for (const [file, want] of Object.entries(pages)) {
    const p = join(DIST, file);
    if (!existsSync(p)) {
      fail(`tracer: missing ${file}`);
      continue;
    }
    const html = read(p);
    const header = (html.match(/<header class="site">[\s\S]*?<\/header>/) || [''])[0];
    if (!header) fail(`tracer: no header in ${file}`);
    const logo = (header.match(/class="logo" href="([^"]*)"/) || [])[1];
    if (logo !== want.logo) fail(`tracer: ${file} logo ${logo} != ${want.logo}`);
    for (const seg of ['tools', 'blog', 'about']) {
      const href = `${BASE}${want.nav}/${seg}/`;
      if (!header.includes(`href="${href}"`)) fail(`tracer: ${file} nav missing ${href}`);
    }
    const lang = (header.match(/<nav class="lang-switch"[\s\S]*?<\/nav>/) || [''])[0];
    const langHrefs = attrs(lang, 'href');
    if (langHrefs.join('|') !== `${want.en}|${want.zh}`) {
      fail(`tracer: ${file} LangSwitch ${langHrefs.join(', ')} != ${want.en}, ${want.zh}`);
    }
    for (const h of attrs(header, 'href')) {
      if (h.startsWith('/') && !resolvesInDist(h)) fail(`tracer: ${file} header href not in dist ${h}`);
    }
  }
  const notFound = read(join(DIST, '404.html'));
  const lang404 = attrs((notFound.match(/<nav class="lang-switch"[\s\S]*?<\/nav>/) || [''])[0], 'href');
  if (lang404.join('|') !== `${BASE}/|${BASE}/zh/`) fail(`tracer: 404 LangSwitch ${lang404.join(', ')}`);
}

function checkLinks() {
  let count = 0;
  for (const f of htmlFiles) {
    const html = read(f);
    for (const [name, list] of [['href', attrs(html, 'href')], ['src', attrs(html, 'src')]]) {
      for (const v of list) {
        if (v.startsWith(`${BASE}/zh${BASE}`) || v.includes(`/zh${BASE}`)) fail(`links: ${rel(f)} ${name} has /zh${BASE}: ${v}`);
        if (v.includes(`${BASE}${BASE}`)) fail(`links: ${rel(f)} ${name} doubles base: ${v}`);
        if (v.startsWith('//')) fail(`links: ${rel(f)} ${name} protocol-relative: ${v}`);
        if (!v.startsWith('/') || v.startsWith('//')) continue;
        count += 1;
        if (v !== BASE && !v.startsWith(`${BASE}/`)) fail(`links: ${rel(f)} ${name}="${v}" lacks ${BASE}/`);
        else if (!resolvesInDist(v)) fail(`links: ${rel(f)} ${name}="${v}" does not exist in dist`);
      }
    }
  }
  for (const f of files.filter((x) => /\.(html|xml|txt)$/.test(x))) {
    if (read(f).includes(`/zh${BASE}`)) fail(`links: ${rel(f)} contains /zh${BASE}`);
  }
  if (count < 50) fail(`links: only ${count} root-relative URLs checked; expected a full site`);
}

function checkSource() {
  const srcFiles = walk('src').filter((f) => /\.(astro|tsx)$/.test(f));
  const bad = [
    [/href="\//, 'literal root-relative href'],
    [/href=\{\s*[`'"]\//, 'root-relative href expression'],
    [/href=\{\s*`\$\{\s*(localizedPath|switchLocalePath)\(/, 'unwrapped localized template href'],
    [/href=\{\s*(localizedPath|switchLocalePath)\(/, 'unwrapped localized href'],
  ];
  for (const f of srcFiles) {
    const text = read(f);
    for (const [re, label] of bad) {
      if (re.test(text)) fail(`source: ${f.split(sep).join('/')} has ${label}`);
    }
  }
}

function linkTag(html, rel, hreflang) {
  const tags = [...html.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]);
  return tags
    .filter((t) => t.includes(`rel="${rel}"`) && (!hreflang || t.includes(`hreflang="${hreflang}"`)))
    .map((t) => (t.match(/href="([^"]*)"/) || [])[1]);
}

function checkOrigin() {
  const site = read('src/data/site.ts');
  if (!site.includes(`SITE_ORIGIN = '${ORIGIN}'`)) fail('origin: SITE_ORIGIN is not exactly the github.io origin');
  if (!site.includes(`CONTACT_EMAIL = 'hello@example.com'`)) fail('origin: CONTACT_EMAIL changed (D-02 / ORIG-03)');
  const cfg = read('astro.config.mjs');
  if (!cfg.includes(`site: '${ORIGIN}'`)) fail('origin: astro site is not exactly the github.io origin');
  if (!cfg.includes(`base: '${BASE}'`)) fail('origin: base changed');
  if (!cfg.includes(`trailingSlash: 'always'`)) fail('origin: trailingSlash changed');

  const sitemaps = files.filter((f) => /sitemap[^/\\]*\.xml$/.test(f));
  if (sitemaps.length < 2) fail('origin: expected sitemap-index.xml and at least one sitemap-N.xml');
  let locCount = 0;
  for (const f of sitemaps) {
    const xml = read(f);
    if (xml.includes('example.com')) fail(`origin: ${rel(f)} contains example.com`);
    for (const m of xml.matchAll(/<loc>([^<]*)<\/loc>/g)) {
      locCount += 1;
      if (!m[1].startsWith(`${PREFIX}/`)) fail(`origin: ${rel(f)} loc ${m[1]}`);
    }
    for (const m of xml.matchAll(/<xhtml:link[^>]*href="([^"]*)"/g)) {
      if (!m[1].startsWith(`${PREFIX}/`)) fail(`origin: ${rel(f)} xhtml:link ${m[1]}`);
    }
  }
  if (locCount < 10) fail(`origin: only ${locCount} sitemap loc entries`);

  const robots = read(join(DIST, 'robots.txt'));
  if (robots.includes('example.com')) fail('origin: robots.txt contains example.com');
  if (!robots.includes(`Sitemap: ${PREFIX}/sitemap-index.xml`)) fail('origin: robots Sitemap line lacks site+base');

  for (const f of htmlFiles) {
    const html = read(f);
    const r = rel(f);
    const canon = linkTag(html, 'canonical');
    if (canon.length !== 1) {
      fail(`origin: ${r} has ${canon.length} canonical tags`);
      continue;
    }
    if (html.match(/<link\b[^>]*example\.com[^>]*>/)) fail(`origin: ${r} link tag contains example.com`);
    if (r === '404.html') {
      if (canon[0] !== `${PREFIX}/404/`) fail(`origin: 404 canonical ${canon[0]}`);
      if (!html.includes('<meta name="robots" content="noindex"')) fail('origin: 404 lost noindex');
      if (linkTag(html, 'alternate').length) fail('origin: 404 has alternates');
      continue;
    }
    if (!r.endsWith('index.html')) continue;
    const logical = `/${r.slice(0, -'index.html'.length)}`;
    const en = logical === '/zh/' ? '/' : logical.startsWith('/zh/') ? logical.slice(3) : logical;
    const zh = en === '/' ? '/zh/' : `/zh${en}`;
    if (canon[0] !== `${PREFIX}${logical}`) fail(`origin: ${r} canonical ${canon[0]} != ${PREFIX}${logical}`);
    const want = { en: `${PREFIX}${en}`, 'zh-Hans': `${PREFIX}${zh}`, 'x-default': `${PREFIX}${en}` };
    for (const [lang, href] of Object.entries(want)) {
      const got = linkTag(html, 'alternate', lang);
      if (got.length !== 1 || got[0] !== href) fail(`origin: ${r} alternate ${lang} ${got.join(',')} != ${href}`);
    }
  }
}

if (scope === 'tracer' || scope === 'all') checkTracer();
if (scope === 'links' || scope === 'all') {
  checkSource();
  checkLinks();
}
if (scope === 'origin' || scope === 'all') checkOrigin();

if (failures.length) {
  console.error(failures.slice(0, 40).join('\n'));
  if (failures.length > 40) console.error(`... and ${failures.length - 40} more`);
  console.error(`FAIL ${scope}: ${failures.length} problem(s)`);
  process.exit(1);
}
console.log(`PASS ${scope}: ${htmlFiles.length} HTML files`);
