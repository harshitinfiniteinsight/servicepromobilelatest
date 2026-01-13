import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import ProductOrderCard from "@/components/cards/ProductOrderCard";
import EmptyState from "@/components/cards/EmptyState";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getAllOrders } from "@/services/orderService";

interface ProductOrder {
  id: string;
  items: Array<{ name: string; price: number }>;
  customerName: string;
  employeeName: string;
  totalAmount: number;
  date: string;
  paymentStatus: string;
}

const ProductOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<ProductOrder[]>([]);

  // Load orders from localStorage and handle new order from navigation
  useEffect(() => {
    const loadOrders = async () => {
      try {
        // Get all orders from localStorage
        const allOrders = await getAllOrders();
        
        // Convert Order format to ProductOrder format
        const productOrders: ProductOrder[] = allOrders
          .filter(order => order.type === "cart" && order.status === "Paid")
          .map(order => ({
            id: order.id,
            items: order.items.map(item => ({
              name: item.name,
              price: item.price * item.quantity, // Total price for the item
            })),
            customerName: order.customerName,
            employeeName: order.employeeName || "System",
            totalAmount: order.total,
            date: order.createdAt || order.issueDate || new Date().toISOString().split("T")[0],
            paymentStatus: order.status || "Paid",
          }));

        // Check if there's a new order from navigation state
        const navigationState = location.state as { newOrder?: ProductOrder } | null;
        let finalOrders = productOrders;

        if (navigationState?.newOrder) {
          // Check if the new order already exists in the loaded orders (by ID)
          const orderExists = productOrders.some(order => order.id === navigationState.newOrder!.id);
          
          if (!orderExists) {
            // Prepend the new order to the list (it will be at the top)
            finalOrders = [navigationState.newOrder, ...productOrders];
          }
          // Clear the navigation state to prevent duplicate on re-render
          window.history.replaceState({}, document.title);
        }

        // Sort by date descending (newest first)
        finalOrders.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        });

        // Deduplicate orders by ID to ensure unique keys
        const uniqueOrders = finalOrders.reduce((acc, order) => {
          if (!acc.find(o => o.id === order.id)) {
            acc.push(order);
          }
          return acc;
        }, [] as ProductOrder[]);

        setOrders(uniqueOrders);
      } catch (error) {
        console.error("Error loading orders:", error);
        setOrders([]);
      }
    };

    loadOrders();
  }, [location.state]);

  // Filter orders based on search query
  const filteredOrders = orders.filter((order) => {
    const searchLower = search.toLowerCase();
    return (
      order.id.toLowerCase().includes(searchLower) ||
      order.customerName.toLowerCase().includes(searchLower) ||
      order.employeeName.toLowerCase().includes(searchLower) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchLower))
    );
  });

  const handleOrderClick = (orderId: string) => {
    // Navigate to order details if needed
    // navigate(`/sales/product-orders/${orderId}`);
    console.log("Order clicked:", orderId);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title="Product Orders" showBack={true} />

      <div className="flex-1 overflow-y-auto scrollable" style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top) + 0.25rem)' }}>
        {/* Search Bar */}
        <div className="px-4 pt-2.5 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-xl border-gray-200"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="px-4 pb-4 space-y-2.5">
          {filteredOrders.length === 0 ? (
            <EmptyState
              title="No orders found"
              description={search ? "Try adjusting your search terms" : "No product orders available"}
            />
          ) : (
            filteredOrders.map((order) => (
              <ProductOrderCard
                key={order.id}
                orderId={order.id}
                items={order.items}
                customerName={order.customerName}
                employeeName={order.employeeName}
                totalAmount={order.totalAmount}
                date={order.date}
                paymentStatus={order.paymentStatus}
                onClick={() => handleOrderClick(order.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductOrders;

