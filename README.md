# msbrookesj.com

Personal portfolio website for Brooke Ryan. Static HTML/CSS site hosted on Google Cloud Storage.

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
/Volumes/Source/google-cloud-sdk/bin/gsutil -m cp -z "html,css,js" website/404.html website/about.html website/academic.html website/athlete.html website/index.html website/professional.html gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gsutil -m cp -r -z "css,js" website/css/ website/dependencies/ gs://b1ryan.com/
```

**One-time:** configure GCS to serve `404.html` for missing pages (only needed once, or if the bucket web config is reset):

```bash
/Volumes/Source/google-cloud-sdk/bin/gsutil web set -e 404.html gs://b1ryan.com/
```
