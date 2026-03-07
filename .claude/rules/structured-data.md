---
paths:
  - "website/index.html"
  - "website/about.html"
---

# Structured Data (JSON-LD)

`index.html` and `about.html` each include a `<script type="application/ld+json">` block in the `<head>` that declares a Schema.org `Person` entity. This is machine-readable metadata — invisible to visitors — that helps AI systems, search engines, and knowledge graphs unambiguously identify which Brooke Ryan this site belongs to.

The block should remain consistent across both pages and include:

| Field | Value |
|-------|-------|
| `@type` | `"Person"` |
| `name` | `"Brooke Ryan"` |
| `alternateName` | `"msbrookesj"` |
| `url` | `"https://www.msbrookesj.com/"` |
| `image` | Current profile photo URL (use `www.msbrookesj.com`) |
| `description` | One-sentence summary used for disambiguation |
| `jobTitle` | Current job title |
| `worksFor` | Current employer (Organization) |
| `alumniOf` | UCSD (CollegeOrUniversity) |
| `address` | San Jose, CA |
| `sameAs` | All social profile URLs (LinkedIn, Instagram, Facebook, YouTube, GitHub) |

**If Brooke's job title, employer, or social profile URLs change**, update the JSON-LD block in both `index.html` and `about.html` at the same time, keeping them in sync.

**Do not** use `b1ryan.com` in the JSON-LD `url` or `image` fields — always use `www.msbrookesj.com`.

Note: the JSON-LD `Person` block lives only on `index.html` and `about.html` — do not copy it to content subpages.
