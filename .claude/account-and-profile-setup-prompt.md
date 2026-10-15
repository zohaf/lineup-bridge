# Prompt: account settings and public profile builder

Decided Oct 15, 2026. Copy everything below the line into a new Claude Code session in `web-template/`.
Run part 1 and read the answer. Then paste each build step from part 2 in the same session, one at a
time: one step = one commit, checked at 375, 768, 1024 and 1280px before the next.

---

## Part 1: read the code and report (no changes)

Read-only task. **Do not edit any file.**

Read first, in this order:

1. `.claude/README.md`
2. `.claude/design-system-rules.md`, especially **rule 10: nothing outside the design system, no
   guessing, no assuming**, and rule 9 (shared template components)
3. `.claude/working-rules.md`
4. `.claude/business-rules.md` (one person, one public profile; payout complete = Stripe verified)
5. `.claude/account-and-profile-setup.md` (the spec, gaps 1–17 and every decision)
6. `.claude/design/dj-setup.html` (the design: user DJ / event organizer, Default / Errors states;
   blue tags = approved changes) and `.claude/design/components.html` (sections from **Step menu**
   to **Saved card** are new)
7. `.claude/layouts.md` (Split · nav, Step menu) and `.claude/tokens.md`
8. `AGENTS.md`, `src/transactions/README.md`

Then read: `LayoutSplit`, `lineupLayout.module.css`, `lineupForm.module.css`, `PageHeader`, `SectionCard`,
`CheckboxTileGroup`, `PhoneNumberField`, `lineupModal.module.css`; `EditListingPage` and
`EditListingWizard/` (`EditListingWizard.js`, `EditListingWizardTab.js`, the Details, ListingFieldsStep
and Photos panels), `src/util/listingFieldWizardSections.js`, `CustomExtendedDataField`,
`FieldLocationAutocompleteInput`; `ContactDetailsPage`, `PasswordChangePage`, `ManageAccountPage`
(incl. `DeleteAccountForm`), `StripePayoutPage`, `PaymentMethodsPage`, `SavedCardDetails`,
`StripeConnectAccountForm`, `StripeConnectAccountStatusBox`, `StripePaymentAddress`,
`LayoutWrapperAccountSettingsSideNav`, `routeConfiguration.js`, `CMSPage.js` (Home payout banner),
`src/ducks/stripeConnectAccount.duck.js`.

Report back, briefly:

1. Every visible word in the design file, with its key and its **Console** value
   (`translations.json` hosted asset overrides `en.json`). Flag any text the design shows that the
   code does not have, and any key the design needs that does not exist yet.
2. For each of the 17 gaps: the files you would touch and the smallest way to do it. For gap 10, how
   `CustomExtendedDataField` can take the library styles (class props for input, label, error;
   multi-enum genre through `CheckboxTileGroup`) **without changing how other pages render it**.
3. Where the Stripe account (with `requirements`) is loaded today, and how Home and Account settings
   can know "Stripe verified" (= `stripeConnected` and no `past_due` / `currently_due` requirements,
   the same check `StripePayoutPage` uses) with the least extra loading. One shared helper.
4. Every link and redirect that points at `ContactDetailsPage`, `PasswordChangePage` or
   `ManageAccountPage` (for example `ModalMissingInformation`, `EmailVerificationInfo`, `UserCard`,
   `ProfilePage`), and what each should point at after the merge.
5. What the wizard needs so the negotiation process has three tabs (Profile, Links, Photos) with Genre
   staying in Profile, and what the payout modal removal touches.
6. **Mismatches** between docs, design file and code (both sides, file and line). Do not fix them.

---

## Part 2: build (after Zoha's go-ahead on part 1)

Rules for every step: follow the spec and design exactly; only library components, layout classes and
tokens; no raw values; no new words except the keys listed below; mobile first; no tests, builds or
linting (working-rules.md); keep validation, data loading and Stripe flows as they are unless the step
says otherwise. **Do not edit anything in `.claude/`**; list mismatches at the end of each step.
Do not remove Sharetribe's multi-listing support anywhere (business-rules.md).

### Step 1: infrastructure (no page changes)

1. `LayoutSplit`: add `role="nav"` (side left `--lb-side-nav`, main max `--lb-width-form`, sticky side;
   below 1024px the side is a sticky row under the topbar), as `layouts.md` describes. `summary` stays
   unchanged and stays the default. CSS only for the columns.
2. New shared `StepMenu`: variants `steps` (numbers; done = lucide `Check`; current = 2px outline +
   600; not reached = grey, not clickable) and `pages` (no numbers, 2px bar). Items, labels and links
   come in as props. `aria-current="step"` / `"page"`.
3. New shared `NoticeBanner` (library "Notice banner").
4. `lineupForm.module.css`: `.helperSuccess` and `.formError` (library "Status messages").
5. New shared `FieldPasswordInput` (Final Form field, library box with a text button inside):
   "Show" / "Hide", `aria-pressed`. Keys `FieldPasswordInput.show` = "Show",
   `FieldPasswordInput.hide` = "Hide" in all four translation files (de/es/fr: translate).
6. `CustomExtendedDataField` (gap 10, approved): add optional class props so a page can give its fields
   the library look; render the `genre` multi-enum with `CheckboxTileGroup` when the page asks for it.
   Pages that don't pass the props render exactly as today.
