# CLAUDE.md — AI Assistant Guide for msbrookesj.com

This file provides context for AI assistants (Claude Code and others) working in this repository.

---

## Project Overview

A personal portfolio website for msbrookesj (Brooke Ryan), hosted as a static site on Google Cloud Storage. There is no build step and no backend — only HTML, CSS, images, and vendored JavaScript/CSS libraries. A `package.json` exists solely for test tooling and is not part of the site.

---

## Repository Structure

```
msbrookesj.com/
├── index.html              # Homepage / landing page
├── about.html              # About Me section
├── professional.html       # Career / work history
├── academic.html           # Education, coursework, research
├── athlete.html            # Figure skating history
├── office.html             # Easter-egg page (embedded YouTube video)
├── 404.html                # Custom "Page Not Found" error page (configured in GCS)
├── sitemap.xml             # XML sitemap for search engine indexing
│
├── bootstrap-3.3.5-dist/   # Bootstrap 3.3.5 framework (CSS + JS, vendored)
├── bootstrap-css/          # Custom Bootstrap overrides
│   ├── theme.css           # Footer layout, social icon hover colors, .page-image, .section-card
│   └── jumbotron.css       # Basic jumbotron padding
├── bootstrap-dep/          # Bootstrap JS dependencies
│   ├── jquery.min.js       # jQuery (minified)
│   ├── html5shiv.min.js    # IE8 polyfill
│   └── respond.min.js      # IE8 media-query polyfill
│
├── assets/
│   ├── font-awesome/       # Font Awesome icon library (locally hosted)
│   ├── slideshow/          # Homepage slideshow images
│   ├── about/              # About page images
│   ├── academic/           # Academic page images
│   ├── athlete/            # Athlete page images (+ slideshow/ subfolder)
│   └── professional/       # Professional page images
│
├── tests/
│   └── a11y.spec.js        # Playwright + axe-core accessibility tests (WCAG 2.1 AA)
│
├── .github/
│   └── workflows/
│       └── test.yml        # CI: HTML validation, link check, a11y, Lighthouse
│
├── .claude/
│   └── settings.json       # Project-shared Claude Code permissions
│
├── .htmlvalidate.json       # html-validate config
├── .lighthouserc.json       # Lighthouse CI config and score thresholds
├── .lychee.toml             # Lychee link checker config
├── package.json             # Test tooling only (not part of the site)
├── playwright.config.js     # Playwright config (serves site via python3 -m http.server)
├── favicon.ico
├── README.md                # Dev setup, test commands, and deployment
├── CLAUDE.md                # This file
└── .gitignore
```

---

## Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Markup | HTML5 | Hand-authored, no templating engine |
| Styling | Bootstrap 3.3.5 | Vendored; custom overrides in `bootstrap-css/` |
| Icons | Font Awesome 7.x | Locally hosted under `assets/font-awesome/` |
| JS | jQuery (minified) + Bootstrap JS | Vendored; no custom application JS |
| Build | **None** | No bundler, no preprocessor |
| Testing | html-validate, lychee, Playwright + axe-core, Lighthouse CI | Test tooling only; not deployed |
| Hosting | Google Cloud Storage | Static bucket serving |

There is no Sass/Less, no TypeScript, no JS framework, and no server-side code. The `package.json` exists only for test tooling and is excluded from the GCS bucket.

---

## Page Conventions

Every HTML page follows the same structural pattern:

1. **`<head>`** — `bootstrap.min.css`, `bootstrap-theme.min.css`, `theme.css`, Font Awesome (3 files), viewport meta tag, page title, `<link rel="canonical">`, and Open Graph / Twitter Card meta tags (`og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`). `index.html` additionally loads `jumbotron.css`. Do not add or remove stylesheets without applying the same change to all pages.
2. **Fixed top navbar** — Links to About, Professional, Academic, Athlete. Active page highlighted with `class="active"`.
3. **Main content** — Typically two Bootstrap columns: `col-md-8` (text) and `col-md-4` (image).
4. **Footer** — Three-column flexbox layout: social media icons on the left (LinkedIn, Instagram, Facebook, YouTube, GitHub) with a "FIND ME" label above them, copyright centered, and brand/tech icons on the right (Bootstrap, Font Awesome, Google Cloud, Claude) with a "BUILT WITH" label above them.

