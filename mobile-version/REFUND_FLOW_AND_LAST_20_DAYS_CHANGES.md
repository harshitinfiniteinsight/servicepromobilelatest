# Mobile Version Handoff: Latest Product Changes

**Prepared on:** March 13, 2026  
**Audience:** Developer handoff  
**Coverage window:** Last 20 days

---

## 1) Executive Summary

In the last 20 days, the mobile app has had major improvements in:
- **Refund flow** (end-to-end usability and safety)
- **Payment details visibility** (especially partial refund clarity)
- **Schedule time / route handling context** (current behavior alignment and route-related usability)

The most active area is the refund and payment experience. Schedule time behavior remains stable, with focus on usability continuity and integration with job states.

---

## 2) Refund: What Changed

### Entry points now behave more consistently
- Refund actions are accessible from jobs, invoices, and payment-related contexts.
- For cancelled and paid jobs, refund initiation is faster with auto-open behavior in relevant flows.
- Destructive action styling in menus was improved to reduce accidental taps.

### Refund flow became guided and safer
- Flow now supports structured progression: amount selection → method selection → review/confirm → success.
- Quick amount options were improved for speed (including full and percentage patterns).
- Confirmation before processing is clearer, so users can validate impact before final action.

### Refund details are now more transparent
- Better distinction between full and partial refunds.
- Refund-related transaction context is richer in detail screens.
- Card context and validation around refund notes were tightened for better traceability.

### UX improvements completed during this period
- Mobile layout polish in refund screens.
- Input handling fixes (including reason/textarea reliability).
- Compact presentation in related transaction/refund views.

---

## 3) Payment Details: What Changed

### Partial refund visibility improved
- Payment detail experiences now make partial-refund outcomes easier to identify.
- Refunded states and partial states are visually clearer for users reviewing transaction history.

### Transaction context is more actionable
- Payment-related detail views now present refund context with better readability.
- Users can understand what was paid, what was refunded, and the current remaining context without ambiguity.

### Multi-invoice payment state support
- Jobs tied to multiple invoices now reflect payment state more clearly, especially for partial outcomes.
- This reduces confusion when one job has mixed payment/refund conditions.

---

## 4) Schedule Time / Route Context: Current State for Dev

### What to understand
- Schedule routing behavior is centered on employee + date context.
- Job order and scheduled time are core to route planning and route stop sequence.
- Route-level interactions (reorder, status updates, reschedule use cases) remain important dependencies for job lifecycle flows.

### Latest change signal in this window
- No major new architecture-level schedule-time feature landed in the last 20 days comparable to refund changes.
- Existing schedule route and reschedule behavior should be treated as stable baseline while integrating payment/refund logic.

### Integration note
- Any future scheduling updates should preserve compatibility with:
  - Job status transitions (Scheduled / In Progress / Completed / Cancel)
  - Payment-linked job states
  - Refund-trigger scenarios on cancelled-paid jobs

---

## 5) Chronology (Last 20 Days)

### Mar 10
- Refund detail quality update: card-last4 handling and stronger refund detail checks in transaction context.

### Mar 9
- Refund flow refinement and compact transaction detail presentation.
- Menu UX updates for safer destructive actions.
- Auto-open refund path for cancelled paid jobs.
- Alignment updates between refund and payment modal behavior.

### Mar 6
- Refund modal refactor for faster amount selection and cleaner interaction.
- Partial payment status improvements for multi-invoice job scenarios.

### Mar 3
- Initial refund rollout across jobs and payment details.
- Immediate follow-up fixes for input behavior and mobile layout.

### Feb 26 / Feb 25 (adjacent updates)
- General UI/config sync updates.
- Onboarding gallery and download-related UX enhancements.

---

## 6) What the Developer Should Focus On Next

1. **Stability checks in refund + payment cross-flows**
   - Validate all entry points produce consistent refund behavior.

2. **Partial-state consistency**
   - Ensure partial payment and partial refund states remain synchronized in job and transaction views.

3. **Schedule-time compatibility**
   - Keep routing and scheduled-time logic independent but compatible with refund/payment status side effects.

4. **Regression watchlist**
   - Cancelled-paid job refund trigger path.
   - Menu actions around destructive options.
   - Payment details readability in mixed invoice scenarios.

---

## 7) Handoff Notes

- This summary is intentionally **non-code** and product-focused.
- Refund and payment details had the highest velocity in this cycle.
- Schedule time is currently a stable foundation; future changes should be tested against refund/payment edge cases.
