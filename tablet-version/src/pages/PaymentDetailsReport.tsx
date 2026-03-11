import { useEffect, useMemo, useState } from "react";
import TabletHeader from "@/components/layout/TabletHeader";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Search } from "lucide-react";
import { getAllInvoices } from "@/services/invoiceService";
import { mockInvoices } from "@/data/mobileMockData";

interface PaymentTransaction {
  id: string;
  date: string;
  customerName: string;
  jobId: string;
  invoiceId: string;
  paymentMethod: string;
  transactionType: "Payment Received" | "Refund";
  amount: number;
  status: "Completed" | "Refunded";
}

const fallbackMobileStyleData: PaymentTransaction[] = [
  {
    id: "TRX-001",
    date: "2026-01-28",
    customerName: "Lisa Anderson",
    jobId: "JOB-101",
    invoiceId: "INV-01",
    paymentMethod: "Card",
    transactionType: "Payment Received",
    amount: 100,
    status: "Completed",
  },
  {
    id: "TRX-002",
    date: "2026-01-29",
    customerName: "Lisa Anderson",
    jobId: "JOB-101",
    invoiceId: "INV-01",
    paymentMethod: "Card",
    transactionType: "Refund",
    amount: -40,
    status: "Refunded",
  },
  {
    id: "TRX-003",
    date: "2026-02-02",
    customerName: "Mike Williams",
    jobId: "JOB-205",
    invoiceId: "INV-17",
    paymentMethod: "ACH",
    transactionType: "Payment Received",
    amount: 875,
    status: "Completed",
  },
  {
    id: "TRX-004",
    date: "2026-02-04",
    customerName: "Mike Williams",
    jobId: "JOB-205",
    invoiceId: "INV-17",
    paymentMethod: "ACH",
    transactionType: "Refund",
    amount: -120,
    status: "Refunded",
  },
];

