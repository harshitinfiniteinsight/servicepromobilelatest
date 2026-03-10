import { useState, useMemo } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Filter, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import TransactionDetailsModal, { TransactionRecord } from "@/components/modals/TransactionDetailsModal";

const mockPayments: TransactionRecord[] = [
  {
    id: "PMT-001",
    date: "2026-03-01",
    time: "10:24 AM",
    customerName: "John Smith",
    customerEmail: "john.smith@example.com",
    customerId: "C001",
    jobId: "JOB-1234",
    referenceId: "INV-1001",
    referenceType: "Invoice",
    amount: 1250.00,
    status: "Paid",
    paymentMethod: "Card",
    cardLast4: "4242",
    cardBrand: "VISA",
    cardExpiry: "11/27",
    transactionNumber: "TXN-847362-001",
    merchantId: "MER-001",
    authorizationCode: "AUTH-123456",
    orderType: "Service",
    processedBy: "Jane Smith",
    transactionStatus: "Completed",
    transactionNotes: "Payment processed successfully. Customer invoiced.",
  },
  {
    id: "PMT-002",
    date: "2026-03-01",
    time: "9:42 AM",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@company.com",
    customerId: "C002",
    jobId: "JOB-1235",
    referenceId: "INV-1002",
    referenceType: "Invoice",
    amount: 890.50,
    status: "Received",
    paymentMethod: "Bank Transfer",
    transactionNumber: "TXN-847362-002",
    merchantId: "MER-001",
    orderType: "Product",
    processedBy: "John Doe",
    transactionStatus: "Completed",
  },
  {
    id: "PMT-003",
    date: "2026-02-28",
    time: "3:18 PM",
    customerName: "Michael Brown",
    customerEmail: "m.brown@email.com",
    customerId: "C003",
    jobId: null,
    referenceId: "EST-2001",
    referenceType: "Estimate",
    amount: 450.00,
    status: "Received",
    paymentMethod: "Cash",
    transactionNumber: "TXN-847362-003",
    merchantId: "MER-001",
    orderType: "Service",
    processedBy: "Admin User",
    transactionStatus: "Completed",
  },
  {
    id: "PMT-004",
    date: "2026-02-28",
    time: "11:07 AM",
    customerName: "Emily Davis",
    customerEmail: "emily.davis@corp.com",
    customerId: "C004",
    jobId: "JOB-1230",
    referenceId: "INV-1003",
    referenceType: "Invoice",
    amount: 320.00,
    status: "Refunded",
    paymentMethod: "Card",
    cardLast4: "1998",
    cardBrand: "Mastercard",
    cardExpiry: "08/26",
    transactionNumber: "TXN-847362-004",
    totalAmount: 320.00,
    refundedAmount: 320.00,
    refundReason: "Duplicate charge",
    merchantId: "MER-001",
    authorizationCode: "AUTH-654321",
    orderType: "Service",
    processedBy: "Support Team",
    transactionStatus: "Refunded",
    transactionNotes: "Full refund issued. Issue resolved with customer.",
  },
  {
    id: "PMT-005",
    date: "2026-02-27",
    time: "2:39 PM",
    customerName: "David Wilson",
    customerId: "C005",
    jobId: "JOB-1236",
    referenceId: "AGR-3001",
    referenceType: "Agreement",
    amount: 2500.00,
    status: "Refunded",
    paymentMethod: "Check",
    transactionNumber: "TXN-847362-005",
    totalAmount: 2500.00,
    refundedAmount: 2500.00,
    refundReason: "Service cancelled by customer",
    merchantId: "MER-001",
    orderType: "Agreement",
    processedBy: "Finance Team",
    transactionStatus: "Refunded",
    transactionNotes: "Service cancelled by customer. Full refund processed.\n\nRefund Method: Check\nCheck Number: 458321\nComment: Refund issued via mailed check",
  },
  {
    id: "PMT-006",
    date: "2026-02-27",
    time: "1:12 PM",
    customerName: "Lisa Anderson",
    customerEmail: "lisa.anderson@biz.com",
    customerId: "C006",
    jobId: "JOB-1237",
    referenceId: "INV-1004",
    referenceType: "Invoice",
    amount: 675.25,
    status: "Paid",
    paymentMethod: "Card",
    cardLast4: "8874",
    cardBrand: "VISA",
    cardExpiry: "05/28",
    transactionNumber: "TXN-847362-006",
    merchantId: "MER-001",
    authorizationCode: "AUTH-789012",
    orderType: "Service",
    processedBy: "Jane Smith",
    transactionStatus: "Completed",
  },
  {
    id: "PMT-007",
    date: "2026-02-26",
    time: "4:56 PM",
    customerName: "Robert Taylor",
    customerId: "C007",
    jobId: null,
    referenceId: "EST-2002",
    referenceType: "Estimate",
    amount: 180.00,
    status: "Refunded",
    paymentMethod: "Cash",
    transactionNumber: "TXN-847362-007",
    totalAmount: 200.00,
    refundedAmount: 180.00,
    refundReason: "Service not delivered",
    merchantId: "MER-001",
    orderType: "Service",
    processedBy: "Support Team",
    transactionStatus: "Refunded",
    transactionNotes: "Partial refund issued. Estimate expired.",
  },
  {
    id: "PMT-008",
    date: "2026-02-25",
    time: "12:32 PM",
    customerName: "Jennifer Martinez",
    customerEmail: "j.martinez@service.com",
    customerId: "C008",
    jobId: "JOB-1238",
    referenceId: "INV-1005",
    referenceType: "Invoice",
    amount: 1890.00,
    status: "Paid",
    paymentMethod: "Bank Transfer",
    transactionNumber: "TXN-847362-008",
    merchantId: "MER-001",
    orderType: "Product",
    processedBy: "John Doe",
    transactionStatus: "Completed",
  },
  {
    id: "PMT-009",
    date: "2026-02-25",
    time: "8:58 AM",
    customerName: "William Garcia",
    customerId: "C009",
    jobId: "JOB-1239",
    referenceId: "AGR-3002",
    referenceType: "Agreement",
    amount: 3200.00,
    status: "Paid",
    paymentMethod: "Check",
    transactionNumber: "TXN-847362-009",
    merchantId: "MER-001",
    orderType: "Agreement",
    processedBy: "Finance Team",
    transactionStatus: "Completed",
  },
  {
    id: "PMT-010",
    date: "2026-02-24",
    time: "5:14 PM",
    customerName: "Amanda Rodriguez",
    customerEmail: "a.rodriguez@email.com",
    customerId: "C010",
    jobId: "JOB-1240",
    referenceId: "INV-1006",
    referenceType: "Invoice",
    amount: 550.00,
    status: "Refunded",
    paymentMethod: "Card",
    cardLast4: "5521",
    cardBrand: "Amex",
    cardExpiry: "02/25",
    transactionNumber: "TXN-847362-010",
    totalAmount: 550.00,
    refundedAmount: 550.00,
    refundReason: "Customer canceled order",
    merchantId: "MER-001",
    authorizationCode: "AUTH-345678",
    orderType: "Product",
    processedBy: "Support Team",
    transactionStatus: "Refunded",
    transactionNotes: "Full refund processed per customer request.",
  },
];

