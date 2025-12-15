import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TabletHeader from "@/components/layout/TabletHeader";
import CustomerCard from "@/components/cards/CustomerCard";
import { toast } from "sonner";
import EmptyState from "@/components/cards/EmptyState";
import { mockCustomers } from "@/data/mobileMockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Users } from "lucide-react";
import SendSMSModal from "@/components/modals/SendSMSModal";
import CustomerAddNoteModal from "@/components/modals/CustomerAddNoteModal";
import { cn } from "@/lib/utils";

const Customers = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Active" | "Deactivated">("Active");
  const [sendSMSModalOpen, setSendSMSModalOpen] = useState(false);
  
  // Add Customer form state (tablet only)
  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });
  const [selectedCustomerForSMS, setSelectedCustomerForSMS] = useState<typeof mockCustomers[0] | null>(null);
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [selectedCustomerForNote, setSelectedCustomerForNote] = useState<typeof mockCustomers[0] | null>(null);
  
  // Check if user is employee
  const userRole = localStorage.getItem("userType") || "merchant";
  const isEmployee = userRole === "employee";
  
  const isActiveStatus = (status: string) => status === "Active";
  const isDeactivatedStatus = (status: string) => status === "Deactivated" || status === "Inactive";

  const filteredCustomers = mockCustomers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                         c.email.toLowerCase().includes(search.toLowerCase()) ||
                         c.phone.includes(search);
    // For employees, only show active customers
    if (isEmployee) {
      return matchesSearch && isActiveStatus(c.status);
    }
    // For merchants, apply filter
    const matchesFilter =
      filter === "Active" ? isActiveStatus(c.status) : isDeactivatedStatus(c.status);
    return matchesSearch && matchesFilter;
  });

  const activeCount = mockCustomers.filter(c => isActiveStatus(c.status)).length;
  const deactivatedCount = mockCustomers.filter(c => isDeactivatedStatus(c.status)).length;

  const handleAddCustomer = () => {
    // Validate required fields
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email || !newCustomer.phone) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // In real app, this would save to backend
    toast.success(`Customer ${newCustomer.firstName} ${newCustomer.lastName} added successfully`);
    
    // Reset form
    setNewCustomer({ firstName: "", lastName: "", email: "", phone: "" });
    
    // Navigate to customer details or refresh list
    // navigate("/customers/new") // or handle differently
  };

  const handleQuickAction = (customerId: string, action: string) => {
    switch (action) {
      case "edit":
        navigate(`/customers/${customerId}?edit=true`);
        break;
      case "email":
        toast.success("Opening email composer...");
        break;
      case "sms":
        const customer = mockCustomers.find(c => c.id === customerId);
        if (customer) {
          setSelectedCustomerForSMS(customer);
          setSendSMSModalOpen(true);
        }
        break;
      case "memo":
        const memoCustomer = mockCustomers.find(c => c.id === customerId);
        if (memoCustomer) {
          setSelectedCustomerForNote(memoCustomer);
          setAddNoteModalOpen(true);
        }
        break;
      case "appointment":
        const appointmentCustomer = mockCustomers.find(c => c.id === customerId);
        if (appointmentCustomer) {
          navigate(`/appointments/new?customerId=${appointmentCustomer.id}&customerName=${encodeURIComponent(appointmentCustomer.name)}`);
        }
        break;
      case "deactivate":
        toast.info("Deactivation workflow coming soon");
        break;
      case "create-invoice":
        navigate(`/invoices/new?customer=${customerId}`);
        break;
      case "create-estimate":
        navigate(`/estimates/new?customer=${customerId}`);
        break;
      case "create-agreement":
        navigate(`/agreements/new?customer=${customerId}`);
        break;
      case "details":
        navigate(`/customers/${customerId}`);
        break;
      default:
        toast.info("Action coming soon");
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <TabletHeader 
        title="Customers"
        actions={
          <Button size="sm" onClick={() => navigate("/customers/new")} className="tablet:hidden">
            <Plus className="h-4 w-4" />
          </Button>
        }
      />
      
      {/* Main Content Area - 2-column layout on tablet */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full tablet:grid tablet:grid-cols-[35%_65%] tablet:gap-0">
          {/* Left Section: Add Customer Form - Tablet Only */}
          <aside className="hidden tablet:block tablet:overflow-y-auto tablet:border-r tablet:border-gray-200 tablet:bg-gray-50">
            <div className="sticky top-0 p-5 bg-white border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Add Customer</h3>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddCustomer(); }} className="space-y-3">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-xs font-medium text-gray-700 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter first name"
                    value={newCustomer.firstName}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                    className="h-9 text-sm"
                    required
                  />
                </div>
                
                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-xs font-medium text-gray-700 mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter last name"
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                    className="h-9 text-sm"
                    required
                  />
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="customer@example.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    className="h-9 text-sm"
                    required
                  />
                </div>
                
                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    className="h-9 text-sm"
                    required
                  />
                </div>
                
                {/* Submit Button */}
                <Button 
                  type="submit"
                  className="w-full h-10 text-sm font-medium mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </form>
            </div>
          </aside>

          {/* Right Section: Customer List */}
          <div className="h-full overflow-y-auto scrollable px-4 tablet:px-5 pb-6 tablet:pb-8">
            <div className="tablet:max-w-5xl tablet:pt-4 space-y-3">
            {/* Search - Tablet: Horizontal layout with filters */}
            <div className="tablet:flex tablet:items-center tablet:gap-4 tablet:justify-between space-y-3 tablet:space-y-0">
              <div className={cn("relative", isEmployee ? "max-w-md mx-auto tablet:mx-0" : "tablet:flex-1 tablet:max-w-sm")}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, email, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            
              {/* Filters - Only show for merchant/admin */}
              {!isEmployee && (
                <div className="flex gap-2">
                  {["Active", "Deactivated"].map(f => (
                    <Button
                      key={f}
                      variant={filter === f ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(f as "Active" | "Deactivated")}
                      className="tablet:min-w-[100px]"
                    >
                      {f} ({f === "Active" ? activeCount : deactivatedCount})
                    </Button>
                  ))}
                </div>
              )}
            </div>
            
            {/* List - Tablet: Reduced spacing */}
            {filteredCustomers.length > 0 ? (
              <div className="space-y-3 tablet:space-y-2">
                {filteredCustomers.map(customer => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    variant={isDeactivatedStatus(customer.status) ? "deactivated" : "default"}
                    isEmployee={isEmployee}
                    onActivate={
                      isDeactivatedStatus(customer.status) && !isEmployee
                        ? () => toast.success("Customer activation coming soon")
                        : undefined
                    }
                    onQuickAction={
                      isActiveStatus(customer.status)
                        ? action => handleQuickAction(customer.id, action)
                        : undefined
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Users className="h-10 w-10 text-muted-foreground" />}
                title="No customers found"
                description="Try adjusting your search or filters"
                actionLabel="Add Customer"
                onAction={() => navigate("/customers/new")}
              />
            )}
            </div>
          </div>
        </div>
      </div>

      {selectedCustomerForSMS && (
        <SendSMSModal
          isOpen={sendSMSModalOpen}
          onClose={() => {
            setSendSMSModalOpen(false);
            setSelectedCustomerForSMS(null);
          }}
          customerPhone={selectedCustomerForSMS.phone || ""}
          customerCountryCode="+1"
          entityId={selectedCustomerForSMS.id}
          entityType="customer"
          customerName={selectedCustomerForSMS.name}
        />
      )}

      <CustomerAddNoteModal
        open={addNoteModalOpen}
        onClose={() => {
          setAddNoteModalOpen(false);
          setSelectedCustomerForNote(null);
        }}
        customer={selectedCustomerForNote}
        onAddNote={(customerId, noteText) => {
          // Handle note addition - in real app, this would save to backend
          console.info("Adding note to customer", customerId, noteText);
          toast.success("Note added successfully");
        }}
      />
    </div>
  );
};

export default Customers;
