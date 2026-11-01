---
paths:
  - "src/**/*.css"
---

# CSS

- Font size, weight, line height, letter spacing, margin, padding, gap and colour use `--lb-*`
  tokens or existing template colour tokens. Allowed raw values: `0`, `1px` borders, `%`,
  `--borderRadius*`. A Stop hook (`scripts/check-tokens.sh`) fails on raw values in added lines.
- New values go into `docs/4-design-system/tokens.md` first, then `src/styles/lineupTokens.css`.
- Type comes from `lineupType.module.css` via `composes:`; components never set font properties.
- Mobile first. Breakpoints only from `src/styles/customMediaQueries.css`
  (`--viewportMedium` 768px, `--viewportLarge` 1024px). No tablet-only breakpoints.
- Class selectors only. Spacing between siblings with `gap` on the parent; children `margin: 0`.
