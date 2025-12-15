import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomActionBar from "@/components/layout/BottomActionBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import { Image as ImageIcon, Tag, Plus } from "lucide-react";
import { mockDiscounts } from "@/data/mobileMockData";
import { cn } from "@/lib/utils";

const CheckoutSummary = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, getSelectedCustomer } = useCart();
  const customer = getSelectedCustomer();

  // Discount state
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"%" | "$">("%");
  const [selectedDiscount, setSelectedDiscount] = useState<typeof mockDiscounts[0] | null>(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [customDiscountValue, setCustomDiscountValue] = useState("");
  const [customDiscountType, setCustomDiscountType] = useState<"%" | "$">("%");

  // Tax state
  const [taxRate, setTaxRate] = useState(0);

  // Notes state
  const [notes, setNotes] = useState("");

  // Redirect if no customer or items - must be in useEffect
  useEffect(() => {
    if (!customer || items.length === 0) {
      navigate("/checkout/customer", { replace: true });
    }
  }, [customer, items.length, navigate]);

  // Early return if no customer or items (after useEffect handles redirect)
  if (!customer || items.length === 0) {
    return null;
  }

  const subtotal = getSubtotal();
  
  // Calculate discount amount
  const discountAmount = selectedDiscount
    ? selectedDiscount.type === "%"
      ? subtotal * (selectedDiscount.value / 100)
      : selectedDiscount.value
    : discountType === "%"
      ? subtotal * (discount / 100)
      : discount;
  
  // Calculate tax amount
  const taxAmount = subtotal * (taxRate / 100);
  
  // Calculate total: Subtotal - Discount + Tax
  const total = Math.max(0, subtotal - discountAmount + taxAmount);

  const handleCollectPayment = () => {
    navigate("/checkout/payment", { 
      state: { 
        customer, 
        total, 
        subtotal, 
        tax: taxAmount,
        taxRate,
        discount: discountAmount,
        discountType: selectedDiscount ? selectedDiscount.type : discountType,
        notes 
      } 
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader
        title="Checkout"
        showBack={true}
      />
      
      <div 
        className="flex-1 overflow-y-auto scrollable px-3 pb-4" 
        style={{ 
          paddingTop: 'calc(3rem + env(safe-area-inset-top) + 0.5rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 120px)',
        }}
      >
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Customer</h3>
          <p className="text-base font-medium text-gray-900">{customer.name}</p>
          <p className="text-sm text-gray-600">{customer.email}</p>
          <p className="text-sm text-gray-600">{customer.phone}</p>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Items</h3>
          <div className="space-y-3">
            {items.map((item: any) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1 truncate">{item.name}</h4>
                  <p className="text-xs text-gray-600 mb-1">SKU: {item.sku}</p>
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

        {/* Discount Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start h-12"
              onClick={() => setShowDiscountModal(true)}
            >
              <Tag className="h-4 w-4 mr-2" />
              {selectedDiscount || discount > 0
                ? selectedDiscount
                  ? `${selectedDiscount.name} (${selectedDiscount.type === "%" ? `${selectedDiscount.value}%` : `$${selectedDiscount.value}`})`
                  : `Custom Discount (${discountType === "%" ? `${discount}%` : `$${discount}`})`
                : "Add Order Discount"}
            </Button>
            {(selectedDiscount || discount > 0) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-destructive"
                onClick={() => {
                  setSelectedDiscount(null);
                  setDiscount(0);
                  setCustomDiscountValue("");
                }}
              >
                Remove Discount
              </Button>
            )}
          </div>
        </div>

        {/* Tax Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <Label className="text-sm font-semibold text-gray-900 mb-2 block">Tax</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={taxRate}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setTaxRate(Number.isNaN(value) ? 0 : value);
              }}
              className="w-20 h-10 text-right text-sm border-gray-300 rounded"
              min="0"
              max="100"
              step="0.01"
              placeholder="0"
            />
            <span className="text-sm text-gray-700">%</span>
            <span className="text-sm font-medium text-gray-900 ml-auto">
              ${taxAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-sm font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Discount</span>
                <span className="text-sm font-semibold text-green-600">
                  -${Math.min(discountAmount, subtotal).toFixed(2)}
                </span>
              </div>
            )}
            {taxRate > 0 && (
            <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax ({taxRate}%)</span>
                <span className="text-sm font-semibold text-gray-900">${taxAmount.toFixed(2)}</span>
            </div>
            )}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-orange-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <Label className="text-sm font-semibold text-gray-900 mb-2 block">Notes</Label>
          <textarea
            className="w-full min-h-[100px] p-3 rounded-lg border border-gray-300 bg-background text-sm resize-y"
            placeholder="Add any notes or special instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Footer Button */}
      <BottomActionBar>
        <Button
          onClick={handleCollectPayment}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl"
        >
          Collect Payment
        </Button>
      </BottomActionBar>

      {/* Discount Modal */}
      <Dialog open={showDiscountModal} onOpenChange={setShowDiscountModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Discount</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Select an existing discount or create a custom one</p>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Add Custom Discount */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Custom Discount
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Discount Value *</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={customDiscountValue}
                    onChange={(e) => setCustomDiscountValue(e.target.value)}
                    className="mt-2"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Type *</Label>
                  <Select value={customDiscountType} onValueChange={(value: "%" | "$") => setCustomDiscountType(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="%">Percentage (%)</SelectItem>
                      <SelectItem value="$">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (customDiscountValue) {
                      const value = parseFloat(customDiscountValue);
                      setDiscount(value);
                      setDiscountType(customDiscountType);
                      setSelectedDiscount(null);
                      setCustomDiscountValue("");
                      setShowDiscountModal(false);
                    }
                  }}
                  disabled={!customDiscountValue || parseFloat(customDiscountValue) <= 0}
                >
                  Add Custom Discount
                </Button>
              </div>
            </div>

            {/* Select from Existing Discounts */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Select from Existing Discounts</h3>
              <div className="space-y-2">
                {mockDiscounts
                  .filter(d => d.active)
                  .map(disc => {
                    const calculatedDiscount = disc.type === "%" ? subtotal * (disc.value / 100) : disc.value;
                    const isExceedsSubtotal = calculatedDiscount > subtotal;

                    return (
                      <div
                        key={disc.id}
                        onClick={() => {
                          if (!isExceedsSubtotal) {
                            setSelectedDiscount(disc);
                            setDiscount(0);
                            setShowDiscountModal(false);
                          }
                        }}
                        className={cn(
                          "p-4 rounded-xl border cursor-pointer transition-colors",
                          selectedDiscount?.id === disc.id
                            ? "bg-primary/10 border-primary"
                            : isExceedsSubtotal
                            ? "opacity-50 cursor-not-allowed"
                            : "bg-card hover:bg-accent/5"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{disc.name}</p>
                            </div>
                            <p className="text-sm text-primary font-medium mt-1">
                              {disc.type} {disc.value}
                              {disc.type === "%" ? "%" : ""}
                            </p>
                            {isExceedsSubtotal && (
                              <p className="text-xs text-destructive mt-1">Exceeds subtotal amount</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutSummary;

