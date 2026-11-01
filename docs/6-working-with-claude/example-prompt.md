# Example prompt: public profile, UI-only redesign

2026-10-15 · used to build [../5-pages/public-profile.md](../5-pages/public-profile.md) · kept as an example

The two-part pattern used for every page: part 1 reads the code and reports states, words and
mismatches without editing; part 2 builds after Zoha's go-ahead. File paths are as they were before
the docs moved to `docs/` (`.claude/<page>.md` → `docs/5-pages/`, `.claude/design-system-rules.md` →
`docs/4-design-system/rules.md`).

---

## Part 1: read the code and report (no changes)

Read-only task. **Do not edit any file.**

Read first, in this order:

1. `.claude/README.md`
2. `.claude/design-system-rules.md`, especially **rule 10: nothing outside the design system, no
   guessing, no assuming**
3. `.claude/working-rules.md`
4. `.claude/public-profile-page.md` (the spec and every decision)
5. `.claude/design/public-profile-page.html` (the approved design; Photo ratio = **Square**)
6. `.claude/layouts.md` (Centered · `profile` 600px) and `.claude/tokens.md`
7. `AGENTS.md`

Then read `src/containers/ListingPage/ListingPageCoverPhoto.js`, `ListingPage.shared.js`,
`ListingPage.module.css`, `SectionHero.js`, `ListingImageGrid/`, `ActionBarMaybe.js`,
`CustomListingFields.js`, `SectionLocationText.js`, `src/components/CustomExtendedDataSection/`
(`SectionLinks.js`, `SocialLinkIcons.js`), `src/components/OrderPanel/OrderPanel.js` and
`NegotiationRequestQuoteForm/`, and the shared pieces: `LayoutCentered`, `PageHeader`,
`SectionCard`, `src/styles/lineupTokens.css`, `lineupLayout.module.css`, `lineupType.module.css`,
`lineupButtons.module.css`.

Report back, briefly:

1. Which listing page variant renders today (`config.layout.listingPage`) and confirm the spec's
   file is the right one.
2. Every state the page can be in (visitor / logged out / own listing × published, draft, pending,
   closed, payout missing) and what it shows today: keys, buttons, link targets.
3. Every visible word on the redesigned page and its key. Flag any text the design shows that the
   code does not have.
4. What `ListingImageGrid` and `SectionLinks` are used by besides this page, and the smallest way to
   restyle them for this page only (class props, defaults unchanged).
5. How to get the Genre option labels for the subheader with existing helpers, and how to leave
   Genre out of the card without changing `CustomListingFields` behaviour elsewhere.
6. Confirm `handleOrderSubmit({})` from the page gives the same result as today's form submit for a
   negotiation listing with unit type `offer` (own listing, closed, normal).
7. Anything the design needs that the shared components, style files or tokens do not offer. List the
   gap; do not propose new values.
8. **Mismatches** between docs, design file and code (both sides, file and line). Do not fix them.

---

## Part 2: build (after Zoha's go-ahead on part 1)

UI only. **Keep data loading, redirects, error pages, schema/meta, the inquiry modal and the
transaction flow exactly as they are.** No new words or translation keys. Mobile first. No tests,
builds or linting (working-rules.md). **Do not edit anything in `.claude/`**; list mismatches at the
end.

1. **Token and layout:** add `--lb-width-profile: 600px;` to `lineupTokens.css` next to the other
   widths, a `.profile` class in `lineupLayout.module.css`, and `profile` to `LayoutCentered`'s
   variants (and its JSDoc).
2. **Page frame:** in `ListingPageCoverPhoto.js`, replace `LayoutSingleColumn` and the hero / two
   column wrappers with `LayoutCentered variant="profile"` (topbar and footer as today, sticky
   topbar). Spacing between blocks: 32px (`--lb-space-6`), from the page's own CSS, tokens only.
3. **NoticeBanner component** (new shared component, `src/components/NoticeBanner/`, exported from
   `src/components/index.js` keeping the import order). Anatomy and look: design-system-rules.md
   "Notice banner" and the NoticeBanner section of `design/components.html`. Props: `title`,
   `message`, `actionLabel`, `actionTo` (a `NamedLink` target) or render the button as a child; no
   hardcoded text. Icon: lucide `CircleAlert` 20px. `--colorAttentionSubtle` fill, 1px
   `--colorAttention` border, 8px radius, 16px padding, `--colorAttentionDark` icon; title `.label`
   600; message `.small` in `--colorGrey700`; secondary button (shared class, 44px). `role="status"`.
   Not dismissible. Tokens and shared classes only.
