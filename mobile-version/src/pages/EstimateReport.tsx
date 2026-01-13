import { useMemo, useState } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockEstimates } from "@/data/mobileMockData";
import { Calendar, Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const EstimateReport = () => {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Enrich estimates with employees (parity with tablet view)
  const enhancedEstimates = useMemo(
    () =>
      mockEstimates.map((est, idx) => ({
        ...est,
        employeeName: [
          "Mike Johnson",
          "Tom Wilson",
          "Chris Davis",
          "Sarah Martinez",
          "James Anderson",
        ][idx % 5],
      })),
    []
  );

  const employeeNames = useMemo(
    () =>
      Array.from(
        new Set(
          enhancedEstimates
            .map((est) => est.employeeName)
            .filter((name): name is string => Boolean(name))
        )
      ),
    [enhancedEstimates]
  );

  const filteredEstimates = useMemo(() => {
    return enhancedEstimates.filter((estimate) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        estimate.id.toLowerCase().includes(searchLower) ||
        estimate.customerName.toLowerCase().includes(searchLower) ||
        estimate.employeeName?.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === "all" || estimate.status === statusFilter;
      const matchesEmployee = employeeFilter === "all" || estimate.employeeName === employeeFilter;

      // Simplified date range: match substring
      const matchesDateRange = dateRange === "" || estimate.date.includes(dateRange);

      return matchesSearch && matchesStatus && matchesEmployee && matchesDateRange;
    });
  }, [enhancedEstimates, search, statusFilter, employeeFilter, dateRange]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700 border-green-200";
      case "Unpaid":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <MobileHeader title="Estimate Report" showBack={true} />

      <div className="flex-1 overflow-y-auto scrollable pt-14 pb-6">
        <div className="px-4 space-y-4">
          {/* Filters toggle */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by estimate ID, customer, employee"
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

          {/* Collapsible filters */}
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
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
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
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setDateRange("");
                  setStatusFilter("all");
                  setEmployeeFilter("all");
                }}
                disabled={
                  search === "" &&
                  dateRange === "" &&
                  statusFilter === "all" &&
                  employeeFilter === "all"
                }
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Estimates list */}
          <div className="space-y-3">
            {filteredEstimates.length === 0 ? (
              <div className="text-center text-muted-foreground py-10 text-sm">No estimates found</div>
            ) : (
              filteredEstimates.map((estimate) => (
                <div
                  key={estimate.id}
                  className="rounded-xl border bg-card p-3 shadow-sm"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-foreground truncate" title={estimate.customerName}>
                        {estimate.customerName}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        "text-xs px-2.5 py-1 h-6 border",
                        getStatusBadgeClass(estimate.status)
                      )}
                    >
                      {estimate.status}
                    </Badge>
                  </div>

                  {/* Middle row */}
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span className="font-medium text-primary/80">{estimate.id}</span>
                    <span>{estimate.date}</span>
                  </div>

                  {/* Bottom row */}
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate" title={estimate.employeeName || "-"}>
                      {estimate.employeeName || "-"}
                    </span>
                    <span className="text-lg font-semibold text-green-600">
                      ${estimate.amount.toFixed(2)}
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

export default EstimateReport;
