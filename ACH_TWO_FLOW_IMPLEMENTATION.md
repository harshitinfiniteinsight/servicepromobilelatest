# ACH Payment Two-Flow Implementation

## Overview

Implemented a dual-flow ACH payment system in Service Pro Mobile that differentiates between:
- **Flow A**: ACH already configured → Click opens payment entry flow
- **Flow B**: ACH NOT configured → Click shows "Setup ACH first" helper text, navigates to setup

## Implementation Details

### 1. ACH Configuration Hook (`useACHConfiguration.ts`)

**Location**: 
- Mobile: `mobile-version/src/hooks/useACHConfiguration.ts`
- Tablet: `tablet-version/src/hooks/useACHConfiguration.ts`

**Features**:
- Checks localStorage for ACH setup status (`achConfigured` key)
- Returns `achConfigured` boolean state
- Provides `setACHConfigured()` method to update status
- Defaults to `false` (ACH not configured) if no stored value

```typescript
const { achConfigured, isLoading, setACHConfigured } = useACHConfiguration();
```

### 2. Updated Payment Modal Components

#### Mobile Version
- **File**: `mobile-version/src/components/modals/PaymentModal.tsx`
- Added imports for Lock icon and useACHConfiguration hook
- Integrated ACH configuration check into payment flow

#### Tablet Version
- **File**: `tablet-version/src/components/modals/PaymentModal.tsx`
- Same implementation as mobile for consistency

### 3. Payment Flow Logic

#### Flow A: ACH Configured
```typescript
if (achConfigured) {
  // Opens EnterACHPaymentDetailsModal directly
  setShowACHPaymentDetailsModal(true);
}
```

#### Flow B: ACH NOT Configured
```typescript
if (!achConfigured) {
  // Closes payment modal and navigates to setup
  onClose();
  navigate("/settings/ach-setup");
}
```

### 4. User Interface Changes

**ACH Payment Card Behavior**:
- Always visible in payment options grid
- **When configured**: Normal hover states, clickable
- **When NOT configured**: 
  - Reduced opacity (70%)
  - Cursor shows "not-allowed"
  - Helper text "Setup ACH first" appears below card
  - Text is hyperlinked to trigger ACH setup flow

**Helper Text Styling**:
- Small font size (text-xs)
- Orange color with hover state (text-orange-500 → text-orange-600)
- Underlined to indicate interactivity
- Positioned directly below the ACH Payment card

### 5. Storage Keys

**localStorage**:
- `achConfigured`: String ("true" or "false") - Indicates if ACH is set up

### 6. Navigation Routes

When ACH is not configured, the system navigates to:
```
/settings/ach-setup
```

This route should be implemented to:
1. Display ACH setup form/wizard
2. Collect bank account details
3. Upon completion, call `setACHConfigured(true)` to persist status

## Usage Example

```typescript
import { useACHConfiguration } from "@/hooks/useACHConfiguration";

const PaymentModal = () => {
  const { achConfigured } = useACHConfiguration();
  
  const handleACHClick = () => {
    if (achConfigured) {
      // Show payment entry modal
      setShowACHPaymentDetailsModal(true);
    } else {
      // Navigate to setup
      navigate("/settings/ach-setup");
    }
  };
  
  return (
    <div>
      {!achConfigured && <p>Setup ACH first</p>}
    </div>
  );
};
```

## Testing the Implementation

### Test Flow A (ACH Configured)
1. Open browser DevTools → Console
2. Run: `localStorage.setItem("achConfigured", "true")`
3. Navigate to payment modal
4. Click ACH Payment card
5. **Expected**: EnterACHPaymentDetailsModal opens

### Test Flow B (ACH NOT Configured)
1. Open browser DevTools → Console
2. Run: `localStorage.removeItem("achConfigured")` or `localStorage.setItem("achConfigured", "false")`
3. Navigate to payment modal
4. ACH Payment card shows reduced opacity
5. "Setup ACH first" text appears and is clickable
6. Click the text or card
7. **Expected**: Navigate to `/settings/ach-setup`

## Future Integration Points

### Backend Integration
Update `useACHConfiguration.ts` to fetch from API:
```typescript
const response = await fetch('/api/account/ach-status');
const { achConfigured } = await response.json();
setAchConfigured(achConfigured);
```

### ACH Setup Flow
Create `/settings/ach-setup` page that:
1. Displays ACH form (routing number, account number, etc.)
2. Validates inputs
3. Submits to backend
4. Calls `setACHConfigured(true)` on success
5. Redirects back to payment modal

## Mobile-Friendly Considerations

✅ All elements meet minimum touch target size (44px)
✅ Helper text is clearly visible on small screens
✅ Disabled state provides clear visual feedback
✅ Hyperlinked text has sufficient color contrast
✅ Responsive spacing maintained across breakpoints

## Backward Compatibility

- No breaking changes to existing payment flow
- Other payment methods (card, cash, tap-to-pay) unaffected
- Default behavior (ACH not configured) doesn't disrupt user flow
- Graceful degradation if localStorage unavailable

## Files Modified

1. `mobile-version/src/hooks/useACHConfiguration.ts` - **Created**
2. `mobile-version/src/components/modals/PaymentModal.tsx` - **Updated**
3. `tablet-version/src/hooks/useACHConfiguration.ts` - **Created**
4. `tablet-version/src/components/modals/PaymentModal.tsx` - **Updated**

## Next Steps

1. ✅ Hook created for ACH configuration state
2. ✅ Payment modals updated with dual-flow logic
3. ⏳ Implement `/settings/ach-setup` page
4. ⏳ Connect to backend ACH configuration API
5. ⏳ Test both flows end-to-end