7. Export new components from `src/components/index.js` in the existing import order.

### Step 2: Account settings page (both user types)

1. `/account` (`AccountSettingsPage`, today a redirect) becomes the page, on `LayoutSplit role="nav"`
   with `StepMenu variant="pages"`: DJ = Account settings, Payout details; event organizer = Account
   settings, Payment methods (same visibility rules as `LayoutWrapperAccountSettingsSideNav`).
   Labels: `UserNav.accountSettings`, `LayoutWrapperAccountSettingsSideNav.paymentsTabTitle` /
   `.paymentMethodsTabTitle`.
2. `PageHeader` title "Account settings" (`UserNav.accountSettings`). Cards (`SectionCard`, each keeps
   its own form and save button): **Profile picture** (`ContactDetailsForm.yourProfilePicture`,
   library "Profile picture"), **Contact details** (`ContactDetailsPage.heading`: email + verified
   status as `.helperSuccess`, `PhoneNumberField` instead of `FieldPhoneNumberInput`, the existing
   "Confirm your changes" block when the email changes), **Password**
   (`LayoutWrapperAccountSettingsSideNav.passwordTabTitle`: Current password first, then New password,
   both with `FieldPasswordInput`, then the reset link), **Delete your account**
   (`ManageAccountPage.deleteAccountSubtitle`: the existing info text + secondary "Delete account").
3. Delete account: the checkbox goes; the button opens the library Modal with the existing confirm
   title, info, Current password, reset link and "Delete account". Same submit and errors as today.
4. DJ only: `NoticeBanner` first in the column while payout is not complete (step 3 helper), existing
   Home texts, secondary "Set up payouts" → `StripePayoutPage`.
5. `ContactDetailsPage`, `PasswordChangePage`, `ManageAccountPage` routes redirect to
   `AccountSettingsPage` (like `ProfileSettingsLegacyRedirect`); update the links from part 1 item 4.
   Keep their ducks/loadData working for the merged page (one `loadData` for the page).
6. Errors exactly as the design's Errors state: field errors under fields, save failures as
   `.formError` above that card's button.

### Step 3: Payout details and Payment methods

1. Both pages on `LayoutSplit role="nav"` + the same `StepMenu`, `PageHeader` with the existing heading.
2. Payout (DJ): account type as choice tiles (`.choiceTiles`), country select, Stripe terms text,
   "Save details". Status card restyled as library "Stripe status" (needs verification / failed /
   verified).
3. **Payout complete = Stripe verified** (business rule, approved): one shared helper; Home banner
   (`CMSPage.js`), the Account settings banner and the public profile banner (if built) use it instead
   of `stripeConnected` alone.
4. Payment methods (organizer): library "Saved card" for `SavedCardDetails` (keep its `Menu` and
   remove modal → library Modal), card element box, info text, Billing details card with
   `StripePaymentAddress` fields in the library look, "Save payment card".
5. Remove `LayoutSideNavigation` from all account pages.

### Step 4: public profile builder

1. `EditListingPage` on `LayoutSplit role="nav"` with `StepMenu variant="steps"` (replaces the wizard
   `Tabs`). Steps for the negotiation process: **Profile, Links, Photos**. Genre stays in Profile;
   links move to the Links step (`EditListingListingFieldsStepPanel` already exists for links).
   New keys: `EditListingWizard.default-negotiation.new.saveLinks` = "Next",
   `EditListingWizard.edit.saveLinks` exists ("Save changes"). Default-booking tabs stay as they are.
2. Titles (no name: one person, one public profile): `EditListingDetailsPanel.djCreateListingTitle`
   = "Profile", `.djEditTitle` = "Edit profile", `EditListingListingFieldsStepPanel.editLinksTitle` =
   "Edit links", `EditListingPhotosPanel.title` = "Edit photos" (drop the `listingTitle` values).
3. Profile: one `SectionCard` without title (Artist name, Bio, City as library "City search"), then a
   `SectionCard` titled "Genre" with `CheckboxTileGroup` (field legend kept for screen readers only).
   Links: one card, five fields in the code's order, Resident Advisor required, the others show
   "(optional)" in the library style (labels from `configListing.js`).
4. Photos: library "Photo grid", ratio from `config.layout.listingImage`. **Two photos required**
   (approved): change the validation to a minimum of two; message: "You need to add at least two photos."
   (`EditListingPhotosForm.imageRequired`, approved Oct 15).
5. Remove the payout modal after publishing (approved). After "Publish public profile" the DJ lands
   where they land today, minus the modal.
6. Errors as the design's Errors state; save failures as `.formError` above the button.

### Step 5: copy (en.json now; Zoha mirrors in Console)

List every changed or new key with old → new value, for Zoha to copy into Console:
- the titles and keys from steps 1, 2 and 4;
- every "listing" the DJ sees in these screens → "public profile": `EditListingWizard.default-negotiation.new.savePhotos`
  ("Publish public profile"), `EditListingDetailsForm.updateFailed`, `.createListingDraftError`,
  `.showListingFailed`, `EditListingPhotosForm.publishListingFailed`, `.updateFailed`,
  `.showListingFailed`, `.savedImageAltText`.
Do not change `DeleteAccountForm.confirmDeleteInfo` (shared by both user types; open item).
