# Negotiation, payment and performance

2026-10-15 · approved (open items marked) · Zoha Fard · code: `TransactionPage.stateDataNegotiation.js`,
`server/api-util/negotiation.js`

How an offer becomes a booking. Built on Sharetribe's `default-negotiation` process, which has more
paths than ours: only the actions below are product.

## Rules

- **Three rounds at most:** offer (organizer) → counteroffer (DJ) → final offer (organizer). After the
  final offer the DJ can only accept or reject.
- **Any rejection ends the negotiation.** Nobody can act on it afterwards.
- Terms: "offer", "counteroffer", "final offer". Never "counter offer" or "counter-offer".
- Each action has its own outcome and title. Accepting is not a counteroffer; withdrawing is not a rejection.
- The title is what the person sees right after their action (after the pop-up, if any).
- The content of each offer is kept. On a counteroffer or final offer the earlier content stays visible
  and the proposed changes are marked.
- Our titles use our own keys (`NegotiationTitle.*`), which Console does not have, so Console cannot
  overwrite them. (Console text replaces `en.json` for every key Console has.)

## Actions and titles

Grammar: sending "Your {offer} has been sent" · responding "You accepted / rejected the {offer}" ·
withdrawing "You withdrew your {offer}" · lead "{name} has been notified", plus the next step if there
is one. No "!". No full stop on one-sentence lines.

| # | Who | Action | Pop-up | Title | Lead |
| --- | --- | --- | --- | --- | --- |
| 1 | Organizer | Make an offer | offer builder | Your offer has been sent | {providerName} has been notified and can now review your offer |
| 2 | Organizer | Withdraw offer | – | You withdrew your offer | {providerName} has been notified |
| 3 | DJ | Accept offer | "Anything to note?" | You accepted the offer | {customerName} has been notified and can now complete the payment to confirm the booking |
| 4 | DJ | Make a counteroffer | form | Your counteroffer has been sent | {customerName} has been notified and can now review your counteroffer |
| 5 | DJ | Reject offer | reason | You rejected the offer | {customerName} has been notified |
| 6 | Organizer | Accept and pay | checkout ("Complete your booking") | Your booking is confirmed | Your payment has been received. {providerName} will receive their payout after the performance |
| 7 | Organizer | Reject the counteroffer | reason | You rejected the counteroffer | {providerName} has been notified |
| 8 | Organizer | Make final offer | form | Your final offer has been sent | {providerName} has been notified and can now accept or reject it |
| 9 | Organizer | Withdraw final offer | – | You withdrew your final offer | You can still accept {providerName}'s counteroffer |
| 10 | DJ | Accept final offer | note | You accepted the final offer | {customerName} has been notified and can now complete the payment to confirm the booking |
| 11 | DJ | Reject final offer | confirm | You rejected the final offer | {customerName} has been notified |

Open: what the organizer sees after 3 (proposal: "{providerName} accepted your offer" · "Complete the
payment to confirm the booking", only "Accept and pay"); what the other person sees after each action.

## After payment

Paid → DJ marks the performance done → organizer confirms (payout) or requests changes → DJ delivers
the changes → organizer confirms. Process timers (`process.edn`):

- 75 days after payment without the DJ marking the performance: auto-cancel, full refund.
- 14 days after the DJ marks it: confirmed automatically (payout).
- Reviews exist in the process but are hidden (`suppressReviewUi`).

Decisions:
- The performance date and time decide, not the payment date: no "I've completed the performance", no
  "Confirm performance" and no refund before it. (Not in code yet.)
- Refunds follow the terms (after MVP).

| Stage | Organizer | DJ |
| --- | --- | --- |
| Paying | Your payment is being processed | {customerName} is completing the payment |
| Payment expired | Your payment was not completed · The booking was not confirmed | {customerName} did not complete the payment · The booking was not confirmed |
| Booking confirmed | Your booking is confirmed · Your payment has been received. {providerName} will receive their payout after the performance | Your booking is confirmed · Your payout will be released after {customerName} confirms the performance |
| DJ marked the performance | {providerName} marked the performance as completed · Confirm the performance within 14 days, or it is confirmed automatically | You marked the performance as completed · {customerName} has been notified and can now confirm the performance |
| Organizer confirmed | You confirmed the performance · {providerName} has been notified and will receive their payout | {customerName} confirmed the performance · Your payout has been released |
| Confirmed automatically | The performance has been confirmed · It was confirmed automatically after 14 days | The performance has been confirmed · Your payout has been released |
| Changes requested | open | open |
| Canceled by the team | The booking was canceled · Your payment has been refunded | The booking was canceled · {customerName} has been refunded |
| Closed | Booking complete · This booking is complete | same |

## How it maps to Sharetribe

| Business step | Transition | Actor |
| --- | --- | --- |
| Offer | `request-quote` | customer |
| Counteroffer | `make-offer-from-request` | provider |
| Final offer | `customer-make-counter-offer` | customer |
| DJ accepts / rejects final offer | `provider-accept-counter-offer` / `provider-reject-counter-offer` | provider |
| Organizer pays | `request-payment-to-accept-offer` → `confirm-payment` | customer |

- The organizer's offer is stored as `protectedData.offerAmount` (no line items). Priced offers are in
  `metadata.offers` (`[0]` counteroffer, `[1]` final offer), amounts in subunits. The final price is the
  latest accepted offer in `metadata.offers` and the line items.
- "Accept offer" and "Make a counteroffer" both run `make-offer-from-request`; only a counteroffer saves
  `protectedData.proposedChanges`. Several actions share a state (3 and 4 → `offer-pending`; 2 and 5 →
  `request-rejected`), so the code tells them apart by the last transition or saved data.
- **Server guard:** after `customer-make-counter-offer`, `server/api/transition-privileged.js` rejects any
  further offer transition with HTTP 400 (`throwErrorIfOfferIsSubmittedAfterCustomerFinalOffer`). Hiding
  buttons alone is not enough.
- Title = override in `TransactionPage.stateDataNegotiation.js`, else `{role}.{state}.title`. All states
  render in `NegotiationPanel`.
