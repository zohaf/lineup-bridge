# Bugs and cleanup

Things to fix or remove later. Not part of the current redesign work.

## 1. Inbox page is redundant

The logged-in home page (`/p/home`) already shows the user's offers (built in
`src/containers/CMSPage/CMSPage.js`, `HomeNextSteps`, using the Inbox data). The separate Inbox
page (`/inbox/:tab`, `src/containers/InboxPage/`) is not needed in our app.

**To find out:** which link sends the user to `/inbox`, so it can point to the home page instead.

What the code shows so far (2026-10-12):

- **Transaction emails do not link to the inbox.** All templates in
  `ext/transaction-processes/default-negotiation/templates/` link to `/order/:id`, `/sale/:id` or
  `/u/:id`.
- **The redirect that does land on the inbox:** `src/containers/TransactionPage/TransactionPage.js`
  lines 587 and 594. When someone opens an `/order/:id` or `/sale/:id` link that does not belong to
  the logged-in account (for example an email link opened while logged in as another user), they are
  redirected to `/inbox/orders` or `/inbox/sales`. This is the likely way users from an email
  CTA end up in the inbox.
- **Still to check:** Sharetribe's built-in emails that are edited in Console, not in this repo
  (for example email verification, password reset, new message). Check their links in Console >
  Build > Email texts / templates.
- No `NamedLink` in the app points to `InboxPage`. The topbar only uses the name to highlight the
  current page.

**Note:** the home page loads its data from the Inbox code (`CMSPage.duck.js` imports
`InboxPage.duck`, `CMSPage.js` imports `InboxPage.stateData`). Removing the Inbox page means keeping
or moving that data code, not deleting the folder.

## 2. Manage listings page: probably unused

`/listings` (`src/containers/ManageListingsPage/`). We don't think the app uses it.

What the code shows so far (2026-10-12):

- No link in the app goes to `/listings`. No email template links to it.
- The topbar "My public profile" item (desktop `TopbarDesktop.js` line 82, mobile
  `TopbarMobileMenu.js` line 162) uses the `ManageListingsPage` name only to highlight the menu item.
  Clicking it runs `onMyPublicProfileClick`, it does not open `/listings`.
- **The home page reuses its parts:** `CMSPage.js` imports `ManageListingCard` and
  `getOwnListingsById`, and `CMSPage.duck.js` and `TopbarContainer.js` import `queryOwnListings` from
  `ManageListingsPage.duck`. Removing the page means moving these, not deleting the folder.
- **Still to check:** links set in Console (topbar custom links, footer, CMS pages) and any
  bookmarks or old emails pointing to `/listings`.

## 3. Make offer page: probably unused (and the names are confusing)

The page we redesigned as "Complete your offer" is **`RequestQuotePage`**
(`/l/:slug/:id/request-quote`, `src/containers/RequestQuotePage/`). In the code, "request quote"
means the organizer's offer to a DJ.

**`MakeOfferPage`** (`/l/:slug/:id/make-offer`, `src/containers/MakeOfferPage/`) is a different
page from the Sharetribe template: the **provider (DJ)** makes an offer on a listing that is a
*request* (unit type `request`). See `handleOrderSubmit` in
`src/containers/ListingPage/ListingPageCarousel.js` (around line 286): `request` listings go to Make
offer, `offer` listings go to Request quote.

**To find out:** whether any listing type in Console uses the `request` unit type. If none does,
Make offer is unused and can be removed (after checking its imports, like pages 1 and 2).

## 4. Listing page vs. public profile: which page is which

- **Listing page** (`/l/:slug/:id`, `src/containers/ListingPage/`): a DJ's profile as event
  organizers see it, with the booking box. In Sharetribe a DJ profile is a *listing*. Console decides
  its variant (carousel or cover photo, `config.layout.listingPage`).
- **Profile page** (`/u/:id`, `src/containers/ProfilePage/`): the *user's* page (avatar, bio, their
  listings, reviews). Email templates link here (`/u/:id`).

**To find out:** which of the two is "the public profile" for us, and whether `/u/:id` is needed at
all. Decide this before the public profile redesign. Both pages are left out of the layouts doc
for now.

