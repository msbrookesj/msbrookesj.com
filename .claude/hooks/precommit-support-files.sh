#!/usr/bin/env bash
# PreToolUse hook (matched on Bash) — fires before every Bash tool call.
# Checks whether the command is a "git commit" and, if so, verifies that
# supporting files have been updated according to the table in CLAUDE.md.
#
# Receives the tool input JSON on stdin.  Extracts the command field and
# exits 0 (no-op) immediately if it is not a git commit.
#
# "Since the last evaluation" is tracked via a marker file that stores the
# last commit SHA this hook approved.  On each run the hook only inspects
# commits after that marker (plus staged changes).  If no marker exists the
# hook falls back to comparing against origin/main.

set -euo pipefail

# --- Gate: only run for git commit commands -------------------------------

input=$(cat)
command=$(echo "$input" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_input',{}).get('command',''))" 2>/dev/null || true)

# Exit silently if this is not a git commit
if ! echo "$command" | grep -qE '^\s*git\s+commit\b'; then
  exit 0
fi

MARKER_FILE=".claude/.precommit-last-evaluated"

# --- Determine the base commit to diff against ----------------------------

if [ -f "$MARKER_FILE" ]; then
  LAST_EVAL=$(cat "$MARKER_FILE")
  # Verify the commit still exists (could be gone after a rebase)
  if git rev-parse --verify "$LAST_EVAL^{commit}" >/dev/null 2>&1; then
    BASE="$LAST_EVAL"
  else
    BASE=$(git merge-base HEAD origin/main 2>/dev/null || echo "origin/main")
  fi
else
  BASE=$(git merge-base HEAD origin/main 2>/dev/null || echo "origin/main")
fi

# --- Collect all changed files (committed since base + staged) ------------

committed_files=$(git diff --name-only "$BASE" HEAD 2>/dev/null || true)
staged_files=$(git diff --cached --name-only 2>/dev/null || true)
all_changed=$(printf '%s\n%s' "$committed_files" "$staged_files" | sort -u | grep -v '^$' || true)

if [ -z "$all_changed" ]; then
  # Nothing changed — save marker and exit
  git rev-parse HEAD > "$MARKER_FILE" 2>/dev/null || true
  exit 0
fi

# --- Helper: check whether a file appears in the changeset ----------------

changed() {
  echo "$all_changed" | grep -qF "$1"
}

# --- Collect warnings -----------------------------------------------------

warnings=""

warn() {
  warnings="${warnings}  - $1\n"
}

# --- 1. HTML page added or removed ----------------------------------------
#     Trigger files: sitemap.xml, .lighthouserc.json, tests/perf-hints.sh,
#                    tests/mobile-table.spec.js, tests/screenshots.spec.js

added_html=$(echo "$all_changed" | grep -E '^website/[^/]+\.html$' || true)
if [ -n "$added_html" ]; then
  # Check for genuinely new or deleted pages (not just edits)
  new_pages=""
  removed_pages=""
  for f in $added_html; do
    # File exists in working tree but not at base → new page
    if ! git show "$BASE:$f" >/dev/null 2>&1; then
      new_pages="$new_pages $f"
    fi
  done
  # Files that existed at base but are deleted now
  base_html=$(git ls-tree --name-only "$BASE" -- 'website/*.html' 2>/dev/null | grep -E '^website/[^/]+\.html$' || true)
  for f in $base_html; do
    if ! git ls-files --error-unmatch "$f" >/dev/null 2>&1 && ! git diff --cached --name-only | grep -qF "$f"; then
      removed_pages="$removed_pages $f"
    fi
  done

  page_change=$(echo "$new_pages $removed_pages" | xargs)
  if [ -n "$page_change" ]; then
    changed "website/sitemap.xml"          || warn "HTML page added/removed ($page_change) but website/sitemap.xml is not updated"
    changed ".lighthouserc.json"           || warn "HTML page added/removed ($page_change) but .lighthouserc.json is not updated"
    changed "tests/perf-hints.sh"          || warn "HTML page added/removed ($page_change) but tests/perf-hints.sh is not updated"
    changed "tests/mobile-table.spec.js"   || warn "HTML page added/removed ($page_change) but tests/mobile-table.spec.js is not updated"
    changed "tests/screenshots.spec.js"    || warn "HTML page added/removed ($page_change) but tests/screenshots.spec.js is not updated"
  fi
fi

# --- 2. Table added or removed -------------------------------------------
#     Trigger files: tests/perf-hints.sh, tests/mobile-table.spec.js

html_with_changes=$(echo "$all_changed" | grep -E '^website/.*\.html$' || true)
if [ -n "$html_with_changes" ]; then
  for f in $html_with_changes; do
    # Check if the diff for this file contains <table additions/removals
    table_diff=$(git diff "$BASE" HEAD -- "$f" 2>/dev/null; git diff --cached -- "$f" 2>/dev/null)
    if echo "$table_diff" | grep -qE '^\+.*<table|^-.*<table'; then
      changed "tests/perf-hints.sh"        || warn "Table added/removed in $f but tests/perf-hints.sh is not updated"
      changed "tests/mobile-table.spec.js" || warn "Table added/removed in $f but tests/mobile-table.spec.js is not updated"
      break  # One warning is enough
    fi
  done
fi

# --- 3. Third-party image added or removed --------------------------------
#     Trigger file: website/license.html

image_changes=$(echo "$all_changed" | grep -E '^website/assets/.*\.(jpg|jpeg|png|gif|webp|svg)$' || true)
if [ -n "$image_changes" ]; then
  changed "website/license.html"           || warn "Image(s) added/removed in website/assets/ but website/license.html is not updated (check if third-party)"
fi

# --- 4. Deploy workflow changed -------------------------------------------
#     Trigger file: README.md

if changed ".github/workflows/deploy.yml"; then
  changed "README.md"                      || warn ".github/workflows/deploy.yml changed but README.md is not updated"
fi

# --- 5. Convention / structural changes → CLAUDE.md -----------------------

convention_triggers=$(echo "$all_changed" | grep -E '(playwright\.config\.js|\.htmlvalidate\.json|\.lighthouserc\.json|\.lychee\.toml|\.github/workflows/)' || true)
if [ -n "$convention_triggers" ]; then
  changed "CLAUDE.md"                      || warn "Convention-related files changed but CLAUDE.md may need an update"
fi

# --- Output ---------------------------------------------------------------

if [ -n "$warnings" ]; then
  echo "SUPPORTING-FILE CHECK — the following files may need updating:"
  printf "$warnings"
  echo ""
  echo "If these are intentional omissions, proceed with the commit."
else
  # All clear — save the current HEAD as the last evaluated commit
  git rev-parse HEAD > "$MARKER_FILE" 2>/dev/null || true
fi
