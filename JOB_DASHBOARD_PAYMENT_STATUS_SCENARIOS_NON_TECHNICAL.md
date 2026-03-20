# Job Dashboard Payment Status Guide (Non-Technical)

This is a simple guide to explain what each payment status means in the Job Dashboard.

---

## Quick Meaning of Payment Labels

| Payment Label | Simple Meaning |
|---|---|
| **Paid** | The customer has paid fully (or the job is treated as fully settled). |
| **Partially Paid** | The customer has paid some amount, but not the full amount yet. |
| **Open / Unpaid** | Payment is still pending, or nothing is paid currently. |

---

## Easy Scenarios (What users see)

| Scenario | What happened | What payment status should show | What user can do next |
|---|---|---|---|
| 1. Full payment done | Customer paid the entire bill | **Paid** | No more payment needed. Refund may be available. |
| 2. Partial payment done | Customer paid only part of the bill | **Partially Paid** | Collect remaining balance. Refund may still be available for paid amount. |
| 3. No payment yet | Job/invoice created but no payment received | **Open / Unpaid** | User can click **Pay** to collect payment. |
| 4. Estimate converted and treated as paid | Estimate was converted and marked paid by workflow | **Paid** | No payment action needed unless adjustments/refunds are required. |
| 5. Agreement paid | Agreement is marked paid | **Paid** | Normal paid behavior. |
| 6. Job completed but not fully linked to paid docs | Work finished but payment not complete | **Open / Unpaid** or **Partially Paid** | Payment still needs to be collected. |
| 7. Payment collected for some linked docs only | Multi-document job, only some documents paid | **Partially Paid** | Collect payment for remaining linked documents. |
| 8. All linked docs paid | Multi-document job, all selected/linked documents are paid | **Paid** | Payment complete. |

---

## Refund Scenarios (Simple)

| Scenario | What happened | Status impact |
|---|---|---|
| 9. Refund from a Paid job (small refund) | Some money refunded, but customer has still paid net amount | Often becomes **Partially Paid** |
| 10. Refund until net paid becomes zero | Full effective refund of paid amount | Becomes **Open / Unpaid** |
| 11. Refund attempted but nothing refundable left | Already fully refunded or no paid amount available | No status change; refund should not proceed |
| 12. Job canceled after payment | Job canceled while paid/partially paid | Refund flow may open so user can return money appropriately |

---

## Multi-Invoice Partial Refund (Easy Explanation)

| Scenario | User input | Result |
|---|---|---|
| 13. Two invoices selected, user enters refund per invoice | Example: $200 on invoice A and $500 on invoice B | Total refund entered = $700 |
| 14. Remaining amount shown | If total available is $800 and user entered $700 | Remaining amount should show **$100** |
| 15. User enters too much refund | Entered total is more than available | Show error and disable **Continue** |
| 16. Some fields left blank | Empty inputs are treated as 0 | Remaining updates correctly and safely |

---

## What users should remember

| Rule | Plain-English guidance |
|---|---|
| Paid | Fully settled. |
| Partially Paid | Some paid, some still due. |
| Open / Unpaid | Payment still needed. |
| Refunds | Refunds reduce the paid amount and can move status from Paid → Partial → Unpaid. |
| Over-refund prevention | System should block refund values above available amount. |

---

## One-line formula (non-technical)

**Remaining Amount = Total Refund Available − Total Refund Entered**

If this goes below 0, the system should stop and show an error.
