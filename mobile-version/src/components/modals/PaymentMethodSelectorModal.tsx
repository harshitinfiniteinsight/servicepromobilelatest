import { useEffect, useState } from "react";
import { X, Zap, CreditCard, Building2, DollarSign, ArrowLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type PaymentMethodId = "tap-to-pay" | "enter-card" | "ach" | "cash";
type PaymentSelectorStep = "select_method" | "enter_amount";

interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
  description: string;
  icon: React.ElementType;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "tap-to-pay",
    label: "Tap to Pay",
    description: "Accept contactless payments",
    icon: Zap,
  },
  {
    id: "enter-card",
    label: "Enter Card Manually",
    description: "Type in credit / debit card details",
    icon: CreditCard,
  },
  {
    id: "ach",
    label: "ACH Bank Transfer",
    description: "Direct bank-to-bank transfer",
    icon: Building2,
  },
  {
    id: "cash",
    label: "Pay by Cash",
    description: "Record a cash payment",
    icon: DollarSign,
  },
];

interface PaymentMethodSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: PaymentMethodId, amount: number) => void;
  totalAmount?: number;
}

const PaymentMethodSelectorModal = ({
  isOpen,
  onClose,
  onSelectMethod,
  totalAmount,
}: PaymentMethodSelectorModalProps) => {
  const [step, setStep] = useState<PaymentSelectorStep>("select_method");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [amountError, setAmountError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep("select_method");
      setSelectedMethod(null);
      setAmountInput(totalAmount !== undefined ? totalAmount.toFixed(2) : "");
      setAmountError("");
    }
  }, [isOpen, totalAmount]);

  const handleMethodSelect = (method: PaymentMethodId) => {
    setSelectedMethod(method);
    setAmountInput(totalAmount !== undefined ? totalAmount.toFixed(2) : "");
    setAmountError("");
    setStep("enter_amount");
  };

  const handleAmountChange = (value: string) => {
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmountInput(value);
      setAmountError("");
    }
  };

  const handleConfirm = () => {
    if (!selectedMethod) return;

    const parsedAmount = parseFloat(amountInput);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError("Please enter a valid amount greater than $0.00");
      return;
    }

    if (totalAmount !== undefined && parsedAmount > totalAmount + 0.001) {
      setAmountError(`Amount cannot exceed $${totalAmount.toFixed(2)}`);
      return;
    }

    onSelectMethod(selectedMethod, parsedAmount);
  };

  const selectedMethodInfo = PAYMENT_METHODS.find((method) => method.id === selectedMethod);
  const stepTitle = step === "select_method" ? "Select Payment Method" : "Enter Amount";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[90vh] overflow-hidden [&>div]:p-0 [&>button]:hidden">
        <DialogTitle className="sr-only">{stepTitle}</DialogTitle>
        <DialogDescription className="sr-only">
          {step === "select_method" ? "Choose how you would like to collect payment" : "Enter payment amount"}
        </DialogDescription>

        {/* Header */}
        <div className="bg-orange-500 px-4 py-4 flex items-center justify-between">
          {step === "enter_amount" ? (
            <button
              onClick={() => {
                setStep("select_method");
                setAmountError("");
              }}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-orange-600 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
          ) : (
            <div className="w-8" />
          )}
          <h2 className="text-base font-semibold text-white flex-1 text-center">{stepTitle}</h2>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-full hover:bg-orange-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {step === "select_method" && (
          <>
            {totalAmount !== undefined && (
              <div className="bg-orange-50 px-4 py-3 text-center border-b border-orange-100">
                <p className="text-sm text-gray-500">Amount to collect</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalAmount.toFixed(2)}
                </p>
              </div>
            )}

            {/* Options */}
            <div className="bg-white divide-y divide-gray-100 overflow-y-auto">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{method.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                );
              })}
            </div>

            {/* Footer spacer for safe area */}
            <div className="bg-white h-2" />
          </>
        )}

        {step === "enter_amount" && selectedMethodInfo && (
          <div className="bg-white px-5 py-6 space-y-5">
            <div className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50 px-3 py-3">
              <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center">
                <selectedMethodInfo.icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{selectedMethodInfo.label}</p>
                <p className="text-xs text-gray-500">{selectedMethodInfo.description}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Payment Amount
                {totalAmount !== undefined && (
                  <span className="ml-1 text-xs font-normal text-gray-400">(max ${totalAmount.toFixed(2)})</span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">$</span>
                <Input
                  className="pl-7 h-11 text-base font-semibold"
                  inputMode="decimal"
                  value={amountInput}
                  placeholder="0.00"
                  onChange={(e) => handleAmountChange(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  autoFocus
                />
              </div>
              {amountError && <p className="text-xs text-red-500">{amountError}</p>}
            </div>

            <Button
              onClick={handleConfirm}
              className="w-full h-11 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold"
            >
              Proceed with {selectedMethodInfo.label}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodSelectorModal;
