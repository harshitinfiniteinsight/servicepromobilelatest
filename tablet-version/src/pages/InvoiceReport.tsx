import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TabletHeader from "@/components/layout/TabletHeader";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, Calendar, Bell } from "lucide-react";
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

// Only allow Paid | Open to be displayed
const getInvoiceDisplayStatus = (status: string): "Paid" | "Open" => {
  return status === "Paid" ? "Paid" : "Open";
};

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
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [showMonthlyAlert, setShowMonthlyAlert] = useState(false);
  const [emailAlert, setEmailAlert] = useState(false);
  const [smsAlert, setSmsAlert] = useState(false);

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
      const displayStatus = getInvoiceDisplayStatus(invoice.status);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && displayStatus === "Open") ||
        (statusFilter === "paid" && displayStatus === "Paid");

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

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10">
        <TabletHeader
          title="Invoice Reports"
          showBack={true}
          actions={
            <Button
              variant="outline"
              onClick={() => setShowMonthlyAlert(true)}
              className="h-9 px-4 border-gray-300 hover:bg-gray-50 text-sm font-medium"
            >
              <Bell className="h-4 w-4 mr-2" />
              Monthly Report Alert
            </Button>
          }
        />
      </div>

      {/* Main Content: Side-by-side layout */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Section: Filters Panel */}
        <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
            
            {/* Date Range Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder="Select Date Range"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 text-sm border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full h-10 border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
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
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Payment Type</label>
              <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
                <SelectTrigger className="w-full h-10 border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
                  <SelectValue placeholder="All Payment Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Types</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                  <SelectItem value="single">Single</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Employee Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Employee</label>
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger className="w-full h-10 border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
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
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-full h-10 border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Right Section: Content Panel */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder="Search by name, order ID, SKU, etc."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-9 pr-3 text-sm border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-white"
                />
              </div>
            </div>

            {/* Invoice Cards */}
            {filteredInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">No invoices found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {filteredInvoices.map((invoice) => {
                  const displayStatus = getInvoiceDisplayStatus(invoice.status);
                  return (
                    <div
                      key={invoice.id}
                      onClick={() => handleOrderClick(invoice.id)}
                      className="bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
                      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}
                    >
                      {/* HEADER: Invoice ID (left) | Date (right) */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full tracking-wide">
                          {invoice.id}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{invoice.issueDate}</span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-100 mb-3" />

                      {/* DETAIL ROW: Customer (left) | Service Type (right) */}
                      <div className="flex items-start gap-4 mb-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 mb-0.5">Customer</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{invoice.customerName}</p>
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                          <p className="text-xs text-gray-400 mb-0.5">Service</p>
                          <p className="text-sm text-gray-700 truncate">{invoice.itemName || "—"}</p>
                        </div>
                      </div>

                      {/* SUB DETAILS: Employee (left) | SKU (right) */}
                      <div className="flex items-start gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 mb-0.5">Employee</p>
                          <p className="text-sm text-gray-600 truncate">{invoice.employeeName || "—"}</p>
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                          <p className="text-xs text-gray-400 mb-0.5">SKU</p>
                          <p className="text-sm text-gray-500 font-mono truncate">{invoice.sku || "—"}</p>
                        </div>
                      </div>

                      {/* FOOTER: Amount (left) | Status badge (right) */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          <span
                            className="text-base font-bold"
                            style={{ color: "#16a34a" }}
                          >
                            ${invoice.amount.toFixed(2)}
                          </span>
                          {invoice.type && (
                            <span className="ml-2 text-xs text-gray-400">
                              {invoice.type === "recurring" ? "Recurring" : "Single"}
                            </span>
                          )}
                        </div>
                        <Badge
                          className="text-xs px-3 py-1 font-semibold rounded-full border-0"
                          style={
                            displayStatus === "Paid"
                              ? { background: "#e6f7ec", color: "#16a34a" }
                              : { background: "#fff3e0", color: "#ef6c00" }
                          }
                        >
                          {displayStatus}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Report Alert Modal */}
      <Dialog open={showMonthlyAlert} onOpenChange={setShowMonthlyAlert}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Monthly Report Alert</DialogTitle>
            <DialogDescription>
              Configure how you'd like to receive your monthly invoice reports
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Email Alert Section */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Monthly Email Alert</p>
                <p className="text-sm text-gray-600 mt-1">Receive invoice reports via email</p>
              </div>
              <button
                onClick={() => setEmailAlert(!emailAlert)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailAlert ? "bg-orange-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailAlert ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* SMS Alert Section */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Monthly SMS Alert</p>
                <p className="text-sm text-gray-600 mt-1">Receive invoice reports via SMS</p>
              </div>
              <button
                onClick={() => setSmsAlert(!smsAlert)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  smsAlert ? "bg-orange-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    smsAlert ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMonthlyAlert(false)} className="h-10 px-6 text-sm font-semibold">
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Alert preferences saved");
                setShowMonthlyAlert(false);
              }}
              className="h-10 px-6 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceReport;
