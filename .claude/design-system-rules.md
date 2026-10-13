# LineupBridge design system rules

Oct 12, 2026 · Zoha Fard

This is the baseline for the LineupBridge redesign. Every page that gets redesigned follows it, so the app speaks one visual language: the same titles, cards, fields, buttons and states everywhere. Read this before any UI work.

## 1. Rules for every redesign

1. **No new words.** Design files (HTML), specs and coding prompts use only text that already exists in the app (translations, labels and placeholders in code, hosted content). **The live wording is the Console translations (`translations.json` hosted asset), which override `src/translations/en.json`.** Check a key there before quoting it; `en.json` is only the fallback. A new word, label, section or piece of content needs Zoha's approval first. Example data in mockups (a DJ name, a venue) is marked as an example.
2. **No new content, only UI.** A redesign changes how existing content looks and is arranged. It does not add fields, sections, claims or features.
3. **Same component, same look.** A select, an input, a card title or a button looks identical on every page. If a page needs something the library does not have, the library is extended first (here and in the UI library page), then used.
4. **Tokens only.** Font sizes, weights, line heights, letter spacing, colors and spacing come from `--lb-*` tokens. No raw values in component CSS (exceptions: `0`, `1px` borders, `%`, `--borderRadius*`, and one approved one: the focus ring, which is the token `--lb-focus-ring: 0 0 0 3px rgba(0,0,0,.08)` defined once in `lineupTokens.css`).
5. **Icons.** Use `lucide-react` for new icons (import the named icon, for example `ChevronDown`). Do not draw icons as CSS or data-URI SVGs. One approved exception: social brand icons use the shared `SocialIcon` component, whose paths are copied from the template's SVGs (lucide has none).
6. **Mobile first.** Base styles are for phones; larger layouts use `--viewportMedium` (768px) and `--viewportLarge` (1024px).
7. **Three design widths.** Every page design has three views: **Mobile** (390px frame, checked at 375px), **iPad 768** and **Desktop** (1280px). There is no separate iPad landscape design: from 1024px a page uses the desktop design (the 1024 token step only makes the title and lead larger). Do not add tablet-only breakpoints.
8. **Selection is an outline, not a fill.** Checkboxes, selected tiles, section numbers and the selected day in a calendar show selection with a black border (and a black tick or bold text), never a solid black fill. Solid black is only for the primary button.
9. **Do not edit shared template components to restyle one page.** Style them through the class props they accept, using the shared style files below.
10. **Nothing outside the design system. No guessing, no assuming.** Every component, token, type role, spacing value, layout, icon and word must come from this file, [tokens.md](tokens.md), [layouts.md](layouts.md), the UI library (`design/components.html`) or an approved page design. If something a task needs is not there, stop and ask Zoha before building it. Do not invent a value, pick a close one or carry on with an assumption. Once Zoha decides, the answer is added to these docs (and the UI library) first, then built.

## 2. Sources of truth

