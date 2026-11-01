#!/usr/bin/env bash
# PreToolUse: transaction processes are deployed in Sharetribe; the files here must match them.
# Changes need Zoha's approval and a matching Sharetribe deploy (docs/1-product/business-rules.md).
path=$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty')
case "$path" in
  */ext/transaction-processes/*)
    echo "Blocked: $path is a Sharetribe transaction process. Ask Zoha first; the process must also be deployed in Sharetribe." >&2
    exit 2 ;;
esac
exit 0
