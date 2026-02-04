/**
 * Job Payment Modal
 * 
 * A wrapper modal for handling payments from the Job dashboard.
 * Integrates with the payment sync utility to update both the Job
 * and its source document (Invoice/Estimate/Agreement) when payment is completed.
 * 
 * For estimates, shows an information modal first explaining the conversion to invoice.
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import PaymentModal from "./PaymentModal";
import EstimateToInvoiceInfoModal from "./EstimateToInvoiceInfoModal";
import { syncPaymentStatus, getSourceDocumentAmount } from "@/utils/paymentSync";
import type { JobSourceType } from "@/data/mobileMockData";

interface JobPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    customerName: string;
    sourceType?: JobSourceType;
    sourceId?: string;
    paymentStatus?: string;
  };
  onPaymentComplete?: (jobId: string, transactionId: string) => void;
}

const JobPaymentModal = ({ 
  isOpen, 
  onClose, 
  job,
  onPaymentComplete 
}: JobPaymentModalProps) => {
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Check if this is an estimate payment
  const isEstimatePayment = job.sourceType === "estimate";

  // Calculate payment amount based on source document
  useEffect(() => {
    if (isOpen && job) {
      const sourceType = job.sourceType || "none";
      const sourceId = job.sourceId || "";
      
      if (sourceType !== "none" && sourceId) {
        const amount = getSourceDocumentAmount(sourceType, sourceId);
        setPaymentAmount(amount);
      } else {
        // Default amount if no source document
        // In a real app, this would come from a different source
        setPaymentAmount(0);
      }

      // Show info modal first for estimate payments, otherwise show payment modal directly
      if (sourceType === "estimate") {
        setShowInfoModal(true);
        setShowPaymentModal(false);
      } else {
        setShowInfoModal(false);
        setShowPaymentModal(true);
      }
    } else {
      setShowInfoModal(false);
      setShowPaymentModal(false);
    }
  }, [isOpen, job]);

  const handlePaymentMethodSelect = async (method: string) => {
    try {
      // The actual payment processing happens in the sub-modals (CashPaymentModal, etc.)
      // This callback is triggered after successful payment processing
      
      const sourceType = (job.sourceType || "none") as JobSourceType;
      const sourceId = job.sourceId;
      
      // Sync payment status between Job and source document
      const syncResult = await syncPaymentStatus(
        job.id,
        sourceType,
        sourceId,
        method,
        true // Full payment
      );
      
      if (syncResult.success) {
        toast.success(
          `Payment successful! ${sourceType !== "none" ? `${sourceType.charAt(0).toUpperCase() + sourceType.slice(1)} marked as paid.` : "Job marked as paid."}`
        );
        
        // Notify parent component
        if (onPaymentComplete && syncResult.transactionId) {
          onPaymentComplete(job.id, syncResult.transactionId);
        }
      } else {
        toast.error(syncResult.error || "Payment sync failed. Please try again.");
      }
      
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error("An error occurred during payment processing.");
    } finally {
      handleClose();
    }
  };

  // Handle closing modals
  const handleClose = () => {
    setShowInfoModal(false);
    setShowPaymentModal(false);
    onClose();
  };

  // Handle continue from info modal to payment modal
  const handleContinueToPayment = () => {
    setShowInfoModal(false);
    setShowPaymentModal(true);
  };

  // Determine entity type for PaymentModal
  const getEntityType = (): "agreement" | "estimate" | "invoice" | undefined => {
    const sourceType = job.sourceType;
    if (sourceType === "agreement") return "agreement";
    if (sourceType === "estimate") return "estimate";
    if (sourceType === "invoice") return "invoice";
    return undefined;
  };

  return (
    <>
      {/* Info Modal for Estimate Payments */}
      {isEstimatePayment && (
        <EstimateToInvoiceInfoModal
          isOpen={showInfoModal}
          onClose={handleClose}
          onContinue={handleContinueToPayment}
        />
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClose}
        amount={paymentAmount}
        onPaymentMethodSelect={handlePaymentMethodSelect}
        entityType={getEntityType()}
      />
    </>
  );
};

export default JobPaymentModal;
