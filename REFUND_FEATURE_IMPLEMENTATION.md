# Refund Feature Implementation - Mobile Jobs Screen

## Overview
Added "Refund" option to the three-dot menu in the `/jobs` mobile screen for paid jobs only. This feature allows merchants to process refunds directly from the job card menu with appropriate eligibility checks and visual indicators.

## Changes Made

### 1. Jobs.tsx Page (`mobile-version/src/pages/Jobs.tsx`)

#### Imports Added
```tsx
import RefundModal from "@/components/modals/RefundModal";
```

#### State Management
```tsx
// Refund modal state
const [showRefundModal, setShowRefundModal] = useState(false);
const [selectedInvoiceForRefund, setSelectedInvoiceForRefund] = useState<any>(null);
```

#### Helper Functions

**`getPaidInvoicesForJob(jobId: string)`**
- Retrieves all paid invoices associated with a job
- Checks invoice status === "Paid"
- Searches by sourceId and linkedInvoices references
- Returns array of paid invoices for the job

**`canRefundJob(jobId: string): boolean`**
- Validates job eligibility for refund
- Checks:
  - Job status === "Completed"
  - Job has at least one paid invoice
- Returns boolean indicating refund eligibility

#### Event Handlers

**`handleRefundJob(jobId: string)`**
- Opens refund flow with smart invoice selection:
  - **Single Invoice**: Opens RefundModal immediately
  - **Multiple Invoices**: Shows first invoice with TODO for selector UI
  - **No Invoices**: Shows error toast
- Sets `selectedInvoiceForRefund` state
- Toggles `showRefundModal`

**`handleRefundComplete(refundData: any)`**
- Processes refund completion
- Closes modal and clears state
- Shows success toast
- TODO: Update invoice status in backend

#### Modal Rendering
```tsx
{/* Refund Modal */}
{selectedInvoiceForRefund && (
  <RefundModal
    isOpen={showRefundModal}
    onClose={() => {
      setShowRefundModal(false);
      setSelectedInvoiceForRefund(null);
    }}
    invoice={selectedInvoiceForRefund}
    onRefundComplete={handleRefundComplete}
  />
)}
```

#### Props Passed to JobCard
```tsx
// Refund handler
onRefund={() => handleRefundJob(job.id)}
canRefund={canRefundJob(job.id)}
```

---

### 2. JobCard Component (`mobile-version/src/components/cards/JobCard.tsx`)

#### Props Added
```tsx
interface JobCardProps {
  // ... existing props ...
  
  // Refund handler
  onRefund?: () => void;
  // Check if job is refundable
  canRefund?: boolean;
}
```

#### Component Parameters
```tsx
const JobCard = ({ 
  // ... existing destructured props ...
  onRefund,
  canRefund = false,
}: JobCardProps) => {
```

#### Icon Import
Added `RotateCcw` icon for refund menu item:
```tsx
import { ..., RotateCcw } from "lucide-react";
```

#### Menu Item Logic
Inside `buildMenuItems()` function, added refund option:

```tsx
// Add Refund option for eligible jobs (Completed + has paid invoices)
if (canRefund && onRefund && jobStatus === "Completed") {
  items.push({
    label: "Refund",
    icon: RotateCcw,
    action: onRefund,
    separator: true,
    variant: "destructive", // Red text styling
  });
}
```

**Menu Item Properties:**
- **Label**: "Refund"
- **Icon**: RotateCcw (visual indicator for refund/reversal action)
- **Separator**: `true` (visual separation from other actions)
- **Variant**: "destructive" (red text for emphasis)
- **Action**: Calls `handleRefundJob(jobId)`

---

## UI/UX Implementation

