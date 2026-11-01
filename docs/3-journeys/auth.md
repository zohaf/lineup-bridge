# Log in, sign up, verify email

2026-10-13 · built · design: [../4-design-system/layouts.html](../4-design-system/layouts.html) (pages
"Log in", "Sign up", "After sign up") · code: `src/containers/AuthenticationPage/`

UI-only redesign of `/login`, `/signup`, `/signup/:userType` on `LayoutCentered variant="narrow"`
(440px). Option A: tabs on the page, form in one white card.

## Scope

- Changes: layout, background, tabs, card, typography, fields, user type tiles, checkboxes, buttons, errors.
- Unchanged: text, keys, fields and their order, validation, submit logic, user type logic, redirects,
  Terms / Privacy modals. Social login code stays (not rendered: no IdP env vars).

## Structure

1. Tabs "Sign up" / "Log in": `.button` text, 24px apart, current = black with 2px underline.
2. Form error (when present): shared `.error`, between tabs and card.
3. Card: `SectionCard` without a title (title made optional), padding 24px → 32px from 768px, 24px
   between fields. The Console brand image behind the form is removed from the render.

**Log in:** Email, Password with "Forgot your password? Reset password", primary "Log in" full width.

**Sign up, role first:**
- No role chosen: only "I am a ..." and two tiles (Event organizer, DJ). No fields, no button.
- Role chosen: tiles stay at the top; the role's fields open below. `/signup/:userType` skips the choice.
- Tiles: 48px, `<fieldset>` + `<legend>`, `<button aria-pressed>`; selected = black fill, white text.
- DJ: Artist Name, Full Name, Email, Phone number, Password, Confirm Password. Organizer: Business Name,
  Contact Person, Business Email, Phone number, Password, Confirm Password.
- Authorization and terms checkboxes in bordered tiles; checked = black border.

**Phone number** (`PhoneNumberField`): required for both user types, default Netherlands. One
`<fieldset>`: country select (104px; list shows "Netherlands +31", closed box shows "+31") + number
input, no placeholder. Saved as one string, `+31612345678`. Dial codes in
`src/translations/countryDialCodes.js`.

**After sign up** (`EmailVerificationInfo`): title on the page, message and help lines in one card,
"Later" as a full-width secondary button. No icon.

## States

Field errors: `.inputError` + existing `ValidationError`. Form error above the card (page scrolls to it).
Loading: button keeps its size, shows the spinner. Checkbox errors: message under the tile, red border.
