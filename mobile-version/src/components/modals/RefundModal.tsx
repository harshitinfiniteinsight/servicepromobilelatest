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
    return true;
  }, [refundMethodOption, selectedDifferentMethod, bankAccountName, bankAccountNumber]);

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
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden [&>div]:p-0 [&>button]:hidden">
          <DialogTitle className="sr-only">Refund Successful</DialogTitle>
          <DialogDescription className="sr-only">Your refund has been processed</DialogDescription>
          
          <div className="bg-white px-5 py-12 text-center rounded-2xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-in zoom-in duration-300">
              <Check className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Refund Successful!</h3>
            <p className="text-base text-gray-600 mb-1">
              ${refundAmount.toFixed(2)} refunded
            </p>
            <p className="text-sm text-gray-500">
              Invoice {activeInvoice.id} • {activeInvoice.customerName}
            </p>
            <p className="text-xs text-gray-400 mt-3">
              Status updated to: <span className="font-medium text-gray-600">{newInvoiceStatus}</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden flex flex-col [&>div]:p-0 [&>button]:hidden">
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
          <div className="text-center">
            <h2 className="text-base font-semibold text-gray-900">
              {source === "job" ? `Refund for Job ID: ${jobId}` : "Refund Invoice"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Step {currentStep} of 2
            </p>
          </div>
          <button 
            onClick={handleClose} 
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isProcessing}
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-white px-4 py-4 space-y-4">
          {/* Invoice Selector - Show when source is "job" and multiple invoices */}
          {source === "job" && allInvoices.length > 0 && (
            <div className="space-y-1.5">
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
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Invoice Info Card */}
          <div className="text-center py-3 px-3 bg-gray-50 rounded-lg border border-gray-200 mt-4">
            <p className="text-xs text-gray-500 mb-1">{activeInvoice.id}</p>
            <p className="text-xl font-bold text-gray-900">${paidAmount.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-0.5">{activeInvoice.customerName}</p>
            {activeInvoice.paymentMethod && (
              <p className="text-xs text-gray-500 mt-1">
                Paid via {activeInvoice.paymentMethod}
              </p>
            )}
            {alreadyRefunded > 0 && (
              <p className="text-xs text-orange-600 mt-1.5">
                Refundable: ${refundableAmount.toFixed(2)}
              </p>
            )}
          </div>

          {/* Step 1: Refund Type */}
          {currentStep === 1 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Select Refund Type</h3>
              
              {/* Full Refund Option */}
              <button
                type="button"
                onClick={() => setRefundType("full")}
                className={cn(
                  "w-full p-3 rounded-lg border text-left transition-all",
                  refundType === "full"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Full Refund</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ${refundableAmount.toFixed(2)}
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
                  "w-full p-3 rounded-lg border text-left transition-all",
                  refundType === "partial"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
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
                <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
                  <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
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
                      className={cn(
                        "pl-7 h-10 rounded-lg border-gray-200 text-sm",
                        amountError && "border-red-500 focus:ring-red-500"
                      )}
                    />
                  </div>
                  {amountError && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {amountError}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1.5">
                    Max: ${refundableAmount.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Reason for Refund */}
              <div className="space-y-2 pt-2">
                <Label className="text-sm font-semibold text-gray-900">
                  Reason for Refund <span className="text-red-500">*</span>
                </Label>
                <textarea
                  value={refundReason}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 300);
                    setRefundReason(value);
                  }}
                  placeholder="Enter reason for refund"
                  className={cn(
                    "w-full p-3 rounded-lg border text-sm font-normal resize-none focus:outline-none focus:ring-2 transition-all",
                    reasonError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:ring-orange-500"
                  )}
                  style={{ minHeight: '80px' }}
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
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Select Refund Method</h3>
              
              {/* Original Payment Method Option */}
              <button
                type="button"
                onClick={() => {
                  setRefundMethodOption("original");
                  setSelectedDifferentMethod(null);
                }}
                className={cn(
                  "w-full p-3 rounded-lg border text-left transition-all",
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
                  "w-full p-3 rounded-lg border text-left transition-all",
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
                <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg space-y-3">
                  <Label className="text-xs font-medium text-gray-700 block">
                    Select Payment Method
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {differentPaymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedDifferentMethod(method.id)}
                        className={cn(
                          "p-3 rounded-xl border-2 text-center transition-all",
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
                </div>
              )}

              {/* Summary Section */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Refund Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Invoice</span>
                    <span className="font-medium text-gray-900">{invoice.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Customer</span>
                    <span className="font-medium text-gray-900">{invoice.customerName}</span>
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
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-4 py-3 border-t border-gray-200 shrink-0 safe-bottom">
          {currentStep === 1 ? (
            <Button
              onClick={handleContinue}
              disabled={!isStep1Valid}
              className={cn(
                "w-full h-11 rounded-lg text-sm font-semibold transition-all",
                isStep1Valid
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={processRefund}
              disabled={!isStep2Valid || isProcessing}
              className={cn(
                "w-full h-11 rounded-lg text-sm font-semibold transition-all",
                isStep2Valid && !isProcessing
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                `Confirm Refund • $${refundAmount.toFixed(2)}`
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RefundModal;
