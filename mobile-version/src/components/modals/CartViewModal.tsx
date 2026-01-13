import { X, Trash2, Plus, Minus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

interface CartViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShopMore?: () => void;
}

const CartViewModal = ({ isOpen, onClose, onShopMore }: CartViewModalProps) => {
  const { items, removeItem, updateQuantity, getSubtotal } = useCart();
  const navigate = useNavigate();

  const handleContinueToPay = () => {
    onClose();
    navigate("/checkout/customer");
  };

  const handleShopMore = () => {
    onClose();
    if (onShopMore) {
      onShopMore();
    } else {
      // Default: navigate to inventory
      navigate("/inventory", { state: { fromSellProduct: true } });
    }
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
          <h3 className="text-lg font-bold text-gray-900">Cart</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 touch-target"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Items List - Scrollable */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 90px)',
          }}
        >
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl p-3 flex gap-3"
              >
                {/* Product Image */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1 truncate">{item.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">SKU: {item.sku}</p>
                  <p className="text-base font-bold text-orange-600">
                    ${item.price.toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 mb-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-6 w-6 p-0 hover:bg-orange-100 hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-semibold min-w-[1.5rem] text-center text-gray-900">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-6 w-6 p-0 hover:bg-orange-100 hover:text-orange-700 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Fixed Footer - Subtotal and Action Buttons */}
        {items.length > 0 && (
          <div 
            className="fixed left-0 right-0 bg-white border-t border-gray-200 flex-shrink-0 z-40 max-w-md mx-auto"
            style={{
              bottom: 'calc(64px + env(safe-area-inset-bottom))',
            }}
          >
            {/* Subtotal */}
            <div className="px-4 pt-3 pb-2">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">Subtotal</span>
                <span className="text-lg font-bold text-gray-900">${getSubtotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons - Side by Side, 50/50 */}
            <div 
              className="px-4 pb-3"
              style={{
                paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
              }}
            >
              <div className="flex gap-3">
                {/* Continue to Pay - 50% width */}
                <Button
                  onClick={handleContinueToPay}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-full shadow-sm"
                >
                  Continue to Pay
                </Button>
                
                {/* Shop More - 50% width */}
                <Button
                  onClick={handleShopMore}
                  variant="outline"
                  className="flex-1 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-full"
                >
                  Shop More
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartViewModal;

