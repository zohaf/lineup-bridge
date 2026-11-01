# Public profile

2026-10-15 · built · design: [public-profile.html](public-profile.html) (Square) · code: `src/containers/ListingPage/`

UI-only redesign of the DJ's public profile, the listing page `/l/:slug/:id`
(`src/containers/ListingPage/`, cover photo variant `ListingPageCoverPhoto.js`). Follow
[rules.md](../4-design-system/rules.md), [tokens.md](../4-design-system/tokens.md) and [layouts.md](../4-design-system/layouts.md).

## Rules (decided by Zoha)

1. **The public profile is the listing page** `/l/:slug/:id`. `/u/:id` (`ProfilePage`) is not part of
   this work. This settles the bug list 4 for the redesign.
2. **One name: "public profile"** in docs, prompts and UI wording.
3. **Same page for everyone.** The DJ on their own public profile and an event organizer see the same
   layout and content. Only the button text and target change, in the same place.
4. **Centered `profile` layout, 600px** (new variant, [layouts.md](../4-design-system/layouts.md)). Little content, so
   narrower than the offer builder. Phone and iPad as in the design file.
5. **It does not copy the offer builder header.** No 64px thumbnail. The offer builder keeps its own
   compact header.
6. **Two photos, square, side by side** at every width. Square is how the code shows photos today:
   no new image handling, crops, variants or resizing.
7. **One sticky area at the end of the profile**: the primary (black) button, with one caption under
   it when a state needs one. Sticky to the bottom of the screen while scrolling; it comes to rest
   after the content. Never at the top. The DJ-only bars (`ActionBarMaybe`) are gone: their messages
   become this caption (see "Button and caption rules").
8. **No new words.** No content or logic changes beyond the button rules below.

## Page structure (top to bottom)

| # | Element | Content (existing) | Built with |
| --- | --- | --- | --- |
| 1 | Topbar | Full topbar, sticky | `TopbarContainer`, unchanged |
| 2 | Notice banner (DJ owner, payout details missing, any profile state) | `Home.completePayoutTitleDj`, `Home.completePayoutMessageDj`, secondary button `Home.pendingApprovalCtaDj` "Set up payouts" → `StripePayoutPage`. Not shown when payouts are set | New shared `NoticeBanner`, first in the column, under the topbar, above the photos, column width |
| 3 | Photos | First two listing images, square, 2 columns, 8px gap (12px from 768px). Tap opens the existing carousel with **all** images | `SectionHero` → `ListingImageGrid` |
| 4 | Page header | Title: listing title (`ListingPage.orderTitle`). Lead: Genre option labels and the location address, joined with " · " | `PageHeader` (title + lead, no image, no eyebrow) |
| 5 | Content card | Bio (listing description), then the Links list, then any other listing fields Console shows (not Genre) | `SectionCard` without title |
| 6 | Sticky area: button + caption | Button and caption per "Button and caption rules". Caption under the button, centered, `.small` secondary grey, 8px gap. With no button the caption sits alone | Shared primary button class, `.small` |
| 7 | Footer | | `FooterContainer`, unchanged |

## Button and caption rules

Decided Oct 15, 2026. Rule 11 (sentence case) and rule 12 (no final full stop on a one-sentence
caption) of [rules.md](../4-design-system/rules.md) apply.

**One caption at a time.** When several states apply, the first in this order wins:
Draft → Pending approval → Closed → Published.

**Caption style:** `.small`, `--colorGrey700` (secondary grey), under the button, centered, 8px gap.
With no button, the caption sits alone, centered.

| Who | State | Button | Caption |
| --- | --- | --- | --- |
| Visitor (organizer or logged out) | Published | "Create new booking" (`NegotiationRequestQuoteForm.nextCta`) → `RequestQuotePage` | none |
| Visitor | Closed | none | `ListingPage.closedListing`, no full stop. **Open:** Zoha may choose no caption at all |
| DJ owner | Published | "Edit public profile" (`NegotiationRequestQuoteForm.editProfile`) → `EditListingPage` | none |
| DJ owner | Draft | "Finish listing" (`ListingPage.finishListing`) → `EditListingPage` | `ListingPage.ownListingDraft`, no full stop |
| DJ owner | Pending approval | "Edit public profile" | `ListingPage.ownListingPendingApproval`, no full stop. If Console enables the approval CTA (`CTAButtonMaybe`), it shows as a text link under the caption |
| DJ owner | Closed | "Edit public profile" | `ListingPage.ownClosedListing`, two sentences, keeps its full stops |

