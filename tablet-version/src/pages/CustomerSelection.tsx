import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomActionBar from "@/components/layout/BottomActionBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockCustomers } from "@/data/mobileMockData";
import { Search, Plus, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

const CustomerSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, setSelectedCustomer: setCartCustomer, getSelectedCustomer } = useCart();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockCustomers[number] | null>(null);
  const [customers, setCustomers] = useState(mockCustomers);

  // Check if we're returning from AddCustomer with a new customer
  useEffect(() => {
    const state = location.state as { newCustomer?: typeof mockCustomers[number] } | null;
    if (state?.newCustomer) {
      // Add new customer to list
      setCustomers(prev => [state.newCustomer!, ...prev]);
      // Auto-select the new customer in local state
      setSelectedCustomer(state.newCustomer);
      // Set customer in cart context
      setCartCustomer({
        id: state.newCustomer.id,
        name: state.newCustomer.name,
        email: state.newCustomer.email,
        phone: state.newCustomer.phone,
        address: state.newCustomer.address || "",
      });
      // Auto-navigate to checkout summary
      setTimeout(() => {
        navigate("/checkout/summary", { replace: true });
      }, 100);
    }
  }, [location.state, navigate, setCartCustomer]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.email.toLowerCase().includes(search.toLowerCase()) ||
    customer.phone.includes(search)
  );

  const handleSelectCustomer = (customer: typeof mockCustomers[number]) => {
    setSelectedCustomer(customer);
    // Also set in cart context
    setCartCustomer({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || "",
    });
  };

  const handleProceedToCheckout = () => {
    if (!selectedCustomer) return;
    // Ensure customer is set in cart context
    setCartCustomer({
      id: selectedCustomer.id,
      name: selectedCustomer.name,
      email: selectedCustomer.email,
      phone: selectedCustomer.phone,
      address: selectedCustomer.address || "",
    });
    navigate("/checkout/summary");
  };

  // Redirect to inventory if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate("/inventory", { replace: true });
    }
  }, [items.length, navigate]);

  // Don't render if cart is empty (will redirect)
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader
        title="Select Customer"
        showBack={true}
      />
      
      <div 
        className="flex-1 overflow-y-auto scrollable px-3 pb-4" 
        style={{ 
          paddingTop: 'calc(3rem + env(safe-area-inset-top) + 0.5rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 90px)',
        }}
      >
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
        </div>

        {/* Add New Customer Button */}
        <Button
          onClick={() => navigate("/customers/new", { state: { fromCheckout: true } })}
          className="w-full mb-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Customer
        </Button>

        {/* Customer List */}
        <div className="space-y-2">
          {filteredCustomers.map((customer) => (
            <button
              key={customer.id}
              onClick={() => handleSelectCustomer(customer)}
              className={cn(
                "w-full p-4 rounded-xl border-2 transition-all text-left",
                selectedCustomer?.id === customer.id
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">{customer.name}</h4>
                  <p className="text-sm text-gray-600 mb-1">{customer.email}</p>
                  <p className="text-sm text-gray-600">{customer.phone}</p>
                </div>
                {selectedCustomer?.id === customer.id && (
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No customers found</p>
          </div>
        )}
      </div>

      {/* Footer Button */}
      {selectedCustomer && (
        <BottomActionBar>
          <Button
            onClick={handleProceedToCheckout}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl"
          >
            Proceed to Checkout
          </Button>
        </BottomActionBar>
      )}
    </div>
  );
};

export default CustomerSelection;

