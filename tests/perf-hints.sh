#!/usr/bin/env bash
# Regression guard for mobile PageSpeed optimizations.
# Fails if any required performance hints are missing or any forbidden
# patterns are present.  Run via: npm run test:perf-hints

set -euo pipefail

FAIL=0

ALL_PAGES=(
  website/index.html
  website/about.html
  website/professional.html
  website/academic.html
  website/athlete.html
  website/404.html
  website/license.html
)

# Pages where the sidebar image (col-md-4) stacks below a full column of
# text on mobile, placing it well off-screen at load time.
SUBPAGES=(
  website/about.html
  website/professional.html
  website/academic.html
  website/athlete.html
  website/404.html
)

pass() { printf "  ok  %s: %s\n" "$1" "$2"; }
fail() { printf "FAIL  %s: %s\n" "$1" "$2"; FAIL=1; }

check_present() {
  local file=$1 pattern=$2 desc=$3
  if grep -qE "$pattern" "$file"; then
    pass "$file" "$desc"
  else
    fail "$file" "$desc"
  fi
}

check_absent() {
  local file=$1 pattern=$2 desc=$3
  if ! grep -qE "$pattern" "$file"; then
    pass "$file" "$desc"
  else
    fail "$file" "$desc"
  fi
}

echo "=== Performance hint regression checks ==="
echo ""
echo "-- All pages --"
for page in "${ALL_PAGES[@]}"; do
  # Bootstrap JS must be deferred so it does not block the HTML parser.
  check_present "$page" \
    'bootstrap\.bundle\.min\.js[^>]*defer' \
    'Bootstrap JS has defer attribute'

  # Preloading the Font Awesome webfonts breaks the CSS→font dependency
  # chain that PageSpeed flags as a critical request tree.
  check_present "$page" \
    'rel="preload"[^>]*fa-brands-400\.woff2' \
    'Font Awesome brands font is preloaded'
  check_present "$page" \
    'rel="preload"[^>]*fa-solid-900\.woff2' \
    'Font Awesome solid font is preloaded'

  # Font Awesome CSS must be loaded async (rel=preload as=style with onload
  # swap) so it does not block the initial render on mobile.
  check_present "$page" \
    'rel="preload"[^>]*fontawesome\.min\.css[^>]*as="style"' \
    'Font Awesome CSS loaded async (fontawesome.min.css)'
  check_present "$page" \
    'rel="preload"[^>]*brands\.min\.css[^>]*as="style"' \
    'Font Awesome CSS loaded async (brands.min.css)'
  check_present "$page" \
    'rel="preload"[^>]*solid\.min\.css[^>]*as="style"' \
    'Font Awesome CSS loaded async (solid.min.css)'
done

echo ""
echo "-- Sub-pages (below-fold sidebar images) --"
for page in "${SUBPAGES[@]}"; do
  # Sidebar images are below the fold on mobile; they must be lazy-loaded.
  check_present "$page" \
    'loading="lazy"' \
    'Below-fold sidebar image has loading=lazy'

  # fetchpriority=high on a below-fold image forces an eager high-priority
  # fetch that hurts mobile LCP.  Only index.html (hero image) is exempt.
  check_absent "$page" \
    'fetchpriority="high"' \
    'No fetchpriority=high on below-fold images'
done

echo ""
echo "-- athlete.html: mobile table layout --"
# Tables must be wrapped in table-responsive to prevent horizontal scroll on mobile.
check_present "website/athlete.html" \
  'class="table-responsive"' \
  'Competition table wrapped in table-responsive'

# Non-essential columns must carry d-none d-md-table-cell so they collapse on
# narrow screens.  Without this the table is too wide to fit a phone viewport.
check_present "website/athlete.html" \
  'd-none d-md-table-cell' \
  'Non-essential table columns hidden on mobile (d-none d-md-table-cell)'

echo ""
echo "-- academic.html: mobile table layout --"
# All four course history tables must be wrapped in table-responsive.
check_present "website/academic.html" \
  'class="table-responsive"' \
  'Course history tables wrapped in table-responsive'

# The Instructor column (4th) is hidden via CSS nth-child in theme.css rather
# than per-cell d-none classes (too many cells).  Verify the rule exists.
check_present "website/css/theme.css" \
  'nth-child\(4\)' \
  'Academic Instructor column hidden on mobile via CSS nth-child (theme.css)'

echo ""
echo "-- license.html: mobile table layout --"
check_present "website/license.html" \
  'class="table-responsive"' \
  'Dependencies table wrapped in table-responsive'

echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "All checks passed."
else
  echo "$FAIL check(s) failed."
fi
exit "$FAIL"
