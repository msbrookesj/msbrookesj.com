# CLAUDE.md — AI Assistant Guide for msbrookesj.com

This file provides context for AI assistants (Claude Code and others) working in this repository.

---

## Project Overview

A personal portfolio website for msbrookesj (Brooke Ryan), hosted as a static site on Google Cloud Storage. There is no build step and no backend — only HTML, CSS, images, and vendored JavaScript/CSS libraries. A `package.json` exists solely for test tooling and is not part of the site.

---

## Authoritative Hostname

**The canonical domain for this website is `https://www.msbrookesj.com/`.**

All absolute URLs in HTML pages (canonical tags, Open Graph / Twitter Card meta tags, JSON-LD structured data) and in `sitemap.xml` **must** use `https://www.msbrookesj.com/` as the base. Other domains such as `b1ryan.com` are aliases that redirect to this authoritative hostname.

The GCS bucket is named `b1ryan.com` — that is intentional and must remain as-is. The bucket name has no bearing on the canonical URLs used within the site's HTML and sitemap.

> **Common mistake to avoid:** Do not use `b1ryan.com` or any other alias as the hostname in `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`, JSON-LD `url`/`image` fields, or `sitemap.xml`. Always use `www.msbrookesj.com`.

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
│   ├── license.html                # Image credits and licensing information
│   ├── 404.html                    # Custom "Page Not Found" error page (configured in GCS)
│   ├── sitemap.xml                 # XML sitemap for search engine indexing
│   ├── favicon.ico                 # Legacy ICO icon (all browsers)
│   ├── favicon-16x16.png           # 16×16 PNG tab icon
│   ├── favicon-32x32.png           # 32×32 PNG tab icon (high-DPI)
│   ├── apple-touch-icon.png        # 180×180 iOS home screen icon
│   ├── android-chrome-192x192.png  # 192×192 Android / PWA icon
│   ├── android-chrome-512x512.png  # 512×512 Android splash / PWA icon
│   ├── site.webmanifest            # Web app manifest (ties Android/PWA icons together)
│   │
│   ├── css/
│   │   ├── jumbotron.css           # Hero / jumbotron styles (index.html only)
│   │   └── theme.css               # Footer layout, social icon hover colors, .page-image, .section-card
│   │
│   ├── js/
│   │   └── mobile-table-expand.js  # Row-expand toggle for mobile table detail rows
│   │
│   ├── dependencies/               # Third-party libraries (vendored)
│   │   ├── bootstrap/              # Bootstrap 5.3.3 framework
│   │   │   ├── css/                # bootstrap.min.css
│   │   │   └── js/                 # bootstrap.bundle.min.js (includes Popper)
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
│   ├── a11y.spec.js                # Playwright + axe-core accessibility tests (WCAG 2.1 AA)
│   ├── mobile-table.spec.js        # Playwright responsive-layout tests: no horizontal overflow on any page (mobile + desktop), table-responsive wrappers, column visibility, row-expand detail rows
│   ├── perf-hints.sh               # Performance hint checks: defer, preloads, lazy loading, table wrappers
│   └── screenshots.spec.js         # Playwright full-page screenshots of every page at desktop + mobile viewports
│
├── .github/
│   └── workflows/
│       ├── CLAUDE.md               # CI workflow conventions for AI assistants
│       ├── deploy.yml              # CD: auto-deploy to GCS on merge to main
│       ├── test.yml                # CI: HTML validation, link check, a11y, Lighthouse
│       ├── screenshots.yml         # CI: full-page screenshots — artifacts + per-PR branch
│       └── screenshots-cleanup.yml # CI: deletes screenshots/pr-N branch when PR closes
│
├── .claude/
│   ├── settings.json               # Project-shared Claude Code permissions and hooks
│   ├── hooks/
│   │   ├── session-start.sh            # SessionStart hook: environment detection and setup
│   │   └── precommit-support-files.sh  # PreToolUse hook: checks supporting files before git commit
│   └── rules/                      # Path-scoped rules (loaded only when editing matching files)
│       ├── table-conventions.md    # Mobile-responsive table patterns and row-expand behaviour
│       ├── structured-data.md      # JSON-LD Person schema for index.html and about.html
│       ├── image-exif.md           # EXIF metadata policy and piexif example
│       └── deployment.md           # Manual gsutil/gcloud deploy commands (local only)
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
| Styling | Bootstrap 5.3.3 | Vendored under `website/dependencies/bootstrap/`; custom overrides in `website/css/` |
| Icons | Font Awesome 7.x | Locally hosted under `website/dependencies/font-awesome/` |
| JS | jQuery (minified) + Bootstrap JS | Vendored; no custom application JS |
| Build | **None** | No bundler, no preprocessor |
| Testing | html-validate, lychee, Playwright + axe-core, Lighthouse CI | Test tooling only; not deployed |
| Hosting | Google Cloud Storage | Static bucket serving |

