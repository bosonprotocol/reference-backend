#!/usr/bin/env bash

set -e
set -o pipefail

# Ensure AWS_S3_BUCKET_REGION environment variable is present
if [ -z "$AWS_S3_BUCKET_REGION" ]; then
  echo >&2 'Error: missing AWS_S3_BUCKET_REGION environment variable.'
  exit 1
fi

# Ensure AWS_S3_ENV_FILE_OBJECT_PATH environment variable is present
if [ -z "$AWS_S3_ENV_FILE_OBJECT_PATH" ]; then
  echo >&2 'Error: missing AWS_S3_ENV_FILE_OBJECT_PATH environment variable.'
  exit 1
fi

echo "$PATH"
ls -la /usr/local
ls -la /usr/local/bin
ls -la /usr/local/aws

# Fetch and source env file
eval $(aws s3 cp \
    --sse AES256 \
    --region "$AWS_S3_BUCKET_REGION" \
    "$AWS_S3_ENV_FILE_OBJECT_PATH" - | sed 's/^/export /')

# Run service
node ./dist/app.js
