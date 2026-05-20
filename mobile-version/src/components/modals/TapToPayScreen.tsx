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

const SupportedBrand = ({ label, className }: { label: string; className: string }) => (
  <div className={cn("flex items-center justify-center rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wide", className)}>
    {label}
  </div>
);

const AuthorizingView = () => (
  <div className="flex h-full flex-col items-center justify-center px-6 py-8 text-center">
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 shadow-inner">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
    </div>
    <p className="mt-6 text-2xl font-semibold tracking-tight text-gray-900">Authorizing</p>
    <p className="mt-2 text-sm text-gray-500">Please wait while the terminal is preparing the payment.</p>
  </div>
);


const CardBrands = () => (
  <div className="flex items-center justify-center gap-2 sm:gap-3">
    <SupportedBrand label="VISA" className="bg-blue-600 text-white" />
    <div className="flex items-center gap-0.5">
      <span className="h-3.5 w-3.5 rounded-full bg-red-500" />
      <span className="h-3.5 w-3.5 rounded-full bg-orange-500" />
    </div>
    <SupportedBrand label="AMEX" className="bg-blue-400 text-white" />
    <SupportedBrand label="DISC" className="bg-orange-500 text-white" />
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
          title: "Hold card near NFC reader",
          subtitle: "Keep your card steady",
          showAmount: true,
          showBrands: true,
        };
      case "processing":
        return {
          title: "Processing payment...",
          subtitle: "Please wait while we finalize the charge",
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
          title: cancelledPayment ? "The transaction couldnot be completed." : "Payment Failed",
          subtitle: cancelledPayment ? "Tap to pay payment was cancelled" : "Try again or use a different payment method",
          showAmount: false,
          showBrands: false,
        };
      default:
        return {
          title: "",
          subtitle: "",
          showAmount: false,
          showBrands: false,
        };
    }
  }, [amount, cancelledPayment, paymentState]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden safe-area">
      {!cancelledPayment && (
        <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3.5 text-white">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 flex-shrink-0" />
            <h2 className="text-base font-semibold leading-none">Pay Now</h2>
          </div>

          <button
            onClick={handleClose}
            disabled={paymentState === "processing"}
            className="touch-target rounded-full p-2 transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {paymentState === "authorizing" ? (
          <AuthorizingView />
        ) : (
          <div className="flex h-full flex-col justify-between px-5 pt-3 pb-0 text-center">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="flex flex-col items-center space-y-3">

                <img
                  src="/tap-to-pay.png"
                  alt="Tap to Pay"
                  className="h-24 w-24 object-contain"
                />

                <div className="space-y-1 text-center">
                  <p className={cn(
                    "text-base font-semibold transition-opacity duration-300",
                    paymentState === "waiting_for_card" && "text-orange-600",
                    paymentState === "processing" && "text-blue-600",
                    paymentState !== "waiting_for_card" && paymentState !== "processing" && "text-gray-900"
                  )}>
                    {stateCopy.title}
                  </p>

                  <p className="text-sm text-gray-500">
                    {stateCopy.subtitle}
                  </p>

                  {paymentState === "waiting_for_card" && (
                    <p className="text-xs text-gray-400 text-center px-2 leading-relaxed">
                      NFC location may vary by device. Please tap near the back/top area of the device where NFC is available.
                    </p>
                  )}
                </div>

                {stateCopy.showAmount && (
                  <p className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}

                {stateCopy.showBrands && (
                  <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Accepted cards</p>
                    <div className="mt-2.5">
                      <CardBrands />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {paymentState !== "success" && paymentState !== "failed" && (
            <div className="shrink-0 px-5 pb-5 pt-2">
              <button
                onClick={handleCancelPayment}
                className="w-full rounded-2xl border border-gray-300 px-4 py-2.5 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200"
              >
                Cancel
              </button>
            </div>
            )}
          </div>
        )}
      </div>

      {(paymentState === "success" || paymentState === "failed") && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 sm:py-3.5 shrink-0" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
          {paymentState === "success" && (
            <button
              onClick={handleDone}
              className="flex-1 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-xl transition-colors touch-target text-sm sm:text-base"
            >
              Done
            </button>
          )}

          {paymentState === "failed" && cancelledPayment && (
            <button
              onClick={handleAcknowledgeCancelledPayment}
              className="w-full py-2.5 sm:py-3 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-xl transition-colors touch-target text-sm sm:text-base"
            >
              OK
            </button>
          )}

          {paymentState === "failed" && !cancelledPayment && (
            <>
              <button
                onClick={handleRetry}
                className="flex-1 py-2.5 sm:py-3 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-xl transition-colors touch-target text-sm sm:text-base"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 sm:py-3 border border-gray-300 hover:bg-gray-100 active:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors touch-target text-sm sm:text-base"
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
