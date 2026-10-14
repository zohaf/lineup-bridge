# Home page (logged in, `/p/home`): UI spec

Oct 14, 2026 · Zoha Fard · **Design approved Oct 14** (one open item: decision 4 below)

UI-only redesign of the logged-in home page in `src/containers/CMSPage/CMSPage.js` (`HomeNextSteps`,
`OwnListingsSummary`) and `CMSPage.module.css`. Follow [design-system-rules.md](design-system-rules.md),
[layouts.md](layouts.md) and [tokens.md](tokens.md).

- Design: [design/home-page.html](design/home-page.html) (toolbar: User, State, View, Tags)
- Item rows: [design/components.html](design/components.html#item-rows), design-system-rules.md §4
- Coding prompt: [home-page-prompt.md](home-page-prompt.md)

## Scope

- **Changes:** layout, type, cards, buttons, status chips, spacing.
- **Does not change:** any text, translation key, condition, link target, the order of the
  offers (latest action first, max 6), data loading (`mapStateToProps`, `CMSPage.duck.js`), the
  hosted page (`/p/home` has no Console sections today, checked Oct 14), the header or the footer.
- Live wording = `en.json`: Console translations override no `Home.*` key (checked Oct 14, 2026).

## Layout

Centered · `wide` (920px), as in [layouts.md](layouts.md). The page is rendered inside `PageBuilder`
(`mainContentBefore`), so it composes the classes (`composes: centered wide from
'../../styles/lineupLayout.module.css'`), which `CMSPage.module.css` already does. Content starts one
gutter under the header (`--lb-page-top`); the old `padding: 28px 0 0` / `32px 0 0` on the sections go.

| # | Element | Content (existing) | Component |
| --- | --- | --- | --- |
| 1 | Page header | `Home.welcomeBack` "Welcome back, {name}" | `PageHeader` (title only) |
| 2 | Under review card (not approved) | one item row, no card title | `SectionCard` without `title` |
| 3 | What's next | `Home.whatsNext`, then 1 or 2 item rows | `SectionCard title` (no number) |
| 4 | Your activity | `Home.activityTitle`, then up to 6 offer rows | `SectionCard title` (no number) |

Gaps: header → first card 32px; card → card 32px (the `centered` gap). Inside a card: title row
(`.h3` + rule) as in the offer builder; rows divided by a 1px rule, `--lb-row-pad` above and below.

## Item rows

**Next step row** (rows 2 and 3): title (`.fieldLabel` size, 600, black) → 8px → text (`.body`,
secondary grey) → button. Phone: button full width under the text. From 768px: text left, button
right (auto width, min 200px), vertically centred. Button: **secondary** (one primary per view; a
row is never the single main action of the page).

**Offer row** (row 4): the whole row opens the offer (`OrderDetailsPage` / `SaleDetailsPage`, as
today, keyboard Enter/Space). **The price is always at the right end of the row** (`.body`, 600,
tabular numbers, right-aligned, so amounts line up down the list) and the status chip sits just
before it (approved Oct 14).

- Phone: title · price on the first line, date (`.small`, muted) · chip on the second.
- From 768px: title over date on the left, then the chip, then the price.
- "Pay" (`Home.ctaPay`, organizer, pending payment) is a secondary button on its own line under the
  row: full width on phones, right-aligned from 768px, so it never pushes the price out of line.
- Hover (pointer only): the title underlines.

Status chip (`StatusChip`, existing library component):

| Status key | Text | Chip |
| --- | --- | --- |
| `Home.activityNeedsYourAction` | Needs your action | active (black outline) |
| `Home.activityFinalOfferAccepted` | Final offer accepted | success |
| `Home.activityWaitingForOtherParty` | Waiting for {name} | neutral |
| `Home.activityYouResponded` | You responded | neutral |
| `Home.activityFinalOfferRejected` | Final offer rejected | neutral |

## States (conditions unchanged, from `HomeNextSteps`)

| User | Condition | Shows |
| --- | --- | --- |
| DJ | not approved | Under review card: `pendingApprovalTitleDj` / `MessageDj`, "Set Up Payouts" → `StripePayoutPage` |
| Organizer | not approved | Under review card: `pendingApprovalTitleOrganizer` / `MessageOrganizer`, "Find a DJ" → `SearchPage` |
| DJ | approved, no published profile | What's next: `approvedProfileTitleDj`, "Create Your Profile" → `NewListingPage` |
| DJ | approved, published profile, no payouts | What's next: `manageListingTitleDj`, "Edit" → `EditListingPage` |
| DJ | no payouts (`!stripeConnected`) | + row `completePayoutTitleDj` / `profileReadyPayoutSubtitleDj`; with offers `blockedBookingTitleDj` / `SubtitleDj`; "Set Up Payouts" |
| DJ | published profile + payouts | no What's next |
| Organizer | approved, transactions loaded, no offers | What's next: `findNextDjTitle`, "Find a DJ" → `SearchPage` |
| Both | offers exist | Your activity |

## Removed looks (UI only)

- Purple borders (`rgba(105, 56, 239, .18)`) on the first card, the under-review card and offers
  waiting for payment; card shadows; 12px radius. Cards follow `SectionCard` (8px, 1px border).
- Grey "Welcome back" title becomes the black `.h2` page title.
- Status pills in yellow/green become `StatusChip`. "Final offer rejected" was green; it becomes neutral.

## Decisions (Oct 14, 2026)

1. **Approved:** one `SectionCard` per group ("What's next", "Your activity"), items as rows inside.
2. **Approved:** the item rows (action row, link row, hover) are a library piece: added to
   `design/components.html` and the design-system-rules.md table.
3. **Approved:** every row button is secondary, including "Pay".
4. **Open, recommended:** a DJ with a published profile, payouts set and no offers sees only
   "Welcome back" today. Recommendation: show the existing "Keep your public profile up to date"
   row (`manageListingTitleDj` / `SubtitleDj`, "Edit") in What's next, so the page never ends at a
   greeting. Same words as today; the condition gains `isDj && hasPublishedProfile &&
   hasPayoutDetails && offerTxs.length === 0`. This is a small logic change, so it needs Zoha's yes.
   **Status: open.** (Change this line to "Status: approved" to have the prompt build it.)

## Noted, not changed (content or logic, outside this redesign)

- A DJ with no profile and no payouts sees "Your profile is ready, but you need to set up your
  payouts…" (`profileReadyPayoutSubtitleDj`). Copy issue, not UI.
- `OwnListingsSummary` returns nothing for DJs (`if (isDj) return null`) and organizers have no
  listings, so it never shows for our two user types; its "Create your public profile" box is
  unreachable. Leave it as is.
- `en.json` has `Home.pendingApprovalMessageOrganizer` and `Home.pendingApprovalCtaOrganizer` twice;
  the second ("While you wait, start exploring DJs for your next event." / "Find a DJ") wins.
- The logged-in header is header stage 2 ([header.md](header.md)); the mockup shows today's items only.
