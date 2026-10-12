# LineupBridge landing page: Stage 1 and Stage 2 implementation plan

Oct 11, 2026 · Zoha Fard

Source doc (editable, with comments): https://claude.ai/code/artifact/c96adb8d-de29-4e7a-9f18-8cd903f6a639

## Summary

Stage 1 puts all five landing page sections in place: the existing hero gets one new line, and sections 2 to 5 are built in code. Stage 2 then audits typography, spacing and fonts across the whole landing page against the master design.

- **Master design:** [LineupBridge Master Design](https://claude.ai/artifact/8YF3uoR4bNHeov7YaRhQGb). Sections 1 and 2 follow direction B; sections 3, 4 and 5 follow direction A.
- **Scope:** the landing page (`/`) only, in `web-template/`.
- **Out of scope for both stages:** the app header (topbar), the app footer, the booking-interface snippets (offer card mock-ups), and any backend, route or transaction-process change. The snippets are a later stage.

## Ground rules

These apply to every task in both stages.

1. **Do not touch** the app header, the app footer, or the existing hero. The only hero change is one new line under the search input: "New here? Sign up as a DJ · Sign up as an organizer".
2. **Mobile first.** Base styles target phones (from 320px). Larger layouts are added with `@media (--viewportMedium)` (768px) and `@media (--viewportLarge)` (1024px) from `src/styles/customMediaQueries.css`. No horizontal scroll at any width, touch targets at least 44px.
3. **Reusable components.** Every repeated pattern (section shell, section header, list, card, FAQ item) is one small component with its own CSS module. Sections are assembled from these, not written as one-off markup.
4. **Existing stack only.** React, CSS modules, React Intl, existing tokens from `src/styles/marketplaceDefaults.css`, existing `NamedLink` for links. No new libraries.
5. **All copy through translations.** Keys go in `src/translations/en.json`, `de.json`, `es.json` and `fr.json`.
6. **No tests run.** Plain UI work only. Review happens visually in the browser.
7. **Consistent spacing.** The gap between eyebrow, heading, lede and content is the same in every new section, set once in the shared section header (details under Technical strategy).

## Technical strategy

The new sections plug into the existing PageBuilder as custom section types, so the hosted hero keeps rendering exactly as today and the page still renders on the server (SSR).

**How the sections get on the page**

- PageBuilder already accepts `options.sectionComponents` (see `SectionBuilder.js`). `LandingPage.js` passes four new types: `landingValue`, `landingSteps`, `landingAudiences` and `landingFaq`.
- The section configs live in code in a new `landingSections.js`, the same way `howItWorksSection` does today. Final order: hosted hero, then sections 2 to 5.
- `LandingPage.js` keeps only the hosted hero and drops the other hosted sections ("Why LineupBridge?" and "Start your LineupBridge experience"), matched by `sectionId`. The page then shows exactly five sections even before those are deleted in Console.
- The existing code-defined `howItWorksSection` (5-column version) is replaced by the new section 3.
- The hero line: the landing page maps `hero` to a small `LandingHero` that renders the same `SectionContainer` and `Field`s with the same classes as `SectionHero`, plus one line after the search field. The original `SectionHero` file is not edited, so other pages are unaffected.

**Reusable components** (new folder `src/containers/LandingPage/sections/`, each with its own `.module.css`)

| Component | What it does | Used in |
| --- | --- | --- |
| `LandingSection` | Section shell: background (`page` beige or `dark` black), max width, vertical padding | 2, 3, 4, 5 |
| `SectionHeader` | Eyebrow, heading, lede; `align="center"` or `"left"`; owns the header spacing | 2, 3, 4, 5 |
| `StatusChip` | Small status pill (neutral, active, success) | 2, 3 |
| `StageCard` | White card with number, chip, title, text | 2 |
| `StepList` | Numbered list with ruled rows and a role chip | 3 |
| `CheckList` | Ruled list with tick marks | 4 |
| `AudienceCard` | White card: eyebrow, title, text, `CheckList`, button | 4 |
| `FaqList` | Native `<details>/<summary>` accordion, keyboard accessible, no library | 5 |
| `SignupLinks` | "New here? Sign up as a DJ · Sign up as an organizer" using `NamedLink` to `SignupForUserTypePage` (`/signup/dj`, `/signup/organizer`) | 1 |

**Styling approach**

- Landing tokens are declared once on the `.landingPage` root in `LandingPage.module.css` (spacing scale and type sizes from the master design) and built on existing tokens: `--colorPageBackground`, `--colorWhite`, `--colorBlack`, `--colorGrey100`–`700`, `--colorSuccess`, `--borderRadiusMedium`.
- The positional selectors that turn the *second* section black (`section:nth-of-type(2)`) are removed, since section 2 is now a code component that sets its own dark background. The hero's `section:first-child` rules stay untouched.
- Class selectors only, mobile-first, breakpoints from `customMediaQueries.css`, as `AGENTS.md` requires.
- Imports follow the repo's order (external, config/util, `../../components`, parent, same directory) to avoid circular dependencies.

## Stage 1: build the five sections

We work one step at a time, and you review each step in the browser before the next one starts. Yes, we start with the backgrounds: step 1 puts empty section shells in place so the page structure and colors are right before any content goes in.

### Step 1: scaffolding and backgrounds

- [ ] Create `landingSections.js` and the `sections/` folder with `LandingSection` and `SectionHeader`.
- [ ] Register the four section types through `options.sectionComponents` in `LandingPage.js`.
- [ ] Keep only the hosted hero; drop the hosted "Why LineupBridge?" and "Start your LineupBridge experience" sections and the old code-defined How it works.
- [ ] Remove the `nth-of-type(2)` black-section CSS; add the landing tokens on `.landingPage`.
- [ ] Render sections 2 to 5 as shells: correct background (2 = black, 3 to 5 = beige), padding and section header only.

**Done when:** the page shows hero, black band, then three beige sections, then the existing footer, on phone and desktop.

### Step 2: section 2, Why LineupBridge (direction B)

- [ ] Build `StatusChip` and `StageCard`.
- [ ] Centered white header on black; four white stage cards: Offer, Negotiation, Confirmed, Paid.
- [ ] Layout: one column on phones, two columns from 768px, four columns from 1024px.
- [ ] Copy from your notes once you paste them; draft copy from the master design until then.

### Step 3: section 3, How it works (direction A)

- [ ] Build `StepList`.
- [ ] Five numbered steps with ruled rows and a role chip (Organizer, DJ, Both).
- [ ] Phones: header above the list. From 768px: header on the left (about 4/11), list on the right (about 7/11).

### Step 4: section 4, Get started (direction A)

- [ ] Build `CheckList` and `AudienceCard`.
- [ ] Two white cards. DJ card: filled black button to `/signup/dj` plus a link to the DJ profile guidelines page. Organizer card: outlined button to `/signup/organizer`.
- [ ] Phones: stacked. From 768px: side by side, equal height, buttons aligned at the bottom.

### Step 5: section 5, FAQ (direction A)

- [ ] Build `FaqList` on native `<details>/<summary>`; first item open by default.
- [ ] Phones: header above the list. From 768px: header left, questions right, same split as section 3.
- [ ] Four confirmed questions from the master design; the fees and cancellation question stays out until you give the facts.

### Step 6: hero line

- [ ] Build `SignupLinks` and `LandingHero`; centered under the search input, matching the master design.
- [ ] Nothing else in the hero changes.

**Stage 1 is done when** all five sections render in the right order with the right backgrounds and layouts at 375px, 768px and 1280px, every link goes where it should, and the header and footer are unchanged.

## Stage 2: typography and spacing consistency

Stage 2 makes every text style and gap on the landing page follow **[landing-typography.md](landing-typography.md)**, the single source of truth. Font decision (Oct 12, 2026): the **system font** (San Francisco, Segoe UI, Roboto), weights 400 and 600 only. The logo stays an image in Times New Roman MT bold italic.

**Tasks** (in order; follow the spec, not this list, for values)

- [x] Create `src/containers/LandingPage/landingTokens.module.css` from the token block in the spec and compose it on `.landingPage`; `.landingDark` is applied on the section 2 header.
- [x] Create `src/containers/LandingPage/landingType.module.css` with one class per text role (`.display`, `.h2`, `.h3`, `.leadLarge`, `.lead`, `.body`, `.small`, `.eyebrow`, `.label`, `.button`), each resetting margin and padding.
- [x] Replace the old `--landing*` tokens and every raw font or spacing value in `sections/` with `composes:` and `--lb-*` tokens.
- [x] Replace every `var(--fontWeight…)` in `sections/` with `var(--lb-weight-…)` (the global weight tokens are broken; see the spec's limitations).
- [x] Move sibling spacing to `gap` on parents; children get `margin: 0`.
- [ ] Hero: build it in code as a `landingHero` section (spec, "Build the hero in code too"), reusing `SearchCTA`; move hero copy to translations; remove the `section:first-child` overrides. *Needs your go-ahead, since hero text then leaves Console.*
- [x] Check buttons: 48px high, `--borderRadiusMedium`, `.button` type.
- [ ] Check colors: only existing tokens (beige `#eeede9`, white, black, greys, success green).
- [ ] Review at 375px, 768px, 1024px and 1280px; fix any wrap, overflow or alignment issue.

**Stage 2 is done when** no file in `src/containers/LandingPage/` sets a font size, weight, line height, letter spacing, margin, padding or gap with a raw value outside `landingTokens.module.css`.

## Open items

- [ ] Paste your notes for the Why LineupBridge section so we can shape the four stages.
- [ ] Give the real fees and cancellation terms, or confirm the FAQ ships with four questions.
- [ ] Confirm the hosted sections 2 and 4 are dropped in code now and deleted in Sharetribe Console later.
- [ ] Translations: German, Spanish and French copy, or English placeholders in `de/es/fr.json` until you have them.
- [ ] `LandingPage.test.js` references the old How it works section and may fail after Stage 1. Since no tests run in Stage 1, decide when to update it.
