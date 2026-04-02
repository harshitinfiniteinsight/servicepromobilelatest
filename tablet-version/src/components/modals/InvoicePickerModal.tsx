import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, CreditCard, DollarSign, Building2, Banknote, Wallet } from "lucide-react";
import type { RefundInvoiceData } from "@/utils/refundUtils";

interface InvoicePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: RefundInvoiceData[];
  jobId?: string | null;
  onSelect: (invoice: RefundInvoiceData) => void;
}

const methodIcons: Record<string, React.ElementType> = {
  "Credit Card": CreditCard,
  "Card": CreditCard,
  "ACH": Building2,
  "Bank Transfer": Building2,
  "Cash": DollarSign,
  "Check": Banknote,
};

function getMethodIcon(method?: string): React.ElementType {
  if (!method) return Wallet;
  return methodIcons[method] || Wallet;
}

function getPaymentLabel(invoice: RefundInvoiceData): string {
  const method = (
    invoice.paymentMethod ||
    invoice.payment?.method ||
    invoice.payment_method ||
    ""
  ).trim();
  const last4 =
    invoice.cardLast4 ||
    invoice.payment?.method_details?.card?.last4 ||
    invoice.payment?.payment_method_details?.card?.last4 ||
    invoice.payment_method_details?.card?.last4;
  if (last4) return `${method || "Card"} (${last4})`;
  return method || "Payment method unknown";
}

function getRefundableAmount(invoice: RefundInvoiceData): number {
  const paid = Number(invoice.paidAmount ?? invoice.amount ?? 0);
  const refunded = Number(invoice.refundedAmount ?? 0);
  return Math.max(0, paid - refunded);
}

const InvoicePickerModal = ({
  isOpen,
  onClose,
  invoices,
  jobId,
  onSelect,
}: InvoicePickerModalProps) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;
    setSelectedInvoiceId(invoices[0]?.id || "");
  }, [isOpen, invoices]);

  const selectedInvoice = useMemo(
    () => invoices.find((inv) => inv.id === selectedInvoiceId) || null,
    [invoices, selectedInvoiceId]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[560px] w-[calc(100%-2rem)] mx-auto p-0 gap-0 rounded-2xl max-h-[80vh] overflow-hidden !flex !flex-col [&>button]:hidden">
        <DialogTitle className="sr-only">Select Invoice to Refund</DialogTitle>
        <DialogDescription className="sr-only">
          Choose which invoice you would like to refund
        </DialogDescription>

        {/* Header */}
        <div className="flex justify-between items-center bg-white border-b border-gray-200 px-5 py-4 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Select Invoice to Refund</h2>
            {jobId && (
              <p className="text-xs text-gray-500 mt-0.5">Job ID: {jobId}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Invoice dropdown */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
          {invoices.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-gray-500">No refundable invoices found for this job.</p>
            </div>
          )}

          {invoices.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Select an invoice to refund</p>

              <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                <SelectTrigger className="h-12 border-2 border-orange-500 bg-white text-base font-semibold rounded-xl">
                  <SelectValue placeholder="Select an invoice to refund" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.map((invoice) => {
                    const refundable = getRefundableAmount(invoice);
                    return (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.id} — ${refundable.toFixed(2)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {selectedInvoice && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      {(() => {
                        const Icon = getMethodIcon(selectedInvoice.paymentMethod || selectedInvoice.payment?.method);
                        return <Icon className="h-4 w-4 text-orange-600" />;
                      })()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{selectedInvoice.id}</p>
                      <p className="text-xs text-gray-500">{selectedInvoice.customerName}</p>
                      <p className="text-xs text-gray-400">{getPaymentLabel(selectedInvoice)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      ${getRefundableAmount(selectedInvoice).toFixed(2)}
                    </p>
                    <p className="text-[11px] text-gray-400">refundable</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="bg-white border-t border-gray-200 px-5 py-3 shrink-0 space-y-2">
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={!selectedInvoice}
            onClick={() => selectedInvoice && onSelect(selectedInvoice)}
          >
            Continue
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Select an invoice to continue to item refund selection
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePickerModal;
