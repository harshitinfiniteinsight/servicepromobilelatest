import { InvoiceLineItem } from "@/components/modals/ItemSelectionModal";

// Mock invoice line items data
const mockInvoiceItems: Record<string, InvoiceLineItem[]> = {
  "invoice:INV-017": [
    {
      itemId: "item-001",
      description: "Standard service call",
      quantity: 1,
      unitPrice: 150,
      total: 150,
      refundedAmount: 0,
    },
    {
      itemId: "item-002",
      description: "Labor - 2 hours",
      quantity: 2,
      unitPrice: 75,
      total: 150,
      refundedAmount: 0,
    },
    {
      itemId: "item-003",
      description: "Parts and materials",
      quantity: 1,
      unitPrice: 200,
      total: 200,
      refundedAmount: 0,
    },
  ],
  "invoice:INV-018": [
    {
      itemId: "item-004",
      description: "Emergency service call",
      quantity: 1,
      unitPrice: 200,
      total: 200,
      refundedAmount: 0,
    },
    {
      itemId: "item-005",
      description: "Labor - 4 hours",
      quantity: 4,
      unitPrice: 75,
      total: 300,
      refundedAmount: 100,
    },
    {
      itemId: "item-006",
      description: "Equipment rental",
      quantity: 1,
      unitPrice: 100,
      total: 100,
      refundedAmount: 0,
    },
  ],
};

/**
 * Fetch invoice line items
 * In production, this would call an API endpoint
 */
export const fetchInvoiceLineItems = async (invoiceId: string): Promise<InvoiceLineItem[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return mock data or empty array if not found
  return mockInvoiceItems[invoiceId] || [];
};

export default mockInvoiceItems;
