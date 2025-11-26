import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import PaymentModal from "@/components/modals/PaymentModal";
import { useCart } from "@/contexts/CartContext";
import { createOrder } from "@/services/orderService";
import { toast } from "sonner";

const CheckoutPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, getSubtotal, clearCart } = useCart();
  const { customer, total, subtotal, tax, taxRate, discount, discountType, notes } = (location.state as { 
    customer?: any; 
    total?: number; 
    subtotal?: number;
    tax?: number;
    taxRate?: number;
    discount?: number;
    discountType?: "%" | "$";
    notes?: string;
  }) || {};
  const [paymentModalOpen, setPaymentModalOpen] = useState(true);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  // Don't redirect if payment is complete (navigation will happen in handleSuccessClose)
  if (!isPaymentComplete && (!customer || items.length === 0)) {
    navigate("/checkout/customer");
    return null;
  }

  // Map payment method IDs to display names
  const getPaymentMethodName = (methodId: string): string => {
    const methodMap: Record<string, string> = {
      "tap-to-pay": "Tap to Pay",
      "enter-card": "Credit Card",
      "ach": "ACH",
      "cash": "Cash",
    };
    return methodMap[methodId] || "Credit Card";
  };

  const handlePaymentMethodSelect = async (methodId: string) => {
    const methodName = getPaymentMethodName(methodId);
    
    try {
      // Use provided values or calculate defaults
      const calculatedSubtotal = subtotal ?? getSubtotal();
      const calculatedTax = tax ?? 0;
      const calculatedTotal = total ?? calculatedSubtotal + calculatedTax;

      // Create order record
      const orderItems = items.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        type: item.type,
      }));

      // Get current employee info if available
      const currentEmployeeId = localStorage.getItem("currentEmployeeId");
      const currentEmployeeName = localStorage.getItem("currentEmployeeName") || "System";

      const newOrder = await createOrder({
        type: "cart",
        orderType: "Cart",
        source: "cart",
        customerId: customer.id,
        customerName: customer.name,
        items: orderItems,
        subtotal: calculatedSubtotal,
        tax: calculatedTax,
        total: calculatedTotal,
        discount: discount,
        discountType: discountType,
        notes: notes,
        employeeId: currentEmployeeId || undefined,
        employeeName: currentEmployeeName,
        status: "Paid",
        paymentMethod: methodName,
      });

      // Close payment modal and mark payment as complete
      setPaymentModalOpen(false);
      setIsPaymentComplete(true);
      
      // Show success message briefly, then navigate
      toast.success("Payment received successfully!");
      
      // Clear the cart immediately
      clearCart();
      
      // Navigate to Product Orders screen with the new order data
      // Use replace: true to prevent going back to checkout
      const orderData = {
        id: newOrder.id,
        items: newOrder.items.map((item: any) => ({
          name: item.name,
          price: item.price * item.quantity, // Total price for the item
        })),
        customerName: newOrder.customerName,
        employeeName: newOrder.employeeName || "System",
        totalAmount: newOrder.total,
        date: newOrder.createdAt || newOrder.issueDate || new Date().toISOString().split("T")[0],
        paymentStatus: "Paid",
      };

      // Navigate immediately
      navigate("/sales/product-orders", { 
        replace: true,
        state: { 
          newOrder: orderData
        } 
      });
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
    }
  };

  return (
    <>
      <div className="h-full flex flex-col overflow-hidden">
        <MobileHeader
          title="Payment"
          showBack={true}
        />
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          navigate("/checkout/summary", { state: { customer } });
        }}
        amount={total || 0}
        onPaymentMethodSelect={handlePaymentMethodSelect}
      />

    </>
  );
};

export default CheckoutPayment;


