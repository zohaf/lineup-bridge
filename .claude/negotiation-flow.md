# Business rules: negotiation flow

Oct 15, 2026 · Zoha Fard · part of [business-rules.md](business-rules.md)

How an offer becomes a booking. Organizer = event organizer (Sharetribe customer), DJ = provider.
Built on Sharetribe's `default-negotiation` process, which has more paths than ours: only the
actions below are product.

## Rules

- **Three rounds at most:** offer (organizer) → counteroffer (DJ) → final offer (organizer). After
  the final offer the DJ can only accept or reject.
- Terms: "offer", "counteroffer", "final offer". Never "counter offer" or "counter-offer".
- Each action is its own outcome with its own title. Accepting is not a counteroffer; withdrawing is
  not a rejection.
- The title is what the person sees right after their action (after the pop-up, if there is one).
- **Any rejection ends the negotiation** (Zoha, Oct 15). Nobody can act on it afterwards.
- **Our titles live in code, not Console.** They use our own keys that Console does not have, so
  Console cannot overwrite them.

## Actions

| # | Who | Action | Pop-up |
| --- | --- | --- | --- |
| 1 | Organizer | Make an offer | – (offer builder) |
| 2 | Organizer | Withdraw offer | – |
| 3 | DJ | Accept offer | "Anything to note?" |
| 4 | DJ | Make a counteroffer | counteroffer form |
| 5 | DJ | Reject offer | reason |
| 6 | Organizer | Accept and pay (counteroffer, or offer the DJ accepted) | checkout |
| 7 | Organizer | Reject the counteroffer | reason |
| 8 | Organizer | Make final offer | final offer form |
| 9 | Organizer | Withdraw final offer | – |
| 10 | DJ | Accept final offer | note |
| 11 | DJ | Reject final offer | confirm |

## Title after each action

**Approved by Zoha, Oct 15.**

Grammar, one pattern per kind of action:

- Sending: "Your {offer / counteroffer / final offer} has been sent"
- Responding: "You accepted / rejected the {offer / counteroffer / final offer}"
- Withdrawing: "You withdrew your {offer / final offer}"
- Lead: "{name} has been notified", plus what they can do next when there is a next step.
- No "!". No full stop on one-sentence lines.

| # | Action | Title | Lead |
| --- | --- | --- | --- |
| 1 | Organizer makes an offer | Your offer has been sent | {providerName} has been notified and can now review your offer |
| 2 | Organizer withdraws the offer | You withdrew your offer | {providerName} has been notified |
| 3 | DJ accepts the offer | You accepted the offer | {customerName} has been notified and can now complete the payment to confirm the booking |
| 4 | DJ makes a counteroffer | Your counteroffer has been sent | {customerName} has been notified and can now review your counteroffer |
| 5 | DJ rejects the offer | You rejected the offer | {customerName} has been notified |
| 6 | Organizer pays | Your booking is confirmed | Your payment has been received. {providerName} will receive their payout after the performance |
| 7 | Organizer rejects the counteroffer | You rejected the counteroffer | {providerName} has been notified |
| 8 | Organizer makes a final offer | Your final offer has been sent | {providerName} has been notified and can now accept or reject it |
| 9 | Organizer withdraws the final offer | You withdrew your final offer | You can still accept {providerName}'s counteroffer |
| 10 | DJ accepts the final offer | You accepted the final offer | {customerName} has been notified and can now complete the payment to confirm the booking |
| 11 | DJ rejects the final offer | You rejected the final offer | {customerName} has been notified |

Row 6, checkout page title (before paying): "Complete your booking".

### Who controls the words

Console text loads when the app starts and replaces `en.json` for every key Console has. So these
titles use new keys (`NegotiationTitle.*`) that exist only in our translation files.

## Open decisions (Zoha)

- **What the organizer sees after 3.** Proposal: "{providerName} accepted your offer" · "Complete
  the payment to confirm the booking", only "Accept and pay".
