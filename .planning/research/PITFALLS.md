# Pitfalls Research

**Domain:** First publish of an already-built Astro 7 static bilingual catalog (GitHub remote + Actions, real origin, custom domain, `trailingSlash: 'always'`)
**Researched:** 2026-09-23
**Confidence:** MEDIUM

This milestone adds a remote, a real origin, and a host on top of a site that already builds. The failures below are the ones that rewrite history, ship `https://example.com` canonicals, or make every slashed URL 404 or loop. They are not generic "remember to test" items.

Suggested phase names below are research recommendations for the v1.3 roadmap. They are not committed phase numbers. Map them when the roadmap is written:

| Recommendation | Owns |
|----------------|------|
| Remote + tag push | Create the remote the user names. Push `main` and the existing local tag `v1.2`. Path-limited add only. |
| Origin swap | Replace `SITE_ORIGIN`, `astro.config.mjs` `site`, and `CONTACT_EMAIL` together, then rebuild. |
| Host + DNS | Pick one static host. Attach the custom domain. Do not fight `trailingSlash: 'always'`. |
| 404 wiring | Stop advertising `/zh/404/` (Phase 12 WR-02). |
| ToolCard guard | Stop the unchecked `copy.tools[slug]` throw (Phase 12 WR-01). |

## Critical Pitfalls

### Pitfall 1: Path-limited add is abandoned the moment a remote exists

**What goes wrong:**
The first `git add` that is not path-limited stages the dirty working tree and the first push publishes it. That tree currently includes unrelated `src/lib/crontab.ts` and must not include LED `ToolShell` / `tool-panel__chrome`. `stash@{0}` (`gsd-phase7-overlay-chrome-temp`) and `stash@{1}` (`pre-02-01-merge unrelated i18n`) are still local. `git add -A`, `git commit -a`, or `git stash pop` before the remote commit puts fenced chrome and a crontab rewrite on `main`. Once that commit is on GitHub it is public history. Fixing it means another commit or a history rewrite. A rewrite of a tag that was already pushed is worse (Pitfall 3).

**Why it happens:**
v1.2 treated "no remote" as the fence. v1.3 removes that fence. The reflex is to clean the tree so the first push looks tidy, or to use `git add -A` because "we are shipping now." The dirty files are not part of Ship. They were left dirty on purpose.

**How to avoid:**
- Before any remote command, record `git status --short` and refuse to continue if `src/lib/crontab.ts` or `src/components/ToolShell.tsx` is staged.
- Stage only the files the phase names. Never `git add -A`, `git add .`, or `git commit -a`.
- Do not `git stash pop`, `git stash apply`, or `git checkout stash@{0} -- .`.
- Do not "clean up" `crontab.ts` so the remote matches the laptop. CI checks out the commit, not the dirty tree. Phase 14 already proved `npm test` and `astro build` with crontab unstaged.
- Creating the remote is allowed in v1.3. The owner/account is a user decision. Do not invent a GitHub login, org, or repo name. Do not run `gh repo create` until the user names the account and the repo visibility.

**Warning signs:**
- `git status` shows `src/lib/crontab.ts` or `ToolShell.tsx` under "Changes to be committed"
- A commit message mentions cron, LED, or chrome during a remote-only phase
- `git stash list` no longer shows `stash@{0}` / `stash@{1}` with those messages
- `gh repo create` is run with a guessed `--org` or a public repo the user did not name

**Phase to address:**
Remote + tag push. Re-check the same fence in every later phase that commits. Origin swap and 404/ToolCard fixes must also path-limit.

---

### Pitfall 2: First push sends secrets, or widens `GITHUB_TOKEN` so CI can push

**What goes wrong:**
Two different failures get lumped together as "CI secrets."

1. A real credential is committed or pasted into the workflow. This repo has no `.env` today. The dangerous add is a deploy token, a Cloudflare API token, or a GitHub PAT written into `.github/workflows/ci.yml` or `astro.config.mjs` so the first green run can also publish. That secret is in git history even after a follow-up delete. Fork `pull_request` runs do not receive Actions secrets, but a secret committed in the file is just text.

2. The existing workflow is "fixed" by deleting `permissions: contents: read` or by setting `contents: write` / `pages: write` / `id-token: write` on the same job that runs `npm test`. New personal-account repositories default `GITHUB_TOKEN` to read for `contents` and `packages`. The workflow file already narrows that to `contents: read`, which is enough for `actions/checkout@v4`. Write scope on the CI job lets a later step push to `main` or retag. Pushes made with `GITHUB_TOKEN` do not start a new `push` workflow, so a token-push that rewrites `main` can land without the CI job the team thinks is guarding it. `contents: write` does not bypass branch or tag rulesets, but this repo has no ruleset until someone adds one. There is nothing to bypass.

A missing secret is the empty string, not a hard error. A deploy step that "succeeds" with an empty token is not a deploy.

**Why it happens:**
The milestone goal is "a push to main actually runs tests and the build." That is already what `.github/workflows/ci.yml` does once a remote exists. Deploy is a different job. People merge them because both happen "on push."

**How to avoid:**
- Keep `.github/workflows/ci.yml` as the test job: `permissions: contents: read`, Node 22, `npm ci`, `npm test`, `npm run build`. Do not add a deploy step to that file.
- If a later phase adds a deploy workflow, put write scopes only on that job (`pages: write` and `id-token: write` are for `actions/deploy-pages`, not for tests). Store tokens as repository secrets, never in YAML.
- Do not create a PAT to push the first commit. `git push` uses the user's own credentials. The workflow does not need a secret to run `npm ci`.
- After the first push, open the Actions run and confirm the job is the existing three steps. Confirm the log does not print `secrets.` values. GitHub masks secrets, but a token echoed before it is stored is not masked.
- Do not enable "read and write permissions" at the repository level to "make CI work." The file already sets the token. Repository permissive default plus a future write step is how a test job becomes a push job.

**Warning signs:**
- `permissions:` disappears from `ci.yml`, or gains `contents: write`
- A workflow `run:` line contains `ghp_`, `github_pat_`, `cfut_`, or `${{ secrets.` on the test job
- `git log -p` on the first remote commit shows `.env` or a token
- The Actions UI offers "Workflow permissions: Read and write" and someone flips it because the first run failed for an unrelated reason (Node, lockfile, dirty file)

**Phase to address:**
Remote + tag push. Revisit only if a separate deploy workflow is added in Host + DNS. Do not widen the test workflow there either.

---

### Pitfall 3: Tag `v1.2` is recreated, force-pushed, or pushed as if it were a branch

