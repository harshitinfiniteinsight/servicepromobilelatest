import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Calendar, X, Download, Share2 } from "lucide-react";
import { mockInvoices } from "@/data/mobileMockData";
import { toast } from "sonner";

interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: string;
  paymentMethod: string;
  type: string;
  employeeName?: string;
  itemName?: string;
  sku?: string;
}

// Enhanced invoice data with employee and item info
const enhancedInvoices: Invoice[] = mockInvoices.map((inv, idx) => ({
  ...inv,
  employeeName: ["Mike Johnson", "Tom Wilson", "Chris Davis", "Sarah Martinez"][idx % 4],
  itemName: ["HVAC Installation", "Plumbing Repair", "Electrical Service", "AC Maintenance", "Water Heater Replacement"][idx % 5],
  sku: [`SVC-${String(idx + 1).padStart(3, "0")}`, `SVC-${String(idx + 2).padStart(3, "0")}`, `SVC-${String(idx + 3).padStart(3, "0")}`][idx % 3],
}));

const InvoiceReport = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>("all");
  const [daysFilter, setDaysFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");

  // Get unique employee names
  const employeeNames = useMemo(() => {
    const unique = Array.from(new Set(enhancedInvoices.map((inv) => inv.employeeName).filter(Boolean)));
    return unique as string[];
  }, []);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return enhancedInvoices.filter((invoice) => {
      // Search filter
      const matchesSearch =
        search === "" ||
        invoice.customerName.toLowerCase().includes(search.toLowerCase()) ||
        invoice.id.toLowerCase().includes(search.toLowerCase()) ||
        invoice.sku?.toLowerCase().includes(search.toLowerCase()) ||
        invoice.itemName?.toLowerCase().includes(search.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && invoice.status === "Open") ||
        (statusFilter === "paid" && invoice.status === "Paid");

      // Payment type filter
      const matchesPaymentType =
        paymentTypeFilter === "all" ||
        (paymentTypeFilter === "recurring" && invoice.type === "recurring") ||
        (paymentTypeFilter === "single" && invoice.type === "single");

      // Days filter
      const matchesDays = (() => {
        if (daysFilter === "all") return true;
        const invoiceDate = new Date(invoice.issueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        if (daysFilter === "today") {
          return invoiceDate.getTime() === today.getTime();
        }
        if (daysFilter === "yesterday") {
          return invoiceDate.getTime() === yesterday.getTime();
        }
        if (daysFilter === "this-week") {
          return invoiceDate >= weekAgo && invoiceDate <= today;
        }
        return true;
      })();

      // Employee filter
      const matchesEmployee =
        employeeFilter === "all" || invoice.employeeName === employeeFilter;

      // Date range filter (if set)
      const matchesDateRange =
        dateRange === "" ||
        (() => {
          // Simple date range check - in real app, parse dateRange properly
          return true;
        })();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPaymentType &&
        matchesDays &&
        matchesEmployee &&
        matchesDateRange
      );
    });
  }, [search, dateRange, statusFilter, paymentTypeFilter, daysFilter, employeeFilter]);

  const clearFilters = () => {
    setSearch("");
    setDateRange("");
    setStatusFilter("all");
    setPaymentTypeFilter("all");
    setDaysFilter("all");
    setEmployeeFilter("all");
  };

  const hasActiveFilters =
    search !== "" ||
    dateRange !== "" ||
    statusFilter !== "all" ||
    paymentTypeFilter !== "all" ||
    daysFilter !== "all" ||
    employeeFilter !== "all";

  const handleOrderClick = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handleDownloadPDF = () => {
    toast.success("Downloading invoice report as PDF...");
    // In real app, trigger PDF download
  };

  const handleDownloadCSV = () => {
    toast.success("Downloading invoice report as CSV...");
    // In real app, trigger CSV download
  };

  const handleShareEmail = () => {
    toast.success("Sharing invoice report via email...");
    // In real app, trigger email share
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader
        title="Invoice Reports"
        showBack={true}
        actions={
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-100"
                >
                  <Share2 className="h-4 w-4 text-gray-700" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleShareEmail}>
                  Share via Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-100"
                >
                  <Download className="h-4 w-4 text-gray-700" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleDownloadPDF}>
                  Download as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadCSV}>
                  Download as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <div
        className="flex-1 overflow-y-auto scrollable px-4 pb-4"
        style={{
          paddingTop: "calc(3.5rem + env(safe-area-inset-top) + 0.5rem)",
        }}
      >
        {/* Filters Section */}
        <div className="space-y-1.5 mb-1 mt-1">
          {/* Row 1: Date Range (70%) + Days Filter (30%) */}
          <div className="flex gap-1.5 items-center">
            {/* Date Range - 70% */}
            <div className="relative flex-[0.7]">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <Input
                type="text"
                placeholder="Select Date Range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full h-[40px] pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Days Filter - 30% */}
            <div className="flex-[0.3]">
              <Select value={daysFilter} onValueChange={setDaysFilter}>
                <SelectTrigger className="w-full h-[40px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
                  <SelectValue placeholder="All Days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Days</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Search Field - Full Width */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
            <Input
              type="text"
              placeholder="Search by name, order ID, SKU, etc."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[40px] pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Row 3: Status (50%) + Payment Type (50%) */}
          <div className="flex gap-1.5">
            {/* Status Filter */}
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full h-[40px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Type Filter */}
            <div className="flex-1">
              <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
                <SelectTrigger className="w-full h-[40px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
                  <SelectValue placeholder="All Payment Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Types</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                  <SelectItem value="single">Single</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Employee (50%) + Clear Filter Button (50%) */}
          <div className="flex gap-2">
            {/* Employee Filter */}
            <div className="flex-1">
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger className="w-full h-[40px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employeeNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filter Button */}
            <div className="flex-1">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full h-[40px] border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Invoice List */}
        <div className="space-y-2">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No invoices found</p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-sm"
              >
                {/* Top Row: Order ID (left) | Status Badge (right) */}
                <div className="flex justify-between items-start mb-0.5">
                  <button
                    onClick={() => handleOrderClick(invoice.id)}
                    className="text-sm font-medium text-teal-600 hover:text-teal-700 active:text-teal-800 transition-colors"
                  >
                    {invoice.id}
                  </button>
                  <Badge
                    className={`text-xs px-2 py-0.5 h-6 flex-shrink-0 ${
                      invoice.status === "Paid"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : invoice.status === "Open"
                        ? "bg-orange-100 text-orange-700 border-orange-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    {invoice.status}
                  </Badge>
                </div>

                {/* Date */}
                <p className="text-[10px] text-gray-500 mb-1">{invoice.issueDate}</p>

                {/* Divider */}
                <div className="border-t border-gray-100 my-1.5"></div>

                {/* Customer Info */}
                <div className="mb-1">
                  <h3 className="text-sm font-semibold text-gray-800">
                    {invoice.customerName}
                  </h3>
                  {invoice.employeeName && (
                    <p className="text-[10px] text-gray-600 mt-0.5">Employee: {invoice.employeeName}</p>
                  )}
                </div>

                {/* Item Details */}
                {invoice.itemName && (
                  <div className="mb-1">
                    <p className="text-sm text-gray-700 mb-0.5">{invoice.itemName}</p>
                    {invoice.sku && (
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-200 h-5"
                      >
                        {invoice.sku}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Amount & Payment Type */}
                <div className="flex items-end justify-between pt-0.5">
                  <div>
                    <p className="text-sm font-semibold text-green-600">
                      ${invoice.amount.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {invoice.type === "recurring" ? "Recurring" : "Single"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceReport;
