import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import PaymentModal from "@/components/modals/PaymentModal";
import PaymentSuccessModal from "@/components/modals/PaymentSuccessModal";
import { useCart } from "@/contexts/CartContext";
import { createOrder } from "@/services/orderService";
import { toast } from "sonner";

const CheckoutPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, getSubtotal } = useCart();
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
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("Credit Card");

  if (!customer || items.length === 0) {
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
    setPaymentMethod(methodName);
    
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

      await createOrder({
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
        // Employee info can be added later if available
        employeeId: undefined,
        employeeName: undefined,
        status: "Paid",
        paymentMethod: methodName,
      });

      setPaymentModalOpen(false);
      setSuccessModalOpen(true);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    navigate("/checkout/confirmation", { state: { customer, total, subtotal, tax } });
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

      {/* Success Modal */}
      <PaymentSuccessModal
        isOpen={successModalOpen}
        onClose={handleSuccessClose}
        total={total || 0}
      />
    </>
  );
};

export default CheckoutPayment;


