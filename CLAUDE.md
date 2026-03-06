# CLAUDE.md — AI Assistant Guide for msbrookesj.com

This file provides context for AI assistants (Claude Code and others) working in this repository.

---

## Project Overview

A personal portfolio website for msbrookesj (Brooke Ryan), hosted as a static site on Google Cloud Storage. There is no build step and no backend — only HTML, CSS, images, and vendored JavaScript/CSS libraries. A `package.json` exists solely for test tooling and is not part of the site.

---

## Authoritative Hostname

**The canonical domain for this website is `https://www.msbrookesj.com/`.**

All absolute URLs in HTML pages (canonical tags, Open Graph / Twitter Card meta tags) and in `sitemap.xml` **must** use `https://www.msbrookesj.com/` as the base. Other domains such as `b1ryan.com` are aliases that redirect to this authoritative hostname.

The GCS bucket is named `b1ryan.com` — that is intentional and must remain as-is. The bucket name has no bearing on the canonical URLs used within the site's HTML and sitemap.

> **Common mistake to avoid:** Do not use `b1ryan.com` or any other alias as the hostname in `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`, or `sitemap.xml`. Always use `www.msbrookesj.com`.

---

## Repository Structure

```
msbrookesj.com/
├── website/                        # All deployable site files
│   ├── index.html                  # Homepage / landing page
│   ├── about.html                  # About Me section
│   ├── professional.html           # Career / work history
│   ├── academic.html               # Education, coursework, research
│   ├── athlete.html                # Figure skating history
│   ├── 404.html                    # Custom "Page Not Found" error page (configured in GCS)
│   ├── sitemap.xml                 # XML sitemap for search engine indexing
│   ├── favicon.ico
│   │
│   ├── css/
│   │   └── theme.css               # Footer layout, social icon hover colors, .page-image, .section-card
│   │
│   ├── dependencies/               # Third-party libraries (vendored)
│   │   ├── bootstrap/              # Bootstrap 3.3.5 framework
│   │   │   ├── css/                # bootstrap.min.css, bootstrap-theme.min.css, etc.
│   │   │   ├── js/                 # bootstrap.min.js
│   │   │   └── fonts/              # Glyphicons webfonts
│   │   ├── font-awesome/           # Font Awesome icon library
│   │   │   ├── css/                # fontawesome.min.css, brands.min.css, solid.min.css
│   │   │   └── webfonts/           # fa-brands-400.woff2, fa-solid-900.woff2
│   │   ├── jquery.min.js           # jQuery (minified)
│   │   └── jquery.min.map
│   │
│   └── assets/
│       ├── about/                  # About page images
│       ├── academic/               # Academic page images
│       ├── athlete/                # Athlete page images (+ slideshow/ subfolder)
│       └── professional/           # Professional page images
│
├── tests/
│   └── a11y.spec.js                # Playwright + axe-core accessibility tests (WCAG 2.1 AA)
│
├── .github/
│   └── workflows/
│       └── test.yml                # CI: HTML validation, link check, a11y, Lighthouse
│
├── .claude/
│   └── settings.json               # Project-shared Claude Code permissions
│
├── .htmlvalidate.json               # html-validate config
├── .lighthouserc.json               # Lighthouse CI config and score thresholds
├── .lychee.toml                     # Lychee link checker config
├── package.json                     # Test tooling only (not part of the site)
├── playwright.config.js             # Playwright config (serves website/ via python3 -m http.server)
├── README.md                        # Dev setup, test commands, and deployment
├── CLAUDE.md                        # This file
└── .gitignore
```

---

## Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Markup | HTML5 | Hand-authored, no templating engine |
| Styling | Bootstrap 3.3.5 | Vendored under `website/dependencies/bootstrap/`; custom overrides in `website/css/` |
| Icons | Font Awesome 7.x | Locally hosted under `website/dependencies/font-awesome/` |
| JS | jQuery (minified) + Bootstrap JS | Vendored; no custom application JS |
| Build | **None** | No bundler, no preprocessor |
| Testing | html-validate, lychee, Playwright + axe-core, Lighthouse CI | Test tooling only; not deployed |
| Hosting | Google Cloud Storage | Static bucket serving |

There is no Sass/Less, no TypeScript, no JS framework, and no server-side code. The `package.json` exists only for test tooling and is excluded from the GCS bucket.

---

## Page Conventions

Every HTML page follows the same structural pattern:

