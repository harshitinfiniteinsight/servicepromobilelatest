# ACH Setup Page - Implementation Template

This template shows how to create the `/settings/ach-setup` page that users are directed to when ACH is not configured.

## Basic Implementation

```typescript
// mobile-version/src/pages/ACHSetup.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useACHConfiguration } from "@/hooks/useACHConfiguration";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

const ACHSetup = () => {
  const navigate = useNavigate();
  const { setACHConfigured } = useACHConfiguration();
  
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [nameOnCheck, setNameOnCheck] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSetupACH = async () => {
    // Validate inputs
    if (!routingNumber || !accountNumber || !nameOnCheck || !zipCode) {
      showErrorToast("Please fill in all required fields");
      return;
    }

    if (!authorized) {
      showErrorToast("Please authorize the ACH setup");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      // Example: 
      // const response = await fetch('/api/account/ach-setup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     routingNumber,
      //     accountNumber,
      //     nameOnCheck,
      //     zipCode
      //   })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For now, assume success
      const setupSuccess = true;

      if (setupSuccess) {
        // Update ACH configuration status
        setACHConfigured(true);
        
        // Store bank details (optional - can be on backend)
        localStorage.setItem("achBankInfo", JSON.stringify({
          routingNumber: routingNumber.slice(-4), // Only store last 4 digits
          accountNumber: accountNumber.slice(-4),
          nameOnCheck
        }));

        showSuccessToast("ACH setup completed successfully!");
        
        // Redirect back to previous page or dashboard
        setTimeout(() => {
          navigate(-1); // Go back to payment modal
        }, 1500);
      } else {
        showErrorToast("Failed to setup ACH. Please try again.");
      }
    } catch (error: any) {
      showErrorToast(error?.message || "Error setting up ACH");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="bg-orange-500 px-4 py-4 flex items-center justify-between safe-top">
        <button
          onClick={handleCancel}
          className="p-1.5 -ml-1.5 rounded-full hover:bg-orange-600 transition-colors touch-target"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white flex-1 text-center">Setup ACH</h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 safe-bottom">
        {/* Introduction */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-gray-900">Bank Account Setup</h2>
          <p className="text-sm text-gray-600">
            Add your bank account details to enable ACH payments
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Routing Number */}
          <div>
            <Label htmlFor="routingNumber" className="text-sm font-medium text-gray-700 mb-1 block">
              Routing Number *
            </Label>
            <Input
              id="routingNumber"
              type="text"
              placeholder="000000000"
              value={routingNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 9) setRoutingNumber(value);
              }}
              maxLength={9}
              className="w-full text-center"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">9 digits (find on check or contact your bank)</p>
          </div>

          {/* Account Number */}
          <div>
            <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700 mb-1 block">
              Account Number *
            </Label>
            <Input
              id="accountNumber"
              type="password"
              placeholder="••••••••••••••••"
              value={accountNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setAccountNumber(value);
              }}
              className="w-full text-center"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">Your bank account number (hidden for security)</p>
          </div>

          {/* Name on Check */}
          <div>
            <Label htmlFor="nameOnCheck" className="text-sm font-medium text-gray-700 mb-1 block">
              Name on Check *
            </Label>
            <Input
              id="nameOnCheck"
              type="text"
              placeholder="Full Name"
              value={nameOnCheck}
              onChange={(e) => setNameOnCheck(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">Your name as it appears on checks</p>
          </div>

          {/* Zip Code */}
          <div>
            <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700 mb-1 block">
              Zip Code *
            </Label>
            <Input
              id="zipCode"
              type="text"
              placeholder="12345"
              value={zipCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 5) setZipCode(value);
              }}
              maxLength={5}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">5-digit zip code</p>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-900 leading-relaxed">
              🔒 <strong>Your information is secure</strong>. We use industry-standard encryption to protect your bank details.
            </p>
          </div>
        </div>

        {/* Authorization */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="authorize"
              checked={authorized}
              onCheckedChange={(checked) => setAuthorized(checked as boolean)}
              disabled={isSubmitting}
              className="mt-1"
            />
            <Label 
              htmlFor="authorize" 
              className="text-xs text-gray-600 leading-snug cursor-pointer font-normal"
            >
              I authorize Service Pro911 to process ACH transactions on this account and confirm that the above account details are correct.
            </Label>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-900">About ACH Payments:</p>
          <ul className="text-xs text-gray-600 space-y-1 pl-3 list-disc">
            <li>$1.00 fee per transaction</li>
            <li>Payments between $1-$1,000</li>
            <li>Funds transfer in 1-2 business days</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border-t border-gray-200 p-4 space-y-3 safe-bottom">
        <Button
          onClick={handleSetupACH}
          disabled={isSubmitting || !authorized}
          className="w-full h-11 text-sm font-semibold rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Setting up..." : "Setup ACH"}
        </Button>
        <Button
          onClick={handleCancel}
          disabled={isSubmitting}
          variant="outline"
          className="w-full h-11 text-sm font-semibold rounded-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ACHSetup;
```

## Router Configuration

Add this route to your app router:

```typescript
// In your main router configuration
import ACHSetup from "@/pages/ACHSetup";

const routes = [
  // ... other routes
  {
    path: "/settings/ach-setup",
    element: <ACHSetup />
  }
];
```

## Integration with Payment Modal

When user completes ACH setup:
1. `setACHConfigured(true)` is called
2. User is redirected back to payment modal
3. On next payment, ACH card is now clickable
4. Payment flow proceeds normally

## Backend Integration Steps

1. **Create API endpoint**: `/api/account/ach-setup` (POST)
   - Accept: routing number, account number, name, zip code
   - Validate inputs and routing number
   - Encrypt and store bank details securely
   - Return: `{ success: true }`

2. **Update hook in component**:
   ```typescript
   const response = await fetch('/api/account/ach-setup', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       routingNumber,
       accountNumber,
       nameOnCheck,
       zipCode
     })
   });
   const result = await response.json();
   ```

3. **Error handling**:
   - Validate routing number format (9 digits)
   - Check account number length (usually 8-17 digits)
   - Provide specific error messages for failed validation
   - Don't expose sensitive details in error messages

## Security Considerations

✅ Use password input type for account number
✅ Only store last 4 digits in localStorage  
✅ Never log full bank details
✅ Always use HTTPS for API calls
✅ Encrypt sensitive data in transit and at rest
✅ Implement rate limiting on API endpoint
✅ Validate all inputs server-side
✅ Use secure payment processor (Stripe, ACH specialists)

## Testing

```javascript
// Test in console
localStorage.setItem("achConfigured", "false");
navigate("/settings/ach-setup");

// After filling form, on submit:
localStorage.getItem("achBankInfo") // Should return your saved info
localStorage.getItem("achConfigured") // Should be "true"
```

## Tablet Version

Create an identical component at:
- `tablet-version/src/pages/ACHSetup.tsx`

Use same imports but with `TabletHeader` instead of `MobileHeader` for consistency.

## Next Steps

1. Create this ACH setup page
2. Add route to your router
3. Test the complete flow:
   - Payment modal → ACH not configured
   - Click "Setup ACH first"
   - Complete setup form
   - Redirect back to payment modal
   - ACH card now clickable
   - Open payment flow
