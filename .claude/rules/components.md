---
paths:
  - "src/components/**"
---

# Shared components

- A new or changed component is in `docs/4-design-system/rules.md` (section 4) and
  `docs/4-design-system/components.html` first, with every state, then in code.
- One folder per component: `Name.js`, `Name.module.css`, optional `Name.example.js`. Export from
  `src/components/index.js` in the existing import order.
- Props for content; no hardcoded text. Text comes from translations passed in by the page.
- Styles only from `src/styles/lineup*.module.css` (`composes:`) and `--lb-*` tokens.
- States to cover: default, hover (inside `@media (hover: hover)`), focus (`--lb-focus-ring`),
  error, disabled, loading where it applies.
- Accessible by default: native elements first, labels or `aria-label` from existing text, 44px
  touch targets, visible focus, colour never the only signal.
- Do not edit a template component to restyle one page; add an optional class prop instead.
