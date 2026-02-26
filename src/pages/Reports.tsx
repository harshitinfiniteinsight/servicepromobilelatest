import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, Users, Package, DollarSign, Calendar, Download } from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();

  const reportCards = [
    {
      id: "invoice",
      title: "Invoice Report",
      description: "View invoice statistics and payment status",
      icon: FileText,
      color: "primary",
      route: "/reports/invoice",
    },
    {
      id: "estimate",
      title: "Estimate Report",
      description: "Track estimate conversion rates",
      icon: TrendingUp,
      color: "success",
      route: "/reports/estimate",
    },
    {
      id: "revenue",
      title: "Revenue Report",
      description: "Monthly and yearly revenue analysis",
      icon: DollarSign,
      color: "primary",
      route: "/reports/revenue",
    },
    {
      id: "customer",
      title: "Customer Report",
      description: "Customer activity and statistics",
      icon: Users,
      color: "accent",
      route: "/reports/customer",
    },
    {
      id: "inventory",
      title: "Inventory Report",
      description: "Stock levels and movement",
      icon: Package,
      color: "warning",
      route: "/reports/inventory",
    },
    {
      id: "employee",
      title: "Employee Report",
      description: "Employee performance metrics",
      icon: Users,
      color: "success",
      route: "/reports/employee",
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title="Reports" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-14 px-4 pb-6">
        <div className="grid grid-cols-2 gap-3 py-4">
          {reportCards.map(report => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="p-4 rounded-xl border bg-card active:scale-98 transition-transform cursor-pointer"
                onClick={() => navigate(report.route)}
              >
                <div className={`
                  w-12 h-12 rounded-xl mb-3 flex items-center justify-center
                  ${report.color === "primary" ? "bg-primary/10 text-primary" : ""}
                  ${report.color === "success" ? "bg-success/10 text-success" : ""}
                  ${report.color === "accent" ? "bg-accent/10 text-accent" : ""}
                  ${report.color === "warning" ? "bg-warning/10 text-warning" : ""}
                `}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-1">{report.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{report.description}</p>
                <Button size="sm" variant="outline" className="w-full">
                  <Download className="h-3 w-3 mr-2" />
                  View Report
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Reports;