**What goes wrong:**
Local tag `v1.2` already points at the v1.2 commit. The milestone says push that tag, not recreate it with a different message. `git tag -f v1.2`, `git tag -d v1.2 && git tag v1.2`, or an annotated tag with a new message moves the ref. Pushing the moved tag requires `--force` (or a delete-and-push). That rewrites the only published release pointer. A later `git push --force origin main` to "match the tag" rewrites branch history the same way.

`git push origin v1.2` pushes the tag. `git push origin main` does not push tags. `git push --tags` pushes every local tag, including any accidental tag. `git push --follow-tags` still will not push a lightweight tag unless it is reachable from the commit being pushed and annotated, depending on Git's follow-tags rules. The safe command is an explicit refspec after `git rev-parse v1.2` matches the intended commit: `git push origin refs/tags/v1.2`.

CI does not run on a tag push. `.github/workflows/ci.yml` triggers on `push` to `main`, `pull_request` to `main`, and `workflow_dispatch`. A tag-only push leaves Actions idle. That is expected. It is not a failed release. `workflow_dispatch` does not appear in the UI until the workflow file is on the default branch, so the button is missing until `main` itself has been pushed.

**Why it happens:**
"Ship v1.2" sounds like "cut a release." The release already exists locally. People also force-push `main` when the first push is rejected because the remote was created with a README, license, or `.gitignore` commit.

**How to avoid:**
- Record `git rev-parse v1.2` and `git log -1 --format=%H v1.2` before any tag command. After push, `git ls-remote origin refs/tags/v1.2` must equal that SHA. If it does not, stop. Do not retag.
- Never `git tag -f`, `git push --force`, `git push --force-with-lease`, or `git push --delete origin v1.2` in this milestone.
- Create the remote empty: no README, no license, no `.gitignore` commit. If the remote already has a commit, do not force-push over it. Add the remote only after the user confirms the repo is empty (`git ls-remote` shows no `refs/heads/main`).
- Push `main` first (`git push -u origin main`), confirm the Actions run started, then push the tag ref explicitly. Do not use `--tags`.
- Do not change the tag message to match a rewritten Phase 14 hash note. The audit already records that Phase 14 SUMMARY cites `05a3efa` while history has `77bf9b0`. That is info only. Do not "fix" it by moving the tag.

**Warning signs:**
- `git status` or `git log` shows the tag SHA changed during the session
- The push command includes `--force` or `--tags`
- `gh repo create` was passed `--push` (it pushes the current branch and can also push into a non-empty repo)
- Actions never starts after a tag push, and someone retags onto `main` to "trigger CI"

**Phase to address:**
Remote + tag push. No later phase should move `v1.2`.

---

### Pitfall 4: `https://example.com` ships in canonicals, sitemap, and robots

**What goes wrong:**
`astro.config.mjs` sets `site: 'https://example.com'`. `src/data/site.ts` sets `SITE_ORIGIN` to the same string and `CONTACT_EMAIL` to `hello@example.com`. `BaseLayout.astro` builds canonical and hreflang with `new URL(switchLocalePath(path, locale), SITE_ORIGIN)`, not `Astro.site`. `robots.txt.ts` uses the Astro `site` argument for `Sitemap:`. `@astrojs/sitemap` also uses `site`, and it will not emit a useful sitemap if `site` is missing, but a present placeholder is worse than missing: the build succeeds and every URL is wrong.

A host can serve the HTML on the real domain while every canonical, hreflang, and sitemap entry still says `example.com`. Search Console then indexes the placeholder host, or refuses the sitemap because the URLs are not on the property. IANA owns `example.com`. Those URLs are not this site. Replacing the string in one file and not the other splits canonicals from the sitemap.

`trailingSlash: 'always'` does not fix this. Sitemap URLs are absolute and will include the slash only if the integration emits them that way. The host still has to be the real origin. A rebuild is required after the swap. Editing the constants and uploading an old `dist/` leaves the placeholder in the deployed HTML.

**Why it happens:**
The site "works" locally with the placeholder because relative links do not need `site`. Canonical and sitemap failures are invisible in the browser chrome. v1.2 explicitly froze `SITE_ORIGIN`. The first person to deploy may upload `dist/` before the user has named a domain, just to see a URL.

**How to avoid:**
- Do not deploy until the user names the real origin. Do not guess a domain from the repo name.
- Change `astro.config.mjs` `site` and `SITE_ORIGIN` to the same absolute `https://` origin in one commit. Include the scheme. No path. No trailing slash on the origin (`https://tools.example` not `https://tools.example/`).
- Decide apex vs `www` before this commit (Pitfall 6). The string baked into canonicals must be the hostname that the host redirects toward, not the hostname that redirects away.
- Replace `CONTACT_EMAIL` in the same commit if the user has a mailbox. About/privacy copy reads it. Leaving `hello@example.com` on a live domain is a second placeholder, not a separate milestone.
- Grep the built `dist/` for `example.com` and fail the phase if any hit remains. Check `dist/sitemap-index.xml`, `dist/sitemap-0.xml`, `dist/robots.txt`, and a ZH page's canonical.
- Rebuild after the swap. Do not rsync a pre-swap `dist/`.

**Warning signs:**
- View source on the deployed home page shows `rel="canonical"` containing `example.com`
- `dist/robots.txt` contains `Sitemap: https://example.com/sitemap-index.xml`
- `rg example.com dist` matches after the "origin done" commit
- `SITE_ORIGIN` and `site` differ by `www`, scheme, or a trailing slash

**Phase to address:**
Origin swap. Must complete before Host + DNS publishes HTML. Do not combine it with the remote-creation commit if the user has not named the domain yet. An empty remote with `example.com` still in source is acceptable. A public host with `example.com` canonicals is not.

---

### Pitfall 5: Trailing-slash redirect loop, or every directory URL 404s

**What goes wrong:**
`trailingSlash: 'always'` is set. Default `build.format` is `'directory'`, so `astro build` emits `dist/tools/index.html`, `dist/zh/index.html`, and so on. Astro's own slash redirect applies to on-demand rendering in production. This site is static. The docs say prerendered trailing-slash behavior is handled by the hosting platform and may not respect the setting, and that Astro redirects cannot cover that case.

The host then disagrees with the files:

- **Netlify** Pretty URLs (on by default) forwards `/about` to `/about/` and rewrites `/about.html` to `/about/`. That matches this build. A hand-written `_redirects` or `netlify.toml` rule that tries to add or remove the slash does not. Netlify matches redirect paths with or without the slash, and the docs say a rule like `/blog/remove-my-slashes/ /blog/remove-my-slashes 301!` causes an infinite redirect because the paths are effectively the same. `trailingSlash: 'always'` plus a "force no slash" rule loops every page.
- **Cloudflare Pages** serves `/about/index.html` by redirecting `/about/index.html` to `/about/` (slash kept) and redirects `/contact.html` to `/contact` (slash removed). Directory routes can survive. A `_redirects` line that strips the slash from `/zh/` or `/tools/` fights the directory canonical. Pages docs say redirects are always followed even if an asset matches the request, so a bad rule wins over the file that exists.
- **GitHub Pages** is not a documented slash host. Official Pages docs say the entry file is `index.html` and a root `404.html` is shown for missing pages. They do not document trailing-slash redirects, and the behavior is not configurable. Independent comparisons (not GitHub docs, LOW confidence) report that `/resource/` is served when `resource/index.html` exists, and that `/resource/` 404s when only `resource.html` exists. This build is `directory` format, so slashed tool URLs may work. Verify with `curl -sI` on the `*.github.io` URL before calling Pages compatible. Do not add a slash rule. A project-site `base` (`https://user.github.io/repo/`) is a separate trap: this config has no `base`. Astro's GitHub guide says internal links must be prefixed when `base` is set, and says to omit `base` for a custom domain. Do not add `base: '/devtoolbox'` to make Pages work. A user site or a custom domain matches the current unprefixed paths.

LangSwitch and `localizedPath` always emit a trailing slash. If the host 301s that slash off, then the next request 301s it back on, the browser shows `ERR_TOO_MANY_REDIRECTS` on `/`, `/zh/`, and `/tools/<slug>/`. If the host returns 404 for slash URLs and only serves `/tools/index.html` when the slash is absent, every header link 404s. Either failure looks like "the deploy is broken" when the build was fine.

**Why it happens:**
People copy a host's "clean URLs" snippet without reading whether it adds or removes the slash. Astro dev warns on slash mismatch. The production host does not use Astro's dev warning page. It redirects or 404s.

**How to avoid:**
- Do not add a slash-forcing redirect. Let the host's directory index behavior serve `.../index.html` for the slashed path.
- On Netlify, leave Pretty URLs enabled. Do not add a trailing-slash rule. Publish `dist`. Build command `npm run build`. Set Node to 22 (Pitfall 8). Confirm with `curl -sI https://<host>/tools/` that the status is 200, and `curl -sI https://<host>/tools` is a single redirect to the slashed URL, not a chain.
- On Cloudflare Pages, do not add a `_redirects` rule for trailing slashes. Confirm `/zh/` and `/zh` do not bounce more than once. Do not put a Cache Everything page rule on the custom domain. Pages docs note that cached custom-domain responses can skip redirects.
- On GitHub Pages, deploy as a user site or custom domain, not a project site. Do not set `base`. After the first Pages deploy, `curl -sI` the slashed URLs on `*.github.io` before attaching DNS. If `/tools/json-formatter/` is 404 while the unslashed URL works, Pages is the wrong host for `trailingSlash: 'always'`. Switch host. Do not flip `trailingSlash` to `never` to paper over it. Official docs do not promise that `404.html` keeps the request URL. Confirm a missing path still shows this site's 404 (Pitfall 9).
- Verify both locales: `/`, `/zh/`, `/tools/json-formatter/`, `/zh/tools/json-formatter/`. A loop on `/zh/` only is still a loop.

**Warning signs:**
- Browser shows "too many redirects" on the home page
- `curl -sI` on `/tools/` returns 301 to `/tools` and `/tools` returns 301 to `/tools/`
- A new `public/_redirects`, `netlify.toml` redirect, or `_routes.json` appears in the origin-swap commit
- Only unslashed URLs work, and the header links (which are slashed) 404

**Phase to address:**
Host + DNS. The config side is already correct. Do not "fix" `trailingSlash` in Origin swap to match a host that strips slashes. Change the host, not the site.

---

### Pitfall 6: Apex and `www` both answer, or canonicals point at the one that redirects

**What goes wrong:**
The user says "the domain is example.dev" and the phase sets `site` to `https://example.dev` while DNS also answers `www.example.dev`, or the reverse. Hosts then redirect one to the other. Canonicals point at the hostname that 301s. Google indexes the redirect target and reports canonical conflicts. HTTPS certificate issuance stalls because extra A/CNAME records are present.

Host-specific traps:

