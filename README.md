# Hi, I'm Brooke 👋

*The Professional. The Academic. The Athlete. The Mom.*

Software engineer by day, mom to two amazing kids, figure skater by heart, perpetual student always.
This is my little slice of the internet — built by hand, hosted in the cloud.

<img src="favicon.svg" width="80" height="80" alt="BR monogram logo"/>

![CI](https://github.com/msbrookesj/msbrookesj.com/actions/workflows/test.yml/badge.svg)
![Screenshots](https://github.com/msbrookesj/msbrookesj.com/actions/workflows/screenshots.yml/badge.svg)
![Deploy](https://github.com/msbrookesj/msbrookesj.com/actions/workflows/deploy.yml/badge.svg)
![HTML5](https://img.shields.io/badge/HTML5-static-orange)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.3-7952B3)
![Hosted on GCS](https://img.shields.io/badge/hosted-Google%20Cloud%20Storage-4285F4)

**Authoritative hostname:** `https://www.msbrookesj.com/` — all canonical URLs, Open Graph tags, and `sitemap.xml` entries must use this domain. Other domains (e.g. `b1ryan.com`) are aliases that redirect here. The GCS bucket is named `b1ryan.com` for historical reasons and stays as-is.

---

## Development

**Prerequisites:** Node.js 20+, Python 3 (for local server)

```bash
npm install
npx playwright install --with-deps chromium
```

### Run tests locally

```bash
# HTML validation (html-validate)
npm run test:html

# Accessibility (WCAG 2.1 AA) + responsive layout — no horizontal overflow on
# every page at mobile and desktop, table-responsive wrappers, column visibility
npm run test:a11y

# Mobile PageSpeed regressions: Bootstrap defer, FA preloads, lazy images,
# table-responsive wrappers and column-hiding rules
npm run test:perf-hints

# Lighthouse CI — performance, accessibility, best practices, SEO scores
npm run test:lighthouse

# Full-page screenshots of every page at desktop + mobile viewports
# (saved to screenshots/ — gitignored)
npm run screenshots

# Link checking (lychee) — easiest to let CI run this; or install lychee locally:
# https://github.com/lycheeverse/lychee
lychee --config .lychee.toml website/*.html
```

CI runs all six test checks automatically on every push and pull request via GitHub Actions. A separate screenshots workflow captures full-page screenshots of every page at desktop and mobile viewports, uploaded as downloadable artifacts (90-day retention). For pull requests it also pushes screenshots to a dedicated `screenshots/pr-<N>-<sha>` branch per commit and updates the PR description with a table of all screenshot branches (HEAD marked). Runs are serialized per PR via a concurrency group, and stale runs skip the description update. All screenshot branches are deleted when the PR closes. Merging to `main` triggers an automatic deploy via `.github/workflows/deploy.yml`.

### Keeping supporting files in sync

Before committing, update all applicable supporting files in the same commit:

| File | Update when… |
|------|--------------|
| `README.md` | Deploy commands change (new page in `cp -z` step), dev workflow changes |
| `CLAUDE.md` | Any of the above, plus new conventions, page structure changes, or AI-guidance rules |
| `website/sitemap.xml` | A page is added or removed |
| `.lighthouserc.json` | A page is added or removed |
| `tests/perf-hints.sh` | A page is added or removed (`ALL_PAGES` array); a table is added or removed |
| `tests/mobile-table.spec.js` | A page is added or removed (`ALL_PAGES` array at top of file); a table is added or removed |
| `tests/screenshots.spec.js` | A page is added or removed (`ALL_PAGES`); a page gains or loses collapse sections (`PAGES_WITH_DISCLOSURES`) |
| `website/license.html` | A third-party image is added or removed |

---

## Publish

Merging to `main` deploys automatically via GitHub Actions using the `GCP_SA_KEY` secret.

**Manual deploy** (fallback or out-of-band):

```bash
/Volumes/Source/google-cloud-sdk/bin/gsutil -m rsync -r -d website/ gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gsutil -m cp -z "html,css,js,webmanifest" website/404.html website/about.html website/academic.html website/athlete.html website/index.html website/license.html website/professional.html website/site.webmanifest gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gsutil -m cp -r -z "css,js" website/css/ website/dependencies/ gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gcloud compute url-maps invalidate-cdn-cache ryanfam18-com --global --path "/*"
```

**One-time:** configure GCS to serve `404.html` for missing pages (only needed once, or if the bucket web config is reset):

```bash
/Volumes/Source/google-cloud-sdk/bin/gsutil web set -e 404.html gs://b1ryan.com/
```
