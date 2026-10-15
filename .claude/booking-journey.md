# Booking journey: from "Send offer" to payment

Oct 15, 2026 · design approved, built on the current wiring (wiring bugs next)

This maps every screen the organizer and the DJ see from the moment the organizer sends an offer
(offer builder, already redesigned) until the organizer has paid. It covers what each screen shows
today, what is wrong with how it looks, and a proposed redesign. **UI-only:** every word quoted below
is existing text (`src/translations/en.json`; check Console `translations.json` before building, it
may differ). Anything that would change logic, copy or which content shows is listed under
"Journey issues" for a decision, not built into the proposal.

Pages involved:

| Page | Route | Code |
| --- | --- | --- |
| Offer builder (done) | `/l/:slug/:id/request-quote` | `RequestQuotePage` |
| Transaction page (organizer) | `/order/:id` | `TransactionPage` → `TransactionPanel` |
| Transaction page (DJ) | `/sale/:id` | same |
| Checkout | `/l/:slug/:id/checkout` | `CheckoutPageWithPayment` |

Process: `default-negotiation`, state copy in `TransactionPage.stateDataNegotiation.js`.

## 1. The journey, step by step

Organizer = customer, DJ = provider. Titles and leads come from `PanelHeading`.

| # | Who | State | Title · lead (existing) | What they can do | Shown today |
| --- | --- | --- | --- | --- | --- |
| 0 | Organizer | – | "Complete your offer" | "Send offer" → step 1 | Offer builder (redesigned) |
| 1 | Organizer | `quote-requested` | "Your booking request has been sent to {providerName}" · "You’ll be notified when {providerName} reacts to your booking request." | Secondary "Withdraw request" | Listing image + avatar, listing title, order breakdown. **No offer details card** |
| 2 | DJ | `quote-requested` | "{customerName} sent a booking request" | Primary "Accept offer" (→ modal "Anything to note?", "Accept offer") · "Make a counteroffer" (→ modal: "Proposed fee", "Proposed set start time (optional)", "Proposed set duration (optional)", "Fees and logistic notes", "Additional note") · "Reject offer" (→ modal "Reject this offer?" + reason) | Offer details card (4 sections), order breakdown, own listing image |
| 3a | DJ | `offer-pending` (accepted) | "You just accepted an offer." · "{customerName} can now react to your offer." | Nothing | Breakdown only |
| 3b | DJ | `offer-pending` (counteroffer) | "Your counteroffer has been sent!" · "{customerName} has been notified and can now review your proposed changes." | Nothing | Breakdown only |
| 4 | Organizer | `offer-pending` | "{providerName} made an offer." · "You can now react to the offer." | Primary "Accept and pay" → step 7 · "Make final offer" → step 5 · "Reject the counteroffer" | Offer details; on a counteroffer the banner "The artist has proposed changes to your offer as highlighted in red" and red "Proposed: {value}" lines |
| 5 | Organizer | `customer-offer-pending` | "You made a counteroffer." · "{providerName} can now react to the offer." | "Withdraw counteroffer" | Breakdown |
| 6 | DJ | `customer-offer-pending` | "{customerName} made a counteroffer." · "You can now react to the offer." | Primary "Accept final offer" · "Reject final offer" (→ confirm "Reject this counter-offer? …") | Offer details (agreed values) |
| 6→4 | Organizer | `offer-pending` after the final offer | Accepted: "{providerName} has accepted your final offer!" · "Make the payment to confirm this booking." Rejected: step 4 title | Only "Accept and pay" (no more offers) | as step 4 |
| 7 | Organizer | checkout | "Complete order" | Card form under "Payment", "Save card details for future orders", primary "Confirm and pay {totalPrice}" | Mobile: listing image, listing title, breakdown, form. Desktop: form left; right card with image, avatar, listing title, "Order breakdown" |
| 7 | DJ (meanwhile) | `pending-payment` | "Payment hasn't been confirmed yet." | Nothing | – |
| 8 | Organizer | `offer-accepted`, arrives with `?bookingRequestSuccess=1` | "The DJ has received your request. Check your inbox for further communication or confirmation from the DJ." | Nothing | Minimal view: offer details, no lead, no buttons |
| 8 | DJ | `offer-accepted` | "Your offer has been accepted." · "Deliver the order and notify {customerName} to receive your payment." | (delivery: out of scope) | Offer details |

## 2. What is wrong with the presentation today

The transaction page and checkout are still the stock template. Both are parked in
`layouts.md`; nothing on them uses the design system yet.

1. **The artist shows up three times per screen.** Transaction page: mobile image + avatar, a
   second listing title under the H1, and on desktop the aside repeats image, avatar and title.
   Checkout repeats the same pattern (`MobileListingImage`, `detailsHeadingMobile`,
   `DetailsSideCard`). The offer builder already solved this with one `PageHeader` (64px image,
   DJ name as eyebrow link); after "Send offer" that header disappears and the old template pattern
   comes back.
2. **The price shows up in up to five places, each styled differently:** the "Fee" row in the offer
   details (special `rowValueFee` style), red "Proposed: €…" lines, the order breakdown in the aside
   (desktop) and again in the main column (mobile), the checkout breakdown (twice again), and the pay
   button. There is no single place the organizer can look for "what am I paying".
