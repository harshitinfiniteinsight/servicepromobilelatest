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

/**
 * Convert an invoice object to RefundInvoiceData format
 * Handles both direct invoice objects and job invoice references
 */
export function invoiceToRefundData(invoice: any): RefundInvoiceData {
  return {
    id: invoice.id,
    customerName: invoice.customerName,
    amount: invoice.amount,
    paidAmount: invoice.amount,
    paymentMethod: invoice.paymentMethod,
    payment_method: invoice.payment_method || invoice.payment?.payment_method,
    payment: invoice.payment,
    payment_method_details: invoice.payment_method_details || invoice.payment?.payment_method_details || invoice.payment?.method_details,
    paymentMethodDetails: invoice.paymentMethodDetails,
    cardBrand: invoice.cardBrand,
    cardLast4: invoice.cardLast4 || invoice.payment?.payment_method_details?.card?.last4 || invoice.payment?.method_details?.card?.last4,
    status: invoice.status,
    refundedAmount: invoice.refundedAmount || 0,
    transactionId: invoice.transactionId,
  };
}

/**
 * Open refund modal by invoice ID (shared entry point)
 * Can be called from both Invoices and Jobs pages
 */
export function openRefundByInvoiceId(
  invoiceId: string,
  invoices: any[],
  setRefundInvoice: (data: RefundInvoiceData | null) => void,
  setShowRefundModal: (show: boolean) => void
) {
  const invoice = invoices.find(inv => inv.id === invoiceId);
  
  if (!invoice) {
    console.error(`Invoice ${invoiceId} not found`);
    return false;
  }

  // Check if already fully refunded
  if (invoice.status === "Refunded" || invoice.status === "Fully Refunded") {
    console.warn(`Invoice ${invoiceId} is already fully refunded`);
    return false;
  }

  // Open refund modal with invoice data
  setRefundInvoice(invoiceToRefundData(invoice));
  setShowRefundModal(true);
  return true;
}
