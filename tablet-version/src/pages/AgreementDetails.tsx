import { useParams } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Badge } from "@/components/ui/badge";
import { mockAgreements, mockCustomers } from "@/data/mobileMockData";
import { Calendar, User, FileText, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";

const AgreementDetails = () => {
  const { id } = useParams();
  const agreement = mockAgreements.find(a => a.id === id);

  if (!agreement) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Agreement not found</p>
      </div>
    );
  }

  const customer = mockCustomers.find(c => c.id === agreement.customerId);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title="Agreement Details" showBack={true} />

      <div className="flex-1 overflow-y-auto scrollable pt-14">
        {/* Header */}
        <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{agreement.type}</h2>
              <Badge className={cn("text-sm", statusColors[agreement.status])}>
                {agreement.status}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Monthly</p>
              <p className="text-2xl font-bold text-primary">${agreement.monthlyAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-4 space-y-4 pb-6">
          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Customer Information
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {agreement.customerName}</p>
              <p><span className="text-muted-foreground">Job Address:</span> {customer?.address || "-"}</p>
              <p><span className="text-muted-foreground">Assigned to:</span> {(agreement as any).employeeName || (agreement as any).technicianName || "Unassigned"}</p>
              {customer && (
                <>
                  <p><span className="text-muted-foreground">Email:</span> {customer.email}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {customer.phone}</p>
                </>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Agreement Period
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Start:</span> {new Date(agreement.startDate).toLocaleDateString()}</p>
              <p><span className="text-muted-foreground">End:</span> {new Date(agreement.endDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Items
            </h3>

            <div className="space-y-4">
              {/* Items List */}
              <div className="space-y-4">
                <div className="flex items-start justify-between pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex-1">
                    <p className="font-semibold">{agreement.type}</p>
                    <p className="text-sm text-muted-foreground">
                      1 × ${agreement.monthlyAmount.toFixed(2)} / month
                    </p>
                  </div>
                  <p className="font-bold">${agreement.monthlyAmount.toFixed(2)}</p>
                </div>
              </div>

              {/* Summary */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground">Total (Yearly):</span>
                  <span className="font-bold text-lg">${(agreement.monthlyAmount * 12).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Method:</span>{" "}
                {agreement.status === "Paid" ? (agreement as any).paymentMethod || "Credit Card" : "-"}
              </p>
              <p>
                <span className="text-muted-foreground">Status:</span> {agreement.status}
              </p>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default AgreementDetails;

