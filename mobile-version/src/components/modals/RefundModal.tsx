import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  Wallet,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

export interface RefundDocumentData {
  id: string;
  type: "invoice" | "agreement";
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

export type RefundInvoiceData = RefundDocumentData;

export interface RefundProcessedDocument {
  id: string;
  type: "invoice" | "agreement";
  refundAmount: number;
  newStatus: string;
}

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: RefundDocumentData;
  onRefundComplete?: (documents: RefundProcessedDocument[], totalRefundAmount: number) => void;
  mode?: "job" | "invoice";
  source?: "job" | "invoice";
  jobId?: string;
  allInvoices?: RefundDocumentData[];
  allDocuments?: RefundDocumentData[];
}

type RefundType = "full" | "partial";
type RefundMethodOption = "original" | "different";
type PaymentMethodType = "cash" | "bank_transfer" | "card" | "check";

interface RefundRecord {
  invoiceId?: string;
  documentIds: string[];
  documents: RefundProcessedDocument[];
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

const DEMO_CARD_LAST4 = "2345";

const toCents = (value: number) => Math.round(value * 100);
const fromCents = (valueInCents: number) => valueInCents / 100;
const parseCurrencyInput = (value: string) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

const RefundModal = ({
  isOpen,
  onClose,
  invoice,
  onRefundComplete,
  mode,
  source = "invoice",
  jobId,
  allInvoices = [],
  allDocuments = [],
}: RefundModalProps) => {
  const effectiveMode = mode ?? source;
  const [documentDropdownOpen, setDocumentDropdownOpen] = useState(false);

  const getDocumentKey = (document: RefundDocumentData) => `${document.type}:${document.id}`;

  const getRefundableAmountForDocument = (document: RefundDocumentData) => {
    const paid = Number(document.paidAmount ?? document.amount ?? 0);
    const refunded = Number(document.refundedAmount || 0);
    return Math.max(paid - refunded, 0);
  };

  const isRefundableDocument = (document: RefundDocumentData) => {
    const normalizedStatus = (document.status || "").trim().toLowerCase();
    return (normalizedStatus === "paid" || normalizedStatus === "partially refunded" || normalizedStatus === "partial")
      && getRefundableAmountForDocument(document) > 0;
  };

  const getDocumentTypeLabel = (type: RefundDocumentData["type"]) =>
    type === "agreement" ? "Agreement" : "Invoice";

  // Step management
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  const mergedDocuments = useMemo(() => {
    const sourceDocuments = effectiveMode === "job"
      ? (allDocuments.length > 0 ? allDocuments : allInvoices)
      : [invoice];

    const uniqueDocuments = new Map<string, RefundDocumentData>();
    sourceDocuments.forEach((document) => {
      if (!document?.id) return;
      uniqueDocuments.set(getDocumentKey(document), {
        ...document,
        type: document.type || "invoice",
      });
    });

    return Array.from(uniqueDocuments.values());
  }, [effectiveMode, allDocuments, allInvoices, invoice]);

  const refundableDocuments = useMemo(
    () => mergedDocuments.filter(isRefundableDocument),
    [mergedDocuments]
  );

  const [selectedDocumentKeys, setSelectedDocumentKeys] = useState<string[]>([]);
  
  // Step 1 - Refund Type
  const [refundType, setRefundType] = useState<RefundType>("full");
  const [partialAmount, setPartialAmount] = useState("");
  const [partialAmountByDocument, setPartialAmountByDocument] = useState<Record<string, string>>({});
  const [partialAmountErrorsByDocument, setPartialAmountErrorsByDocument] = useState<Record<string, string>>({});
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

  const selectedDocuments = useMemo(() => {
    if (selectedDocumentKeys.length === 0 && effectiveMode !== "job") {
      return [invoice];
    }

    const selected = refundableDocuments.filter((document) => selectedDocumentKeys.includes(getDocumentKey(document)));
    return selected.length > 0 ? selected : (effectiveMode === "job" ? [] : [invoice]);
  }, [selectedDocumentKeys, effectiveMode, refundableDocuments, invoice]);

  const activeInvoice = selectedDocuments[0] || invoice;

  const totalSelectedAmount = useMemo(
    () => selectedDocuments.reduce((sum, document) => sum + getRefundableAmountForDocument(document), 0),
    [selectedDocuments]
  );

  const totalAvailableRefund = totalSelectedAmount;

  const enteredRefundTotal = useMemo(() => {
    if (refundType === "full") {
      return totalAvailableRefund;
    }

    if (selectedDocuments.length > 1) {
      return selectedDocuments.reduce((sum, document) => {
        const documentKey = getDocumentKey(document);
        const parsed = parseCurrencyInput(partialAmountByDocument[documentKey] || "");
        return sum + (isNaN(parsed) ? 0 : parsed);
      }, 0);
    }

    const parsed = parseCurrencyInput(partialAmount);
    return isNaN(parsed) ? 0 : parsed;
  }, [refundType, partialAmount, partialAmountByDocument, selectedDocuments, totalAvailableRefund]);

  // Computed refund amount used by allocations/payload (capped at available amount)
  const refundAmount = useMemo(() => {
    const cappedInCents = Math.min(toCents(enteredRefundTotal), toCents(totalAvailableRefund));
    return fromCents(cappedInCents);
  }, [enteredRefundTotal, totalAvailableRefund]);

  // Remaining = total available - entered refund total (never below zero)
  const remainingAmount = useMemo(() => {
    const remainingInCents = Math.max(toCents(totalAvailableRefund) - toCents(enteredRefundTotal), 0);
    return fromCents(remainingInCents);
  }, [totalAvailableRefund, enteredRefundTotal]);

  const refundAllocations = useMemo<RefundProcessedDocument[]>(() => {
    return selectedDocuments
      .map((document) => {
        const refundableAmount = getRefundableAmountForDocument(document);
        const documentKey = getDocumentKey(document);

        let allocatedAmount = 0;
        if (refundType === "full") {
          allocatedAmount = refundableAmount;
        } else if (selectedDocuments.length > 1) {
          const parsed = parseFloat(partialAmountByDocument[documentKey] || "");
          allocatedAmount = isNaN(parsed) ? 0 : Math.min(parsed, refundableAmount);
        } else {
          allocatedAmount = Math.min(refundAmount, refundableAmount);
        }

        const paidAmount = Number(document.paidAmount ?? document.amount ?? 0);
        const alreadyRefunded = Number(document.refundedAmount || 0);
        const totalRefundedAfter = alreadyRefunded + allocatedAmount;

        return {
          id: document.id,
          type: document.type,
          refundAmount: allocatedAmount,
          newStatus: totalRefundedAfter >= paidAmount ? "Refunded" : "Partially Refunded",
        };
      })
      .filter((allocation) => allocation.refundAmount > 0);
  }, [selectedDocuments, partialAmountByDocument, refundAmount, refundType]);

  const selectedStatusSummary = useMemo(() => {
    if (refundAllocations.length === 0) return "Pending";
    const allRefunded = refundAllocations.every((allocation) => allocation.newStatus === "Refunded");
    return allRefunded ? "Refunded" : "Partially Refunded";
  }, [refundAllocations]);

  const documentDropdownLabel = useMemo(() => {
    if (refundableDocuments.length === 0) {
      return "No refundable documents";
    }

    if (selectedDocumentKeys.length === refundableDocuments.length) {
      return `All selected (${selectedDocumentKeys.length})`;
    }

    if (selectedDocumentKeys.length === 0) {
      return "Select Invoice/Agreement to Refund";
    }

    return `${selectedDocumentKeys.length} selected`;
  }, [refundableDocuments.length, selectedDocumentKeys.length]);

  const allDocumentsSelected = refundableDocuments.length > 0 && selectedDocumentKeys.length === refundableDocuments.length;

  // Check if refund method is Check (for both original and different method).
  // For "original": check if ANY selected document was paid by check.
  const isCheckRefund = useMemo(() => {
    if (refundMethodOption === "different") {
      return selectedDifferentMethod === "check";
    }
    if (refundMethodOption === "original") {
      return selectedDocuments.some(doc =>
        (doc.paymentMethod || doc.payment?.method || "").toLowerCase().includes("check")
      );
    }
    return false;
  }, [refundMethodOption, selectedDifferentMethod, selectedDocuments]);

  // Check if refund method is Cash (different method only)
  const isCashRefund = useMemo(() => {
    return refundMethodOption === "different" && selectedDifferentMethod === "cash";
  }, [refundMethodOption, selectedDifferentMethod]);

  // Keep per-document partial map in sync with currently selected documents
  useEffect(() => {
    if (refundType !== "partial") {
      setPartialAmountErrorsByDocument({});
      return;
    }

    setPartialAmountByDocument((prev) => {
      const next: Record<string, string> = {};

      selectedDocuments.forEach((document) => {
        const documentKey = getDocumentKey(document);
        const refundableAmount = getRefundableAmountForDocument(document);
        const existing = prev[documentKey] ?? "";
        const parsed = parseFloat(existing);

        if (existing === "" || isNaN(parsed)) {
          next[documentKey] = existing;
        } else {
          next[documentKey] = String(Math.min(parsed, refundableAmount));
        }
      });

      return next;
    });
  }, [refundType, selectedDocuments]);

  // Validate partial amount
  useEffect(() => {
    if (refundType === "partial") {
      if (selectedDocuments.length > 1) {
        const nextErrors: Record<string, string> = {};
        let hasInvalidValue = false;
        let sumInCents = 0;

        selectedDocuments.forEach((document) => {
          const documentKey = getDocumentKey(document);
          const rawValue = partialAmountByDocument[documentKey] || "";
          const refundableAmount = getRefundableAmountForDocument(document);

          if (!rawValue) {
            return;
          }

          const parsed = parseCurrencyInput(rawValue);
          if (isNaN(parsed)) {
            nextErrors[documentKey] = "Enter a valid amount";
            hasInvalidValue = true;
            return;
          }

          if (parsed < 0) {
            nextErrors[documentKey] = "Amount cannot be negative";
            hasInvalidValue = true;
            return;
          }

          if (parsed > refundableAmount) {
            nextErrors[documentKey] = `Cannot exceed $${refundableAmount.toFixed(2)}`;
            hasInvalidValue = true;
            return;
          }

          sumInCents += toCents(parsed);
        });

        setPartialAmountErrorsByDocument(nextErrors);

        const totalSelectedInCents = toCents(totalSelectedAmount);

        if (hasInvalidValue) {
          setAmountError("Please fix per-invoice refund amounts");
        } else if (sumInCents <= 0) {
          setAmountError("Enter at least one invoice refund amount greater than $0");
        } else if (sumInCents > totalSelectedInCents) {
          setAmountError(`Cannot exceed selected total of $${totalSelectedAmount.toFixed(2)}`);
        } else {
          setAmountError("");
        }

        return;
      }

      const parsed = parseCurrencyInput(partialAmount);
      if (!partialAmount) {
        setAmountError("");
      } else if (isNaN(parsed)) {
        setAmountError("Please enter a valid amount");
      } else if (parsed <= 0) {
        setAmountError("Amount must be greater than $0");
      } else if (toCents(parsed) > toCents(totalSelectedAmount)) {
        setAmountError(`Cannot exceed $${totalSelectedAmount.toFixed(2)}`);
      } else {
        setAmountError("");
      }
    } else {
      setAmountError("");
      setPartialAmountErrorsByDocument({});
    }
  }, [partialAmount, partialAmountByDocument, refundType, selectedDocuments, totalSelectedAmount]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setRefundType("full");
      setPartialAmount("");
      setPartialAmountByDocument({});
      setPartialAmountErrorsByDocument({});
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

      if (effectiveMode === "job") {
        setSelectedDocumentKeys(refundableDocuments.map((document) => getDocumentKey(document)));
      } else {
        setSelectedDocumentKeys([getDocumentKey(invoice)]);
      }
    }
  }, [isOpen, effectiveMode, refundableDocuments, invoice]);

  // Check if step 1 is valid to proceed
  const isStep1Valid = useMemo(() => {
    if (selectedDocuments.length === 0) return false;
    
    if (!refundReason.trim()) return false;
    if (refundType === "full") return true;

    if (selectedDocuments.length > 1) {
      if (Object.keys(partialAmountErrorsByDocument).length > 0) return false;
      return amountError === "" && enteredRefundTotal > 0 && toCents(enteredRefundTotal) <= toCents(totalSelectedAmount);
    }

    const parsed = parseCurrencyInput(partialAmount);
    return !isNaN(parsed) && parsed > 0 && parsed <= totalSelectedAmount;
  }, [selectedDocuments.length, refundType, partialAmount, totalSelectedAmount, refundReason, partialAmountErrorsByDocument, amountError, enteredRefundTotal]);

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
    const effectiveLast4 = last4 || DEMO_CARD_LAST4;

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

  // Get original payment method for a document
  const getDocumentOriginalPaymentMethod = (document: RefundDocumentData): string => {
    return (document.paymentMethod || document.payment?.method || "Unknown").trim();
  };

  // Get unique original payment methods from selected documents
  const selectedDocumentsMethods = useMemo(() => {
    return selectedDocuments.map((doc) => getDocumentOriginalPaymentMethod(doc));
  }, [selectedDocuments]);

  // Check if all selected documents have the same original payment method
  const allDocumentsSameMethod = useMemo(() => {
    if (selectedDocumentsMethods.length === 0) return true;
    const firstMethod = selectedDocumentsMethods[0].toLowerCase();
    return selectedDocumentsMethods.every((method) => method.toLowerCase() === firstMethod);
  }, [selectedDocumentsMethods]);

  // Get unique payment methods for summary
  const uniqueSelectedMethods = useMemo(() => {
    return Array.from(new Set(selectedDocumentsMethods.map((m) => m.toLowerCase())));
  }, [selectedDocumentsMethods]);

  // hasMixedMethods: true when selected documents have different original payment methods.
  // When true, "Original Payment Method" still works — each invoice is refunded to its own method.
  const hasMixedMethods = useMemo(() => {
    return !allDocumentsSameMethod && selectedDocuments.length > 1;
  }, [allDocumentsSameMethod, selectedDocuments.length]);

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

      // Build refund method information per document
      interface DocumentRefundInfo {
        document: RefundDocumentData;
        allocation: RefundProcessedDocument;
        originalPaymentMethod: string;
        effectiveRefundMethod: RefundMethodOption;
      }

      const documentRefundInfos: DocumentRefundInfo[] = refundAllocations.map((allocation) => {
        const document = selectedDocuments.find((d) => d.id === allocation.id && d.type === allocation.type);
        if (!document) {
          throw new Error(`Document not found for allocation: ${allocation.id}`);
        }

        // Determine effective refund method for this document
        let effectiveRefundMethod: RefundMethodOption = refundMethodOption;
        let originalPaymentMethod = getDocumentOriginalPaymentMethod(document);

        return {
          document,
          allocation,
          originalPaymentMethod,
          effectiveRefundMethod,
        };
      });

      // Determine refund method string for logging
      let refundMethodString: string;
      if (refundMethodOption === "different" && selectedDifferentMethod) {
        const methodLabel = differentPaymentMethods.find(m => m.id === selectedDifferentMethod)?.label;
        refundMethodString = methodLabel || selectedDifferentMethod;
      } else if (refundMethodOption === "original") {
        // For original method, show all methods used
        refundMethodString = uniqueSelectedMethods.length > 1
          ? `Multiple methods: ${uniqueSelectedMethods.join(", ")}`
          : (activeInvoice.paymentMethod || "Unknown");
      } else {
        refundMethodString = "Unknown";
      }

      // Build transaction notes
      let transactionNotes = refundReason.trim();
      
      // Add check details if refund method is check
      if (isCheckRefund && checkNumber.trim()) {
        const checkDetailsText = `\n\nRefund Method: Check\nCheck Number: ${checkNumber.trim()}`;
        const commentText = checkComment.trim() ? `\nComment: ${checkComment.trim()}` : "";
        transactionNotes += checkDetailsText + commentText;
      }

      // Add cash comment if refund method is cash
      if (isCashRefund && checkComment.trim()) {
        transactionNotes += `\n\nRefund Method: Cash\nComment: ${checkComment.trim()}`;
      }

      // Add per-document method information to notes if mixed methods
      if (refundMethodOption === "original" && documentRefundInfos.length > 1) {
        transactionNotes += "\n\nPer-Document Refund Methods:\n";
        documentRefundInfos.forEach((info) => {
          transactionNotes += `- ${info.document.id}: ${info.originalPaymentMethod} (Refund: $${info.allocation.refundAmount.toFixed(2)})\n`;
        });
      }

      // Create refund record (would be sent to backend)
      const refundRecord: RefundRecord = {
        invoiceId: activeInvoice.id,
        documentIds: refundAllocations.map((allocation) => allocation.id),
        documents: refundAllocations,
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

      // Log for development - show per-document routing
      console.log("Processing refund with per-document methods:", {
        refundRecord,
        documentMethods: documentRefundInfos.map((info) => ({
          documentId: info.document.id,
          type: info.document.type,
          originalMethod: info.originalPaymentMethod,
          refundAmount: info.allocation.refundAmount,
        })),
      });

      // Store refund record in localStorage (simulating backend)
      const existingRefunds = JSON.parse(localStorage.getItem("refunds") || "[]");
      existingRefunds.push(refundRecord);
      localStorage.setItem("refunds", JSON.stringify(existingRefunds));

      // Show success state
      setShowSuccess(true);
      
      // After brief delay, close and notify
      setTimeout(() => {
        showSuccessToast(`Refund of $${refundAmount.toFixed(2)} processed successfully`);
        onRefundComplete?.(refundAllocations, refundAmount);
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
                <span className="font-medium">{selectedDocuments.length}</span> selected {selectedDocuments.length === 1 ? "document" : "documents"}
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
                <span className="text-xs text-gray-600 font-medium">Refund Status</span>
                <span className={cn(
                  "text-xs font-semibold",
                  selectedStatusSummary === "Refunded" ? "text-red-600" : "text-orange-600"
                )}>
                  {selectedStatusSummary}
                </span>
              </div>
              {remainingAmount > 0 && (
                <div className="flex items-start justify-between pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-600 font-medium">Remaining Refundable</span>
                  <span className="text-xs font-semibold text-green-600">
                    ${remainingAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Info Message */}
            <p className="text-xs text-gray-600 mb-6">
              A confirmation email has been sent to {activeInvoice.customerName}
            </p>

            {/* Per-Document Refund Details (if original method with multiple docs) */}
            {refundMethodOption === "original" && selectedDocuments.length > 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 space-y-2">
                <p className="text-xs font-semibold text-blue-900 mb-3">Per-Document Refund Details</p>
                {refundAllocations.map((allocation) => {
                  const doc = selectedDocuments.find((d) => d.id === allocation.id && d.type === allocation.type);
                  const method = doc ? getDocumentOriginalPaymentMethod(doc) : "Unknown";
                  return (
                    <div key={`${allocation.type}-${allocation.id}`} className="flex justify-between text-xs bg-white p-2 rounded border border-blue-100">
                      <div>
                        <p className="font-medium text-gray-900">{allocation.id}</p>
                        <p className="text-gray-500">{method}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">${allocation.refundAmount.toFixed(2)}</p>
                        <p className={cn(
                          "text-xs",
                          allocation.newStatus === "Refunded" ? "text-red-600" : "text-orange-600"
                        )}>
                          {allocation.newStatus}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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
        <DialogTitle className="sr-only">Refund Documents</DialogTitle>
        <DialogDescription className="sr-only">Process refund for selected documents</DialogDescription>
        
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
            {effectiveMode === "job" ? `Refund for Job ID: ${jobId}` : "Refund Document"}
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
            {/* Document Selector - Multi-select for job refunds */}
          {effectiveMode === "job" && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">
                Select Invoice/Agreement to Refund <span className="text-red-500">*</span>
              </Label>
              {refundableDocuments.length === 0 ? (
                <p className="text-xs text-gray-500">No refundable documents available.</p>
              ) : (
                <Popover open={documentDropdownOpen} onOpenChange={setDocumentDropdownOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full min-h-11 h-auto justify-between px-4 py-3 rounded-xl"
                    >
                      <span className="truncate">{documentDropdownLabel}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl" align="start">
                    <div className="max-h-64 overflow-y-auto py-1">
                      <label className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b">
                        <Checkbox
                          checked={allDocumentsSelected}
                          onCheckedChange={(checked) => {
                            const nextChecked = checked === true;
                            setSelectedDocumentKeys(nextChecked ? refundableDocuments.map((document) => getDocumentKey(document)) : []);
                            setPartialAmount("");
                            setPartialAmountByDocument({});
                            setPartialAmountErrorsByDocument({});
                            setAmountError("");
                          }}
                        />
                        <span className="text-sm font-medium text-gray-900">Select All</span>
                      </label>
                      {refundableDocuments.map((document) => {
                        const documentKey = getDocumentKey(document);
                        return (
                          <label key={documentKey} className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                            <Checkbox
                              checked={selectedDocumentKeys.includes(documentKey)}
                              onCheckedChange={(checked) => {
                                const nextChecked = checked === true;
                                setSelectedDocumentKeys((prev) => nextChecked
                                  ? Array.from(new Set([...prev, documentKey]))
                                  : prev.filter((key) => key !== documentKey));
                                setPartialAmount("");
                                setPartialAmountByDocument({});
                                setPartialAmountErrorsByDocument({});
                                setAmountError("");
                              }}
                            />
                            <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                              <span className="text-sm text-gray-900 truncate">
                                {document.id} — ${getRefundableAmountForDocument(document).toFixed(2)}
                              </span>
                              <Badge variant="outline" className="text-[10px] h-5 px-2 shrink-0">
                                {getDocumentTypeLabel(document.type)}
                              </Badge>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              {selectedDocuments.length === 0 && refundableDocuments.length > 0 && (
                <p className="text-xs text-red-500 font-medium">Please select at least one document to proceed</p>
              )}
            </div>
          )}

          {/* Selected Document Cards */}
          <div className="space-y-2">
            {selectedDocuments.map((document) => (
              <div key={getDocumentKey(document)} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-gray-700">{document.id}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] h-5 px-2">
                      {getDocumentTypeLabel(document.type)}
                    </Badge>
                    <p className="text-sm font-bold text-gray-900">${getRefundableAmountForDocument(document).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-600 truncate">{document.customerName}</p>
                  <p className="text-xs text-gray-500 truncate">{getInvoicePaymentSummaryLabel(document)}</p>
                </div>
              </div>
            ))}
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
                  setPartialAmountByDocument({});
                  setPartialAmountErrorsByDocument({});
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
                      Full selected amount will be refunded
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
                onClick={() => {
                  setRefundType("partial");
                  setAmountError("");
                }}
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
                  {selectedDocuments.length > 1 ? (
                    <>
                      <Label className="text-xs font-medium text-gray-700">
                        Enter Refund Amount per Invoice <span className="text-red-500">*</span>
                      </Label>
                      <div className="space-y-2">
                        {selectedDocuments.map((document) => {
                          const documentKey = getDocumentKey(document);
                          const refundableAmount = getRefundableAmountForDocument(document);
                          const fieldError = partialAmountErrorsByDocument[documentKey];

                          return (
                            <div
                              key={documentKey}
                              className={cn(
                                "p-3 border rounded-lg bg-white",
                                fieldError ? "border-red-300" : "border-gray-200"
                              )}
                            >
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <p className="text-xs font-medium text-gray-800 truncate">{document.id}</p>
                                <p className="text-xs text-gray-500">Max ${refundableAmount.toFixed(2)}</p>
                              </div>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max={refundableAmount}
                                  value={partialAmountByDocument[documentKey] || ""}
                                  onChange={(e) => {
                                    const nextValue = e.target.value;
                                    setPartialAmountByDocument((prev) => ({ ...prev, [documentKey]: nextValue }));
                                    setPartialAmountErrorsByDocument((prev) => {
                                      if (!prev[documentKey]) return prev;
                                      const next = { ...prev };
                                      delete next[documentKey];
                                      return next;
                                    });
                                  }}
                                  placeholder="0.00"
                                  className={cn(
                                    "pl-7 h-10 rounded-lg text-sm",
                                    fieldError ? "border-red-500 focus:ring-red-500" : "border-gray-200"
                                  )}
                                />
                              </div>
                              {fieldError && (
                                <p className="text-xs text-red-500 flex items-center gap-1 mt-1.5">
                                  <AlertCircle className="h-3 w-3" />
                                  {fieldError}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      <Label className="text-xs font-medium text-gray-700">
                        Refund Amount <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={totalSelectedAmount}
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
                    </>
                  )}
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
                      ${remainingAmount.toFixed(2)}
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
              
              {/* Mixed Methods Warning */}
              {hasMixedMethods && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-amber-900">Mixed Payment Methods Detected</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Selected documents were paid with different methods: {uniqueSelectedMethods.join(", ")}.
                      Choosing "Original Payment Method" will refund each invoice back to its own original method.
                    </p>
                  </div>
                </div>
              )}
              
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
                        {hasMixedMethods
                          ? "Each invoice refunded to its original method"
                          : getInvoicePaymentSummaryLabel(activeInvoice)}
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
                  
                  {/* Check Details - for Different Method */}
                  {selectedDifferentMethod === "check" && (
                    <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
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

                  {/* Cash Comment - for Different Method */}
                  {selectedDifferentMethod === "cash" && (
                    <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                          Comment
                        </Label>
                        <Textarea
                          value={checkComment}
                          onChange={(e) => setCheckComment(e.target.value)}
                          placeholder="Add a comment (e.g., Customer returned item)"
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
                <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-3 mt-4">
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
                    <span className="text-gray-600">Documents</span>
                    <span className="font-medium text-gray-900">{selectedDocuments.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Selected Total</span>
                    <span className="font-medium text-gray-900">${totalSelectedAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Refund Amount</span>
                    <span className="font-bold text-orange-600">${refundAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Refund Method</span>
                    <span className="font-medium text-gray-900">
                      {refundMethodOption === "original" 
                        ? hasMixedMethods
                          ? "Per-document methods"
                          : activeInvoice.paymentMethod || "Original"
                        : differentPaymentMethods.find(m => m.id === selectedDifferentMethod)?.label || "Select method"}
                    </span>
                  </div>
                  
                  {/* Mixed Methods Breakdown */}
                  {refundMethodOption === "original" && hasMixedMethods && (
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-300 mt-2">
                      <span className="text-gray-600">Methods Used</span>
                      <span className="font-medium text-gray-900 text-right text-xs max-w-[140px]">
                        {uniqueSelectedMethods.join(", ")}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200 mt-2">
                    <span className="text-gray-600">Refund Status</span>
                    <span className={cn(
                      "font-medium",
                      selectedStatusSummary === "Refunded" ? "text-red-600" : "text-orange-600"
                    )}>
                      {selectedStatusSummary}
                    </span>
                  </div>
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
              Issue Refund
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
