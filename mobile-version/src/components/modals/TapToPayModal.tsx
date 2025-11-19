import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info } from "lucide-react";

interface TapToPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  amount: number;
  readerName?: string;
  onPaymentComplete?: () => void;
}

const TapToPayModal = ({
  isOpen,
  onClose,
  onBack,
  amount,
  readerName = "PrimeReader 4231",
  onPaymentComplete,
}: TapToPayModalProps) => {
  const [paymentStatus, setPaymentStatus] = useState<"waiting" | "processing" | "approved" | "failed">("waiting");

  // Simulate payment status updates (replace with actual hardware integration)
  useEffect(() => {
    if (isOpen && paymentStatus === "waiting") {
      // In real implementation, this would listen to payment hardware events
      // For now, we'll keep it in waiting state
    }
  }, [isOpen, paymentStatus]);

  const handleCancel = () => {
    setPaymentStatus("waiting");
    onClose();
  };

  const handleBack = () => {
    setPaymentStatus("waiting");
    onBack();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md w-[90%] p-0 gap-0 rounded-[20px] overflow-hidden [&>button]:hidden bg-white shadow-xl max-h-[85vh] flex flex-col">
        <DialogDescription className="sr-only">
          Tap to pay modal for amount ${amount.toFixed(2)}
        </DialogDescription>
        {/* Header - Inside Modal */}
        <div className="bg-orange-500 text-white px-4 py-3 flex items-center rounded-t-[20px] flex-shrink-0">
          <button
            onClick={handleBack}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-orange-600 transition-colors touch-target"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <h2 className="text-base font-semibold text-white px-2 text-center flex-1">
            Collect Payment
          </h2>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Main Content - Scrollable */}
        <div className="overflow-y-auto bg-white px-6 py-4 flex-1 min-h-0">
          {/* Tap/Insert Card Illustration */}
          <div className="flex flex-col items-center justify-center mb-5">
            {/* Tap/Insert Card Icon - Teal outline hand + card + NFC signal */}
            <img
              src="/assets/icons/tap_insert_icon.svg"
              alt="Insert or Tap"
              className="tap-insert-icon"
            />

            {/* Instruction Text */}
            <h3 className="text-lg font-medium text-gray-900 text-center">Insert or Tap Now</h3>
          </div>

          {/* Reader & Amount Details Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 shadow-sm">
            {/* Reader Row */}
            <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Reader</span>
              <span className="text-sm font-semibold text-gray-900">{readerName}</span>
            </div>

            {/* Amount Row */}
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm font-medium text-gray-600">Amount</span>
              <span className="text-lg font-bold text-gray-900">
                ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Warning Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-sm text-blue-800 leading-relaxed flex-1">
              Do not remove card until the payment is confirmed.
            </p>
          </div>

          {/* Status Messages (for future use) */}
          {paymentStatus === "processing" && (
            <div className="text-center py-3">
              <p className="text-base font-medium text-gray-700">Processing...</p>
            </div>
          )}
          {paymentStatus === "approved" && (
            <div className="text-center py-3">
              <p className="text-base font-medium text-green-600">Payment Approved</p>
            </div>
          )}
          {paymentStatus === "failed" && (
            <div className="text-center py-3">
              <p className="text-base font-medium text-red-600">Payment Failed</p>
            </div>
          )}
        </div>

        {/* Cancel Button */}
        <div className="px-6 pb-5 pt-3 bg-white border-t border-gray-100 rounded-b-[20px] flex-shrink-0">
          <Button
            variant="outline"
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border-gray-300 h-11 rounded-full font-medium text-base transition-colors"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TapToPayModal;

