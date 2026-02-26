import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
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
      <MobileHeader 
        title="Customers"
        actions={
          <Button size="sm" onClick={() => navigate("/customers/new")}>
            <Plus className="h-4 w-4" />
          </Button>
        }
      />
      
      <div className="flex-1 overflow-y-auto scrollable px-4 pb-6 space-y-4" style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top) + 0.5rem)' }}>
        {/* Search */}
        <div className={cn("relative", isEmployee ? "max-w-md mx-auto" : "")}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
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
              >
                {f}
              </Button>
            ))}
          </div>
        )}
        
        {/* List */}
        {filteredCustomers.length > 0 ? (
          <div className="space-y-3">
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
