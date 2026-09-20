The offer flow should follow one consistent pattern throughout the negotiation:

**Offer content → user action → confirmation message**

### 1. EO creates the booking

EO clicks **Create new booking**.

They first see the offer form:

**Complete your offer**

CTA: **Send offer**

After sending:

**Your offer has been sent!**

---

### 2. DJ receives Offer 1

DJ sees the full offer content from the EO and a CTA to react to it.

DJ can make a counter offer.

After submitting:

**Your counter offer has been sent!**

DJ's counter offer becomes **Offer 2**.

---

### 3. EO receives Offer 2 — counter offer

EO opens the counter offer and sees the updated offer content.

The original offer content should remain visible, with the new information/proposed changes layered on top.

The screen should clearly communicate:

**Mimi Love made a counter offer.**

**You can now react to the offer.**

**The artist has proposed changes to your offer, as highlighted in red.**

The changed amount, notes, or other proposed changes should be visually highlighted.

EO then reacts to the counter offer.

After the action, EO sees the appropriate confirmation message.

---

### 4. DJ receives Offer 3 — final offer

EO's response becomes **Offer 3 / Final offer**.

DJ opens it and must see the **updated Offer 3 content**.

This is currently missing/incomplete and needs to be investigated.

The important business requirement is that the three offers are treated as:

**Offer 1 → Counter offer 2 → Final offer 3**

The content of each offer needs to be preserved and displayed correctly.

Before implementing this screen, inspect the code and establish:

* How Offer 1 content is stored
* How Counter offer 2 content is stored
* How Final offer 3 content is stored
* Whether previous offer content is preserved or overwritten
* Which fields represent the changed amount, notes, and other offer information
* Why the DJ currently only sees the payment bracket on the final offer

The final-offer screen should show the actual Offer 3 content, including the changes made by the EO, using the same visual approach used when the EO receives a counter offer.

DJ can then:

**Accept final offer**
**Reject final offer**

After accepting:

**You just accepted the final offer!**

{EO name} has been notified and can now complete the payment to confirm the booking.

After rejecting:

**You just rejected the final offer.**

{EO name} has been notified that you rejected their final offer.

---

### 5. EO pays

EO accepts the final offer and completes payment.

After successful payment:

**Your booking is confirmed!**

The booking is now confirmed.

---

### 6. DJ completes the performance

DJ opens the confirmed booking.

They should see the confirmed booking/offer content and a CTA:

**I have completed the performance**

The supporting message should communicate that the booking is confirmed and that completing the performance is the step required to trigger payment, for example:

**Your booking is confirmed.**

**Mark your performance as done after you have completed the event to start the payment process.**

After DJ marks the performance as done, show a confirmation message appropriate to that action.

---

### 7. EO confirms the performance

EO opens the same booking after the DJ has marked the performance as done.

The current generic Sharetribe text:

> The order was delivered.
> You can accept what was delivered or request changes.

should be replaced with LineupBridge language.

The EO should see something specific to the DJ performance, for example:

**The performance has been completed.**

**Please confirm that the DJ completed the performance as agreed.**

CTAs:

**Confirm performance**

**Request changes**

After EO confirms:

**You confirmed the performance!**

The wording should refer to confirming the DJ's performance, not accepting an "order."

---

### Important implementation principle

The business stages are:

**Offer 1 → Counter offer 2 → Final offer 3 → Accepted → Paid → Performance completed → Performance confirmed**

The Offer Card title, CTA, offer content, and confirmation message should all reflect the current business stage.

However, the **offer content itself must also be preserved across the three negotiation offers**:

**Offer 1 content → Offer 2 content → Offer 3 content**

Before changing the final-offer UI, inspect the existing code and tell me exactly how this content is currently stored and whether Offer 1, Offer 2, and Offer 3 can be reconstructed from the existing transaction data.

Also hide/remove any **“Reviewing”** status or UI that is currently shown if it does not represent a meaningful LineupBridge business state.