There is no Sass/Less, no TypeScript, no JS framework, and no server-side code. The `package.json` exists only for test tooling and is excluded from the GCS bucket.

---

## Page Conventions

Every HTML page follows the same structural pattern:

1. **`<head>`** — `bootstrap.min.css`, `theme.css`, Font Awesome (3 files), viewport meta tag, page title, `<link rel="canonical">`, Open Graph / Twitter Card meta tags (`og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`), favicon `<link>` tags (`favicon.ico`, `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png`, `site.webmanifest`), and a `<script type="application/ld+json">` block with Schema.org `Person` structured data (see below). `index.html` additionally loads `jumbotron.css`. Do not add or remove stylesheets without applying the same change to all pages. **All absolute URLs in these tags must use `https://www.msbrookesj.com/` — never `b1ryan.com` or any other alias.**
2. **Fixed top navbar** — Links to About, Professional, Academic, Athlete. Active page highlighted with `class="active"`.
3. **Main content** — Typically two Bootstrap columns: `col-md-8` (text) and `col-md-4` (image). Pages with no sidebar image (e.g., `license.html`) use a single `col-md-12` column spanning the full width.
4. **Footer** — Three-column flexbox layout: social media icons on the left (LinkedIn, Instagram, Facebook, YouTube, GitHub) with a "FIND ME" label above them, copyright centered, and brand/tech icons on the right (Bootstrap, Font Awesome, Google Cloud, Claude) with a "BUILT WITH" label above them.

When editing or adding a page, match this structure exactly. Do not introduce new CSS frameworks or JavaScript libraries.

---

## CSS Conventions

- `website/css/theme.css` — The only place for custom styles. Contains footer flexbox layout, social icon `:hover` color rules, `.page-image` for centered section images, `.section-card` for centered index cards, a `:focus-visible` outline rule for keyboard accessibility (WCAG 2.4.7), `p a, li a { text-decoration: underline }` for link distinguishability (WCAG 1.4.1) with `.navbar li a, footer a { text-decoration: none }` to exclude nav/footer links, a `.jumbotron a` color override for contrast, a `@media (max-width: 767.98px)` rule hiding the Instructor (`:nth-child(4)`), Academic Period (`:nth-child(5)`), and Course Description link (`:nth-child(6)`) columns in the academic course history tables, a `.btn-outline-secondary[aria-expanded="true"]` rule that keeps the "View Photos" button visually pressed while its gallery is open, a `.table-hover` rule keeping the hover highlight on rows while their detail row is open, a mobile override that disables the sticky `:hover` highlight on collapsed rows (so only disclosed rows stay highlighted), and a `vertical-align: middle` rule ensuring consistent cell alignment across all academic tables.
- **No inline styles** beyond what Bootstrap already uses.
- **Do not** add `<style>` blocks inside HTML files; put custom CSS in `theme.css`.
- Class naming follows Bootstrap conventions (`row`, `col-md-*`, `btn`, etc.).

---

## Table Conventions

Every `<table>` must be wrapped in `<div class="table-responsive">` and have non-essential columns hidden on mobile. Full rules, current implementation table, mobile row-expand behaviour, and regression guards are in [`.claude/rules/table-conventions.md`](.claude/rules/table-conventions.md) — loaded automatically when editing HTML, CSS, JS, or table test files.

---

## Structured Data (JSON-LD)

`index.html` and `about.html` include `<script type="application/ld+json">` blocks with Schema.org `Person` data. Keep them in sync. Full field list and rules are in [`.claude/rules/structured-data.md`](.claude/rules/structured-data.md) — loaded automatically when editing those two files.

---

## Navbar Active State

Each page sets its own nav item as active. When adding a new page or editing the navbar, update the `class="active"` on the correct `<li>` in every HTML file so all pages stay consistent.

**Exception — `index.html`:** The homepage intentionally has no `class="active"` on any nav item. The homepage is reached via the navbar brand logo, not a nav link, so no highlight is appropriate.

---

## Images

- All images live under `website/assets/<section>/`.
- Format: JPEG (`.jpg`).
- Images are referenced with relative paths from the page (e.g., `assets/athlete/photo.jpg`).
- Sidebar images (in `.col-md-4`) use Bootstrap's `img-fluid` class, which applies `max-width: 100%; height: auto` so they scale down on small screens. Always include explicit `width` and `height` attributes matching the image's intrinsic pixel dimensions — this lets the browser reserve the correct space before the image loads, preventing layout shift (CLS). These attributes do not break responsiveness because `img-fluid` overrides the rendered size.
- No image processing pipeline — add images as-is.

