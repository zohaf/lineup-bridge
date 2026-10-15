# Account and public profile setup: spec

Oct 15, 2026 · Zoha Fard · status: **decided Oct 15**, build prompt: [account-and-profile-setup-prompt.md](account-and-profile-setup-prompt.md)

- Design: [design/dj-setup.html](design/dj-setup.html) (user DJ / event organizer, Default / Errors)
- Rules: [business-rules.md](business-rules.md) · layout: [layouts.md](layouts.md) Split · nav
- Pages: `EditListingPage` (public profile builder), `ContactDetailsPage`, `PasswordChangePage`,
  `ManageAccountPage`, `StripePayoutPage`, `PaymentMethodsPage`

Content = the current code (Console text, `configListing.js` fields). Approved changes are listed
under the design frame. Edit titles carry no name: "Edit profile", "Edit links", "Edit photos".

## Decisions (Oct 15)

| Gap | Decision |
| --- | --- |
| 1–2 Layout (`LayoutSplit` nav, `StepMenu`) | Approved. Added to the library |
| 3–9 Components | Approved. Added to the library. "Show" and "Hide" approved |
| 10 `CustomExtendedDataField` | Approved: do what it takes so Genre and the links look exactly like the library |
| 11 One Account settings page | Approved as recommended. The page lives at the existing `/account` route (`AccountSettingsPage`, today a redirect; the header menu already links to it). `/account/contact-details`, `/account/change-password` and `/account/manage` redirect to it. Separate from the listings question: Sharetribe's many-listings-per-user stays (see business-rules.md) |
| 12 Delete account in a pop-up | Approved |
| 13 Links as its own step | Approved |
| 14 Payout pop-up after publishing | Approved: remove it; the NoticeBanner asks for payouts |
| 15 Payout complete = Stripe verified | Approved, high priority |
| 16 Two photos required | Approved. Message: "You need to add at least two photos." (approved Oct 15) |
| 17 Console copy | Approved for titles and "listing" → "public profile" |

## What already exists (use as is)

| Need | Code |
| --- | --- |
| Tokens, type, form fields, buttons, modal | `lineupTokens.css`, `lineupType`, `lineupForm` (incl. `.choiceTiles` for account type), `lineupButtons`, `lineupModal` |
| Page header, section cards | `PageHeader`, `SectionCard` |
| Genre tiles, phone number, select | `CheckboxTileGroup`, `PhoneNumberField`, `SelectField` |
| Header | `SiteHeader`, `HeaderMenu` |

## Gaps: outside the layout files and the library today

Each needs a decision. Recommendation in **bold**. Library items go into `components.html` first.

### Layout

1. **`LayoutSplit` has only the `summary` role.** Add `role="nav"` (side left 264px, sticky; below
   1024px the menu is a sticky row under the topbar), as `layouts.md` already describes. **Build it.**
2. **`StepMenu` is not in the library or code.** Two variants:
   - Builder: numbers; done = tick (lucide `Check`), current = 2px outline, not reached = grey.
     Phones: circles only. This closes the open rule 8 conflict (no black fill).
   - Account: no numbers; current = 2px black bar; phones: labels in a row.
   **Approve both, add to the library, build.** Replaces the wizard's `Tabs`/`TabNav` and
   `LayoutWrapperAccountSettingsSideNav`.

### Components

3. **`NoticeBanner`** is in the library but not in code. **Build it** (shared; also used on Home and
   the public profile).
4. **Password "Show" toggle** is not in the library. **Text button inside the input, "Show" / "Hide"**
   (two new keys; "Hide" is needed for the shown state). Alternative: lucide `Eye` / `EyeOff` icon,
   which still needs "Show password" / "Hide password" as labels for screen readers.
5. **Photo grid** (4:3 tiles, remove button, add tile, error) is not in the library. **Add it**; restyle
   `FieldAddImage` and `ListingImage` in the photos panel's own CSS (they live in the container).
