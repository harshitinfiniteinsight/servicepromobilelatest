import { useEffect, useMemo, useState } from "react";
import { X, Smartphone, Zap } from "lucide-react";
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

const NfcRings = ({ active }: { active: boolean }) => (
  <>
    <div
      className={cn(
        "absolute inset-0 rounded-full border-2 border-orange-300/70",
        active && "animate-ping"
      )}
    />
    <div
      className={cn(
        "absolute inset-4 rounded-full border-2 border-orange-200/90",
        active && "animate-pulse"
      )}
    />
  </>
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

const NFCIcon = () => (
  <svg viewBox="0 0 96 96" className="h-20 w-20 sm:h-24 sm:w-24 text-orange-500" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 26h48v44H24z" />
    <path d="M34 38c5-5 11-8 14-8s9 3 14 8" />
    <path d="M30 32c8-8 16-12 18-12s10 4 18 12" />
    <path d="M38 48c3-3 6-4 10-4s7 1 10 4" />
    <path d="M48 54v6" />
  </svg>
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

  useEffect(() => {
    if (!isOpen) {
      setPaymentState("authorizing");
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

  const handleRetry = () => {
    setPaymentState("authorizing");
  };

  const stateCopy = useMemo(() => {
    switch (paymentState) {
      case "waiting_for_card":
        return {
          title: "Hold your card here",
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
          title: "Payment Failed",
          subtitle: "Try again or use a different payment method",
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
  }, [amount, paymentState]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 safe-area overflow-hidden">
      <div
        className={cn(
          "flex h-[min(92vh,820px)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300",
          paymentState === "authorizing" ? "scale-100 opacity-100" : "scale-100 opacity-100"
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4 text-white">
          <button
            onClick={handleClose}
            disabled={paymentState === "processing"}
            className="touch-target -ml-2 rounded-full p-2 transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <span className="text-sm font-semibold">Service Pro911</span>
            </div>
          </div>

          <div className="relative w-6 h-6">
            <Zap className={cn("h-6 w-6", paymentState === "waiting_for_card" && "animate-pulse")} />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {paymentState === "authorizing" ? (
            <AuthorizingView />
          ) : (
            <div className="flex h-full flex-col px-6 py-5 text-center">
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="flex flex-col items-center">
                  <p className="mt-1 text-sm font-medium text-gray-500">Hold your card here</p>

                  <div className="relative mt-6 flex h-52 w-52 items-center justify-center sm:h-56 sm:w-56">
                    <NfcRings active={paymentState === "waiting_for_card" || paymentState === "processing"} />

                    <div className="relative z-10 flex items-center justify-center">
                      <div className="flex h-28 w-20 items-center justify-center rounded-[28px] border-4 border-gray-900 bg-gradient-to-b from-gray-50 to-gray-100 shadow-xl sm:h-32 sm:w-24">
                        <NFCIcon />
                      </div>

                      <div className="absolute -top-8 right-0 flex h-24 w-16 items-center justify-center rounded-2xl border-2 border-blue-700 bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg rotate-[-12deg] sm:h-28 sm:w-20">
                        <span className="text-[10px] font-bold tracking-wide text-white">CARD</span>
                      </div>
                    </div>
                  </div>

                  {stateCopy.showAmount && (
                    <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                      ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}

                  <p className={cn(
                    "mt-4 text-base font-semibold transition-opacity duration-300",
                    paymentState === "waiting_for_card" && "text-orange-600",
                    paymentState === "processing" && "text-blue-600"
                  )}>
                    {stateCopy.title}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    {stateCopy.subtitle}
                  </p>

                  {stateCopy.showBrands && (
                    <div className="mt-6 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Accepted cards</p>
                      <div className="mt-3">
                        <CardBrands />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 pt-4">
                <button
                  onClick={handleClose}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3.5 sm:py-4 shrink-0" style={{ paddingBottom: "calc(0.875rem + env(safe-area-inset-bottom))" }}>
          {paymentState === "success" && (
            <button
              onClick={handleDone}
              className="flex-1 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-xl transition-colors touch-target text-sm sm:text-base"
            >
              Done
            </button>
          )}

          {paymentState === "failed" && (
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

          {(paymentState === "success") && null}
        </div>
      </div>
    </div>
  );
};

export default TapToPayScreen;
