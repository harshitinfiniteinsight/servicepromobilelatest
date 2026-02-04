# ACH Two-Flow Visual Guide

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Payment Modal Opens                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         Check ACH Configuration Status                      │
│  (using useACHConfiguration hook)                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
          ┌──────────────────┐  ┌──────────────────┐
          │  ACH Configured  │  │ ACH Not Config   │
          │    (true)        │  │    (false)       │
          └────────┬─────────┘  └────────┬─────────┘
                   ↓                     ↓
         ┌──────────────────┐  ┌──────────────────┐
         │   FLOW A         │  │   FLOW B         │
         └────────┬─────────┘  └────────┬─────────┘
                  ↓                     ↓
         ┌──────────────────┐  ┌──────────────────┐
         │ Card: Normal UI  │  │ Card: Disabled   │
         │ - Full opacity   │  │ - 70% opacity    │
         │ - Hover effect   │  │ - No hover       │
         │ - Clickable      │  │ - Shows helper   │
         └────────┬─────────┘  └────────┬─────────┘
                  ↓                     ↓
         ┌──────────────────┐  ┌──────────────────┐
         │ User clicks card │  │ User sees text:  │
         └────────┬─────────┘  │ "Setup ACH first"│
                  ↓             └────────┬─────────┘
         ┌──────────────────┐           ↓
         │ Open ACH payment │  ┌──────────────────┐
         │ entry form       │  │ User clicks card │
         └────────┬─────────┘  │ or helper text   │
                  ↓             └────────┬─────────┘
         ┌──────────────────┐           ↓
         │ User enters      │  ┌──────────────────┐
         │ bank details     │  │ Navigate to      │
         │ and submits      │  │ /settings/       │
         └────────┬─────────┘  │ ach-setup        │
                  ↓             └────────┬─────────┘
         ┌──────────────────┐           ↓
         │ Payment process  │  ┌──────────────────┐
         │ completes        │  │ ACH setup form   │
         └──────────────────┘  │ - Routing number │
                               │ - Account number │
                               │ - Name on check  │
                               │ - Zip code       │
                               │ - Authorization  │
                               └────────┬─────────┘
                                        ↓
                               ┌──────────────────┐
                               │ User completes   │
                               │ ACH setup        │
                               └────────┬─────────┘
                                        ↓
                               ┌──────────────────┐
                               │ Call:            │
                               │ setACHConfigured │
                               │ (true)           │
                               └────────┬─────────┘
                                        ↓
                               ┌──────────────────┐
                               │ Redirect to      │
                               │ payment modal    │
                               │ (Flow A now)     │
                               └──────────────────┘
```

## UI Component Hierarchy

```
PaymentModal
│
├── useACHConfiguration Hook
│   ├── State: achConfigured (boolean)
│   ├── State: isLoading (boolean)
│   └── Methods:
│       ├── achConfigured getter
│       └── setACHConfigured() setter
│
├── Payment Options Grid
│   ├── Tap to Pay Button
│   ├── Enter Card Button
│   ├── ACH Payment Button
│   │   ├── Icon (Building2)
│   │   ├── Label "ACH Payment"
│   │   ├── Conditional disabled state
│   │   └── Conditional helper text
│   │       └── "Setup ACH first" (hyperlinked)
│   └── Pay by Cash Button
│
└── Sub-Modals
    ├── EnterACHPaymentDetailsModal
    ├── EnterCardDetailsModal
    ├── CashPaymentModal
    └── TapToPayModal
```

## State Flow Diagram

```
Component Mount
    ↓
[useACHConfiguration]
    ├── Check localStorage.getItem("achConfigured")
    ├── Set state: achConfigured
    └── Set state: isLoading = false
    ↓
[PaymentModal Renders]
    ├── achConfigured = true?
    │   └── No helper text, card clickable
    └── achConfigured = false?
        └── Show helper text, card disabled
    ↓
[User Interaction]
    ├── Click ACH card (if configured)
    │   └── setShowACHPaymentDetailsModal(true)
    │       ↓
    │       [EnterACHPaymentDetailsModal opens]
    │       ↓
    │       [User submits payment]
    │       ↓
    │       onPaymentComplete()
    │       ↓
    │       onClose() - modal closes
    │
    └── Click ACH card (if not configured)
        └── navigate("/settings/ach-setup")
            ↓
            [ACHSetup page opens]
            ↓
            [User fills form]
            ↓
            [User submits]
            ↓
            setACHConfigured(true)
            ↓
            navigate(-1)
            ↓
            [Back to PaymentModal]
            ↓
            achConfigured = true
            ↓
            ACH card now clickable
