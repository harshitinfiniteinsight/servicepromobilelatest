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
  if (status === "Paid") return "Paid";
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

            {/* Estimate List */}
            <div className="space-y-2">
              {filteredEstimates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No estimates found</p>
                </div>
              ) : (
                filteredEstimates.map((estimate) => (
                  <div
                    key={estimate.id}
                    onClick={() => handleEstimateClick(estimate.id)}
                    className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                  >
                    {/* Compact Grid Layout */}
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Date Column */}
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{estimate.date}</p>
                      </div>

                      {/* Order ID Column */}
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Order ID</p>
                        <p className="text-sm font-semibold text-teal-600 hover:text-teal-700 mt-0.5">
                          {estimate.id}
                        </p>
                      </div>

                      {/* Customer Name Column */}
                      <div className="col-span-3">
                        <p className="text-xs text-gray-500">Customer</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5 truncate" title={estimate.customerName}>
                          {estimate.customerName}
                        </p>
                      </div>

                      {/* Employee Name Column */}
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Employee</p>
                        <p className="text-sm text-gray-700 mt-0.5 truncate" title={estimate.employeeName}>
                          {estimate.employeeName || "-"}
                        </p>
                      </div>

                      {/* Amount + Status (combined, prevents overlap) */}
                      <div className="col-span-3 flex items-center justify-end gap-3">
                        <div className="text-right whitespace-nowrap">
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="text-base font-semibold text-green-600 mt-0.5">
                            ${estimate.amount.toFixed(2)}
                          </p>
                        </div>
                        <Badge
                          className={`text-xs px-2.5 py-1 h-6 flex-shrink-0 ${
                            getEstimateDisplayStatus(estimate.status) === "Paid"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : getEstimateDisplayStatus(estimate.status) === "Converted to Invoice"
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : "bg-orange-100 text-orange-700 border-orange-200"
                          }`}
                        >
                          {getEstimateDisplayStatus(estimate.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
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