### Menu Item Styling
The "Refund" menu item uses the `destructive` variant which provides:
- **Text Color**: Red (#ef4444 - `text-red-600`)
- **Hover State**: Darker red background with darker text (`hover:bg-red-50`)
- **Icon Color**: Matches text (red for destructive actions)
- **Visual Separation**: Divider above the menu item separates it from other actions

### Visibility Rules
Refund option appears ONLY when ALL conditions are met:
1. ✅ Job status = "Completed"
2. ✅ Job has at least one associated invoice
3. ✅ Invoice payment status = "Paid"
4. ✅ `canRefund` prop = `true`
5. ✅ `onRefund` handler provided

### Menu Item Position
- **Last Item**: Refund appears as the last menu item
- **Visual Hierarchy**: Separated by divider to emphasize its distinct purpose

---

## Refund Flow

### Single Paid Invoice
```
Job (Completed status) with 1 Paid Invoice
    ↓
User clicks "Refund" menu item
    ↓
handleRefundJob() called
    ↓
getPaidInvoicesForJob() finds 1 invoice
    ↓
RefundModal opens directly with invoice data
    ↓
User completes refund in modal
    ↓
handleRefundComplete() callback fires
```

### Multiple Paid Invoices (Future Enhancement)
```
Job (Completed status) with N Paid Invoices
    ↓
User clicks "Refund" menu item
    ↓
handleRefundJob() called
    ↓
getPaidInvoicesForJob() finds N invoices
    ↓
[TODO] Show invoice selector bottom sheet
    ↓
User selects invoice
    ↓
RefundModal opens with selected invoice
```

---

## Data Validation

### Eligibility Checks
```tsx
// In canRefundJob()
1. Job must exist in jobs array
2. Job status must equal "Completed"
3. Job must have at least one invoice with status "Paid"
4. Returns false for: Scheduled, In Progress, Canceled jobs
5. Returns false for: Unpaid or Partially Paid invoices
```

### Invoice Discovery
```tsx
// In getPaidInvoicesForJob()
1. Check sourceId reference (direct invoice association)
2. Check linkedInvoices array (multiple invoices)
3. Check job ID pattern (JOB-XXX → match with INV-XXX)
4. Filter: Only invoices with status === "Paid"
```

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| No paid invoices found | Toast: "No paid invoices found for this job" |
| Multiple paid invoices | Toast: "Found X paid invoices. Refunding first one..." (with TODO for selector) |
| Job not completed | Menu item hidden |
| Invoice not paid | Menu item hidden |
| No associated invoices | Menu item hidden |

---

## Future Enhancements

### TODO: Invoice Selector UI
```tsx
// When multiple paid invoices exist
- Show bottom sheet with invoice list
- Display: Invoice #, Amount, Payment Date
- User selects one invoice
- RefundModal opens with selected invoice
```

### TODO: Backend Integration
```tsx
// handleRefundComplete() needs to:
- Send refund data to backend API
- Update invoice status to "Partially Refunded" or "Refunded"
- Update job refund tracking
- Handle partial refunds
- Store refund records for audit trail
```

### TODO: Prevent Duplicate Refunds
```tsx
// Enhancement: canRefundJob() should also check:
- If invoice already fully refunded → hide menu item
- If invoice already partially refunded → show remaining amount only
```

### TODO: Refund History
```tsx
// Track refunds per job:
- Show refund status badge on job card
- Link to refund history/details
- Display refund amount vs original amount
```

---

## Files Modified

1. **[mobile-version/src/pages/Jobs.tsx](mobile-version/src/pages/Jobs.tsx)**
   - Added RefundModal import
   - Added refund state management
   - Added helper functions (getPaidInvoicesForJob, canRefundJob)
   - Added event handlers (handleRefundJob, handleRefundComplete)
   - Added RefundModal rendering
   - Updated JobCard props with refund handler and canRefund

2. **[mobile-version/src/components/cards/JobCard.tsx](mobile-version/src/components/cards/JobCard.tsx)**
   - Added onRefund and canRefund props
   - Added RotateCcw icon import
   - Updated buildMenuItems() to include refund option
   - Added variant="destructive" styling for refund menu item
   - Added separator and conditional visibility logic

---

## Testing Checklist

- [x] Refund menu item appears only for Completed jobs
- [x] Refund menu item appears only for jobs with paid invoices
- [x] Refund menu item has red icon and text (destructive variant)
- [x] Refund menu item has divider separator above it
- [x] Clicking Refund opens RefundModal with correct invoice
- [x] No errors in console for refund functionality
- [x] RefundModal closes properly after completion
- [x] Single invoice flows directly to RefundModal
- [x] Menu item hidden for unpaid jobs
- [x] Menu item hidden for Scheduled/In Progress jobs
- [x] Menu item hidden for Canceled jobs

---

## Component Integration

### Dependencies
- **RefundModal**: Existing modal component for processing refunds
- **KebabMenu**: Existing menu component with destructive variant support
- **mockInvoices**: Mock data for invoice details
- **toast**: Notification system for user feedback

### Data Flow
```
Jobs Page
  ├─ getPaidInvoicesForJob(jobId)
  │  └─ mockInvoices filtered by job reference
  ├─ canRefundJob(jobId)
  │  └─ returns boolean for job eligibility
  ├─ handleRefundJob(jobId)
  │  └─ opens RefundModal if eligible
  └─ JobCard Component
     ├─ receives canRefund prop
     ├─ receives onRefund handler
     └─ renders "Refund" menu item conditionally
```

---

## Backward Compatibility

✅ **No Breaking Changes**
- Refund option is conditional and hidden by default
- Existing menu items unchanged
- Only added new optional props (onRefund, canRefund)
- Default values prevent errors if props not provided
- RefundModal already existed and works independently

---

## Performance Considerations

- **getPaidInvoicesForJob()**: O(n) where n = number of invoices (filtered array)
- **canRefundJob()**: O(n) for single function call
- Called per-job during render, but only evaluates for visible jobs
- Memoization opportunity: `useMemo` could cache eligible jobs for large lists

---

## Accessibility

✅ **WCAG Compliance**
- Menu items keyboard navigable (existing KebabMenu)
- Color + icon for "Refund" (not color-only)
- Clear text labels
- Error messages in toasts and modals

---

## Summary

The refund feature is now fully integrated into the mobile `/jobs` screen with:
- ✅ Smart eligibility validation
- ✅ Clear visual indicators (red destructive styling)
- ✅ Logical menu positioning
- ✅ Single/Multiple invoice handling
- ✅ Error handling and user feedback
- ✅ No breaking changes to existing code
- ✅ Ready for backend integration and invoice selector UI

