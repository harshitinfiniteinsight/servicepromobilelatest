import type { JobPaymentStatus } from "@/data/mobileMockData";

type JobLike = {
  id: string;
  status?: string;
  sourceId?: string;
  paymentStatus?: string;
  paidAmount?: number;
  totalAmount?: number;
};

type InvoiceLike = {
  id: string;
  jobId?: string;
  status?: string;
  amount?: number;
  paidAmount?: number;
  refundedAmount?: number;
};

export const isRefundEligiblePaymentStatus = (status?: string) => {
  if (!status) return false;
  const normalized = status.trim().toLowerCase();
  return (
    normalized === "paid" ||
    normalized === "partial" ||
    normalized === "partially paid" ||
    normalized === "partially_paid"
  );
};

export const getAllInvoicesForJob = (
  jobId: string,
  jobs: JobLike[],
  invoices: InvoiceLike[]
): InvoiceLike[] => {
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return [];

  const byJobId = invoices.filter((inv) => (inv as any).jobId === jobId);
  const bySourceId = job.sourceId ? invoices.filter((inv) => inv.id === job.sourceId) : [];
  const directInvoice = job.id.startsWith("INV")
    ? invoices.filter((inv) => inv.id === job.id)
    : [];

  const merged = [...byJobId, ...bySourceId, ...directInvoice];
  const unique = new Map<string, InvoiceLike>();
  merged.forEach((inv) => unique.set(inv.id, inv));
  return Array.from(unique.values());
};

export const getPaidInvoicesForJob = (
  jobId: string,
  jobs: JobLike[],
  invoices: InvoiceLike[]
): InvoiceLike[] => {
  const isRefundableInvoiceStatus = (invoiceStatus?: string) => {
    if (!invoiceStatus) return false;
    const normalized = invoiceStatus.trim().toLowerCase();
    return normalized === "paid" || normalized === "partially paid" || normalized === "partially refunded";
  };

  return getAllInvoicesForJob(jobId, jobs, invoices).filter((inv) => {
    // Only refund actual invoices, not estimates or agreements
    if (!inv.id.startsWith("INV-")) return false;
    if (!isRefundableInvoiceStatus(inv.status)) return false;
    const paidBase = Number(inv.paidAmount ?? inv.amount ?? 0);
    const refunded = Number(inv.refundedAmount || 0);
    return paidBase - refunded > 0;
  });
};

export const deriveJobPaymentSummary = (
  jobId: string,
  jobs: JobLike[],
  invoices: InvoiceLike[]
): {
  status: JobPaymentStatus;
  displayStatus: "Paid" | "Partially Paid" | "Open";
  totalInvoiced: number;
  netPaid: number;
  hasRemainingRefundable: boolean;
} => {
  const job = jobs.find((j) => j.id === jobId);
  const linkedInvoices = getAllInvoicesForJob(jobId, jobs, invoices);

  if (linkedInvoices.length > 0) {
    const totalInvoiced = linkedInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const netPaid = linkedInvoices.reduce((sum, inv) => {
      const paidBase = Number(inv.paidAmount ?? inv.amount ?? 0);
      const refunded = Number(inv.refundedAmount || 0);
      return sum + Math.max(paidBase - refunded, 0);
    }, 0);

    const hasRemainingRefundable = linkedInvoices.some((inv) => {
      const paidBase = Number(inv.paidAmount ?? inv.amount ?? 0);
      const refunded = Number(inv.refundedAmount || 0);
      return paidBase - refunded > 0;
    });

    const normalizedInvoiceStatuses = linkedInvoices.map((inv) => String(inv.status || "").trim().toLowerCase());
    const hasPaidLikeInvoice = normalizedInvoiceStatuses.some(
      (s) => s === "paid" || s === "partially paid" || s === "partially refunded"
    );
    const hasOpenInvoice = normalizedInvoiceStatuses.some(
      (s) => s === "open" || s === "unpaid" || s === "overdue" || s === ""
    );

    let status: JobPaymentStatus;
    if (netPaid <= 0) {
      status = "unpaid";
    } else if (hasOpenInvoice || (totalInvoiced > 0 && netPaid < totalInvoiced)) {
      status = "partial";
    } else if (hasPaidLikeInvoice) {
      status = "paid";
    } else {
      status = "unpaid";
    }

    return {
      status,
      displayStatus: status === "paid" ? "Paid" : status === "partial" ? "Partially Paid" : "Open",
      totalInvoiced,
      netPaid,
      hasRemainingRefundable,
    };
  }

  const raw = String(job?.paymentStatus || "").trim().toLowerCase();
  const status: JobPaymentStatus =
    raw === "paid"
      ? "paid"
      : raw === "partial" || raw === "partially paid" || raw === "partially_paid"
      ? "partial"
      : "unpaid";

  if (status === "partial") {
    return {
      status,
      displayStatus: "Partially Paid",
      totalInvoiced: Number(job?.totalAmount || 0),
      netPaid: Number(job?.paidAmount || 0),
      hasRemainingRefundable: Number(job?.paidAmount || 0) > 0,
    };
  }

  if (status === "paid" || job?.status === "Completed" || job?.status === "Feedback Received") {
    const total = Number(job?.totalAmount || 0);
    return {
      status: "paid",
      displayStatus: "Paid",
      totalInvoiced: total,
      netPaid: total,
      hasRemainingRefundable: total > 0,
    };
  }

  return {
    status: "unpaid",
    displayStatus: "Open",
    totalInvoiced: Number(job?.totalAmount || 0),
    netPaid: 0,
    hasRemainingRefundable: false,
  };
};