When editing or adding a page, match this structure exactly. Do not introduce new CSS frameworks or JavaScript libraries.

---

## CSS Conventions

- `bootstrap-css/theme.css` — The only place for custom styles. Contains footer flexbox layout, social icon `:hover` color rules, `.page-image` for centered section images, `.section-card` for centered index cards, and a `:focus-visible` outline rule for keyboard accessibility (WCAG 2.4.7).
- `bootstrap-css/jumbotron.css` — Minimal padding overrides only.
- **No inline styles** beyond what Bootstrap already uses.
- **Do not** add `<style>` blocks inside HTML files; put custom CSS in `theme.css`.
- Class naming follows Bootstrap conventions (`row`, `col-md-*`, `btn`, etc.).

---

## Navbar Active State

Each page sets its own nav item as active. When adding a new page or editing the navbar, update the `class="active"` on the correct `<li>` in every HTML file so all pages stay consistent.

**Exception — `index.html`:** The homepage intentionally has no `class="active"` on any nav item. The homepage is reached via the navbar brand logo, not a nav link, so no highlight is appropriate.

---

## Images

- All images live under `assets/<section>/`.
- Format: JPEG (`.jpg`).
- Images are referenced with relative paths from the page root (e.g., `assets/athlete/photo.jpg`).
- Sidebar images (in `.col-md-4`) use Bootstrap's `img-responsive` class — do **not** use a fixed `width` attribute, as this breaks responsiveness on smaller screens.
- No image processing pipeline — add images as-is.

---

## Deployment

Deployed manually with `gsutil rsync` to a Google Cloud Storage bucket:

```bash
/Volumes/Source/google-cloud-sdk/bin/gsutil -m rsync -r -d -x "^\.git/|^README\.md$|^CLAUDE\.md$|^\.claude/|^\.gitignore$|^node_modules/|^playwright-report/|^test-results/|^\.lighthouseci/|^package\.json$|^package-lock\.json$|^playwright\.config\.js$|^tests/|^\.github/|^\.lychee\.toml$|^\.htmlvalidate\.json$|^\.lighthouserc\.json$|^skater\.html$" ./ gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gsutil -m cp -z "html,css,js" 404.html about.html academic.html athlete.html index.html office.html professional.html gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gsutil -m cp -r -z "css,js" bootstrap-css/ bootstrap-3.3.5-dist/css/ bootstrap-3.3.5-dist/js/ bootstrap-dep/ assets/font-awesome/css/ gs://b1ryan.com/
```

**One-time GCS NotFound configuration** (run once after first deploying `404.html`; only needs to be re-run if the bucket web config is ever reset):

```bash
/Volumes/Source/google-cloud-sdk/bin/gsutil web set -e 404.html gs://b1ryan.com/
```

`gsutil` is not on the shell PATH — always use the absolute path `/Volumes/Source/google-cloud-sdk/bin/gsutil`.

This is a two-step process:
1. `rsync` — syncs all files and deletes remote files not present locally
2. `cp -z` — re-uploads HTML/CSS/JS with `Content-Encoding: gzip` so GCS serves them compressed to browsers

`gsutil cp` does not support `-x`. Step 2 uses **explicit paths** (never `./`) specifically to prevent excluded files (`.git/`, `CLAUDE.md`, etc.) from being uploaded. Do not change the `cp` commands to use `./` as the source.

Key flags:
- `-m` — parallel (multi-threaded) transfers
- `-r` — recursive
- `-d` — delete remote files not present locally (destructive — double-check before running)
- `-x` — excludes `.git/`, `README.md`, `CLAUDE.md`, `.claude/`, `.gitignore`, `skater.html`, test tooling (`package.json`, `package-lock.json`, `playwright.config.js`, `tests/`, `.github/`, `.lychee.toml`, `.htmlvalidate.json`, `.lighthouserc.json`), and test artifacts (`node_modules/`, `playwright-report/`, `test-results/`, `.lighthouseci/`) from the upload; `sitemap.xml` is **not** excluded and syncs via `rsync`
- `-z` — compresses named file types and sets `Content-Encoding: gzip` on the GCS object

