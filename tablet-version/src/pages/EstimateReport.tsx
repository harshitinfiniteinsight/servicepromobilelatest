import { useState } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockEstimates, mockCustomers } from "@/data/mobileMockData";
import { Download, DollarSign, FileText, TrendingUp, Users } from "lucide-react";

const EstimateReport = () => {
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-01-31");

  const filteredEstimates = mockEstimates.filter(est => {
    const estDate = new Date(est.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return estDate >= start && estDate <= end;
  });

  const summary = {
    total: filteredEstimates.length,
    draft: filteredEstimates.filter(e => e.status === "Draft").length,
    sent: filteredEstimates.filter(e => e.status === "Sent").length,
    approved: filteredEstimates.filter(e => e.status === "Approved").length,
    rejected: filteredEstimates.filter(e => e.status === "Rejected").length,
    totalValue: filteredEstimates.reduce((sum, e) => sum + e.amount, 0),
    conversionRate: filteredEstimates.filter(e => e.status === "Sent" || e.status === "Approved").length > 0
      ? Math.round((filteredEstimates.filter(e => e.status === "Approved").length / 
          filteredEstimates.filter(e => e.status === "Sent" || e.status === "Approved").length) * 100)
      : 0,
  };

  // Top customers by estimate value
  const customerTotals = filteredEstimates.reduce((acc, est) => {
    if (!acc[est.customerId]) {
      acc[est.customerId] = { name: est.customerName, total: 0, count: 0 };
    }
    acc[est.customerId].total += est.amount;
    acc[est.customerId].count += 1;
    return acc;
  }, {} as Record<string, { name: string; total: number; count: number }>);

  const topCustomers = Object.values(customerTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Mock pie chart data
  const chartData = [
    { label: "Approved", value: summary.approved, color: "bg-success" },
    { label: "Sent", value: summary.sent, color: "bg-primary" },
    { label: "Draft", value: summary.draft, color: "bg-muted" },
    { label: "Rejected", value: summary.rejected, color: "bg-destructive" },
  ];
  const totalChart = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title="Estimate Report" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-14 px-4 pb-6 space-y-4">
        {/* Date Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label>End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold">{summary.total}</p>
          </div>
          <div className="p-4 rounded-xl bg-success/5 border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-success" />
              <span className="text-xs font-medium">Total Value</span>
            </div>
            <p className="text-xl font-bold">${summary.totalValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            <span className="font-semibold">Conversion Rate</span>
          </div>
          <p className="text-3xl font-bold text-accent">{summary.conversionRate}%</p>
          <p className="text-sm text-muted-foreground mt-1">
            {summary.approved} approved out of {summary.sent + summary.approved} sent
          </p>
        </div>

        {/* Status Breakdown */}
        <div className="p-4 rounded-xl border bg-card">
          <h3 className="font-semibold mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            {chartData.map((item, idx) => {
              const percentage = totalChart > 0 ? Math.round((item.value / totalChart) * 100) : 0;
              return (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm font-bold">{item.value} ({percentage}%)</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Customers */}
        {topCustomers.length > 0 && (
          <div className="p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Top Customers</h3>
            </div>
            <div className="space-y-2">
              {topCustomers.map((customer, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-sm">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.count} estimates</p>
                  </div>
                  <p className="font-bold">${customer.total.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Button */}
        <Button className="w-full" size="lg">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>
  );
};

export default EstimateReport;
