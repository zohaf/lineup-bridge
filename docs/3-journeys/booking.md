# Booking journey: from "Send offer" to payment

2026-10-15 · built · [Figma](https://www.figma.com/design/uUt1bfNw7imHngWi1QFXGJ?node-id=26-1210) · code: `RequestQuotePage`,
`TransactionPage` → `NegotiationPanel`, `CheckoutPageWithPayment`

Every screen the organizer and the DJ see from "Send offer" until the organizer has paid. Rules and
titles: [../1-product/negotiation-flow.md](../1-product/negotiation-flow.md). UI-only: every word is
live Console text or `en.json`.

| Page | Route | Code |
| --- | --- | --- |
| Offer builder | `/l/:slug/:id/request-quote` | `RequestQuotePage` |
| Transaction page | `/order/:id` (organizer), `/sale/:id` (DJ) | `TransactionPage` → `NegotiationPanel` |
| Checkout | `/l/:slug/:id/checkout` | `CheckoutPageWithPayment` |

## Steps

| # | Who | State | Can do |
| --- | --- | --- | --- |
| 0 | Organizer | – | "Send offer" |
| 1 | Organizer | `quote-requested` | "Withdraw request" |
| 2 | DJ | `quote-requested` | "Accept offer" · "Make a counteroffer" · "Reject offer" |
| 3 | DJ | `offer-pending` | – (waiting) |
| 4 | Organizer | `offer-pending` | "Accept and pay" · "Make final offer" · "Reject the counteroffer" |
| 5 | Organizer | `customer-offer-pending` | "Withdraw counteroffer" |
| 6 | DJ | `customer-offer-pending` | "Accept final offer" · "Reject final offer" |
| 7 | Organizer | checkout | "Confirm and pay {totalPrice}" |
| 8 | Both | `offer-accepted` | – (performance stage) |

## Problems the redesign solved

1. The DJ appeared three times per screen (image, avatar, title, repeated in the aside).
2. The price appeared in up to five places, each styled differently.
3. The page frame changed between offer builder, transaction page and checkout.
4. Five pop-ups with five looks; actions stacked with equal weight.
5. Offer details did not match the builder the organizer filled in.

## Decisions

- **One frame:** transaction page and checkout use `LayoutSplit` · summary. Desktop: header in the left
  column, summary card level with the first offer card.
- **Header:** the offer builder's `PageHeader` on every step (eyebrow on its own line, image beside
  title and lead). The DJ is shown only here.
- **Summary card:** price only ("Booking summary"); on checkout without actions.
- **Offer summary:** one collapsible card under the title in every state ("Offer summary", venue · date,
  chevron). Open when the viewer has to react, closed while waiting.
- **Proposed changes in red** (approved exception): red caption with a dot, changed fields in a pale red
  row, previous value struck through, proposed value red. Previous amount from `metadata.offers`.
- **Actions:** one primary per screen. Below 1024px primary + secondary in a sticky bar (side by side
  from 768px); reject is a text link at the end.
- **Pop-ups:** one Modal pattern in the library (`lineupModal.module.css`); all five use it.
- No status chips for now. Copy = live Console text; fixes go into Console and `en.json` together.
