#!/usr/bin/env bash
# Design system rule 4 (docs/4-design-system/rules.md): font, colour and spacing values come from
# --lb-* tokens. Checks only lines added since the last commit (and new CSS files), so template CSS
# that predates the design system is not flagged. lineupTokens.css is the one place for values.
# Exit 2 lists the violations; used by the Stop hook in .claude/settings.json.

cd "$(git rev-parse --show-toplevel)" || exit 0

px='^\s*(font-size|line-height|letter-spacing|margin(-[a-z]+)?|padding(-[a-z]+)?|gap|row-gap|column-gap)\s*:[^;]*\b([2-9]|[1-9][0-9]+)px'
colour='^\s*(color|background(-color)?|border(-[a-z]+)?(-color)?|outline(-color)?|fill|stroke)\s*:[^;]*(#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\()'
weight='^\s*font-weight\s*:\s*[0-9]'

found=$(
  {
    # file<TAB>line for every added line in tracked CSS
    git diff -U0 HEAD -- 'src/*.css' ':(exclude)src/styles/lineupTokens.css' |
      awk '/^\+\+\+ b\//{f=substr($0,7); next} /^\+/{print f "\t" substr($0,2)}'
    # every line of new, untracked CSS files
    git ls-files --others --exclude-standard -- 'src/*.css' |
      while read -r f; do sed "s|^|$f	|" "$f"; done
  } | while IFS=$'\t' read -r file line; do
    if printf '%s\n' "$line" | grep -qE "$px|$colour|$weight"; then
      printf '%s: %s\n' "$file" "$line"
    fi
  done
)

if [ -n "$found" ]; then
  echo "Raw values found; use --lb-* tokens (docs/4-design-system/tokens.md):" >&2
  echo "$found" >&2
  exit 2
fi
exit 0
