# Partial Payment Status Implementation

## Overview
Implemented support for jobs with multiple invoices and introduced "Partially Paid" status to handle scenarios where a job has multiple invoices with mixed payment statuses.

## Implementation Date
January 2025

## Business Logic

### Payment Status Rules
1. **Unpaid**: All invoices are unpaid (status: "Open", "Overdue", or similar)
2. **Partially Paid**: Some invoices are paid, some are unpaid
3. **Paid**: All invoices are paid

### Refund Flow
- **Only paid invoices** are shown in the refund modal when source is "job"
- Users can select from a dropdown of paid invoices to refund
- Unpaid invoices are filtered out automatically

### Payment Flow
- Pay button shows for jobs with "unpaid" or "partial" status
- Payment modal handles the remaining unpaid amount
- Job status updates after payment completion

## Demo Scenario: JOB-015

### Job Details
- **Job ID**: JOB-015
- **Title**: Thermostat Install
- **Customer**: Jennifer Wilson (ID: 6)
- **Payment Status**: partial
- **Total Amount**: $1500
- **Paid Amount**: $1100

### Associated Invoices
1. **INV-017**
   - Amount: $500
   - Status: Paid
   - Payment Method: Check
   - Issue Date: 2024-01-11

2. **INV-018**
   - Amount: $600
   - Status: Paid
   - Payment Method: Cash
   - Issue Date: 2024-01-14

3. **INV-019**
   - Amount: $400
   - Status: Open
   - Payment Method: Unpaid
   - Issue Date: 2024-01-17

## Code Changes

### 1. Data Structure (mobileMockData.ts)

#### Job Type Enhancement
- Added `totalAmount` field to jobs
- Added `paidAmount` field to jobs
- JobPaymentStatus type already includes: `"paid" | "unpaid" | "partial"`

#### Invoice Type Enhancement
- Added optional `jobId` field to link invoices to jobs
- Example: `jobId: "JOB-015"`

#### Updated JOB-015
```typescript
{
  id: "JOB-015",
  title: "Thermostat Install",
  customerId: "6",
  customerName: "Jennifer Wilson",
  paymentStatus: "partial" as JobPaymentStatus,
  totalAmount: 1500,
  paidAmount: 1100,
  // ... other fields
}
```

#### Created/Updated Invoices
- **INV-017**: $500, Paid, linked to JOB-015
- **INV-018**: $600, Paid, linked to JOB-015
- **INV-019**: $400, Open, linked to JOB-015

### 2. JobCard Component (JobCard.tsx)

#### Partially Paid Badge
- Added orange badge for partial payment status
- Shows "Partially Paid" label with orange background (bg-orange-100 text-orange-700)
- Displays paid/total amounts: "$1100 / $1500"

```tsx
{job.paymentStatus === "partial" && (
  <div className="flex items-center gap-1">
    <Badge className="text-[10px] px-1.5 py-0 h-4 rounded-full whitespace-nowrap bg-orange-100 text-orange-700 border-orange-200">
      Partially Paid
    </Badge>
    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
      ${job.paidAmount} / ${job.totalAmount}
    </span>
  </div>
)}
```

#### Pay Button Visibility
- Pay button shows for jobs with status !== "paid"
- This includes both "unpaid" and "partial" statuses
- Maintains existing cancel/canceled status checks

### 3. RefundModal Component (RefundModal.tsx)

#### Paid Invoices Filtering
```typescript
const paidInvoices = useMemo(() => {
  if (source === "job") {
    return allInvoices.filter(inv => inv.status === "Paid" || inv.status === "paid");
  }
  return allInvoices;
}, [source, allInvoices]);
```

#### Invoice Selector Update
- Changed from `allInvoices` to `paidInvoices` in:
  - Initial selection (useEffect)
  - Dropdown options rendering
  - Invoice selection handler

#### User Experience
- When opening refund modal from a job, only paid invoices appear in dropdown
- Pre-selects first paid invoice automatically
- Shows clear invoice information: ID, Amount, Status

### 4. Jobs Page (Jobs.tsx)

#### getPaidInvoicesForJob Function
Updated to support multiple invoices and partial payment status:

```typescript
const getPaidInvoicesForJob = (jobId: string) => {
  const job = jobs.find(j => j.id === jobId);
  if (!job) return [];

  // For jobs with partial or paid status, find all related invoices
  if (job.paymentStatus === "paid" || job.paymentStatus === "partial") {
    // First, try to find invoices linked via jobId field
    const invoicesWithJobId = mockInvoices.filter(
      inv => (inv as any).jobId === jobId && inv.status === "Paid"
    );
    if (invoicesWithJobId.length > 0) {
      return invoicesWithJobId;
    }

    // Fallback: Check by sourceId reference (for single-invoice jobs)
    if ((job as any)?.sourceId) {
      const bySourceId = mockInvoices.find(
        inv => inv.id === (job as any)?.sourceId && inv.status === "Paid"
      );
      if (bySourceId) return [bySourceId];
    }

    // Also check by job ID matching for direct invoice jobs
    if (job.id.startsWith("INV")) {
      const directInvoice = mockInvoices.find(
        inv => inv.id === job.id && inv.status === "Paid"
      );
      if (directInvoice) return [directInvoice];
    }
  }

  return [];
};
```

