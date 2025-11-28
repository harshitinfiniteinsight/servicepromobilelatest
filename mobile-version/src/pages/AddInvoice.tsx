import { useState, ChangeEvent, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockCustomers, mockInventory, mockEmployees, mockDiscounts, mockInvoices } from "@/data/mobileMockData";
import { Search, Plus, Minus, X, ChevronsUpDown, Check, Package, FileText, Save, Upload, Tag, Camera, RefreshCw, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { showSuccessToast } from "@/utils/toast";

const AddInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const invoice = isEditMode ? mockInvoices.find(inv => inv.id === id) : null;
  const [step, setStep] = useState(1);
  const [customerList, setCustomerList] = useState(() => [...mockCustomers]);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [jobAddress, setJobAddress] = useState("");
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);
  const [newCustomerFirstName, setNewCustomerFirstName] = useState("");
  const [newCustomerLastName, setNewCustomerLastName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState("");

  // Get user role and current employee ID
  const userType = typeof window !== "undefined" ? localStorage.getItem("userType") || "merchant" : "merchant";
  const isEmployee = userType === "employee";
  const currentEmployeeId = typeof window !== "undefined" ? localStorage.getItem("currentEmployeeId") || "1" : "1";

  // Due date state
  const [dueDate, setDueDate] = useState("");
  // Payment status state (for edit mode)
  const [paymentStatus, setPaymentStatus] = useState<"Open" | "Paid" | "Overdue">("Open");

  // Handle prefill data from location.state (when creating new from paid item or converting estimate)
  useEffect(() => {
    if (!isEditMode) {
      const prefill = (location.state as any)?.prefill;
      if (prefill) {
        // Prefill customer
        if (prefill.customerId) {
          setSelectedCustomer(prefill.customerId);
        }
        
        // Prefill job address
        if (prefill.jobAddress) {
          setJobAddress(prefill.jobAddress);
        }
        
        // Prefill employee (only if not employee mode, as employees are auto-filled)
        if (!isEmployee && prefill.employeeId) {
          setSelectedEmployee(prefill.employeeId);
        }
        
        // Prefill items (from estimate conversion)
        if (prefill.items && Array.isArray(prefill.items) && prefill.items.length > 0) {
          setItems(prefill.items);
        }
        
        // Prefill notes
        if (prefill.notes) {
          setNotes(prefill.notes);
        }
        
        // Prefill terms and conditions
        if (prefill.termsAndConditions) {
          setTermsAndConditions(prefill.termsAndConditions);
        }
        
        // Prefill cancellation policy
        if (prefill.cancellationPolicy) {
          setCancellationPolicy(prefill.cancellationPolicy);
        }
        
        // Prefill tax
        if (prefill.tax !== undefined) {
          setTax(prefill.tax);
        }
        
        // Prefill discount
        if (prefill.discount) {
          setSelectedDiscount(prefill.discount);
        }
      }
    }
  }, [location.state, isEditMode, isEmployee]);

  // Load invoice data in edit mode
  useEffect(() => {
    if (isEditMode && invoice) {
      // Pre-fill customer
      if (invoice.customerId) {
        setSelectedCustomer(invoice.customerId);
      }

      // Pre-fill job address (use stored jobAddress or fall back to customer address)
      const customer = mockCustomers.find(c => c.id === invoice.customerId);
      if ((invoice as any).jobAddress) {
        setJobAddress((invoice as any).jobAddress);
      } else if (customer?.address) {
        setJobAddress(customer.address);
      }

      // Pre-fill employee (if available in invoice, otherwise use current employee)
      const employeeId = (invoice as any).employeeId || currentEmployeeId;
      setSelectedEmployee(employeeId);

      // Pre-fill invoice type
      if (invoice.type === "recurring") {
        setInvoiceType("recurring");
        setIsRecurringEnabled(true);
      }

      // Pre-fill due date
      if (invoice.dueDate) {
        setDueDate(invoice.dueDate);
      }

      // Pre-fill payment status
      if (invoice.status) {
        setPaymentStatus(invoice.status as "Open" | "Paid" | "Overdue");
      }

      // Pre-fill tax (calculate from amount if needed, or use default)
      // Note: Mock invoices don't have tax field, so we'll use 0 as default
      setTax((invoice as any).taxRate || 0);

      // Pre-fill discount (if available)
      if ((invoice as any).discount) {
        const invDiscount = (invoice as any).discount;
        if (typeof invDiscount === "object") {
          setSelectedDiscount(invDiscount);
        }
      }

      // Pre-fill items (if available)
      if ((invoice as any).items && Array.isArray((invoice as any).items)) {
        setItems((invoice as any).items);
      }

      // Pre-fill notes/terms (if available)
      if ((invoice as any).memo) {
        setNotes((invoice as any).memo);
      }
      if ((invoice as any).termsConditions) {
        setTermsAndConditions((invoice as any).termsConditions);
      }
      if ((invoice as any).cancellationPolicy) {
        setCancellationPolicy((invoice as any).cancellationPolicy);
      }

      // Pre-fill recurring settings (if recurring)
      if (invoice.type === "recurring") {
        if ((invoice as any).recurringInterval) {
          setRecurringInterval((invoice as any).recurringInterval);
        }
        if ((invoice as any).recurringEndDate) {
          setRecurringEndDate((invoice as any).recurringEndDate);
          setRecurringEndOption("date");
        }
        if ((invoice as any).recurringOccurrences) {
          setRecurringOccurrences(String((invoice as any).recurringOccurrences));
          setRecurringEndOption("occurrences");
        }
      }
    }
  }, [isEditMode, invoice, currentEmployeeId]);

  // Auto-fill employee field for employees on component mount
  useEffect(() => {
    if (isEmployee && currentEmployeeId && !isEditMode) {
      // Always set to current employee for employees, preventing changes
      if (selectedEmployee !== currentEmployeeId) {
        setSelectedEmployee(currentEmployeeId);
      }
    }
  }, [isEmployee, currentEmployeeId, selectedEmployee, isEditMode]);

  // Clear job address when customer changes in NEW mode (don't auto-fill)
  useEffect(() => {
    if (selectedCustomer && !isEditMode) {
      // In NEW mode, keep job address empty when customer changes
      setJobAddress("");
    }
  }, [selectedCustomer, isEditMode]);
  const [items, setItems] = useState<Array<{ id: string; name: string; quantity: number; price: number; isCustom?: boolean }>>([]);
  const [itemSearch, setItemSearch] = useState("");
  const [invoiceType, setInvoiceType] = useState<"single" | "recurring">("single");
  const [isRecurringEnabled, setIsRecurringEnabled] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState("Daily");
  const [recurringEndOption, setRecurringEndOption] = useState<"date" | "occurrences">("date");
  const [recurringEndDate, setRecurringEndDate] = useState("");
  const [recurringOccurrences, setRecurringOccurrences] = useState("");
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"%" | "$">("%");
  const [selectedDiscount, setSelectedDiscount] = useState<typeof mockDiscounts[0] | null>(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [customDiscountValue, setCustomDiscountValue] = useState("");
  const [customDiscountType, setCustomDiscountType] = useState<"%" | "$">("%");
  const [terms, setTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [showAddExisting, setShowAddExisting] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");
  const [customItemImage, setCustomItemImage] = useState<string | null>(null);
  const [showVariablePriceDialog, setShowVariablePriceDialog] = useState(false);
  const [pendingVariableItem, setPendingVariableItem] = useState<typeof mockInventory[0] | null>(null);
  const [variableItemPrice, setVariableItemPrice] = useState("");
  const processedReturnStateRef = useRef<string | null>(null);

  // Handle return from Add Inventory page
  useEffect(() => {
    const state = location.state as { newInventoryItem?: any; returnTo?: string } | null;
    if (state?.newInventoryItem && state?.returnTo === "invoice") {
      const newItem = state.newInventoryItem;
      const stateKey = `${newItem.id}-${newItem.name}`;
      
      // Prevent processing the same state multiple times
      if (processedReturnStateRef.current === stateKey) {
        return;
      }
      
      // Check if item already exists and add it if not
      setItems(prev => {
        // Check if item already exists in items list
        if (prev.find(i => i.id === newItem.id)) {
          return prev;
        }
        
        processedReturnStateRef.current = stateKey;
        
        // Add the new item to the items list
        const price = parseFloat(newItem.price) || 0;
        const updatedItems = [...prev, {
          id: newItem.id,
          name: newItem.name,
          quantity: 1,
          price: price
        }];
        
        // Ensure we're on step 2
        setStep(2);
        
        // Clear the state to prevent re-adding on re-render
        window.history.replaceState({}, document.title);
        
        toast.success("Item added to inventory and selected");
        
        return updatedItems;
      });
    }
  }, [location.state]);

  const sortedCustomers = [...customerList].sort((a, b) => {
    const dateA = new Date(a.joinedDate).getTime();
    const dateB = new Date(b.joinedDate).getTime();
    return dateB - dateA;
  });

  const filteredCustomers = sortedCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredEmployees = mockEmployees.filter(employee =>
    employee.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    employee.email.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    employee.role.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const resetQuickAddForm = () => {
    setNewCustomerFirstName("");
    setNewCustomerLastName("");
    setNewCustomerEmail("");
    setNewCustomerPhone("");
  };

  const handleQuickAddCustomer = () => {
    if (
      !newCustomerFirstName.trim() ||
      !newCustomerLastName.trim() ||
      !newCustomerEmail.trim() ||
      !newCustomerPhone.trim()
    ) {
      toast.error("Please fill in all customer details.");
      return;
    }

    const id = `CUST-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const newCustomer = {
      id,
      name: `${newCustomerFirstName.trim()} ${newCustomerLastName.trim()}`,
      email: newCustomerEmail.trim(),
      phone: newCustomerPhone.trim(),
      address: "",
      status: "Active",
      lastVisit: nowIso,
      totalSpent: 0,
      joinedDate: nowIso,
      notes: "Added via quick add",
    };

    setCustomerList(prev => [newCustomer, ...prev]);
    setSelectedCustomer(id);
    setShowQuickAddCustomer(false);
    setCustomerOpen(false);
    setCustomerSearch("");
    resetQuickAddForm();
    toast.success("Customer added successfully.");
  };

  const filteredInventory = mockInventory.filter(item =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    item.sku.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const addItem = (item: typeof mockInventory[0]) => {
    if (!items.find(i => i.id === item.id)) {
      if ((item as any).type === "V") {
        setPendingVariableItem(item);
        setVariableItemPrice(item.unitPrice.toString());
        setShowVariablePriceDialog(true);
      } else {
      setItems([...items, { id: item.id, name: item.name, quantity: 1, price: item.unitPrice }]);
        setShowAddExisting(false);
        setItemSearch("");
      }
    }
  };

  const confirmVariablePrice = () => {
    if (pendingVariableItem && variableItemPrice) {
      const price = parseFloat(variableItemPrice) || 0;
      setItems([...items, { id: pendingVariableItem.id, name: pendingVariableItem.name, quantity: 1, price }]);
      setShowVariablePriceDialog(false);
      setPendingVariableItem(null);
      setVariableItemPrice("");
      setShowAddExisting(false);
      setItemSearch("");
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomItemImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCustomItemImage(null);
  };

  const handleDocumentUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedDocs(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeDocument = (index: number) => {
    setUploadedDocs(prev => prev.filter((_, i) => i !== index));
  };

  const addCustomItem = () => {
    if (customItemName && customItemPrice) {
      const newId = `custom-${Date.now()}`;
      setItems([
        ...items,
        {
          id: newId,
          name: customItemName,
          quantity: 1,
          price: parseFloat(customItemPrice),
          isCustom: true,
        },
      ]);
      setCustomItemName("");
      setCustomItemPrice("");
      setCustomItemImage(null);
      setShowAddCustom(false);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(prevItems =>
      prevItems.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = subtotal * (tax / 100);
  const discountAmount = selectedDiscount
    ? selectedDiscount.type === "%"
      ? subtotal * (selectedDiscount.value / 100)
      : selectedDiscount.value
    : discountType === "%"
      ? subtotal * (discount / 100)
      : discount;
  const total = Math.max(0, subtotal + taxAmount - discountAmount);

  const steps = [
    { number: 1, title: "Customer & Team" },
    { number: 2, title: "Services" },
    { number: 3, title: "Pricing" },
    { number: 4, title: "Terms & Cancellation" },
  ];

  const handleSyncItem = () => {
    toast.success("Syncing items...");
  };

  const handleGoToInvoiceList = () => {
    navigate("/invoices");
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSyncItem}
        className="h-9 px-2 touch-target hover:bg-gray-100"
      >
        <RefreshCw className="h-4 w-4 mr-1.5" />
        <span className="text-xs font-medium">Sync Item</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleGoToInvoiceList}
        className="h-9 px-2 touch-target hover:bg-gray-100"
      >
        <List className="h-4 w-4 mr-1.5" />
        <span className="text-xs font-medium">Invoice List</span>
      </Button>
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title={isEditMode ? "Edit Invoice" : "New Invoice"} showBack={true} actions={headerActions} />

      <Dialog
        open={showQuickAddCustomer}
        onOpenChange={open => {
          setShowQuickAddCustomer(open);
          if (!open) {
            resetQuickAddForm();
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Quick Add Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label htmlFor="invoice-quick-first-name">First Name</Label>
              <Input
                id="invoice-quick-first-name"
                value={newCustomerFirstName}
                onChange={e => setNewCustomerFirstName(e.target.value)}
                placeholder="Enter first name"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="invoice-quick-last-name">Last Name</Label>
              <Input
                id="invoice-quick-last-name"
                value={newCustomerLastName}
                onChange={e => setNewCustomerLastName(e.target.value)}
                placeholder="Enter last name"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="invoice-quick-email">Email</Label>
              <Input
                id="invoice-quick-email"
                type="email"
                value={newCustomerEmail}
                onChange={e => setNewCustomerEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="invoice-quick-phone">Phone Number</Label>
              <Input
                id="invoice-quick-phone"
                type="tel"
                value={newCustomerPhone}
                onChange={e => setNewCustomerPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="mt-2"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleQuickAddCustomer}
              disabled={
                !newCustomerFirstName.trim() ||
                !newCustomerLastName.trim() ||
                !newCustomerEmail.trim() ||
                !newCustomerPhone.trim()
              }
            >
              Add Customer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="px-4 pt-16 pb-4">
        <div className="flex items-center justify-center mb-2">
          <div className="flex items-center max-w-full">
            {steps.map((s, idx) => (
              <div key={s.number} className="flex items-center">
                <div
                  className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0",
                  step >= s.number ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {step > s.number ? "✓" : s.number}
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn("w-8 sm:w-12 h-1 mx-2", step > s.number ? "bg-primary" : "bg-muted")} />
                )}
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Step {step} of {steps.length}: {steps[step - 1].title}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollable px-3 pb-4 space-y-3">
        {step === 1 && (
          <div className="space-y-4">
            {isEditMode && invoice && (
              <div>
                <Label>Invoice ID</Label>
                <Input
                  value={invoice.id}
                  disabled
                  className="mt-2 h-11 bg-gray-50 text-gray-600 cursor-not-allowed"
                  readOnly
                />
              </div>
            )}
            <div>
              <div className="flex items-center justify-between">
                <Label>Customer</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-sm font-semibold text-orange-500 hover:text-orange-600"
                  onClick={() => setShowQuickAddCustomer(true)}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add
                </Button>
              </div>
              <Popover
                open={customerOpen}
                onOpenChange={open => {
                  setCustomerOpen(open);
                  if (!open) {
                    setCustomerSearch("");
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={customerOpen}
                    className="w-full justify-between mt-2 h-11"
                  >
                    {selectedCustomer
                      ? customerList.find(customer => customer.id === selectedCustomer)?.name
                      : "Select customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command shouldFilter={false} value="">
                    <CommandInput
                placeholder="Search customers..."
                value={customerSearch}
                      onValueChange={setCustomerSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        {filteredCustomers.map((customer, index) => {
                          const isSelected = selectedCustomer === customer.id;
                          return (
                            <CommandItem
                              key={customer.id}
                              value={`${customer.name} ${customer.email}`}
                              onSelect={() => {
                                setSelectedCustomer(customer.id);
                                setCustomerOpen(false);
                              }}
                              className={cn(
                                "flex items-center justify-between",
                                isSelected
                                  ? "!bg-primary !text-white [&>div>div>span]:!text-white [&>div>div>span.text-xs]:!text-white data-[selected='true']:!bg-primary data-[selected=true]:!text-white"
                                  : "data-[selected='true']:bg-accent/50 data-[selected=true]:text-foreground"
                              )}
                              data-selected={isSelected ? "true" : undefined}
                            >
                              <div className="flex items-center flex-1 min-w-0">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 shrink-0",
                                    isSelected ? "opacity-100 text-white" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col flex-1 min-w-0">
                                  <span className="font-medium truncate">{customer.name}</span>
                                  <span
                                    className={cn(
                                      "text-xs truncate",
                                      isSelected ? "text-white" : "text-muted-foreground"
                                    )}
                                  >
                                    {customer.email}
                                  </span>
                                </div>
                              </div>
                              {index < 5 && (
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-xs px-1.5 py-0 h-5 ml-2 shrink-0",
                                    isSelected && "bg-white/20 text-white border-white/30"
                                  )}
                                >
                                  Recently Added
                                </Badge>
                              )}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {selectedCustomer && (
              <div>
                <Label>Job Address</Label>
                <Input
                  type="text"
                  value={jobAddress}
                  onChange={(e) => setJobAddress(e.target.value)}
                  placeholder="Enter job address"
                  className="mt-2 h-11"
                />
              </div>
            )}

            <div>
              <Label>Assign Employee</Label>
              {isEmployee ? (
                // Disabled input for employees
                <div className="mt-2">
                  <Input
                    value={selectedEmployee ? mockEmployees.find(employee => employee.id === selectedEmployee)?.name || "" : ""}
                    disabled
                    className="w-full h-11 bg-gray-50 text-gray-600 cursor-not-allowed"
                    readOnly
                  />
                </div>
              ) : (
                // Editable popover for merchants
                <Popover
                  open={employeeOpen}
                  onOpenChange={open => {
                    if (!isEmployee) {
                      setEmployeeOpen(open);
                      if (!open) {
                        setEmployeeSearch("");
                      }
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={employeeOpen}
                      className="w-full justify-between mt-2 h-11"
                    >
                      {selectedEmployee
                        ? mockEmployees.find(employee => employee.id === selectedEmployee)?.name
                        : "Select employee..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command shouldFilter={false} value="">
                      <CommandInput
                        placeholder="Search employees..."
                        value={employeeSearch}
                        onValueChange={setEmployeeSearch}
                      />
                      <CommandList>
                        <CommandEmpty>No employee found.</CommandEmpty>
                        <CommandGroup>
                          {filteredEmployees.map(employee => {
                            const isSelected = selectedEmployee === employee.id;
                            return (
                              <CommandItem
                                key={employee.id}
                                value={`${employee.name} ${employee.email} ${employee.role}`}
                                onSelect={() => {
                                  setSelectedEmployee(employee.id);
                                  setEmployeeOpen(false);
                                }}
                                className={cn(
                                  isSelected
                                    ? "!bg-primary !text-white [&>div>span]:!text-white [&>div>span.text-xs]:!text-white data-[selected='true']:!bg-primary data-[selected=true]:!text-white"
                                    : "data-[selected='true']:bg-accent/50 data-[selected=true]:text-foreground"
                                )}
                                data-selected={isSelected ? "true" : undefined}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    isSelected ? "opacity-100 text-white" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{employee.name}</span>
                                  <span
                                    className={cn(
                                      "text-xs",
                                      isSelected ? "text-white" : "text-muted-foreground"
                                    )}
                                  >
                                    {employee.role}
                                  </span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            
            <div>
              <Label>Invoice Type</Label>
              <RadioGroup
                value={invoiceType}
                onValueChange={value => {
                  const nextType = value as "single" | "recurring";
                  setInvoiceType(nextType);
                  if (nextType === "single") {
                    setIsRecurringEnabled(false);
                    setRecurringEndOption("date");
                    setRecurringEndDate("");
                    setRecurringOccurrences("");
                  }
                }}
                className="mt-2 flex gap-3"
              >
                {[
                  { value: "single", label: "Single" },
                  { value: "recurring", label: "Recurring" },
                ].map(option => (
                  <div
                    key={option.value}
                  className={cn(
                      "flex-1 p-4 rounded-xl border cursor-pointer transition-colors",
                      invoiceType === option.value ? "bg-primary/10 border-primary" : "bg-card hover:bg-accent/5"
                    )}
                    onClick={() => setInvoiceType(option.value as "single" | "recurring")}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={option.value} id={`invoice-type-${option.value}`} />
                      <Label htmlFor={`invoice-type-${option.value}`} className="cursor-pointer">
                        <span className="font-semibold">{option.label}</span>
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
                      </div>

            {invoiceType === "recurring" && (
              <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50/80 via-white to-purple-50 p-4 sm:p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="recurring-enabled"
                    checked={isRecurringEnabled}
                    onCheckedChange={checked => {
                      const enabled = Boolean(checked);
                      setIsRecurringEnabled(enabled);
                      if (!enabled) {
                        setRecurringEndOption("date");
                        setRecurringEndDate("");
                        setRecurringOccurrences("");
                      }
                    }}
                    className="border-orange-400 text-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white"
                  />
                  <div className="flex-1">
                    <p className="text-sm sm:text-base font-semibold text-gray-900">
                      Recurring invoicing automatically sends the invoice
                      <br />
                      on the following intervals.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-9">
                  <Select value={recurringInterval} onValueChange={setRecurringInterval} disabled={!isRecurringEnabled}>
                    <SelectTrigger className="w-[150px] h-11 font-semibold text-sm sm:text-base disabled:opacity-60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"].map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm sm:text-base font-semibold text-gray-900">intervals.</span>
                </div>

                {isRecurringEnabled && (
                  <RadioGroup
                    value={recurringEndOption}
                    onValueChange={value => setRecurringEndOption(value as "date" | "occurrences")}
                    className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6 pl-9"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="date" id="recurring-end-date" />
                        <Label htmlFor="recurring-end-date" className="font-semibold text-sm sm:text-base">
                          End Date Of Your Recurring
                        </Label>
                      </div>
                      <Input
                        type="date"
                        value={recurringEndDate}
                        onChange={e => setRecurringEndDate(e.target.value)}
                        className="h-11"
                        disabled={recurringEndOption !== "date"}
                      />
                    </div>

                    <div className="hidden sm:flex flex-col items-center">
                      <div className="w-20 border-t border-gray-200 mt-6" />
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide py-1">
                        OR
                      </span>
                      <div className="w-20 border-t border-gray-200" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="occurrences" id="recurring-occurrences" />
                        <Label htmlFor="recurring-occurrences" className="font-semibold text-sm sm:text-base">
                          Number of occurrences
                        </Label>
                      </div>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Enter number"
                        value={recurringOccurrences}
                        onChange={e => setRecurringOccurrences(e.target.value.replace(/[^\d]/g, ""))}
                        className="h-11"
                        disabled={recurringEndOption !== "occurrences"}
                      />
                    </div>
                  </RadioGroup>
                )}
            </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-3 gap-1.5">
              <Dialog
                open={showAddExisting}
                onOpenChange={open => {
                  setShowAddExisting(open);
                  if (!open) {
                    setItemSearch("");
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 flex-col h-auto py-2 px-1 min-h-[60px]">
                    <Package className="h-3.5 w-3.5 mb-1 flex-shrink-0" />
                    <span className="text-[10px] leading-tight text-center whitespace-normal break-words w-full px-0.5">
                      Add Existing Item
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Existing Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Inventory Type:</p>
                      <div className="flex flex-wrap gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">F</span>
                          <span className="text-muted-foreground">= Fixed</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">V</span>
                          <span className="text-muted-foreground">= Variable</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">U</span>
                          <span className="text-muted-foreground">= Per Unit</span>
                        </div>
                      </div>
                    </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={itemSearch}
                        onChange={e => setItemSearch(e.target.value)}
                className="pl-10"
              />
            </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {filteredInventory.length > 0 ? (
                        filteredInventory.map(item => {
                          const isAlreadyAdded = !!items.find(i => i.id === item.id);
                          return (
                  <div
                    key={item.id}
                              onClick={() => {
                                if (!isAlreadyAdded) {
                                  addItem(item);
                                }
                              }}
                              className={cn(
                                "p-4 rounded-xl border bg-card cursor-pointer transition-colors",
                                isAlreadyAdded ? "opacity-50 cursor-not-allowed" : "hover:bg-accent/5 active:bg-accent/10"
                              )}
                            >
                              <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{item.name}</p>
                                {(item as any).type && (
                                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                                    {(item as any).type}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{item.sku}</p>
                      <p className="text-sm font-medium">${item.unitPrice.toFixed(2)}</p>
                              </div>
                              {isAlreadyAdded && (
                                <p className="text-xs text-muted-foreground mt-1">Already added</p>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          {itemSearch ? "No items found" : "No inventory items available"}
                        </p>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog
                open={showAddCustom}
                onOpenChange={open => {
                  setShowAddCustom(open);
                  if (!open) {
                    setCustomItemName("");
                    setCustomItemPrice("");
                    setCustomItemImage(null);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 flex-col h-auto py-2 px-1 min-h-[60px]">
                    <FileText className="h-3.5 w-3.5 mb-1 flex-shrink-0" />
                    <span className="text-[10px] leading-tight text-center whitespace-normal break-words w-full px-0.5">
                      Add Custom Item
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Custom Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Item Image (Optional)</Label>
                      {customItemImage ? (
                        <div className="mt-2 relative">
                          <img src={customItemImage} alt="Item preview" className="w-full h-48 object-cover rounded-lg border" />
                    <Button
                            type="button"
                            variant="destructive"
                      size="sm"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click to upload image</p>
                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      )}
                    </div>

                    <div>
                      <Label>Item Name</Label>
                      <Input
                        placeholder="Enter item name"
                        value={customItemName}
                        onChange={e => setCustomItemName(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Price</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={customItemPrice}
                        onChange={e => setCustomItemPrice(e.target.value)}
                        className="mt-2"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <Button className="w-full" onClick={addCustomItem} disabled={!customItemName || !customItemPrice}>
                      Add Item
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                className="flex-1 flex-col h-auto py-2 px-1 min-h-[60px]"
                onClick={() => {
                  // Navigate to Add Inventory page with return state
                  const returnPath = isEditMode ? `/invoices/${id}/edit` : "/invoices/new";
                  navigate("/inventory/new", {
                    state: {
                      returnTo: "invoice",
                      returnPath: returnPath,
                      returnStep: 2,
                      currentItems: items,
                      preserveState: true
                    }
                  });
                }}
              >
                <Save className="h-3.5 w-3.5 mb-1 flex-shrink-0" />
                <span className="text-[10px] leading-tight text-center whitespace-normal break-words w-full px-0.5">
                  Add to Inventory
                </span>
              </Button>

              <Dialog open={showVariablePriceDialog} onOpenChange={setShowVariablePriceDialog}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Set Price for Variable Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {pendingVariableItem && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-semibold text-sm">{pendingVariableItem.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Default Price: ${pendingVariableItem.unitPrice.toFixed(2)}
                        </p>
              </div>
            )}
                    <div>
                      <Label>Enter Price</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={variableItemPrice}
                        onChange={e => setVariableItemPrice(e.target.value)}
                        className="mt-2"
                        min="0"
                        step="0.01"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setShowVariablePriceDialog(false);
                          setPendingVariableItem(null);
                          setVariableItemPrice("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={confirmVariablePrice}
                        disabled={!variableItemPrice || parseFloat(variableItemPrice) <= 0}
                      >
                        Add Item
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-900">Selected Items</h3>
              {items.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                  <p className="text-sm text-muted-foreground">No items added yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map(item => {
                    const inventoryItem = mockInventory.find(inv => inv.id === item.id);
                    const itemType = inventoryItem ? (inventoryItem as any).type : item.isCustom ? "Custom" : undefined;
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-lg border border-gray-200 shadow-sm p-2 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <h4 className="text-sm font-semibold text-cyan-600 truncate">{item.name}</h4>
                              {itemType && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 flex-shrink-0">
                                  {itemType}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">Rate: ${item.price.toFixed(2)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                            className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors flex-shrink-0"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 whitespace-nowrap">Quantity:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                      <Button
                        size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 rounded-l-lg hover:bg-green-50 active:bg-green-100 transition-colors"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                                <Minus className="h-3.5 w-3.5 text-green-600" />
                      </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={e => {
                                  const qty = Math.max(1, parseInt(e.target.value) || 1);
                                  setItems(prev => prev.map(i => (i.id === item.id ? { ...i, quantity: qty } : i)));
                                }}
                                className="w-8 h-7 text-center border-0 border-x border-gray-300 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-medium"
                                min="1"
                              />
                      <Button
                        size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 rounded-r-lg hover:bg-green-50 active:bg-green-100 transition-colors"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                                <Plus className="h-3.5 w-3.5 text-green-600" />
                      </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">Total:</span>
                            <span className="text-base font-bold text-gray-900 whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                    );
                  })}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium">Subtotal:</span>
                  <span className="text-sm font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t">
                  <span className="font-bold text-base">Total:</span>
                  <span className="font-bold text-base">${total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>Terms</Label>
              <Select value={terms} onValueChange={setTerms}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due-on-receipt">Due on Receipt</SelectItem>
                  <SelectItem value="net-15">Net 15</SelectItem>
                  <SelectItem value="net-30">Net 30</SelectItem>
                  <SelectItem value="net-45">Net 45</SelectItem>
                  <SelectItem value="net-60">Net 60</SelectItem>
                  <SelectItem value="net-90">Net 90</SelectItem>
                  <SelectItem value="net-120">Net 120</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            <div className="p-4 rounded-xl bg-red-50/50 border border-red-100/50 shadow-sm">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Order Summary</h3>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-700">Subtotal:</span>
                <span className="text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Tax:</span>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={tax}
                    onChange={e => {
                      const value = parseFloat(e.target.value);
                      setTax(Number.isNaN(value) ? 0 : value);
                    }}
                    className="w-20 h-8 text-right text-sm p-1 border-gray-300 rounded"
                    min="0"
                    step="0.01"
                  />
                  <span className="text-sm text-gray-700">%</span>
                  <span className="text-sm font-medium text-gray-900 ml-2">${taxAmount.toFixed(2)}</span>
                </div>
              </div>
              {(selectedDiscount || discount > 0) && (
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-700">Discount:</span>
                  <span className="text-sm font-medium text-green-600">-${Math.min(discountAmount, subtotal).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 mt-2 border-t border-gray-200 items-baseline">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-orange-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <div className="relative mt-2">
              <textarea
                  className="w-full min-h-[120px] p-3 pr-12 rounded-lg border bg-background"
                placeholder="Add any notes or special instructions..."
                value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
                <label className="absolute bottom-3 right-3 cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                    multiple
                    onChange={handleDocumentUpload}
                  />
                  <Camera className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </label>
              </div>
              {uploadedDocs.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {uploadedDocs.map((doc, index) => (
                    <div key={index} className="relative group">
                      <div className="w-16 h-16 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                        {doc.startsWith("data:image") ? (
                          <img src={doc} alt={`Document ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeDocument(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <Dialog open={showDiscountModal} onOpenChange={setShowDiscountModal}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Discount</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Select an existing discount or create a custom one</p>
            </DialogHeader>
            <div className="space-y-6 mt-4">
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
                      onChange={e => setCustomDiscountValue(e.target.value)}
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

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label>Terms & Conditions</Label>
              <textarea
                className="w-full min-h-[120px] p-3 rounded-lg border bg-background mt-2"
                placeholder="Enter terms and conditions..."
                value={termsAndConditions}
                onChange={e => setTermsAndConditions(e.target.value)}
              />
            </div>

            <div>
              <Label>Cancellation & Return Policy</Label>
              <textarea
                className="w-full min-h-[120px] p-3 rounded-lg border bg-background mt-2"
                placeholder="Enter cancellation and return policy..."
                value={cancellationPolicy}
                onChange={e => setCancellationPolicy(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-3 py-2.5 border-t bg-background space-y-2">
        <div className="flex gap-2">
          {step > 1 && (
            <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              className="flex-1 h-9 text-sm"
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && (!selectedCustomer || !selectedEmployee)) || (step === 2 && items.length === 0)}
            >
              Next
            </Button>
          ) : (
            <Button
              className="flex-1 h-9 text-sm"
              onClick={() => {
                if (isEditMode) {
                  showSuccessToast("Invoice updated successfully");
                } else {
                  showSuccessToast("Invoice created successfully");
                  
                  // If this invoice was created from an estimate, mark the estimate as converted
                  const prefill = (location.state as any)?.prefill;
                  if (prefill?.estimateId) {
                    // Store the converted estimate ID in localStorage so Estimates page can update it
                    const convertedEstimates = JSON.parse(localStorage.getItem("convertedEstimates") || "[]");
                    if (!convertedEstimates.includes(prefill.estimateId)) {
                      convertedEstimates.push(prefill.estimateId);
                      localStorage.setItem("convertedEstimates", JSON.stringify(convertedEstimates));
                    }
                    
                    // Store the mapping of estimate ID to invoice ID
                    // Find the most recent invoice ID or generate a new one
                    // In a real app, this would come from the backend response
                    const existingInvoices = mockInvoices.map(inv => inv.id);
                    const maxInvoiceNum = existingInvoices.reduce((max, id) => {
                      const num = parseInt(id.replace("INV-", "")) || 0;
                      return num > max ? num : max;
                    }, 0);
                    const newInvoiceId = `INV-${String(maxInvoiceNum + 1).padStart(3, "0")}`;
                    const estimateToInvoiceMap = JSON.parse(localStorage.getItem("estimateToInvoiceMap") || "{}");
                    estimateToInvoiceMap[prefill.estimateId] = newInvoiceId;
                    localStorage.setItem("estimateToInvoiceMap", JSON.stringify(estimateToInvoiceMap));
                  }
                }
                navigate("/invoices");
              }}
            >
              {isEditMode ? "Update Invoice" : "Create Invoice"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddInvoice;


