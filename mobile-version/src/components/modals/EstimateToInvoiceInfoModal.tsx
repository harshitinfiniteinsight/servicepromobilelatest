/**
 * Estimate to Invoice Information Modal
 * 
 * Displays an informational message to the user before they proceed with payment,
 * explaining that the estimate will be converted to an invoice after successful payment.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Receipt } from "lucide-react";

interface EstimateToInvoiceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

const EstimateToInvoiceInfoModal = ({
  isOpen,
  onClose,
  onContinue,
}: EstimateToInvoiceInfoModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] max-w-md rounded-2xl p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold text-left">
            Estimate will convert to Invoice
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Icon Visual */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-50">
              <FileText className="w-7 h-7 text-blue-600" />
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400" />
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-50">
              <Receipt className="w-7 h-7 text-green-600" />
            </div>
          </div>

          {/* Message */}
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            After payment is completed, this estimate will be automatically converted to an Invoice. 
            You can manage it from the <span className="font-semibold text-foreground">Invoices</span> section.
          </p>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 flex-col gap-2 sm:flex-col">
          <Button
            onClick={onContinue}
            className="w-full h-11 text-sm font-semibold rounded-xl"
          >
            Continue to Payment
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full h-11 text-sm font-semibold rounded-xl"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateToInvoiceInfoModal;
