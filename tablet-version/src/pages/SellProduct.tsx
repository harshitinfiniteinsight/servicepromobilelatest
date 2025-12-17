import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import TabletHeader from "@/components/layout/TabletHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockInventory, mockCustomers, mockDiscounts } from "@/data/mobileMockData";
import { Plus, Minus, Search, Image as ImageIcon, ShoppingCart, Trash2, User, Mail, Phone, ArrowLeft, Percent, DollarSign, FileText, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PaymentModal from "@/components/modals/PaymentModal";
import AddCustomerModal from "@/components/modals/AddCustomerModal";
import { createInvoice } from "@/services/invoiceService";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SellProduct = () => {
  const navigate = useNavigate();
  const { addItem, items, removeItem, updateQuantity, getSubtotal, clearCart } = useCart();
  const [search, setSearch] = useState("");
  // 3-step flow: cart → customer → checkout (no route changes, left panel only)
  const [viewMode, setViewMode] = useState<"cart" | "customer" | "checkout">("cart");
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockCustomers[number] | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"%" | "$">("%");
  const [selectedDiscount, setSelectedDiscount] = useState<typeof mockDiscounts[number] | null>(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [customDiscountValue, setCustomDiscountValue] = useState("");
  const [customDiscountType, setCustomDiscountType] = useState<"%" | "$">("%");
  const [taxRate, setTaxRate] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [customersList, setCustomersList] = useState(mockCustomers);
  
  // Quantity state for each inventory item
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  const filteredInventory = mockInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.sku.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  // Quantity management functions
  const getItemQuantity = (itemId: string) => {
    return itemQuantities[itemId] ?? 1;
  };

  const updateItemQuantity = (itemId: string, change: number) => {
    const currentQty = getItemQuantity(itemId);
    const item = mockInventory.find(i => i.id === itemId);
    const maxQty = item?.stock ?? 0;
    const newQty = Math.max(1, Math.min(maxQty, currentQty + change));
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: newQty,
    }));
  };

  const handleAddToCart = (item: typeof mockInventory[number]) => {
    if (item.stock === 0) {
      toast.error("Item is out of stock");
      return;
    }
    const qty = getItemQuantity(item.id);
    if (qty > item.stock) {
      toast.error(`Only ${item.stock} items available in stock`);
      return;
    }
    
    // Add item directly to cart
    addItem(
      {
        id: item.id,
        name: item.name,
        sku: item.sku,
        price: item.unitPrice || 0,
        type: item.type,
      },
      qty
    );
    
    // Show success toast
    toast.success("Item added to cart");
    
    // Reset quantity to 1 after adding
    setItemQuantities(prev => ({
      ...prev,
      [item.id]: 1,
    }));
  };

  const getTypeInitial = (type?: string) => {
    switch (type) {
      case "F": return "F";
      case "V": return "V";
      case "U": return "U";
      default: return "U";
    }
  };

  // Checkout calculations
  const subtotal = getSubtotal();
  const discountAmount = selectedDiscount
    ? selectedDiscount.type === "%"
      ? subtotal * (selectedDiscount.value / 100)
      : selectedDiscount.value
    : discountType === "%"
      ? subtotal * (discount / 100)
      : discount;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = (subtotalAfterDiscount * taxRate) / 100;
  const total = subtotalAfterDiscount + taxAmount;

  const handleContinueToPay = () => {
    // Toggle left panel to customer selection without leaving the page
    setViewMode("customer");
  };

  const handleProceedToCheckout = () => {
    if (!selectedCustomer) return;
    setViewMode("checkout");
  };

  const handleCustomerSelect = (customer: typeof mockCustomers[number]) => {
    setSelectedCustomer(customer);
    toast.success(`Customer ${customer.name} selected`);
  };

  const handleCustomerCreated = (newCustomer: any) => {
    // Add new customer to the top of the list
    setCustomersList(prev => [newCustomer, ...prev]);
    // Auto-select the newly created customer for Sell Product flow
    setSelectedCustomer(newCustomer);
    toast.success(`Customer ${newCustomer.name} selected`);
  };

  const handleCollectPayment = () => {
    // Open payment modal for checkout flow (no navigation, overlay only)
    setShowPaymentModal(true);
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
  };

  const handlePaymentComplete = async (method: string) => {
    setShowPaymentModal(false);
    
    // Create invoice from Sell Product flow (no job/job address required)
    try {
      if (!selectedCustomer) {
        toast.error("Customer is required to create invoice");
        return;
      }

      // Build invoice items from cart
      const invoiceItems = items.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku || "",
        price: item.price,
        quantity: item.quantity,
        amount: item.price * item.quantity,
        type: item.type || "U",
      }));

      // Create invoice data - Sell Product invoices do NOT require job address
      const invoiceData = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
        amount: total,
        status: "Paid" as const, // Marked as paid since payment was collected
        paymentMethod: method,
        type: "single" as const,
        source: "sell_product" as const, // Flag to indicate this came from Sell Product (no job required)
        items: invoiceItems,
        subtotal,
        tax: taxAmount,
        total,
        discount: discountAmount,
        discountType: selectedDiscount ? selectedDiscount.type : discountType,
        notes: notes || undefined,
      };

      const newInvoice = await createInvoice(invoiceData);
      
      toast.success(`Payment collected via ${method}. Invoice ${newInvoice.id} created.`);
      
      // Clear cart after successful invoice creation
      clearCart();
      
      // Reset checkout flow state
      setViewMode("cart");
      setSelectedCustomer(null);
      setDiscount(0);
      setDiscountType("%");
      setSelectedDiscount(null);
      setTaxRate(0);
      setNotes("");

      // Redirect to invoices list (not details) - Sell Product flow returns to main invoice view
      navigate("/invoices");
    } catch (error) {
      console.error("Failed to create invoice:", error);
      toast.error("Failed to create invoice. Please try again.");
    }
  };

  // Load stored customers on mount
  useEffect(() => {
    const loadCustomers = () => {
      const storedCustomers = localStorage.getItem("servicepro_customers");
      if (storedCustomers) {
        const parsed = JSON.parse(storedCustomers);
        // Merge with mock customers, with stored customers taking priority
        const merged = [...parsed, ...mockCustomers.filter(mc => !parsed.find((pc: any) => pc.id === mc.id))];
        setCustomersList(merged);
      } else {
        setCustomersList(mockCustomers);
      }
    };
    loadCustomers();
  }, []);

  const filteredCustomers = customersList.filter(customer => {
    const searchLower = customerSearch.toLowerCase();
    return customer.name.toLowerCase().includes(searchLower) ||
           customer.email.toLowerCase().includes(searchLower) ||
           customer.phone.includes(searchLower);
  });

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Mobile Header */}
      <div className="tablet:hidden">
        <MobileHeader 
          title="Sell Product"
          actions={
            <Button
              size="sm"
              onClick={() => navigate("/inventory/new")}
              className="h-9 px-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium shrink-0"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Inventory
            </Button>
          }
        />
      </div>

      {/* Tablet Header */}
      <div className="hidden tablet:block">
        <TabletHeader
          title="Sell Product"
          actions={
            <Button
              size="sm"
              onClick={() => navigate("/inventory/new")}
              className="h-9 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Inventory
            </Button>
          }
        />
      </div>

      {/* Mobile Layout */}
      <div className="tablet:hidden flex-1 overflow-y-auto scrollable px-3 pb-2" style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top) + 0.125rem)' }}>
        {/* Search Field */}
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10" />
            <Input 
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm py-2"
            />
          </div>
        </div>
        
        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {filteredInventory.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-primary/30 transition-all duration-200"
            >
              {/* Full-Width Image Section */}
              <div className="relative w-full h-24 bg-gray-100 rounded-t-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              </div>

              {/* Content Section */}
              <div className="p-2">
                {/* Item Title */}
                <h3 className="text-xs font-semibold text-gray-900 mb-0.5 truncate leading-tight">
                  {item.name}
                </h3>

                {/* Compact Info Row: SKU, Type, Stock, Price */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <span className="text-[8px] text-gray-600 font-medium truncate">
                      SKU: {item.sku}
                    </span>
                    <span className="text-gray-400 text-[8px]">•</span>
                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[8px] font-medium rounded-full shrink-0">
                      {getTypeInitial(item.type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[8px] text-gray-500">Stock:</span>
                    <span className="text-xs font-bold text-gray-900">{item.stock}</span>
                    {item.type !== "V" && item.unitPrice !== undefined && (
                      <>
                        <span className="text-gray-400 text-[8px]">•</span>
                        <span className="text-xs font-bold text-orange-600">
                          ${item.unitPrice.toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Quantity Counter and Add to Cart - Compact Row */}
                {item.stock > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md px-1.5 py-0.5 shadow-sm">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updateItemQuantity(item.id, -1)}
                        disabled={getItemQuantity(item.id) <= 1}
                        className="h-5 w-5 p-0 hover:bg-orange-100 hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="h-2.5 w-2.5" />
                      </Button>
                      <span className="text-xs font-semibold min-w-[1.25rem] text-center text-gray-900">
                        {getItemQuantity(item.id)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updateItemQuantity(item.id, 1)}
                        disabled={getItemQuantity(item.id) >= item.stock}
                        className="h-5 w-5 p-0 hover:bg-orange-100 hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stock === 0}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1 py-1.5 px-2 border rounded-lg text-[10px] font-semibold shadow-sm hover:shadow-md transition-all duration-200",
                        item.stock === 0
                          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
                      )}
                    >
                      <ShoppingCart className="h-3 w-3" />
                      <span>Add</span>
                    </button>
                  </div>
                )}

                {/* Out of Stock Message */}
                {item.stock === 0 && (
                  <div className="mt-1 text-center">
                    <span className="text-[10px] text-gray-400 font-medium">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredInventory.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm font-medium">No products found</p>
            <p className="text-gray-400 text-xs mt-1">Try adjusting your search</p>
          </div>
        )}
      </div>

      {/* Tablet Layout: Two-column grid */}
      <div className="hidden tablet:flex tablet:flex-1 tablet:overflow-hidden">
        {/* Left Panel: Cart / Customer / Checkout - 40% */}
        <aside className="tablet:w-[40%] bg-gray-50/80 border-r overflow-y-auto flex flex-col">
          <div className="sticky top-0 bg-gray-50/95 border-b px-4 py-3 z-10 flex items-center gap-2">
            {(viewMode === "customer" || viewMode === "checkout") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === "checkout" ? "customer" : "cart")}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h3 className="font-semibold text-sm text-foreground">
              {viewMode === "cart" ? "Shopping Cart" : viewMode === "customer" ? "Select Customer" : "Checkout"}
            </h3>
          </div>

          {/* Toggle between cart items and customer selection without route changes */}
          {viewMode === "cart" ? (
            <>
              <div className="flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm font-medium">Your cart is empty</p>
                    <p className="text-gray-400 text-xs mt-1">Add products to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-gray-200 rounded-xl p-3 flex gap-3 hover:shadow-sm transition-shadow"
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
                              className="h-6 w-6 p-0 hover:bg-orange-100 hover:text-orange-700 disabled:opacity-50"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-semibold min-w-[1.5rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-6 w-6 p-0 hover:bg-orange-100 hover:text-orange-700"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {items.length > 0 && (
                <div className="sticky bottom-0 bg-white border-t p-4 space-y-3">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">Subtotal</span>
                    <span className="text-lg font-bold text-gray-900">${getSubtotal().toFixed(2)}</span>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    onClick={handleContinueToPay}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg"
                  >
                    Continue to Pay
                  </Button>
                </div>
              )}
            </>
          ) : viewMode === "customer" ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Search customer */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>

                {/* Customer list */}
                <div className="space-y-2">
                  {filteredCustomers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <User className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm font-medium">No customers found</p>
                      <p className="text-gray-400 text-xs mt-1">Try adjusting your search</p>
                    </div>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => handleCustomerSelect(customer)}
                        className={cn(
                          "w-full text-left p-3 border rounded-lg transition-all hover:shadow-sm",
                          selectedCustomer?.id === customer.id
                            ? "bg-orange-50 border-orange-300"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {customer.name}
                            </h4>
                            <p className="text-xs text-gray-600 mt-0.5">{customer.email}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{customer.phone}</p>
                          </div>
                          {selectedCustomer?.id === customer.id && (
                            <div className="ml-2 flex-shrink-0">
                              <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Footer with action buttons */}
              <div className="sticky bottom-0 bg-white border-t p-4 space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddCustomerModal(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
                <Button
                  onClick={handleProceedToCheckout}
                  disabled={!selectedCustomer}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </>
          ) : (
            // Checkout view
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Customer Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Customer</h4>
                  {selectedCustomer && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{selectedCustomer.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-xs text-gray-600">{selectedCustomer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-xs text-gray-600">{selectedCustomer.phone}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart Items */}
                <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Items</h4>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-2">
                          <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                          <span className="text-sm font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discount - Modal-based for consistency with invoice/estimate flows */}
                <Button
                  variant="outline"
                  onClick={() => setShowDiscountModal(true)}
                  className="w-full justify-start h-auto py-3 px-3"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  <span className="flex-1 text-left">
                    {discountAmount > 0 ? (
                      <span className="text-sm font-medium">
                        Discount Applied: -${discountAmount.toFixed(2)}
                        {selectedDiscount && (
                          <span className="text-xs text-gray-500 ml-2">({selectedDiscount.name})</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-sm">Add Discount</span>
                    )}
                  </span>
                </Button>

                {/* Tax */}
                <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Tax</h4>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                        placeholder="0"
                        className="pl-10 h-9"
                      />
                    </div>
                    <span className="text-sm text-gray-600">${taxAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Summary</h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-gray-900 font-medium">-${discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900 font-medium">${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t border-orange-300 pt-2">
                      <span className="text-gray-900">Total</span>
                      <span className="text-orange-600">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Notes (Optional)</h4>
                  <Textarea
                    placeholder="Add order notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                </div>
              </div>

              {/* Footer with Collect Payment button */}
              <div className="sticky bottom-0 bg-white border-t p-4">
                <Button
                  onClick={handleCollectPayment}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Collect Payment - ${total.toFixed(2)}
                </Button>
              </div>
            </>
          )}
        </aside>

        {/* Right Panel: Inventory Products - 60% */}
        <main className="tablet:w-[60%] overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Search Field */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 text-sm"
              />
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredInventory.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-primary/30 transition-all duration-200"
                >
                  {/* Full-Width Image Section */}
                  <div className="relative w-full h-32 bg-gray-100 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-3">
                    {/* Item Title */}
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                      {item.name}
                    </h3>

                    {/* Info Row */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <span className="text-xs text-gray-600 truncate">
                          SKU: {item.sku}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                          {getTypeInitial(item.type)}
                        </span>
                      </div>
                    </div>

                    {/* Price and Stock */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Stock:</span>
                        <span className="text-sm font-bold text-gray-900">{item.stock}</span>
                      </div>
                      {item.type !== "V" && item.unitPrice !== undefined && (
                        <span className="text-sm font-bold text-orange-600">
                          ${item.unitPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Section */}
                    {item.stock > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md px-2 py-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => updateItemQuantity(item.id, -1)}
                            disabled={getItemQuantity(item.id) <= 1}
                            className="h-6 w-6 p-0 hover:bg-orange-100 hover:text-orange-700"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-semibold min-w-[1.5rem] text-center">
                            {getItemQuantity(item.id)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => updateItemQuantity(item.id, 1)}
                            disabled={getItemQuantity(item.id) >= item.stock}
                            className="h-6 w-6 p-0 hover:bg-orange-100 hover:text-orange-700"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg text-xs font-semibold text-orange-700 transition-colors"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Add
                        </button>
                      </div>
                    )}

                    {/* Out of Stock */}
                    {item.stock === 0 && (
                      <div className="text-center py-2">
                        <span className="text-xs text-gray-400 font-medium">Out of Stock</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredInventory.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <Search className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-base font-medium">No products found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Discount Modal */}
      <Dialog open={showDiscountModal} onOpenChange={setShowDiscountModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Discount</DialogTitle>
            <DialogDescription>
              Select an existing discount or create a custom one
            </DialogDescription>
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
                      toast.success("Custom discount applied");
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
                            toast.success(`Discount "${disc.name}" applied`);
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

      {/* Add Customer Modal - Modal-based customer creation for Sell Product flow */}
      <AddCustomerModal
        isOpen={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        onCustomerCreated={handleCustomerCreated}
      />

      {/* Payment Modal - Modal-based payment flow for checkout */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentModalClose}
        amount={total}
        onPaymentMethodSelect={handlePaymentComplete}
      />
    </div>
  );
};

export default SellProduct;

