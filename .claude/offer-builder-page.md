# Offer builder page ("Complete your offer"): UI spec

Oct 12, 2026 · Zoha Fard

UI-only redesign of the organizer's offer page, `RequestQuotePage` (`/l/:slug/:id/request-quote`, `src/containers/RequestQuotePage/`). **Approved layout: one column.** Follow [design-system.md](design-system.md) for every component and [landing-typography.md](landing-typography.md) for every value.

- Design: [design/offer-builder-page.html](design/offer-builder-page.html) · [online](https://claude.ai/artifact/XKpHMhTuJLA1Z2P2TNrzCz) (use the "Errors" toggle for error states)
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
- Content column: max width 760px, centered; page side padding `--lb-gutter`.

## Fields per card (order unchanged from the code)

| Card | Row | Fields |
| --- | --- | --- |
| 1 Event details | 2 columns | Venue name · Location (city) |
| | 1 column | Event name (optional) |
| | 2 columns (one used) | Event date |
| | 2 columns | Event start time (time select) · Event end time (time select) |
| | 2 columns (one used) | Expected attendance |
| 2 Set details | 2 columns (one used) | Set slot (select) |
| | 2 columns | Set start time (time select) · Set duration (duration select) |
| | 2 columns | Previous DJ (helper) · Headliner (helper) |
| 3 Fee and logistics | 1 column | Proposed fee (input with unit "€", helper) |
| | 2 columns | Travel included (select, helper) · Accommodation included (select, helper) |
| 4 Technical setup | 1 column | Deck setup (checkbox tiles, 2 → 3 columns) |
| | 2 columns (one used) | Booth monitors available (select) |
| | 1 column | Additional note (optional) (textarea) |

All rows are one column on phones. Error messages are the existing validation texts (for example "Venue name is required.", "Fee is required.", "Select at least one deck setup option.").

## Time and duration fields

- Every time field is a **time select**: hour `00`–`23` + minutes `00` / `30`, half hours only (design-system.md, "Time select"). Today the form offers minutes 00/15/30/45; :15 and :45 go.
- **Set duration** becomes a **duration select**: hours `1`–`12` ("hours") + minutes `00` / `30` ("min").
- **Needs Zoha's approval before building the duration minutes box:**
    - the new unit word "min";
    - half-hour durations, which change data: `durationHours` is a whole number and is used on six other pages and components (list in design-system.md, open items). Until approved, build the duration hours box only and keep whole hours.
- Decisions (Oct 12): keep the "(optional)" on Previous DJ and Headliner as in the code; add the translation key `RequestQuotePage.listingTitle` = `{listingTitle}` (en, de, es, fr) for the eyebrow, the only new key; `HeadingDetails` supplies the eyebrow link and its price line is not styled.
- Error look: computed in the form per field and passed through `inputRootClass` / `selectClassName` (see design-system.md); `PrimaryButton` gets `--colorPrimaryButton: var(--colorBlack)` in the shared primary class so the loading state is not green.
- The saved time value format (`HH:MM`) does not change, so time selects are UI-only.

## Implementation steps

Do one step at a time and stop for a visual check on localhost after each. No tests, builds or linting (see `rules.md`).

### Step 1: shared foundation

- [ ] Create `src/styles/lineupTokens.css` with the full `--lb-*` token block on `:root` (values from the typography spec), plus the form tokens: `--lb-size-field-label` 15px → 16px from 768px, `--lb-size-input` 16px, `--lb-input-height` 48px, `--lb-label-gap` = `--lb-space-2`, `--lb-field-gap` = `--lb-space-5`.
- [ ] Import it in `src/styles/marketplaceDefaults.css` right after `typography.css`.
- [ ] Move `landingType.module.css` to `src/styles/lineupType.module.css` and add `.fieldLabel`. Point the landing page imports to the new paths; the landing page must look exactly the same.
- [ ] Create `src/styles/lineupForm.module.css` and `src/styles/lineupButtons.module.css` with the classes listed in design-system.md section 4, matching the UI library page.

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

**Done when** the page matches the design at 375px, 768px and 1280px, every word on it is unchanged, and the form still submits as before.