const PaymentDetails = () => {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filter and sort payments
  const filteredPayments = useMemo(() => {
    let filtered = mockPayments.filter((payment) => {
      // Search filter
      const matchesSearch =
        search === "" ||
        payment.customerName.toLowerCase().includes(search.toLowerCase()) ||
        payment.id.toLowerCase().includes(search.toLowerCase()) ||
        payment.referenceId.toLowerCase().includes(search.toLowerCase()) ||
        payment.jobId?.toLowerCase().includes(search.toLowerCase());

      // Date range filter (if set)
      const matchesDateRange =
        dateRange === "" ||
        (() => {
          // Simple date range check - in real app, parse dateRange properly
          return true;
        })();

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        payment.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesDateRange && matchesStatus;
    });

    // Sort by date (latest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [search, dateRange, statusFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    if (status === "Refunded") {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
          {status}
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
        {status}
      </Badge>
    );
  };

  const handleViewDetails = (payment: TransactionRecord) => {
    setSelectedTransaction(payment);
    setIsDetailsOpen(true);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <MobileHeader title="Payment Details" showBack={true} />

      <div className="flex-1 overflow-y-auto scrollable pt-14 pb-6">
        <div className="px-4 space-y-4">
          {/* Search + Date Range */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by customer, payment ID, reference..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3"
                />
              </div>
            </div>
          </div>

          {/* Date Range & Status Filter - Two Column Layout */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            {/* Date Range */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Select date range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="pl-9 text-sm truncate"
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  paddingRight: '2rem'
                }}
              >
                <option value="all">All</option>
                <option value="received">Received</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs font-medium text-green-700 mb-1">Total Received</p>
              <p className="text-xl font-bold text-green-800">
                {formatAmount(
                  filteredPayments
                    .filter((p) => p.status === "Received")
                    .reduce((sum, p) => sum + p.amount, 0)
                )}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs font-medium text-red-700 mb-1">Total Refunded</p>
              <p className="text-xl font-bold text-red-800">
                {formatAmount(
                  filteredPayments
                    .filter((p) => p.status === "Refunded")
                    .reduce((sum, p) => sum + p.amount, 0)
                )}
              </p>
            </div>
          </div>

          {/* Payment List */}
          {filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">No payment records yet</p>
              <p className="text-sm text-gray-500 text-center">
                Payment transactions will appear here once recorded
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  onClick={() => handleViewDetails(payment)}
                  className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer active:bg-gray-50"
                >
                  {/* Row 1: Customer Name + Status Badge */}
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate flex-1">
                      {payment.customerName}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {getStatusBadge(payment.status)}
                      {payment.status === "Refunded" && 
                        payment.refundedAmount !== undefined && 
                        payment.totalAmount !== undefined && 
                        payment.refundedAmount < payment.totalAmount && (
                        <Badge className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded">
                          Partial
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Date + Transaction ID */}
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <p className="text-xs text-gray-500">{formatDate(payment.date)}</p>
                    <p className="text-xs text-gray-400 font-medium text-right flex-shrink-0">
                      {payment.id}
                    </p>
                  </div>

                  {/* Row 3: Amount + View Details */}
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "text-base font-bold",
                        payment.status === "Received" || payment.status === "Paid" ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {formatAmount(payment.amount)}
                    </p>
                    <div className="flex items-center gap-1 text-primary text-xs font-medium flex-shrink-0">
                      View
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TransactionDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default PaymentDetails;
