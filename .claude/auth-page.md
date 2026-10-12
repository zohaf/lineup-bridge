# Log in and sign up page: UI spec

Oct 12, 2026 · Zoha Fard

UI-only redesign of `AuthenticationPage` (`/login`, `/signup`, `/signup/:userType`,
`src/containers/AuthenticationPage/`), on `LayoutCentered variant="narrow"`. **Approved: option A**
(tabs on the page, form in one white card). Follow [layouts.md](layouts.md) for the layout,
[design-system-rules.md](design-system-rules.md) for every component and [tokens.md](tokens.md)
for every value.

- Design: [design/layouts.html](design/layouts.html), pages "Log in" and "Sign up"
- Needs first: layouts.md steps 1–3 (`LayoutCentered` exists and is used by the offer page and home)

## Scope

- **Changes:** layout, page background, tabs, card, typography, field styling, user type tiles,
  checkbox styling, button styling, error styling.
- **Does not change:** any text, translation key, field, field name, field order, validation, submit
  logic, user type logic (`preselectedUserType`, `/signup/:userType`), redirects after login, data
  loading, the Terms / Privacy modals.
- **Not touched:** `TopbarContainer`, `FooterContainer`, shared Field components' own files, the
  template layouts (`LayoutComposer`, `LayoutSingleColumn`, `LayoutSideNavigation`), other pages.
  Out of scope: DJ profile builder, account settings, checkout, password recovery/reset (next spec).
- **Left as is (code stays, no restyle now):** `SocialLoginButtonsMaybe` and the IdP confirm form.
  We don't use Google or Facebook login, so they don't render (no env vars). Do not delete them.
  `EmailVerificationInfo` (shown after sign up) is restyled in step 6.

## Page structure (top to bottom)

| # | Element | Content (existing) | Component |
| --- | --- | --- | --- |
| 1 | Topbar | unchanged | `TopbarContainer` |
| 2 | Tabs | `AuthenticationPage.signupLinkText` "Sign up", `AuthenticationPage.loginLinkText` "Log in" | `LinkTabNavHorizontal`, restyled through its class props |
| 3 | Form error (only when there is one) | existing login / sign up error messages | shared `.error` class (lineupForm) |
| 4 | White card | the login form or the sign up form | `SectionCard` without a title (see below) |
| 5 | Footer | unchanged | `FooterContainer` |

- **Layout:** `LayoutCentered variant="narrow"` (440px) replaces `LayoutSingleColumn` +
  `ResponsiveBackgroundImageContainer`. The page sits on the beige page background; **the Console
  brand image behind the form is removed from this page's render** (the component file stays).
- **Tabs:** text, `.button` size (15px, 600), 24px apart, at least 36px high. Current tab: black
  with a 2px black underline. Other tab: `--lb-text-muted`, black on hover. No box, no card.
- **Gaps:** tabs → card `--lb-space-6` (32px); form error sits between them with the same gap.
- **Card:** white, 1px border, 8px radius, padding 24px → 32px from 768px. 24px between fields.
  `SectionCard` needs a title today: make `title` optional (no title row and no rule when it is
  empty). Update the `SectionCard` row in design-system-rules.md and `design/components.html` first.

## Log in card (order unchanged)

1. Email: `LoginForm.emailLabel`, text input
2. Password: `LoginForm.passwordLabel`, text input, then the helper line
   `LoginForm.forgotPasswordInfo` "Forgot your password? Reset password" in `.small`, with the link
   `LoginForm.forgotPassword` in the shared text link style
3. Primary button `LoginForm.logIn` "Log in", **full width at every size** (narrow column)

## Sign up card (order unchanged)

1. **User type, role first** (this is how the code already behaves: with no role chosen, only the
   choice shows; the fields appear once a role is picked):
   - **Step 1, no role chosen yet:** the card shows only the question `SignupForm.userTypePrompt`
     "I am a ..." in `.h3` (16px below it) and the two existing buttons
     (`SignupForm.userTypeOptionEventOrganizer`, `SignupForm.userTypeOptionDj`) as two tiles side by
     side. No fields, no checkboxes, **no Sign up button** (today the disabled button shows; render
     it only once a role is chosen, like the terms already are).
   - **Step 2, role chosen:** the question and tiles stay at the top of the card (tap the other tile to
     switch), and the fields for that role open below.
   - Tiles: 48px high, 4px radius, label 600 centered, first letter capitalized with CSS ("Event
     organizer"; `::first-letter` needs the label in an inline-block span, it does not work directly
     on a flex button). Not selected: white, 1px `--colorGrey200` border; hover: black border.
     **Selected: black fill, white text, black border, exactly like the landing page's primary
     button** (hover `hsl(240 3% 20%)`).
   - Use a `<fieldset>` with the question as its `<legend>`. Keep the tiles `<button>`s with the
     existing `onClick` and `aria-pressed`. Styles live in lineupForm classes, not a new component.
   - Links with a preset role (`/signup/:userType`) skip step 1, as today.
2. **The fields for the chosen type, exactly as the code renders them:**
   - DJ: Artist Name, Full Name, Email, Password, Confirm Password
   - Event organizer: Business Name, Contact Person (Full Name), Business Email, Password, Confirm Password
   - No type (fallback): Email, First name, Last name, Password. **First and last name stack** (one
     column; 440px is too narrow for a pair).
   - **Phone number** (`UserFieldPhoneNumber`, after the email field for DJ and event organizer),
     **required**, with a country code picker: see "Phone number with country code" below (step 5).
3. **Console user fields** (`CustomExtendedDataField`), styled through their class props where they
   accept them. Any count, any length.
