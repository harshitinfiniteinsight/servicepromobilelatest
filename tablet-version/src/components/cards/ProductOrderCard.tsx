import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import ItemsOrderedModal from "@/components/modals/ItemsOrderedModal";

interface ProductOrderItem {
  name: string;
  price: number;
}

interface ProductOrderCardProps {
  orderId: string;
  items: ProductOrderItem[];
  customerName: string;
  employeeName: string;
  totalAmount: number;
  date: string;
  paymentStatus: string; // Will always be "Paid"
  onClick?: () => void;
}

const ProductOrderCard = ({
  orderId,
  items,
  customerName,
  employeeName,
  totalAmount,
  date,
  paymentStatus,
  onClick,
}: ProductOrderCardProps) => {
  const [showItemsModal, setShowItemsModal] = useState(false);

  const handleMoreItemsClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent card onClick from firing
    setShowItemsModal(true);
  };

  return (
    <>
      <div
        className={cn(
          "p-4 rounded-xl border border-gray-200 bg-white shadow-sm",
          "active:scale-[0.98] transition-all duration-200",
          onClick && "cursor-pointer hover:shadow-md hover:border-primary/30"
        )}
        onClick={onClick}
      >
      {/* Header: Order ID + Payment Status */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold text-gray-700">{orderId}</span>
        <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] px-2 py-0.5 rounded-lg">
          {paymentStatus}
        </Badge>
      </div>

      {/* Items List */}
      <div className="mb-2.5 space-y-1.5">
        {(items.length >= 3 ? items.slice(0, 2) : items).map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-1 border-b border-gray-50 last:border-b-0"
          >
            <span className="text-sm text-gray-900 flex-1 min-w-0 pr-2 truncate">{item.name}</span>
            <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
              ${item.price.toFixed(2)}
            </span>
          </div>
        ))}
        {items.length >= 3 && (
          <div className="pt-0.5">
            <button
              onClick={handleMoreItemsClick}
              className="text-xs text-orange-500 hover:text-orange-600 underline cursor-pointer transition-colors"
            >
              +{items.length - 2} more {items.length - 2 === 1 ? 'item' : 'items'}
            </button>
          </div>
        )}
      </div>

      {/* Customer and Employee Info - Horizontal Row */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-1 min-w-0">
          <User className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{customerName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-1 min-w-0 justify-end">
          <UserCog className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{employeeName}</span>
        </div>
      </div>

      {/* Footer: Date + Total Amount */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span>{new Date(date).toLocaleDateString()}</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-gray-900">
            ${totalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
    
    {/* Items Ordered Modal */}
    <ItemsOrderedModal
      isOpen={showItemsModal}
      onClose={() => setShowItemsModal(false)}
      items={items}
      orderId={orderId}
      totalAmount={totalAmount}
    />
    </>
  );
};

export default ProductOrderCard;

