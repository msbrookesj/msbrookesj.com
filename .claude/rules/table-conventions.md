---
paths:
  - "website/*.html"
  - "website/js/**"
  - "website/css/**"
  - "tests/mobile-table.spec.js"
  - "tests/perf-hints.sh"
---

# Table Conventions

Every `<table>` in the site must be mobile-friendly. A table that overflows its container horizontally causes a page-level horizontal scrollbar on mobile, which breaks usability and fails Core Web Vitals layout checks.

**Rules — apply to every `<table>` added to the site:**

1. **Always wrap in `<div class="table-responsive">`.**  Bootstrap's `.table-responsive` constrains overflow to the wrapper and lets the table scroll horizontally within it rather than breaking the page layout.

2. **Hide non-essential columns on mobile.** If a table has more than ~4 columns, identify which columns are least important to mobile readers and mark them with `d-none d-md-table-cell` on **both** the `<th>` and every corresponding `<td>` in that column. This hides the column below Bootstrap's `md` breakpoint (768 px) and shows it on larger screens.

   ```html
   <th scope="col" class="d-none d-md-table-cell">Location</th>
   ...
   <td class="td-middle d-none d-md-table-cell">Las Vegas, NV</td>
   ```

3. **When there are too many cells to mark individually** (e.g. a multi-row course history table), use a CSS `nth-child` rule scoped to the table's containing `id` in `theme.css` instead. Example — academic course tables hide columns 4 (Instructor) and 5 (Academic Period):

   ```css
   @media (max-width: 767.98px) {
     #ucsdClasses th:nth-child(4),
     #ucsdClasses td:nth-child(4),
     #ucsdClasses th:nth-child(5),
     #ucsdClasses td:nth-child(5) { display: none; }
   }
   ```

**Currently implemented:**

| Page | Table | Mobile strategy |
|------|-------|----------------|
| `athlete.html` | Competition gallery | `d-none d-md-table-cell` on Level, Location, and Media columns; Media `<th>` also carries `data-detail-exclude` so the column is excluded from the mobile detail row (its purpose is implied by the gallery auto-expanding on tap); 2023–24 row carries `data-bs-gallery="gallery2024"` — on mobile, tapping the row auto-expands the photo carousel; on desktop, the dedicated Media column contains a "View Photos" button that toggles the gallery via Bootstrap Collapse and stays visually pressed (filled secondary) while the gallery is open |
| `academic.html` | 4 × course history | CSS `nth-child(4)`, `nth-child(5)`, and `nth-child(6)` in `theme.css` hide Instructor, Academic Period, and Course Description (catalog link) columns; Academic Period and Course Description appear in the row-expand detail row |
| `license.html` | Dependencies | `table-responsive` only (4 short columns fit without hiding) |

**Mobile row-expand (detail rows)** — `website/js/mobile-table-expand.js` is loaded on pages with tables. On mobile (< 768 px) it makes every `<tbody>` row tappable: tapping inserts a `<tr class="table-row-detail">` directly below the row, containing one `<div>` per hidden column formatted as `**Label:** value`. Key implementation notes:

- Each hidden field is wrapped in its own `<div>` so fields appear on separate lines (not dot-joined on one line).
- Cell values are read via `innerHTML` (not `textContent`) so links and other interactive elements inside hidden cells remain fully functional inside the detail row. Hidden cells whose `innerHTML` is empty are skipped entirely (not shown as "—"), preventing noise from columns like Media that have content in only some rows.
- Columns whose `<th>` carries a `data-detail-exclude` attribute are excluded entirely from the detail row, regardless of whether their cells contain content. Use this for columns whose purpose is already implied on mobile (e.g. a Media column where the gallery auto-expands on row tap).
- If a `<tr>` carries a `data-bs-gallery="<id>"` attribute, tapping to expand also shows the Bootstrap Collapse element with that id (and hides it again on collapse). On desktop, the gallery starts collapsed and is toggled by a visible "View Photos" button (hidden on mobile via `d-none d-md-inline`) that uses Bootstrap's `data-bs-toggle="collapse"`. The script listens for Bootstrap `shown.bs.collapse` / `hidden.bs.collapse` events to sync `aria-expanded` on the parent row, keeping the table-hover highlight in sync with disclosure state.
- Tapping the expanded row a second time removes the detail row.
- Resizing to desktop width (≥ 768 px) auto-collapses all open detail rows and their associated galleries.
- Clicks on `<a>` or `<button>` elements inside a row pass through to their default handlers and do **not** trigger row expansion.

**Regression guards** — two layers prevent regressions:
- `tests/perf-hints.sh` — static grep checks that `table-responsive` wrappers and column-hiding patterns are present in each affected file.
- `tests/mobile-table.spec.js` — Playwright tests that verify no horizontal overflow on **every** page at both mobile (375 px) and desktop (1024 px) viewports, plus per-page column-visibility assertions, and row-expand behaviour (tap to expand, per-field `<div>` lines, gallery auto-expand, tap to collapse, desktop no-expand guard).
