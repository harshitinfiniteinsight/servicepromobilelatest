/**
 * Payment Synchronization Utility
 * 
 * Handles payment status updates across Jobs and their source documents
 * (Invoices, Estimates, Agreements) when payments are collected from the Job dashboard.
 */

import { mockInvoices, mockEstimates, mockAgreements } from "@/data/mobileMockData";
import type { JobSourceType, JobPaymentStatus } from "@/data/mobileMockData";

export interface PaymentTransaction {
  transactionId: string;
  amount: number;
  paymentMethod: string;
  timestamp: string;
  status: "success" | "failed" | "pending";
}

export interface PaymentSyncResult {
  success: boolean;
  jobUpdated: boolean;
  sourceDocumentUpdated: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * Generate a unique transaction ID
 */
export function generateTransactionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${timestamp}-${random}`;
}

/**
 * Update the job payment status in localStorage
 */
export function updateJobPaymentStatus(
  jobId: string,
  paymentStatus: JobPaymentStatus,
  transactionId?: string
): boolean {
  try {
    // Load jobs from localStorage
    const storedJobs = localStorage.getItem("mockJobs");
    const jobs = storedJobs ? JSON.parse(storedJobs) : [];
    
    // Find and update the job
    const jobIndex = jobs.findIndex((j: any) => j.id === jobId);
    if (jobIndex !== -1) {
      jobs[jobIndex].paymentStatus = paymentStatus;
      if (transactionId) {
        jobs[jobIndex].lastTransactionId = transactionId;
        jobs[jobIndex].paidAt = new Date().toISOString();
      }
      localStorage.setItem("mockJobs", JSON.stringify(jobs));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Failed to update job payment status:", error);
    return false;
  }
}

/**
 * Update the source document (Invoice/Estimate/Agreement) payment status
 */
export function updateSourceDocumentPaymentStatus(
  sourceType: JobSourceType,
  sourceId: string,
  paymentStatus: "Paid" | "Open" | "Partial",
  transactionId?: string,
  paymentMethod?: string
): boolean {
  try {
    switch (sourceType) {
      case "invoice": {
        const storedInvoices = localStorage.getItem("mockInvoices");
        const invoices = storedInvoices ? JSON.parse(storedInvoices) : [...mockInvoices];
        
        const invoiceIndex = invoices.findIndex((inv: any) => inv.id === sourceId);
        if (invoiceIndex !== -1) {
          invoices[invoiceIndex].status = paymentStatus;
          if (paymentMethod) {
            invoices[invoiceIndex].paymentMethod = paymentMethod;
          }
          if (transactionId) {
            invoices[invoiceIndex].lastTransactionId = transactionId;
            invoices[invoiceIndex].paidAt = new Date().toISOString();
          }
          localStorage.setItem("mockInvoices", JSON.stringify(invoices));
          return true;
        }
        return false;
      }
      
      case "estimate": {
        const storedEstimates = localStorage.getItem("mockEstimates");
        const estimates = storedEstimates ? JSON.parse(storedEstimates) : [...mockEstimates];
        
        const estimateIndex = estimates.findIndex((est: any) => est.id === sourceId);
        if (estimateIndex !== -1) {
          // Estimates use "Paid" / "Unpaid" status
          estimates[estimateIndex].status = paymentStatus === "Paid" ? "Paid" : "Unpaid";
          if (transactionId) {
            estimates[estimateIndex].lastTransactionId = transactionId;
            estimates[estimateIndex].paidAt = new Date().toISOString();
          }
          localStorage.setItem("mockEstimates", JSON.stringify(estimates));
          return true;
        }
        return false;
      }
      
      case "agreement": {
        const storedAgreements = localStorage.getItem("mockAgreements");
        const agreements = storedAgreements ? JSON.parse(storedAgreements) : [...mockAgreements];
        
        const agreementIndex = agreements.findIndex((agr: any) => agr.id === sourceId);
        if (agreementIndex !== -1) {
          agreements[agreementIndex].status = paymentStatus;
          if (transactionId) {
            agreements[agreementIndex].lastTransactionId = transactionId;
            agreements[agreementIndex].paidAt = new Date().toISOString();
          }
          localStorage.setItem("mockAgreements", JSON.stringify(agreements));
          return true;
        }
        return false;
      }
      
      default:
        return false;
    }
  } catch (error) {
    console.error("Failed to update source document payment status:", error);
    return false;
  }
}

/**
 * Synchronize payment status between Job and its source document
 * This is the main function to call when a payment is successfully processed
 */
export async function syncPaymentStatus(
  jobId: string,
  sourceType: JobSourceType,
  sourceId: string | undefined,
  paymentMethod: string,
  isFullPayment: boolean = true
): Promise<PaymentSyncResult> {
  const transactionId = generateTransactionId();
  const jobPaymentStatus: JobPaymentStatus = isFullPayment ? "paid" : "partial";
  const documentPaymentStatus = isFullPayment ? "Paid" : "Partial";
  
  try {
    // Step 1: Update job payment status
    const jobUpdated = updateJobPaymentStatus(jobId, jobPaymentStatus, transactionId);
    
    if (!jobUpdated) {
      return {
        success: false,
        jobUpdated: false,
        sourceDocumentUpdated: false,
        error: "Failed to update job payment status",
      };
    }
    
    // Step 2: Update source document payment status (if exists)
    let sourceDocumentUpdated = false;
    if (sourceType !== "none" && sourceId) {
      sourceDocumentUpdated = updateSourceDocumentPaymentStatus(
        sourceType,
        sourceId,
        documentPaymentStatus as "Paid" | "Open" | "Partial",
        transactionId,
        paymentMethod
      );
      
      if (!sourceDocumentUpdated) {
        // Rollback job payment status on failure
        updateJobPaymentStatus(jobId, "unpaid");
        return {
          success: false,
          jobUpdated: false,
          sourceDocumentUpdated: false,
          error: "Failed to update source document. Payment rolled back.",
        };
      }
    } else {
      // No source document, only job was updated
      sourceDocumentUpdated = true;
    }
    
    // Step 3: Store payment transaction for audit trail
    storePaymentTransaction({
      transactionId,
      jobId,
      sourceType,
      sourceId: sourceId || null,
      paymentMethod,
      isFullPayment,
      timestamp: new Date().toISOString(),
    });
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("paymentStatusUpdated", {
      detail: {
        jobId,
        sourceType,
        sourceId,
        paymentStatus: jobPaymentStatus,
        transactionId,
      }
    }));
    
    return {
      success: true,
      jobUpdated: true,
      sourceDocumentUpdated,
      transactionId,
    };
    
  } catch (error) {
    console.error("Payment sync failed:", error);
    return {
      success: false,
      jobUpdated: false,
      sourceDocumentUpdated: false,
      error: "An unexpected error occurred during payment sync",
    };
  }
}

/**
 * Store payment transaction for audit trail
 */
function storePaymentTransaction(transaction: {
  transactionId: string;
  jobId: string;
  sourceType: JobSourceType;
  sourceId: string | null;
  paymentMethod: string;
  isFullPayment: boolean;
  timestamp: string;
}): void {
  try {
    const storedTransactions = localStorage.getItem("paymentTransactions");
    const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
    transactions.push(transaction);
    localStorage.setItem("paymentTransactions", JSON.stringify(transactions));
  } catch (error) {
    console.error("Failed to store payment transaction:", error);
  }
}

/**
 * Get payment status of a source document
 */
export function getSourceDocumentPaymentStatus(
  sourceType: JobSourceType,
  sourceId: string
): "Paid" | "Open" | "Partial" | "Unknown" {
  try {
    switch (sourceType) {
      case "invoice": {
        const storedInvoices = localStorage.getItem("mockInvoices");
        const invoices = storedInvoices ? JSON.parse(storedInvoices) : mockInvoices;
        const invoice = invoices.find((inv: any) => inv.id === sourceId);
        return invoice?.status || "Unknown";
      }
      
      case "estimate": {
        const storedEstimates = localStorage.getItem("mockEstimates");
        const estimates = storedEstimates ? JSON.parse(storedEstimates) : mockEstimates;
        const estimate = estimates.find((est: any) => est.id === sourceId);
        return estimate?.status === "Paid" ? "Paid" : "Open";
      }
      
      case "agreement": {
        const storedAgreements = localStorage.getItem("mockAgreements");
        const agreements = storedAgreements ? JSON.parse(storedAgreements) : mockAgreements;
        const agreement = agreements.find((agr: any) => agr.id === sourceId);
        return agreement?.status || "Unknown";
      }
      
      default:
        return "Unknown";
    }
  } catch (error) {
    console.error("Failed to get source document payment status:", error);
    return "Unknown";
  }
}

/**
 * Get amount for a source document
 */
export function getSourceDocumentAmount(
  sourceType: JobSourceType,
  sourceId: string
): number {
  try {
    switch (sourceType) {
      case "invoice": {
        const storedInvoices = localStorage.getItem("mockInvoices");
        const invoices = storedInvoices ? JSON.parse(storedInvoices) : mockInvoices;
        const invoice = invoices.find((inv: any) => inv.id === sourceId);
        return invoice?.amount || 0;
      }
      
      case "estimate": {
        const storedEstimates = localStorage.getItem("mockEstimates");
        const estimates = storedEstimates ? JSON.parse(storedEstimates) : mockEstimates;
        const estimate = estimates.find((est: any) => est.id === sourceId);
        return estimate?.amount || 0;
      }
      
      case "agreement": {
        const storedAgreements = localStorage.getItem("mockAgreements");
        const agreements = storedAgreements ? JSON.parse(storedAgreements) : mockAgreements;
        const agreement = agreements.find((agr: any) => agr.id === sourceId);
        // For agreements, return monthly amount or calculate total
        return agreement?.monthlyAmount || 0;
      }
      
      default:
        return 0;
    }
  } catch (error) {
    console.error("Failed to get source document amount:", error);
    return 0;
  }
}
