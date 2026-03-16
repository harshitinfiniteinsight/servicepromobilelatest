# Service Pro Mobile App - Changes Documentation
## Refund Flow, Payment Details, and Schedule Time

This document summarizes the latest app changes in an easy-to-understand format, similar to the standard app changes documentation style.

---

## Table of Contents

1. [Refund Flow Enhancements](#refund-flow-enhancements)
2. [Payment Details Page Enhancements](#payment-details-page-enhancements)
3. [Schedule Time Behavior Clarification](#schedule-time-behavior-clarification)
4. [Cross-Module Impact Summary](#cross-module-impact-summary)
5. [Validation Checklist](#validation-checklist)

---

## Refund Flow Enhancements

### Overview
The refund experience was improved to make it faster, safer, and clearer for users across Jobs, Invoices, and Payment-related views.

### What Changed
- Refund initiation is now more consistent across key entry points.
- Refund actions are easier to identify in menus.
- Refund flow provides clearer progression and outcome visibility.
- Refund details are easier to understand in transaction contexts.

### Important Business Rule
- If a job is **Paid** and then changed to **Cancelled**, the **Refund** option appears.

### UI Changes
- Improved refund action visibility in menus.
- Better visual treatment for destructive/refund actions.
- Clearer refund progression flow (from amount selection to final confirmation/success).
- Improved final success feedback after refund processing.
- Improved visibility of full vs partial refund outcomes.

### Where It Impacts the App
- **Jobs screen**
  - Refund option handling in paid + cancelled scenarios.
  - Faster refund initiation from job context.
- **Invoices screen**
  - Safer and clearer refund action discovery.
- **Payment/Transaction views**
  - Better readability of refunded details and amount outcomes.

### User Impact
- Lower chance of refund mistakes.
- Faster completion of refund tasks.
- Better confidence in refund results.

---

## Payment Details Page Enhancements

### Overview
The Payment Details page now better communicates both received payments and refund information.

### What This Page Shows
- **Payment received details**
- **Refunded details**

### What Changed
- Clearer representation of payment state.
- Better visibility for refunded and partially refunded outcomes.
- Improved readability for transaction context.

### UI Changes
- More obvious visual distinction between paid, refunded, and partial states.
- Better information hierarchy for faster scanning.
- Improved clarity in transaction detail presentation.

### Where It Impacts the App
- **Payment Details page**
  - Faster interpretation of current payment/refund status.
- **Transaction details context**
  - Better support for follow-ups and reconciliation.
- **Linked job/invoice understanding**
  - Reduced confusion in mixed payment/refund scenarios.

### User Impact
- Users can quickly understand whether money was received, refunded, or partially refunded.
- Better decision-making with less back-and-forth.

---

## Schedule Time Behavior Clarification

### Overview
Schedule Time context is focused on automatic end-time calculation from user-entered duration and start time.

### Core Behavior
- User enters **Job Duration**.
- User selects **Start Time**.
- **End Time is automatically displayed** based on duration + start time.

### Expected Dynamic Behavior
- If user changes duration, end time should update automatically.
- If user changes start time, end time should update automatically.

### UI/UX Expectations
- Duration and start time fields should be easy to edit.
- End time should appear clearly and without extra manual action.
- Time behavior should feel predictable and immediate.

### Where It Impacts the App
- **Schedule Job flow/forms**
  - Accurate time slot creation.
- **Route/Schedule planning context**
  - Better day planning and technician coordination.
- **Operational job timeline**
  - Reduced manual time-calculation errors.

### User Impact
- Less manual calculation effort.
- Better planning confidence.
- Reduced scheduling mistakes.

---

## Cross-Module Impact Summary

### Jobs Module
- Refund option behavior improved for paid + cancelled jobs.
- Better alignment between job status and financial actions.

### Invoices Module
- Clearer and safer refund action handling.

### Payments Module
- Better clarity of paid/refunded/partial outcomes.
- Payment Details more informative for support and operations.

### Scheduling Module
- Start time + duration now clearly drive end-time behavior.
- Better consistency in schedule-time interpretation.

---

## Validation Checklist

### Refund Flow
- [ ] Refund option appears when paid job is cancelled.
- [ ] Refund action is visible and clear in Jobs/Invoices/Payment contexts.
- [ ] Refund completion feedback is clear and trustworthy.
- [ ] Partial vs full refund outcomes are easy to understand.

### Payment Details
- [ ] Page clearly shows payment received details.
- [ ] Page clearly shows refunded details.
- [ ] Full vs partial outcomes are distinguishable.
- [ ] Users can quickly identify current financial state.

### Schedule Time
- [ ] End time auto-appears when duration + start time are set.
- [ ] End time recalculates when duration changes.
- [ ] End time recalculates when start time changes.
- [ ] Time behavior remains predictable across scheduling workflows.

---

## Final Notes

This documentation is intentionally non-technical and focused on user-facing behavior, UI changes, and app impact areas so development, QA, and product teams can stay aligned.
