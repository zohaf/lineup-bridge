# Move the landing page plan doc, then implement Stage 1 step by step

## Context
The Stage 1 / Stage 2 implementation plan already exists at `web-template/docs/landing-page/implementation-plan.md` (untracked). The user wants it moved into `web-template/.claude/` and then implemented one step at a time, pausing after each step so they can check localhost before the next one.

## Actions
1. Move the doc: create `web-template/.claude/`, `mv` the file there, remove the empty `docs/landing-page` and `docs/` folders. Nothing else references the old path (verify with grep).
2. Re-read the moved doc and follow its ground rules (don't touch topbar/footer/hero, mobile-first, reusable components, translations in en/de/es/fr, no new libraries, no tests run).
3. Implement **Step 1 only** (scaffolding and backgrounds): `landingSections.js`, `sections/LandingSection` + `SectionHeader`, register the four section types via `options.sectionComponents` in `LandingPage.js`, keep only the hosted hero, drop hosted "Why LineupBridge?" / "Start your LineupBridge experience" and the old code-defined How it works, remove the `nth-of-type(2)` black rule, add landing tokens, render shells for sections 2-5.
   - Build on the existing uncommitted changes in `LandingPage.js`, `LandingPage.module.css`, `SectionBuilder.module.css`, `LandingPage.test.js`; do not overwrite them blindly.
4. Start/confirm `yarn dev` (needs `.env`; I will not read its values), then **stop and ask the user to check http://localhost:3000** at phone and desktop widths before Step 2.
5. Repeat for Steps 2-6, then Stage 2, each gated by the user's localhost check.

## Verification
Visual check by the user on localhost after every step; `yarn format-ci` on touched files at the end of each step. Existing hero search, signup links, topbar and footer must remain unchanged.
