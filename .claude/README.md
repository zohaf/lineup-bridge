# How the design docs work

Oct 14, 2026 · map of `web-template/.claude/`. Start here, then read the files in the order below.

## The system in one picture

```
RULES (what is allowed)           design-system-rules.md  ← top: rule 10, no new words, tokens only
  ├─ VALUES (numbers)             tokens.md               → code: src/styles/lineupTokens.css
  ├─ FRAMES (page layouts)        layouts.md              → code: src/styles/lineupLayout.module.css
  ├─ PARTS (components, states)   design/components.html  → code: src/components/*, src/styles/lineup*.module.css
  └─ HOW CLAUDE WORKS             working-rules.md
PAGES (one set per page)
  ├─ design/<page>.html           what it looks like (the approved picture)
  ├─ <page>.md                    the spec: content, keys, states, decisions, open items
  └─ <page>-prompt.md             the coding prompt that builds it
BACKLOG                           bugs.md
```

Each level only uses the level above it: a page uses only components, layouts and tokens that
already exist. Something new goes into the upper level first (doc + `components.html`), then into
code, then into the page. That is the "order of change" in design-system-rules.md.

## Where the spacing and design system live

| What | Doc (source of truth) | Code (same names) |
| --- | --- | --- |
| Font, type scale, text colors | `tokens.md` | `src/styles/lineupTokens.css` (`--lb-size-*`, `--lb-leading-*`), classes in `src/styles/lineupType.module.css` |
| Spacing scale (4px steps) and spacing roles (gutter, card padding, card gap, row padding) | `tokens.md` "Spacing scale", "Spacing rules" | `lineupTokens.css` (`--lb-space-1…10`, `--lb-gutter`, `--lb-card-pad`, …) |
| Page widths, page top/bottom, split columns | `layouts.md` §2 | `lineupTokens.css` + `lineupLayout.module.css` (`.centered .narrow/.form/.wide`) |
| Fields, buttons, links | `design-system-rules.md` §4 | `lineupForm.module.css`, `lineupButtons.module.css` |
| Components | `design-system-rules.md` §4 + `design/components.html` | `src/components/` (`PageHeader`, `SectionCard`, `TimeSelect`, `CheckboxTileGroup`, `SiteHeader`, `SocialIcon`, `LayoutCentered`) |
| Breakpoints | `design-system-rules.md` rule 6–7 | `src/styles/customMediaQueries.css` (768, 1024) |

## Files

| File | Kind | Role |
| --- | --- | --- |
| `design-system-rules.md` | rules | The constitution: 10 rules, sources of truth, foundations, component table, architecture, review checklist |
| `tokens.md` | values | Every type and spacing value |
| `layouts.md` | frames | Centered (narrow 440 / form 760 / wide 920) and Split (nav / summary); which page uses which |
| `working-rules.md` | process | Smallest change, no tests or builds, ask instead of guessing |
| `design/components.html` | picture | UI library: every component in every state |
| `design/layouts.html` | picture | The layouts, plus log in / sign up / after sign up |
| `design/offer-builder-page.html` + `offer-builder-page.md` | page | Complete your offer (the reference page) |
| `design/landing-page.html` + `implementation-plan.md` | page | Landing `/` |
| `design/header.html` + `header.md` + `header-prompt.md` | page part | Header (stage 0, guest bar) |
| `design/header-journey.html` + `header-height-prompt.md` | page part | Header audit, every scenario, migration plan; stage 1 prompt |
| `design/footer.html` + `footer.md` + `footer-prompt.md` | page part | Footer |
| `design/content-pages.html` | page | Console pages (FAQ, terms) as collapsible cards |
| `design/home-page.html` + `home-page.md` + `home-page-prompt.md` | page | Logged-in home (approved Oct 14) |
| `auth-page.md` | page spec | Log in / sign up (design is in `layouts.html`) |
| `hero-prompt.md` | prompt | Landing hero in code |
| `design/brand/brand-guide.html` + `design/brand/logo/` | brand | **Logo and brand spec (Oct 17)**: logo font, spacing, clear space, header placement, colour codes, type scale; logo SVG and PNG files for marketing |
| `design/final-options-logo-landing.html` | page part | Landing with the final logo and header, with rulers (header 60, side 16/32, cap 16, −0.01em) |
| `design/logo-font-study.html`, `logo-sample.png` | study | Logo font research, not a spec |
| `business-rules.md` | rules | Product decisions; links topic docs (`negotiation-flow.md`) |
| `bugs.md` | backlog | Bugs and cleanup outside the redesign |
| `landing-page.md` | old | An old task note (moving the plan doc); can be deleted |
| `launch.json` | tooling | Preview servers (`design` serves this folder on port 8765) |

## How the HTML designs are built

Every `design/*.html` file is one self-contained page with the same frame: a dark toolbar (state,
View = Desktop 1280 / iPad 768 / Mobile 390, Tags on/off), a container-query frame so the views
behave like real widths, a `.page` block that copies the `--lb-*` tokens, and yellow tags that are
notes for the builder (never part of the UI). Every visible word is existing app copy; example data
is marked as such.

## Inconsistencies found (Oct 14)

Fixed Oct 14:

1. `tokens.md` "stay in sync" pointed at the landing token files; it now points at
   `src/styles/lineupTokens.css` and `lineupType.module.css`.
2. `components.html` said the section number sits in a filled black circle; it now says outlined,
   as rule 8 and the code have it.
3. Header height: `offer-builder-page.md`, `offer-builder-page.html` and `layouts.html` used 72px
   from 768px; now 60px at every width, as in `header.md`.
4. `design-system-rules.md` "Current page designs" now lists `content-pages.html` and the home page.

Still open:

5. The current step in the step menu (`layouts.md`) is a black filled circle, which conflicts with
   rule 8. Marked in `layouts.md`; decide with the DJ profile builder redesign.
6. Token values are copied into every `design/*.html`. Rule added to `tokens.md` (update the design
   files after a token change). Removing the copies needs one shared `design/tokens.css`, which is
   not done yet.
7. `landing-page.md` is an old task note and can be deleted (ask Zoha).
