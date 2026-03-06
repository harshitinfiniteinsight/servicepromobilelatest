import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  X, 
  CreditCard, 
  Building2, 
  DollarSign, 
  Loader2, 
  Check,
  AlertCircle,
  Banknote,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

export interface RefundInvoiceData {
  id: string;
  customerName: string;
  amount: number;
  paidAmount?: number;
  paymentMethod?: string;
  transactionId?: string;
  status: string;
  refundedAmount?: number;
}

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: RefundInvoiceData;
  onRefundComplete?: (invoiceId: string, refundAmount: number, newStatus: string) => void;
  source?: "job" | "invoice";
  jobId?: string;
  allInvoices?: RefundInvoiceData[];
}

type RefundType = "full" | "partial";
type RefundMethodOption = "original" | "different";
type PaymentMethodType = "cash" | "bank_transfer" | "card" | "check";

interface RefundRecord {
  invoiceId: string;
  refundAmount: number;
  refundMethod: string;
  refundMethodType: RefundMethodOption;
  processedBy: string;
  timestamp: string;
  referenceId?: string;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    routingNumber?: string;
  };
}

const paymentMethodIcons: Record<string, React.ElementType> = {
  "Credit Card": CreditCard,
  "Card": CreditCard,
  "ACH": Building2,
  "Bank Transfer": Building2,
  "Cash": DollarSign,
  "Check": Banknote,
};

const differentPaymentMethods: { id: PaymentMethodType; label: string; icon: React.ElementType }[] = [
  { id: "cash", label: "Cash", icon: DollarSign },
  { id: "bank_transfer", label: "Bank Transfer", icon: Building2 },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "check", label: "Check", icon: Banknote },
];

