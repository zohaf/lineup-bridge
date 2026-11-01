#!/usr/bin/env bash
# PostToolUse: format each edited JS/CSS file with the project's Prettier (same scope as `yarn format`).
path=$(jq -r '.tool_input.file_path // empty')
case "$path" in
  *.js|*.jsx|*.ts|*.tsx|*.css)
    [ -f "$path" ] && "$CLAUDE_PROJECT_DIR/node_modules/.bin/prettier" --write "$path" >/dev/null 2>&1 ;;
esac
exit 0
