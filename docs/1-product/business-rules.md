# Business rules

2026-10-15 · approved · Zoha Fard

Product decisions that UI, copy and code must respect. The negotiation, payment and performance rules
are in [negotiation-flow.md](negotiation-flow.md).

## Users

- Two user types (Console user types): **DJ** = Sharetribe provider, **event organizer** = Sharetribe
  customer. One person, one account.
- Core flow: find a DJ → offer → negotiate → pay → performance → confirm → payout → complete.

## Business rules and Sharetribe

Two separate sources of truth, joined by a mapping layer in our code:

- **Business rules say what LineupBridge allows.** Sharetribe allowing something does not make it
  product. A rule Sharetribe does not enforce is enforced in our code (server guard first, UI second).
- **Sharetribe defines what the platform supports.** Its processes, states and transitions
  (`ext/transaction-processes/`) are not changed to match a business rule.
- When the two disagree: describe the gap, then choose a mapping, a guard, a UI change, a process
  change or a rule change. A process change or a rule change needs Zoha's approval.

## Account (both user types)

- Account settings is one page: profile picture, contact details, password, delete account.
- Phone number is required for DJs, not for event organizers (user type `phoneNumberSettings`).
- Changing the email or password, or deleting the account, asks for the current password.
- DJs have Payout details; event organizers have Payment methods.

## Payout (DJ)

- Payout setup is complete only when Stripe verification is done (Stripe status "Your Stripe account
  is up to date!"). Choosing account type and country is not enough.
- Until then the notice "Complete your payout setup" shows, and the DJ receives no booking requests.
- Payout belongs to the account, not to the public profile.

## Public profile (DJ)

- A DJ is one person with one public profile: no text names whose profile it is ("Edit profile", not
  "Edit profile for {name}").
- Sharetribe allows many listings per user and that stays in code and data (an agent may manage
  several DJs later). Only the product and its wording assume one profile.
- The page at `/l/:slug/:id` is the "public profile". The word "listing" is never shown to users.
- Three steps: Profile, Links, Photos.
- Required: Artist name (max 60 characters), Bio, City (from the list), Resident Advisor link.
  Optional: Genre, Website, SoundCloud, Spotify, Instagram.
- Photos: the first two are required (both are shown on the public profile). Max 20 MB each, .JPG or .PNG.

## Not in code yet

- Payout complete: code uses `currentUser.attributes.stripeConnected` (`CMSPage.js`), which is true
  right after the basic form, before verification.
- Photos: code requires one photo. Approved message for two: "You need to add at least two photos."
- Links as their own step; "listing" → "public profile" in Console texts.
