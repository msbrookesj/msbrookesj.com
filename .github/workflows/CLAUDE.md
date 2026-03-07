# CLAUDE.md — Screenshot Workflows

This file documents the requirements and design of the screenshot CI workflows. Read this when working on `.github/workflows/screenshots.yml` or `.github/workflows/screenshots-cleanup.yml`.

---

## Overview

Two workflows manage per-PR screenshot branches:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `screenshots.yml` | `push` to `main`, PR `opened`/`synchronize`/`reopened` | Capture full-page screenshots, push to a per-commit branch, update the PR description |
| `screenshots-cleanup.yml` | PR `closed` | Delete all screenshot branches for the PR |

---

## Branch Naming

Screenshot branches follow the pattern:

```
screenshots/pr-<PR_NUMBER>-<SHORT_SHA>
```

- `<PR_NUMBER>` — the pull request number.
- `<SHORT_SHA>` — first 7 characters of the commit SHA.

Every commit gets its own branch. Branches are **never deleted during the PR lifecycle** — only on PR close/merge. This preserves the full screenshot history for review.

---

## Race Condition Prevention

Multiple pushes to the same PR can trigger concurrent workflow runs. Three mechanisms prevent races:

### 1. Concurrency group (serialization)

```yaml
concurrency:
  group: screenshots-pr-<PR_NUMBER>
  cancel-in-progress: false
```

Runs for the same PR are **queued**, not cancelled. Every commit gets its screenshots captured and pushed. Only the description update is order-sensitive.

### 2. Commit-hash-suffixed branches (no push conflicts)

Each run pushes to its own uniquely-named branch (`screenshots/pr-N-<sha>`), so concurrent `git push` commands never collide.

### 3. HEAD-staleness guard (description update)

Before updating the PR description, the workflow checks whether `PR_HEAD_SHA` (set to `github.event.pull_request.head.sha`) still matches the PR's `headRefOid`. If a newer commit has been pushed since this run started, the description update is **skipped** — the newer run will write the final listing.

---

## PR Description Lifecycle

The workflow updates the PR description **twice per run**: once at the start (in-progress) and once at the end (final). Both updates use the same HTML comment marker (`<!-- screenshots-bot -->`) for idempotent replacement, and both apply the HEAD-staleness guard — if the commit is no longer HEAD, the update is skipped.

### 1. In-progress update (before screenshot capture)

Runs immediately after checkout, before `npm ci` / Playwright install. Lists all existing screenshot branches plus the current commit marked as in-progress:

```markdown
---
<!-- screenshots-bot -->
**Screenshots**

| Commit | Screenshots |
| ------ | ----------- |
| `abc1234` | [View](...) |
| **`def5678`** (HEAD) | :hourglass_flowing_sand: Capturing… |
```

### 2. Final update (after push)

Replaces the in-progress row with a link to the newly pushed branch:

```markdown
---
<!-- screenshots-bot -->
**Screenshots**

| Commit | Screenshots |
| ------ | ----------- |
| `abc1234` | [View](...) |
| **`def5678`** (HEAD) | [View](...) |
```

The HEAD commit's row is always bold. The in-progress step runs **before** the orphan checkout, so `gh` can still resolve the repo locally — but `-R` is passed anyway for consistency.

---

## Critical Implementation Details

### `gh` CLI needs `-R` after orphan checkout

The "Push screenshots" step runs `git checkout --orphan` which destroys the local git context. All `gh` CLI calls in the subsequent "Update PR description" step **must** pass `-R <owner/repo>` explicitly — without it, `gh` cannot resolve the repository and the edit silently fails or targets the wrong resource.

### `gh api` for branch enumeration

Branches are listed via:

```
gh api repos/<owner/repo>/git/matching-refs/heads/screenshots/pr-<N>-
```

This returns all refs matching the prefix. The short SHA is extracted from the branch name (last segment after the final `-`).

### Orphan branch for screenshots

Screenshots are pushed as orphan branches (no parent commit, no repo files — only the `screenshots/` directory). This keeps the branches lightweight and avoids polluting the repo's commit history.

### Never override built-in GitHub Actions env vars

GitHub Actions sets default environment variables like `GITHUB_SHA`, `GITHUB_REF`, etc. at the workflow level. Overriding these in a step's `env:` block may not take effect reliably — the built-in value can shadow the override, causing silent bugs.

**Concrete example:** For `pull_request` events, the built-in `GITHUB_SHA` is the **merge commit SHA**, not the PR head commit SHA. A previous version of this workflow set `GITHUB_SHA: ${{ github.event.pull_request.head.sha }}` in the step env, expecting it to override the built-in. It didn't — the staleness guard compared the merge commit SHA against `headRefOid` (the PR head), they never matched, and both PR description updates were silently skipped.

**Fix:** Use a custom env var name (e.g. `PR_HEAD_SHA`) that doesn't collide with any built-in. This applies to all GitHub Actions workflows, not just this one.

### Stale `screenshots` ref cleanup

A bare `screenshots` ref (without the `/pr-N-...` suffix) would cause a git namespace conflict (directory vs file). The push step proactively deletes any such ref before pushing.

---

## Cleanup Workflow

`screenshots-cleanup.yml` fires on PR close (merged or not). It uses `gh api matching-refs` to find all `screenshots/pr-<N>-*` branches and deletes each one via the GitHub API.

---

## Requirements Checklist

When modifying these workflows, verify:

- [ ] Every `gh pr` / `gh pr edit` call passes `-R $REPO`
- [ ] The concurrency group key includes the PR number (or `github.ref` for `main` pushes)
- [ ] `cancel-in-progress` is `false` — all commits must get screenshots
- [ ] The HEAD guard compares `PR_HEAD_SHA` (set to `github.event.pull_request.head.sha`) to `headRefOid` before **both** description updates (in-progress and final). **Do not** use the built-in `GITHUB_SHA` env var — for `pull_request` events it is the merge commit SHA, not the PR head, and overriding a built-in env var may not take effect reliably.
- [ ] The description marker (`<!-- screenshots-bot -->`) is used for idempotent replacement
- [ ] The cleanup workflow deletes using the `screenshots/pr-<N>-` prefix (not an exact branch name)
- [ ] Branch names use the 7-character short SHA (`${SHA::7}`)
