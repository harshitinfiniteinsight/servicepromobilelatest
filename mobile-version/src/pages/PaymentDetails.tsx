import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  date: string;
  customerName: string;
  customerId: string;
  jobId: string | null;
  referenceId: string;
  referenceType: "Invoice" | "Estimate" | "Agreement";
  amount: number;
  status: "Received" | "Refunded";
}

// Mock payment data
const mockPayments: Payment[] = [
  {
    id: "PMT-001",
    date: "2026-03-01",
    customerName: "John Smith",
    customerId: "C001",
    jobId: "JOB-1234",
    referenceId: "INV-1001",
    referenceType: "Invoice",
    amount: 1250.00,
    status: "Received",
  },
  {
    id: "PMT-002",
    date: "2026-03-01",
    customerName: "Sarah Johnson",
    customerId: "C002",
    jobId: "JOB-1235",
    referenceId: "INV-1002",
    referenceType: "Invoice",
    amount: 890.50,
    status: "Received",
  },
  {
    id: "PMT-003",
    date: "2026-02-28",
    customerName: "Michael Brown",
    customerId: "C003",
    jobId: null,
    referenceId: "EST-2001",
    referenceType: "Estimate",
    amount: 450.00,
    status: "Received",
  },
  {
    id: "PMT-004",
    date: "2026-02-28",
    customerName: "Emily Davis",
    customerId: "C004",
    jobId: "JOB-1230",
    referenceId: "INV-1003",
    referenceType: "Invoice",
    amount: 320.00,
    status: "Refunded",
  },
  {
    id: "PMT-005",
    date: "2026-02-27",
    customerName: "David Wilson",
    customerId: "C005",
    jobId: "JOB-1236",
    referenceId: "AGR-3001",
    referenceType: "Agreement",
    amount: 2500.00,
    status: "Received",
  },
  {
    id: "PMT-006",
    date: "2026-02-27",
    customerName: "Lisa Anderson",
    customerId: "C006",
    jobId: "JOB-1237",
    referenceId: "INV-1004",
    referenceType: "Invoice",
    amount: 675.25,
    status: "Received",
  },
  {
    id: "PMT-007",
    date: "2026-02-26",
    customerName: "Robert Taylor",
    customerId: "C007",
    jobId: null,
    referenceId: "EST-2002",
    referenceType: "Estimate",
    amount: 180.00,
    status: "Refunded",
  },
  {
    id: "PMT-008",
    date: "2026-02-25",
    customerName: "Jennifer Martinez",
    customerId: "C008",
    jobId: "JOB-1238",
    referenceId: "INV-1005",
    referenceType: "Invoice",
    amount: 1890.00,
    status: "Received",
  },
  {
    id: "PMT-009",
    date: "2026-02-25",
    customerName: "William Garcia",
    customerId: "C009",
    jobId: "JOB-1239",
    referenceId: "AGR-3002",
    referenceType: "Agreement",
    amount: 3200.00,
    status: "Received",
  },
  {
    id: "PMT-010",
    date: "2026-02-24",
    customerName: "Amanda Rodriguez",
    customerId: "C010",
    jobId: "JOB-1240",
    referenceId: "INV-1006",
    referenceType: "Invoice",
    amount: 550.00,
    status: "Refunded",
  },
];

const PaymentDetails = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const getStatusBadge = (status: "Received" | "Refunded") => {
    if (status === "Received") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
          Received
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
        Refunded
      </Badge>
    );
  };

  const handlePaymentClick = (payment: Payment) => {
    // Navigate to the appropriate reference screen
    if (payment.referenceType === "Invoice") {
      navigate(`/invoices/${payment.referenceId}`);
    } else if (payment.referenceType === "Estimate") {
      navigate(`/estimates/${payment.referenceId}`);
    } else if (payment.referenceType === "Agreement") {
      navigate(`/agreements/${payment.referenceId}`);
    }
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
                  onClick={() => handlePaymentClick(payment)}
                  className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* Top Row: Customer + Status */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {payment.customerName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(payment.date)}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>

                  {/* Bottom Grid: Details (2 columns) */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <div className="space-y-1">
                      <p className="text-gray-500">{payment.id}</p>
                      {payment.jobId && (
                        <p className="text-gray-500">{payment.jobId}</p>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-gray-500">{payment.referenceId}</p>
                      <p
                        className={cn(
                          "text-base font-bold",
                          payment.status === "Received" ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {payment.status === "Refunded" ? "-" : ""}
                        {formatAmount(payment.amount)}
                      </p>
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

export default PaymentDetails;
