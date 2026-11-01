---
name: new-component
description: Add or change a LineupBridge design-system component, docs first. Use when a page needs a component, variant or state the library does not have yet.
---

Order: docs → library page → code → review. Stop and ask Zoha at any point where the docs do not
answer a question.

1. **Check it is missing.** Search `docs/4-design-system/rules.md` section 4 and
   `src/components/` for an existing component or variant that fits. Prefer extending one.
2. **Write the entry** in `rules.md` section 4: anatomy, sizes as tokens, states, the text it shows
   (existing keys only), and what code it is built on.
3. **Draw it** in `docs/4-design-system/components.html` with every state (default, hover, focus,
   error, disabled, loading) at phone and desktop width.
4. **New values** go into `docs/4-design-system/tokens.md` and `src/styles/lineupTokens.css`.
5. **Build** in `src/components/<Name>/` following `.claude/rules/components.md`. Export it from
   `src/components/index.js`. Add `<Name>.example.js` for the styleguide.
6. **Test** the states with a small `<Name>.test.js` (React Testing Library, as in
   `src/components/**/*.test.js`), then `CI=true yarn test <Name>`.
7. **Review:** run the `design-system-reviewer` and `a11y-reviewer` agents on the diff and fix what
   they report, or list why not.

Report: files changed, the doc entries added, review findings left open.
