import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface EnterCardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  amount: number;
  onPaymentComplete?: () => void;
}

const EnterCardDetailsModal = ({ 
  isOpen, 
  onClose, 
  onBack, 
  amount,
  onPaymentComplete 
}: EnterCardDetailsModalProps) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [validThru, setValidThru] = useState("");
  const [cvv, setCvv] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    // Format with spaces every 4 digits
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(formatted);
  };

  const handleValidThruChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    // Format as MM/YY
    if (value.length >= 2) {
      value = value.slice(0, 2) + " / " + value.slice(2);
    }
    setValidThru(value);
  };

  const handlePayNow = () => {
    if (!authorized) {
      toast.error("Please authorize the payment");
      return;
    }
    if (!cardNumber || !cardName || !validThru || !cvv || !zipCode) {
      toast.error("Please fill in all card details");
      return;
    }
    toast.success("Payment processed successfully");
    handleClose();
    onPaymentComplete?.();
  };

  const handleClose = () => {
    // Reset form when closing
    setCardNumber("");
    setCardName("");
    setValidThru("");
    setCvv("");
    setZipCode("");
    setAuthorized(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden [&>div]:p-0 [&>button]:hidden">
        <DialogTitle className="sr-only">
          Enter Card Details
        </DialogTitle>
        <DialogDescription className="sr-only">
          Enter card details for payment of ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </DialogDescription>
        
        {/* Header */}
        <div className="bg-white px-4 py-2 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-orange-500 p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition-colors touch-target"
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
            <h2 className="text-base font-semibold text-gray-900">Enter Card Details</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-orange-500 p-1.5 -mr-1.5 rounded-full hover:bg-gray-100 transition-colors touch-target"
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
          <div className="text-center py-1 mb-3">
            <p className="text-xs text-gray-500 mb-0.5">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-2 pb-4">
            <div>
              <Label htmlFor="cardNumber" className="block text-xs font-medium text-gray-600 mb-0.5 ml-2">
                Card Number
              </Label>
              <Input
                id="cardNumber"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                className="w-[92%] mx-auto border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <Label htmlFor="cardName" className="block text-xs font-medium text-gray-600 mb-0.5 ml-2">
                Name on Card
              </Label>
              <Input
                id="cardName"
                placeholder="Enter Name on Card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-[92%] mx-auto border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 w-[92%] mx-auto">
              <div>
                <Label htmlFor="validThru" className="block text-xs font-medium text-gray-600 mb-0.5 ml-2">
                  Valid Thru
                </Label>
                <Input
                  id="validThru"
                  placeholder="MM / YY"
                  value={validThru}
                  onChange={handleValidThruChange}
                  maxLength={7}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <Label htmlFor="cvv" className="block text-xs font-medium text-gray-600 mb-0.5 ml-2">
                  CVV
                </Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="***"
                  value={cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 4) setCvv(value);
                  }}
                  maxLength={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
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
              I authorize this payment and confirm the above card details are correct.
            </Label>
          </div>

          {/* Pay Now Button */}
          <div className="w-[92%] mx-auto mt-3 mb-2">
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-colors"
              onClick={handlePayNow}
            >
              Pay Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnterCardDetailsModal;

