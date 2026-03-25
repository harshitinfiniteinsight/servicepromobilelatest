import { mockAgreements, mockCustomers, mockEmployees } from "@/data/mobileMockData";
import { createInvoice, getAllInvoices, type Invoice } from "@/services/invoiceService";

const AGREEMENT_STORAGE_KEY = "servicepro_agreements";
const LEGACY_AGREEMENT_STORAGE_KEY = "mockAgreements";

export interface AgreementConversionResult {
  success: boolean;
  invoiceId?: string;
  invoice?: Invoice;
  error?: string;
}

const getStoredAgreements = (): any[] => {
  const serviceAgreements = JSON.parse(localStorage.getItem(AGREEMENT_STORAGE_KEY) || "[]");
  const legacyAgreements = JSON.parse(localStorage.getItem(LEGACY_AGREEMENT_STORAGE_KEY) || "[]");

  const merged = [...mockAgreements, ...legacyAgreements, ...serviceAgreements];
  const unique = new Map<string, any>();
  merged.forEach((agreement) => {
    unique.set(agreement.id, { ...unique.get(agreement.id), ...agreement });
  });

  return Array.from(unique.values());
};

const saveAgreements = (agreements: any[]) => {
  localStorage.setItem(AGREEMENT_STORAGE_KEY, JSON.stringify(agreements));
  localStorage.setItem(LEGACY_AGREEMENT_STORAGE_KEY, JSON.stringify(agreements));

  agreements.forEach((agreement) => {
    const mockAgreement = mockAgreements.find((item) => item.id === agreement.id);
    if (mockAgreement) {
      Object.assign(mockAgreement, agreement);
    }
  });
};

const getInvoiceByAgreementId = async (agreementId: string): Promise<Invoice | null> => {
  const invoices = await getAllInvoices();
  return invoices.find((invoice) => invoice.agreement_id === agreementId) || null;
};

export async function convertAgreementToInvoice(agreementId: string): Promise<AgreementConversionResult> {
  try {
    const agreements = getStoredAgreements();
    const agreementIndex = agreements.findIndex((agreement) => agreement.id === agreementId);

    if (agreementIndex === -1) {
      return { success: false, error: "Agreement not found" };
    }

    const agreement = agreements[agreementIndex];

    if (agreement.invoice_id) {
      return { success: true, invoiceId: agreement.invoice_id, invoice: await getInvoiceByAgreementId(agreementId) ?? undefined };
    }

    const existingInvoice = await getInvoiceByAgreementId(agreementId);
    if (existingInvoice) {
      agreements[agreementIndex] = {
        ...agreement,
        invoice_id: existingInvoice.id,
        status: "converted_to_invoice",
        workflow_status: "converted_to_invoice",
      };
      saveAgreements(agreements);
      return { success: true, invoiceId: existingInvoice.id, invoice: existingInvoice };
    }

    const customer = mockCustomers.find((item) => item.id === agreement.customerId);
    const employee = (agreement as any).employeeName
      ? mockEmployees.find((item) => item.name === (agreement as any).employeeName)
      : mockEmployees[0];

    const totalAmount = Math.max(0, Number(agreement.total_amount ?? agreement.monthlyAmount ?? agreement.amount ?? 0));
    const amountPaid = Math.min(totalAmount, Math.max(0, Number(agreement.amount_paid ?? agreement.paidAmount ?? 0)));
    const balanceDue = Math.max(0, totalAmount - amountPaid);
    const paymentStatus = amountPaid <= 0 ? "unpaid" : amountPaid >= totalAmount ? "paid" : "partial";

    const invoice = await createInvoice({
      customerId: agreement.customerId,
      customerName: agreement.customerName,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      amount: totalAmount,
      total_amount: totalAmount,
      amount_paid: amountPaid,
      paidAmount: amountPaid,
      balance_due: balanceDue,
      payment_status: paymentStatus,
      status: paymentStatus === "paid" ? "Paid" : paymentStatus === "partial" ? "Partial Payment" : "Open",
      paymentMethod: agreement.paymentMethod || "Unpaid",
      type: "single",
      source: "agreement",
      agreement_id: agreement.id,
      employeeId: employee?.id,
      employeeName: employee?.name,
      notes: (agreement as any).notes,
      items: (agreement as any).items || [],
      subtotal: (agreement as any).subtotal,
      tax: (agreement as any).tax,
      total: totalAmount,
      discount: (agreement as any).discount,
      discountType: (agreement as any).discountType,
      customerEmail: customer?.email,
      customerPhone: customer?.phone,
      jobAddress: (agreement as any).jobAddress || customer?.address || "",
    } as any);

    agreements[agreementIndex] = {
      ...agreement,
      invoice_id: invoice.id,
      status: "converted_to_invoice",
      workflow_status: "converted_to_invoice",
      balance_due: balanceDue,
      amount_paid: amountPaid,
    };
    saveAgreements(agreements);

    return { success: true, invoiceId: invoice.id, invoice };
  } catch (error) {
    console.error("Error converting agreement to invoice:", error);
    return { success: false, error: "Failed to convert agreement to invoice" };
  }
}