1. **`<head>`** — `bootstrap.min.css`, `bootstrap-theme.min.css`, `theme.css`, Font Awesome (3 files), viewport meta tag, page title, `<link rel="canonical">`, and Open Graph / Twitter Card meta tags (`og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`). `index.html` additionally loads `jumbotron.css`. Do not add or remove stylesheets without applying the same change to all pages. **All absolute URLs in these tags must use `https://www.msbrookesj.com/` — never `b1ryan.com` or any other alias.**
2. **Fixed top navbar** — Links to About, Professional, Academic, Athlete. Active page highlighted with `class="active"`.
3. **Main content** — Typically two Bootstrap columns: `col-md-8` (text) and `col-md-4` (image).
4. **Footer** — Three-column flexbox layout: social media icons on the left (LinkedIn, Instagram, Facebook, YouTube, GitHub) with a "FIND ME" label above them, copyright centered, and brand/tech icons on the right (Bootstrap, Font Awesome, Google Cloud, Claude) with a "BUILT WITH" label above them.

When editing or adding a page, match this structure exactly. Do not introduce new CSS frameworks or JavaScript libraries.

---

## CSS Conventions

- `website/css/theme.css` — The only place for custom styles. Contains footer flexbox layout, social icon `:hover` color rules, `.page-image` for centered section images, `.section-card` for centered index cards, a `:focus-visible` outline rule for keyboard accessibility (WCAG 2.4.7), `p a, li a { text-decoration: underline }` for link distinguishability (WCAG 1.4.1) with `.navbar li a, footer a { text-decoration: none }` to exclude nav/footer links, and a `.jumbotron a` color override for contrast.
- **No inline styles** beyond what Bootstrap already uses.
- **Do not** add `<style>` blocks inside HTML files; put custom CSS in `theme.css`.
- Class naming follows Bootstrap conventions (`row`, `col-md-*`, `btn`, etc.).

---

## Navbar Active State

Each page sets its own nav item as active. When adding a new page or editing the navbar, update the `class="active"` on the correct `<li>` in every HTML file so all pages stay consistent.

**Exception — `index.html`:** The homepage intentionally has no `class="active"` on any nav item. The homepage is reached via the navbar brand logo, not a nav link, so no highlight is appropriate.

---

## Images

- All images live under `website/assets/<section>/`.
- Format: JPEG (`.jpg`).
- Images are referenced with relative paths from the page (e.g., `assets/athlete/photo.jpg`).
- Sidebar images (in `.col-md-4`) use Bootstrap's `img-responsive` class, which applies `max-width: 100%` so they scale down on small screens. Always include explicit `width` and `height` attributes matching the image's intrinsic pixel dimensions — this lets the browser reserve the correct space before the image loads, preventing layout shift (CLS). These attributes do not break responsiveness because `img-responsive` overrides the rendered size.
- No image processing pipeline — add images as-is.

### Image Licensing and EXIF Policy

All images must have EXIF metadata set correctly before being committed. Use `piexif` (Python) to manage EXIF data.

**Original images by Brooke Ryan** — set the following EXIF fields:
- `Copyright` → `© 2026 Brooke Ryan`
- `Artist` → `Brooke Ryan`

**Third-party images** — preserve any existing `Copyright` and `Artist` fields exactly as provided by the original photographer. Do **not** overwrite third-party copyright with Brooke's name. Third-party images must be credited in `website/license.html` under "Photography Credits".

Currently, `website/assets/athlete/slideshow/2024-02-21-{1–9}.jpg` are © KrPhotogs Photography LLC and are credited accordingly in `license.html`.

**Location and device info** — strip the following EXIF fields from all images before committing:
- `GPS` IFD (coordinates)
- `HostComputer` (device name)
- `ImageDescription` (may contain venue/event names)

Example script to apply to a new image `path.jpg` owned by Brooke:

```python
import piexif

exif = piexif.load("path.jpg")
exif["GPS"] = {}
exif["0th"].pop(piexif.ImageIFD.HostComputer, None)
exif["0th"].pop(piexif.ImageIFD.ImageDescription, None)
exif["0th"][piexif.ImageIFD.Copyright] = "© 2026 Brooke Ryan".encode()
exif["0th"][piexif.ImageIFD.Artist] = "Brooke Ryan".encode()
piexif.insert(piexif.dump(exif), "path.jpg")
```

---

## Deployment

Deployed manually with `gsutil rsync` to a Google Cloud Storage bucket:

```bash
/Volumes/Source/google-cloud-sdk/bin/gsutil -m rsync -r -d website/ gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gsutil -m cp -z "html,css,js" website/404.html website/about.html website/academic.html website/athlete.html website/index.html website/license.html website/professional.html gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gsutil -m cp -r -z "css,js" website/css/ website/dependencies/ gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gcloud compute url-maps invalidate-cdn-cache ryanfam18-com --global --path "/*"
```

**One-time GCS NotFound configuration** (run once after first deploying `404.html`; only needs to be re-run if the bucket web config is ever reset):

```bash
/Volumes/Source/google-cloud-sdk/bin/gsutil web set -e 404.html gs://b1ryan.com/
```

