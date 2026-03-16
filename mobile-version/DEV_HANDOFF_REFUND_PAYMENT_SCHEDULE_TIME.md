# Mobile App Handoff (Non-Technical)
## Refund Flow, Payment Details Page, and Schedule Time

**Prepared on:** March 13, 2026  
**Audience:** Product/dev handoff  
**Type:** Non-technical summary (no code)

---

## 1) Why this document

This document gives the developer a clear understanding of the latest user-facing behavior and expectations across:
1. Refund flow
2. Payment Details page
3. Schedule time / route handling

It focuses on product behavior, user intent, expected outcomes, key UI changes, and where those changes impact the app.

---

## 2) Refund Flow (Current Product Behavior)

### Main goal
Enable users to issue refunds quickly and safely, while reducing mistakes and making outcomes clear.

### Where users can start a refund
- From Jobs context
- From Invoices context
- From Payment/Transaction context

### Important refund trigger rule
- If a **paid job is cancelled**, the **refund option appears** so the user can process refund from the job flow.

### Current refund experience
- Users can choose refund amount with faster options (including quick-select patterns and manual entry path).
- The flow is guided and structured (not a single-step action).
- Users must review details before final processing.
- Final success state gives strong confirmation and confidence.

### UI changes in refund flow
- Added a clearer step-by-step visual journey (amount → method → review → success).
- Faster amount selection UI (quick options + manual path).
- Better confirmation screen to reduce accidental refund actions.
- Improved success feedback screen so users clearly know refund completion state.
- Stronger destructive-action styling in menus where refund is triggered.
- Better readability of refund details in transaction-related screens.

### What users should clearly understand
- Whether refund is full or partial
- What amount is being refunded
- What remains after refund (when partial)
- Why the refund happened (reason/context)

### Important behavior updates
- Refund handling is smoother for cancelled-but-paid jobs.
- Menu actions for refund are clearer and safer (destructive action clarity).
- Refund details have better visibility in transaction-related views.

### Where refund UI changes impact the app
- **Jobs area:** Faster refund initiation from job context; better handling for cancelled + paid scenarios.
- **Invoices area:** Safer refund action discovery and action confidence.
- **Payment/Transaction area:** Improved visibility of refund reasoning, amounts, and outcomes.

---

## 3) Payment Details Page (Current Product Behavior)

### Main goal
Make payment and refund status easy to understand at a glance.

### What this page shows
- Payment received details
- Refunded details

### What improved
- Better visibility of partial refund/payment outcomes.
- Clearer status communication in payment-related records.
- Transaction details provide stronger context for refunded items.

### UI changes on payment details
- Stronger visual distinction between full and partial refund outcomes.
- Clearer status presentation for refunded records.
- More readable transaction detail presentation for payment-related decisions.

### What users should be able to answer quickly
- Was payment completed?
- Was amount refunded fully or partially?
- What is the current financial state for this record?

### Business outcome
Users spend less time interpreting payment history and are less likely to misunderstand refund outcomes.

### Where payment details UI changes impact the app
- **Payment Details page:** Faster interpretation of transaction state.
- **Transaction details modal/view:** Better clarity for support, follow-up, and reconciliation conversations.
- **Linked job/invoice workflows:** Reduced ambiguity when one record has mixed payment/refund status.

---

## 4) Schedule Time / Route Context (Current Product Behavior)

### Main goal
Help teams plan service execution by date/time and employee assignment in a consistent way.

### Current expected behavior
- Schedule context is driven by employee + date.
- Route ordering aligns with scheduled service timing and stop sequence.
- Reschedule/schedule interactions support day-to-day operational flexibility.

### Schedule time rule (must be clear)
- User enters the **job duration**.
- User selects the **start time**.
- The **end time appears automatically** based on start time + duration.

### UI changes / UX expectations for schedule time
- Schedule and reschedule interactions should remain simple and predictable.
- Time-based planning should stay easy to scan when multiple jobs are present.
- Route order and time context should remain understandable during operational edits.
- If duration or start time changes, end time should recalculate immediately.

### Relationship to refund/payment flows
- Scheduling behavior should remain stable while payment/refund logic evolves.
- Job lifecycle and financial lifecycle should stay compatible (especially in cancelled + paid scenarios).

### What to preserve
- Predictable schedule-time behavior for route planning.
- Clear alignment between job state and operational timeline.

### Where schedule-time behavior impacts the app
- **Jobs scheduling views:** Day planning and technician assignment quality.
- **Route planning flow:** Stop sequence clarity and operational efficiency.
- **Job lifecycle coordination:** Smooth alignment between schedule actions and status/payment/refund context.

---

## 5) UI Change Impact Map (Quick Reference)

### Refund UI impact map
- **What changed:** Guided multi-step refund UX, safer actions, clearer completion feedback.
- **Impacted app areas:** Jobs, Invoices, Payment/Transaction views.
- **User impact:** Faster decisions, fewer accidental actions, clearer trust in outcomes.

### Payment Details UI impact map
- **What changed:** Clearer partial/full state visibility and transaction context.
- **Impacted app areas:** Payment Details list/cards, transaction detail screens, linked invoice/job review.
- **User impact:** Lower confusion and faster financial interpretation.

### Schedule Time UI impact map
- **What changed:** Expectation of stable, simple schedule/reschedule experience with clear time/route context.
- **Impacted app areas:** Schedule route planning, jobs timing workflows, operational daily planning.
- **User impact:** More predictable planning and less scheduling friction.

---

## 6) Key User Scenarios the Developer Should Keep in Mind

1. **Cancelled + Paid job needs refund quickly**
   - User expects a fast path and clear confirmation.

2. **Partial refund in payment history**
   - User expects clear indication that refund is not full.

3. **Multiple invoices tied to one job**
   - User expects payment/refund state to remain understandable.

4. **Schedule adjustments while job/payment states exist**
   - User expects schedule usability without breaking financial context.

---

## 7) Product Risks / Watchouts

- Confusion between full vs partial refund states
- Inconsistent behavior across Jobs, Invoices, and Payment entry points
- Reduced clarity if status labels are not aligned
- Schedule-time behavior drifting from job lifecycle expectations

---

## 8) Validation Checklist (Non-Technical)

### Refund flow
- User can start refund from all expected places.
- Amount selection feels quick and clear.
- Confirmation step prevents accidental action.
- Success state is clear and trustworthy.

### Payment details page
- Partial outcomes are obvious.
- Refunded records are easy to understand.
- Users can interpret current state without extra support.

### Schedule time
- Date/time-based planning remains predictable.
- Rescheduling stays simple for operators.
- Job state and schedule state remain aligned.
- End time auto-populates from start time and duration.
- Changing duration or start time recalculates end time correctly.

### UI impact validation
- Changes are visually consistent across Jobs, Invoices, and Payment areas.
- Labels and statuses use the same meaning across screens.
- No screen creates contradictory interpretation of full vs partial refund outcome.

---

## 9) Final Handoff Notes

- Refund and payment experiences saw the biggest recent improvements.
- Schedule-time behavior is currently a stable operational baseline.
- Future changes should prioritize consistency across all entry points and edge cases.
- This handoff is intentionally non-technical and implementation-agnostic.