const PaymentDetailsReport = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>("all");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>("all");

  useEffect(() => {
    const loadTransactions = async () => {
      const savedInvoices = (await getAllInvoices()) as Array<Record<string, any>>;
      const invoicesSource = savedInvoices.length > 0 ? savedInvoices : (mockInvoices as Array<Record<string, any>>);

      const paymentRows: PaymentTransaction[] = invoicesSource
        .filter((inv) => String(inv.status || "").toLowerCase() !== "open")
        .map((inv, idx) => ({
          id: `PAY-${idx + 1}`,
          date: String(inv.issueDate || new Date().toISOString().split("T")[0]),
          customerName: String(inv.customerName || "Unknown Customer"),
          jobId: String(inv.jobId || `JOB-${String(inv.id || idx + 1).replace(/\D/g, "").padStart(3, "0")}`),
          invoiceId: String(inv.id || "-"),
          paymentMethod: String(inv.paymentMethod || "Card"),
          transactionType: "Payment Received" as const,
          amount: Number(inv.paidAmount ?? inv.amount ?? 0),
          status: "Completed" as const,
        }))
        .filter((row) => row.amount > 0);

      const refundRecords = JSON.parse(localStorage.getItem("refunds") || "[]") as Array<Record<string, any>>;
      const refundRows: PaymentTransaction[] = refundRecords.map((refund, idx) => {
        const linked = invoicesSource.find((inv) => String(inv.id) === String(refund.invoiceId)) || {};
        const refundAmount = Number(refund.refundAmount || 0);

        return {
          id: `REF-${idx + 1}`,
          date: String(refund.timestamp || new Date().toISOString()).slice(0, 10),
          customerName: String(linked.customerName || "Unknown Customer"),
          jobId: String(linked.jobId || `JOB-${String(refund.invoiceId || idx + 1).replace(/\D/g, "").padStart(3, "0")}`),
          invoiceId: String(refund.invoiceId || linked.id || "-"),
          paymentMethod: String(refund.refundMethod || linked.paymentMethod || "Card"),
          transactionType: "Refund" as const,
          amount: -Math.abs(refundAmount),
          status: "Refunded" as const,
        };
      }).filter((row) => row.amount < 0);

      const merged = [...paymentRows, ...refundRows].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setTransactions(merged.length > 0 ? merged : fallbackMobileStyleData);
    };

    loadTransactions();
  }, []);

  const customers = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.customerName))).sort(),
    [transactions]
  );

  const paymentTypes = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.paymentMethod))).sort(),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        tx.customerName.toLowerCase().includes(searchLower) ||
        tx.jobId.toLowerCase().includes(searchLower) ||
        tx.invoiceId.toLowerCase().includes(searchLower);

      const matchesDateRange =
        dateRange === "" ||
        tx.date.toLowerCase().includes(dateRange.toLowerCase());

      const matchesCustomer = customerFilter === "all" || tx.customerName === customerFilter;
      const matchesJob = jobFilter === "all" || tx.jobId === jobFilter;
      const matchesPaymentType = paymentTypeFilter === "all" || tx.paymentMethod === paymentTypeFilter;
      const matchesTransactionType =
        transactionTypeFilter === "all" ||
        (transactionTypeFilter === "payment" && tx.transactionType === "Payment Received") ||
        (transactionTypeFilter === "refund" && tx.transactionType === "Refund");

      return (
        matchesSearch &&
        matchesDateRange &&
        matchesCustomer &&
        matchesJob &&
        matchesPaymentType &&
        matchesTransactionType
      );
    });
  }, [transactions, search, dateRange, customerFilter, jobFilter, paymentTypeFilter, transactionTypeFilter]);

  const totalReceived = useMemo(
    () => filteredTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const totalRefunded = useMemo(
    () => Math.abs(filteredTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)),
    [filteredTransactions]
  );

  const netPayments = totalReceived - totalRefunded;

  const clearFilters = () => {
    setSearch("");
    setDateRange("");
    setCustomerFilter("all");
    setJobFilter("all");
    setPaymentTypeFilter("all");
    setTransactionTypeFilter("all");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10">
        <TabletHeader title="Payment Details" showBack={true} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
            <Input
              type="text"
              placeholder="Search by customer, payment ID, reference…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-10 pr-4 text-sm border-gray-300 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm"
            />
          </div>

          {/* Horizontal Filters Row */}
          <div className="flex gap-3 flex-wrap">
            {/* Date Range */}
            <div className="relative flex-1 min-w-[180px]">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <Input
                type="text"
                placeholder="Select date range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-sm border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-white"
              />
            </div>

            {/* Customer Filter */}
            <div className="flex-1 min-w-[160px]">
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger className="h-10 border-gray-300 rounded-lg text-sm bg-white w-full">
                  <SelectValue placeholder="All Customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Type Filter */}
            <div className="flex-1 min-w-[160px]">
              <Select value={transactionTypeFilter} onValueChange={setTransactionTypeFilter}>
                <SelectTrigger className="h-10 border-gray-300 rounded-lg text-sm bg-white w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="payment">Payment Received</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method Filter */}
            <div className="flex-1 min-w-[160px]">
              <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
                <SelectTrigger className="h-10 border-gray-300 rounded-lg text-sm bg-white w-full">
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {paymentTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear button — only visible when filters active */}
            {(search !== "" || dateRange !== "" || customerFilter !== "all" || jobFilter !== "all" || paymentTypeFilter !== "all" || transactionTypeFilter !== "all") && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="h-10 px-4 border-gray-300 text-sm text-gray-600 hover:bg-gray-50 rounded-lg whitespace-nowrap"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div
              className="rounded-2xl p-5"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
            >
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Total Received</p>
              <p className="text-2xl font-bold" style={{ color: "#15803d" }}>{formatCurrency(totalReceived)}</p>
            </div>
            <div
              className="rounded-2xl p-5"
              style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}
            >
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Total Refunded</p>
              <p className="text-2xl font-bold" style={{ color: "#dc2626" }}>{formatCurrency(totalRefunded)}</p>
            </div>
            <div
              className="rounded-2xl p-5"
              style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
            >
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Net Payments</p>
              <p
                className="text-2xl font-bold"
                style={{ color: netPayments >= 0 ? "#1d4ed8" : "#dc2626" }}
              >
                {formatCurrency(netPayments)}
              </p>
            </div>
          </div>

          {/* Transactions List */}
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">No transactions found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-white rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
                  style={{
                    padding: "18px 20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #f0f0f0",
                    minHeight: "90px",
                  }}
                >
                  {/* Card Top Row: Customer Name (left) | Status badge (right) */}
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-base font-bold text-gray-900 leading-tight">{tx.customerName}</p>
                    <Badge
                      className="text-xs px-3 py-1 font-semibold rounded-full border-0 ml-3 shrink-0"
                      style={
                        tx.status === "Refunded"
                          ? { background: "#fde8e8", color: "#dc2626" }
                          : { background: "#e6f7ec", color: "#16a34a" }
                      }
                    >
                      {tx.status === "Refunded" ? "Refunded" : tx.transactionType === "Payment Received" ? "Received" : "Paid"}
                    </Badge>
                  </div>

                  {/* Date (left) | Payment ID (right) */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-500">{tx.date}</p>
                    <p className="text-sm text-gray-400 font-mono">{tx.id}</p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 mb-3" />

                  {/* Footer: Amount + Method (left) | View > (right) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-lg font-bold"
                        style={{ color: tx.amount < 0 ? "#dc2626" : "#16a34a" }}
                      >
                        {tx.amount < 0
                          ? `-${formatCurrency(Math.abs(tx.amount))}`
                          : formatCurrency(tx.amount)}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {tx.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-orange-500">
                      <span>View</span>
                      <span>›</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsReport;
