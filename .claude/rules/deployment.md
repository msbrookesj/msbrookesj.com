---
paths:
  - ".github/workflows/deploy.yml"
  - "README.md"
---

# Deployment

**This section is only relevant for local environments** — deploy commands (`gsutil`, `gcloud`) use absolute paths specific to the owner's Mac and are not available on Claude Code on the web.

Merging to `main` triggers an automatic deploy via `.github/workflows/deploy.yml`, which authenticates with GCP using the `GCP_SA_KEY` repository secret and runs the three-step deploy below.

**Manual deploy** (fallback or out-of-band) — run from the repository root with `gsutil rsync` to a Google Cloud Storage bucket:

```bash
/Volumes/Source/google-cloud-sdk/bin/gsutil -m rsync -r -d website/ gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gsutil -m cp -z "html,css,js,webmanifest" website/404.html website/about.html website/academic.html website/athlete.html website/index.html website/license.html website/professional.html website/site.webmanifest gs://b1ryan.com/ && \
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
