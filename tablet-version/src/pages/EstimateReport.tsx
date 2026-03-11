import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TabletHeader from "@/components/layout/TabletHeader";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, Calendar, Bell } from "lucide-react";
import { mockEstimates } from "@/data/mobileMockData";
import { toast } from "sonner";

interface Estimate {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  status: string;
  probability: number;
  employeeName?: string;
}

// Only allow Paid | Open | Converted to Invoice to be displayed
const getEstimateDisplayStatus = (
  status: string
): "Paid" | "Open" | "Converted to Invoice" => {
  if (status === "Paid" || status === "Converted to Invoice") return "Converted to Invoice";
  if (status === "Converted to Invoice") return "Converted to Invoice";
  return "Open";
};

// Enhanced estimate data with employee info
const enhancedEstimates: Estimate[] = mockEstimates.map((est, idx) => ({
  ...est,
  employeeName: ["Mike Johnson", "Tom Wilson", "Chris Davis", "Sarah Martinez", "James Anderson"][idx % 5],
}));

const EstimateReport = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [showMonthlyAlert, setShowMonthlyAlert] = useState(false);
  const [emailAlert, setEmailAlert] = useState(false);
  const [smsAlert, setSmsAlert] = useState(false);

  // Get unique employee names
  const employeeNames = Array.from(new Set(enhancedEstimates.map((est) => est.employeeName).filter(Boolean))) as string[];

  // Filter estimates
  const filteredEstimates = useMemo(() => {
    return enhancedEstimates.filter((estimate) => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        estimate.id.toLowerCase().includes(searchLower) ||
        estimate.customerName.toLowerCase().includes(searchLower) ||
        estimate.employeeName?.toLowerCase().includes(searchLower);

      // Status filter (use mapped display status)
      const displayStatus = getEstimateDisplayStatus(estimate.status);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && displayStatus === "Open") ||
        (statusFilter === "paid" && displayStatus === "Paid") ||
        (statusFilter === "converted" && displayStatus === "Converted to Invoice");

      // Employee filter
      const matchesEmployee = employeeFilter === "all" || estimate.employeeName === employeeFilter;

      // Date range filter (simplified)
      const matchesDateRange = dateRange === "" || estimate.date.includes(dateRange);

      return matchesSearch && matchesStatus && matchesEmployee && matchesDateRange;
    });
  }, [search, dateRange, statusFilter, employeeFilter]);

  // Check if any filters are active
  const hasActiveFilters =
    search !== "" ||
    dateRange !== "" ||
    statusFilter !== "all" ||
    employeeFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setDateRange("");
    setStatusFilter("all");
    setEmployeeFilter("all");
    toast.success("Filters cleared");
  };

  const handleEstimateClick = (estimateId: string) => {
    navigate(`/estimates/${estimateId}`);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10">
        <TabletHeader
          title="Estimate Reports"
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
                  <SelectItem value="converted">Converted to Invoice</SelectItem>
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
                  placeholder="Search by estimate ID, customer name, employee..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-9 pr-3 text-sm border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-white"
                />
              </div>
            </div>

            {/* Estimate Cards Grid */}
            {filteredEstimates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">No estimates found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}
              >
                {filteredEstimates.map((estimate) => {
                  const displayStatus = getEstimateDisplayStatus(estimate.status);
                  return (
                    <div
                      key={estimate.id}
                      onClick={() => handleEstimateClick(estimate.id)}
                      className="bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
                      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}
                    >
                      {/* Card Header: Estimate ID (left) + Date (right) */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full tracking-wide">
                          {estimate.id}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{estimate.date}</span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-100 mb-3" />

                      {/* Card Body: Customer + Employee on same row */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 mb-0.5">Customer</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{estimate.customerName}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 mb-0.5">Employee</p>
                          <p className="text-sm text-gray-600 truncate">{estimate.employeeName || "—"}</p>
                        </div>
                      </div>

                      {/* Card Footer: Amount + Status */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span
                          className="text-base font-bold"
                          style={{ color: "#16a34a" }}
                        >
                          ${estimate.amount.toFixed(2)}
                        </span>
                        <Badge
                          className={`text-xs px-3 py-1 font-semibold rounded-full border-0 ${
                            displayStatus === "Converted to Invoice"
                              ? "text-blue-700 hover:bg-blue-100"
                              : displayStatus === "Paid"
                              ? "text-green-700 hover:bg-green-100"
                              : "text-orange-700 hover:bg-orange-100"
                          }`}
                          style={
                            displayStatus === "Converted to Invoice"
                              ? { background: "#e3f2fd", color: "#1976d2" }
                              : displayStatus === "Paid"
                              ? { background: "#e8f5e9", color: "#2e7d32" }
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
              Configure how you'd like to receive your monthly estimate reports
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Email Alert Section */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Monthly Email Alert</p>
                <p className="text-sm text-gray-600 mt-1">Receive estimate reports via email</p>
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
                <p className="text-sm text-gray-600 mt-1">Receive estimate reports via SMS</p>
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

export default EstimateReport;