### Image Licensing and EXIF Policy

All images must have EXIF metadata set correctly (copyright, artist, GPS stripped) before being committed. Full policy, third-party image rules, and example `piexif` script are in [`.claude/rules/image-exif.md`](.claude/rules/image-exif.md) — loaded automatically when working in `website/assets/` or `website/license.html`.

---

## Deployment

Merging to `main` triggers an automatic deploy via `.github/workflows/deploy.yml`. Manual deploy uses `gsutil rsync` + `gsutil cp -z` + CDN cache invalidation — full commands, flags, and safety rules are in [`.claude/rules/deployment.md`](.claude/rules/deployment.md) — loaded automatically when editing `deploy.yml` or `README.md`.

**When adding a new HTML page**, add it to the `cp -z` command in the deploy script (step 2).

Deploy commands use absolute paths (`/Volumes/Source/google-cloud-sdk/bin/`) and are only available locally — not on Claude Code on the web.

---

## Git Workflow

- Work is done on feature branches prefixed with `claude/`.
- Commit messages are imperative, short, and descriptive (e.g., `Add hover colors to social media icons`).
- Pushing or opening a pull request triggers the GitHub Actions test suite (HTML validation, link check, accessibility, Lighthouse, YAML syntax, performance hints). There is no automatic deployment.
- After merging to `main`, GitHub Actions deploys automatically via `.github/workflows/deploy.yml`. Manual deploy is only needed for out-of-band changes.
- **Before opening a PR**, rebase the feature branch onto `main` (`git fetch origin main && git rebase origin/main`) to surface and resolve any conflicts locally before review.
- **Related changes to the same files** should be in a single commit rather than split across multiple commits — this minimises the number of conflict hunks during a rebase.
- The repo is configured with `pull.rebase = true` and `rebase.autoStash = true` (see `.git/config`), so `git pull` always rebases rather than merges.
- **Before committing**, update all applicable supporting files in the same commit. The table below lists what triggers an update to each file:

| Supporting file | Update when… |
|----------------|--------------|
| `README.md` | Deploy commands change (new page in `cp -z` step), dev workflow changes |
| `CLAUDE.md` / `.claude/rules/*.md` | Any of the above, plus new conventions, page structure changes, or AI-guidance rules |
| `website/sitemap.xml` | A page is added or removed |
| `.lighthouserc.json` | A page is added or removed (add/remove its URL from the `urls` list) |
| `tests/perf-hints.sh` | A page is added or removed (add/remove it from the `ALL_PAGES` array); a table is added or removed (add/remove its `table-responsive` and column-hiding checks) |
| `tests/mobile-table.spec.js` | A page is added or removed (add/remove it from the `ALL_PAGES` array at the top of the file); a table is added or removed (add/remove its describe block) |
| `tests/screenshots.spec.js` | A page is added or removed (add/remove it from `ALL_PAGES`); a page gains or loses collapse sections (add/remove it from `PAGES_WITH_DISCLOSURES`) |
| `website/license.html` | A third-party image is added or removed |

---

## Claude Code Settings

Project-shared permissions and hooks are stored in `.claude/settings.json` and committed to the repository. This pre-authorizes deploy commands (`gsutil`, `gcloud`) and test commands (`npm run test:*`, `npx playwright install`) so they run without prompting.

User-specific overrides belong in `.claude/settings.local.json`, which is gitignored and never committed.

### Environment Detection

The project uses a `SessionStart` hook (`.claude/hooks/session-start.sh`) to detect the execution environment and set up accordingly:

| Environment | Detection | Behaviour |
|-------------|-----------|-----------|
| **Claude Code on the web** | `CLAUDE_CODE_REMOTE=true` | Automatically runs `npm install` and `npx playwright install --with-deps chromium` so tests can run immediately |
| **Local (CLI / IDE)** | `CLAUDE_CODE_REMOTE` unset | Assumes dependencies are already installed; warns if `node_modules/` is missing |

This means sessions on Claude Code on the web are self-bootstrapping — no manual setup is needed before running tests.

**Deploy commands** (`gsutil`, `gcloud`) use absolute paths specific to the local machine (`/Volumes/Source/google-cloud-sdk/bin/`). These are only available locally and will not work on Claude Code on the web. Deployments should only be done from the local environment.

### Pre-Commit Supporting-File Check

A `PreToolUse` hook (`.claude/hooks/precommit-support-files.sh`) fires before every `Bash` tool call. It detects `git commit` commands and, when one is found, compares the cumulative branch diff (all commits since the last evaluation plus staged changes) against the supporting-files table above. If a required file appears to be missing from the changeset, the hook prints a warning listing the files that may need updating.

