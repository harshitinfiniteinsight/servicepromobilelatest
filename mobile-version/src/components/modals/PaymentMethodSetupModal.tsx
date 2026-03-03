import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaymentMethodSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  methodLabel: string;
  onSetupComplete: () => void;
}

const PaymentMethodSetupModal = ({
  isOpen,
  onClose,
  onBack,
  methodLabel,
  onSetupComplete,
}: PaymentMethodSetupModalProps) => {
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSettingUp(false);
    }
  }, [isOpen]);

  const handleSetupComplete = async () => {
    if (isSettingUp) {
      return;
    }

    setIsSettingUp(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    onSetupComplete();
    setIsSettingUp(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden [&>div]:p-0 [&>button]:hidden">
        <DialogTitle className="sr-only">Setup {methodLabel}</DialogTitle>
        <DialogDescription className="sr-only">Complete setup for {methodLabel}</DialogDescription>

        {/* Header */}
        <div className="bg-orange-500 px-3 py-3 sm:px-4 sm:py-4 flex items-center justify-between safe-top">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-orange-600 transition-colors touch-target"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </button>
          <h2 className="text-base sm:text-lg font-semibold text-white px-2 text-center flex-1">Setup {methodLabel}</h2>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-full hover:bg-orange-600 transition-colors touch-target"
            aria-label="Close"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="bg-white px-6 sm:px-8 py-6 sm:py-8 space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-orange-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{methodLabel} setup</h3>
            <p className="text-sm sm:text-base text-gray-600">
              This is a demo setup flow. Click below to simulate a successful configuration.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-6 sm:px-8 pb-6 sm:pb-8">
          <Button
            onClick={handleSetupComplete}
            disabled={isSettingUp}
            className="w-full h-11 text-sm sm:text-base font-semibold rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {isSettingUp ? "Setting up..." : `Complete ${methodLabel} setup`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodSetupModal;
