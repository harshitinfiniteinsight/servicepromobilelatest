// Invoice service for managing invoices
// Uses localStorage as a mock backend for persistence

import { mockInvoices } from "@/data/mobileMockData";

export interface InvoiceItem {
  id: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  amount: number;
  type?: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: "Open" | "Paid" | "Overdue" | "Deactivated";
  paymentMethod?: string;
  type: "single" | "recurring" | "deactivated";
  source?: "sell_product" | "manual" | "estimate" | "agreement";
  items?: InvoiceItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  discount?: number;
  discountType?: "%" | "$";
  notes?: string;
  employeeId?: string;
  employeeName?: string;
  createdAt?: string;
}

const STORAGE_KEY = "servicepro_invoices";

// Initialize invoices storage if it doesn't exist
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};

// Get all invoices from storage
const getInvoices = (): Invoice[] => {
  initializeStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save invoices to storage
const saveInvoices = (invoices: Invoice[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
};

/**
 * Generate the next sequential invoice ID
 * Format: INV-031, INV-032, etc.
 */
const generateInvoiceId = (): string => {
  const storedInvoices = getInvoices();
  
  // Collect all invoice IDs from both stored and mock invoices
  const allInvoiceIds: string[] = [];
  
  // Get IDs from stored invoices
  storedInvoices.forEach(inv => allInvoiceIds.push(inv.id));
  
  // Get IDs from mock invoices
  mockInvoices.forEach(inv => allInvoiceIds.push(inv.id));
  
  let maxNumber = 0;
  
  // Find the highest invoice number
  allInvoiceIds.forEach(id => {
    const match = id.match(/^INV-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) {
        maxNumber = num;
      }
    }
  });
  
  // Generate next sequential ID
  const nextNumber = maxNumber + 1;
  return `INV-${String(nextNumber).padStart(3, '0')}`;
};

/**
 * Create a new invoice
 */
export const createInvoice = async (invoiceData: Omit<Invoice, "id" | "createdAt">): Promise<Invoice> => {
  const invoices = getInvoices();
  
  // Calculate due date (30 days from issue date if not provided)
  const issueDate = invoiceData.issueDate || new Date().toISOString().split("T")[0];
  const dueDate = invoiceData.dueDate || (() => {
    const date = new Date(issueDate);
    date.setDate(date.getDate() + 30);
    return date.toISOString().split("T")[0];
  })();
  
  // Generate sequential invoice ID
  const invoiceId = generateInvoiceId();
  
  const newInvoice: Invoice = {
    ...invoiceData,
    id: invoiceId,
    issueDate,
    dueDate,
    createdAt: new Date().toISOString(),
    status: invoiceData.status || "Paid", // Default to Paid for product sales
    type: invoiceData.type || "single",
    source: invoiceData.source || "manual",
  };
  
  invoices.unshift(newInvoice); // Add to beginning for newest first
  saveInvoices(invoices);
  
  return newInvoice;
};

/**
 * Get all invoices
 */
export const getAllInvoices = async (): Promise<Invoice[]> => {
  return getInvoices();
};

/**
 * Get a single invoice by ID
 */
export const getInvoiceById = async (invoiceId: string): Promise<Invoice | null> => {
  const invoices = getInvoices();
  return invoices.find(invoice => invoice.id === invoiceId) || null;
};

/**
 * Get all invoices for a specific customer
 */
export const getCustomerInvoices = async (customerId: string): Promise<Invoice[]> => {
  const invoices = getInvoices();
  return invoices.filter(invoice => invoice.customerId === customerId);
};

/**
 * Update an invoice
 */
export const updateInvoice = async (invoiceId: string, updates: Partial<Invoice>): Promise<Invoice | null> => {
  const invoices = getInvoices();
  const index = invoices.findIndex(inv => inv.id === invoiceId);
  
  if (index === -1) {
    return null;
  }
  
  invoices[index] = { ...invoices[index], ...updates };
  saveInvoices(invoices);
  
  return invoices[index];
};

/**
 * Delete an invoice
 */
export const deleteInvoice = async (invoiceId: string): Promise<boolean> => {
  const invoices = getInvoices();
  const filtered = invoices.filter(invoice => invoice.id !== invoiceId);
  saveInvoices(filtered);
  return filtered.length < invoices.length;
};

