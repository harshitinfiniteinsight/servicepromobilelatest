# Impact Analysis: Deactivating Unpaid Invoices & Estimates

This document outlines the system-wide behavior and impact when an **Unpaid Invoice** or **Estimate** is marked as **Deactivated**. This ensures all stakeholders understand the financial, operational, and visual consequences of this action.

## 1. Overview
**Deactivation** is a "soft delete" or "voiding" action. It removes the document from the active workflow without permanently deleting the record. This is useful for:
*   Canceling duplicate estimates.
*   Voiding invoices sent in error.
*   Removing tests or drafts that were never meant to be paid.

**Key Rule:** Only **Unpaid** or **Open** documents can be deactivated. Paid documents cannot be deactivated to preserve financial integrity.

---

## 2. Impact by Module

### A. Invoices & Estimates (List Views)
*   **Visibility:** The deactivated document **removed** from the main "All", "Open", or "Unpaid" lists. It moves to a dedicated **"Deactivated"** tab/filter.
*   **Status Change:** The status updates to **"Deactivated"**.
*   **Actions:**
    *   **Restricted:** Payment options (Pay Now, Pay Cash) and Conversion options (Convert to Job) are **disabled**.
    *   **Allowed:** You can still **Preview** the document or **Reactivate** it if needed.

### B. Financial Metrics & Dashboard
*   **Outstanding Balance:** The amount of a deactivated invoice is **deducted** from the "Total Outstanding" or "Accounts Receivable" metrics. It no longer counts as money owed to the business.
*   **Projected Revenue:** Deactivated estimates are removed from "Projected Revenue" or "Pipeline" calculations.
*   **Reporting:** These documents are excluded from standard revenue reports unless "Include Voided/Deactivated" is specifically selected.

### C. Customer Profile
*   **Customer Balance:** The customer's total "Amount Due" will **decrease** by the value of the deactivated invoice.
*   **History:** The document remains in the Customer's history log for audit purposes but is clearly flagged as "Deactivated" (often grayed out or with a specific icon).
*   **Communications:** Automated reminders (e.g., "Invoice Due" emails) for this document will **stop immediately**.

### D. Jobs & Schedule
*   **Unlinking:** If the estimate/invoice was linked to a potential Job, the link indicates the source is invalid.
*   **Conversion:** You cannot convert a deactivated estimate into a Job or Invoice until it is Reactivated.

---

## 3. Summary of Differences

| Feature | Active (Unpaid) | Deactivated |
| :--- | :--- | :--- |
| **List Visibility** | Main List (Open/Unpaid) | Deactivated Tab Only |
| **Financials** | Counts towards "Outstanding" | **Excluded** from totals |
| **Customer Balance** | Increases Balance | **No Impact** (Removed) |
| **Payment Button** | Available | **Hidden/Disabled** |
| **Reminders** | Active | **Stopped** |
| **Conversion** | Can convert to Job/Invoice | **Locked** |

## 4. Reactivation
If a document was deactivated by mistake, it can be **Reactivated**.
*   **Action:** Go to the "Deactivated" tab, find the document, and select **"Activate"**.
*   **Result:** The document returns to the "Open" or "Unpaid" list, reappears in financial totals, and payment options become available again.
