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
lychee --config .lychee.toml *.html
```

CI runs all four checks automatically on every push and pull request via GitHub Actions.

---

## Publish

```bash
/Volumes/Source/google-cloud-sdk/bin/gsutil -m rsync -r -d -x "^\.git/|^README\.md$|^CLAUDE\.md$|^\.claude/|^\.gitignore$|^node_modules/|^playwright-report/|^test-results/|^\.lighthouseci/|^package\.json$|^package-lock\.json$|^playwright\.config\.js$|^tests/|^\.github/|^\.lychee\.toml$|^\.htmlvalidate\.json$|^\.lighthouserc\.json$|^skater\.html$" ./ gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gsutil -m cp -z "html,css,js" 404.html about.html academic.html athlete.html index.html office.html professional.html gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gsutil -m cp -r -z "css,js" bootstrap-css/ bootstrap-3.3.5-dist/css/ bootstrap-3.3.5-dist/js/ bootstrap-dep/ assets/font-awesome/css/ gs://b1ryan.com/
```

**One-time:** configure GCS to serve `404.html` for missing pages (only needed once, or if the bucket web config is reset):

```bash
/Volumes/Source/google-cloud-sdk/bin/gsutil web set -e 404.html gs://b1ryan.com/
```

Verify no excluded files leaked to the bucket:
```bash
/Volumes/Source/google-cloud-sdk/bin/gsutil ls gs://b1ryan.com/.git/ gs://b1ryan.com/README.md gs://b1ryan.com/CLAUDE.md gs://b1ryan.com/.gitignore gs://b1ryan.com/.claude/ gs://b1ryan.com/package.json gs://b1ryan.com/package-lock.json gs://b1ryan.com/playwright.config.js gs://b1ryan.com/tests/ gs://b1ryan.com/.github/ gs://b1ryan.com/.lychee.toml gs://b1ryan.com/.htmlvalidate.json gs://b1ryan.com/.lighthouserc.json gs://b1ryan.com/skater.html 2>&1 | grep -q "matched no objects" && echo "OK: no excluded files in bucket" || echo "WARNING: excluded files found in bucket — remove them manually"
```
