# Updated Refund Flow Guide

## Purpose
This document explains the updated refund experience in simple terms. It is intended for product, support, QA, and business stakeholders.

---

## What Changed
The refund process now uses an **item-level flow** instead of a broad invoice-only flow.

### Before
- Refund was selected at the invoice level.
- Limited flexibility for choosing specific line items.

### Now
- User first selects the invoice.
- User then selects exact line items to refund.
- System returns to refund form with selected items and calculated totals.
- User completes reason and refund method, then submits.

---

## High-Level User Journey

1. Open refund from Jobs or Invoices.
2. Select the invoice to refund.
3. App opens **Select Items to Refund** modal.
4. Choose one or more refundable line items.
5. Confirm selection.
6. App returns to Refund modal with:
   - Total Refund Amount
   - Remaining Balance
   - Invoice details
7. Enter refund reason.
8. Continue to refund method step.
9. Issue refund.

---

## Modal Flow (Swap Pattern)

The experience uses a modal swap (not an in-modal stepper):

- **Refund Modal** → invoice context and refund details
- **Item Selection Modal** → line-item picking
- Back to **Refund Modal** → finalize and submit

This keeps the interface focused and easier to understand on mobile.

---

## Key UX Improvements

- **Single invoice focus**: prevents mixed selection confusion.
- **Item-level control**: users refund exactly what is needed.
- **State persistence**: selected items remain saved when moving between modals.
- **Re-selection support**: users can choose “Change selected items” to reopen item selection with previous items already selected.
- **Clear financial visibility**:
  - Total Refund Amount
  - Remaining Balance
  - Invoice ID shown in summary

---

## Data/Behavior Summary

### Selection Rules
- Refund starts from one selected invoice.
- Only refundable items are shown in item selection.
- Previously selected items are remembered in the session.

### Amount Calculation
- Refund total is based on selected line items.
- Remaining balance = invoice paid/total amount minus selected refund total.
- Remaining balance is never shown as negative.

### Refund Summary (Final Step)
- Invoice ID
- Selected total
- Refund amount
- Refund method
- Refund status preview

---

## Error Prevention and Stability

The updated flow was implemented with compile checks and runtime flow validation. Core interaction points (selection, totals, modal transitions) were stabilized to reduce user-facing errors.

---

## QA Checklist (Non-Technical)

1. Start refund from Jobs page.
2. Select invoice and verify item modal opens.
3. Select a few items and confirm.
4. Verify total and remaining balance values.
5. Click “Change selected items” and confirm prior selections are pre-selected.
6. Complete refund reason and continue.
7. Verify summary shows invoice ID (not document count).
8. Issue refund and verify expected status updates.

---

## Intended Outcome

The updated refund flow is designed to be:
- More accurate
- Easier to understand
- Safer for financial operations
- Better suited for mobile users and real-world partial refunds
