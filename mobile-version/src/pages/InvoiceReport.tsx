import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Filter } from "lucide-react";
import { mockInvoices } from "@/data/mobileMockData";
import { cn } from "@/lib/utils";

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
  itemName: [
    "HVAC Installation",
    "Plumbing Repair",
    "Electrical Service",
    "AC Maintenance",
    "Water Heater Replacement",
  ][idx % 5],
  sku: [
    `SVC-${String(idx + 1).padStart(3, "0")}`,
    `SVC-${String(idx + 2).padStart(3, "0")}`,
    `SVC-${String(idx + 3).padStart(3, "0")}`,
  ][idx % 3],
}));

const InvoiceReport = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);

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
        matchesEmployee &&
        matchesDateRange
      );
    });
  }, [search, dateRange, statusFilter, paymentTypeFilter, employeeFilter]);

  const clearFilters = () => {
    setSearch("");
    setDateRange("");
    setStatusFilter("all");
    setPaymentTypeFilter("all");
    setEmployeeFilter("all");
  };

  const hasActiveFilters =
    search !== "" ||
    dateRange !== "" ||
    statusFilter !== "all" ||
    paymentTypeFilter !== "all" ||
    employeeFilter !== "all";

  const handleOrderClick = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700 border-green-200";
      case "Open":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <MobileHeader title="Invoice Reports" showBack={true} />

      <div className="flex-1 overflow-y-auto scrollable pt-14 pb-6">
        <div className="px-4 space-y-4">
          {/* Search + filter toggle */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, order ID, SKU, etc."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3"
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => setShowFilters((prev) => !prev)}
              aria-label="Toggle filters"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters card */}
          {showFilters && (
            <div className="rounded-xl border bg-card p-3 space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Date Range</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Select date range"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Payment Type</label>
                  <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All payment types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payment Types</SelectItem>
                      <SelectItem value="recurring">Recurring</SelectItem>
                      <SelectItem value="single">Single</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Employee</label>
                <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All employees" />
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

              <div className="pt-1">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                  disabled={!hasActiveFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          {/* Invoice list */}
          <div className="space-y-3">
            {filteredInvoices.length === 0 ? (
              <div className="text-center text-muted-foreground py-10 text-sm">No invoices found</div>
            ) : (
              filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="rounded-xl border bg-card p-3 shadow-sm cursor-pointer"
                  onClick={() => handleOrderClick(invoice.id)}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-foreground truncate" title={invoice.customerName}>
                        {invoice.customerName}
                      </p>
                    </div>
                    <Badge
                      className={cn("text-xs px-2.5 py-1 h-6 border", getStatusBadgeClass(invoice.status))}
                    >
                      {invoice.status}
                    </Badge>
                  </div>

                  {/* Second row */}
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span className="font-medium text-primary/80">{invoice.id}</span>
                    <span>{invoice.issueDate}</span>
                  </div>

                  {/* Third row */}
                  <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                    <span className="truncate" title={invoice.employeeName || "-"}>
                      {invoice.employeeName || "-"}
                    </span>
                    {invoice.itemName && (
                      <span className="text-xs bg-muted text-foreground/80 px-2 py-1 rounded-full border border-border truncate" title={invoice.itemName}>
                        {invoice.itemName}
                      </span>
                    )}
                  </div>

                  {/* Bottom row */}
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {invoice.type === "recurring" ? "Recurring" : "Single"}
                      {invoice.sku ? ` • ${invoice.sku}` : ""}
                    </span>
                    <span className="text-lg font-semibold text-green-600">
                      ${invoice.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceReport;
