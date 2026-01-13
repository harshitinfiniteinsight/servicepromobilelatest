import { useState } from "react";
import { X, Plus, Minus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    sku: string;
    price: number;
    image?: string;
    type?: string;
  };
  initialQuantity?: number;
}

const AddToCartModal = ({ isOpen, onClose, item, initialQuantity = 1 }: AddToCartModalProps) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const { addItem } = useCart();

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    addItem(
      {
        id: item.id,
        name: item.name,
        sku: item.sku,
        price: item.price,
        image: item.image,
        type: item.type,
      },
      quantity
    );
    toast.success("Item added to cart");
    onClose();
    setQuantity(1);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-200"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div 
        className="fixed left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 max-w-md mx-auto flex flex-col"
        style={{
          zIndex: 9999,
          bottom: 'calc(64px + env(safe-area-inset-bottom))',
          maxHeight: 'calc(85vh - 64px - env(safe-area-inset-bottom))',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-900">Add to Cart</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 touch-target"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 90px)',
          }}
        >
          {/* Product Info */}
          <div className="flex gap-3">
            {/* Product Image */}
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-semibold text-gray-900 mb-1 truncate">{item.name}</h4>
              <p className="text-xs text-gray-600 mb-1">SKU: {item.sku}</p>
              <p className="text-lg font-bold text-orange-600">
                ${item.price.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Quantity Counter */}
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDecrease}
                disabled={quantity <= 1}
                className="h-8 w-8 p-0 hover:bg-orange-100 hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-base font-semibold min-w-[2rem] text-center text-gray-900">
                {quantity}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleIncrease}
                className="h-8 w-8 p-0 hover:bg-orange-100 hover:text-orange-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div 
          className="fixed left-0 right-0 bg-white border-t border-gray-200 space-y-2 flex-shrink-0 z-40 px-4 pt-3"
          style={{
            bottom: 'calc(64px + env(safe-area-inset-bottom))',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
          }}
        >
          <Button
            onClick={handleAddToCart}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl"
          >
            Add to Cart
          </Button>
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-gray-600 hover:text-gray-900 py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default AddToCartModal;

