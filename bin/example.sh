#!/bin/bash

set -e

# This is an example of how to use this endpoint from BASH.

# Check for expected environment variables
[[ -z "${BRK_NOTIFY_URL}" ]] && echo "BRK_NOTIFY_URL must be defined" && exit 1
[[ -z "${BRK_NOTIFY_USER}" ]] && echo "BRK_NOTIFY_USER must be defined" && exit 1
[[ -z "${BRK_NOTIFY_PASSPHRASE}" ]] && echo "BRK_NOTIFY_PASSPHRASE must be defined" && exit 1

# Check parameters
function usage {
	echo "Usage: $(basename ${0}) [subject] [body]"
	exit 1
}

[[ -n "${1}" ]] || usage
[[ -n "${2}" ]] || usage

# Build authorization header
BRK_NOTIFY_AUTH="Basic $(echo -n "${BRK_NOTIFY_USER}:${BRK_NOTIFY_PASSPHRASE}" | base64)"

curl -v -X POST \
	-H "Content-Type: application/json" \
	-H "Authorization: ${BRK_NOTIFY_AUTH}" \
	-d '{ "subject": "'"${1}"'", "body": "'"${1}"'" }' \
	"${BRK_NOTIFY_URL}"

