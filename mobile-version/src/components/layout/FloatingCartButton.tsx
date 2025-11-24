import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import CartViewModal from "@/components/modals/CartViewModal";

const FloatingCartButton = () => {
  const location = useLocation();
  const { getTotalItems } = useCart();
  const [cartModalOpen, setCartModalOpen] = useState(false);
  
  const totalItems = getTotalItems();
  
  // Show on all pages when cart has items, except checkout/payment screens
  const isCheckoutPage = location.pathname.startsWith("/checkout");
  const shouldShow = totalItems > 0 && !isCheckoutPage;
  
  if (!shouldShow) return null;

  return (
    <>
      <button
        onClick={() => setCartModalOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-lg touch-target transition-all duration-200 active:scale-95"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        aria-label={`Cart with ${totalItems} items`}
      >
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-orange-500 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </div>
      </button>
      
      <CartViewModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
      />
    </>
  );
};

export default FloatingCartButton;

