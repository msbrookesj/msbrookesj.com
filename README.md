# Hi, I'm Brooke 👋

*The Professional. The Academic. The Athlete. The Mom.*

Software engineer by day, mom to two amazing kids, figure skater by heart, perpetual student always.
This is my little slice of the internet — built by hand, hosted in the cloud.

<img src="favicon.svg" width="80" height="80" alt="BR monogram logo"/>

![CI](https://github.com/msbrookesj/msbrookesj.com/actions/workflows/test.yml/badge.svg)
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

# Accessibility — WCAG 2.1 AA audit of all pages (Playwright + axe-core)
npm run test:a11y

# Lighthouse CI — performance, accessibility, best practices, SEO scores
npm run test:lighthouse

# Link checking (lychee) — easiest to let CI run this; or install lychee locally:
# https://github.com/lycheeverse/lychee
lychee --config .lychee.toml website/*.html
```

CI runs all four checks automatically on every push and pull request via GitHub Actions.

---

## Publish

```bash
/Volumes/Source/google-cloud-sdk/bin/gsutil -m rsync -r -d website/ gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gsutil -m cp -z "html,css,js" website/404.html website/about.html website/academic.html website/athlete.html website/index.html website/license.html website/professional.html gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gsutil -m cp -r -z "css,js" website/css/ website/dependencies/ gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gcloud compute url-maps invalidate-cdn-cache ryanfam18-com --global --path "/*"
```

**One-time:** configure GCS to serve `404.html` for missing pages (only needed once, or if the bucket web config is reset):

```bash
/Volumes/Source/google-cloud-sdk/bin/gsutil web set -e 404.html gs://b1ryan.com/
```
