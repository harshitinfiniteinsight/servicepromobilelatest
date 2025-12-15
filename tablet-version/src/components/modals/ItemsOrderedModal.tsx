import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProductOrderItem {
  name: string;
  price: number;
}

interface ItemsOrderedModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ProductOrderItem[];
  orderId: string;
  totalAmount: number;
}

const ItemsOrderedModal = ({ isOpen, onClose, items, orderId, totalAmount }: ItemsOrderedModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden [&>button]:hidden bg-white shadow-xl">
        <DialogTitle className="sr-only">Items Ordered</DialogTitle>
        <DialogDescription className="sr-only">
          Complete list of items for order {orderId}
        </DialogDescription>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Items Ordered</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </div>

        {/* Items List */}
        <div className="px-5 py-4 overflow-y-auto max-h-[calc(85vh-140px)]">
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0"
              >
                <span className="text-sm text-gray-900 flex-1 min-w-0 pr-2">{item.name}</span>
                <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with Total */}
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-gray-900">Total</span>
            <span className="text-base font-bold text-gray-900">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemsOrderedModal;








