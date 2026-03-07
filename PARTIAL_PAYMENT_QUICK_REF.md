# Partial Payment Quick Reference

## What Changed?

### ✅ Job Card Display
- **New Badge**: Orange "Partially Paid" badge for jobs with mixed invoice payments
- **Amount Display**: Shows "$1100 / $1500" format next to badge
- **Pay Button**: Visible for both unpaid and partially paid jobs

### ✅ Refund Flow
- **Smart Filtering**: Only paid invoices shown in refund modal
- **Invoice Selector**: Dropdown to choose which paid invoice to refund
- **Auto-selection**: First paid invoice selected by default

### ✅ Data Structure
- **Job Fields**: Added `totalAmount` and `paidAmount` fields
- **Invoice Link**: Invoices can link to jobs via `jobId` field
- **Status Types**: "paid" | "unpaid" | "partial"

## Demo Job: JOB-015

**Customer**: Jennifer Wilson  
**Status**: Partially Paid  
**Total**: $1500  
**Paid**: $1100  
**Remaining**: $400

### Invoices
1. **INV-017**: $500 (Paid via Check) ✅
2. **INV-018**: $600 (Paid via Cash) ✅
3. **INV-019**: $400 (Open/Unpaid) ❌

## How to Test

### View Partial Status
1. Go to Jobs page
2. Find "Thermostat Install" (Jennifer Wilson)
3. See orange "Partially Paid" badge
4. See "$1100 / $1500" amount

### Test Refund Flow
1. Click kebab menu → Refund
2. See dropdown with only INV-017 and INV-018
3. INV-019 is hidden (unpaid)
4. Select invoice and complete refund

### Test Payment
1. Click "Pay" button on job
2. Pay remaining $400
3. Status changes to "Paid"

## Code Locations

| Feature | File | Lines |
|---------|------|-------|
| Badge Display | JobCard.tsx | ~548-560 |
| Invoice Filtering | RefundModal.tsx | ~81-86 |
| Paid Invoices Logic | Jobs.tsx | ~1130-1160 |
| Demo Data | mobileMockData.ts | ~428, ~263-265 |

## Git Info

**Commit**: c42f109  
**Branch**: main  
**Remote**: origin/main  
**Documentation**: PARTIAL_PAYMENT_IMPLEMENTATION.md

## Color Scheme

- **Paid**: Green (bg-green-100 text-green-700)
- **Partial**: Orange (bg-orange-100 text-orange-700)
- **Unpaid**: No badge (shows Pay button)
