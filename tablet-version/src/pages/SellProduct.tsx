import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import TabletHeader from "@/components/layout/TabletHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockInventory } from "@/data/mobileMockData";
import { Plus, Minus, Search, Image as ImageIcon, ShoppingCart, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const SellProduct = () => {
  const navigate = useNavigate();
  const { addItem, items, removeItem, updateQuantity, getSubtotal } = useCart();
  const [search, setSearch] = useState("");
  
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

  const handleContinueToPay = () => {
    navigate("/checkout/customer");
  };

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
        {/* Left Panel: Cart - 40% */}
        <aside className="tablet:w-[40%] bg-gray-50/80 border-r overflow-y-auto flex flex-col">
          <div className="sticky top-0 bg-gray-50/95 border-b px-4 py-3 z-10">
            <h3 className="font-semibold text-sm text-foreground">Shopping Cart</h3>
          </div>

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
    </div>
  );
};

export default SellProduct;

