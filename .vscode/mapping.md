## EO/DJ negotiation mapping

This document records the business mapping and the current implementation status.

### Permanent role mapping

```text
Sharetribe customer = Event Organizer (EO)
Sharetribe provider = DJ
```

### Required business flow

```text
EO Offer 1
→ DJ Counter Offer 2
→ EO Final Offer 3
→ DJ Accepts or Rejects
→ if accepted, EO pays
```

The negotiation must stop after the EO submits Offer 3. The DJ must not be able to submit a
fourth offer.

### Existing Sharetribe transitions

The existing `default-negotiation` process uses these technical transitions:

| Business meaning | Sharetribe transition | Sharetribe actor |
|---|---|---|
| EO Offer 1 | `transition/request-quote` | `customer` |
| DJ Counter Offer 2 | `transition/make-offer-from-request` | `provider` |
| EO Final Offer 3 | `transition/customer-make-counter-offer` | `customer` |
| DJ accepts Offer 3 | `transition/provider-accept-counter-offer` | `provider` |
| DJ rejects Offer 3 | `transition/provider-reject-counter-offer` | `provider` |
| EO starts payment | `transition/request-payment-to-accept-offer` | `customer` |
| Payment confirmed | `transition/confirm-payment` | `customer` |

Sharetribe's regular negotiation process technically considers the DJ's priced amount the first
real priced offer. The application-level business labels are therefore:

```text
Business Offer 1 = EO request amount
Sharetribe priced offer 1 / Business Counter Offer 2 = DJ amount
Sharetribe customer counter-offer / Business Final Offer 3 = EO amount
```

### Data representation

The EO's initial amount is stored by `request-quote` as protected data:

```text
protectedData.offerAmount = business Offer 1
```

It does not create line items and must not be added to `metadata.offers` as a priced offer.

The priced negotiation history is stored in `metadata.offers`:

```text
metadata.offers[0] = DJ Counter Offer 2
  by: provider
  transition: transition/make-offer-from-request

metadata.offers[1] = EO Final Offer 3
  by: customer
  transition: transition/customer-make-counter-offer
```

Amounts in `metadata.offers` and line items are in currency subunits. For EUR:

```text
150000 subunits = EUR 1500
200000 subunits = EUR 2000
```

`protectedData.proposedChanges` can retain earlier proposal details. The authoritative final price
is the latest accepted priced offer in `metadata.offers` and the transaction line items.

## Implemented changes

### Server enforcement

`server/api-util/negotiation.js` contains:

- `hasCustomerFinalOffer(transitions)`
- `throwErrorIfOfferIsSubmittedAfterCustomerFinalOffer(transitionName, transitions)`

`server/api/transition-privileged.js` invokes the guard before calculating line items or calling
Sharetribe's trusted transition.

Once `transition/customer-make-counter-offer` exists, the guard rejects:

```text
transition/customer-make-counter-offer
transition/provider-make-counter-offer
transition/update-offer
transition/update-from-update-pending
```

The guard returns an HTTP 400 error. DJ acceptance and rejection remain allowed:

```text
transition/provider-accept-counter-offer
transition/provider-reject-counter-offer
```

The server rule is authoritative. UI hiding alone is not sufficient because a stale page or a
manually crafted browser request could otherwise attempt another offer.

### Frontend behavior

`src/containers/TransactionPage/TransactionPage.stateDataNegotiation.js` now:

- wires the EO's existing `customer-make-counter-offer` button in `state/offer-pending`;
- removes the DJ's further counter-offer button in `state/customer-offer-pending`;
- leaves the DJ with Accept and Reject only after Offer 3;
- removes the EO's further counter/reject actions after the EO final offer has been accepted by
  the DJ, leaving payment as the next action.

The generic `ActionButtons` component and the Sharetribe transaction process were not changed.

### Tests and validation

`server/api-util/negotiation.test.js` contains unit coverage for the final-offer history helper
and the server guard.

Direct runtime assertions pass for:

```text
no customer final offer → not final
customer final offer → final
DJ accept after final offer → allowed
DJ further counter after final offer → rejected with HTTP 400
```

The edited files report no editor diagnostics. `yarn build-web` completes successfully.

The repository's Jest command did not execute the focused test because the current Yarn environment
does not expose a Jest binary and the project runner did not match the supplied test path. This
remains a validation gap.

## Verified transaction

The following completed transaction confirms the intended mapping:

```text
request-quote by customer
→ make-offer-from-request by provider
→ customer-make-counter-offer by customer
→ provider-accept-counter-offer by provider
→ request-payment-to-accept-offer by customer
→ confirm-payment by customer
```

Observed values:

```text
EO Offer 1: EUR 1000
  protectedData.offerAmount = 1000

DJ Counter Offer 2: EUR 2000
  metadata.offers[0].offerInSubunits = 200000
  metadata.offers[0].by = provider

EO Final Offer 3: EUR 1500
  metadata.offers[1].offerInSubunits = 150000
  metadata.offers[1].by = customer
```