- **Visitor button:** calls the page's existing `handleOrderSubmit({})`, the same handler the current
  form submits to, so the destination is unchanged. **One tap on phones** (today: bottom bar → empty
  modal → the same button). Logged out: log in first, then the offer builder (unchanged).
- **DJ buttons:** a link to `EditListingPage` with the same `editParams` `ActionBarMaybe` uses.
  `NegotiationRequestQuoteForm.editProfile` is an existing key, unused today; its value becomes
  sentence case (rule 11) in `en.json` and Console.
- **Payout details missing is not a caption.** It is the notice banner (row 2), shown together with
  any state above. `ListingPage.addPayoutDetailsMessage` is no longer shown on this page.
- **Visitors and payout details:** no caption. The old `payoutDetailsWarning` text under the button is
  dropped (the decision board says visitors see nothing today either; see "Contradictions").
- **Any listing that is not negotiation with unit type `offer`:** keep `OrderPanel` as today
  (fallback; no DJ profile uses it).

### Caption text changes (`en.json`, and the same in Console `translations.json`)

| Key | Today | New |
| --- | --- | --- |
| `ListingPage.closedListing` | This listing is not available right now. | This listing is not available right now |
| `ListingPage.ownListingDraft` | This listing is a draft. | This listing is a draft |
| `ListingPage.ownListingPendingApproval` | This listing is pending approval. | This listing is pending approval |
| `ListingPage.ownClosedListing` | Your listing has been closed. It's no longer visible on the marketplace. | unchanged (two sentences) |
| `NegotiationRequestQuoteForm.editProfile` | Edit public profile | unchanged in `en.json` (already sentence case); check the Console value |

## Notice banner (payout details missing)

New shared component `NoticeBanner` ([rules.md](../4-design-system/rules.md), UI library).
First in the page column, under the topbar, above the photos, at the column width.

- Shown for the DJ owner when payout details are missing, in any profile state. Disappears when
  payouts are set. Persistent, not dismissible. One per page.
- Text (existing Home copy): `Home.completePayoutTitleDj`, `Home.completePayoutMessageDj`, and a
  secondary button `Home.pendingApprovalCtaDj` "Set up payouts" → `StripePayoutPage`.
- Look: `--colorAttentionSubtle` fill, 1px `--colorAttention` border, 8px radius, 16px padding;
  lucide `CircleAlert` 20px in `--colorAttentionDark`; title `.label` 600; message `.small` grey 700;
  secondary button 44px. `role="status"`.

## Photos (how images work today)

- Sharetribe crops listing images on the server into the `listing-card` variants (Console ratio, live
  4:3). `ListingImageGrid` shows them in a square box (`AspectRatioWrapper 1×1`, `object-fit: cover`,
  top aligned). This stays exactly as it is.
- Change: only the first two images are tiles, always 2 columns. One image: one tile in the left
  column, same size. No images: no photo row.

## Header subheader

- Genre values: the option labels of the `genre` listing field (`publicData.genre` mapped through the
  field's `enumOptions`), in their saved order.
- Location: `publicData.location.address`.
- Joined with " · " (a separator, not a word). Missing parts are left out; no lead if both are empty.
- Genre is then left out of the fields list in the card. The "Genre" and "Location" labels are no
  longer shown.

## Content card

- Bio: the listing description (`.body`, keeps line breaks and links as today).
- Links: existing `SectionLinks` (heading "Links:" and link names are set in code, icons from
  `SocialLinkIcons`). Icons from the shared icon set: lucide `Globe` for Website, `SocialIcon` for the brands (Resident Advisor now; SoundCloud and Spotify once their SVGs are supplied). Restyled to 44px rows, 20px icon, `.body` 600 text, underline on hover.
- Groups split by a 1px `--colorGrey100` rule with 24px above and below.

## Out of scope (later)

- Restyling `ActionBarMaybe` elsewhere: it is removed from this page only (its messages become the
  caption and the notice banner); other pages that use it are untouched.
- `ProfilePage` `/u/:id`.
- Adding the photo pair, link list and sticky area to [components.html](../4-design-system/components.html). (`NoticeBanner` is
  already there.)
- Reusing `NoticeBanner` on Home and account pages.

## Still open (Zoha)

1. Closed public profile for visitors: caption (`ListingPage.closedListing`) or nothing.
2. Whether DJs can book other DJs. Today a DJ sees "Create new booking" on other DJs' profiles; kept
   as today.
3. "Listing" vs "public profile" in the captions (rule 2). Today's keys say "listing"; changing them is
   an `en.json` and Console text change.
4. The payout banner says "you won't receive booking requests", but organizers can still send offers
   to a DJ without payout details today. Needs a copy change or a logic change.
