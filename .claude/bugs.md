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

