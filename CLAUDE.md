# LineupBridge

DJ booking marketplace on the Sharetribe Web Template (React 18, Redux Toolkit, Final Form, Express
SSR). `AGENTS.md` is Sharetribe's coding guide for the template; read it before changing app code.
Product, design system and page specs: `docs/` (start at `docs/README.md`).

## Commands

```sh
yarn dev                         # app + API at http://localhost:3000 (needs .env from `yarn config`)
CI=true yarn test <pattern>      # one test file or pattern, once
yarn test-server                 # server tests
yarn format                      # Prettier (CI runs `yarn format-ci`)
```

Branches: work on a feature branch → `dev` (deploys to staging) → `main` (deploys to live).

## How to work here

- Read the spec for the area first: `docs/3-journeys/` or `docs/5-pages/`, then
  `docs/4-design-system/rules.md`. If something the task needs is not in the docs, stop and ask
  Zoha. Do not invent a value, a word or a rule.
- Order of change: docs → tokens and shared styles (`src/styles/lineup*`) → components → pages.
- **No new words.** UI text comes from the app; live Console translations override `en.json`.
- Smallest change for the task. No unrelated refactors. Ask before adding a dependency.
- Business rules and Sharetribe's process are separate. Never change one to fit the other without
  approval; `ext/transaction-processes/` is blocked by a hook.
- When done: run the reviewer agents that fit the change (`design-system-reviewer`,
  `spec-reviewer`, `a11y-reviewer`) and `CI=true yarn test <pattern>` for changed components; check
  the page at 375, 768, 1024 and 1280px. Summarize files changed and open items in a few bullets.

## Docs control

- A doc exists only in `docs/<stage>/` and in the index in `docs/README.md`.
- Prompts, plans and explorations are working files: `.claude/work/` (gitignored).
- Every spec starts with: date · status (draft / approved / built) · design · code.

## Gotchas

- `--fontWeight*` and `--fontFamilyHeading` are broken app-wide; use `--lb-weight-*`, `--lb-font`.
- Hosted Console config overrides local config (`src/util/configHelpers.js`).
- Page data loads in `{Page}.duck.js` `loadData`, never in `useEffect` (SSR).
- Keep upstream Sharetribe files mergeable: style template components through their class props.