**When adding a new HTML page**, add it to the `cp -z` command in step 2.

---

## Git Workflow

- Work is done on feature branches prefixed with `claude/`.
- Commit messages are imperative, short, and descriptive (e.g., `Add hover colors to social media icons`).
- Pushing or opening a pull request triggers the GitHub Actions test suite (HTML validation, link check, accessibility, Lighthouse). There is no automatic deployment.
- After merging, deploy manually with the `gsutil` command above.

---

## Claude Code Settings

Project-shared permissions are stored in `.claude/settings.json` and committed to the repository. This pre-authorizes the `gsutil` deploy commands so they run without prompting.

User-specific overrides belong in `.claude/settings.local.json`, which is gitignored and never committed.

---

## What NOT to Do

- **Do not** add a bundler, preprocessor, or application-level npm dependencies. The `package.json` is for test tooling only.
- **Do not** upgrade Bootstrap or jQuery without testing all pages — Bootstrap 3 and 4/5 have breaking API differences.
- **Do not** add inline `<script>` or `<style>` blocks to HTML pages.
- **Do not** push directly to `main`/`master` without a feature branch.
- **Do not** run `gsutil rsync -d` without verifying the local state matches intent — the `-d` flag deletes remote files.
- **Do not** run `gsutil cp -r ./` (with `./` as the source) without explicit exclusions — it will upload `.git/`, `CLAUDE.md`, and other excluded files to the public bucket. Always use the documented deploy script, which uses explicit paths in the `cp` steps for this reason.

---

## Testing

### Setup (one-time)

```bash
npm install
npx playwright install --with-deps chromium
```

Requires Node.js 20+ and Python 3 (Python is used to serve the site locally during Playwright tests).

### Test suite

| Command | Tool | What it checks |
|---------|------|----------------|
| `npm run test:html` | html-validate | Malformed markup, missing `alt` text, invalid attributes |
| `npm run test:a11y` | Playwright + axe-core | WCAG 2.1 AA violations on all six pages |
| `npm run test:lighthouse` | Lighthouse CI | Performance, accessibility, best practices, SEO scores |
| `lychee --config .lychee.toml *.html` | lychee | Broken internal and external links |

Lychee requires a separate binary install (see [lychee releases](https://github.com/lycheeverse/lychee/releases)); the other three run via `npm`.

### CI

GitHub Actions (`.github/workflows/test.yml`) runs all four jobs in parallel on every push and pull request. Accessibility score below 0.9 in Lighthouse fails the build; other Lighthouse scores are warnings.

### Configuration files

- `.htmlvalidate.json` — html-validate rules; `void-style: selfclose` matches Bootstrap 3's `/>` syntax.
- `.lychee.toml` — excludes sites that block automated crawlers or return unreliable results (Facebook, Instagram, LinkedIn, Yelp, claude.ai, icesymmetrics.com, glendale.edu).
- `.lighthouserc.json` — per-page URL list and score thresholds.
- `playwright.config.js` — spins up `python3 -m http.server 3000` before tests run.

---

## Common Tasks

### Add a new page
1. Copy the structure of an existing page (e.g., `about.html`).
2. Update the `<title>`, `<link rel="canonical">`, and Open Graph / Twitter Card meta tags.
3. Update the navbar `active` class.
4. Add the new page's nav link to the navbar in **all** other HTML files.
5. Place any new images under `assets/<section>/`.
6. Add the new page to the `cp -z` deploy command in step 2 (both in `README.md` and `CLAUDE.md`).
7. Add the new page's URL to `sitemap.xml`.

### Edit content on an existing page
Open the relevant HTML file and edit the content inside the main `col-md-8` content column. Avoid changing the surrounding Bootstrap scaffold.

### Add or change styles
Edit `bootstrap-css/theme.css`. Do not create new CSS files.

### Run tests
See the **Testing** section above. Run `npm run test:html` and `npm run test:a11y` locally before pushing to catch issues early.

### Deploy
Run the `gsutil rsync` command from `README.md` from the repository root after verifying changes look correct locally.
