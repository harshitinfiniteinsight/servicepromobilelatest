import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockAgreements, mockCustomers } from "@/data/mobileMockData";
import { Calendar, User, FileText, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";

const AgreementDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [agreement, setAgreement] = useState<any | null>(null);

  const normalizedStatus = String(agreement?.status || "").trim().toLowerCase();
  const displayStatus =
    normalizedStatus === "converted_to_invoice" || normalizedStatus === "converted to invoice"
      ? "Converted to Invoice"
      : "Open";

  useEffect(() => {
    const serviceAgreements = JSON.parse(localStorage.getItem("servicepro_agreements") || "[]");
    const legacyAgreements = JSON.parse(localStorage.getItem("mockAgreements") || "[]");
    const merged = [...mockAgreements, ...legacyAgreements, ...serviceAgreements];
    const foundAgreement = merged.find((item: any) => item.id === id) || null;
    setAgreement(foundAgreement);
  }, [id]);

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
              <Badge
                variant="outline"
                className={displayStatus === "Converted to Invoice"
                  ? "text-sm bg-gray-50 text-gray-700 border-gray-300"
                  : "text-sm bg-amber-50 text-amber-700 border-amber-200"
                }
              >
                {displayStatus}
              </Badge>
              {agreement.invoice_id && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => navigate(`/invoices/${agreement.invoice_id}`)}
                >
                  View Invoice
                </Button>
              )}
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

          {/* Work Description & Agreement Period - Combined Card */}
          <div className="p-4 rounded-xl border bg-card">
            {/* Work Description Section */}
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Work Description
            </h3>
            <div className="mb-4 text-sm">
              <p className="text-muted-foreground leading-relaxed">
                {(agreement as any).description || `${agreement.type} - Regular maintenance and service coverage including inspections, tune-ups, and priority support.`}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t my-4"></div>

            {/* Agreement Period Section */}
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

              {/* Pricing Breakdown */}
              <div className="pt-4 border-t space-y-2">
                {/* Subtotal (Monthly) */}
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground">Subtotal (Monthly):</span>
                  <span className="font-semibold">${agreement.monthlyAmount.toFixed(2)}</span>
                </div>
                
                {/* Discount - only show if applicable */}
                {(agreement as any).discount && (agreement as any).discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-muted-foreground">Discount:</span>
                    <span className="font-semibold text-success">-${(agreement as any).discount.toFixed(2)}</span>
                  </div>
                )}
                
                {/* Tax - only show if applicable */}
                {(agreement as any).tax && (agreement as any).tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-muted-foreground">Tax:</span>
                    <span className="font-semibold">${(agreement as any).tax.toFixed(2)}</span>
                  </div>
                )}
                
                {/* Total Amount - Monthly emphasized */}
                <div className="flex justify-between pt-2 border-t mt-2">
                  <span className="font-bold text-base">Monthly Amount:</span>
                  <span className="font-bold text-lg text-primary">${agreement.monthlyAmount.toFixed(2)}</span>
                </div>
                
                {/* Yearly Total */}
                <div className="flex justify-between text-sm pt-2">
                  <span className="font-medium text-muted-foreground">Yearly Total:</span>
                  <span className="font-semibold">${(agreement.monthlyAmount * 12).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Invoice Flow
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Status:</span> {displayStatus}
              </p>
              <p>
                <span className="text-muted-foreground">Payments:</span> Managed on linked invoice
              </p>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default AgreementDetails;

