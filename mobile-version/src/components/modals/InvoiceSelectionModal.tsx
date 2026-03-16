import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { Invoice } from "@/services/invoiceService";

interface InvoiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  onContinue: (selectedInvoiceIds: string[], totalAmount: number) => void;
}

const InvoiceSelectionModal = ({
  isOpen,
  onClose,
  invoices,
  onContinue,
}: InvoiceSelectionModalProps) => {
  const unpaidInvoices = useMemo(() => {
    return invoices.filter((invoice) => invoice.status.toLowerCase() !== "paid");
  }, [invoices]);

  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedInvoiceIds(unpaidInvoices.map((invoice) => invoice.id));
    }
  }, [isOpen, unpaidInvoices]);

  const getDueAmount = (invoice: Invoice) => {
    const paidAmount = Number(invoice.paidAmount || 0);
    const amount = Number(invoice.amount || 0);
    return Math.max(amount - paidAmount, 0);
  };

  const totalSelectedAmount = useMemo(() => {
    return unpaidInvoices
      .filter((invoice) => selectedInvoiceIds.includes(invoice.id))
      .reduce((sum, invoice) => sum + getDueAmount(invoice), 0);
  }, [unpaidInvoices, selectedInvoiceIds]);

  const handleInvoiceToggle = (invoiceId: string, checked: boolean) => {
    if (checked) {
      setSelectedInvoiceIds((prev) => Array.from(new Set([...prev, invoiceId])));
      return;
    }
    setSelectedInvoiceIds((prev) => prev.filter((id) => id !== invoiceId));
  };

  const handleContinue = () => {
    if (selectedInvoiceIds.length === 0) {
      return;
    }
    onContinue(selectedInvoiceIds, totalSelectedAmount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[calc(100%-2rem)] rounded-2xl p-0 gap-0 overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Select Invoices to Pay</DialogTitle>
        <DialogDescription className="sr-only">
          Choose unpaid invoices linked to this job and continue to payment.
        </DialogDescription>

        <div className="px-4 py-3 border-b bg-orange-500 text-white">
          <h2 className="text-lg font-semibold">Link Invoices to Payment</h2>
          <p className="text-xs text-white/90 mt-0.5">Select unpaid invoices for this job.</p>
        </div>

        <div className="max-h-[55vh] overflow-y-auto px-4 py-3 space-y-2 bg-white">
          {unpaidInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No unpaid invoices available.</p>
          ) : (
            unpaidInvoices.map((invoice) => {
              const dueAmount = getDueAmount(invoice);
              return (
                <div
                  key={invoice.id}
                  className="border rounded-xl px-3 py-2.5 flex items-start gap-3"
                >
                  <Checkbox
                    checked={selectedInvoiceIds.includes(invoice.id)}
                    onCheckedChange={(checked) => handleInvoiceToggle(invoice.id, checked === true)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">{invoice.id}</p>
                      <Badge variant="outline" className="text-xs capitalize">{invoice.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-1.5 text-xs text-gray-600">
                      <p>
                        Amount: <span className="font-medium text-gray-900">${Number(invoice.amount || 0).toFixed(2)}</span>
                      </p>
                      <p>
                        Due: <span className="font-medium text-gray-900">${dueAmount.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t bg-gray-50 px-4 py-3 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Total Selected Amount</span>
            <span className="font-semibold text-gray-900">${totalSelectedAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={selectedInvoiceIds.length === 0}
              onClick={handleContinue}
            >
              Continue / Pay
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceSelectionModal;