The hook tracks its progress via `.claude/.precommit-last-evaluated` (gitignored), which stores the SHA of the last commit that passed without warnings. This avoids re-checking changes that have already been evaluated and accepted.

---

## What NOT to Do

- **Do not** add a bundler, preprocessor, or application-level npm dependencies. The `package.json` is for test tooling only.
- **Do not** upgrade Bootstrap (currently 5.3.3) without testing all pages — Bootstrap has had breaking API changes between major versions.
- **Do not** add inline `<script>` or `<style>` blocks to HTML pages. The one exception is `<script type="application/ld+json">` for Schema.org structured data — that is intentional and must be kept.
- **Do not** push directly to `main`/`master` without a feature branch.
- **Do not** run `gsutil rsync -d` without verifying the local state matches intent — the `-d` flag deletes remote files.
- **Do not** run `gsutil cp -r website/` (with `website/` as the sole source) — it will upload all files including any in-progress pages. Always use the documented deploy script, which lists explicit paths in the `cp` steps.
- **Do not** use `b1ryan.com` or any other alias as the domain in `<link rel="canonical">`, Open Graph / Twitter Card tags, or `sitemap.xml`. The authoritative hostname is `www.msbrookesj.com`. The GCS bucket name `b1ryan.com` is an infrastructure detail and must not appear in site content URLs.
- **Do not** add a `<table>` without wrapping it in `<div class="table-responsive">`. An unwrapped table causes a page-level horizontal scrollbar on mobile. See [`.claude/rules/table-conventions.md`](.claude/rules/table-conventions.md) for the full pattern including column hiding.

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
| `npm run test:a11y` | Playwright + axe-core | WCAG 2.1 AA violations on all pages (`a11y.spec.js`) **and** responsive layout — no horizontal overflow on every page at mobile + desktop, table-responsive wrappers, column visibility at each breakpoint, row-expand detail rows (`mobile-table.spec.js`) |
| `npm run test:lighthouse` | Lighthouse CI | Performance, accessibility, best practices, SEO scores |
| `npm run test:perf-hints` | bash | Mobile PageSpeed regressions: Bootstrap `defer`, FA webfont preloads, FA CSS async loading, `loading=lazy` on below-fold images, no `fetchpriority=high` on sub-page images, `table-responsive` wrappers and column-hiding rules on all table pages |
| `npm run screenshots` | Playwright | Full-page screenshots of every page at desktop (1280×720) and mobile (iPhone 12) viewports; saved to `screenshots/` |
| `lychee --config .lychee.toml website/*.html` | lychee | Broken internal and external links |

Lychee requires a separate binary install (see [lychee releases](https://github.com/lycheeverse/lychee/releases)); the other five run via `npm`.

### CI

GitHub Actions (`.github/workflows/test.yml`) runs all six test jobs in parallel on every push and pull request. Accessibility score below 0.9 in Lighthouse fails the build; other Lighthouse scores are warnings.

A separate workflow (`.github/workflows/screenshots.yml`) captures full-page screenshots of every page at desktop and mobile viewports on every push and pull request. For details on the screenshot branch naming, race-condition prevention, PR description updates, and cleanup, see [`.github/workflows/CLAUDE.md`](.github/workflows/CLAUDE.md).

### Configuration files

- `.htmlvalidate.json` — html-validate rules; `void-style: selfclose` enforces self-closing void elements (e.g. `<meta ... />`).
- `.lychee.toml` — excludes `www.msbrookesj.com` itself (canonical and `og:url` tags must be absolute per spec, but new pages won't resolve until deployed) and sites that block automated crawlers or return unreliable results (Facebook, Instagram, LinkedIn, Yelp, claude.ai, icesymmetrics.com, glendale.edu).
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
8. Add the new page to `ALL_PAGES` in `tests/perf-hints.sh`.
9. Add the new page to `ALL_PAGES` in `tests/mobile-table.spec.js` (the overflow loop covers it automatically once it's in the list).
10. Add the new page to `ALL_PAGES` in `tests/screenshots.spec.js`. If the page has Bootstrap collapse sections, also add it to `PAGES_WITH_DISCLOSURES`.

### Edit content on an existing page
Open the relevant HTML file and edit the content inside the main `col-md-8` content column. Avoid changing the surrounding Bootstrap scaffold.

### Add or change styles
Edit `website/css/theme.css`. Do not create new CSS files.

### Run tests
See the **Testing** section above. Run `npm run test:html` and `npm run test:a11y` locally before pushing to catch issues early.

### Deploy
See [`.claude/rules/deployment.md`](.claude/rules/deployment.md) for the full deploy commands. Only available locally (not on Claude Code on the web).
