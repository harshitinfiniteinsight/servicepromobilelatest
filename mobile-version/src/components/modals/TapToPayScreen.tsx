import { useEffect, useMemo, useState } from "react";
import { X, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface TapToPayScreenProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentComplete?: () => void;
}

type PaymentState = "authorizing" | "waiting_for_card" | "processing" | "success" | "failed";

// Simple brand logos
const CardBrands = () => (
  <div className="flex items-center justify-center gap-3">
    <span className="text-[10px] font-semibold text-gray-400">VISA</span>
    <span className="h-2 w-2 rounded-full bg-red-500" />
    <span className="h-2 w-2 rounded-full bg-orange-500" />
    <span className="text-[10px] font-semibold text-gray-400">AMEX</span>
  </div>
);

const TapToPayScreen = ({
  isOpen,
  onClose,
  amount,
  onPaymentComplete,
}: TapToPayScreenProps) => {
  const [paymentState, setPaymentState] = useState<PaymentState>("authorizing");
  const [cancelledPayment, setCancelledPayment] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPaymentState("authorizing");
      setCancelledPayment(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (paymentState === "authorizing") {
      const timer = window.setTimeout(() => {
        setPaymentState("waiting_for_card");
      }, 1800);

      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [isOpen, paymentState]);

  const handleClose = () => {
    if (paymentState !== "processing") {
      onClose();
    }
  };

  const handleDone = () => {
    onClose();
    if (onPaymentComplete) {
      onPaymentComplete();
    }
  };

  const handleAcknowledgeCancelledPayment = () => {
    setCancelledPayment(false);
    onClose();
  };

  const handleRetry = () => {
    setCancelledPayment(false);
    setPaymentState("authorizing");
  };

  const handleCancelPayment = () => {
    if (paymentState === "processing") return;
    setCancelledPayment(true);
    setPaymentState("failed");
  };

  const stateCopy = useMemo(() => {
    switch (paymentState) {
      case "waiting_for_card":
        return {
          instruction: "Tap card behind device",
          showAmount: true,
          showBrands: true,
        };
      case "processing":
        return {
          instruction: "Processing payment...",
          showAmount: true,
          showBrands: false,
        };
      case "success":
        return {
          title: "Payment Successful",
          subtitle: `$${amount.toFixed(2)} has been charged`,
          showAmount: false,
          showBrands: false,
        };
      case "failed":
        return {
          title: cancelledPayment ? "Transaction Cancelled" : "Payment Failed",
          subtitle: cancelledPayment ? "Please try again or use another card" : "Try again or use a different payment method",
          showAmount: false,
          showBrands: false,
        };
      default:
        return {
          instruction: "",
          showAmount: false,
          showBrands: false,
        };
    }
  }, [amount, cancelledPayment, paymentState]);

  if (!isOpen) return null;

  const isWaitingState = paymentState === "waiting_for_card" || paymentState === "processing" || paymentState === "authorizing";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-auto safe-area">
      <div className="w-[90%] max-w-[420px] min-h-[520px] rounded-[28px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        {!cancelledPayment && (
          <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-white rounded-t-[28px]">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 flex-shrink-0" />
              <h2 className="text-sm font-semibold leading-none">Pay Now</h2>
            </div>

            <button
              onClick={handleClose}
              disabled={paymentState === "processing"}
              className="touch-target rounded-full p-1 transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {paymentState === "authorizing" ? (
            // Authorizing state - Minimal spinner
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-3 border-orange-200 border-t-orange-500" />
              <p className="text-xs text-gray-500">Authorizing</p>
            </div>
          ) : paymentState === "success" || paymentState === "failed" ? (
            // Success/Failed state
            <div className="flex flex-col items-center gap-3 text-center">
              <div className={cn(
                "h-14 w-14 rounded-full flex items-center justify-center",
                paymentState === "success" ? "bg-green-100" : "bg-red-100"
              )}>
                <div className={cn(
                  "h-7 w-7",
                  paymentState === "success" ? "text-green-600" : "text-red-600"
                )}>
                  {paymentState === "success" ? (
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-base font-semibold text-gray-900">{stateCopy.title}</p>
              <p className="text-xs text-gray-500">{stateCopy.subtitle}</p>
            </div>
          ) : (
            // Waiting for card state - Minimal design
            <div className="flex flex-col items-center gap-5 w-full">
              {/* NFC Icon */}
              <div className="flex justify-center">
                <svg className="h-16 w-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M17.657 17.657a8 8 0 01-11.314 0m11.314-11.314a8 8 0 00-11.314 0M9.172 9.172a4 4 0 015.656 0" />
                </svg>
              </div>

              {/* Amount */}
              {stateCopy.showAmount && (
                <p className="text-4xl font-bold text-gray-900">
                  ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}

              {/* Instruction */}
              <p className="text-sm text-gray-600 font-medium">
                {stateCopy.instruction}
              </p>

              {/* Accepted Cards */}
              {stateCopy.showBrands && (
                <div className="pt-2">
                  <CardBrands />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {isWaitingState && (
          <div className="shrink-0 px-6 pb-6">
            <button
              onClick={handleCancelPayment}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        )}

        {(paymentState === "success" || paymentState === "failed") && (
          <div className="shrink-0 px-6 pb-6 space-y-2">
            {paymentState === "success" && (
              <button
                onClick={handleDone}
                className="w-full py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-medium text-sm rounded-lg transition-colors"
              >
                Done
              </button>
            )}

            {paymentState === "failed" && cancelledPayment && (
              <button
                onClick={handleAcknowledgeCancelledPayment}
                className="w-full py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-medium text-sm rounded-lg transition-colors"
              >
                OK
              </button>
            )}

            {paymentState === "failed" && !cancelledPayment && (
              <>
                <button
                  onClick={handleRetry}
                  className="w-full py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-medium text-sm rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-2 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TapToPayScreen;
