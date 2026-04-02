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

// ── Refund flow types ────────────────────────────────────────────────────────

export interface InvoiceLineItem {
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  refundedAmount?: number;
}

export interface SelectedRefundItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface RefundProcessedDocument {
  id: string;
  type: "invoice" | "agreement";
  refundAmount: number;
  newStatus: string;
}

export interface RefundFlowState {
  selectedInvoice: RefundInvoiceData;
  selectedItems: SelectedRefundItem[];
  refundAmount: number;
}

/**
 * Generate realistic mock line items for a given invoice.
 * Used in prototype mode when no real API is available.
 */
export function generateMockLineItems(invoice: RefundInvoiceData): InvoiceLineItem[] {
  const total = Number(invoice.paidAmount ?? invoice.amount ?? 0);
  if (total <= 0) {
    return [{
      itemId: `${invoice.id}-1`,
      description: "Service Fee",
      quantity: 1,
      unitPrice: 100,
      total: 100,
      refundedAmount: 0,
    }];
  }

  // Split into up to 3 plausible line items
  const labor = Math.round(total * 0.6 * 100) / 100;
  const parts = Math.round(total * 0.3 * 100) / 100;
  const fee   = Math.round((total - labor - parts) * 100) / 100;

  const items: InvoiceLineItem[] = [
    {
      itemId: `${invoice.id}-labor`,
      description: "Labor",
      quantity: 1,
      unitPrice: labor,
      total: labor,
      refundedAmount: Number(invoice.refundedAmount ?? 0) > 0 ? Math.min(Number(invoice.refundedAmount), labor) : 0,
    },
    {
      itemId: `${invoice.id}-parts`,
      description: "Parts & Materials",
      quantity: 1,
      unitPrice: parts,
      total: parts,
      refundedAmount: 0,
    },
  ];

  if (fee > 0) {
    items.push({
      itemId: `${invoice.id}-fee`,
      description: "Service Fee",
      quantity: 1,
      unitPrice: fee,
      total: fee,
      refundedAmount: 0,
    });
  }

  return items;
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