- **GitHub Pages:** Add the custom domain in the repository **before** changing DNS. The docs warn that configuring DNS first lets someone else host a site on a subdomain. Apex needs all four A records (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) or one ALIAS/ANAME to `<user>.github.io`. `www` is a CNAME to `<user>.github.io`, not to the repository name, and not to `*.pages.github.io`. Setting up `www` alongside the apex is recommended. Pages redirects one to the other based on the hostname saved in settings. Docs conflict on the CNAME file: Pages settings say an Actions source ignores any CNAME file and does not create one. Astro's GitHub deploy guide still says to add a one-line `public/CNAME`, and the sample on that same step sets `base: '/my-repo'` next to the sentence that says to omit `base` for a custom domain. Do not copy that sample. For an Actions deploy, set the domain in repository settings and do not commit `public/CNAME` unless the user chose branch publishing. Extra A or CNAME records block the certificate. Enforce HTTPS can stay unavailable for up to 24 hours. Wildcard DNS (`*.example.dev`) is a takeover risk even after verification.
- **Netlify:** Adding apex or `www` adds both, and the non-primary redirects to the primary. With external DNS, Netlify recommends `www` (or another subdomain) as primary because apex cannot be a normal CNAME. Apex external DNS needs ALIAS/ANAME/flattened CNAME to `apex-loadbalancer.netlify.com`, or A to `75.2.60.5`. `www` is a CNAME to the `*.netlify.app` hostname. Pointing `www` at the apex with a CNAME-to-apex plus a host redirect the other way loops.
- **Cloudflare Pages:** Apex custom domain requires the zone on the same Cloudflare account (CNAME flattening). `www` can be an external CNAME to `<site>.pages.dev`. A Bulk Redirect from `www` to apex needs a proxied dummy A record (`192.0.2.1` in Cloudflare's www-redirect guide) or the redirect never runs. A redirect in the opposite direction from the Pages custom-domain setting loops.

**Why it happens:**
"Add both records so either URL works" is normal DNS advice. It is correct only if exactly one hostname is canonical and the other redirects once, and `site` / `SITE_ORIGIN` match the canonical hostname. Two 200s, or a redirect that disagrees with canonical, is the bug.

**How to avoid:**
- Ask the user which hostname is canonical before editing `site`. Write that exact origin into both `site` and `SITE_ORIGIN`.
- Attach that hostname as the primary custom domain. Add the other hostname only as a redirect to the primary, one hop, HTTPS, path preserved (`/zh/tools/json-formatter/` stays that path).
- Add the domain on the host before publishing DNS records that point at the host (GitHub's takeover warning).
- Do not copy A records from a blog post without checking the host's current docs. GitHub's four A records are not Netlify's A record.
- After DNS, `curl -sI https://www.<domain>/zh/` and `curl -sI https://<domain>/zh/` must show one 200 and at most one 301/308, and the 200 URL must equal `site`.

**Warning signs:**
- Both hostnames return 200 with different certificates or different `rel="canonical"`
- `site` uses `www` and the host primary is apex, or the reverse
- Certificate stays "pending" and the phase adds more A records to "help"
- `public/CNAME` is committed because Astro's sample says so, while Pages settings has a different hostname. `base` is set from the same sample's `base: '/my-repo'` on a custom-domain deploy

**Phase to address:**
Host + DNS, after Origin swap has the user-named hostname. Do not invent the hostname in the remote phase.

---

### Pitfall 7: DNS propagation is treated as a broken site, then "fixed" with a force-push

**What goes wrong:**
GitHub's custom-domain docs say DNS changes can take up to 24 hours to propagate. Enforce HTTPS can stay unchecked for up to a day. During that window the domain NXDOMAIN, hits the old host, or serves a certificate error, while `https://<project>.netlify.app` or `*.pages.dev` already serves the new `dist/`. The reflex is to change nameservers again, add a second A record, flip the canonical, or force-push `main` to "redeploy." A second A record to a different host is how the www/apex loop in Pitfall 6 starts. A force-push does not make DNS faster.

The opposite mistake is declaring the domain live because the `*.pages.dev` URL works, then submitting `example.com` to Search Console while the custom hostname still does not resolve. Sitemap fetch fails. That is not an Astro bug.

**Why it happens:**
The milestone success criterion is "a visitor opens a real domain." A pending certificate looks like a failed phase. CI being green does not move DNS.

**How to avoid:**
- Prove the deploy on the host's default hostname first (`*.github.io`, `*.pages.dev`, `*.netlify.app`). Check slashed EN and ZH URLs there before touching DNS.
- Then add the custom domain. Wait. Use `dig` / `nslookup` from more than one resolver. Do not change records because one resolver is stale.
- Do not submit the sitemap to Search Console until `curl -sI https://<canonical>/sitemap-index.xml` returns 200 and the file does not contain `example.com`.
- A TLS warning during the first hours is a certificate delay if the HTTP host default URL is already correct. It is a real misconfiguration if the default URL is also wrong.

**Warning signs:**
- Phase notes say "site is broken" while only the custom hostname fails and the platform URL works
- DNS records were edited more than once in the same hour
- `git push --force` appears in the host-phase transcript
- Search Console property was created before the first successful HTTPS response

**Phase to address:**
Host + DNS. Verification is a timed check, not a code change.

---

### Pitfall 8: CI is "fixed" back to Node 20, or the host builds on Node 20

**What goes wrong:**
Astro 7.3.2 `engines.node` is `>=22.12.0`. The checked-in workflow already pins `node-version: 22`. A host that defaults to Node 20 fails `astro build` before pages are emitted. The log says Node is unsupported. The local `npm run build` still passes, so it looks like a host bug.

The reverse edit is also a trap. Phase 14 research once said to keep Node 20 in the workflow because a locked decision said 20. The user override on 2026-09-22 moved the pin to 22. The file on disk is 22. Changing it back to 20 makes the first remote Actions run fail on every push. "Fixing" that by skipping `npm run build` in CI ships an unbuilt site.

Netlify's Astro guide says legacy Xenial images need an explicit Node version, and Astro requires `v22.12.0` or higher, via `.nvmrc` or `NODE_VERSION`. This repo has no `.nvmrc`. A host that does not read `package.json` `engines` will pick its default.

**Why it happens:**
Older milestone text and the current workflow disagree if someone reads Phase 14 research and not `ci.yml`. Host UIs hide the Node version behind "build image."

**How to avoid:**
- Leave `ci.yml` on Node 22. Do not add a second workflow that uses 20.
- On the host, set Node 22 before the first production build. On Netlify, set `NODE_VERSION=22` or add `.nvmrc` containing `22` in the host phase if that host needs it. Do not add `.nvmrc` as a drive-by in the remote phase unless the chosen host requires it.
- The first green Actions run on the remote is the proof that CI works. A green local build is not a substitute. A red run whose first line is the Astro engines error is a Node pin, not a reason to delete the build step.

**Warning signs:**
- `ci.yml` `node-version` is `20` or `lts/*`
- Host build log: `Node.js v20.x is not supported by Astro`
- Someone sets `engines` override or `--ignore-engines` to force Node 20

**Phase to address:**
Remote + tag push must not touch the pin. Host + DNS must set the host's Node to 22.

---

### Pitfall 9: 404 LangSwitch advertises `/zh/404/`, and the host's 404 file makes it worse

**What goes wrong:**
`src/pages/404.astro` passes `path="/404/"` into `BaseLayout`. At build time `Astro.url.pathname` is `/404/`, so `LangSwitch` (which uses `Astro.url.pathname`, not the `path` prop) writes `href="/zh/404/"`. `BaseLayout` writes `hreflang="zh-Hans"` to `https://<origin>/zh/404/`. There is no `src/pages/zh/404.astro`. Astro emits one `dist/404.html`.

On a static host, unknown paths are supposed to serve that single `404.html`. Clicking 中文 requests `/zh/404/`, which is also unknown, so the host serves `404.html` again. The switch looks dead. The hreflang trio tells Google the Chinese equivalent exists. Phase 12 review called this WR-02 and did not fail the milestone. Shipping makes the bad URL public.

Host-specific extras:

- GitHub Pages and Netlify both serve `404.html` for unknown paths. That is correct for a missing tool URL. It does not create `/zh/404/` as a real route.
- Cloudflare Pages also uses `404.html`. A `_redirects` rule of `/zh/* /zh/404/ 200` would advertise the missing route even harder. Do not add one.
- Some hosts redirect `/404.html` to `/404` or `/404/`. With `trailingSlash: 'always'`, `/404/` should be the file `dist/404.html` via `404/index.html` **and** the special `404.html` at the root. Astro emits `dist/404.html` for `src/pages/404.astro`. Confirm the host actually uses that file for a missing `/zh/no-such-tool/` rather than its own branded 404 that drops the site's LangSwitch. A host-branded 404 is a different bug (no header). A site 404 that links to `/zh/404/` is WR-02.

**Why it happens:**
Every other page passes a logical path and gets a correct alternate. 404 was given the same treatment. The alternate is not a page.

**How to avoid:**
- Do not add `src/pages/zh/404.astro` unless the product decision is a real second 404 route. The locked v1.2 decision was not to. Fix the advertisement instead.
- On the 404 page, stop passing `path="/404/"` into the hreflang builder. Point LangSwitch at `/` (locale home) or omit the hreflang trio and set `noindex` on this document. Phase 12 review already sketched both options. Pick one. Do not leave both the trio and the dead link.
- `LangSwitch` reads `Astro.url.pathname`, so changing only the `path` prop fixes canonical/hreflang and does not fix the switch href. The 404 page needs an explicit switch target, or `LangSwitch` needs an optional override. A prop-only change will look fixed in a canonical test and still link to `/zh/404/`.
- After the fix, `rg 'zh/404' dist` must be empty. Request a missing URL on the host and confirm the 404 response is the site's page and its 中文 link goes to `/zh/`, not `/zh/404/`.

**Warning signs:**
- Built `dist/404.html` contains `hreflang="zh-Hans"` and `/zh/404/`
- Clicking 中文 on a 404 reloads a 404
- A new `src/pages/zh/404.astro` appears only to silence the link, with no entry in the sitemap plan and no decision to maintain a second 404

**Phase to address:**
404 wiring. Do it before Host + DNS so the first public 404 is not the broken one. Independent of the remote phase.

---

### Pitfall 10: ToolCard throws when a slug has no `ui.tools` entry, and the host serves the crash as a 500 or a blank page

**What goes wrong:**
`src/components/ToolCard.astro` does `copy.tools[tool.slug as keyof typeof copy.tools]` and reads `.name` immediately. The `as` cast hides a missing key. `RelatedTools.astro` does the same. Today all 18 slugs exist in `ui.ts`, so production does not throw. The first catalog edit that adds a `TOOLS` entry without both locale labels throws `Cannot read properties of undefined` while rendering the home page, the tools index, or a related-tools list. Astro SSG fails the build if the throw happens at build time. That is the good outcome. A cast that only fails for one locale fails the ZH build and leaves EN green, which looks like a host locale bug.

Phase 12 called this WR-01. Shipping does not make the throw rarer. It makes a future catalog PR a production outage instead of a local one.

**Why it happens:**
v1.2 moved card labels from the registry into `ui.ts` and left the lookup unchecked so EN cards could omit the `locale` prop (`locale = 'en'`). A ZH surface that forgets `locale` does not throw. It silently renders English names and unprefixed `/tools/...` hrefs. That is the quieter half of the same bug.

**How to avoid:**
- Guard the lookup. Missing label should fail the build with `Missing ui.tools[${slug}] for locale ${locale}`, not a property read on `undefined`.
- Apply the same guard in `RelatedTools.astro`.
- Prefer typing `Tool.slug` as `keyof` the UI tools dictionary so a new slug is a compile error.
- Make `locale` required on `ToolCard` if the phase touches it, matching `Footer`. Optional `locale` defaulting to `'en'` will keep shipping English cards on any new ZH page that forgets the prop.
- Do not fix this by committing `crontab.ts` or LED chrome in the same commit.

**Warning signs:**
- A catalog PR adds a slug to `TOOLS` and only updates English `ui.ts`
- ZH home build fails with `shortDescription` of undefined
- A ZH page's card hrefs are `/tools/...` instead of `/zh/tools/...` (missing `locale` prop, no throw)

**Phase to address:**
ToolCard guard. Can land before or after the remote exists. Must not be mixed into the remote-creation commit.

---

### Pitfall 11: Deploy workflow and test workflow share a job, and the first green test run is mistaken for a published site

**What goes wrong:**
`.github/workflows/ci.yml` checks out, installs, tests, and builds. It does not upload `dist/`. A green check on `main` means the code compiles. The public URL is still whatever the host last deployed, or nothing. The reverse mistake is adding `actions/deploy-pages` or `withastro/action` to the test job, then deleting `permissions: contents: read` because deploy fails closed. That reopens Pitfall 2.

Astro's GitHub Pages guide (fetched 2026-09-23) deploys a static site with no adapter, in a separate workflow: `actions/checkout@v7`, `withastro/action@v6`, then `actions/deploy-pages@v5`. Permissions on that file are `contents: read`, `pages: write`, and `id-token: write`. The deploy job needs `environment: github-pages`. Those write scopes belong on the deploy workflow only. Copying them into `ci.yml` makes the test job a publisher. Replacing `ci.yml` with that sample also drops `npm test` and swaps `actions/checkout@v4` for `@v7`.

`withastro/action@v6` defaults `node-version` to 24 and detects the package manager from the lockfile. This repo's Astro is `^7.3.2` with `engines.node` `>=22.12.0`, and `ci.yml` pins Node 22. Leaving the action default on 24 may build, but it is a second Node from the one CI just proved. Pin `node-version: 22` on the action. Do not upgrade CI to 24 to match the action default. The guide's custom-domain sample also sets `base: '/my-repo'` next to prose that says to omit `base` (Pitfall 6). Omit `base`. `package-lock.json` is already committed; the action needs that lockfile so it does not guess a package manager.

Pages settings must use GitHub Actions as the source. Branch publishing ignores the deploy workflow and serves the branch, which is not `dist/`. Netlify and Cloudflare can deploy from the same GitHub repo without a second workflow, but they build on their own Node (Pitfall 8) and their own slash rules (Pitfall 5). Two publishers will fight over the domain.

**Why it happens:**
"Push to main runs the build" was the v1.2 CI goal. v1.3's visitor-facing goal is a real domain. Astro's sample is one workflow that both builds and deploys. Dropping it on top of `ci.yml` feels like following the docs.

**How to avoid:**
- Keep `.github/workflows/ci.yml` as the test workflow: `contents: read` only, checkout v4, Node 22, `npm ci`, `npm test`, `npm run build`. Do not add deploy steps to it.
- If the host is GitHub Pages, add a separate deploy workflow modeled on Astro's guide, with `node-version: 22` passed to `withastro/action@v6`, no `base`, and no `public/CNAME` unless the user chose branch publishing. Pages source must be GitHub Actions.
- If the host is Netlify or Cloudflare, do not also add a Pages deploy workflow. Set publish directory `dist`, build `npm run build`, Node 22.
- Prove the visitor URL only after the host deploy, not after the Actions test check. On Pages, also prove the slashed URLs (Pitfall 5) before attaching the custom domain.

**Warning signs:**
- `ci.yml` gains `withastro/action`, `actions/deploy-pages`, or `pages: write`
- The deploy workflow uses the action's default Node 24, or sets `base: '/<repo>'` for a custom domain
- `public/CNAME` is added because the Astro sample says so, while settings has a different host
- Pages source is still "Deploy from a branch"
- The phase is marked done because the test check is green and no one opened the domain

**Phase to address:**
Host + DNS. Remote + tag push is done when Actions runs the existing test workflow, even if the domain is not attached yet.

---

## Technical Debt Patterns

Shortcuts that look reasonable while shipping and are expensive to undo.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `git add -A` for the first push | One command, clean laptop | Publishes dirty `crontab.ts` and any LED chrome; public history | Never |
| `git stash pop` to "see the real UI" before push | Overlay chrome appears locally | Mixes fenced ToolShell into the ship commit | Never |
| `git push --force` after a non-empty `gh repo create` | Push succeeds | Rewrites `main` or the `v1.2` tag | Never. Create an empty repo instead |
| Delete `permissions: contents: read` | Future deploy steps stop failing | Test job can push to `main` with `GITHUB_TOKEN` | Never |
| Paste a deploy token into the workflow | First deploy is easy | Token is in git history | Never. Repository secret or host-native Git integration |
| Deploy `dist/` before the origin swap | A URL exists today | Canonicals, sitemap, robots, and hreflang say `example.com` | Never for a public host. Preview URLs that no one will index are still a bad habit because the HTML is wrong |
| Change only `SITE_ORIGIN` and not `astro.config.mjs` `site` | Layout canonicals look fixed | Sitemap and `robots.txt` still use `example.com` | Never |
| Add a `_redirects` rule to force or strip trailing slashes | Copy-paste from a host guide | Loop on Netlify; asset-ignoring redirect on Cloudflare | Never while `trailingSlash: 'always'` and `build.format` is `directory` |
| Point apex and `www` at different hosts | "Both URLs work" during DNS experiments | Split brain, certificate failure, redirect loop | Never |
| Retag `v1.2` with a nicer message | Tag annotation matches the audit note | Rewrites the release the milestone said to push as-is | Never |
| Node 20 on the host with `--ignore-engines`, or `withastro/action` left on its Node 24 default | Build starts, or matches the Astro sample | Node 20 is unsupported by Astro 7. Node 24 is a second runtime from the Node 22 CI just proved | Never for Node 20. Pin the Pages action to 22 |
| Add `src/pages/zh/404.astro` only to satisfy the LangSwitch href | Click stops 404ing | Second 404 to maintain, still no product decision, sitemap/hreflang now describe a real empty page | Only if the roadmap explicitly wants a ZH 404. Otherwise fix the link |
| Leave ToolCard unchecked because 18 slugs match today | No code change in Ship | Next catalog slug crashes the build or the page | Acceptable only if ToolCard guard is a named phase that lands before any new slug. Not acceptable as permanent debt |
| Skip `CONTACT_EMAIL` because it is "not the origin" | Smaller diff | About page tells visitors to email `hello@example.com` | Only if the user has no mailbox yet. Do not invent one. Track it beside the origin swap |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GitHub remote | `gh repo create` with a guessed owner, `--push`, or a generated README | User names account, repo, and visibility. Create empty. Push `main`, then `refs/tags/v1.2`. No `--force` |
| GitHub Actions test workflow | Widen token, add secrets, or bump checkout to a major the file does not use | Leave `permissions: contents: read`, `actions/checkout@v4`, `actions/setup-node@v4`, `node-version: 22` |
| GitHub Actions deploy | Paste Astro's sample over `ci.yml`; leave `withastro/action` on Node 24; commit `public/CNAME` and `base: '/repo'` | Separate deploy workflow only if Pages is the host. Write scopes on that file only. Pin `withastro/action@v6` to Node 22. No `base`. Domain in repo settings, not a CNAME file. Pages source = GitHub Actions |
| GitHub Pages DNS | CNAME `www` to `<user>.github.io/<repo>` or to `*.pages.github.io`; DNS before the domain is added in settings | CNAME target is `<user>.github.io` only. Add the domain in the repo first. Apex uses the four A records or ALIAS, not a CNAME |
| Netlify | Slash-stripping redirect; Node 20 default; apex primary on external DNS | Pretty URLs left on. `NODE_VERSION` 22. Prefer `www` as primary if DNS is external. Publish `dist` |
| Cloudflare Pages | `_redirects` that strip `/zh/` slashes; apex added while the zone is on another account; Cache Everything on the hostname | No slash rules. Apex zone must be on the same account. `www` CNAME to `<site>.pages.dev`. Do not cache the HTML host into a redirect skip |
| Search Console | Submit sitemap while `site` is still `example.com`, or before DNS resolves | Submit only after `dist` grep is clean and the canonical host returns 200 for `sitemap-index.xml` |
| Astro `site` vs `SITE_ORIGIN` | Update one | Update both to the same canonical origin. Rebuild. Grep `dist/` |

## Performance Traps

This milestone does not change tool computation. The traps that matter at publish time are host and DNS, not "10k users."

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Two hosts both building on push | Intermittent HTML, mixed certificates, confusing cache | One publisher. Test CI does not deploy | First day, as soon as both are connected |
| Cloudflare cache on the custom domain | Old canonicals or old redirects after the origin swap | No Cache Everything page rule. Purge on deploy if a cache was added by zone default | First hour after origin swap, and again after any redirect edit |
| Netlify atomic deploy vs stale DNS | Some regions serve the platform URL's new site, some serve the old apex target | Do not debug this with code pushes. Check `dig` per resolver | During the 24h propagation window |
| Rebuilding the whole catalog to "flush" a DNS problem | Long builds, extra commits, no DNS change | Prove the platform URL first. Wait on DNS | Every impatient redeploy during propagation |

At this site's size (18 tools, two locales, static files) the HTML is small. Do not add a CDN rule, an image optimizer, or a worker to "make launch faster."

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Deploy token or PAT in the workflow or in `astro.config.mjs` | Anyone who can read the repo can publish or push | Host-native Git integration, or a repository secret on a deploy job only. Never in the test workflow |
| `permissions: contents: write` on the test job | A compromised or mistaken step pushes to `main`. `GITHUB_TOKEN` pushes do not re-trigger CI | Keep `contents: read` on `.github/workflows/ci.yml` |
| Force-push `main` or move tag `v1.2` | Public history no longer matches the audited milestone. Tag consumers see different bytes | Empty remote, explicit `refs/tags/v1.2` push, no `--force` |
| DNS pointed at GitHub before the Pages domain is set | Subdomain takeover. GitHub's docs state this directly | Add and verify the custom domain in the repo first. No wildcard records |
| Wildcard `*.domain` at the DNS host | Takeover of every unset name, even if the apex is verified | Only the apex and the one `www` (or the one chosen subdomain) |
| Shipping `example.com` canonicals | Not a credential leak. It publishes the wrong owner for every URL and trains crawlers to ignore the real host | Block deploy on `rg example.com dist` |
| Flipping `ADS_ENABLED` while launching | Tool pages that handle JWTs and secrets would load a third party. Privacy copy says no ads | Leave ads off. Not this milestone |
| Inventing the GitHub account | Repo created under the wrong owner. Transfer later is a permission mess, and a public repo under the wrong account leaks the tree | User names the account. Stop if they have not |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| 404 中文 link goes to `/zh/404/` | Visitor in Chinese clicks the language switch and stays on an error page. Feels like i18n is fake | Point the 404 switch at `/zh/` or omit alternates. Verify on a missing URL after deploy |
| ToolCard English links on a ZH page | A missing `locale` prop sends Chinese visitors to the English tool URL. Not a throw, so it ships | Required `locale` when the guard phase touches ToolCard. Check one ZH card href in `dist/` |
| Apex and `www` both serve content | Shared links split. Theme and language look "lost" if a redirect drops the path | One canonical host. Redirect preserves `/zh/.../` including the slash |
| Certificate warning on day one | Visitors bounce. Looks like a scam | Do not announce the domain until HTTPS on the canonical host returns 200 |
| `hello@example.com` on About | Contact link is dead. Trust failure on a privacy-focused tools site | Replace with the user's mailbox in the origin commit, or remove the mailto until they have one. Do not invent an address |
| Host 404 instead of `dist/404.html` | Unknown tool URLs lose the header, theme, and language switch | Confirm a missing path returns the site's 404, status 404, not the host's branded page |

## "Looks Done But Isn't" Checklist

- [ ] **Remote:** `git remote -v` shows the user-named repo, and `git ls-remote origin refs/heads/main` matches local `main`. Verify no `--force` in the transcript.
- [ ] **Tag:** `git ls-remote origin refs/tags/v1.2` equals the pre-push `git rev-parse v1.2`. The message was not rewritten.
- [ ] **Fences:** `git show --stat HEAD` for the ship commits does not include `src/lib/crontab.ts` or LED `ToolShell`. `git stash list` still has both stashes.
- [ ] **CI actually ran:** The Actions tab shows a run on the `main` push, Node 22, `npm ci`, `npm test`, `npm run build`. A tag push alone does not count.
- [ ] **Token scope:** `ci.yml` still has `permissions: contents: read`. The run log has no secret material.
- [ ] **Origin:** `rg example.com` is clean in source and in `dist/` after the swap. `site` and `SITE_ORIGIN` are identical and equal the canonical hostname.
- [ ] **Sitemap:** `dist/sitemap-index.xml` and `dist/robots.txt` use that hostname. A ZH URL and its `xhtml:link` hreflang `zh-Hans` alternate are both on that host, both slashed.
- [ ] **Slash:** `curl -sI` on `/`, `/zh/`, and `/tools/json-formatter/` is 200. The unslashed form redirects at most once to the slashed form. No `ERR_TOO_MANY_REDIRECTS`.
- [ ] **www vs apex:** Exactly one hostname returns 200. The other returns one redirect to the first. Canonical matches the 200 host.
- [ ] **DNS wait:** Custom-domain failure with a working `*.pages.dev` / `*.netlify.app` / `*.github.io` URL is propagation or certificate delay, not a code bug. Do not force-push.
- [ ] **404:** `rg 'zh/404' dist` is empty. A missing path serves the site 404, and 中文 does not link to `/zh/404/`.
- [ ] **ToolCard:** A deliberate missing-label fixture fails the build with an explicit error, or the typecheck fails. ZH card hrefs in `dist/zh/` start with `/zh/tools/`.
- [ ] **Contact:** About/privacy no longer tell a visitor to email `hello@example.com` unless the user explicitly deferred the mailbox.
- [ ] **Single publisher:** Only one host has the GitHub connection or the DNS target.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Dirty `crontab.ts` or LED ToolShell committed and pushed | HIGH if the commit is public and tagged; MEDIUM if it is the tip of `main` and nobody else fetched | Do not force-push `main`. Do not move `v1.2`. Revert the file in a new commit (`git checkout <good-sha> -- <file>` then a path-limited commit). If the bad blob is only local, reset that commit before the first push. Never `git push --force` to hide it after the tag is public |
| Secret committed in a workflow | HIGH | Revoke the token at the provider immediately. A follow-up delete commit does not remove it from history. After revoke, rewrite only if the user explicitly asks and the remote was never shared. Prefer revoke-first |
| Tag `v1.2` moved and force-pushed | HIGH | Do not move it again. Record the original SHA from the local reflog if it still exists. Restoring the old tag is another force-update. Ask the user before any tag force-update. If the original SHA is lost, stop |
| `example.com` canonicals already crawled | MEDIUM | Fix `site` and `SITE_ORIGIN`, rebuild, redeploy, confirm `dist/` grep is clean, then resubmit the sitemap. Do not keep the bad deploy up while "planning the domain" |
| Trailing-slash loop in production | LOW to MEDIUM | Remove the slash redirect rule. Do not change `trailingSlash` to match the loop. Purge host cache. Re-curl `/zh/` and `/tools/` |
| www and apex both live or looping | MEDIUM | Pick the canonical hostname, make `site` match it, delete the extra A/CNAME, wait for DNS. Do not add a third record |
| DNS "broken" for hours | LOW | If the platform hostname works, wait. Do not push code. Recheck at 24h before changing records |
| CI red on Node 20 | LOW | Put Node 22 back. Do not delete the build step |
| `/zh/404/` already linked from deployed 404 | LOW | Ship the 404 wiring fix, rebuild, confirm `rg 'zh/404' dist` is empty |
| ToolCard throw on a new slug | LOW if caught at build; MEDIUM if a host is serving a stale successful build | Add the guard and the missing `ui.tools` entry. Do not publish a partial catalog |
| Non-empty remote rejected the first push | LOW | Do not force-push. Create a new empty repo under the account the user names, or add `main` only if the user confirms the remote commit should be merged |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Path-limited add / dirty crontab / LED ToolShell / stash pop | Remote + tag push, and every later commit | `git status` before push; ship commit `--stat` excludes fenced paths; both stashes still present |
| Secrets in the repo; widening `GITHUB_TOKEN` | Remote + tag push | `ci.yml` still `contents: read`; no token strings in `git log -p`; Actions run is test-only |
| Recreating or force-pushing tag `v1.2`; `--tags`; non-empty remote force-push | Remote + tag push | `git ls-remote origin refs/tags/v1.2` equals the pre-push SHA; push commands have no `--force` |
| Shipping `example.com` canonicals / sitemap / robots; `site` and `SITE_ORIGIN` drift | Origin swap | `rg example.com` clean in source and `dist/`; both constants match; rebuild happened after the edit |
| Trailing-slash loop or slash 404 | Host + DNS | `curl -sI` on `/`, `/zh/`, `/tools/json-formatter/` is 200; unslashed form redirects once; no new slash rule in `_redirects` or `netlify.toml` |
| www vs apex split, wrong CNAME target, CNAME file on Actions | Host + DNS | One 200 host, one redirect, `site` equals the 200 host; GitHub CNAME target is `<user>.github.io` with no repo path |
| DNS delay treated as a broken build; force-push to "fix" DNS | Host + DNS | Platform hostname verified first; no DNS edits during the wait; no force-push in the transcript |
| Node 20 on CI or on the host | Remote + tag push (do not regress the pin); Host + DNS (set host Node 22) | Actions log shows Node 22; host build log does not show the Astro engines error |
| 404 advertises `/zh/404/` | 404 wiring, before the first public deploy | `rg 'zh/404' dist` empty; missing URL serves site 404; 中文 href is `/zh/` or the switch is omitted |
| ToolCard unchecked lookup; silent English ZH cards | ToolCard guard | Missing label fails the build with an explicit error; ZH `dist` card hrefs are `/zh/tools/...` |
| Test workflow treated as a deploy; two hosts publishing | Host + DNS | Actions test job does not deploy; only one DNS target; visitor URL checked separately from the green check |
| `CONTACT_EMAIL` left as `hello@example.com` | Origin swap | About/privacy mailto is the user's mailbox, or the user explicitly deferred it |
| Guessed GitHub owner / `gh repo create` | Remote + tag push | Remote URL matches the account the user wrote down |

**Ordering rationale:**
Remote + tag push can happen before the user names a domain. It must not wait on DNS, and it must not include the origin swap "while we are pushing." Origin swap must happen before any public HTML is uploaded, because canonicals are baked at build time. 404 wiring and the ToolCard guard should land before that upload so the first public 404 and the first public catalog are not the known warnings. Host + DNS is last: it consumes the real origin, the Node 22 pin, and the slashed paths. It does not get to "fix" those by force-pushing or by stripping slashes.

## Sources

- Astro configuration reference (`site`, `trailingSlash`, `build.format`): https://docs.astro.build/en/reference/configuration-reference/ — prerendered trailing slashes are the host's job; Astro redirects do not cover them. `directory` format emits `index.html` and a slashed pathname. Confidence MEDIUM (official page fetched).
- Astro deploy overview and Netlify guide: https://docs.astro.build/en/guides/deploy/ and https://docs.astro.build/en/guides/deploy/netlify/ — static publish directory `dist`; Netlify needs Node `v22.12.0` or higher on legacy images. Confidence MEDIUM.
- Astro 7 `engines.node`: https://github.com/withastro/astro/blob/main/packages/astro/package.json and https://docs.astro.build/en/guides/upgrade-to/v6/ — `>=22.12.0`. Matches this repo's installed 7.3.2 and the user override already in `ci.yml`. Confidence MEDIUM.
- GitHub Actions workflow permissions and `GITHUB_TOKEN`: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax and https://docs.github.com/en/actions/concepts/security/github_token — `contents: read` vs write; token pushes do not start `push` workflows; omitted scopes become `none`. Confidence MEDIUM.
- Repository Actions settings (restricted default): https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository — new personal repos default to read for `contents` and `packages`. Confidence MEDIUM.
- `workflow_dispatch` only from the default branch until the first run: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows — Confidence MEDIUM.
- Secrets are empty if unset, and are not available to fork or Dependabot runs: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets — Confidence MEDIUM.
- GitHub Pages custom domains: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site — add the domain before DNS; apex A/AAAA vs `www` CNAME to `<user>.github.io`; Actions ignores `CNAME`; DNS up to 24 hours; no wildcards. Confidence MEDIUM (official page fetched).
- Netlify redirect options: https://docs.netlify.com/manage/routing/redirects/redirect-options/ — slash-normalizing CDN; a rule that adds or removes a slash infinite-redirects; Pretty URLs forwards `/about` to `/about/`. Confidence MEDIUM (official page fetched).
- Netlify external DNS (apex vs www): https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/ — prefer `www` on external DNS. Confidence MEDIUM.
- Cloudflare Pages serving and redirects: https://developers.cloudflare.com/pages/configuration/serving-pages/ and https://developers.cloudflare.com/pages/configuration/redirects/ — `/about/index.html` redirects to `/about/`; `.html` strips; redirects run even when an asset matches. Confidence MEDIUM (official pages fetched).
- Cloudflare Pages custom domains and www redirect: https://developers.cloudflare.com/pages/configuration/custom-domains/ and https://developers.cloudflare.com/pages/how-to/www-redirect/ — apex zone must be on the same account; www bulk redirect needs a proxied record. Confidence MEDIUM.
- Astro GitHub Pages guide: https://docs.astro.build/en/guides/deploy/github/ — static site, no adapter; `withastro/action@v6` plus `actions/deploy-pages@v5`; permissions `contents: read`, `pages: write`, `id-token: write`. Action default Node is 24. The custom-domain step says to add `public/CNAME` and to omit `base`, while the sample on that step still sets `base: '/my-repo'`. Do not copy the sample blindly. Confidence MEDIUM (official page fetched 2026-09-23).
- GitHub Pages 404 and entry file: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site and https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites — `404.html` for missing pages; `index.html` is the entry file. Official docs do not specify trailing-slash redirects or that the 404 keeps the request URL. Confidence MEDIUM for what the docs say. Observed slash behavior (directory `index.html` served at the slashed path) is LOW and must be verified on the first deploy.
- This repo, not the public docs: `.github/workflows/ci.yml` (Node 22, `contents: read`), `astro.config.mjs` (`site: 'https://example.com'`, `trailingSlash: 'always'`), `src/data/site.ts`, `src/layouts/BaseLayout.astro`, `src/pages/404.astro`, `src/components/LangSwitch.astro`, `src/components/ToolCard.astro`, Phase 12 review WR-01 and WR-02, v1.2 milestone audit fences. Confidence HIGH for the local facts (files read this session).

---
*Pitfalls research for: first publish of the Devtoolbox Astro bilingual static catalog*
*Researched: 2026-09-23*
