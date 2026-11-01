# Account and public profile setup

2026-10-15 · approved · design: [account-and-profile-setup.html](account-and-profile-setup.html) ·
rules: [../1-product/business-rules.md](../1-product/business-rules.md) · layout: `LayoutSplit` · nav

From sign-up to a published public profile with payouts set up. Pages: `EditListingPage` (public
profile builder), `AccountSettingsPage`, `StripePayoutPage`, `PaymentMethodsPage`.

## Journey

1. DJ builds the public profile in three steps: Profile → Links → Photos → "Publish public profile".
2. DJ lands on the public profile; the `NoticeBanner` asks for payout setup (no pop-up after publishing).
3. Account settings: one page at `/account` with profile picture, contact details, password, delete
   account. `/account/contact-details`, `/account/change-password`, `/account/manage` redirect to it.
4. Payout details (DJ) or Payment methods (organizer) on the same layout.

Edit titles carry no name: "Edit profile", "Edit links", "Edit photos".

## Decisions

| Area | Decision |
| --- | --- |
| Layout | `LayoutSplit` `role="nav"`: side menu 264px, sticky; below 1024px a sticky row under the topbar |
| Step menu | `StepMenu`, two variants. Builder: numbers, done = tick, current = 2px outline, phones circles only. Account: no numbers, current = 2px black bar |
| Components added to the library | `NoticeBanner`, password "Show" / "Hide" text button, photo grid (4:3 tiles), profile picture (96px), city field in input style, `.helperSuccess`, Stripe status card |
| Shared component | `CustomExtendedDataField` gets pass-through class props; multi-enum genre renders with `CheckboxTileGroup` |
| Delete account | Library Modal with the password; the checkbox goes |
| Links step | `LINKS` added to `tabsForListingType` for `default-negotiation` |
| Payout complete | Stripe verified (nothing due, payouts enabled), not `stripeConnected` |
| Photos | Two required: "You need to add at least two photos." |
| Console copy | Titles above; "listing" → "public profile" |

Retired on these pages (files stay): `LayoutSideNavigation`, `LayoutWrapperAccountSettingsSideNav`,
the wizard's `Tabs`/`TabNav`, `H3`/`H4` titles, `FieldPhoneNumberInput`.
