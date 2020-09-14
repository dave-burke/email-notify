#!/bin/bash

set -e

request_body='{
  "headers": [
	"Content-Type: application/json"
  ],
  "body": "{ \"subject\": \"test notify '"${RANDOM}"'\", \"body\": \"test from sls\", \"passphrase\": \"test\" }"
}'

sls invoke local --aws-profile serverless -d "${request_body}" -f notify