`gsutil` and `gcloud` are not on the shell PATH — always use the absolute path `/Volumes/Source/google-cloud-sdk/bin/gsutil` and `/Volumes/Source/google-cloud-sdk/bin/gcloud`.

This is a three-step process:
1. `rsync` — syncs all files from `website/` and deletes remote files not present locally. No exclusions are needed — all test tooling and repo metadata live outside `website/`.
2. `cp -z` — re-uploads HTML/CSS/JS with `Content-Encoding: gzip` so GCS serves them compressed to browsers
3. `invalidate-cdn-cache` — flushes the Cloud CDN cache for the `ryanfam18-com` URL map so changes are visible immediately

`gsutil cp` does not support `-x`. Step 2 uses **explicit paths** (never `website/` as a catch-all) to control exactly which files are gzip-encoded. Do not change the `cp` commands to use `website/` as the sole source.

Key flags:
- `-m` — parallel (multi-threaded) transfers
- `-r` — recursive
- `-d` — delete remote files not present locally (destructive — double-check before running)
- `-z` — compresses named file types and sets `Content-Encoding: gzip` on the GCS object

**When adding a new HTML page**, add it to the `cp -z` command in step 2.

---

## Git Workflow

- Work is done on feature branches prefixed with `claude/`.
- Commit messages are imperative, short, and descriptive (e.g., `Add hover colors to social media icons`).
- Pushing or opening a pull request triggers the GitHub Actions test suite (HTML validation, link check, accessibility, Lighthouse). There is no automatic deployment.
- After merging, deploy manually with the `gsutil` command above.
- **Before opening a PR**, rebase the feature branch onto `main` (`git fetch origin main && git rebase origin/main`) to surface and resolve any conflicts locally before review.
- **Related changes to the same files** should be in a single commit rather than split across multiple commits — this minimises the number of conflict hunks during a rebase.
- The repo is configured with `pull.rebase = true` and `rebase.autoStash = true` (see `.git/config`), so `git pull` always rebases rather than merges.

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
- **Do not** run `gsutil cp -r website/` (with `website/` as the sole source) — it will upload all files including any in-progress pages. Always use the documented deploy script, which lists explicit paths in the `cp` steps.
- **Do not** use `b1ryan.com` or any other alias as the domain in `<link rel="canonical">`, Open Graph / Twitter Card tags, or `sitemap.xml`. The authoritative hostname is `www.msbrookesj.com`. The GCS bucket name `b1ryan.com` is an infrastructure detail and must not appear in site content URLs.

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
| `npm run test:a11y` | Playwright + axe-core | WCAG 2.1 AA violations on all five pages |
| `npm run test:lighthouse` | Lighthouse CI | Performance, accessibility, best practices, SEO scores |
| `lychee --config .lychee.toml website/*.html` | lychee | Broken internal and external links |

Lychee requires a separate binary install (see [lychee releases](https://github.com/lycheeverse/lychee/releases)); the other three run via `npm`.

### CI

GitHub Actions (`.github/workflows/test.yml`) runs all four jobs in parallel on every push and pull request. Accessibility score below 0.9 in Lighthouse fails the build; other Lighthouse scores are warnings.

### Configuration files

- `.htmlvalidate.json` — html-validate rules; `void-style: selfclose` matches Bootstrap 3's `/>` syntax.
- `.lychee.toml` — excludes sites that block automated crawlers or return unreliable results (Facebook, Instagram, LinkedIn, Yelp, claude.ai, icesymmetrics.com, glendale.edu).
- `.lighthouserc.json` — per-page URL list and score thresholds.
- `playwright.config.js` — spins up `python3 -m http.server 3000 --directory website` before tests run.

---

## Common Tasks

### Add a new page
1. Copy the structure of an existing page (e.g., `about.html`).
2. Update the `<title>`, `<link rel="canonical">`, and Open Graph / Twitter Card meta tags.
3. Update the navbar `active` class.
4. Add the new page's nav link to the navbar in **all** other HTML files.
5. Place any new images under `website/assets/<section>/`.
6. Add the new page to the `cp -z` deploy command in step 2 (both in `README.md` and `CLAUDE.md`).
7. Add the new page's URL to `sitemap.xml`.

### Edit content on an existing page
Open the relevant HTML file and edit the content inside the main `col-md-8` content column. Avoid changing the surrounding Bootstrap scaffold.

### Add or change styles
Edit `website/css/theme.css`. Do not create new CSS files.

### Run tests
See the **Testing** section above. Run `npm run test:html` and `npm run test:a11y` locally before pushing to catch issues early.

### Deploy
Run the `gsutil rsync` command from `README.md` from the repository root after verifying changes look correct locally.
