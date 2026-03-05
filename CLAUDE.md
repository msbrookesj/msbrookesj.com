# CLAUDE.md — AI Assistant Guide for msbrookesj.com

This file provides context for AI assistants (Claude Code and others) working in this repository.

---

## Project Overview

A personal portfolio website for msbrookesj (Brooke Ryan), hosted as a static site on Google Cloud Storage. There is no build step, no package manager, and no backend — only HTML, CSS, images, and vendored JavaScript/CSS libraries.

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
├── favicon.ico
├── README.md               # Deployment command
├── CLAUDE.md               # This file
└── .gitignore
```

---

## Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Markup | HTML5 | Hand-authored, no templating engine |
| Styling | Bootstrap 3.3.5 | Vendored; custom overrides in `bootstrap-css/` |
| Icons | Font Awesome 6.x | Locally hosted under `assets/font-awesome/` |
| JS | jQuery (minified) + Bootstrap JS | Vendored; no custom application JS |
| Build | **None** | No bundler, no preprocessor, no npm |
| Hosting | Google Cloud Storage | Static bucket serving |

There are no Node.js packages, no `package.json`, no Sass/Less, no TypeScript, no JS framework, and no server-side code.

---

## Page Conventions

Every HTML page follows the same structural pattern:

1. **`<head>`** — `bootstrap.min.css`, `bootstrap-theme.min.css`, `theme.css`, Font Awesome (3 files), viewport meta tag, page title. `index.html` additionally loads `jumbotron.css`. Do not add or remove stylesheets without applying the same change to all pages.
2. **Fixed top navbar** — Links to About, Professional, Academic, Athlete. Active page highlighted with `class="active"`.
3. **Main content** — Typically two Bootstrap columns: `col-md-8` (text) and `col-md-4` (image).
4. **Footer** — Flexbox layout; copyright on the left, social media icons on the right (LinkedIn, Instagram, Facebook, YouTube, GitHub).

When editing or adding a page, match this structure exactly. Do not introduce new CSS frameworks or JavaScript libraries.

---

## CSS Conventions

- `bootstrap-css/theme.css` — The only place for custom styles. Contains footer flexbox layout, social icon `:hover` color rules, `.page-image` for centered section images, and `.section-card` for centered index cards.
- `bootstrap-css/jumbotron.css` — Minimal padding overrides only.
- **No inline styles** beyond what Bootstrap already uses.
- **Do not** add `<style>` blocks inside HTML files; put custom CSS in `theme.css`.
- Class naming follows Bootstrap conventions (`row`, `col-md-*`, `btn`, etc.).

---

## Navbar Active State

Each page sets its own nav item as active. When adding a new page or editing the navbar, update the `class="active"` on the correct `<li>` in every HTML file so all pages stay consistent.

---

## Images

- All images live under `assets/<section>/`.
- Format: JPEG (`.jpg`).
- Images are referenced with relative paths from the page root (e.g., `assets/athlete/photo.jpg`).
- No image processing pipeline — add images as-is.

---

## Deployment

Deployed manually with `gsutil rsync` to a Google Cloud Storage bucket:

```bash
gsutil rsync -r -d -x "^\.git/|^README\.md$|^\.claude/" ./ gs://b1ryan.com/
```

Key flags:
- `-r` — recursive
- `-d` — delete remote files not present locally (destructive — double-check before running)
- `-x` — excludes `.git/`, `README.md`, and `.claude/` from the upload

> **Note:** `CLAUDE.md` is not excluded, so it will be uploaded to the bucket. If that is undesirable, add `|^CLAUDE\.md$` to the exclusion pattern in `README.md` and your local command.

---

## Git Workflow

- Work is done on feature branches prefixed with `claude/`.
- Commit messages are imperative, short, and descriptive (e.g., `Add hover colors to social media icons`).
- There is no CI/CD pipeline; pushes do not trigger automatic tests or deployments.
- After pushing, deploy manually with the `gsutil` command above.

---

## What NOT to Do

- **Do not** add `package.json`, a bundler, or any build tooling unless explicitly requested.
- **Do not** upgrade Bootstrap or jQuery without testing all pages — Bootstrap 3 and 4/5 have breaking API differences.
- **Do not** add inline `<script>` or `<style>` blocks to HTML pages.
- **Do not** push directly to `main`/`master` without a feature branch.
- **Do not** run `gsutil rsync -d` without verifying the local state matches intent — the `-d` flag deletes remote files.

---

## Common Tasks

### Add a new page
1. Copy the structure of an existing page (e.g., `about.html`).
2. Update the `<title>` and navbar `active` class.
3. Add the new page's nav link to the navbar in **all** other HTML files.
4. Place any new images under `assets/<section>/`.

### Edit content on an existing page
Open the relevant HTML file and edit the content inside the main `col-md-8` content column. Avoid changing the surrounding Bootstrap scaffold.

### Add or change styles
Edit `bootstrap-css/theme.css`. Do not create new CSS files.

### Deploy
Run the `gsutil rsync` command from `README.md` from the repository root after verifying changes look correct locally.