- **What the other person sees after each action** (only the actor's view is approved).

## How the code picks a title

Title = an override from `TransactionPage.stateDataNegotiation.js`, else
`{role}.{Sharetribe state}.title`. Several actions land in the same Sharetribe state (3 and 4 →
`offer-pending`; 2 and 5 → `request-rejected`), so the code must tell them apart by the last
transition or saved data. "Accept offer" and "Make a counteroffer" both run
`make-offer-from-request`; only a counteroffer saves `protectedData.proposedChanges`. Bug:
[bugs.md](bugs.md) 7.2.

---

# After payment: performance and payout

Discovery Oct 15 (engineer + product owner).

## What the process does

Paid → DJ marks the performance done → organizer confirms (payout to the DJ) or requests changes
→ DJ "delivers the changes" → organizer confirms. Timers in `process.edn`:

- **75 days after payment, if the DJ has not marked the performance: auto-cancel with full refund.**
  Also from "changes requested". A booking made more than ~10 weeks ahead is refunded before the
  gig happens.
- The DJ can mark the performance done only after its scheduled end (offer date + start time +
  set length, counteroffer values if accepted). Hidden in the UI and refused by the server
  (`transition/deliver` is privileged).
- 24 hours after the DJ marks it, the performance is confirmed automatically (payout), per the
  Payment Terms 2.3–2.4 and Terms 8.5–8.7 (24 hours after the scheduled end). The organizer gets a
  reminder after 12 hours.
- Reviews exist in the process but are hidden (`suppressReviewUi`); 7 days later it closes.

## Titles from payment to completion

**Approved by Zoha, Oct 15**, except "Changes requested" (open, bugs.md 8.5).

Title · lead. "Today" = live Console text, or the code override.

| Stage | Organizer today | Organizer proposed | DJ today | DJ proposed |
| --- | --- | --- | --- | --- |
| Paying (15 min) | {customerName}, you have not confirmed payment yet. | Your payment is being processed | Payment hasn't been confirmed yet. | {customerName} is completing the payment |
| Payment expired | no text (key missing, shows the key) | Your payment was not completed · The booking was not confirmed | no text | {customerName} did not complete the payment · The booking was not confirmed |
| Booking confirmed | Booking confirmed! · Your payment has been received. {providerName} will receive their payout after the performance is completed (hidden by bug 7.1) | Your booking is confirmed · Your payment has been received. {providerName} will receive their payout after the performance | Your booking is confirmed! · Your payout will be released after you complete the performance. | Your booking is confirmed · Your payout will be released after {customerName} confirms the performance |
| DJ marked the performance | The performance has been completed · Please confirm that the DJ completed the performance as agreed | {providerName} marked the performance as completed · Confirm the performance within 24 hours, or it is confirmed automatically | The performance has been completed · {customerName} can accept the what you delivered or request changes. | You marked the performance as completed · {customerName} has been notified and can now confirm the performance |
| Organizer confirmed | Booking complete · This booking is complete. | You confirmed the performance · {providerName} has been notified and will receive their payout | Booking complete · This booking is complete. | {customerName} confirmed the performance · Your payout has been released |
| Confirmed automatically (24 hours) | Booking complete · This booking is complete. | The performance has been confirmed · It was confirmed automatically after 24 hours | Booking complete · This booking is complete. | The performance has been confirmed · Your payout has been released |
| Changes requested | Changes requested · You'll be notified when {providerName} delivers the changes. | open (bugs.md 8.5) | Changes requested · Deliver the requested changes and notify {customerName} to receive your payment. | open (8.5) |
| Canceled by the team | The order was canceled. | The booking was canceled · Your payment has been refunded | The order was canceled. | The booking was canceled · {customerName} has been refunded |
| 7 days after confirming | Booking complete · This booking is complete. | Booking complete · This booking is complete | same | same |

## UI

All states render in `NegotiationPanel` (redesigned). Not redesigned: `RequestChangesModal`
(template modal, template text "Did the delivered order match…"). `DisputeModal` is not reachable
in this process. Bug: after paying, the `bookingRequestSuccess` flag forces the payment title and
**hides all buttons for the rest of the browser session**, including "Confirm performance".

## Decisions (Zoha, Oct 15)

- **The performance date and time decide, not the payment date.** Neither "I've completed the
  performance" nor "Confirm performance" before it; no refund before it. Bugs:
  [bugs.md](bugs.md) section 8.
- Refunds follow the terms (after MVP).
- Titles from payment to completion approved; "Request changes" still open.
