# Prompt: home page (logged in), UI-only redesign

Design approved Oct 14, 2026. Copy everything below the line into a new Claude Code session in
`web-template/`. Run part 1, read the answer, then paste part 2 in the same session.

---

## Part 1: read the code and report (no changes)

Read-only task. **Do not edit any file.**

Read first, in this order:

1. `.claude/README.md` (how the docs fit together)
2. `.claude/design-system-rules.md`, especially **rule 10: nothing outside the design system, no
   guessing, no assuming**
3. `.claude/working-rules.md`
4. `.claude/home-page.md` (the spec and the decisions)
5. `.claude/design/home-page.html` (the approved design; use the User and State toolbar to see
   every state, View for Desktop / iPad 768 / Mobile)
6. `.claude/design/components.html#item-rows` (the new item rows)
7. `.claude/layouts.md` (Centered · wide) and `.claude/tokens.md`
8. `AGENTS.md`

Then read `src/containers/CMSPage/CMSPage.js`, `CMSPage.module.css`, `CMSPage.duck.js` and the shared
pieces the design uses: `src/components/PageHeader`, `src/components/SectionCard`,
`src/containers/LandingPage/sections/StatusChip.js`, `src/styles/lineupTokens.css`,
`src/styles/lineupType.module.css`, `src/styles/lineupButtons.module.css`,
`src/styles/lineupLayout.module.css`.

Report back, briefly:

1. Every state `HomeNextSteps` can render (user type × condition) and what it shows: translation
   keys, link targets, buttons. Compare with the States table in `home-page.md` and list every
   difference.
2. Every visible word on the page and its key. Flag any text the design shows that the code does
   not have, or the other way round.
3. Which classes in `CMSPage.module.css` are used today, and which become unused after the redesign.
4. What the offer row does today (click, keyboard, Pay link, status logic), so it stays exactly the
   same.
5. Anything the design needs that the shared components, style files or tokens do not offer. List
   the gap; do not propose new values.
6. **Mismatches:** anything where the docs, the design file and the code disagree (a value, a
   name, a path, a rule). For each one, give both sides with file and line. Do not fix them.

---

## Part 2: build (after Zoha's go-ahead on part 1)

Change only `src/containers/CMSPage/CMSPage.js` (the render part of `HomeNextSteps`),
`CMSPage.module.css`, and the StatusChip move in step 1. **Keep all logic, conditions, keys, link
targets, data loading, and the order and limit of offers exactly as they are.** No new words or
translation keys. Mobile first. No tests, builds or linting (working-rules.md).

**Do not edit anything in `.claude/`.** The docs are being cleaned up in another session. If you
find a mismatch, finish the task the way the approved design shows, and list the mismatch at the
end under "Mismatches" (both sides, file and line).

1. **StatusChip to shared** (design-system-rules.md §4, Status chip): move it from
   `src/containers/LandingPage/sections/` to `src/components/StatusChip/`, export it from
   `src/components/index.js` in the existing import order, and point the landing page imports at
   it. The landing page must look exactly the same.
2. **Page header:** `PageHeader` with only a title, `Home.welcomeBack`. It replaces the
   `.welcomeBack` paragraph.
3. **Layout:** keep `composes: centered wide from '../../styles/lineupLayout.module.css'`. Replace
   the hand-written section padding (`28px`, `32px`) so content starts at `--lb-page-top` and ends
   with `--lb-page-bottom`. Page header, cards and groups are spaced by the `centered` gap (32px).
4. **Under review** (not approved): one `SectionCard` without a title, holding one action row.
5. **What's next:** `SectionCard` with the title `Home.whatsNext` and no number. One action row per
   item the code renders today.
6. **Your activity:** `SectionCard` with the title `Home.activityTitle` and no number. One link row
   per transaction. Keep the row's `role="link"`, `tabIndex`, `onClick`, `onKeyDown` and the Pay
   `NamedLink` exactly. Status: `StatusChip`, with the tone from the table in `home-page.md`.
   **The price is always at the right end of the row**, with the chip just before it, and Pay on
   its own line under the row (see "Offer row" in `home-page.md`).
7. **Item rows:** build them exactly as `components.html#item-rows` and the design-system-rules.md
   table describe (one card per group, 1px rule between rows, `--lb-row-pad`), as classes in
   `CMSPage.module.css` composed from the shared type and button files.
8. **Buttons:** every row button, including "Pay", uses the shared secondary class from
   `lineupButtons.module.css`: full width on phones, auto width from 768px.
9. **Removed looks:** purple borders, card shadows, 12px radius and the yellow/green pills go (see
   "Removed looks" in `home-page.md`).
10. **CSS:** only tokens and shared classes (`composes:`). Remove the classes nothing uses any more.
    Hover styles go inside `@media (hover: hover)`.
11. **All set, no offers (DJ):** read decision 4 in `home-page.md`. If it says "Status: approved",
    add the condition described there so the "Keep your public profile up to date" row shows. If
    it says "Status: open", leave the logic as it is.

If something is missing, unclear, or contradicts the design, **stop and ask Zoha**. Check at 375,
768, 1024 and 1280px with a DJ and an event organizer account.

When done, reply with a few bullets: the files changed, anything left to do, and the "Mismatches"
list.
