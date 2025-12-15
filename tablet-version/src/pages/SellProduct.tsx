import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockInventory } from "@/data/mobileMockData";
import { Plus, Minus, Search, Image as ImageIcon, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const SellProduct = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
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

  return (
    <div className="h-full flex flex-col overflow-hidden">
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
      
      <div className="flex-1 overflow-y-auto scrollable px-3 pb-2" style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top) + 0.125rem)' }}>
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
    </div>
  );
};

export default SellProduct;