4. **Notice banner on the page:** first in the column, under the topbar, above the photos, column
   width. Show it when the listing is the DJ's own and payout details are missing
   (the same condition `ActionBarMaybe` uses for its payout bar), in any profile state. Text:
   `Home.completePayoutTitleDj`, `Home.completePayoutMessageDj`, button
   `Home.pendingApprovalCtaDj` → `StripePayoutPage`. One per page.
5. **Photos:** `SectionHero` keeps its carousel `Modal` with all images. Pass only the first two
   images to `ListingImageGrid`, and give it an optional class prop so this page gets 2 columns at
   every width (gap 8px, 12px from 768px). Square tiles, `object-fit` and `object-position` stay
   exactly as they are. One image = one tile in the left column. No images = nothing.
6. **Page header:** `PageHeader` with `title` = the existing `ListingPage.orderTitle` title and
   `lead` = Genre option labels + location address joined with " · " (see the spec). No image, no
   eyebrow. Leave out missing parts.
7. **Content card:** one `SectionCard` without a title holding, in order: the description (as
   today, `.body`), then `CustomListingFields` with the `genre` config filtered out by this page
   only, then nothing else. Remove `SectionLocationText` from this page (its value is in the lead).
   Groups split by a 1px `--colorGrey100` rule with 24px above and below.
8. **Links:** restyle `SectionLinks` for this page through optional class props (defaults
   unchanged for other pages): heading in `.fieldLabel`, 44px rows, 20px icon, `.body` size and 600
   weight, black, underline (offset 3px) on hover. Icons: lucide `Globe` (Website) and `SocialIcon` for brands (`resident-advisor`, plus `soundcloud` and `spotify` once added); not the hand-drawn ones in `SocialLinkIcons.js`, which stay for other pages.
9. **Sticky area: button and caption** (see "Button and caption rules" in the spec), at the end of the
   column. One caption at a time, precedence Draft → Pending approval → Closed → Published. Caption:
   `.small`, `--colorGrey700`, centered, 8px under the button; with no button it sits alone,
   centered.
   - Negotiation listing with unit type `offer`, not own, not closed: shared primary button,
     `NegotiationRequestQuoteForm.nextCta`, `onClick={() => handleOrderSubmit({})}`. No caption.
   - Not own, closed: no button; caption `ListingPage.closedListing` alone (open: Zoha may choose no
     caption; build it, and list it under "Mismatches" as open).
   - Own listing: `NamedLink` to `EditListingPage` with the same `editParams` as `ActionBarMaybe`,
     styled with the same shared primary class. Text and caption by state:
     draft: `ListingPage.finishListing` + `ListingPage.ownListingDraft`;
     pending approval: `NegotiationRequestQuoteForm.editProfile` +
     `ListingPage.ownListingPendingApproval`, and `CTAButtonMaybe`'s link as a text link under the
     caption when Console enables it;
     closed: `NegotiationRequestQuoteForm.editProfile` + `ListingPage.ownClosedListing`;
     published: `NegotiationRequestQuoteForm.editProfile`, no caption.
   - Remove `ActionBarMaybe` from this page (its messages are the captions above, payout missing is
     the notice banner). Do not delete the component if other files use it.
   - No `payoutDetailsWarning` or `ListingPage.addPayoutDetailsMessage` on this page.
   - Any other listing type: render `OrderPanel` as today instead (fallback).
   - Full column width at every width. Wrapper: `position: sticky; bottom: 0`, page background,
     `--lb-space-3` padding plus `env(safe-area-inset-bottom)`, pulled out to the gutter so it
     covers content edge to edge, 1px `--colorGrey100` top rule. CSS only.
   - Text changes (no full stop on one-sentence captions) are in the spec table. Make them in
     `en.json` and list them for Zoha to copy into Console. No other text changes.
10. **CSS:** only tokens and shared classes (`composes:`). Remove `ListingPage.module.css` classes
   this variant no longer uses, but keep any class `ListingPageCarousel.js` or other files still
   use. Hover styles inside `@media (hover: hover)`.

If something is missing, unclear, or contradicts the design, **stop and ask Zoha**. Check at 375,
768, 1024 and 1280px as an event organizer, logged out, and as the DJ on their own profile
(published, draft, pending approval, closed, and with payout details missing).

When done, reply with a few bullets: the files changed, anything left to do, and the "Mismatches"
list.
