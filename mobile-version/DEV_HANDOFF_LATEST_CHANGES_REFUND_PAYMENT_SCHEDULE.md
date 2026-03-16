# Developer Handoff: Latest Mobile App Changes
## Refund Flow, Payment Details, and Schedule Time

**Date:** March 13, 2026  
**Purpose:** Easy, non-technical summary of what changed, where it appears in the app, and why it matters.

---

## 1) Quick Summary

In recent updates, the biggest improvements are in:
- **Refund flow** (faster, safer, clearer)
- **Payment Details page** (better clarity for payment received and refund history)
- **Schedule time context** (stable planning behavior, with alignment to job/payment states)

---

## 2) Refund Flow

### What users can do now
- Start refund from key business areas:
  - Jobs
  - Invoices
  - Payment/Transaction context
- Complete refund through a clearer guided flow.
- See better confirmation and success feedback before and after refund processing.

### Important business rule
- If a **paid job is cancelled**, the **refund option appears**.

### UI changes
- Clear multi-step refund journey (selection → review → success).
- Better amount-selection experience (faster choices and clearer manual path).
- Stronger confirmation stage to reduce accidental refunds.
- Improved success state to confirm completion with confidence.
- Better destructive action styling where refund can be triggered.

### Where this impacts the app
- **Jobs:** refund path is more visible and faster in cancelled-paid scenarios.
- **Invoices:** refund action is easier to identify and safer to use.
- **Payment/Transaction views:** refund information is easier to read and verify.

### User impact
- Faster refund processing.
- Fewer mistakes.
- Better trust in what happened after refund submission.

---

## 3) Payment Details Page

### What this page shows
- **Payment received details**
- **Refunded details**

### What changed
- Better visibility of full vs partial refund outcomes.
- Clearer transaction status understanding.
- Improved readability of financial record context.

### UI changes
- Stronger visual distinction between paid, refunded, and partial outcomes.
- Cleaner display of transaction-level financial status.
- More intuitive detail hierarchy for quick decision-making.

### Where this impacts the app
- **Payment Details page:** easier to interpret each payment record.
- **Transaction details views:** improved support for follow-up, disputes, and reconciliation.
- **Connected job/invoice review:** less confusion in mixed payment/refund situations.

### User impact
- Less time spent understanding financial state.
- Better confidence when checking whether money was received, refunded, or partially refunded.

---

## 4) Schedule Time / Route Context

### Current behavior (expected)
- Scheduling is driven by employee + date.
- Route order and scheduled time remain key planning factors.
- Reschedule behavior supports daily operational flexibility.

### Schedule Time behavior (important)
- User enters **job duration**.
- User selects **start time**.
- **End time is auto-calculated and auto-displayed** based on start time + duration.

This is the key schedule-time context to preserve.

### UI/UX expectation
- Scheduling interactions should stay simple and predictable.
- Time and route order should remain easy to scan.
- Operational edits should not reduce clarity of job timeline.
- Auto-calculated end time should update immediately when start time or duration changes.

### Where this impacts the app
- **Jobs scheduling views:** daily planning quality.
- **Route planning flow:** stop order and technician efficiency.
- **Job lifecycle coordination:** consistency with payment/refund state handling.
- **Schedule job form/workflow:** accurate time slot creation from duration + start time input.

### User impact
- Reliable day planning.
- Better operational control with less confusion.

---

## 5) Combined Impact Across the App

- Refund and payment sections are now more tightly aligned.
- Users can better understand:
  - what was paid,
  - what was refunded,
  - and what remains in partial cases.
- Schedule-time flows remain a stable foundation and should continue to work consistently with job and financial status changes.

---

## 6) What Developer Should Validate (Non-Technical)

### Refund
- Refund option appears when paid jobs are cancelled.
- Refund path is consistent across Jobs, Invoices, and Payment contexts.
- Confirmation and success screens clearly communicate outcome.

### Payment Details
- Page clearly shows payment received and refunded details.
- Full vs partial outcomes are easy to identify.
- Users can understand current financial status without extra support.

### Schedule Time
- Date/time planning remains predictable.
- Rescheduling remains straightforward.
- Scheduling behavior stays aligned with job and financial state changes.
- End time auto-populates correctly from start time and duration.
- Any duration or start-time edit recalculates end time correctly.

---

## 7) Final Note

This handoff is intentionally non-technical and implementation-agnostic. It is meant to help development, QA, and product stay aligned on expected user-facing behavior and impact areas.
