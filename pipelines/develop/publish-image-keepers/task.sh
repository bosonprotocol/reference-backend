#!/usr/bin/env bash

[ -n "$TRACE" ] && set -x
set -e
set -o pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/../../.." && pwd )"
ROOT_DIR="$( cd "$PROJECT_DIR/.." && pwd )"

cd "$PROJECT_DIR"

echo "$GPG_KEY" | gpg --import -
git crypt unlock

mkdir build
aws sts assume-role \
    --role-arn "$PROVISIONING_ROLE_ARN" \
    --role-session-name CI \
    > build/session

AWS_ACCESS_KEY_ID="$(jq -M -r .Credentials.AccessKeyId build/session)"
AWS_SECRET_ACCESS_KEY="$(jq -M -r .Credentials.SecretAccessKey build/session)"
AWS_SESSION_TOKEN="$(jq -M -r .Credentials.SessionToken build/session)"

export AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN

export GIT_SHA="$(git rev-parse --short HEAD)"

cp "$ROOT_DIR/version/version" "$PROJECT_DIR/build/version"

./go "image_keepers:prepare[$DEPLOYMENT_TYPE,$DEPLOYMENT_LABEL]"

cp -R "build/images/keepers"/* "$ROOT_DIR/image-build-directory/"
