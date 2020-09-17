#!/bin/bash

set -e

request_body='{
  "headers": {
	"Content-Type": "application/json",
	"Authorization": "Basic dXNlcjp0ZXN0"
  },
  "body": "{ \"subject\": \"test notify '"${RANDOM}"'\", \"body\": \"test from sls\" }"
}'

sls invoke local --aws-profile serverless -d "${request_body}" -f notify