const RefundModal = ({ isOpen, onClose, invoice, onRefundComplete, source = "invoice", jobId, allInvoices = [] }: RefundModalProps) => {
  // Step management
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  // For job source: selected invoice state
  const [selectedInvoice, setSelectedInvoice] = useState<RefundInvoiceData | null>(null);
  
  // Step 1 - Refund Type
  const [refundType, setRefundType] = useState<RefundType>("full");
  const [partialAmount, setPartialAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  
  // Step 2 - Refund Method
  const [refundMethodOption, setRefundMethodOption] = useState<RefundMethodOption>("original");
  const [selectedDifferentMethod, setSelectedDifferentMethod] = useState<PaymentMethodType | null>(null);
  
  // Bank transfer details (when different method is bank_transfer)
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankRoutingNumber, setBankRoutingNumber] = useState("");
  
  // Card details (when different method is card)
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Determine active invoice (either selected from job list or passed directly)
  const activeInvoice = source === "job" && selectedInvoice ? selectedInvoice : invoice;

  // Calculate refundable amount
  const paidAmount = activeInvoice.paidAmount ?? activeInvoice.amount;
  const alreadyRefunded = activeInvoice.refundedAmount ?? 0;
  const refundableAmount = paidAmount - alreadyRefunded;

  // Computed refund amount based on type
  const refundAmount = useMemo(() => {
    if (refundType === "full") {
      return refundableAmount;
    }
    const parsed = parseFloat(partialAmount);
    return isNaN(parsed) ? 0 : parsed;
  }, [refundType, partialAmount, refundableAmount]);

  // Determine new invoice status after refund
  const newInvoiceStatus = useMemo(() => {
    const totalRefundedAfter = alreadyRefunded + refundAmount;
    if (totalRefundedAfter >= paidAmount) {
      return "Refunded";
    }
    return "Partially Refunded";
  }, [refundAmount, alreadyRefunded, paidAmount]);

  // Validate partial amount
  useEffect(() => {
    if (refundType === "partial") {
      const parsed = parseFloat(partialAmount);
      if (!partialAmount) {
        setAmountError("");
      } else if (isNaN(parsed)) {
        setAmountError("Please enter a valid amount");
      } else if (parsed <= 0) {
        setAmountError("Amount must be greater than $0");
      } else if (parsed > refundableAmount) {
        setAmountError(`Cannot exceed $${refundableAmount.toFixed(2)}`);
      } else {
        setAmountError("");
      }
    } else {
      setAmountError("");
    }
  }, [partialAmount, refundType, refundableAmount]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setRefundType("full");
      setPartialAmount("");
      setAmountError("");
      setRefundReason("");
      setReasonError("");
      setRefundMethodOption("original");
      setSelectedDifferentMethod(null);
      setBankAccountName("");
      setBankAccountNumber("");
      setBankRoutingNumber("");
      setIsProcessing(false);
      setShowSuccess(false);
      
      // For job source: pre-select first invoice from the list
      if (source === "job" && allInvoices && allInvoices.length > 0) {
        setSelectedInvoice(allInvoices[0]);
      }
    }
  }, [isOpen, source, allInvoices]);

  // Check if step 1 is valid to proceed
  const isStep1Valid = useMemo(() => {
    // For job source: must select an invoice first
    if (source === "job" && !selectedInvoice) return false;
    
    if (!refundReason.trim()) return false;
    if (refundType === "full") return true;
    const parsed = parseFloat(partialAmount);
    return !isNaN(parsed) && parsed > 0 && parsed <= refundableAmount;
  }, [source, selectedInvoice, refundType, partialAmount, refundableAmount, refundReason]);

  // Validate reason field
  useEffect(() => {
    if (currentStep === 1) {
      if (!refundReason.trim()) {
        setReasonError("");
      } else if (refundReason.length > 300) {
        setReasonError("Reason must be less than 300 characters");
      } else {
        setReasonError("");
      }
    }
  }, [refundReason, currentStep]);

  // Check if step 2 is valid to proceed
  const isStep2Valid = useMemo(() => {
    if (refundMethodOption === "original") return true;
    if (!selectedDifferentMethod) return false;
    if (selectedDifferentMethod === "bank_transfer") {
      return bankAccountName.trim() !== "" && bankAccountNumber.trim() !== "";
    }
    if (selectedDifferentMethod === "card") {
      return cardNumber.replace(/\s/g, "").length === 16 && 
             cardHolderName.trim() !== "" && 
             expiryDate.length === 5 && 
             cvv.length >= 3;
    }
    return true;
  }, [refundMethodOption, selectedDifferentMethod, bankAccountName, bankAccountNumber, cardNumber, cardHolderName, expiryDate, cvv]);

  // Get payment method icon
  const getPaymentMethodIcon = (method: string | undefined) => {
    if (!method) return Wallet;
    return paymentMethodIcons[method] || Wallet;
  };

  const handleClose = () => {
    if (isProcessing) return;
    onClose();
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      handleClose();
    }
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      if (!refundReason.trim()) {
        setReasonError("Please provide a reason for refund");
        return;
      }
      if (refundReason.length > 300) {
        setReasonError("Reason must be less than 300 characters");
        return;
      }
      if (isStep1Valid) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (isStep2Valid) {
        // Show confirmation before processing
        setCurrentStep(3);
      }
    }
  };

  const processRefund = async () => {
    if (!isStep2Valid || isProcessing) return;

    setIsProcessing(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Determine refund method string
      let refundMethodString = activeInvoice.paymentMethod || "Unknown";
      if (refundMethodOption === "different" && selectedDifferentMethod) {
        const methodLabel = differentPaymentMethods.find(m => m.id === selectedDifferentMethod)?.label;
        refundMethodString = methodLabel || selectedDifferentMethod;
      }

      // Create refund record (would be sent to backend)
      const refundRecord: RefundRecord = {
        invoiceId: activeInvoice.id,
        refundAmount: refundAmount,
        refundMethod: refundMethodString,
        refundMethodType: refundMethodOption,
        processedBy: "current_user", // Would come from auth context
        timestamp: new Date().toISOString(),
        referenceId: refundMethodOption === "original" && activeInvoice.transactionId 
          ? `REF-${activeInvoice.transactionId}` 
          : `REF-${Date.now()}`,
        ...(selectedDifferentMethod === "bank_transfer" && {
          bankDetails: {
            accountName: bankAccountName,
            accountNumber: bankAccountNumber,
            routingNumber: bankRoutingNumber,
          }
        }),
      };

      // Log for development
      console.log("Processing refund:", refundRecord);

      // Store refund record in localStorage (simulating backend)
      const existingRefunds = JSON.parse(localStorage.getItem("refunds") || "[]");
      existingRefunds.push(refundRecord);
      localStorage.setItem("refunds", JSON.stringify(existingRefunds));

      // Show success state
      setShowSuccess(true);
      
      // After brief delay, close and notify
      setTimeout(() => {
        showSuccessToast(`Refund of $${refundAmount.toFixed(2)} processed successfully`);
        onRefundComplete?.(activeInvoice.id, refundAmount, newInvoiceStatus);
        handleClose();
      }, 1500);

    } catch (error) {
      console.error("Refund error:", error);
      showErrorToast("Failed to process refund. Please try again.");
      setIsProcessing(false);
    }
  };

  // Success State
  if (showSuccess) {
    const refundId = `REF-${Date.now()}`;
    const processingTime = new Date().toLocaleString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden [&>div]:p-0 [&>button]:hidden">
          <DialogTitle className="sr-only">Refund Successful</DialogTitle>
          <DialogDescription className="sr-only">Your refund has been processed</DialogDescription>
          
          <div className="bg-white px-5 py-8 text-center rounded-2xl">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-in zoom-in duration-300">
              <Check className="h-10 w-10 text-green-500" />
            </div>

            {/* Header */}
            <h3 className="text-xl font-bold text-gray-900 mb-6">Refund Processed Successfully!</h3>

            {/* Main Refund Amount */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-5">
              <p className="text-xs text-green-600 font-medium mb-1">Refund Amount</p>
              <p className="text-3xl font-bold text-green-600 mb-3">
                ${refundAmount.toFixed(2)}
              </p>
              <p className="text-xs text-green-700">
                <span className="font-medium">{activeInvoice.customerName}</span> • Invoice {activeInvoice.id}
              </p>
            </div>

            {/* Details Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 mb-6 text-left">
              <div className="flex items-start justify-between">
                <span className="text-xs text-gray-600 font-medium">Refund ID</span>
                <span className="text-xs font-mono font-semibold text-gray-900">{refundId}</span>
              </div>
              <div className="flex items-start justify-between pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-600 font-medium">Processed At</span>
                <span className="text-xs text-gray-700">{processingTime}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-xs text-gray-600 font-medium">Invoice Status</span>
                <span className={cn(
                  "text-xs font-semibold",
                  newInvoiceStatus === "Refunded" ? "text-red-600" : "text-orange-600"
                )}>
                  {newInvoiceStatus}
                </span>
              </div>
              {refundableAmount > refundAmount && (
                <div className="flex items-start justify-between pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-600 font-medium">Remaining Refundable</span>
                  <span className="text-xs font-semibold text-green-600">
                    ${(refundableAmount - refundAmount).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Info Message */}
            <p className="text-xs text-gray-600 mb-6">
              A confirmation email has been sent to {activeInvoice.customerEmail || 'the customer'}
            </p>

            {/* Close Button */}
            <Button
              onClick={handleClose}
              className="w-full h-12 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[390px] w-[calc(100%-1.5rem)] mx-auto p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden !flex !flex-col [&>button]:hidden">
        <DialogTitle className="sr-only">Refund Invoice</DialogTitle>
        <DialogDescription className="sr-only">Process refund for invoice {invoice.id}</DialogDescription>
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white border-b border-gray-200 px-4 py-3 shrink-0">
          <button 
            onClick={handleBack} 
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isProcessing}
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-base font-semibold text-gray-900">
            {source === "job" ? `Refund for Job ID: ${jobId}` : "Refund Invoice"}
          </h2>
          <button 
            onClick={handleClose} 
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isProcessing}
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-white pointer-events-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="px-5 py-5 pb-6 space-y-5 pointer-events-auto">
            {/* Invoice Selector - Show when source is "job" and multiple invoices */}
          {source === "job" && allInvoices.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">
                Select Invoice to Refund <span className="text-red-500">*</span>
              </Label>
              <select
                value={selectedInvoice?.id || ""}
                onChange={(e) => {
                  const selected = allInvoices.find(inv => inv.id === e.target.value);
                  setSelectedInvoice(selected || null);
                  setPartialAmount("");
                  setAmountError("");
                }}
                disabled={isProcessing}
                className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Choose an invoice --</option>
                {allInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.id} — ${inv.amount.toFixed(2)} — {inv.status}
                  </option>
                ))}
              </select>
              {!selectedInvoice && (
                <p className="text-xs text-red-500 font-medium">Please select an invoice to proceed</p>
              )}
            </div>
          )}

          {/* Invoice Info Card - Compact 2-Row Layout */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5">
            {/* Row 1: Invoice ID | Amount */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-700">{activeInvoice.id}</p>
              <p className="text-sm font-bold text-gray-900">${paidAmount.toFixed(2)}</p>
            </div>
            {/* Row 2: Customer Name | Payment Method */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600">{activeInvoice.customerName}</p>
              <p className="text-xs text-gray-500">
                {activeInvoice.paymentMethod || "Payment pending"}
              </p>
            </div>
          </div>

          {/* Step 1: Refund Amount */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Refund Amount</h3>

              {/* Full Refund Option */}
              <button
                type="button"
                onClick={() => {
                  setRefundType("full");
                  setPartialAmount("");
                  setAmountError("");
                }}
                className={cn(
                  "w-full p-4 rounded-lg border text-left transition-all",
                  refundType === "full"
                    ? "border-2 border-orange-500 bg-orange-50"
                    : "border border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Full Refund</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Full invoice amount will be refunded
                    </p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    refundType === "full"
                      ? "border-orange-500 bg-orange-500"
                      : "border-gray-300"
                  )}>
                    {refundType === "full" && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>
              </button>

              {/* Partial Refund Option */}
              <button
                type="button"
                onClick={() => setRefundType("partial")}
                className={cn(
                  "w-full p-4 rounded-lg border text-left transition-all",
                  refundType === "partial"
                    ? "border-2 border-orange-500 bg-orange-50"
                    : "border border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Partial Refund</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Specify a custom amount
                    </p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    refundType === "partial"
                      ? "border-orange-500 bg-orange-500"
                      : "border-gray-300"
                  )}>
                    {refundType === "partial" && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>
              </button>

              {/* Partial Amount Input */}
              {refundType === "partial" && (
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-gray-700">
                    Refund Amount <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={refundableAmount}
                      value={partialAmount}
                      onChange={(e) => setPartialAmount(e.target.value)}
                      placeholder="0.00"
                      autoFocus
                      className={cn(
                        "pl-7 h-10 rounded-lg border-gray-200 text-sm",
                        amountError && "border-red-500 focus:ring-red-500"
                      )}
                    />
                  </div>
                  {amountError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {amountError}
                    </p>
                  )}
                </div>
              )}

              {/* Remaining Amount Display */}
              {refundAmount > 0 && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Remaining Amount</span>
                    <span className="text-base font-bold text-gray-900">
                      ${(paidAmount - refundAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Reason for Refund */}
              <div className="space-y-2 pt-1">
                <Label htmlFor="refund-reason" className="text-sm font-semibold text-gray-900">
                  Reason for Refund <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="refund-reason"
                  name="refundReason"
                  value={refundReason}
                  onChange={(e) => {
                    setRefundReason(e.target.value.slice(0, 300));
                    setReasonError("");
                  }}
                  placeholder="Enter reason for refund"
                  rows={4}
                  maxLength={300}
                  autoFocus={false}
                  tabIndex={0}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: reasonError ? '1px solid rgb(239, 68, 68)' : '1px solid rgb(229, 231, 235)',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    lineHeight: '1.5',
                    resize: 'none',
                    outline: 'none',
                    backgroundColor: 'white',
                    color: 'rgb(17, 24, 39)',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    touchAction: 'manipulation',
                    userSelect: 'text',
                    WebkitUserSelect: 'text',
                    pointerEvents: 'auto',
                  }}
                  onFocus={(e) => {
                    setReasonError("");
                    e.target.style.border = '2px solid rgb(249, 115, 22)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = reasonError ? '1px solid rgb(239, 68, 68)' : '1px solid rgb(229, 231, 235)';
                  }}
                />
                <div className="flex items-center justify-between">
                  {reasonError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {reasonError}
                    </p>
                  )}
                  <p className={cn(
                    "text-xs ml-auto",
                    refundReason.length > 270 ? "text-orange-600" : "text-gray-500"
                  )}>
                    {refundReason.length}/300
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Refund Method */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Select Refund Method</h3>
              
              {/* Original Payment Method Option */}
              <button
                type="button"
                onClick={() => {
                  setRefundMethodOption("original");
                  setSelectedDifferentMethod(null);
                }}
                className={cn(
                  "w-full p-4 rounded-lg border text-left transition-all",
                  refundMethodOption === "original"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      refundMethodOption === "original" ? "bg-orange-100" : "bg-gray-100"
                    )}>
                      {(() => {
                        const Icon = getPaymentMethodIcon(activeInvoice.paymentMethod);
                        return <Icon className={cn(
                          "h-4 w-4",
                          refundMethodOption === "original" ? "text-orange-600" : "text-gray-600"
                        )} />;
                      })()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Original Payment Method</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {activeInvoice.paymentMethod || "Payment method"}
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                    refundMethodOption === "original"
                      ? "border-orange-500 bg-orange-500"
                      : "border-gray-300"
                  )}>
                    {refundMethodOption === "original" && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>
              </button>

              {/* Different Method Option */}
              <button
                type="button"
                onClick={() => setRefundMethodOption("different")}
                className={cn(
                  "w-full p-4 rounded-lg border text-left transition-all",
                  refundMethodOption === "different"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      refundMethodOption === "different" ? "bg-orange-100" : "bg-gray-100"
                    )}>
                      <Wallet className={cn(
                        "h-4 w-4",
                        refundMethodOption === "different" ? "text-orange-600" : "text-gray-600"
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Different Method</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Use alternative payment method
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                    refundMethodOption === "different"
                      ? "border-orange-500 bg-orange-500"
                      : "border-gray-300"
                  )}>
                    {refundMethodOption === "different" && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>
              </button>

              {/* Different Method Selection */}
              {refundMethodOption === "different" && (
                <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-4">
                  <Label className="text-xs font-medium text-gray-700 block">
                    Select Payment Method
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {differentPaymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedDifferentMethod(method.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-center transition-all min-h-[88px]",
                          selectedDifferentMethod === method.id
                            ? "border-orange-500 bg-white"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        )}
                      >
                        <method.icon className={cn(
                          "h-5 w-5 mx-auto mb-1",
                          selectedDifferentMethod === method.id ? "text-orange-500" : "text-gray-500"
                        )} />
                        <p className={cn(
                          "text-xs font-medium",
                          selectedDifferentMethod === method.id ? "text-orange-600" : "text-gray-700"
                        )}>
                          {method.label}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Bank Transfer Details */}
                  {selectedDifferentMethod === "bank_transfer" && (
                    <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                          Account Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={bankAccountName}
                          onChange={(e) => setBankAccountName(e.target.value)}
                          placeholder="John Smith"
                          className="h-11 rounded-xl border-gray-200 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                          Account Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          placeholder="****1234"
                          className="h-11 rounded-xl border-gray-200 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                          Routing Number (Optional)
                        </Label>
                        <Input
                          value={bankRoutingNumber}
                          onChange={(e) => setBankRoutingNumber(e.target.value)}
                          placeholder="021000021"
                          className="h-11 rounded-xl border-gray-200 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Card Details */}
                  {selectedDifferentMethod === "card" && (
                    <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                          Card Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={cardNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\s/g, "").replace(/\D/g, "");
                            if (value.length <= 16) {
                              const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
                              setCardNumber(formatted);
                            }
                          }}
                          placeholder="1234 5678 9012 3456"
                          className="h-11 rounded-xl border-gray-200 text-sm"
                          maxLength={19}
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                          Card Holder Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          value={cardHolderName}
                          onChange={(e) => setCardHolderName(e.target.value)}
                          placeholder="Enter name on card"
                          className="h-11 rounded-xl border-gray-200 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                            Expiry Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={expiryDate}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, "");
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + "/" + value.slice(2, 4);
                              }
                              if (value.length <= 5) {
                                setExpiryDate(value);
                              }
                            }}
                            placeholder="MM/YY"
                            className="h-11 rounded-xl border-gray-200 text-sm"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                            CVV <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 4) {
                                setCvv(value);
                              }
                            }}
                            placeholder="***"
                            className="h-11 rounded-xl border-gray-200 text-sm"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Summary Section */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Refund Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Invoice</span>
                    <span className="font-medium text-gray-900">{activeInvoice.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Customer</span>
                    <span className="font-medium text-gray-900">{activeInvoice.customerName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Refund Amount</span>
                    <span className="font-bold text-orange-600">${refundAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Refund Method</span>
                    <span className="font-medium text-gray-900">
                      {refundMethodOption === "original" 
                        ? activeInvoice.paymentMethod || "Original" 
                        : differentPaymentMethods.find(m => m.id === selectedDifferentMethod)?.label || "Select method"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200 mt-2">
                    <span className="text-gray-600">New Status</span>
                    <span className={cn(
                      "font-medium",
                      newInvoiceStatus === "Refunded" ? "text-red-600" : "text-orange-600"
                    )}>
                      {newInvoiceStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Confirm Refund</h3>
                <p className="text-sm text-gray-600">Please review the details below</p>
              </div>

              {/* Refund Summary Card */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 rounded-lg p-5 space-y-3">
                <div className="text-center">
                  <p className="text-xs text-orange-600 font-medium mb-1">Refund Amount</p>
                  <p className="text-4xl font-bold text-orange-600">${refundAmount.toFixed(2)}</p>
                </div>
              </div>

              {/* Confirmation Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Invoice</span>
                    <span className="font-mono font-semibold text-gray-900">{activeInvoice.id}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Customer</span>
                    <span className="font-medium text-gray-900 text-right">{activeInvoice.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Refund Method</span>
                    <span className="font-medium text-gray-900">
                      {refundMethodOption === "original" 
                        ? activeInvoice.paymentMethod || "Original" 
                        : differentPaymentMethods.find(m => m.id === selectedDifferentMethod)?.label || "Select method"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Reason</span>
                    <span className="text-gray-700 text-right max-w-xs line-clamp-2">{refundReason}</span>
                  </div>
                </div>
              </div>

              {/* Impact Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <p className="text-xs font-semibold text-blue-900 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  After this refund:
                </p>
                <div className="text-xs text-blue-800 space-y-1 pl-6">
                  <p>• Invoice status will change to "{newInvoiceStatus}"</p>
                  <p>• Remaining balance: <span className="font-semibold">${(refundableAmount - refundAmount).toFixed(2)}</span></p>
                  <p>• Refund will be processed immediately</p>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-5 pt-3 pb-4 border-t border-gray-200 shrink-0 safe-bottom shadow-[0_-1px_0_rgba(229,231,235,0.9)]">
          {currentStep === 1 ? (
            <Button
              onClick={handleContinue}
              disabled={!isStep1Valid}
              className={cn(
                "w-full h-12 rounded-xl text-sm font-semibold transition-all mb-3",
                isStep1Valid
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              Continue
            </Button>
          ) : currentStep === 2 ? (
            <Button
              onClick={handleContinue}
              disabled={!isStep2Valid}
              className={cn(
                "w-full h-12 rounded-xl text-sm font-semibold transition-all mb-3",
                isStep2Valid
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              Review Refund
            </Button>
          ) : (
            <Button
              onClick={processRefund}
              disabled={isProcessing}
              className={cn(
                "w-full h-12 rounded-xl text-sm font-semibold transition-all mb-3",
                !isProcessing
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                `Process Refund • $${refundAmount.toFixed(2)}`
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RefundModal;