**Key Changes:**
- Added support for "partial" payment status
- Prioritizes finding invoices by `jobId` field (for multi-invoice jobs)
- Only returns invoices with status === "Paid"
- Falls back to sourceId/direct matching for backwards compatibility

## UI/UX Features

### Job Card Display
1. **Paid Status**: Green badge showing "Paid"
2. **Partially Paid Status**: 
   - Orange badge showing "Partially Paid"
   - Amount text showing "$1100 / $1500" format
3. **Unpaid Status**: No badge, Pay button visible

### Refund Flow
1. Click "Refund" on a partially paid job
2. Modal opens with dropdown of paid invoices only
3. Select specific invoice to refund
4. Complete normal refund flow (Full/Partial, Payment Method, etc.)
5. System processes refund for selected invoice

### Payment Flow
1. Pay button visible for unpaid/partial jobs
2. Click Pay to open payment modal
3. Pay remaining unpaid amount
4. Job status updates when all invoices are paid

## Testing Scenarios

### Scenario 1: View Partially Paid Job
1. Navigate to Jobs page
2. Find JOB-015 (Thermostat Install - Jennifer Wilson)
3. **Expected**: Orange "Partially Paid" badge with "$1100 / $1500"
4. **Expected**: Pay button visible (for remaining $400)

### Scenario 2: Refund Paid Invoice from Partial Job
1. Click kebab menu on JOB-015
2. Select "Refund"
3. **Expected**: Refund modal opens with dropdown
4. **Expected**: Dropdown shows only INV-017 ($500) and INV-018 ($600)
5. **Expected**: INV-019 ($400 Open) is NOT shown
6. Select INV-017 and complete refund
7. **Expected**: Refund processes successfully

### Scenario 3: Pay Remaining Balance
1. Click "Pay" button on JOB-015
2. **Expected**: Payment modal opens for remaining amount
3. Complete payment for $400
4. **Expected**: Job status changes to "paid"
5. **Expected**: All badges update accordingly

## Technical Notes

### Type Safety
- All changes maintain TypeScript type safety
- JobPaymentStatus type already included "partial"
- No breaking changes to existing interfaces

### Backwards Compatibility
- Single-invoice jobs continue to work via sourceId matching
- Existing paid/unpaid logic unchanged
- Falls back to previous behavior when jobId not present

### Performance
- `paidInvoices` computed with useMemo for efficiency
- Filter operations run once per modal open
- No impact on rendering performance

## Future Enhancements

### Potential Improvements
1. **Payment Modal Enhancement**: Support paying specific unpaid invoices
2. **Invoice Summary View**: Show all invoices in job details
3. **Bulk Refund**: Refund multiple invoices at once
4. **Payment History**: Track all payments and refunds per job
5. **Auto-status Calculation**: Compute job payment status from invoices dynamically

### API Integration Points
- GET /jobs/:id/invoices - Fetch all invoices for a job
- POST /invoices/:id/refund - Process refund for specific invoice
- POST /invoices/:id/payment - Process payment for specific invoice
- PATCH /jobs/:id/payment-status - Update job payment status

## Files Modified

1. `/mobile-version/src/data/mobileMockData.ts`
   - Updated JOB-015 with partial status and amounts
   - Created INV-017, INV-018, INV-019 with jobId links

2. `/mobile-version/src/components/cards/JobCard.tsx`
   - Added Partially Paid badge display
   - Added paid/total amount text

3. `/mobile-version/src/components/modals/RefundModal.tsx`
   - Added paidInvoices filtering
   - Updated invoice selector to use filtered list
   - Fixed step 3 removal bugs

4. `/mobile-version/src/pages/Jobs.tsx`
   - Enhanced getPaidInvoicesForJob function
   - Added support for jobId-based invoice linking

## Commit Message
```
feat: implement partial payment status for multi-invoice jobs

- Add "partial" payment status for jobs with mixed invoice payments
- Filter refund flow to show only paid invoices
- Display "Partially Paid" badge with amount breakdown on job cards
- Support multiple invoices linked to single job via jobId field
- Create demo scenario with JOB-015 (3 invoices: 2 paid, 1 unpaid)
- Update getPaidInvoicesForJob to handle multi-invoice scenarios

Demo: JOB-015 shows as Partially Paid with $1100/$1500 
Invoices: INV-017 ($500 Paid), INV-018 ($600 Paid), INV-019 ($400 Open)
```
