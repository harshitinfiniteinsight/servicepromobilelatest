import { useParams, useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockEstimates, mockCustomers } from "@/data/mobileMockData";
import { ArrowLeft, Calendar, User, Mail, Phone, MapPin, Download, Send, CreditCard, TrendingUp, MessageSquare, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";

const EstimateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const estimate = mockEstimates.find(e => e.id === id);

  if (!estimate) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Estimate not found</p>
      </div>
    );
  }

  const customer = mockCustomers.find(c => c.id === estimate.customerId);

  // Mock estimate items
  const estimateItems = [
    { name: "HVAC Installation", quantity: 1, price: 800, total: 800 },
    { name: "Materials", quantity: 1, price: 200, total: 200 },
    { name: "Labor", quantity: 4, price: 50, total: 200 },
  ];

  const subtotal = estimateItems.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal;

  const handleConvertToInvoice = () => {
    navigate(`/ invoices / new? estimate = ${estimate.id} `);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader
        title="Estimate Details"
        showBack={true}
        actions={
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4" />
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto scrollable pt-14">
        {/* Header */}
        <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold mb-2">{estimate.id}</h2>
              <Badge className={cn("text-sm", statusColors[estimate.status as keyof typeof statusColors])}>
                {estimate.status}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-3xl font-bold text-primary">${estimate.amount.toLocaleString()}</p>
            </div>
          </div>

          {estimate.probability && estimate.status === "Sent" && (
            <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">
                  {estimate.probability}% conversion probability
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 px-4 py-4">
          <Button variant="outline" className="gap-2" onClick={() => window.location.href = `mailto:${customer?.email} `}>
            <Mail className="h-4 w-4" />
            Send
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.location.href = `sms:${customer?.phone} `}>
            <MessageSquare className="h-4 w-4" />
            SMS
          </Button>
        </div>

        {/* Actions - Convert to Invoice */}
        {estimate.status === "Approved" && (
          <div className="px-4 pb-4">
            <Button className="w-full" size="lg" onClick={handleConvertToInvoice}>
              Convert to Invoice
            </Button>
          </div>
        )}

        {/* Details Wrapper */}
        <div className="space-y-4 px-4 pb-6">
          {/* Customer Information */}
          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Customer Information
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {estimate.customerName}</p>

              {/* Job Address Logic */}
              <p>
                <span className="text-muted-foreground">Job Address:</span>{" "}
                {(estimate as any).source === "sell_product" ? "-" : customer?.address || "-"}
              </p>

              {/* Assigned To Logic */}
              <p>
                <span className="text-muted-foreground">Assigned to:</span>{" "}
                {(estimate as any).employeeName || (estimate as any).technicianName || "Unassigned"}
              </p>

              {customer && (
                <>
                  <p><span className="text-muted-foreground">Email:</span> {customer.email}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {customer.phone}</p>
                </>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Estimate Date
            </h3>
            <p className="text-sm">{new Date(estimate.date).toLocaleDateString()}</p>
          </div>

          {/* Items Section Consolidated */}
          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Items
            </h3>

            <div className="space-y-4">
              {/* Items List */}
              <div className="space-y-4">
                {estimateItems.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start justify-between pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-bold">${(item.total || item.amount || 0).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground">Total:</span>
                  <span className="font-bold text-lg">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          {estimate.status !== "Converted to Invoice" && (
            <div className="p-4 rounded-xl border bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Payment
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Method:</span>{" "}
                  {(estimate.status === "Converted to Invoice" || estimate.status === "Paid") ? (estimate as any).paymentMethod : "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">Status:</span> {estimate.status}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstimateDetails;

