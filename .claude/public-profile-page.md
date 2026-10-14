# Public profile page: UI spec (draft, collecting decisions)

Oct 14, 2026 · Zoha Fard

UI-only redesign of the DJ's public profile. Follow [design-system-rules.md](design-system-rules.md),
[tokens.md](tokens.md) and [layouts.md](layouts.md). Status: **collecting rules. Nothing is built
yet.** When the open items are decided, this spec gets a design file
(`design/public-profile-page.html`) and a coding prompt (`public-profile-page-prompt.md`).

## Rules (decided by Zoha)

1. **The public profile is the listing page** `/l/:slug/:id` (`src/containers/ListingPage/`). This settles
   [bugs.md](bugs.md) 4 for the redesign. `/u/:id` (`ProfilePage`) is not part of this page.
2. **One name: "public profile".** In docs, prompts and UI wording, this page is the "public profile",
   not "listing", "artist profile" or "DJ profile". This uses the existing topbar wording
   "My public profile" (`TopbarDesktop.myPublicProfileLink`).
3. **Same page for everyone.** The DJ viewing their own public profile and an event organizer viewing it
   see the same layout and the same content.
4. **Only the main button changes, in the same place:**
   - Event organizer (and logged-out visitor): **"Create new booking"**. Opens the offer builder
     ("Complete your offer", `RequestQuotePage`).
   - The DJ on their own public profile: an **edit button** that opens the profile builder
     (`EditListingPage`).
5. **The user sequence matters.** Public profile → "Create new booking" → offer builder. The two pages
   should feel like one continuous flow.
6. **No content or logic changes** beyond the button rule above. Content stays exactly as in the app.

## What the page shows today (from the code and the running app)

Variant: cover photo (`ListingPageCoverPhoto.js`, chosen in Console).

| # | Element | Source |
| --- | --- | --- |
| 1 | Photo tiles (all listing images, open the carousel) | `SectionHero` / `ListingImageGrid` |
| 2 | DJ name (`h1`) | `ListingPage.orderTitle` = `{title}` |
| 3 | Bio | listing description, `SectionText` |
| 4 | Links (Website, SoundCloud, Spotify, with icons) | `CustomListingFields` (Console listing fields) |
| 5 | Genre (pills, e.g. "Techno") | `CustomListingFields` |
| 6 | Location ("Berlin, Germany") | `SectionLocationText`, `ListingPage.locationTitle` |
| 7 | Main button | `OrderPanel` → `NegotiationRequestQuoteForm`. Live text "Create new booking" (Console) |
| – | DJ only, not published: bar with "This listing is pending approval." / draft / closed + "Edit listing" / "Finish listing" | `ActionBarMaybe` |
| – | DJ only: missing payout details bar | `ActionBarMaybe` |
| – | Closed public profile (visitor): "This listing is not available right now." | `ActionBarMaybe` / `OrderPanel` |

## Findings

- **The DJ's own published public profile has no edit button.** They see "Create new booking", which
  only scrolls to the top (`handleOrderSubmit`, `isOwnListing`). The bar with "Edit listing" only appears
  for draft, pending or closed profiles.
- **Phones need two taps:** the bottom-bar button opens a modal that contains only the same button
  again; the second tap opens the offer builder.
- The topbar's "My public profile" opens this page (`Topbar.js` `handleMyPublicProfileClick`).
- The UI library has no photo grid, pill tags, icon link list or phone bottom bar yet. They are
  added to `design/components.html` first.

## Open items (decide at the end)

- [ ] **Edit button wording.** Existing options: "Edit Public Profile" (`NegotiationRequestQuoteForm.editProfile`,
      matches rule 2, suggested), "Edit listing", "Edit profile". Check the live Console value. Sentence case
      ("Edit public profile") would be a Console translation edit.
- [ ] **Edit button target tab:** the first profile builder tab, like `ActionBarMaybe` `editParams`.
- [ ] **Edit button style:** primary (same as "Create new booking") or secondary.
- [ ] **Layout:** Centered `form` 760 (same frame as the offer builder), Split `summary`, or Centered `wide` 920.
- [ ] **Phone button:** one tap straight to the offer builder (small logic change) or keep two taps.
- [ ] **Draft / pending / closed / payout bars:** keep their messages; restyle as which component?
- [ ] New library parts: photo grid, pill tags, icon link list, phone bottom bar.
- [ ] Update [layouts.md](layouts.md) ("parked" line, open item) and [bugs.md](bugs.md) 4 once the layout is chosen.