The final transaction contained:

```text
line-item/offer = EUR 1500
payinTotal = EUR 1575
payoutTotal = EUR 1500
state = state/offer-accepted
lastTransition = transition/confirm-payment
```

The extra EUR 75 in the pay-in total is the customer commission. The final paid price came from
EO Offer 3, not the DJ's EUR 2000 proposal.

## Remaining browser acceptance checks

Run a fresh transaction and verify:

1. EO submits EUR 1000 and the transaction is `state/quote-requested` with no line items.
2. DJ submits EUR 2000 and the transaction has a provider metadata offer and EUR 2000 line item.
3. EO submits EUR 1500 and the transaction has a customer metadata offer.
4. DJ sees Accept and Reject only, with no further Counter Offer button.
5. A manually attempted provider counter-offer receives HTTP 400.
6. DJ acceptance allows EO payment but no additional counter-offer.
7. DJ rejection ends the transaction without payment.

Do not modify `.vscode/mapping.md` during implementation unless the business mapping itself changes.

## 1. Freeze the business rules

Before editing code, write down the exact allowed sequence:

| Business step | Existing transition | Allowed actor |
|---|---|---|
| EO Offer 1 | `transition/request-quote` | Customer |
| DJ Counter Offer 2 | `transition/make-offer-from-request` | Provider |
| EO Final Offer 3 | `transition/customer-make-counter-offer` | Customer |
| DJ accepts Offer 3 | `transition/provider-accept-counter-offer` | Provider |
| DJ rejects Offer 3 | `transition/provider-reject-counter-offer` | Provider |
| EO pays after acceptance | `transition/request-payment-to-accept-offer` | Customer |

The sequence must end after the EO’s `customer-make-counter-offer`.

Therefore, after that transition exists:

```text
Allowed:
- provider-accept-counter-offer
- provider-reject-counter-offer

Forbidden:
- provider-make-counter-offer
- another customer-make-counter-offer
- provider update-offer
```

The last two forbidden actions matter because accepting the EO’s counter currently returns the transaction to `state/offer-pending`, where the standard process can otherwise expose another customer counter-offer.

## 2. Decide how Offer 1 is represented

Do not put the EO’s initial amount into the existing `metadata.offers` array as though it were a normal Sharetribe priced offer.

That array currently represents offers that create or update Sharetribe line items. The EO’s `request-quote` does not create line items, so adding it there would make the existing metadata validation incorrect.

Keep the data model conceptually separate:

```text
protectedData.offerAmount
    = business Offer 1 from the EO

metadata.offers
    = Sharetribe-priced offer history
```

Under that model:

```text
protectedData.offerAmount = EO Offer 1

metadata.offers[0] =
  DJ Counter Offer 2
  transition/make-offer-from-request

metadata.offers[1] =
  EO Final Offer 3
  transition/customer-make-counter-offer
```

This avoids corrupting the existing `offers` history and keeps the relationship with Sharetribe line items accurate.

If the UI needs to display “Offer 1,” “Offer 2,” and “Offer 3,” derive those labels from the protected request amount plus the ordered transaction history. Do not change Sharetribe’s transition names.

## 3. Add one authoritative history check

The central rule should be based on the transaction’s ordered `attributes.transitions`, not on the current state alone.

The relevant sequence is:

```text
transition/request-quote by customer
transition/make-offer-from-request by provider
transition/customer-make-counter-offer by customer
```

The implementation should detect whether the final EO offer already exists:

```text
hasCustomerFinalOffer =
  transaction.attributes.transitions contains
  transition/customer-make-counter-offer
```

It should preferably also verify that the transaction has followed the expected order:

```text
request-quote
→ make-offer-from-request
→ customer-make-counter-offer
```

This prevents an unrelated or malformed transition history from accidentally being interpreted as the final-offer state.

The helper belongs in `negotiation.js`, alongside the existing offer-history validation functions.

A useful conceptual helper would be:

```text
hasReachedCustomerFinalOffer(transitions)
```

It should be a pure function, so it can be tested independently.

## 4. Enforce the rule on the server

The UI must hide invalid actions, but the server must be authoritative.

The relevant server path is `transition-privileged.js`. It already:

1. Fetches the transaction.
2. Reads existing metadata and transitions.
3. Validates the offer history.
4. Calculates line items.
5. Adds metadata.
6. Executes the trusted Sharetribe transition.

Add the business-limit validation after the transaction is fetched and before line-item calculation or the trusted transition call.

The server should reject:

```text
provider-make-counter-offer
```

when the EO’s customer counter already exists.

It should also reject:

```text
customer-make-counter-offer
```

when one already exists.

It should reject provider offer updates after the final EO offer as well:

```text
update-offer
update-from-update-pending
```

That prevents a DJ from bypassing the intended finality by using an update transition instead of a counter-offer transition.

The server should continue allowing:

```text
provider-accept-counter-offer
provider-reject-counter-offer
```

after the EO’s final offer.

The error should be a normal HTTP `400` response with a clear stable error identifier or message, such as:

```text
The final customer offer has already been submitted.
```

The frontend can then show a useful message if an old page or duplicate request attempts an invalid action.

## 5. Preserve actor handling

Do not change this:

```text
orderData.actor: 'provider'
```

for the DJ’s `make-offer-from-request` action.

That is correct because the DJ is the Sharetribe provider.

For the EO’s final offer, the existing customer counter-offer path should continue sending:

```text
orderData.actor: 'customer'
```

The actor should be used for metadata bookkeeping:

```text
DJ Counter Offer 2:
by: provider

EO Final Offer 3:
by: customer
```

The actor value should not be used as the primary mechanism for deciding whether the sequence is complete. The ordered transition history is more reliable.

## 6. Correct the provider UI

The provider branch is in `TransactionPage.stateDataNegotiation.js`.

Currently, when the process is:

```text
CUSTOMER_OFFER_PENDING + PROVIDER
```

the code renders:

```text
provider-accept-counter-offer
provider-reject-counter-offer
provider-make-counter-offer
```

Change this branch so the DJ sees only:

```text
Accept
Reject
```

The provider counter-offer button should not be created in this state for this business flow.

That means removing the `tertiaryButtonProps` for:

```text
transitions.PROVIDER_MAKE_COUNTER_OFFER
```

from this branch, rather than merely hiding it with CSS or a general configuration flag.

The DJ’s visible action set should be:

```text
CUSTOMER_OFFER_PENDING + PROVIDER
    primary: provider-accept-counter-offer
    secondary: provider-reject-counter-offer
```

No third button should exist.

## 7. Correct the EO UI after DJ acceptance

There is a second UI change that is easy to miss.

The current process maps:

```text
provider-accept-counter-offer
    → state/offer-pending
```

Then the EO’s `OFFER_PENDING + CUSTOMER` branch normally renders:

```text
Accept/Pay
Reject
Counter Offer
```

After the EO has already submitted the final offer, the EO must not see Counter Offer again.

Therefore, in the `OFFER_PENDING + CUSTOMER` branch, calculate whether the transaction history already contains:

```text
transition/customer-make-counter-offer
```

If it does, render only:

```text
Pay
```

Potentially also omit Reject if the intended business rule says the DJ’s acceptance is definitive and the EO must only complete payment. Based on your stated flow, the safest interpretation is:

```text
after DJ accepts Offer 3:
EO can pay
EO cannot make another offer
```

Whether EO Reject remains visible after DJ acceptance is a business decision. It should not remain merely because the generic Sharetribe state allows it.

At minimum, the Counter Offer action must be blocked both visually and server-side.

## 8. Check the customer-counter branch

The current `CUSTOMER_OFFER_PENDING + CUSTOMER` branch already only exposes the customer’s withdrawal action. That is appropriate.

After the EO submits Offer 3:

```text
CUSTOMER_OFFER_PENDING + CUSTOMER
    → withdraw only, if withdrawal is desired
```

There should be no way for the EO to submit a fourth offer from that state.

The server-side guard must still exist because UI restrictions do not protect against stale pages or manually crafted requests.

## 9. Decide what to do with configuration flags

The existing code uses listing configuration helpers:

```text
allowCustomerCounterOffer
allowProviderUpdateOffer
```

The configuration flag for customer counter-offers can remain enabled because the EO must be able to submit Offer 3.

Do not use the existing general configuration flag to enforce the three-offer business rule. That flag answers:

```text
Are customer counter-offers supported at all?
```

Your new rule answers:

```text
Has the one permitted customer counter-offer already been used?
```

Those are different concerns.

The business limit should be based on transaction history.

## 10. Update labels and activity text

The underlying transition names should remain unchanged, but the visible wording should reflect the EO/DJ business language.

Suggested labels:

```text
EO submits request:
Make Offer

DJ submits make-offer-from-request:
Make Counter Offer

EO submits customer-make-counter-offer:
Submit Final Offer

DJ provider-accept-counter-offer:
Accept Final Offer

DJ provider-reject-counter-offer:
Reject Final Offer
```

The current source already has custom provider CTA translation support in `TransactionPage.stateDataNegotiation.js`.

Add or adjust translations in the project’s translation files rather than hardcoding visible text. Because this repository requires local fallback translations, any new keys should be added consistently to:

```text
src/translations/en.json
src/translations/de.json
src/translations/es.json
src/translations/fr.json
```

The exact wording can be finalized separately from the transition logic.

## 11. Add focused unit tests

