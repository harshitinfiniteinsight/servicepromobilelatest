import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { mockCustomers, mockInvoices } from "@/data/mobileMockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MapPin, DollarSign, Calendar, Edit, Camera, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";
import { toast } from "sonner";
import { showSuccessToast } from "@/utils/toast";
import CustomerAddNoteModal from "@/components/modals/CustomerAddNoteModal";
import { getCustomerOrders, Order } from "@/services/orderService";

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const customer = mockCustomers.find(c => c.id === id);
  
  if (!customer) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Customer not found</p>
      </div>
    );
  }

  const customerInvoices = mockInvoices.filter(i => i.customerId === id);
  const initials = customer.name.split(" ").map(n => n[0]).join("");
  
  // Check for edit parameter in URL
  const editParam = searchParams.get("edit");
  const [isEditing, setIsEditing] = useState(editParam === "true");
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  
  const [formState, setFormState] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    company: customer.notes ?? "",
    address: customer.address,
    gender: (customer as any).gender || "Male", // Default to Male if not available
  });

  // Determine if customer is active
  const isActive = customer.status === "Active";

  // Reset form state when customer changes
  useEffect(() => {
    setFormState({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.notes ?? "",
      address: customer.address,
      gender: (customer as any).gender || "Male",
    });
  }, [customer]);

  // Set edit mode based on URL parameter
  useEffect(() => {
    if (editParam === "true") {
      setIsEditing(true);
    }
  }, [editParam]);

  // Fetch customer orders (including cart orders)
  useEffect(() => {
    const fetchOrders = async () => {
      if (!id) return;
      try {
        setIsLoadingOrders(true);
        const customerOrders = await getCustomerOrders(id);
        setOrders(customerOrders);
      } catch (error) {
        console.error("Error fetching customer orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [id, location.key]); // location.key ensures refresh when navigating from checkout

  const handleChange = (field: keyof typeof formState) => (value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBack = () => {
    if (isEditing) {
      // If in edit mode, exit edit mode and remove URL parameter
      setIsEditing(false);
      navigate(`/customers/${id}`, { replace: true });
    } else {
      // Otherwise, navigate back normally
      navigate(-1);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader 
        title={`Customer History of ${customer.name}`}
        showBack={true}
        onBack={handleBack}
      />
      
      <div className="flex-1 overflow-y-auto scrollable pt-12 pb-6 space-y-4 px-4">
        {/* Customer Details Card */}
        <Card className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
          <CardHeader className="p-3">
            <div className="flex justify-between items-center border-b border-gray-200 pb-1">
              <CardTitle className="text-base font-semibold text-gray-800">Customer Details</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(prev => !prev)}
                  className="h-7 w-7 text-gray-500 hover:text-orange-500"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                  className="h-7 w-7 text-gray-400 hover:text-gray-600"
                >
                  {isDetailsExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {isDetailsExpanded && (
            <CardContent className="p-3 space-y-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {/* Name */}
                <div>
                  <p className="font-medium text-gray-600 mb-1">Name</p>
                  {isEditing ? (
                    <Input
                      value={formState.name}
                      onChange={e => handleChange("name")(e.target.value)}
                      className="h-9 text-sm"
                    />
                  ) : (
                    <p className="text-gray-900">{formState.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <p className="font-medium text-gray-600 mb-1">Email</p>
                  {isEditing ? (
                    <Input
                      value={formState.email}
                      onChange={e => handleChange("email")(e.target.value)}
                      className="h-9 text-sm"
                    />
                  ) : (
                    <p className="text-gray-900">{formState.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <p className="font-medium text-gray-600 mb-1">Phone</p>
                  {isEditing ? (
                    <Input
                      value={formState.phone}
                      onChange={e => handleChange("phone")(e.target.value)}
                      className="h-9 text-sm"
                    />
                  ) : (
                    <p className="text-gray-900">{formState.phone}</p>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <p className="font-medium text-gray-600 mb-1">Company Name</p>
                  {isEditing ? (
                    <Input
                      value={formState.company}
                      onChange={e => handleChange("company")(e.target.value)}
                      className="h-9 text-sm"
                    />
                  ) : (
                    <p className="text-gray-900">{formState.company || "-"}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <p className="font-medium text-gray-600 mb-1">Address</p>
                  {isEditing ? (
                    <Textarea
                      value={formState.address}
                      onChange={e => handleChange("address")(e.target.value)}
                      className="min-h-[60px] text-sm"
                    />
                  ) : (
                    <p className="text-gray-900 whitespace-pre-line">{formState.address || "-"}</p>
                  )}
                </div>

                {/* Active */}
                <div>
                  <p className="font-medium text-gray-600 mb-1">Active</p>
                  {isEditing ? (
                    <Select
                      value={isActive ? "Yes" : "No"}
                      onValueChange={(value) => {
                        // Handle active status change
                        console.info("Active status changed to", value);
                      }}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-900">{isActive ? "YES" : "NO"}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <p className="font-medium text-gray-600 mb-1">Gender</p>
                  {isEditing ? (
                    <Select
                      value={formState.gender}
                      onValueChange={(value) => handleChange("gender")(value)}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-900">{formState.gender}</p>
                  )}
                </div>

                {/* Add Memo */}
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-600">Add Memo</p>
                  <Button
                    onClick={() => setAddNoteModalOpen(true)}
                    className="flex items-center space-x-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-lg hover:bg-orange-100 transition h-auto text-xs font-normal"
                  >
                    <span>Memo</span>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end pt-3 border-t border-gray-200 mt-3">
                  <Button 
                    size="sm"
                    onClick={() => {
                      console.info("Saving customer", formState);
                      setIsEditing(false);
                      navigate(`/customers/${id}`, { replace: true });
                      showSuccessToast("Customer information updated successfully");
                    }}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Orders */}
        <Card className="rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-col gap-2 p-3">
            <CardTitle className="text-base font-semibold">Orders</CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <Input
                placeholder="Search orders..."
                className="w-full sm:w-1/2"
              />
              <div className="flex items-center gap-2">
                <Select>
                  <SelectTrigger className="w-28">
                    <span>All</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="invoices">Invoices</SelectItem>
                    <SelectItem value="estimates">Estimates</SelectItem>
                    <SelectItem value="agreements">Agreements</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Range
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {(() => {
              // Combine cart orders with invoices
              // Convert invoices to order format for display
              const invoiceOrders = customerInvoices.map(inv => ({
                id: inv.id,
                type: inv.type === "recurring" ? "invoice" : "invoice" as const,
                orderType: inv.type === "recurring" ? "Recurring" : "Single" as const,
                source: "invoice" as const,
                customerId: inv.customerId,
                customerName: inv.customerName,
                items: [],
                subtotal: inv.amount,
                tax: 0,
                total: inv.amount,
                createdAt: inv.issueDate,
                issueDate: inv.issueDate,
                status: inv.status,
                paymentMethod: inv.paymentMethod,
              }));

              // Combine all orders and sort by date (newest first)
              const allOrders = [...orders, ...invoiceOrders].sort((a, b) => {
                const dateA = new Date(a.createdAt || a.issueDate || 0).getTime();
                const dateB = new Date(b.createdAt || b.issueDate || 0).getTime();
                return dateB - dateA;
              });

              if (isLoadingOrders) {
                return (
                  <div className="py-8 text-center text-muted-foreground">
                    Loading orders...
                  </div>
                );
              }

              if (allOrders.length === 0) {
                return (
                  <div className="py-8 text-center text-muted-foreground">
                    No orders found for this customer.
                  </div>
                );
              }

              return (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allOrders.map(order => (
                      <TableRow key={order.id} className="cursor-pointer hover:bg-muted/40">
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.employeeName || "N/A"}</TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {order.orderType || order.type || "Invoice"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {new Date(order.createdAt || order.issueDate || Date.now()).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Add Note Modal */}
      <CustomerAddNoteModal
        open={addNoteModalOpen}
        onClose={() => setAddNoteModalOpen(false)}
        customer={customer}
        onAddNote={(customerId, noteText) => {
          console.info("Adding note to customer", customerId, noteText);
          showSuccessToast("Note added successfully");
        }}
      />
    </div>
  );
};

export default CustomerDetails;
