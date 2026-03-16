import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X, Zap, CreditCard, Building2, DollarSign, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EnterCardDetailsModal from "./EnterCardDetailsModal";
import EnterACHPaymentDetailsModal from "./EnterACHPaymentDetailsModal";
import CashPaymentModal from "./CashPaymentModal";
import TapToPayModal from "./TapToPayModal";
import ACHSetupSliderModal from "./ACHSetupSliderModal";
import PaymentMethodSetupModal from "./PaymentMethodSetupModal";
import { usePaymentConfiguration, type PaymentMethodKey } from "@/hooks/usePaymentConfiguration";
import type { Invoice } from "@/services/invoiceService";

export interface PaymentMethodSelectionPayload {
  invoiceIds?: string[];
  amount: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentMethodSelect?: (method: string, payload?: PaymentMethodSelectionPayload) => void;
  linkedInvoices?: Invoice[];
  defaultSelectedInvoiceIds?: string[];
  entityType?: "agreement" | "estimate" | "invoice";
  agreement?: {
    id?: string;
    totalPayable?: number;
    minimumDepositFraction?: number;
    [key: string]: any;
  };
}

const PaymentModal = ({ isOpen, onClose, amount, onPaymentMethodSelect, linkedInvoices, defaultSelectedInvoiceIds, entityType, agreement }: PaymentModalProps) => {
  const navigate = useNavigate();
  const { getMethodState, setMethodConfigured } = usePaymentConfiguration();
  const [showCardDetailsModal, setShowCardDetailsModal] = useState(false);
  const [showACHPaymentDetailsModal, setShowACHPaymentDetailsModal] = useState(false);
  const [showCashPaymentModal, setShowCashPaymentModal] = useState(false);
  const [showTapToPayModal, setShowTapToPayModal] = useState(false);
  const [showNoReaderModal, setShowNoReaderModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupMethodKey, setSetupMethodKey] = useState<PaymentMethodKey | null>(null);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [invoiceDropdownOpen, setInvoiceDropdownOpen] = useState(false);

  const isJobInvoiceSelectionFlow = Array.isArray(linkedInvoices);
  const unpaidLinkedInvoices = useMemo(
    () => (linkedInvoices || []).filter((invoice) => (invoice.status || "").toLowerCase() !== "paid"),
    [linkedInvoices]
  );

  const getInvoiceRemainingBalance = (invoice: Invoice) => {
    const paidAmount = Number(invoice.paidAmount || 0);
    const invoiceAmount = Number(invoice.amount || 0);
    return Math.max(invoiceAmount - paidAmount, 0);
  };

  useEffect(() => {
    if (!isOpen) return;

    if (unpaidLinkedInvoices.length === 0) {
      setSelectedInvoiceIds([]);
      return;
    }

    const validDefault = (defaultSelectedInvoiceIds || []).filter((id) =>
      unpaidLinkedInvoices.some((invoice) => invoice.id === id)
    );

    setSelectedInvoiceIds(validDefault.length > 0 ? validDefault : unpaidLinkedInvoices.map((invoice) => invoice.id));
  }, [isOpen, unpaidLinkedInvoices, defaultSelectedInvoiceIds]);

  const selectedInvoiceTotal = useMemo(() => {
    if (!isJobInvoiceSelectionFlow) {
      return amount;
    }

    return unpaidLinkedInvoices
      .filter((invoice) => selectedInvoiceIds.includes(invoice.id))
      .reduce((sum, invoice) => sum + getInvoiceRemainingBalance(invoice), 0);
  }, [isJobInvoiceSelectionFlow, amount, unpaidLinkedInvoices, selectedInvoiceIds]);

  const paymentAmount = selectedInvoiceTotal;

  const invoiceDropdownLabel = useMemo(() => {
    if (!isJobInvoiceSelectionFlow) {
      return "Select Invoice(s)";
    }

    if (unpaidLinkedInvoices.length === 0) {
      return "No unpaid invoices";
    }

    if (selectedInvoiceIds.length === unpaidLinkedInvoices.length) {
      return `All selected (${selectedInvoiceIds.length})`;
    }

    if (selectedInvoiceIds.length === 0) {
      return "Select Invoice(s)";
    }

    return `${selectedInvoiceIds.length} selected`;
  }, [isJobInvoiceSelectionFlow, unpaidLinkedInvoices.length, selectedInvoiceIds.length]);

  const selectionPayload: PaymentMethodSelectionPayload = {
    invoiceIds: isJobInvoiceSelectionFlow ? selectedInvoiceIds : undefined,
    amount: paymentAmount,
  };

  const toggleInvoiceSelection = (invoiceId: string, checked: boolean) => {
    if (checked) {
      setSelectedInvoiceIds((prev) => Array.from(new Set([...prev, invoiceId])));
      return;
    }
    setSelectedInvoiceIds((prev) => prev.filter((id) => id !== invoiceId));
  };

  // Calculate minimum amount payable for agreements
  const minimumAmountPayable = (() => {
    // Only show for agreement payments
    if (entityType !== "agreement" && !agreement) {
      return null;
    }

    // Get totalPayable from agreement or use amount as fallback
    const totalPayable = agreement?.totalPayable || amount;
    
    // Get minimumDepositFraction from agreement or from localStorage/default
    let minimumDepositFraction = agreement?.minimumDepositFraction;
    
    // If not in agreement, try to get from localStorage (from MinimumDepositPercentageModal)
    if (minimumDepositFraction === undefined) {
      const storedPercentage = localStorage.getItem("minimumDepositPercentage");
      if (storedPercentage) {
        minimumDepositFraction = parseFloat(storedPercentage) / 100; // Convert percentage to fraction
      } else {
        // Default to 0.25 (25%) if nothing is set
        minimumDepositFraction = 0.25;
      }
    }

    // If still no valid fraction, don't show the line
    if (minimumDepositFraction === undefined || minimumDepositFraction <= 0) {
      return null;
    }

    // Calculate minimum amount
    const minimumAmount = totalPayable * minimumDepositFraction;
    return minimumAmount;
  })();

  const paymentOptions = useMemo(
    () => [
      {
        id: "tap-to-pay",
        methodKey: "tapToPay" as const,
        label: "Tap to Pay",
        setupLabel: "Setup Tap to Pay",
        icon: Zap,
      },
      {
        id: "enter-card",
        methodKey: "cardManual" as const,
        label: "Enter Card Manually",
        setupLabel: "Setup Card",
        icon: CreditCard,
      },
      {
        id: "ach",
        methodKey: "ach" as const,
        label: "ACH Bank Transfer",
        setupLabel: "Setup ACH",
        icon: Building2,
      },
      {
        id: "cash",
        methodKey: "cash" as const,
        label: "Pay by Cash",
        icon: DollarSign,
      },
    ],
    []
  );

  const isMethodDisabled = (methodKey: PaymentMethodKey) => {
    if (methodKey === "cash") {
      return false;
    }
    const methodState = getMethodState(methodKey);
    return !methodState.enabled || !methodState.configured;
  };

  const handleSetupClick = (methodKey: PaymentMethodKey) => {
    // For Tap to Pay, navigate to Payment Methods settings page
    if (methodKey === "tapToPay") {
      onClose();
      navigate("/settings/payment-methods");
      return;
    }
    
    // For other methods, show the setup modal
    setSetupMethodKey(methodKey);
    setShowSetupModal(true);
  };

  const handlePaymentMethodClick = (methodId: string) => {
    const option = paymentOptions.find((item) => item.id === methodId);
    if (option && isMethodDisabled(option.methodKey)) {
      return;
    }

    if (isJobInvoiceSelectionFlow && selectedInvoiceIds.length === 0) {
      return;
    }

    if (methodId === "tap-to-pay") {
      // Check if card reader is connected
      const currentConnectedReaderId = localStorage.getItem("currentConnectedReaderId");
      if (!currentConnectedReaderId) {
        // No reader connected - show no reader modal
        setShowNoReaderModal(true);
      } else {
        // Reader is connected - show Tap to Pay modal
        setShowTapToPayModal(true);
      }
    } else if (methodId === "enter-card") {
      // Show card details modal instead of closing
      setShowCardDetailsModal(true);
    } else if (methodId === "ach") {
      // ACH is configured - open payment details modal
      setShowACHPaymentDetailsModal(true);
    } else if (methodId === "cash") {
      // Show cash payment modal instead of closing
      setShowCashPaymentModal(true);
    } else {
      if (onPaymentMethodSelect) {
        onPaymentMethodSelect(methodId, selectionPayload);
      }
      onClose();
    }
  };

  const handleCardDetailsBack = () => {
    setShowCardDetailsModal(false);
  };

  const handleCardDetailsClose = () => {
    setShowCardDetailsModal(false);
    onClose();
  };

  const handleCardPaymentComplete = () => {
    setShowCardDetailsModal(false);
    onClose();
    if (onPaymentMethodSelect) {
      onPaymentMethodSelect("enter-card", selectionPayload);
    }
  };

  const handleACHPaymentDetailsBack = () => {
    setShowACHPaymentDetailsModal(false);
  };

  const handleACHPaymentDetailsClose = () => {
    setShowACHPaymentDetailsModal(false);
    onClose();
  };

  const handleACHPaymentComplete = () => {
    setShowACHPaymentDetailsModal(false);
    onClose();
    if (onPaymentMethodSelect) {
      onPaymentMethodSelect("ach", selectionPayload);
    }
  };

  const handleCashPaymentBack = () => {
    setShowCashPaymentModal(false);
  };

  const handleCashPaymentClose = () => {
    setShowCashPaymentModal(false);
    onClose();
  };

  const handleCashPaymentComplete = () => {
    setShowCashPaymentModal(false);
    onClose();
    if (onPaymentMethodSelect) {
      onPaymentMethodSelect("cash", selectionPayload);
    }
  };

  const handleTapToPayBack = () => {
    setShowTapToPayModal(false);
  };

  const handleTapToPayClose = () => {
    setShowTapToPayModal(false);
    onClose();
  };

  const handleTapToPayComplete = () => {
    setShowTapToPayModal(false);
    onClose();
    if (onPaymentMethodSelect) {
      onPaymentMethodSelect("tap-to-pay", selectionPayload);
    }
  };

  const handleNoReaderContinue = () => {
    setShowNoReaderModal(false);
    onClose();
    // Navigate to Configure Card Reader screen
    navigate("/settings/configure-card-reader");
  };

  const handleSetupBack = () => {
    setShowSetupModal(false);
  };

  const handleSetupClose = () => {
    setShowSetupModal(false);
  };

  const handleSetupComplete = () => {
    if (setupMethodKey) {
      // For card setup, enable both cardManual and tapToPay
      if (setupMethodKey === "cardManual") {
        setMethodConfigured("cardManual", true);
        setMethodConfigured("tapToPay", true);
      } else if (setupMethodKey === "tapToPay") {
        setMethodConfigured("cardManual", true);
        setMethodConfigured("tapToPay", true);
      } else {
        setMethodConfigured(setupMethodKey, true);
      }
    }
    setShowSetupModal(false);
  };

  return (
    <>
      <Dialog open={isOpen && !showCardDetailsModal && !showACHPaymentDetailsModal && !showCashPaymentModal && !showTapToPayModal && !showNoReaderModal && !showSetupModal} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden [&>div]:p-0 [&>button]:hidden">
          <DialogTitle className="sr-only">
            Service Pro 911 - Payment
          </DialogTitle>
          <DialogDescription className="sr-only">
            Payment modal for amount ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </DialogDescription>
          {/* Orange Header */}
          <div className="bg-orange-500 px-3 py-3 sm:px-4 sm:py-4 flex items-center justify-between safe-top">
            <button
              onClick={onClose}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-orange-600 transition-colors touch-target"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>
            <h2 className="text-base sm:text-lg font-semibold text-white px-2 text-center flex-1">Service Pro 911 - Payment</h2>
            <button
              onClick={onClose}
              className="p-1.5 -mr-1.5 rounded-full hover:bg-orange-600 transition-colors touch-target"
              aria-label="Close"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="bg-white py-5 sm:py-7 space-y-4 sm:space-y-6 overflow-y-auto safe-bottom overflow-x-hidden">
            {/* Invoice Selection Section (Job dashboard payment flow) */}
            {isJobInvoiceSelectionFlow && (
              <div className="invoice-selection-section px-4 sm:px-6 space-y-3 mb-5 sm:mb-6">
                <label className="text-sm font-medium text-gray-700">Select Invoice(s)</label>

                {unpaidLinkedInvoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">All invoices for this job are already paid.</p>
                ) : (
                  <Popover open={invoiceDropdownOpen} onOpenChange={setInvoiceDropdownOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full min-h-11 h-auto justify-between px-4 py-3 rounded-xl"
                      >
                        <span className="truncate">{invoiceDropdownLabel}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl" align="start">
                      <div className="max-h-64 overflow-y-auto py-1">
                        {unpaidLinkedInvoices.map((invoice) => {
                          const remainingBalance = getInvoiceRemainingBalance(invoice);
                          return (
                            <label
                              key={invoice.id}
                              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                            >
                              <Checkbox
                                checked={selectedInvoiceIds.includes(invoice.id)}
                                onCheckedChange={(checked) => toggleInvoiceSelection(invoice.id, checked === true)}
                              />
                              <span className="text-sm text-gray-900 truncate">
                                {invoice.id} — ${remainingBalance.toFixed(2)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            )}

            {/* Total Amount Section */}
            <div className="flex flex-col items-center space-y-2 sm:space-y-3 px-6 sm:px-8 mt-2 sm:mt-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">${paymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                {/* Minimum Amount Payable - Only for Agreements */}
                {minimumAmountPayable !== null && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">
                    Minimum Amount Payable ${minimumAmountPayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-3 sm:space-y-4 w-full">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 text-center px-6 sm:px-8">Payment Options</h3>
              <div className="w-full px-10 sm:px-12 pb-6 box-border">
                <div className="grid grid-cols-2 gap-4 sm:gap-5 w-full box-border">
                  {paymentOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelectionDisabled = isJobInvoiceSelectionFlow && selectedInvoiceIds.length === 0;
                    const isDisabled = isMethodDisabled(option.methodKey) || isSelectionDisabled;
                    
                    return (
                      <div
                        key={option.id}
                        className={`flex flex-col items-center justify-center p-4 sm:p-6 bg-white border-2 border-gray-200 rounded-xl transition-all touch-target min-h-[100px] sm:min-h-[120px] ${
                          isDisabled
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:border-orange-500 hover:bg-orange-50 active:scale-95 cursor-pointer"
                        }`}
                        onClick={() => !isDisabled && handlePaymentMethodClick(option.id)}
                        aria-disabled={isDisabled}
                      >
                        <Icon className={`h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3 ${isDisabled ? "text-gray-400" : "text-orange-500"}`} />
                        <span className={`text-xs sm:text-sm font-medium text-center leading-tight ${isDisabled ? "text-gray-500" : "text-gray-900"}`}>{option.label}</span>
                        
                        {isDisabled && option.methodKey !== "cash" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetupClick(option.methodKey);
                            }}
                            className="mt-1 text-xs text-orange-500 underline font-medium hover:text-orange-600 active:scale-95"
                          >
                            {option.setupLabel}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enter Card Details Modal */}
      <EnterCardDetailsModal
        isOpen={showCardDetailsModal}
        onClose={handleCardDetailsClose}
        onBack={handleCardDetailsBack}
        amount={paymentAmount}
        onPaymentComplete={handleCardPaymentComplete}
      />

      {/* Enter ACH Payment Details Modal */}
      <EnterACHPaymentDetailsModal
        isOpen={showACHPaymentDetailsModal}
        onClose={handleACHPaymentDetailsClose}
        onBack={handleACHPaymentDetailsBack}
        amount={paymentAmount}
        onPaymentComplete={handleACHPaymentComplete}
      />

      {/* Cash Payment Modal */}
      <CashPaymentModal
        isOpen={showCashPaymentModal}
        onClose={handleCashPaymentClose}
        onBack={handleCashPaymentBack}
        amount={paymentAmount}
        onPaymentComplete={handleCashPaymentComplete}
      />

      {/* Tap to Pay Modal */}
      <TapToPayModal
        isOpen={showTapToPayModal}
        onClose={handleTapToPayClose}
        onBack={handleTapToPayBack}
        amount={paymentAmount}
        onPaymentComplete={handleTapToPayComplete}
      />

      {/* No Card Reader Connected Modal */}
      <Dialog open={showNoReaderModal} onOpenChange={setShowNoReaderModal}>
        <DialogContent className="w-[90%] max-w-sm mx-auto p-5 rounded-2xl shadow-lg bg-white [&>button]:hidden max-h-[85vh] overflow-y-auto">
          <DialogTitle className="sr-only">Card Reader Not Connected</DialogTitle>
          <DialogDescription className="sr-only">
            Modal informing user that card reader is not connected
          </DialogDescription>
          
          {/* Content */}
          <div className="flex flex-col items-center text-center space-y-4 py-2">
            <p className="text-sm text-gray-700 leading-relaxed">
              Card reader is not connected. You may connect your reader via Bluetooth or USB at anytime.
            </p>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center pt-4 mt-4">
            <Button
              onClick={handleNoReaderContinue}
              className="w-full h-11 text-sm font-semibold rounded-full bg-primary text-white hover:bg-primary/90"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ACH Setup Slider Modal */}
      <ACHSetupSliderModal
        isOpen={showSetupModal && setupMethodKey === "ach"}
        onClose={handleSetupClose}
        onBack={handleSetupBack}
        onSetupComplete={handleSetupComplete}
        setupType="ach"
      />

      {/* Card Setup Slider Modal */}
      <ACHSetupSliderModal
        isOpen={showSetupModal && (setupMethodKey === "cardManual" || setupMethodKey === "tapToPay")}
        onClose={handleSetupClose}
        onBack={handleSetupBack}
        onSetupComplete={handleSetupComplete}
        setupType="card"
      />

      {/* Payment Method Setup Modal (fallback for any other methods) */}
      <PaymentMethodSetupModal
        isOpen={showSetupModal && setupMethodKey !== "ach" && setupMethodKey !== "cardManual" && setupMethodKey !== "tapToPay"}
        onClose={handleSetupClose}
        onBack={handleSetupBack}
        methodLabel={
          setupMethodKey
            ? paymentOptions.find((option) => option.methodKey === setupMethodKey)?.label || "Payment Method"
            : "Payment Method"
        }
        onSetupComplete={handleSetupComplete}
      />
    </>
  );
};

export default PaymentModal;

