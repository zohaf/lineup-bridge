# Business rules

Topics: [Negotiation flow](negotiation-flow.md) (offer, counteroffer, final offer).

# Account and public profile

Oct 15, 2026 · Zoha Fard

Product decisions that UI, copy and code must respect. Where the code does not follow a rule yet, the
gap is listed under "Not in code yet". Design: [design/dj-setup.html](design/dj-setup.html).

## One person, one account

- Two user types, DJ and event organizer (Console user types). Each user is one person with one account.
- **Product rule:** a DJ is one person with one public profile, which is them. So no title or text names
  the profile it belongs to ("Edit profile", not "Edit profile for {name}").
- **Platform stays as it is:** Sharetribe lets one user have many listings, and we keep that. Later an
  agent may look after several DJs. Don't remove multi-listing support from code or data; only the
  product and its wording assume one profile today.

## Account (both user types)

- Account settings is one page: profile picture, contact details, password, delete account.
- Phone number is required for DJs, not for event organizers (user type `phoneNumberSettings`).
- Changing the email, the password, or deleting the account asks for the current password.
- DJs have Payout details; event organizers have Payment methods.

## Payout (DJ)

- **Payout setup is complete only when Stripe verification is done** (Stripe status "Your Stripe
  account is up to date!"). Choosing account type and country on our platform is not enough.
- Until then the payout notice banner shows ("Complete your payout setup"), and the DJ does not
  receive booking requests.
- Payout belongs to the account, not to the public profile.

## Public profile (DJ)

- The DJ's page at `/l/:slug/:id` is the "public profile". The word "listing" is never shown to users.
- Built in three steps: Profile, Links, Photos.
- Required: Artist name (max 60 characters), Bio, City (a city chosen from the list), Resident Advisor
  link.
- Optional: Genre, Website, SoundCloud, Spotify, Instagram.
- Photos: the first two are required (they are the two photos shown on the public profile). More are
  optional. Max 20 MB each, .JPG or .PNG.

## Not in code yet

- Payout complete: code uses `currentUser.attributes.stripeConnected` (`CMSPage.js`), which is true
  right after the basic form, before verification.
- Photos: code requires one photo. Two needs a validation change; message approved: "You need to add at
  least two photos."
- Links as their own step, and "listing" → "public profile" in Console texts.
