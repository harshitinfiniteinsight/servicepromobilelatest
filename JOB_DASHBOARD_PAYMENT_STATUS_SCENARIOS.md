# Job Dashboard — Payment Status Scenarios

This document summarizes all payment-status scenarios currently handled in the Job dashboard (mobile app), based on existing logic in the codebase.

## 1) Source-to-Filter Status Mapping (used by Job filter: Paid/Open)

> This mapping is used when filtering jobs by **Payment = Paid/Open**.

| Job Source / ID Pattern | Source Status Values | Mapped Filter Status | Notes |
|---|---|---|---|
| Invoice job (`INV*`) | `Paid` | `Paid` | Any invoice status other than `Paid` maps to `Open`. |
| Invoice job (`INV*`) | `Open`, `Overdue`, `Deactivated`, `Refunded`, `Partially Refunded`, etc. | `Open` | Current filter logic only treats exact `Paid` as paid. |
| Estimate job (`EST*`) | `Converted to Invoice`, `Paid` | `Paid` | Both are considered paid for filtering. |
| Estimate job (`EST*`) | Any other estimate status | `Open` | Includes draft/open/pending-like states. |
| Agreement job (`AGR*` or contains `AGR`) | `Paid` | `Paid` | Exact match only. |
| Agreement job (`AGR*`) | Any other agreement status | `Open` | Includes partially refunded/open-like states. |
| Generic job (`JOB*` / non-doc ID) | Job status `Completed` or `Feedback Received` | `Paid` | Fallback when no direct doc ID pattern. |
| Generic job (`JOB*`) | Job status `Scheduled`, `In Progress`, `Cancel`, others | `Open` | Fallback path. |

---

## 2) Card-Level Job Payment States (used for badges/actions)

> This uses `job.paymentStatus` (`paid` / `partial` / `unpaid`) and controls badge/actions on each job card.

| `job.paymentStatus` | Badge on Job Card | Pay Button Label | Refund Menu Visibility | Typical Meaning |
|---|---|---|---|---|
| `paid` | `Paid` (green) | Hidden | Visible (if refundable docs exist) | Fully paid amount remains after refunds. |
| `partial` | `Partially Paid` (orange) + amount text (`$paid / $total`) | `Pay` / `Complete Payment` flow | Visible (if refundable docs exist) | Some amount paid, not fully settled. |
| `unpaid` | No paid badge | `Pay` visible | Hidden | Nothing paid yet / fully refunded to zero net paid. |

---

## 3) Payment/Refund Transition Scenarios

| Scenario | Inputs / Trigger | Resulting `job.paymentStatus` | Remaining Amount Behavior | Continue / Actions |
|---|---|---|---|---|
| Full payment completes all selectable docs | User pays and selected payable docs count >= total payable docs | `paid` | N/A | Pay flow closes; job updated as paid. |
| Partial payment (not all docs paid) | User pays subset of payable docs | `partial` | N/A | Pay flow closes; job remains partially paid. |
| Refund from paid job (some net paid remains) | Refund processed; net paid > 0 and < invoiced total | `partial` | In refund modal: `remaining = totalAvailable - enteredRefundTotal` | Refund allowed again if refundable amount remains. |
| Refund from paid/partial job to zero net paid | Refund processed; net paid <= 0 | `unpaid` | Remaining in modal clamped to 0 min | Pay becomes available again. |
| Refund with remaining refundable balance | Paid base - refunded > 0 for at least one linked doc | `paid` or `partial` (depends on net paid) | Remaining shown reactively and never below 0 | Refund option stays meaningful. |
| Refund when no refundable docs | No paid/partially paid docs with positive refundable amount | No status change | N/A | Refund flow blocked with toast error. |
| Cancel a paid/partial job | Job status changed to `Cancel` | paymentStatus preserved until refund updates it | N/A | Refund auto-opens once on cancel for paid/partial jobs. |

---

## 4) Multi-Invoice Partial Refund Allocation Scenarios (current behavior)

| Selected Invoices | User Inputs | Entered Total | Total Available | Remaining Amount | Validation |
|---|---|---:|---:|---:|---|
| Single invoice | One partial amount field | Parsed field value | Invoice refundable amount | `max(totalAvailable - enteredTotal, 0)` | Must be > 0 and <= available. |
| Multiple invoices | Per-invoice input fields | Sum of all invoice inputs (empty = 0) | Sum of all selected invoice refundable amounts | `max(totalAvailable - enteredTotal, 0)` | Each invoice input must be valid and <= that invoice max. |
| Multiple invoices + over-entered total | Per-invoice sum exceeds available | > total available | Fixed total | 0 (clamped) | Shows validation error; Continue disabled. |
| Empty per-invoice inputs | Blank/partial fields | 0 | Fixed total | Full available amount | Continue disabled until entered total > 0 and valid. |

---

## 5) Edge Cases (explicit)

| Edge Case | Current Handling |
|---|---|
| Floating-point precision while summing entered amounts | Uses cent-based calculations (`toCents` / `fromCents`) to avoid precision drift. |
| Typing intermediate values (`"5"`, `"50"`, blank) | Parsed safely; blank treated as 0; UI updates reactively. |
| Remaining amount negative possibility | Always clamped: `remaining = max(totalAvailable - enteredTotal, 0)`. |
| Refund over-allocation attempt | Validation error shown and Continue disabled. |
| Mixed original payment methods across multiple invoices | Allowed; “Original Payment Method” routes per-invoice refund to each invoice’s original method. |

---

## 6) Quick Reference Formulae

- `totalAvailableRefund = sum(selectedInvoice.refundableAmount)`
- `enteredRefundTotal = sum(userEnteredInvoiceAmounts)`
- `remainingAmount = max(totalAvailableRefund - enteredRefundTotal, 0)`

For currency safety, compute in cents where possible.
