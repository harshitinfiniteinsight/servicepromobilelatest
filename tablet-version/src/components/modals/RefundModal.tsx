import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  payment_method?: string;
  payment?: {
    method?: string;
    payment_method?: string;
    method_details?: {
      card?: {
        last4?: string;
      };
    };
    payment_method_details?: {
      card?: {
        last4?: string;
      };
    };
  };
  payment_method_details?: {
    card?: {
      last4?: string;
    };
  };
  paymentMethodDetails?: {
    card?: {
      last4?: string;
    };
  };
  cardBrand?: string;
  cardLast4?: string;
  transactionId?: string;
  status: string;
  refundedAmount?: number;
}

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: RefundInvoiceData;
  onRefundComplete?: (invoiceId: string, refundAmount: number, newStatus: string) => void;
  mode?: "job" | "invoice";
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
  transactionNotes?: string;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    routingNumber?: string;
  };
  checkDetails?: {
    checkNumber: string;
    comment?: string;
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
  { id: "card", label: "Card", icon: CreditCard },
  { id: "check", label: "Check", icon: Banknote },
];

const RefundModal = ({ isOpen, onClose, invoice, onRefundComplete, mode, source = "invoice", jobId, allInvoices = [] }: RefundModalProps) => {
  const effectiveMode = mode ?? source;

  // Step management
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  // Filter invoices to show only paid ones for refund
  const paidInvoices = useMemo(() => {
    if (effectiveMode === "job") {
      return allInvoices.filter(inv => inv.status === "Paid" || inv.status === "paid");
    }
    return allInvoices;
  }, [effectiveMode, allInvoices]);
  
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
  
  // Card details (when different method is card)
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  
  // Check details (when different method is check)
  const [checkNumber, setCheckNumber] = useState("");
  const [checkComment, setCheckComment] = useState("");
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Determine active invoice (either selected from job list or passed directly)
  const activeInvoice = effectiveMode === "job" && selectedInvoice ? selectedInvoice : invoice;

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

  // Check if refund method is Check (for both original and different method)
  const isCheckRefund = useMemo(() => {
    const originalMethod = (activeInvoice.paymentMethod || "").toLowerCase();
    const isOriginalCheck = refundMethodOption === "original" && originalMethod.includes("check");
    const isDifferentCheck = refundMethodOption === "different" && selectedDifferentMethod === "check";
    return isOriginalCheck || isDifferentCheck;
  }, [refundMethodOption, selectedDifferentMethod, activeInvoice.paymentMethod]);

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
      setCardNumber("");
      setCardHolderName("");
      setExpiryDate("");
      setCvv("");
      setCheckNumber("");
      setCheckComment("");
      setIsProcessing(false);
      setShowSuccess(false);
      
      // For job source: pre-select first paid invoice from the list
      if (effectiveMode === "job") {
        if (paidInvoices && paidInvoices.length > 0) {
          setSelectedInvoice(paidInvoices[0]);
        } else if (invoice) {
          // Fallback to the provided invoice so validation doesn't block
          // when paidInvoices filtering returns an empty list.
          setSelectedInvoice(invoice);
        }
      }
    }
  }, [isOpen, effectiveMode, paidInvoices]);

  // Check if step 1 is valid to proceed
  const isStep1Valid = useMemo(() => {
    // For job source: require invoice selection only when selector is visible/populated
    if (effectiveMode === "job" && paidInvoices.length > 0 && !selectedInvoice) return false;
    
    if (!refundReason.trim()) return false;
    if (refundType === "full") return true;
    const parsed = parseFloat(partialAmount);
    return !isNaN(parsed) && parsed > 0 && parsed <= refundableAmount;
  }, [effectiveMode, paidInvoices.length, selectedInvoice, refundType, partialAmount, refundableAmount, refundReason]);

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
    // Check fields validation (for both original and different method)
    if (isCheckRefund) {
      return checkNumber.trim() !== "";
    }
    
    if (refundMethodOption === "original") return true;
    if (!selectedDifferentMethod) return false;
    if (selectedDifferentMethod === "card") {
      return cardNumber.replace(/\s/g, "").length === 16 && 
             cardHolderName.trim() !== "" && 
             expiryDate.length === 5 && 
             cvv.length >= 3;
    }
    return true;
  }, [refundMethodOption, selectedDifferentMethod, cardNumber, cardHolderName, expiryDate, cvv, checkNumber, isCheckRefund]);

  // Get payment method icon
  const getPaymentMethodIcon = (method: string | undefined) => {
    if (!method) return Wallet;
    return paymentMethodIcons[method] || Wallet;
  };

  const getInvoicePaymentSummaryLabel = (invoiceData: RefundInvoiceData) => {
    const method = (invoiceData.paymentMethod || invoiceData.payment?.method || "").trim();
    const normalizedMethod = method.toLowerCase();
    const paymentMethodCode = (invoiceData.payment_method || invoiceData.payment?.payment_method || "").trim().toLowerCase();

    const extractedLast4FromMethod = method.match(/\((\d{4})\)/)?.[1]
      || method.match(/\b(\d{4})\b/)?.[1];
    const last4FromDetails =
      invoiceData.payment?.method_details?.card?.last4 ||
      invoiceData.payment?.payment_method_details?.card?.last4 ||
      invoiceData.payment_method_details?.card?.last4 ||
      invoiceData.paymentMethodDetails?.card?.last4;
    const last4 = last4FromDetails || invoiceData.cardLast4 || extractedLast4FromMethod;
    const effectiveLast4 = last4 || "2345";

    if (paymentMethodCode === "card") {
      return `Card (${effectiveLast4})`;
    }

    const extractedBrandFromMethod =
      /visa/i.test(method) ? "Visa" :
      /master\s*card|mastercard/i.test(method) ? "Mastercard" :
      /amex|american\s*express/i.test(method) ? "Amex" :
      /discover/i.test(method) ? "Discover" :
      "";

    const hasCardSignal = Boolean(
      invoiceData.cardBrand ||
      invoiceData.cardLast4 ||
      extractedBrandFromMethod ||
      normalizedMethod.includes("card")
    );

    if (hasCardSignal) {
      const brand = invoiceData.cardBrand || extractedBrandFromMethod || "Card";
      return `${brand} (${effectiveLast4})`;
    }

    return method || "Payment pending";
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
        // Process refund directly
        processRefund();
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

      // Build transaction notes
      let transactionNotes = refundReason.trim();
      
      // Add check details if refund method is check
      if (isCheckRefund && checkNumber.trim()) {
        const checkDetailsText = `\n\nRefund Method: Check\nCheck Number: ${checkNumber.trim()}`;
        const commentText = checkComment.trim() ? `\nComment: ${checkComment.trim()}` : "";
        transactionNotes += checkDetailsText + commentText;
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
        transactionNotes: transactionNotes,
      };
      
      // Add check details if refund method is check (for both original and different method)
      if (isCheckRefund) {
        refundRecord.checkDetails = {
          checkNumber: checkNumber.trim(),
          comment: checkComment.trim() || undefined,
        };
      }

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
              A confirmation email has been sent to {activeInvoice.customerName}
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
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-[390px] md:w-[60vw] md:max-w-[640px] md:min-w-[520px] mx-auto p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden !flex !flex-col [&>button]:hidden">
        <DialogTitle className="sr-only">Refund Invoice</DialogTitle>
        <DialogDescription className="sr-only">Process refund for invoice {invoice.id}</DialogDescription>
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white border-b border-gray-200 px-4 py-3 md:px-8 md:py-4 shrink-0">
          <button 
            onClick={handleBack} 
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isProcessing}
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-base md:text-lg font-semibold text-gray-900">
            {effectiveMode === "job" ? `Refund for Job ID: ${jobId}` : "Refund Invoice"}
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
          <div className="px-5 py-5 pb-6 md:px-8 md:py-8 md:pb-8 space-y-5 pointer-events-auto">
            {/* Invoice Selector - Show when source is "job" and multiple invoices */}
          {effectiveMode === "job" && paidInvoices.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">
                Select Invoice to Refund <span className="text-red-500">*</span>
              </Label>
              <select
                value={selectedInvoice?.id || ""}
                onChange={(e) => {
                  const selected = paidInvoices.find(inv => inv.id === e.target.value);
                  setSelectedInvoice(selected || null);
                  setPartialAmount("");
                  setAmountError("");
                }}
                disabled={isProcessing}
                className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Choose an invoice --</option>
                {paidInvoices.map((inv) => (
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
          <div className="p-4 md:p-5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Invoice</p>
                <p className="text-sm font-semibold text-gray-900">{activeInvoice.id}</p>
                <p className="text-xs text-gray-600">{activeInvoice.customerName}</p>
              </div>
              <div className="space-y-1 md:text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Payment Details</p>
                <p className="text-lg font-bold text-gray-900">${paidAmount.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{getInvoicePaymentSummaryLabel(activeInvoice)}</p>
              </div>
            </div>
          </div>

          {/* Step 1: Refund Amount */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-gray-900">Refund Amount</h3>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                {/* Full Refund Option */}
                <button
                  type="button"
                  onClick={() => {
                    setRefundType("full");
                    setPartialAmount("");
                    setAmountError("");
                  }}
                  className={cn(
                    "w-full p-4 rounded-lg border text-left transition-all h-full min-h-[104px]",
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
                    "w-full p-4 rounded-lg border text-left transition-all h-full min-h-[104px]",
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
              </div>

              {/* Partial Amount Input */}
              {refundType === "partial" && (
                <div className="space-y-4">
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
              <div className="space-y-3 pt-1">
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
                  rows={5}
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
                    minHeight: '120px',
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
            <div className="space-y-5">
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
                        {getInvoicePaymentSummaryLabel(activeInvoice)}
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
                <div className="p-4 md:p-5 bg-white border border-gray-200 rounded-lg space-y-4 md:space-y-5">
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

                  {/* Card Details */}
                  {selectedDifferentMethod === "card" && (
                    <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
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
                  
                  {/* Check Details - for Different Method */}
                  {selectedDifferentMethod === "check" && (
                    <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                          Check Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          value={checkNumber}
                          onChange={(e) => setCheckNumber(e.target.value)}
                          placeholder="Enter check number"
                          className="h-11 rounded-xl border-gray-200 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                          Comment
                        </Label>
                        <Textarea
                          value={checkComment}
                          onChange={(e) => setCheckComment(e.target.value)}
                          placeholder="Add a comment"
                          className="min-h-[80px] rounded-xl border-gray-200 text-sm resize-none"
                          rows={3}
                        />
                        <p className="text-xs text-gray-500 mt-1.5">
                          This will be saved as notes for future reference.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Check Details - for Original Payment Method when it's Check */}
              {refundMethodOption === "original" && isCheckRefund && (
                <div className="p-4 md:p-5 bg-white border border-gray-200 rounded-lg space-y-4 mt-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                      Check Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={checkNumber}
                      onChange={(e) => setCheckNumber(e.target.value)}
                      placeholder="Enter check number"
                      className="h-11 rounded-xl border-gray-200 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                      Comment
                    </Label>
                    <Textarea
                      value={checkComment}
                      onChange={(e) => setCheckComment(e.target.value)}
                      placeholder="Add a comment"
                      className="min-h-[80px] rounded-xl border-gray-200 text-sm resize-none"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      This will be saved as notes for future reference.
                    </p>
                  </div>
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
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-5 pt-3 pb-4 md:px-8 md:pt-4 md:pb-5 border-t border-gray-200 shrink-0 safe-bottom shadow-[0_-1px_0_rgba(229,231,235,0.9)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Button
              onClick={handleClose}
              disabled={isProcessing}
              variant="outline"
              className="h-12 rounded-xl text-sm font-semibold border-gray-300 text-gray-700 hover:bg-gray-50 md:w-[48%]"
            >
              Cancel
            </Button>

            <Button
              onClick={handleContinue}
              disabled={currentStep === 1 ? !isStep1Valid : !isStep2Valid || isProcessing}
              className={cn(
                "h-12 rounded-xl text-sm font-semibold transition-all md:w-[48%]",
                currentStep === 2 && isProcessing
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              )}
            >
              {currentStep === 2 && isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : currentStep === 1 ? (
                "Continue"
              ) : (
                `Process Refund • $${refundAmount.toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RefundModal;