| What | File | Format |
| --- | --- | --- |
| Rules, components, architecture | `.claude/design-system-rules.md` (this file) | Markdown |
| Token values: type scale, spacing, colors | `.claude/tokens.md` | Markdown |
| How Claude works on UI tasks (smallest change, no tests or builds) | `.claude/working-rules.md` | Markdown |
| What every component looks like, in every state | `.claude/design/components.html` · [online](https://claude.ai/artifact/GJyu2Jxse3cqF5RCiqXzmk) | HTML, open in a browser |
| Page layouts: Centered and Split, which page uses which | `.claude/layouts.md` · `.claude/design/layouts.html` | Markdown + HTML |
| Page designs | `.claude/design/<page>.html` | HTML |
| Page specs and implementation steps | `.claude/<page>.md` | Markdown |

Current page designs: [landing-page.html](design/landing-page.html) (spec: `implementation-plan.md`) and [offer-builder-page.html](design/offer-builder-page.html) (spec: [offer-builder-page.md](offer-builder-page.md)), log in / sign up in [layouts.html](design/layouts.html) (spec: [auth-page.md](auth-page.md)), and the footer in [footer.html](design/footer.html) (spec: [footer.md](footer.md)).

**Order of change:** design file and this document first, then token or style files, then components. Never the other way round.

## 3. Foundations

- **Font:** the system font (`--lb-font`: San Francisco, Segoe UI, Roboto). Two weights only: 400 for text, 600 for titles, labels and buttons. The logo is an image (Times New Roman MT bold italic) and is not part of the type system.
- **Colors:** existing template tokens only. Page `--colorPageBackground` (beige `#eeede9`), cards `--colorWhite`, ink and primary buttons `--colorBlack`, secondary text `--colorGrey700`, muted text `--colorGrey600`, borders `--colorGrey200` (inputs) and `--colorGrey100` (cards, rules), error `--colorFail` with `--colorFailSubtle` fill, success `--colorSuccess`. One dark surface exists: the landing page band in black.
- **Type roles:** `.display`, `.h2`, `.h3`, `.leadLarge`, `.lead`, `.body`, `.small`, `.eyebrow`, `.label`, `.fieldLabel`, `.button`. Sizes and line heights are in the typography spec.
- **Spacing:** 4px steps (`--lb-space-1` … `--lb-space-10`).
- **Radius:** 4px (`--borderRadiusMedium`) for inputs, buttons and tiles; 8px for cards.

## 4. Component library

Each component below is drawn, with all its states, in the UI library page. The "Code" column says what it is built on.

### Page structure

| Component | Anatomy and rules | Code |
| --- | --- | --- |
| **Page header** | Optional image (64px square, 8px radius) on the left · optional eyebrow (an existing label, such as the DJ's name) · title in `.h2` · optional lead in `.lead`. Gaps: eyebrow → title 12px, title → lead 12px, header → content 32px. Sits on the page background, never in a card. | New shared `PageHeader` |
| **Section card** | White card, 1px border, 8px radius, padding 24px → 32px from 768px. Title row: number in a 28px circle with a 1px black outline and black text, no fill (only when sections are a real sequence, such as form steps) + `.h3` title + 1px rule underneath with 16px below the title. Content below with 24px between fields. The title is optional: without a title there is no title row and no rule (for example the log in and sign up card). Cards stack 16px → 24px apart. | New shared `SectionCard` |
| **Footer** | Logo (24px high, `--lb-logo-footer`) + slogan · FAQ, Contact us · rule · copyright + legal links · social icons. Built in code; only the social links come from Console. Spec: [footer.md](footer.md), design: `design/footer.html`. | New `Footer` in `FooterContainer` |
| **Content card** (landing) | White card without a number or rule, for cards that are not form sections (stage cards, audience cards). Same border, radius and padding as the section card. | Existing landing components, moved to shared when a second page needs them |

### Form fields

All fields share one anatomy: **label → 8px → control → 8px → helper or error**.

| Component | Rules | Code |
| --- | --- | --- |
| **Label** | `.fieldLabel` (15px → 16px, 600, black). Optional fields add "(optional)" in 400 muted grey, using the existing wording. Groups use a `<legend>` in the same style. | `labelClassName` on Field components |
| **Text input** | 48px high, 16px text (never smaller: iOS zooms below 16px), padding 0 16px, 1px `--colorGrey200` border, 4px radius, white. Placeholder in light grey, always the existing placeholder text. | `FieldTextInput` + `inputRootClass` |
| **Input with unit** | Text input with the unit inside the box on the right, in muted grey ("hours", "€"). The inner text box must shrink (`flex: 1 1 0; width: 0; min-width: 0`) so it never overflows a narrow column. | Shared `.inputWithUnit` class |
| **Select** | The native `<select>`, styled as the text input with one `lucide-react` icon (16px, black outline, true 2px stroke via `strokeWidth={2} absoluteStrokeWidth`, not clickable) on the right, inside `.selectBox`: `ChevronsUpDown` for long lists (hours, duration hours), `ChevronDown` for short ones (minutes, yes/no, set slot). The icon sits at the same place in **every** select (16px from the right edge, box padding-right 48px), so yes/no and set slot selects look exactly like the time selects; no extra space after the icon. The global `select` arrows are switched off with `background-image: none`. Empty option is the existing "Select…" text, in placeholder grey. | `SelectField` (like `FieldSelect`, adds the chevron) + `selectClassName` |
| **Textarea** | Same box, min height 112px, padding 12px 16px, resizes vertically. | `FieldTextInput type="textarea"` |
| **Date** | Same box as the text input with the lucide `Calendar` icon (16px, black) where the select chevron sits; the whole box opens the calendar. Calendar popup under the field: white, 1px border, 8px radius, as wide as the field (max 360px); header with `ChevronLeft` / `ChevronRight` (44px, existing "Previous month" / "Next month" labels) and the month; weekdays 12px muted, Monday first; days 40px. Selected day: 1px black outline, 600. Today: 600 + underline. Value format, placeholder and behaviour unchanged. Error: red box and red icon. | `SingleDatePicker` restyled through `inputClassName` / `popupClassName` (replace its data-URI calendar icon) |
| **Checkbox tiles** | Each option is a 44px tile with a 1px border and the checkbox inside; the whole tile is clickable; checked tile gets a black border. The checkbox itself is outlined, not filled: 18px, 1px `--colorGrey600` border, 3px radius, white; checked = black border + lucide `Check` (14px, black, 2px stroke). 1 column (stacked) on phones, 3 columns from 768px. | New shared `CheckboxTileGroup` (FieldCheckboxGroup does not pass classes to each option) |
| **Time select** | One label (a `<legend>`) over two selects side by side: hour `00`–`23` and minutes `00` / `30` (half hours only), with a muted ":" between them. 24-hour format. Saved value stays `HH:MM`. The hour box opens on the default from the code (23 for start times, 09 for end time). Error: both boxes red, one message under the pair. Used for every time field in the app (offer form, profile booking box, propose-changes window). | New shared `TimeSelect` (replaces `TimeSelectField` in `RequestQuoteForm`, the native time input on `ProfilePage`, and the time row in `ProposeChangesModal`) |
| **Duration select** | Same pair layout without the ":": hours `1`–`12` with the unit "hours" inside the box, and minutes `00` / `30` with the unit "min" inside the box. **"min" is a new word and needs approval. Half-hour durations also change data (see open items).** | `TimeSelect` duration variant |
| **Phone number** | One `<fieldset>` with the label "Phone number" as its `<legend>`, then one row: country select (104px) + 8px + number input (rest of the row), the same row pattern as the time select. **No placeholder.** The country select is the native `<select>` laid invisibly over a box that shows only the dial code ("+31") and the select chevron; the open list shows "Netherlands +31" for every country, names in the current language. Default Netherlands. Saved value: `+` dial code and digits in one string (`+31612345678`). Error: both boxes red, one message under the row. | New shared `PhoneNumberField` (replaces `FieldPhoneNumberInput` in `UserFieldPhoneNumber`, sign up only) with `src/translations/countryDialCodes.js` |
| **Helper text** | `.small` in muted grey, under the control. Only existing helper texts. | Shared `.helper` class |
| **Field rows** | Pairs (`.row2`) or threes (`.row3`) from 768px, one column on phones, 24px gaps. Pair fields that belong together; threes only for short values (dates, times, duration). Field order follows the code. | Shared `.row2`, `.row3` classes |

**Field states**

| State | Look |
| --- | --- |
| Default | Grey border, white fill |
| Hover | Slightly darker border |
| Focus | Black border plus a soft 3px ring (`0 0 0 3px rgba(0,0,0,.08)`). Replaces the template's blue focus color |
| Filled | Default look with black text |
| Error | `--colorFail` border, `--colorFailSubtle` fill, error message in `--colorFail` `.small` under the control, replacing the helper. Message = the existing validation text. The message is always shown; color is never the only signal |
| Disabled | `--colorGrey100` fill and border, grey text, not-allowed cursor |

### Actions and status

| Component | Rules | Code |
| --- | --- | --- |
| **Primary button** | Filled black, white text, 48px, padding 0 24px, 4px radius, `.button` (15px, 600). One per view, the main action. Full width in forms on phones, auto width (min 200px) from 768px. Loading keeps the size and shows a spinner (existing `inProgress`). Disabled: grey fill, grey text. | `PrimaryButton` + shared class |
| **Secondary button** | Outlined black, black text; fills black on hover. The alternative action. | `SecondaryButton` + shared class |
| **Ghost button** | Light grey border, transparent; for icon or minor actions. | Shared class |
| **Text link** | 14px, 600, black, underlined (offset 3px). | Shared class |
| **Footer link** | 14px, 600, black, no underline; underlined (offset 3px) on hover. 44px tall. Footer only (FAQ, Contact us). | Shared class `.linkFooter` |
| **Muted link** | 14px, 400, `--lb-text-muted`; black and underlined on hover. 44px tall. Footer legal links. | Shared class `.linkMuted` |
| **Social icon** | 20px (`--lb-icon-social`), muted, black on hover, 44px square tap area, `aria-label` = platform name. Paths copied from the template's SVGs in `PageBuilder/Primitives/Link/Icons` with a `viewBox` added so they scale (the template files have none and stay untouched). Approved exception to rule 5: lucide has no brand icons. | New shared `SocialIcon` |
| **Hero search** | One white bar, max 520px (`--lb-width-search`), 1px `--colorGrey100` border, `--borderRadiusMedium`, 4px inner padding and gap, shadow `--lb-shadow-search`. Keyword input without its own border, 16px text, existing placeholder. Primary button inline on the right at every width. Focus: the bar's border turns black. Landing hero only. | `HeroSearch` in `LandingPage/sections` |
| **Status chip** | Pill, 12px 600, dot before the text. Variants: neutral (beige), active (black outline), success (green). Labels only from the app's translations. | Move `StatusChip` from `LandingPage/sections` to shared |

## 5. Front-end architecture

The goal: every page uses the same tokens, the same type classes and the same field styles, from one place.

```
src/styles/
  lineupTokens.css          # all --lb-* tokens on :root (moved from LandingPage/landingTokens.module.css)
  lineupType.module.css     # type role classes (moved from LandingPage/landingType.module.css)
  lineupForm.module.css     # field, label, input, inputWithUnit, select, textarea, helper, error, row2, row3
  lineupButtons.module.css  # primary, secondary, ghost, link
src/components/
  PageHeader/               # PageHeader.js + .module.css (+ .example.js for the styleguide)
  SectionCard/
  CheckboxTileGroup/
  TimeSelect/               # time and duration variants
  PhoneNumberField/         # country select + number input
  StatusChip/               # moved from LandingPage/sections
  SocialIcon/               # social brand icons (template paths + viewBox), 20px
  index.js                  # export the new components, keeping the existing import order
```

How it is wired:

1. **Tokens:** `lineupTokens.css` (no `font-family` on `:root`, so the app font does not change; `.landingDark` stays in the landing folder) is imported once in `src/styles/marketplaceDefaults.css`, right after `typography.css`. The `--lb-` prefix does not clash with any template token, so defining them on `:root` changes nothing on other pages until a page uses them. The landing page then uses these instead of its own copy (values unchanged).
2. **Type and form styles:** components and pages use `composes: h3 from '../../styles/lineupType.module.css';` and pass `lineupForm.module.css` classes into the existing Field components through their props (`rootClassName`, `labelClassName`, `inputRootClass`, `selectClassName`).
3. **Shared components:** new ones live in `src/components/` like every other shared component (see `AGENTS.md`), with props for content and no hardcoded text. Text always comes from translations passed in by the page.
4. **Validation stays as it is.** Field components keep Final Form validation and `ValidationError`; only their look changes. The Field components do not accept a class for `ValidationError`, so the template's `ValidationError` look stays (`--colorFail`, 13px). The error look on the control (red border, pale red fill) comes from the form: it computes `(meta.touched || submitFailed) && meta.invalid` per field and passes `inputRootClass` / `selectClassName` with the shared `.inputError` class. Shared components we build (`CheckboxTileGroup`, `TimeSelect`) use the shared `.error` class on their message.

## 6. Known limitations

1. **All `--fontWeight*` and `--fontFamilyHeading` tokens are broken app-wide** (they point at themselves in `marketplaceDefaults.css` lines 91–101). Use `--lb-weight-*` and `--lb-font`. Fixing the global lines is a separate decision because every heading in the app would turn weight 300.
2. **Global element styles** give every `h1`–`h6`, `p`, `label`, `input`, `select` and `textarea` its own sizes, margins, padding, a `#d8dce6` border and a blue focus color. The shared classes reset these explicitly.
3. **PageBuilder primitives** (`Heading`, `P`, `Text`) carry their own type (weights 800/bold, auto hyphenation). Do not use them in redesigned UI.
4. **Hosted content** (Console) can change text and, on some pages, fields. Layouts must cope with any length or count.

## 7. Review checklist (every page)

- [ ] Every visible word exists in the app, or Zoha approved it.
- [ ] Only components from this library; any new one was added to the library first.
- [ ] No raw font, color or spacing values in the page's CSS.
- [ ] Error states use the existing validation messages.
- [ ] Design has Mobile, iPad 768 and Desktop views (no separate 1024 design).
- [ ] Works at 375px, 768px, 1024px and 1280px with no horizontal scroll; touch targets at least 44px.
- [ ] Shared template components were not edited.

## 8. Open items

- [ ] Decide when to move the landing tokens to `src/styles/lineupTokens.css` (step 1 of the offer builder implementation does it).
- [ ] Decide whether to fix the broken global font-weight tokens.
- [ ] Approve the unit word "min" for the duration minutes box (no word for minutes exists in the app yet; "hour" and "hours" do).
- [ ] Approve half-hour durations as a data change: `durationHours` is a whole number today (validation: integer of at least 1) and is used in `RequestQuoteForm`, `RequestQuotePage`, `ProfilePage`, `TransactionPage`, `OfferDetailsCard`, `ListingPage.shared` and `BookingDatesForm`. Allowing 30 minutes is not UI-only.
- [ ] Confirm the duration range 1–12 hours (today there is no maximum).