## 5. Home page is empty when logged out

`/p/home` logged out shows only the topbar and footer. The logged-in content (`HomeNextSteps`,
`OwnListingsSummary` in `CMSPage.js`) only renders with a current user, and the Console page itself
has no sections.

**To decide:** redirect logged-out visitors to the landing page (`/`) or log in, or add Console
sections.

## 6. "Later" after sign up goes to account settings

On the check-your-email screen after sign up (`EmailVerificationInfo.js`), "Later" links to Contact
details (`ContactDetailsPage`, `/account/contact-details`). A new user who taps Later lands in account
settings instead of the app. ("Fix it" going there makes sense: that's where the email is changed.)

**To decide:** should Later go to the home page (`/p/home`)? It's a one-line link change, not part of
the redesign.

## 7. Booking journey (offer → payment): open items

From the booking journey redesign, Oct 15, 2026 (spec: [booking-journey.md](booking-journey.md),
design: `design/booking-journey.html`). The redesign is built and pushed to `main`; these are what
it left open. Process code: `src/containers/TransactionPage/TransactionPage.stateDataNegotiation.js`,
offer history: `src/transactions/transactionProcessNegotiation.js`. Live copy is in Console
(`translations.json`), not `en.json`.

### Wiring and logic

- [ ] **7.1 Wrong message after paying.** After checkout the organizer lands on
  `/order/:id?bookingRequestSuccess=1` (`CheckoutPageWithPayment.js` ~line 362). `TransactionPage.js`
  then forces the `pending-payment` title (live: "{customerName}, you have not confirmed payment
  yet") and keeps the flag in `sessionStorage`, so it repeats for the whole session. Should show the
  `offer-accepted` text ("Booking confirmed" · "Your payment has been received…").
- [ ] **7.2 DJ accepts unchanged → both sides read "counteroffer".** Root cause (confirmed in
  code): "Accept offer" and "Make a counteroffer" both run `make-offer-from-request`;
  `getBusinessOfferType` (`transactionProcessNegotiation.js`) labels both "counter-offer". Effects:
  DJ title "Your counteroffer has been sent" (`stateDataNegotiation.js` ~285) instead of the
  existing "You just accepted an offer."; organizer Home card "Counteroffer from {name}"
  (`CMSPage.js` ~364), activity feed (`ActivityFeed.js` ~396), proposed-changes view
  (`OfferDetailsCard.js` ~95) and "Reject the counteroffer" / "Make final offer" actions. Fix:
  treat a provider make-offer without `protectedData.proposedChanges` as an accept and show
  `provider.offer-pending.accepted-offer.*` (in Console, unused). The Console default
  `provider.offer-pending.title` also says "Your counter offer has been sent!", so the code fix is
  needed either way. Full title table: [negotiation-flow.md](negotiation-flow.md).
- [ ] **7.3** Merged into 7.2.
- [ ] **7.4 Offer 1 / 2 / 3 content.** How each offer is stored and whether later offers overwrite
  earlier ones (`protectedData.proposedChanges`, `metadata.offers`). See `.vscode/offerFlow.md`.
  Now that the offer shows in every state, stale red "Proposed" values may appear.
- [ ] **7.5 No price before the DJ responds.** `transition/request-quote` sets no line items, so
  "Offer sent" and "Booking offer" have no Booking summary. Needs `privileged-set-line-items` on
  `request-quote` in `ext/transaction-processes/default-negotiation/process.edn` **and** in the
  Sharetribe backend.
- [ ] **7.6 DJ notes are invisible.** The "Anything to note?" note and the rejection reason are sent
  as messages, but the message feed is hidden for the negotiation process.
- [ ] **7.7 `OfferSummaryBlock` is dead code.** `showOfferSummaryBlock` is set by no state. Delete or
  reuse.

### Copy (fix in Console and `en.json` together)

- [ ] **7.8** Checkout title (`CheckoutPage.default-negotiation.title`) is "Booking can’t be
  completed yet".
- [ ] **7.9** Template words: "order", "Complete order", "delivers the order", and
  `StripePaymentForm.submitConfirmPaymentFinePrint` "…won't receive money before delivering the item".
- [ ] **7.10** Copy rules not applied yet: no "!", no full stop on one-sentence lines, "counteroffer"
  as one word (Console writes "counter offer" in about a dozen keys).
- [ ] **7.11** "Performance Fee" and "LineupBridge Fee" with capitals (should be sentence case).
- [ ] **7.12** `RejectCounterOfferConfirmModal.body` says "The event organizer can send another
  offer", untrue after a final offer.
- [ ] **7.13** Placeholders aimed at the wrong person: `AcceptOfferModal.messagePlaceholder`
  ("…for the customer…") and `MakeCounterOfferForm.messagePlaceholder` ("…for the event organizer…",
  typed by the organizer).
- [ ] **7.14** Add the two new keys to Console: `OfferDetailsCard.offerSummaryTitle`,
  `OfferDetailsCard.proposedChangesBannerOrganizer`.

### Design decisions

- [ ] **7.15** Checkout billing address: name only, or one address-search field (Stripe Address
  Element). Check first whether VAT / invoicing needs the address.
- [ ] **7.16** Modal close button still shows the template's "CLOSE" text + X.
- [ ] **7.17** Final offer modal label "Message (optional)" puts "(optional)" in the label text,
  unlike the other modals.
- [ ] **7.18** Older design-system items: unit word "min" and half-hour durations (data change);
  duration range 1–12 hours; broken global font-weight tokens.
- [ ] **7.19** Account settings menu: numbers or no numbers (`layouts.md`).

### To verify

- [ ] **7.20** The push to `main` (Oct 15) ran no format check, tests or build; three merge conflicts
  were resolved by hand (`lineupLayout.module.css`, `design-system-rules.md`, `components.html`).
- [ ] **7.21** "Make a counteroffer" minutes changed from 00/15/30/45 to 00/30: check offers saved
  with :15 or :45 still show.
- [ ] **7.22** The checkout restyle (`StripePaymentForm`) applies to every checkout type, not just
  negotiation.

## 8. After payment: the performance date is the date that counts

Oct 15, 2026. Rule (Zoha): the performance date and time agreed in the offer
(`protectedData.bookingDate` + `bookingStartTime`) decides everything after payment, not the
payment date. Spec: [negotiation-flow.md](negotiation-flow.md) "After payment".

- [ ] **8.1 Refund before the gig (dangerous).** `transition/auto-cancel` and
  `auto-cancel-from-changes-requested` in `ext/transaction-processes/default-negotiation/process.edn`
  refund the organizer in full 75 days after payment if the DJ has not marked the performance.
  Sharetribe timers cannot read the performance date (this process has no booking), so the timer
  cannot follow it. Fix: remove both auto-cancel transitions (refunds only by the operator, per the
  terms after MVP). Process change: needs Zoha's OK and a push to Sharetribe. **Do it before
  launch:** a transaction keeps the process version it started on, so bookings made before the fix
  keep the 75-day timer.
- [ ] **8.2 "I've completed the performance" before the gig.** The DJ can press it right after
  payment. Fix (code, small): show it only from the performance date and time. "Confirm
  performance" and "Request changes" then follow automatically (they need the DJ's step first).
- [ ] **8.3 The 8.2 guard is UI only.** `transition/deliver` is not privileged, so the SDK can
  still call it early. Post-MVP: make it privileged and check the date on the server.
- [ ] **8.4 Event time zone is not stored.** The 8.2 check uses the viewer's clock. Also verify
  that `bookingDate` (`toISOString().slice(0, 10)` in `RequestQuotePage.js`) does not shift a day
  east of UTC.
- [ ] **8.5 "Request changes" for a live gig.** Proposal: "Report a problem" (payout held, team
  resolves). Waiting for the terms (post-MVP).
- [ ] **8.6 "Payment expired" has no title.** No `payment-expired` title key in Console or
  `en.json`, so the page shows the raw key after an unpaid checkout (15 minutes).