4. **Authorization checkbox** (`SignupForm.authorizationConfirmationLabel`) and **terms checkbox**
   (`AuthenticationPage.termsAndConditionsAcceptText` with its two links; live text: "I accept the Terms of use and the Privacy Policy"): each in a bordered tile
   (1px border, 4px radius, padding 12px, label `.small`, checkbox top-aligned with the first line).
   Checked: black border.
5. Existing `SignupForm.passwordRepeatedOnOtherFields` error, when shown.
6. Primary button `SignupForm.signUp` "Sign up", full width.

The form is long: it stays one card, one column; the page scrolls and the button is at the end.
No steps, no sticky button.

## States

- Field errors: the design-system error look (red border, pale red fill via `.inputError`; the
  existing `ValidationError` message under the field).
- Form error (wrong password, email taken, etc.): existing messages, shared `.error` class, above
  the card; the page still scrolls to it (existing `scrollIntoView`).
- Loading: the button keeps its size and shows the spinner (existing `inProgress`).
- Checkbox / terms required errors: existing messages under the tile; tile border turns `--colorFail`.

## Implementation steps

### Step 1: layout and card
Swap the page's layout to `LayoutCentered variant="narrow"`, remove the brand image container from
the render, make `SectionCard`'s title optional (docs first), wrap the forms in it. Restyle the tabs.
Login and sign up still work exactly as before.

### Step 2: log in form
Apply lineupForm classes to both fields, the helper line and link, and lineupButtons primary
(full width) to the button.

### Step 3: sign up form
User type tiles, fields (stacked), Console fields, the two checkbox tiles, button. Check all three
variants (DJ, event organizer, no type) and `/signup/dj`-style preselected links.

### Step 4: states and check
Errors (field, form, checkboxes), loading, at 375, 768, 1024 and 1280px, against the review
checklist in design-system-rules.md section 7. (Per working-rules.md the agent runs no commands;
Zoha runs `yarn format` and `CI=true yarn test AuthenticationPage` before committing.)

### Step 5: phone number with country code
Build `PhoneNumberField` and the dial code list as described above, use it in
`UserFieldPhoneNumber`. Check a DJ and an event organizer sign up with the phone required.


### Step 6: after sign up screen
Restyle `EmailVerificationInfo` as described in "After sign up: check your email". Words and links
unchanged.
## After sign up: check your email (step 6)

`EmailVerificationInfo.js`, shown in place of the tabs and form right after sign up. Same layout
(`narrow`), same words, our design language: **title on the page, everything else in one white
card** (the offer builder pattern). Design: layouts.html, page "After sign up".

The live wording comes from **Console translations, which override `en.json`** (checked Oct 13, 2026):

| # | Element | Key → live text | Look |
| --- | --- | --- | --- |
| 1 | Title | `AuthenticationPage.verifyEmailTitle` → "{name}, Thanks for signing up!" | `.h2`, on the page, not in the card |
| 2 | White card | | `SectionCard` without a title |
| 2a | Message | `AuthenticationPage.verifyEmailText` → "Please verify your email by clicking on the link sent to your email. Check your junk folder as well." | body |
| 2b | Resend error (when there is one) | `AuthenticationPage.resendFailed` / `…TooManyRequests` | shared `.error` |
| 2c | Help lines, above them a 1px rule with 24px space | `AuthenticationPage.resendEmail` → "Didn't get the email? {Resend email}." (while sending: `sendingEmail`) · `AuthenticationPage.fixEmail` → "If you have issue getting our email, {check the email address} you entered and try again." | `.small`, 8px apart, links in the shared text link style |
| 2d | Later | `AuthenticationPage.verifyEmailClose` → "LATER", shown as "Later" with CSS (lowercase + `::first-letter` uppercase on an inline-block span) | secondary button, full width, same link as today |

- **No icon:** remove `IconEmailSent` from this screen (the component stays in the codebase).
- Title → card 32px. No tabs on this screen (as today).
- Remove the old top-right "LATER ×" close link and its modal styles; the same link moves into the
  card as the secondary button.
- "Later" and "Fix it" keep linking where they do today (Contact details). See bugs.md 6.

## Phone number with country code (step 5)

Decided Oct 13, 2026: required for DJs and event organizers, default country Netherlands, sign up
only (Contact details in account settings stays as it is for now).

- **Console (Zoha, not code):** for both user types, set the phone number to show at sign up and to be
  required. The code already reads these settings (`phoneNumberSettings.displayInSignUp`,
  `required`) and uses the existing message `SignupForm.phoneNumberRequired`.
- **New shared component `PhoneNumberField`** (`src/components/`, added to `design/components.html`
  and the design-system-rules.md table first). Used by `UserFieldPhoneNumber` in place of
  `FieldPhoneNumberInput`.
  - One `<fieldset>`: legend `SignupForm.phoneNumberLabel` "Phone number", then one row: country
    select (104px) + 8px + number input (rest of the row). **No placeholder** at any screen size
    (it gets cut off on phones; the label already says what to enter). Same row pattern as `TimeSelect`.
  - **Country select:** the open list shows "Netherlands +31" for every country (names from
    `src/translations/countryCodes.js` in the current language). The closed box shows only the dial
    code ("+31") so it fits the narrow column: build it as the native `<select>` laid invisibly over a
    box that shows the selected dial code and the chevron (the `SelectField` look). Default `NL`.
    Its accessible name reuses "Phone number" (no new words).
  - **Dial codes:** new static file `src/translations/countryDialCodes.js` (ISO code → dial code)
    next to `countryCodes.js`. No new library.
  - **Saved value:** one string in the same `phoneNumber` field, `+` dial code + digits (for example
    `+31612345678`). No change to data, Console fields or the transaction flow.
  - Errors: both boxes get the error look, one message under the row (like `TimeSelect`).
