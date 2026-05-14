import { useState, useEffect } from "react";
import { X, Smartphone, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface TapToPayScreenProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  readerName?: string;
  onPaymentComplete?: () => void;
}

type PaymentStatus = "idle" | "scanning" | "processing" | "success" | "failure";

const TapToPayScreen = ({
  isOpen,
  onClose,
  amount,
  readerName = "Card Reader",
  onPaymentComplete,
}: TapToPayScreenProps) => {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [isAnimating, setIsAnimating] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    if (!isOpen) {
      setStatus("idle");
      setIsAnimating(false);
    }
  }, [isOpen]);

  // Auto-transition to success after demo (remove in production with real hardware)
  useEffect(() => {
    if (!isOpen) return;

    if (status === "idle") {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setStatus("scanning");
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }

    if (status === "scanning") {
      const timer = setTimeout(() => {
        setStatus("processing");
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (status === "processing") {
      const timer = setTimeout(() => {
        setStatus("success");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, status]);

  const handleClose = () => {
    if (status !== "processing") {
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
    setStatus("idle");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center safe-area overflow-hidden">
      <div
        className={cn(
          "bg-white rounded-3xl shadow-2xl w-full sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden",
          "mx-4 sm:mx-0 transition-all duration-300",
          isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"
        )}
      >
        {/* Header - Sticky */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={handleClose}
            disabled={status === "processing"}
            className="p-2 -ml-2 rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-white" />
              <span className="text-sm font-semibold text-white">Service Pro911</span>
            </div>
          </div>

          <div className="relative w-6 h-6">
            <Zap className={cn(
              "h-6 w-6 text-white",
              status === "scanning" && "animate-pulse"
            )} />
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center px-6 py-6 space-y-6">
          {/* Payment Amount */}
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-gray-500">Payment Amount</p>
            <p className="text-4xl sm:text-5xl font-bold text-gray-900">
              ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* NFC Animation - Responsive size */}
          <div className="relative w-28 h-28 sm:w-40 sm:h-40 flex items-center justify-center flex-shrink-0">
            {/* Outer pulse rings */}
            {status !== "idle" && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-orange-400 animate-ping opacity-75" />
                <div className="absolute inset-4 rounded-full border-2 border-orange-300 animate-pulse" />
              </>
            )}

            {/* Center device illustration */}
            <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-4">
              {/* Phone outline */}
              <div className="w-16 h-28 sm:w-24 sm:h-40 border-3 sm:border-4 border-gray-900 rounded-2xl sm:rounded-3xl flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 shadow-lg relative">
                {/* Screen */}
                <div className="w-14 h-24 sm:w-20 sm:h-32 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Notch */}
                  <div className="absolute top-1.5 sm:top-2 left-1/2 transform -translate-x-1/2 w-8 sm:w-12 h-4 sm:h-6 bg-gray-900 rounded-b-lg" />

                  {/* Animated NFC indicator */}
                  {status !== "idle" && (
                    <div className="absolute inset-2 flex items-center justify-center">
                      <svg className="w-8 h-8 sm:w-12 sm:h-12 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M9 9a3 3 0 0 1 3-3" />
                        <path d="M15 9a3 3 0 0 0-3-3" />
                        <path d="M9 15a3 3 0 0 0 3 3" />
                        <path d="M15 15a3 3 0 0 1-3 3" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Home indicator */}
                <div className="absolute bottom-1 w-8 sm:w-12 h-1 bg-gray-900 rounded-full" />
              </div>

              {/* Card above phone */}
              <div className="absolute -top-4 sm:-top-6 right-0 w-14 h-24 sm:w-20 sm:h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg sm:rounded-2xl shadow-lg transform -rotate-12 flex items-center justify-center border-2 border-blue-700">
                <span className="text-white text-xs font-bold">CARD</span>
              </div>
            </div>

            {/* Success checkmark - shown after processing */}
            {status === "success" && (
              <div className="absolute inset-0 flex items-center justify-center animate-pop">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-500 flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Instruction Text */}
          <div className="text-center space-y-2">
            <p className={cn(
              "text-base sm:text-lg font-semibold transition-colors duration-300",
              status === "idle" && "text-gray-900",
              status === "scanning" && "text-orange-600",
              status === "processing" && "text-blue-600",
              status === "success" && "text-green-600",
              status === "failure" && "text-red-600"
            )}>
              {status === "idle" && "Ready to scan"}
              {status === "scanning" && "Waiting for card..."}
              {status === "processing" && "Processing payment..."}
              {status === "success" && "Payment Successful!"}
              {status === "failure" && "Payment Failed"}
            </p>

            <p className={cn(
              "text-xs sm:text-sm transition-opacity duration-300",
              status === "success" || status === "failure" ? "text-gray-500" : "text-gray-600"
            )}>
              {status === "idle" && "Hold your card near the contactless area"}
              {status === "scanning" && "Keep your card steady"}
              {status === "processing" && "Please wait while we process your payment"}
              {status === "success" && `$${amount.toFixed(2)} has been charged`}
              {status === "failure" && "Please try again or use a different payment method"}
            </p>
          </div>

          {/* Reader Info */}
          {status !== "success" && status !== "failure" && (
            <div className="w-full bg-gray-50 rounded-xl sm:rounded-2xl px-4 py-2.5 border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Reader</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900">{readerName}</span>
              </div>
            </div>
          )}

          {/* Payment Logos */}
          {status !== "processing" && (
            <div className="w-full pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-2.5">Supported Payment Methods</p>
              <div className="flex items-center justify-center gap-3">
                {/* Visa */}
                <div className="w-9 h-5.5 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-[7px] font-bold">VISA</span>
                </div>

                {/* Mastercard */}
                <div className="w-9 h-5.5 rounded flex items-center justify-center gap-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                </div>

                {/* Amex */}
                <div className="w-9 h-5.5 bg-blue-400 rounded flex items-center justify-center">
                  <span className="text-white text-[7px] font-bold">AMEX</span>
                </div>

                {/* Discover */}
                <div className="w-9 h-5.5 bg-orange-500 rounded flex items-center justify-center">
                  <span className="text-white text-[7px] font-bold">DIS</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Sticky */}
        <div className="px-6 py-3.5 sm:py-4 bg-gray-50 border-t border-gray-200 flex gap-3 flex-shrink-0" style={{ paddingBottom: "calc(0.875rem + env(safe-area-inset-bottom))" }}>
          {status === "success" && (
            <button
              onClick={handleDone}
              className="flex-1 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-xl transition-colors touch-target text-sm sm:text-base"
            >
              Done
            </button>
          )}

          {status === "failure" && (
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

          {(status === "idle" || status === "scanning" || status === "processing") && (
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 sm:py-3 border border-gray-300 hover:bg-gray-100 active:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors touch-target disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              disabled={status === "processing"}
            >
              Cancel
            </button>
          )}

          {status === "processing" && (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop {
          animation: pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

export default TapToPayScreen;
