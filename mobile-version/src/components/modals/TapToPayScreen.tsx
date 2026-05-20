import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
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
  <div className="flex items-center justify-center gap-2.5">
    <div className="text-[10px] font-bold tracking-wide text-blue-700">VISA</div>
    <div className="flex items-center gap-1">
      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
      <span className="-ml-1 h-2.5 w-2.5 rounded-full bg-orange-500" />
    </div>
    <div className="rounded bg-sky-600 px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-white">
      AMEX
    </div>
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-white safe-area">
      <button
        onClick={handleClose}
        disabled={paymentState === "processing"}
        className="absolute right-6 top-6 z-10 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative flex min-h-screen flex-col items-center bg-white px-6 pt-16 pb-8">
        {paymentState === "authorizing" ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-3 border-orange-200 border-t-orange-500" />
            <p className="text-xs text-gray-500">Authorizing</p>
          </div>
        ) : paymentState === "success" || paymentState === "failed" ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full",
                paymentState === "success" ? "bg-green-100" : "bg-red-100"
              )}
            >
              <div className={cn("h-7 w-7", paymentState === "success" ? "text-green-600" : "text-red-600")}> 
                {paymentState === "success" ? (
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
            <p className="text-base font-semibold text-gray-900">{stateCopy.title}</p>
            <p className="text-xs text-gray-500">{stateCopy.subtitle}</p>
          </div>
        ) : (
          <div className="mt-10 flex w-full flex-1 flex-col items-center text-center">
            <img
              src="/tap-to-pay.png"
              alt="Tap to pay"
              className="h-[88px] w-[88px] object-contain"
            />

            {stateCopy.showAmount && (
              <p className="mt-9 text-[46px] leading-none font-semibold tracking-tight text-gray-800">
                ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}

            <p className="mt-3 text-sm font-medium text-gray-600">Tap card on screen</p>

            {stateCopy.showBrands && (
              <div className="pt-1">
                <CardBrands />
              </div>
            )}
          </div>
        )}
      </div>

      {(paymentState === "success" || paymentState === "failed") && (
        <div className="shrink-0 px-6 pb-6 space-y-2">
          {paymentState === "success" && (
            <button
              onClick={handleDone}
              className="w-full rounded-lg bg-green-600 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 active:bg-green-800"
            >
              Done
            </button>
          )}

          {paymentState === "failed" && cancelledPayment && (
            <button
              onClick={handleAcknowledgeCancelledPayment}
              className="w-full rounded-lg bg-orange-500 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 active:bg-orange-700"
            >
              OK
            </button>
          )}

          {paymentState === "failed" && !cancelledPayment && (
            <>
              <button
                onClick={handleRetry}
                className="w-full rounded-lg bg-orange-500 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 active:bg-orange-700"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="w-full rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TapToPayScreen;
