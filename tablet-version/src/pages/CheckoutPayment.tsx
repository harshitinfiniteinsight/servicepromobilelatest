import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import PaymentModal from "@/components/modals/PaymentModal";
import { useCart } from "@/contexts/CartContext";
import { createInvoice } from "@/services/invoiceService";
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

  // Redirect if no customer or items - must be in useEffect
  useEffect(() => {
    if (!isPaymentComplete && (!customer || items.length === 0)) {
      navigate("/checkout/customer");
    }
  }, [isPaymentComplete, customer, items.length, navigate]);

  // Early return if no customer or items (after useEffect handles redirect)
  if (!isPaymentComplete && (!customer || items.length === 0)) {
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

      // Create invoice items from cart items
      const invoiceItems = items.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        price: item.price,
        quantity: item.quantity,
        amount: item.price * item.quantity,
        type: item.type,
      }));

      // Get current employee info if available
      const currentEmployeeId = localStorage.getItem("currentEmployeeId");
      const currentEmployeeName = localStorage.getItem("currentEmployeeName") || "System";

      // Calculate due date (30 days from today)
      const issueDate = new Date().toISOString().split("T")[0];
      const dueDateObj = new Date();
      dueDateObj.setDate(dueDateObj.getDate() + 30);
      const dueDate = dueDateObj.toISOString().split("T")[0];

      // Create invoice with type = "single" and source = "sell_product"
      const newInvoice = await createInvoice({
        customerId: customer.id,
        customerName: customer.name,
        issueDate,
        dueDate,
        amount: calculatedTotal,
        status: "Paid",
        paymentMethod: methodName,
        type: "single",
        source: "sell_product",
        items: invoiceItems,
        subtotal: calculatedSubtotal,
        tax: calculatedTax,
        total: calculatedTotal,
        discount: discount,
        discountType: discountType,
        notes: notes,
        employeeId: currentEmployeeId || undefined,
        employeeName: currentEmployeeName,
      });

      // Close payment modal and mark payment as complete
      setPaymentModalOpen(false);
      setIsPaymentComplete(true);
      
      // Show success message
      toast.success("Invoice created successfully!");
      
      // Clear the cart immediately
      clearCart();
      
      // Navigate to Invoice List with "single" tab selected and highlight new invoice
      navigate("/invoices?tab=single", { 
        replace: true,
        state: { 
          newInvoiceId: newInvoice.id
        } 
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice. Please try again.");
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


