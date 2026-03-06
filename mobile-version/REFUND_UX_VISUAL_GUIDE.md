# Refund Flow - Quick Visual Guide

## 📱 Refund Modal Flow

### Step 1: Amount Selection
```
┌─────────────────────────────────────────┐
│  Refundable Balance                     │
│  $1,250.00                              │
│  Already refunded: $0.00                │
└─────────────────────────────────────────┘

┌──────────┬──────────┬──────────┐
│   50%    │   Full   │  Custom  │
│ $625.00  │$1,250.00 │  Enter   │
└──────────┴──────────┴──────────┘

If Custom selected:
┌─────────────────────────────────────────┐
│ Refund Amount *                         │
│ $ [___________]                         │
│                                         │
│ Refunding: $500.00                      │
│ Remaining: $750.00 ✓                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Reason for refund *                     │
│ [___________________________] 125/300   │
└─────────────────────────────────────────┘

[     Continue     ]
```

### Step 2: Method Selection
```
┌─────────────────────────────────────────┐
│ ○  Original Payment Method              │
│    Card                                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ○  Different Method                     │
│    Choose alternative                   │
└─────────────────────────────────────────┘

[   Review Refund   ]
```

### Step 3: Confirmation (NEW!)
```
┌─────────────────────────────────────────┐
│      Confirm Refund                     │
│ Please review the details below         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        Refund Amount                    │
│        $500.00                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Invoice:    INV-1001                    │
│ Customer:   John Smith                  │
│ Method:     Original (Card)             │
│ Reason:     Service not completed       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ℹ️ After this refund:                   │
│ • Status → "Partially Refunded"         │
│ • Remaining: $750.00                    │
│ • Processed immediately                 │
└─────────────────────────────────────────┘

[  Process Refund • $500.00  ]
```

### Step 4: Success (ENHANCED!)
```
┌─────────────────────────────────────────┐
│                                         │
│           ✓                             │
│    Refund Processed                     │
│      Successfully!                      │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│     Refund Amount                       │
│     $500.00                             │
│  John Smith • Invoice INV-1001          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Refund ID:    REF-1234567890            │
│ Processed At: 3:45 PM                   │
│ Status:       Partially Refunded        │
│ Remaining:    $750.00 ✓                 │
└─────────────────────────────────────────┘

A confirmation email has been sent

[         Done         ]
```

## 💳 Payment List Cards

### Full Refund
```
┌─────────────────────────────────────────┐
│ John Smith              [Refunded]      │
│ Mar 1, 2026             PMT-003         │
│ $320.00                     View →      │
└─────────────────────────────────────────┘
```

### Partial Refund (NEW!)
```
┌─────────────────────────────────────────┐
│ Sarah Johnson  [Refunded] [Partial]     │
│ Feb 28, 2026            PMT-005         │
│ $180.00                     View →      │
└─────────────────────────────────────────┘
```

### Paid (Normal)
```
┌─────────────────────────────────────────┐
│ Mike Davis              [Paid]          │
│ Mar 2, 2026             PMT-001         │
│ $1,250.00                   View →      │
└─────────────────────────────────────────┘
```

## 📄 Transaction Details Modal

### When Refunded
```
┌─────────────────────────────────────────┐
│ ← Transaction Details                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ $180.00              [Refunded]         │
│ PMT-005                                 │
│ Created Feb 28, 2026 at 2:30 PM        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Transaction Details                     │
│ Merchant ID:    MER-001                 │
│ Transaction ID: PMT-005                 │
│ ...                                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Payment Method                          │
│ ...                                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Customer Details                        │
│ ...                                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ System Info                             │
│ ...                                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🔴 Refund Information (NEW!)            │
│ Original Amount:   $200.00              │
│ Refunded Amount:   $180.00              │
│ Remaining Balance: $20.00               │
│ Reason: Service not delivered           │
└─────────────────────────────────────────┘
```

## 🎨 Color Scheme

### Status Colors
- **Green** (`green-600`): Paid, Received, Success, Remaining Balance
- **Red** (`red-600`): Refunded status, Refund section
- **Orange** (`orange-600`): Partial refunds, CTA buttons, 50% amount
- **Blue** (`blue-600`): Information cards, Refundable balance
- **Gray** (`gray-600`): Custom option, Secondary text

### Badge Styles
```
[  Paid  ]       → bg-green-100 text-green-700
[Received]       → bg-green-100 text-green-700
[Refunded]       → bg-red-100 text-red-700
[Partial]        → bg-orange-100 text-orange-700
```

## 📊 Key Improvements Summary

| Feature | Before | After | Impact |
|---------|--------|-------|--------|
| Amount Selection | Manual input only | 3 quick buttons + custom | ⚡ Faster |
| Refund Preview | None | Live calculation | 👁️ Transparent |
| Confirmation | None | Full review step | ✅ Safer |
| Success Screen | Basic message | Detailed + ID + time | 📋 Complete |
| Partial Refunds | Not visible | Badge on card | 🏷️ Clear |
| Refund Details | Not shown | Dedicated section | ℹ️ Informative |

## 🔄 User Flow Comparison

### Before (2 steps)
```
1. Enter amount + reason → 2. Select method → ✓ Done
```

### After (3 steps)
```
1. Quick select amount + reason → 2. Select method → 3. Review & confirm → ✓ Enhanced success
```

**Result**: +1 step but significantly better UX with safety and transparency

## 📱 Mobile Optimization

- Touch targets: 48px+ (h-12 buttons, p-3 quick buttons)
- Readable text: Minimum 12px (text-xs)
- Clear hierarchy: 4xl → 3xl → 2xl → xl → base → sm → xs
- Safe areas: Proper padding on notched devices
- Scrollable: All content accessible on small screens (320px+)

## ✨ Animation & Feedback

- **Success icon**: `animate-in zoom-in duration-300`
- **Hover states**: Border + background transitions
- **Active states**: `active:bg-gray-50` for tactile feedback
- **Loading**: Spinner + "Processing..." text
- **Toasts**: Success/error messages via Sonner

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Status**: ✅ Implemented & Tested
