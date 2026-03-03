# Refund Feature - Quick Reference

## What Was Added

### Feature: Refund Option in Jobs Menu
Added a "Refund" menu item to the three-dot menu for paid jobs on the mobile `/jobs` screen.

## Where to Find It

**Mobile App**: `/jobs` screen → Three-dot menu on any Completed job with paid invoices

## Menu Item Details

| Property | Value |
|----------|-------|
| Label | "Refund" |
| Icon | RotateCcw (refund symbol) |
| Color | Red (destructive variant) |
| Position | Last item in menu |
| Separator | Yes (divider above item) |

## When It Appears

✅ Shows ONLY when ALL are true:
- Job status = "Completed"
- Job has at least one invoice
- Invoice status = "Paid"

❌ Hidden when:
- Job is "Scheduled"
- Job is "In Progress"
- Job is "Canceled"
- No invoices associated
- Invoice is "Unpaid"
- Invoice is "Partially Paid"

## How It Works

### User Action Flow

1. **User sees Jobs list** → Jobs page loads with multiple jobs
2. **Finds Completed job with paid invoice** → Job card displays
3. **Taps three-dot menu** → Menu expands
4. **Sees "Refund" option** → Option appears in red at bottom
5. **Taps "Refund"** → RefundModal opens
6. **Processes refund** → Completes in modal
7. **Modal closes** → Returns to jobs list

### Backend Logic

```
User clicks "Refund"
    ↓
handleRefundJob(jobId)
    ↓
getPaidInvoicesForJob(jobId) → Find all paid invoices
    ↓
If 1 invoice: Open RefundModal directly
If N invoices: [TODO] Show invoice selector
If 0 invoices: Show error toast
```

## Code Locations

| Component | File | Lines |
|-----------|------|-------|
| Import RefundModal | Jobs.tsx | 28 |
| State Variables | Jobs.tsx | 246-247 |
| Helper Functions | Jobs.tsx | 1133-1160 |
| Event Handlers | Jobs.tsx | 1162-1189 |
| Modal Rendering | Jobs.tsx | 1680-1691 |
| JobCard Props | Jobs.tsx | 1484-1485 |
| JobCard Interface | JobCard.tsx | 57-60 |
| Menu Item Logic | JobCard.tsx | 466-475 |
| Icon Import | JobCard.tsx | 4 |

## Testing Scenarios

### Scenario 1: Completed job with 1 paid invoice
```
✓ Refund menu item visible
✓ Red color with RotateCcw icon
✓ Divider above item
✓ Click opens RefundModal
✓ Modal shows correct invoice
```

### Scenario 2: Completed job with no invoices
```
✓ Refund menu item hidden
✓ No error in console
```

### Scenario 3: Scheduled job
```
✓ Refund menu item hidden
✓ Other menu items normal
```

### Scenario 4: Refund modal completion
```
✓ Modal closes
✓ Returns to jobs screen
✓ Success toast shown
```

## Key Functions

### `canRefundJob(jobId: string): boolean`
Checks if a job is eligible for refund
```tsx
// Returns true only if:
// - Job exists
// - Job status = "Completed"
// - Job has at least 1 paid invoice
```

### `getPaidInvoicesForJob(jobId: string): Invoice[]`
Finds all paid invoices for a job
```tsx
// Returns array of invoices where:
// - status = "Paid"
// - Associated with job by ID, sourceId, or linkedInvoices
```

### `handleRefundJob(jobId: string): void`
Opens refund flow
```tsx
// Gets paid invoices
// If 1: Opens RefundModal directly
// If N: Shows toast (TODO: show selector)
// If 0: Shows error toast
```

### `handleRefundComplete(refundData): void`
Handles refund completion
```tsx
// Closes modal
// Clears state
// Shows success toast
// TODO: Update invoice status
```

## Props Used

### JobCard Props (New)
```tsx
onRefund?: () => void;           // Handler to open refund modal
canRefund?: boolean;              // Whether job is refundable
```

### Passed from Jobs.tsx
```tsx
onRefund={() => handleRefundJob(job.id)}
canRefund={canRefundJob(job.id)}
```

## Styling

### Menu Item Appearance
- **Default**: Black text on white background
- **Hover**: Dark red background with red text
- **Icon**: Red color (matches text)
- **Separator**: Gray divider line above item

### CSS Classes
```tsx
// Destructive variant styling in KebabMenu
variant="destructive"
→ "text-red-600 hover:text-red-700 hover:bg-red-50"
```

## Error Messages

| Error | Message |
|-------|---------|
| No paid invoices | "No paid invoices found for this job" |
| Multiple invoices | "Found X paid invoices. Refunding first one..." |
| Refund success | Shown as success toast |

## Future TODOs

1. **Invoice Selector UI** - When multiple paid invoices exist
2. **Backend Integration** - Update invoice status after refund
3. **Duplicate Refund Prevention** - Check already refunded invoices
4. **Partial Refund Support** - Show remaining refundable amount
5. **Refund History** - Track all refunds per job

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Refund not showing | Check job status is "Completed" and has paid invoice |
| Menu item hidden | Verify invoice status = "Paid" in mock data |
| Modal doesn't open | Check React Router and modal state management |
| Console errors | Verify imports and prop types match interfaces |

## Performance Notes

- Helper functions run on each render of visible jobs
- Consider memoization for large job lists
- getPaidInvoicesForJob() loops through all mockInvoices
- No API calls (mock data only)

---

**Last Updated**: March 3, 2026  
**Status**: ✅ Ready for Testing  
**Coverage**: Single invoice flow complete | Multiple invoices TODO  
