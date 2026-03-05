To publish...
/Volumes/Source/google-cloud-sdk/bin/gsutil -m rsync -r -d -x "^\.git/|^README\.md$|^CLAUDE\.md$|^\.claude/|^\.gitignore$" ./ gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gsutil -m cp -z "html,css,js" about.html academic.html athlete.html index.html office.html professional.html gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gsutil -m cp -r -z "css,js" bootstrap-css/ bootstrap-3.3.5-dist/css/ bootstrap-3.3.5-dist/js/ bootstrap-dep/ assets/font-awesome/css/ gs://b1ryan.com/

Verify no excluded files leaked to the bucket:
/Volumes/Source/google-cloud-sdk/bin/gsutil ls gs://b1ryan.com/.git/ gs://b1ryan.com/README.md gs://b1ryan.com/CLAUDE.md gs://b1ryan.com/.gitignore gs://b1ryan.com/.claude/ 2>&1 | grep -q "matched no objects" && echo "OK: no excluded files in bucket" || echo "WARNING: excluded files found in bucket — remove them manually"
