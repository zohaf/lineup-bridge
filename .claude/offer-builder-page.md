# Offer builder page ("Complete your offer"): UI spec

Oct 12, 2026 · Zoha Fard

UI-only redesign of the organizer's offer page, `RequestQuotePage` (`/l/:slug/:id/request-quote`, `src/containers/RequestQuotePage/`). **Approved layout: one column.** Follow [design-system-rules.md](design-system-rules.md) for every component and [tokens.md](tokens.md) for every value.

- Design: [design/offer-builder-page.html](design/offer-builder-page.html) · [online](https://claude.ai/artifact/XKpHMhTuJLA1Z2P2TNrzCz) (use the "Errors" toggle for error states; "View" switches Desktop, iPad 768 and Mobile)
- Component states: [design/components.html](design/components.html)

## Scope

- **Changes:** layout, typography, cards, field styling, error styling, button styling.
- **Does not change:** any text, translation key, field, field name, field order, validation, submit logic, data loading or the transaction flow. No new translation keys are needed.
- **Not touched:** `TopbarSimplified`, shared Field components' own files, other pages.

## Page structure (top to bottom)

| # | Element | Content (existing) | Component |
| --- | --- | --- | --- |
| 1 | Simplified topbar | Logo | `TopbarSimplified`, unchanged |
| 2 | Page header | Listing image (first image, 64px square) · eyebrow: listing title as a link to the listing page (from `HeadingDetails`) · title: `RequestQuotePage.heading` "Complete your offer" · lead: `RequestQuotePage.helperText` | `PageHeader` |
| 3 | Section card 1 | `RequestQuoteForm.sectionEventDetails` "Event details" | `SectionCard number={1}` |
| 4 | Section card 2 | `RequestQuoteForm.sectionSetDetails` "Set details" | `SectionCard number={2}` |
| 5 | Section card 3 | `RequestQuoteForm.sectionFeeLogistics` "Fee and logistics" | `SectionCard number={3}` |
| 6 | Section card 4 | `RequestQuoteForm.sectionTechnicalSetup` "Technical setup", plus the "Additional note (optional)" textarea at the end of this card | `SectionCard number={4}` |
| 7 | Submit | `ErrorMessage`, then `PrimaryButton` "Send offer" (`RequestQuotePage.submitButtonText`) | Primary button |

- **Removed from this page's render:** `DetailsSideCard` (desktop right panel) and `MobileListingImage`. Their content (image and listing title) now lives in the page header. The component files stay. The listing image is always present (first image), so there is no fallback.
- The price line in `HeadingDetails` only shows when a listing has a price; DJ listings have none, so it is not part of the header.
- Content column: max width 760px, centered; page side padding `--lb-gutter`. Built on
  `LayoutCentered variant="form"` ([layouts.md](layouts.md)): content starts one gutter below the
  topbar (24px, 32px from 768px), 64px bottom padding. The simplified topbar is static (not sticky).

## Fields per card (order unchanged from the code)

| Card | Row | Fields |
| --- | --- | --- |
| 1 Event details | 2 columns | Venue name · Location (city) |
| | 1 column | Event name (optional) |
| | 2 columns (one used) | Event date (date field + calendar popup, see below) |
| | 2 columns | Event start time (time select) · Event end time (time select) |
| | 2 columns (one used) | Expected attendance |
| 2 Set details | 2 columns (one used) | Set slot (select) |
| | 2 columns | Set start time (time select) · Set duration (duration select) |
| | 2 columns | Previous DJ (helper) · Headliner (helper) |
| 3 Fee and logistics | 1 column | Proposed fee (input with unit "€", helper) |
| | 2 columns | Travel included (select, helper) · Accommodation included (select, helper) |
| 4 Technical setup | 1 column | Deck setup (checkbox tiles, 1 → 3 columns; outlined checkboxes, no black fill) |
| | 2 columns (one used) | Booth monitors available (select) |
| | 1 column | Additional note (optional) (textarea) |

All rows are one column on phones. Error messages are the existing validation texts (for example "Venue name is required.", "Fee is required.", "Select at least one deck setup option.").

## Tablet (iPad)

iPad uses the same one-column page as phone and desktop. Nothing is added, moved or reworded; only
the existing breakpoints apply. The design has one iPad view (768); 1024px and up uses the desktop
design (design-system-rules.md rule 7).

| Width | Device | What applies |
| --- | --- | --- |
| below 768px | phones, iPad Split View / Slide Over narrow windows | phone layout: one column rows, deck tiles stacked, full-width button |
| 768–1023px | iPad portrait (768, 810, 820, 834px) | `--viewportMedium` step: 32px gutter and page top, 72px topbar, card padding 32px, cards 24px apart, `.h2` 34px, `.lead` 17px, field labels 16px. Rows in 2 columns, deck tiles in 3 columns, button auto width (min 200px, left). The column fills the width minus the gutters (704px at 768). |
| 1024px and up | iPad landscape (1024, 1180px), iPad Pro portrait (1024px), desktop: uses the Desktop design | `--viewportLarge` step: `.h2` 40px, `.lead` 18px (already in `lineupTokens.css`). Column stops at 760px and is centered. Everything else as 768. |

- **No tablet-only CSS.** Use only `@media (--viewportMedium)` and `@media (--viewportLarge)` through
  the `--lb-*` tokens and shared classes. Do not add a separate tablet breakpoint.
- **Touch:** inputs and selects stay 48px, deck tiles 44px, button 48px. Input text stays 16px so
  iPad Safari does not zoom into fields. Selects and the date field use the native iPad pickers.
- **Hover only with a pointer:** wrap hover styles (eyebrow link underline, primary button hover) in
  `@media (hover: hover)` so a tap on iPad does not leave a hover look behind. A mouse or trackpad on
  iPad still gets hover.
- **Keyboard:** when a field gets focus and the on-screen keyboard opens, the field must stay
  visible (the topbar is static, so the browser's own scrolling is enough; no fixed elements at the
  bottom).

## Selects, date and checkboxes (fixes from design review, Oct 12)

- **Selects:** Set slot, Travel included, Accommodation included and Booth monitors available use the
  same select box as the time selects: chevron 16px from the right edge, no extra space after it.
  All selects in this form go through one shared select style (`SelectField` / `.selectBox`).
- **Event date:** keep the existing `SingleDatePicker` (popup calendar), restyled as the "Date" row in
  design-system-rules.md: `Calendar` icon on the right instead of its grey icon on the left, calendar card
  under the field. Placeholder "Select date", value format, validation ("Event date is required.")
  and the saved value stay the same.
- **Deck setup checkboxes:** outlined, never filled black (design-system-rules.md rule 8). Checked = black
  border + black `Check` icon on white.

## Time and duration fields

- Every time field is a **time select**: hour `00`–`23` + minutes `00` / `30`, half hours only (design-system-rules.md, "Time select"). Today the form offers minutes 00/15/30/45; :15 and :45 go.
- **Set duration** becomes a **duration select**: hours `1`–`12` ("hours") + minutes `00` / `30` ("min").
- **Needs Zoha's approval before building the duration minutes box:**
    - the new unit word "min";
    - half-hour durations, which change data: `durationHours` is a whole number and is used on six other pages and components (list in design-system-rules.md, open items). Until approved, build the duration hours box only and keep whole hours.
- Decisions (Oct 12): keep the "(optional)" on Previous DJ and Headliner as in the code; add the translation key `RequestQuotePage.listingTitle` = `{listingTitle}` (en, de, es, fr) for the eyebrow, the only new key; `HeadingDetails` supplies the eyebrow link and its price line is not styled.
- Error look: computed in the form per field and passed through `inputRootClass` / `selectClassName` (see design-system-rules.md); `PrimaryButton` gets `--colorPrimaryButton: var(--colorBlack)` in the shared primary class so the loading state is not green.
- The saved time value format (`HH:MM`) does not change, so time selects are UI-only.

## Implementation steps

Do one step at a time and stop for a visual check on localhost after each. No tests, builds or linting (see `working-rules.md`).

### Step 1: shared foundation

- [ ] Create `src/styles/lineupTokens.css` with the full `--lb-*` token block on `:root` (values from the typography spec), plus the form tokens: `--lb-size-field-label` 15px → 16px from 768px, `--lb-size-input` 16px, `--lb-input-height` 48px, `--lb-label-gap` = `--lb-space-2`, `--lb-field-gap` = `--lb-space-5`.
- [ ] Import it in `src/styles/marketplaceDefaults.css` right after `typography.css`.
- [ ] Move `landingType.module.css` to `src/styles/lineupType.module.css` and add `.fieldLabel`. Point the landing page imports to the new paths; the landing page must look exactly the same.
- [ ] Create `src/styles/lineupForm.module.css` and `src/styles/lineupButtons.module.css` with the classes listed in design-system-rules.md section 4, matching the UI library page.

### Step 2: shared components

- [ ] `src/components/PageHeader/` (image, eyebrow, title, lead; all content via props).
- [ ] `src/components/SectionCard/` (number, title, children).
- [ ] `src/components/CheckboxTileGroup/` (Final Form checkbox group with tile styling; same props and validation as `FieldCheckboxGroup`).
- [ ] `src/components/TimeSelect/` (hour + minute selects, minutes 00/30, value `HH:MM`, `defaultHour` and `allowEmpty` props as in the current `TimeSelectField`; duration variant with units). Use it for the three time fields in this form; other pages adopt it in their own redesign.
- [ ] Export all three from `src/components/index.js`, keeping the import order.

### Step 3: page layout

- [ ] `RequestQuotePage.js`: one column; render `PageHeader` with the listing's first image, the listing title link as eyebrow, the heading and the helper text. Stop rendering `DetailsSideCard` and `MobileListingImage` here.
- [ ] `RequestQuotePage.module.css`: replace the two-column layout with the centered 760px column and token spacing.

### Step 4: form

- [ ] `RequestQuoteForm.js`: wrap each section in `SectionCard` (numbers 1–4) and move the additional-note textarea into card 4. Arrange fields in rows as in the table above.
- [ ] Pass the shared classes to every Field component (`labelClassName`, `inputRootClass`, `selectClassName`, `rootClassName`); the duration and fee shells use `.inputWithUnit`; deck setup uses `CheckboxTileGroup`.
- [ ] `RequestQuoteForm.module.css`: remove the old field styles that the shared classes replace.

### Step 5: submit and states

- [ ] Submit area: `ErrorMessage` then `PrimaryButton` with the shared primary class; full width on phones, auto (min 200px) from 768px.
- [ ] Check error states on submit with empty required fields: red border, pale red fill, message under the field.

- [ ] Check on iPad sizes (browser dev tools or a real iPad): 768 and 820px, plus 1024 and 1180px (desktop design) and Split View (half width, phone layout). No horizontal scroll, no sticky hover after a tap.

**Done when** the page matches the design at 375px, 768px (iPad portrait), 1024px (iPad landscape) and 1280px, every word on it is unchanged, and the form still submits as before.
