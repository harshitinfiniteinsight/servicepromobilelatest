import { useNavigate, useLocation } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomActionBar from "@/components/layout/BottomActionBar";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { CheckCircle2, Mail, MessageSquare, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, clearCart, getSubtotal } = useCart();
  const { customer, total } = (location.state as { customer?: any; total?: number }) || {};

  if (!customer || items.length === 0) {
    navigate("/inventory");
    return null;
  }

  const handleDone = () => {
    clearCart();
    // Navigate to customer details page to show the new order
    navigate(`/customers/${customer.id}`, { replace: true });
  };

  const handleSendEmail = () => {
    toast.success(`Receipt sent to ${customer.email}`);
  };

  const handleSendSMS = () => {
    toast.success(`Receipt sent to ${customer.phone}`);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader
        title="Order Confirmation"
        showBack={false}
      />
      
      <div 
        className="flex-1 overflow-y-auto scrollable px-3 pb-4" 
        style={{ 
          paddingTop: 'calc(3rem + env(safe-area-inset-top) + 0.5rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 90px)',
        }}
      >
        {/* Success Icon */}
        <div className="flex flex-col items-center py-8">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Complete</h2>
          <p className="text-lg font-semibold text-orange-600">${total?.toFixed(2) || getSubtotal().toFixed(2)}</p>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Customer</h3>
          <p className="text-base font-medium text-gray-900">{customer.name}</p>
          <p className="text-sm text-gray-600">{customer.email}</p>
          <p className="text-sm text-gray-600">{customer.phone}</p>
        </div>

        {/* Items Purchased */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Items Purchased</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1 truncate">{item.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                    <span className="text-sm font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <BottomActionBar>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleSendEmail}
              variant="outline"
              className="border-gray-200 hover:bg-gray-50"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button
              onClick={handleSendSMS}
              variant="outline"
              className="border-gray-200 hover:bg-gray-50"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send SMS
            </Button>
          </div>
          <Button
            onClick={handleDone}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl"
          >
            Done
          </Button>
        </div>
      </BottomActionBar>
    </div>
  );
};

export default OrderConfirmation;

