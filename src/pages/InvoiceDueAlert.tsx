import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockInvoices } from "@/data/mobileMockData";
import { Phone, Mail, AlertCircle, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const InvoiceDueAlert = () => {
  const navigate = useNavigate();
  
  const overdueInvoices = mockInvoices
    .filter(inv => {
      const dueDate = new Date(inv.dueDate);
      const today = new Date();
      return dueDate < today && inv.status === "Overdue";
    })
    .map(inv => {
      const dueDate = new Date(inv.dueDate);
      const today = new Date();
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return { ...inv, daysOverdue };
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue);

  const openInvoices = mockInvoices
    .filter(inv => {
      const dueDate = new Date(inv.dueDate);
      const today = new Date();
      const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return inv.status === "Open" && daysUntilDue <= 3 && daysUntilDue >= 0;
    })
    .map(inv => {
      const dueDate = new Date(inv.dueDate);
      const today = new Date();
      const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...inv, daysUntilDue };
    });

  const allAlerts = [
    ...overdueInvoices.map(inv => ({ ...inv, type: "overdue" as const })),
    ...openInvoices.map(inv => ({ ...inv, type: "due_soon" as const })),
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title="Invoice Alerts" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-14 px-4 pb-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs font-medium text-destructive">Overdue</span>
            </div>
            <p className="text-2xl font-bold">{overdueInvoices.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span className="text-xs font-medium text-warning">Due Soon</span>
            </div>
            <p className="text-2xl font-bold">{openInvoices.length}</p>
          </div>
        </div>

        {/* Alert Cards */}
        {allAlerts.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No invoice alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allAlerts.map((alert) => {
              const customer = alert.customerName;
              const isOverdue = alert.type === "overdue";
              const days = isOverdue ? alert.daysOverdue : alert.daysUntilDue;

              return (
                <div
                  key={alert.id}
                  className={cn(
                    "p-4 rounded-xl border",
                    isOverdue ? "bg-destructive/5 border-destructive/20" : "bg-warning/5 border-warning/20"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{alert.id}</span>
                        <Badge
                          className={cn(
                            "text-xs",
                            isOverdue
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-warning/10 text-warning border-warning/20"
                          )}
                        >
                          {isOverdue ? `${days} days overdue` : `Due in ${days} days`}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{customer}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        <DollarSign className="h-4 w-4 inline" />
                        {alert.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.location.href = `mailto:${customer.toLowerCase().replace(" ", ".")}@email.com`}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Reminder
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.location.href = `tel:555-123-4567`}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDueAlert;
