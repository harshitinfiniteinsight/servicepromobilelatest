/**
 * Estimate to Invoice Conversion Service
 * 
 * Automatically converts a paid estimate to an invoice.
 * This service is triggered after successful payment completion.
 */

import { mockEstimates, mockCustomers, mockEmployees, mockInvoices } from "@/data/mobileMockData";

interface ConversionResult {
  success: boolean;
  invoiceId?: string;
  error?: string;
}

/**
 * Converts a paid estimate to an invoice
 * @param estimateId - ID of the estimate to convert
 * @returns Result object with success status and invoice ID
 */
export function convertEstimateToInvoice(estimateId: string): ConversionResult {
  try {
    // Get estimate from localStorage or mock data
    const storedEstimates = localStorage.getItem("mockEstimates");
    const estimates = storedEstimates ? JSON.parse(storedEstimates) : [...mockEstimates];
    
    const estimate = estimates.find((est: any) => est.id === estimateId);
    if (!estimate) {
      return { success: false, error: "Estimate not found" };
    }

    // Check if already converted
    const convertedEstimates = JSON.parse(localStorage.getItem("convertedEstimates") || "[]");
    if (convertedEstimates.includes(estimateId)) {
      // Already converted, just return the existing invoice ID
      const estimateToInvoiceMap = JSON.parse(localStorage.getItem("estimateToInvoiceMap") || "{}");
      return { success: true, invoiceId: estimateToInvoiceMap[estimateId] };
    }

    // Get customer info
    const customer = mockCustomers.find(c => c.id === estimate.customerId);
    
    // Get employee info
    const employee = (estimate as any).employeeName
      ? mockEmployees.find(emp => emp.name === (estimate as any).employeeName)
      : mockEmployees[0];

    // Generate invoice ID
    const invoiceId = `INV-${Date.now()}`;

    // Create new invoice from estimate
    const newInvoice = {
      id: invoiceId,
      customerId: estimate.customerId,
      customerName: estimate.customerName,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      amount: estimate.amount,
      status: "Paid" as const, // Already paid since this is triggered after payment
      paymentMethod: estimate.paymentMethod || "Credit Card",
      type: "single" as const,
      employeeId: employee?.id,
      employeeName: employee?.name,
      jobAddress: (estimate as any).jobAddress || customer?.address || "",
      // Copy estimate items if they exist
      items: (estimate as any).items || [],
      // Mark as auto-created from estimate
      sourceType: "estimate",
      sourceId: estimateId,
    };

    // Save invoice to localStorage
    const storedInvoices = localStorage.getItem("mockInvoices");
    const invoices = storedInvoices ? JSON.parse(storedInvoices) : [...mockInvoices];
    invoices.push(newInvoice);
    localStorage.setItem("mockInvoices", JSON.stringify(invoices));

    // Mark estimate as converted
    if (!convertedEstimates.includes(estimateId)) {
      convertedEstimates.push(estimateId);
      localStorage.setItem("convertedEstimates", JSON.stringify(convertedEstimates));
    }

    // Store estimate to invoice mapping
    const estimateToInvoiceMap = JSON.parse(localStorage.getItem("estimateToInvoiceMap") || "{}");
    estimateToInvoiceMap[estimateId] = invoiceId;
    localStorage.setItem("estimateToInvoiceMap", JSON.stringify(estimateToInvoiceMap));

    // Update estimate status to "Converted to Invoice"
    const estimateIndex = estimates.findIndex((est: any) => est.id === estimateId);
    if (estimateIndex !== -1) {
      estimates[estimateIndex].status = "Converted to Invoice";
      localStorage.setItem("mockEstimates", JSON.stringify(estimates));
    }

    return { success: true, invoiceId };
  } catch (error) {
    console.error("Error converting estimate to invoice:", error);
    return { success: false, error: "Failed to convert estimate to invoice" };
  }
}
