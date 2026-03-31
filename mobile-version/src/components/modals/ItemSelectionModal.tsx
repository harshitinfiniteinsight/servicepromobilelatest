import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InvoiceLineItem {
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  refundedAmount?: number;
}

interface ItemSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceName: string;
  lineItems: InvoiceLineItem[];
  isLoading?: boolean;
  onConfirm: (selectedItems: InvoiceLineItem[], totalAmount: number) => void;
}

const ItemSelectionModal = ({
  isOpen,
  onClose,
  invoiceId,
  invoiceName,
  lineItems,
  isLoading = false,
  onConfirm,
}: ItemSelectionModalProps) => {
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedItemIds(new Set());
    }
  }, [isOpen]);

  const refundableItems = useMemo(() => {
    return lineItems.filter((item) => {
      const refunded = item.refundedAmount || 0;
      return item.total > refunded;
    });
  }, [lineItems]);

  const selectedItems = useMemo(() => {
    return refundableItems.filter((item) => selectedItemIds.has(item.itemId));
  }, [refundableItems, selectedItemIds]);

  const totalRefundAmount = useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      const refunded = item.refundedAmount || 0;
      return sum + Math.max(0, item.total - refunded);
    }, 0);
  }, [selectedItems]);

  const handleItemToggle = (itemId: string) => {
    const newSelected = new Set(selectedItemIds);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItemIds(newSelected);
  };

  const handleConfirm = () => {
    if (selectedItems.length === 0) return;
    onConfirm(selectedItems, totalRefundAmount);
  };

  const isConfirmDisabled = selectedItems.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[390px] w-[calc(100%-1.5rem)] mx-auto p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden !flex !flex-col [&>button]:hidden">
        <DialogTitle className="sr-only">Select Items to Refund</DialogTitle>
        <DialogDescription className="sr-only">Select one or more items from the invoice to refund</DialogDescription>

        {/* Header */}
        <div className="flex justify-between items-center bg-white border-b border-gray-200 px-4 py-3 shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-base font-semibold text-gray-900">Select Items to Refund</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-white pointer-events-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="px-5 py-5 pb-6 space-y-4 pointer-events-auto">
            {/* Invoice Reference */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 font-medium">Invoice</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{invoiceName}</p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-6">
                <p className="text-sm text-gray-600">Loading items...</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && refundableItems.length === 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-900">No items to refund</p>
                  <p className="text-xs text-amber-700 mt-0.5">All items have been fully refunded.</p>
                </div>
              </div>
            )}

            {/* Items List */}
            {!isLoading && refundableItems.length > 0 && (
              <div className="space-y-2">
                {refundableItems.map((item) => {
                  const isSelected = selectedItemIds.has(item.itemId);
                  const refunded = item.refundedAmount || 0;
                  const refundableAmount = Math.max(0, item.total - refunded);

                  return (
                    <label
                      key={item.itemId}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleItemToggle(item.itemId)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-medium text-gray-900">{item.description}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {item.quantity} × ${item.unitPrice.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-semibold text-gray-900">${refundableAmount.toFixed(2)}</p>
                            {refunded > 0 && (
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                ${refunded.toFixed(2)} refunded
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-5 py-4 shrink-0 space-y-3">
          {/* Total Refund Amount */}
          {selectedItems.length > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-900">Total Refund</span>
                <span className="text-lg font-bold text-green-600">${totalRefundAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* CTA */}
          <Button
            onClick={handleConfirm}
            disabled={isConfirmDisabled || isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemSelectionModal;
