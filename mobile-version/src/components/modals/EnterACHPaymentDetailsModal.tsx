import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { showErrorToast } from "@/utils/toast";
import ACHSuccessModal from "./ACHSuccessModal";

interface EnterACHPaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  amount: number;
  onPaymentComplete?: () => void;
}

const EnterACHPaymentDetailsModal = ({ 
  isOpen, 
  onClose, 
  onBack, 
  amount,
  onPaymentComplete 
}: EnterACHPaymentDetailsModalProps) => {
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [nameOnCheck, setNameOnCheck] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handlePayNow = async () => {
    // Validation
    if (!authorized) {
      showErrorToast("Please authorize the payment");
      return;
    }
    if (!routingNumber || !accountNumber || !nameOnCheck || !zipCode) {
      showErrorToast("Please fill in all account details");
      return;
    }

    // Set processing state
    setIsProcessing(true);

    try {
      // TODO: Replace with actual API call
      // Example: const response = await fetch('/api/payments/ach', { method: 'POST', body: ... });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate API response (replace with actual API response check)
      const paymentSuccess = true; // Replace with actual API response check
      const errorMessage = paymentSuccess ? null : "Payment failed. Please try again."; // Get from API response

      if (paymentSuccess) {
        // Don't close the ACH modal - replace it with success modal
        setIsProcessing(false);
        setShowSuccessModal(true);
      } else {
        // Handle payment failure - show error, keep ACH modal open
        showErrorToast(errorMessage || "Payment failed. Please try again.");
        setIsProcessing(false);
      }
    } catch (error: any) {
      // Handle error - show error message, keep ACH modal open
      const errorMessage = error?.message || "Payment failed. Please try again.";
      showErrorToast(errorMessage);
      setIsProcessing(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Close the ACH payment modal
    onClose();
    // Reset form state
    setRoutingNumber("");
    setAccountNumber("");
    setNameOnCheck("");
    setZipCode("");
    setAuthorized(false);
    setIsProcessing(false);
    // Call payment complete callback to refresh invoice list/update status
    // This will refresh transaction status and update invoice to "Processing"
    onPaymentComplete?.();
  };

  const handleClose = () => {
    // Reset form when closing
    setRoutingNumber("");
    setAccountNumber("");
    setNameOnCheck("");
    setZipCode("");
    setAuthorized(false);
    setIsProcessing(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !showSuccessModal} onOpenChange={(open) => {
        if (!open && !isProcessing) {
          handleClose();
        }
      }}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden [&>div]:p-0 [&>button]:hidden">
          <DialogTitle className="sr-only">
            Enter ACH Payment Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Enter ACH payment details for payment of ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </DialogDescription>
          
          {/* Header */}
          <div className="bg-white px-4 py-2 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <button
                onClick={onBack}
                disabled={isProcessing}
                className="text-gray-500 hover:text-orange-500 p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition-colors touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Back to Payment Options"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-base font-semibold text-gray-800">Enter ACH Payment Details</h2>
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="text-gray-500 hover:text-orange-500 p-1.5 -mr-1.5 rounded-full hover:bg-gray-100 transition-colors touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-4 pt-3 pb-6 overflow-y-auto safe-bottom">
            {/* Amount Display */}
            <div className="text-center mb-3">
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="text-xl font-semibold text-gray-900">
                ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-2 pb-4">
              <div>
                <Label htmlFor="routingNumber" className="block text-xs font-medium text-gray-600 mb-0.5 ml-2">
                  Routing Number
                </Label>
                <Input
                  id="routingNumber"
                  placeholder="Enter Routing Number"
                  value={routingNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 9) setRoutingNumber(value);
                  }}
                  maxLength={9}
                  className="w-[92%] mx-auto border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <Label htmlFor="accountNumber" className="block text-xs font-medium text-gray-600 mb-0.5 ml-2">
                  Account Number
                </Label>
                <Input
                  id="accountNumber"
                  placeholder="Enter Account Number"
                  value={accountNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setAccountNumber(value);
                  }}
                  className="w-[92%] mx-auto border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <Label htmlFor="nameOnCheck" className="block text-xs font-medium text-gray-600 mb-0.5 ml-2">
                  Name on Check
                </Label>
                <Input
                  id="nameOnCheck"
                  placeholder="Enter Name on Check"
                  value={nameOnCheck}
                  onChange={(e) => setNameOnCheck(e.target.value)}
                  className="w-[92%] mx-auto border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <Label htmlFor="zipCode" className="block text-xs font-medium text-gray-600 mb-0.5 ml-2">
                  Zip Code
                </Label>
                <Input
                  id="zipCode"
                  placeholder="Zip Code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-[92%] mx-auto border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Authorization Checkbox */}
            <div className="flex items-start space-x-2 w-[92%] mx-auto mt-3 mb-2">
              <Checkbox
                id="authorize"
                checked={authorized}
                onCheckedChange={(checked) => setAuthorized(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="authorize" className="text-xs leading-snug cursor-pointer font-normal text-gray-600">
                I authorize this payment and confirm the above account details are correct.
              </Label>
            </div>

            {/* Pay Now Button */}
            <div className="w-[92%] mx-auto mt-3 mb-2">
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePayNow}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Pay Now"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ACH Success Modal - Rendered outside payment modal */}
      <ACHSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
      />
    </>
  );
};

export default EnterACHPaymentDetailsModal;