The first tests should be pure negotiation utility tests in `negotiation.test.js`.

Cover these cases:

```text
1. No customer counter exists
   → final-offer check is false

2. Customer counter exists after the DJ initial offer
   → final-offer check is true

3. A second customer counter exists
   → server validation rejects it

4. Provider counter after customer final offer
   → server validation rejects it

5. Provider acceptance after customer final offer
   → allowed

6. Provider rejection after customer final offer
   → allowed

7. Provider update after customer final offer
   → rejected

8. Unrelated transitions do not count as offers
   → final-offer check remains correct
```

Also test the metadata result:

```text
request-quote:
  does not add a metadata.offers entry

make-offer-from-request:
  adds provider offer entry

customer-make-counter-offer:
  adds customer offer entry

second customer counter:
  never appends metadata
```

## 12. Add UI state tests

The transaction state tests should verify:

```text
CUSTOMER_OFFER_PENDING + PROVIDER:
  Accept visible
  Reject visible
  Counter Offer absent

OFFER_PENDING + CUSTOMER before customer counter:
  Pay visible
  Counter Offer may be visible

OFFER_PENDING + CUSTOMER after customer counter:
  Pay visible
  Counter Offer absent
```

The test should inspect the returned button props or rendered buttons, depending on the existing test style. The key is to test the decision function, not only CSS visibility.

Also test the existing listing configuration behavior separately:

```text
customerCounterOffer disabled:
  EO counter button hidden before Offer 3

customerCounterOffer enabled:
  EO counter button available before Offer 3
```

## 13. Test the server path

The privileged transition endpoint should be tested at the API level if the repository’s existing server tests support mocking the SDK.

At minimum, verify:

```text
valid Offer 2:
  trusted transition is called

valid Offer 3:
  trusted transition is called

provider counter after Offer 3:
  trusted transition is not called
  response is 400

customer counter after Offer 3:
  trusted transition is not called
  response is 400

provider acceptance after Offer 3:
  trusted transition is called

provider rejection after Offer 3:
  trusted transition is called
```

The most important security test is:

```text
A manually submitted provider counter-offer is rejected even when the UI is bypassed.
```

## 14. Run a browser acceptance test

After implementation, run one clean transaction from start to finish.

### EO

1. Create or open the provider listing.
2. Submit Offer 1 with amount `1000`.
3. Confirm the transaction is `quote-requested`.
4. Confirm the amount is in protected request data and there are no line items.

### DJ

5. Open the quote request.
6. Submit Counter Offer 2 with amount `2000`.
7. Confirm the transaction is `offer-pending`.
8. Confirm the line items use `2000`.
9. Confirm metadata records a provider offer.
10. Confirm the DJ is not yet in the final-offer response state because the EO still needs to respond.

### EO

11. Open the transaction.
12. Submit Final Offer 3.
13. Confirm the transaction is `customer-offer-pending`.
14. Confirm metadata records a customer offer.
15. Confirm the EO cannot submit another offer.

### DJ

16. Confirm only Accept and Reject are displayed.
17. Confirm the DJ cannot see Counter Offer.
18. Try a manually crafted or stale counter request if practical.
19. Confirm the server rejects it.

### Acceptance path

20. Click Accept as the DJ.
21. Confirm the EO sees payment, but not another Counter Offer.
22. Pay as the EO.
23. Confirm the transaction reaches the accepted/payment-complete state.
24. Confirm only post-payment actions such as delivery remain.

### Rejection path

Repeat the flow and select Reject as the DJ. Confirm that the transaction ends as rejected and does not expose payment or further negotiation actions.

## 15. Files expected to change

The likely implementation surface is:

- `negotiation.js`
- `negotiation.test.js`
- `transition-privileged.js`
- `TransactionPage.stateDataNegotiation.js`
- The relevant transaction-page test file
- Translation JSON files if visible labels change

Possibly:

- `ActionButtons.js`

However, the preferred implementation is to avoid changing the generic `ActionButtons` component. The state-specific logic belongs in `TransactionPage.stateDataNegotiation.js`; the server rule belongs in `transition-privileged.js`.

Do not modify `mapping.md` as part of this implementation.

## Final expected behavior

The finished flow should behave like this:

```text
EO:
  Offer 1
  ↓

DJ:
  Counter Offer 2
  ↓

EO:
  Final Offer 3
  ↓

DJ:
  Accept or Reject only
  ↓

EO:
  Pay if accepted
```

The underlying Sharetribe process remains:

```text
request-quote
→ make-offer-from-request
→ customer-make-counter-offer
→ provider-accept-counter-offer
   or provider-reject-counter-offer
```

The essential implementation principle is:

```text
Use Sharetribe transitions for transport.
Use ordered transition history for business finality.
Enforce finality in both the UI and the trusted server endpoint.
```

No files have been modified yet.
