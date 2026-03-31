# Refund User Story

## Overview
This document explains the refund feature from a user-story perspective. It is written for business, product, QA, support, and operations teams.

---

## Primary User Story

**As a staff member,**
I want to refund only the specific invoice items requested by the customer,
**so that** I can process accurate refunds without refunding the full invoice by mistake.

---

## Business Goal
The refund flow should help staff process refunds with clarity, confidence, and financial accuracy. The experience should be simple on mobile, reduce mistakes, and support partial item-based refunds.

---

## Users Involved
- Office staff
- Dispatcher or coordinator
- Manager or supervisor
- Support/admin team

---

## Trigger
A refund starts when a staff member opens the refund option from either:
- Jobs
- Invoices

---

## User Journey

### Step 1: Open Refund
The user opens the refund action for a paid invoice.

### Step 2: Select Invoice
The system focuses on one invoice at a time so the refund remains clear and controlled.

### Step 3: Select Items to Refund
The system opens the **Select Items to Refund** modal.
The user can choose one or more refundable items from the invoice.

### Step 4: Confirm Item Selection
After the user confirms the item selection:
- the refund modal opens again,
- the selected items are remembered,
- the refund amount is calculated automatically.

### Step 5: Review Refund Details
The user sees:
- Invoice ID
- Total Refund Amount
- Remaining Balance

### Step 6: Add Refund Reason
The user enters the reason for the refund.
This ensures the refund has business context and can be reviewed later.

### Step 7: Choose Refund Method
The user selects whether the refund goes to:
- the original payment method, or
- a different method where applicable.

### Step 8: Review Summary
The summary helps the user confirm:
- which invoice is being refunded,
- how much is being refunded,
- the refund method,
- the expected refund status.

### Step 9: Issue Refund
The user completes the refund.
The system records the refund and updates the invoice refund status.

---

## Supporting User Story

**As a staff member,**
I want to reopen item selection after already choosing items,
**so that** I can add or remove refund items without starting over.

### Expected Behavior
- A **Change selected items** option is available in the refund modal.
- When selected, the item selection modal opens again.
- Previously selected items remain pre-selected.
- The user can revise the selection and continue.

---

## Financial Clarity Story

**As a staff member,**
I want to see both the refund total and the remaining balance,
**so that** I understand the financial impact before issuing the refund.

### Expected Behavior
- The system shows the total refund amount for the selected items.
- The system shows the remaining invoice balance after the refund.
- The remaining balance never appears as a negative amount.

---

## Accuracy and Control Story

**As a manager,**
I want refunds to be tied to specific items and a reason,
**so that** refund activity is easier to review, validate, and audit.

### Expected Outcome
- Refunds are more precise.
- Staff avoid over-refunding.
- The invoice status reflects whether the invoice is partially refunded or fully refunded.

---

## Acceptance Criteria

### Core Flow
- User can start refund from Jobs or Invoices.
- User is guided through a single-invoice refund flow.
- User can select one or more refundable invoice items.
- Refund total is based on selected items only.
- Refund reason is required before continuing.
- User can complete the refund successfully.

### Re-selection Flow
- User can reopen the item selection modal.
- Previously selected items remain selected.
- Updated item selection refreshes the refund total.

### Summary and Visibility
- Refund summary shows **Invoice ID**.
- Refund summary does not rely on document count.
- Refund screen shows **Total Refund Amount**.
- Refund screen shows **Remaining Balance**.

### Status Outcome
- If the full refundable amount is returned, the invoice becomes fully refunded.
- If only part of the refundable amount is returned, the invoice becomes partially refunded.

---

## Non-Functional Expectations
- The refund flow should be mobile-friendly.
- The modal flow should feel simple and focused.
- Previously entered refund progress should be preserved where possible.
- The experience should minimize accidental mistakes.

---

## Value to the Business
This updated refund user story supports:
- better refund accuracy,
- better staff confidence,
- fewer mistakes,
- clearer auditability,
- stronger customer service handling for partial refunds.