3. **The frame jumps between stages.** Offer builder: one 760px column on beige. Transaction page:
   template two-column with a big image card on the right. Checkout: a different two-column. The
   organizer never sees the same summary in the same place twice.
4. **Red means error everywhere else.** DJ proposals are shown in `--colorFail` red, the same as a
   validation error, so a counteroffer reads as "something went wrong".
5. **Status is only a sentence.** Home already shows a status chip per booking ("Offer pending",
   "Counteroffer", "Pending payment" from `InboxPage.default-negotiation.*`). The transaction page
   has no chip, so Home and the page do not visibly match.
6. **Actions have no hierarchy.** Up to three template buttons stacked with equal weight
   ("Accept and pay", "Make final offer", "Reject the counteroffer"). On phones they sit in a fixed
   bar with a 120px spacer.
7. **Five modals, five looks** (`AcceptOfferModal`, `ProposeChangesModal`, `DeclineOfferModal`,
   `MakeCounterOfferModal`, `RejectCounterOfferConfirmModal`): template inputs, blue focus, native
   time inputs instead of `TimeSelect`, green buttons.
8. **Offer details do not match the builder.** Same four section titles as the builder ("Event
   details", "Set details", "Fee and logistics", "Technical setup"), but as a plain list with
   template headings, so the organizer does not recognise their own form.

## 3. Proposed redesign

### 3.1 One frame for the whole journey

Transaction page and checkout both use **Split · `summary`** (1120px, main left, 360px sticky
summary right, from 1024px). The summary card then sits in the same place from "offer sent" to
"paid"; only the main column changes (status → offer details → payment form). Checkout is already
decided as Split; this extends it back to the transaction page.

**Question for layouts.md:** on phones Split · summary puts the summary card *above* the main column,
and the page header is the first thing *in* the main column. That makes a price card the first thing
on every phone screen, above "Your booking request has been sent…". Proposal: on `summary` pages the
`PageHeader` sits above both columns (phone order: header → summary → main).

### 3.2 Artist summary = the page header (as in the offer builder)

Every stage uses the same `PageHeader` as the offer builder:

- image: the listing's first image, 64px square
- eyebrow: the DJ name (listing title) as a link to the public profile
- title: the state title (table above), lead: the state lead
- new: the **status chip** next to the eyebrow, with the existing Inbox status label for that state
  (the same chip as on Home)

The duplicated image, avatar and title blocks are removed from the page render (component files
stay). The artist is never repeated in the summary card.

### 3.3 Price summary = one shared card

One card, the same on the transaction page, checkout and after payment: a `SectionCard` titled
"Order breakdown" (`CheckoutPage.default-negotiation.orderBreakdown`), no number.

- rows: "Performance fee" · "{marketplaceName} fee (5%)*" · "VAT (21% on {marketplaceName} fee)*"
  in `.body`, amounts right-aligned
- 1px rule, then "Total payment" in 600 (organizer) or "You receive" (DJ)
- footnotes ("* {marketplaceName} fee is 5% of the performance fee." etc.) in `.small` muted
- desktop: the step's actions sit in this card, under the total: one primary full width, then the
  secondary, then the minor action as a text link

The "Fee" row in the offer details stays (it is part of the offer) but loses its special style.

### 3.4 Offer details mirror the builder

Read-only `SectionCard`s with the builder's four titles, **without numbers** (numbers are only for
real sequences, like form steps). Label/value pairs in the builder's row grid (`.row2` from 768px),
labels in `.small` muted, values in `.body`. The organizer sees the same structure they filled in.

**Proposed changes** (DJ counteroffer): original value muted with a line-through, "Proposed:
{value}" underneath in 600 black. No red. The banner becomes a plain content card at the top of the
details. **Conflict:** the banner text says "as highlighted in red". Either keep red as an approved
exception, or change the Console wording.

### 3.5 Actions

One primary per screen, per state:

| State · role | Primary | Secondary | Text link |
| --- | --- | --- | --- |
| Booking request sent · organizer | – | "Withdraw request" | – |
| Booking request · DJ | "Accept offer" | "Make a counteroffer" | "Reject offer" |
| Offer pending · organizer | "Accept and pay" | "Make final offer" | "Reject the counteroffer" |
| Counteroffer · organizer | – | "Withdraw counteroffer" | – |
| Counteroffer · DJ | "Accept final offer" | – | "Reject final offer" |
| Checkout | "Confirm and pay {totalPrice}" | – | – |

Phones: the primary sits in a sticky bottom bar (same pattern as the public profile's sticky
button); the secondary and the text link go at the end of the main column.

### 3.6 Modals

Add one **Modal** pattern to the UI library first: white card, 8px radius, `.h3` title, `.body`
description, library fields (`TimeSelect` for "Proposed set start time", duration select for
"Proposed set duration", textarea, input with unit "€" for "Proposed fee"), footer with primary +
secondary "Cancel". Then restyle all five modals with it.

### 3.7 Checkout