6. **Profile picture** (96px avatar + secondary "Change photo" + error) is not in the library. **Add it.**
7. **City field** uses the template's `LocationAutocompleteInput` (own icon, own predictions list).
   **Add a library entry: text input look + predictions list in the menu style**, styled through its
   class props (`inputClassName`, `predictionsClassName`, …).
8. **Success helper** ("Your email address is verified." in green) and **form-level error** ("Failed to
   update public profile. Please try again." above the button) have no library style. **Add
   `.helperSuccess` and use the existing `.error` above the button.**
9. **Stripe parts:** `StripeConnectAccountStatusBox` (status card, green verified state),
   `SavedCardDetails` (template dropdown menu), `StripePaymentAddress` fields, the Stripe card
   element (an iframe, styled only through Stripe's options). **Add a "Stripe status" card to the
   library; restyle the rest through class props; card element: match font size and border only.**
   `SavedCardDetails` uses the template `Menu`: **keep its behaviour, restyle as the header menu panel.**

### Shared template components (rule 9: no edits to restyle one page)

10. **`CustomExtendedDataField`** renders Genre and the link fields and accepts no class props for
    its inputs (it is already customized: `isGenre`, `threeColumns`). **Add pass-through class props
    (`inputRootClass`, `labelClassName`) and render multi-enum genre with `CheckboxTileGroup`.** This
    is an edit to a shared component, so it needs your OK.

### Logic and routing (not UI-only)

11. **One Account settings page.** Today three routes. **`/account` (`AccountSettingsPage`, exists as a redirect today) becomes the page
    holding the three forms as cards; the three old routes redirect to it** (like
    `ProfileSettingsLegacyRedirect`). Update the account menu and the header menu's "Account settings" link.
12. **Delete account:** the checkbox goes; "Delete account" opens the library Modal with the password.
    **Approve the `DeleteAccountForm` restructure.**
13. **Links step for the negotiation process:** add `LINKS` to `tabsForListingType` for
    `default-negotiation`, keep Genre in Profile (hide only links there). New keys
    `default-negotiation.new.saveLinks` = "Next", `edit.saveLinks` = "Save changes".
14. **Payout pop-up after "Publish public profile"** (`EditListingWizard` payout modal): payout belongs
    to the account. **Remove the pop-up; after publishing the DJ lands on the public profile, where the
    `NoticeBanner` asks for payouts.** Alternative: keep it.
15. **Payout complete = Stripe verified.** Today `stripeConnected`. **Use the Stripe account's
    requirements (nothing currently due / payouts enabled) from `currentUser.stripeAccount`** on Home,
    public profile and Account settings. Check with the Stripe data the template already loads.
16. **Two photos required:** change `nonEmptyArray` to a minimum of two and a new message. **Wording to
    approve.**
17. **Copy edits in Console:** titles ("Profile", "Edit profile", "Edit links", "Edit photos"), every
    "listing" → "public profile" in these screens, "Show" / "Hide".

## Retired by this work

`LayoutSideNavigation` and `LayoutWrapperAccountSettingsSideNav` on these pages, the wizard's
`Tabs`/`TabNav`, `H3`/`H4` page titles (→ `PageHeader`, `SectionCard`), `FieldPhoneNumberInput` in
contact details (→ `PhoneNumberField`). Template files stay; the pages stop using them.

## Build order (after the decisions)

1. Library: `components.html` entries for 2, 4–9; then this spec is updated.
2. Infrastructure: `LayoutSplit` nav, `StepMenu`, `NoticeBanner`, form styles (`.helperSuccess`),
   password toggle, `CustomExtendedDataField` props.
3. Account settings page + routes + delete modal (11, 12).
4. Payout and payment methods pages on the new layout (9, 15).
5. Public profile builder: three steps, titles, photos (13, 14, 16).
6. Console copy (17).
