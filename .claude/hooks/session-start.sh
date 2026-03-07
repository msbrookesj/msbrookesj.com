#!/usr/bin/env bash
# SessionStart hook — sets up the environment for Claude Code sessions.
#
# Detects whether we are running locally or on Claude Code on the web
# (CLAUDE_CODE_REMOTE=true) and adjusts accordingly.

set -euo pipefail

# --- Environment detection ---------------------------------------------------

if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then
  # Running on Claude Code on the web — install test dependencies
  # because the cloud container starts fresh each session.
  echo "Remote session detected — installing test tooling..."

  if [ -f package.json ]; then
    npm install --prefer-offline --no-audit --no-fund 2>/dev/null
    npx playwright install --with-deps chromium 2>/dev/null
  fi

  echo "Remote session setup complete."
else
  # Running locally — assume dependencies are already installed.
  # Verify node_modules exists as a courtesy check.
  if [ -f package.json ] && [ ! -d node_modules ]; then
    echo "Local session: node_modules/ missing — run 'npm install' to set up test tooling."
  fi
fi