- main: `PageHeader` (as 3.2, title "Complete order"), one `SectionCard` "Payment" with the Stripe
  card element styled to look like a 48px library input, the saved card choice, the save-card
  checkbox as an outlined checkbox, the authorisation text in `.small` muted, and the primary
  "Confirm and pay {totalPrice}" (full width on phones)
- side: the same "Order breakdown" card as 3.3, without actions
- **Question:** `layouts.md` says the checkout summary holds "DJ and price breakdown". With the DJ in
  the header (3.2), the summary would hold only the price. Which one?

### 3.8 After payment

Same frame as the transaction page: header (with the "Waiting for delivery" chip), offer details,
the "Order breakdown" card. See journey issue 1 for the title.

## 4. Journey issues (not UI-only, need a decision)

**Now tracked in [bugs.md](bugs.md) section 7** (Oct 15); the list below is the original review.

1. **Wrong message after paying.** After payment the organizer lands on
   `/order/:id?bookingRequestSuccess=1`, which forces the `pending-payment` title "The DJ has
   received your request. Check your inbox…", although the booking is paid. The flag is kept in
   `sessionStorage`, so that view repeats on every visit in the same session. The existing
   `offer-accepted` text ("Order placed successfully!" · "You'll be notified when {providerName}
   delivers the order.") would fit, but switching is a logic change.
2. **DJ accepts as-is, organizer reads "counteroffer".** When the DJ accepts unchanged, the
   organizer sees "{providerName} made an offer." and a "Reject the counteroffer" action, though
   there was no counteroffer.
3. **Final offer labelled as counteroffer.** After "Make final offer" the organizer sees "You made a
   counteroffer." The key `customer.finalOfferPending.*` exists but is only used in the DJ's
   `update-pending` branch.
4. **Organizer cannot see what they sent.** In "Booking request sent" the offer details card is not
   shown to the organizer (`showOfferDetailsCard` is only set for the DJ there).
5. **DJ notes are not visible on the page.** The "Anything to note?" note and the rejection reason
   are sent as messages, but the message feed is hidden for this process, so the organizer can only
   see them by email (if at all).
6. **`OfferSummaryBlock` is never shown** (`showOfferSummaryBlock` is set by no state). Either it
   becomes the base of the price card (3.3) or it stays unused.
7. **Template words:** "order", "Complete order", "delivers the order", "Order placed
   successfully!" and "booking request" vs "offer" for the same thing. Copy change in Console.

## 5. Decisions (Oct 15)

- [x] Split · summary for the transaction page too; on desktop the header sits in the left column and the summary is level with the first offer card, or with the title when the page has only the header (changed after the build review)
- [x] No status chips for now
- [x] Summary card = price only ("Booking summary"); the DJ is in the header
- [x] Proposed changes in **red**, option B (`design/proposed-changes-options.html`): note as a red caption with a dot, changed fields in a pale red row, proposed values red
- [x] Actions below 1024px: primary + secondary sticky (side by side from 768px, stacked on phones); reject is a text link at the end
- [x] Modal pattern in the library; all five pop-ups use it
- [x] Page header revised: eyebrow on its own line, image beside title + lead
- [x] Copy = live Console text. Rules: no "!", no full stop on one-sentence lines, "offer · counteroffer · final offer". Copy fixes go into Console and en.json together
- [x] The offer shows in every state as one collapsible "Offer summary" card under the title (header: "Offer summary" — new key `OfferDetailsCard.offerSummaryTitle`, approved by Zoha Oct 15, add to Console — venue · date, chevron; the proposed-changes note stays visible when closed). Open when the viewer has to react, closed while waiting. This resolves journey issue 4 (Oct 15)
- [x] Final offer pending: both sides see the fee as previous offer (struck) + "Proposed: €…" in red in a pale red row; previous amount from `metadata.offers`; the DJ's earlier changes read as agreed values; the DJ also gets the note "The event organizer has proposed changes to your offer as highlighted in red" (new key `OfferDetailsCard.proposedChangesBannerOrganizer`, approved by Zoha Oct 15, add to Console) (Oct 15)
- [ ] Journey issues 1–3, 5–7 and the wrong live copy (design file tags): Zoha checks the wiring next

## 6. Built (Oct 15)

- `LayoutSplit` (summary), `PageHeader` revised, `lineupModal.module.css`, split/modal tokens
- `NegotiationPanel` replaces `TransactionPanel` for the negotiation process only
- `OfferDetailsCard`, `ActionButtons` (variants `stack` / `bar`), the five pop-ups restyled
- Checkout (negotiation only) on `LayoutSplit`
- Offer sent / booking offer have no line items (`request-quote` sets none), so there is no Booking summary yet: on desktop the actions sit in an untitled card in the side column; below 1024px the sticky bar as usual. Showing the price here needs `privileged-set-line-items` on `request-quote` (process change, wiring pass)
- Stripe payment form restyled (fields, checkbox, button). **Not yet:** the copy changes in Console

Next after the decisions: `design/booking-journey.html` with Mobile, iPad 768 and Desktop views of
steps 1, 2, 4, 7 and 8, then the build prompts.