```

## Component Props Flow

```
PaymentModal
├── isOpen: boolean
├── onClose: () => void
├── amount: number
├── onPaymentMethodSelect?: (method: string) => void
├── entityType?: "agreement" | "estimate" | "invoice"
└── agreement?: {...}

↓↓↓ Uses Hook ↓↓↓

useACHConfiguration
├── Returns: { achConfigured: boolean, isLoading: boolean }
└── Methods: setACHConfigured(boolean)

↓↓↓ Conditionally Renders ↓↓↓

EnterACHPaymentDetailsModal
├── isOpen: boolean
├── onClose: () => void
├── onBack: () => void
├── amount: number
└── onPaymentComplete: () => void
```

## User Experience Flow - Non-Technical

### Scenario A: User Has ACH Setup

```
┌──────────────────────────────────────────┐
│  Payment Options                         │
│                                          │
│  [Tap to Pay] [Enter Card]              │
│                                          │
│  [ACH Payment*]  [Pay by Cash]          │
│                                          │
│  * Card shows normal styling             │
│    No helper text below                  │
└──────────────────────────────────────────┘
           User clicks ACH ↓
┌──────────────────────────────────────────┐
│  Enter ACH Payment Details               │
│                                          │
│  Routing Number: [______________________]│
│  Account Number: [______________________]│
│  Name on Check:  [______________________]│
│  Zip Code:       [______________________]│
│                                          │
│  ☑ I authorize this payment             │
│                                          │
│           [   Pay Now  ]                 │
└──────────────────────────────────────────┘
           User submits ↓
┌──────────────────────────────────────────┐
│  ✅ Payment Successful!                  │
│                                          │
│  Your ACH payment has been processed.    │
└──────────────────────────────────────────┘
```

### Scenario B: User Doesn't Have ACH Setup

```
┌──────────────────────────────────────────┐
│  Payment Options                         │
│                                          │
│  [Tap to Pay] [Enter Card]              │
│                                          │
│  [ACH Payment*]  [Pay by Cash]          │
│   Setup ACH first (orange, underline)   │
│                                          │
│  * Card appears slightly faded (70%)     │
│    Not fully clickable                   │
└──────────────────────────────────────────┘
    User clicks card or helper text ↓
┌──────────────────────────────────────────┐
│  Bank Account Setup                      │
│                                          │
│  Routing Number:  [______________________]│
│  Account Number:  [______________________]│
│  Name on Check:   [______________________]│
│  Zip Code:        [______________________]│
│                                          │
│  ☑ I authorize ACH setup                │
│                                          │
│  [   Setup ACH   ] [   Cancel   ]       │
└──────────────────────────────────────────┘
         User completes setup ↓
✅ ACH Setup Complete!
         Redirects back to ↓
┌──────────────────────────────────────────┐
│  Payment Options                         │
│                                          │
│  [Tap to Pay] [Enter Card]              │
│                                          │
│  [ACH Payment*]  [Pay by Cash]          │
│                                          │
│  * Card now shows normal styling         │
│    (achConfigured = true)                │
│    Helper text disappeared               │
└──────────────────────────────────────────┘
     Now can use ACH like Scenario A ↓
```

## Code Implementation Map

### Entry Point: PaymentModal
```typescript
// File: mobile-version/src/components/modals/PaymentModal.tsx

// 1. Import hook
import { useACHConfiguration } from "@/hooks/useACHConfiguration";

// 2. Use hook
const { achConfigured } = useACHConfiguration();

// 3. Check in handler
if (methodId === "ach") {
  if (achConfigured) {
    setShowACHPaymentDetailsModal(true);  // Flow A
  } else {
    navigate("/settings/ach-setup");       // Flow B
  }
}

// 4. Render conditionally
const isACHAndNotConfigured = option.id === "ach" && !achConfigured;

<button disabled={isACHAndNotConfigured}>ACH Payment</button>

{isACHAndNotConfigured && (
  <button onClick={() => navigate("/settings/ach-setup")}>
    Setup ACH first
  </button>
)}
```

### Hook Implementation: useACHConfiguration
```typescript
// File: mobile-version/src/hooks/useACHConfiguration.ts

