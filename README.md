To publish...
/Volumes/Source/google-cloud-sdk/bin/gsutil -m rsync -r -d -x "^\.git/|^README\.md$|^CLAUDE\.md$|^\.claude/|^\.gitignore$" ./ gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gsutil -m cp -z "html,css,js" about.html academic.html athlete.html index.html office.html professional.html gs://b1ryan.com/ && \
/Volumes/Source/google-cloud-sdk/bin/gsutil -m cp -r -z "css,js" bootstrap-css/ bootstrap-3.3.5-dist/css/ bootstrap-3.3.5-dist/js/ bootstrap-dep/ assets/font-awesome/css/ gs://b1ryan.com/