export const useACHConfiguration = () => {
  const [achConfigured, setAchConfigured] = useState(false);
  
  useEffect(() => {
    // Check localStorage on mount
    const status = localStorage.getItem("achConfigured");
    setAchConfigured(status === "true");
  }, []);

  const updateACHConfigured = (configured: boolean) => {
    localStorage.setItem("achConfigured", String(configured));
    setAchConfigured(configured);
  };

  return {
    achConfigured,
    setACHConfigured: updateACHConfigured,
  };
};
```

### Setup Page: ACHSetup (Template)
```typescript
// File: mobile-version/src/pages/ACHSetup.tsx

import { useACHConfiguration } from "@/hooks/useACHConfiguration";

const ACHSetup = () => {
  const { setACHConfigured } = useACHConfiguration();

  const handleSubmit = async () => {
    // Submit to API
    // On success:
    setACHConfigured(true);
    navigate(-1); // Go back to payment modal
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Setup ACH</button>
    </form>
  );
};
```

## File Structure

```
mobile-version/
├── src/
│   ├── hooks/
│   │   └── useACHConfiguration.ts ✨ NEW
│   ├── components/
│   │   └── modals/
│   │       └── PaymentModal.tsx 🔄 UPDATED
│   └── pages/
│       └── ACHSetup.tsx ⏳ TO BE CREATED
│
tablet-version/
├── src/
│   ├── hooks/
│   │   └── useACHConfiguration.ts ✨ NEW
│   ├── components/
│   │   └── modals/
│   │       └── PaymentModal.tsx 🔄 UPDATED
│   └── pages/
│       └── ACHSetup.tsx ⏳ TO BE CREATED
│
Documentation/
├── ACH_IMPLEMENTATION_SUMMARY.md ✨ NEW
├── ACH_TWO_FLOW_IMPLEMENTATION.md ✨ NEW
├── ACH_QUICK_REFERENCE.md ✨ NEW
├── ACH_SETUP_PAGE_TEMPLATE.md ✨ NEW
├── ACH_IMPLEMENTATION_CHECKLIST.md ✨ NEW
└── ACH_VISUAL_GUIDE.md ✨ NEW (this file)
```

## Testing Checklist with Visual Confirmation

```
TEST: Flow A - ACH Configured

Step 1: Enable ACH
  localStorage.setItem("achConfigured", "true");
  Expected: ✓ Executes without error

Step 2: Open Payment Modal
  Expected: ✓ Modal appears

Step 3: Check ACH Card Appearance
  Expected: ✓ Card is full opacity (not 70%)
  Expected: ✓ No "Setup ACH first" text below card
  Expected: ✓ Card has hover effect (border-orange-500)

Step 4: Click ACH Card
  Expected: ✓ EnterACHPaymentDetailsModal opens
  Expected: ✓ Payment modal closes (overlays)

Step 5: Fill and Submit Payment
  Expected: ✓ Payment processes
  Expected: ✓ Modal closes
  Expected: ✓ Success indicator shown


TEST: Flow B - ACH Not Configured

Step 1: Disable ACH
  localStorage.removeItem("achConfigured");
  Expected: ✓ Executes without error

Step 2: Open Payment Modal
  Expected: ✓ Modal appears

Step 3: Check ACH Card Appearance
  Expected: ✓ Card is 70% opacity (appears faded)
  Expected: ✓ "Setup ACH first" text appears below card
  Expected: ✓ Text is orange (#f97316) and underlined
  Expected: ✓ Card does not have hover effect

Step 4: Click ACH Card
  Expected: ✓ Modal closes
  Expected: ✓ Navigate to /settings/ach-setup
  Expected: ✓ ACH Setup page loads

Step 5: Complete Setup Form
  Expected: ✓ All fields fillable
  Expected: ✓ Authorization checkbox required
  Expected: ✓ Submit button functional

Step 6: Submit Setup
  Expected: ✓ Validation passes
  Expected: ✓ Success message shown
  Expected: ✓ Redirect back to Payment Modal

Step 7: Check ACH Card Again
  Expected: ✓ Card now full opacity
  Expected: ✓ Helper text gone
  Expected: ✓ Card has hover effect

Step 8: Click ACH Card
  Expected: ✓ EnterACHPaymentDetailsModal opens (Flow A)
```

## Summary

This ACH two-flow implementation provides:

✅ **Clear visual differentiation** - Users instantly know if ACH is available
✅ **Intuitive navigation** - "Setup ACH first" is self-explanatory  
✅ **Smooth user experience** - No modal stacking or confusion
✅ **Accessible design** - Works for all user types
✅ **Mobile optimized** - Proper touch targets and spacing
✅ **Well documented** - Multiple guides and templates provided

---

**Created**: February 4, 2026
**Status**: ✅ Implementation Complete
**Next Step**: Create `/settings/ach-setup` page using template
