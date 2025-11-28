import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mockCustomers, serviceTypes, mockEmployees, mockAgreements } from "@/data/mobileMockData";
import { RefreshCw, List, ChevronsUpDown, Check, Plus, Calendar, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { showSuccessToast } from "@/utils/toast";

const BASE_SERVICE_CATALOG = [
  { id: "svc-1", name: "Service Call Fee", price: 95 },
  { id: "svc-2", name: "Labor - Hourly Rate", price: 85 },
  ...serviceTypes.map((name, index) => ({
    id: `svc-${index + 3}`,
    name,
    price: 0,
  })),
];

const AddAgreement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const agreement = isEditMode ? mockAgreements.find(ag => ag.id === id) : null;
  
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

  // Auto-fill employee field for employees on component mount (only in create mode)
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
  const [agreementType, setAgreementType] = useState("One Time");
  const [serviceRequirement, setServiceRequirement] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceCatalog, setServiceCatalog] = useState(() => [...BASE_SERVICE_CATALOG]);
  const [selectedServices, setSelectedServices] = useState<Record<string, { id: string; name: string; price: number }>>({});
  const [agreementStatus, setAgreementStatus] = useState<"Open" | "Paid">("Open");
  const [monthlyAmount, setMonthlyAmount] = useState(0);
  const [billingCycle, setBillingCycle] = useState("Monthly");

  // Handle prefill data from location.state (when creating new from paid item)
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
      }
    }
  }, [location.state, isEditMode, isEmployee]);

  // Load agreement data in edit mode
  useEffect(() => {
    if (isEditMode && agreement) {
      // Pre-fill customer
      if (agreement.customerId) {
        setSelectedCustomer(agreement.customerId);
      }

      // Pre-fill job address (use stored jobAddress or fall back to customer address)
      const customer = mockCustomers.find(c => c.id === agreement.customerId);
      if ((agreement as any).jobAddress) {
        setJobAddress((agreement as any).jobAddress);
      } else if (customer?.address) {
        setJobAddress(customer.address);
      }

      // Pre-fill employee (if available in agreement, otherwise use current employee)
      const employeeId = (agreement as any).employeeId || currentEmployeeId;
      if (!isEmployee) {
        setSelectedEmployee(employeeId);
      }

      // Pre-fill agreement type (plan name)
      if (agreement.type) {
        // Map agreement type to form values
        // Assuming "One Time" or "Service" based on type
        setAgreementType(agreement.type.includes("Service") || agreement.type.includes("Maintenance") ? "Service" : "One Time");
      }

      // Pre-fill dates
      if (agreement.startDate) {
        setStartDate(agreement.startDate);
      }
      if (agreement.endDate) {
        setEndDate(agreement.endDate);
      }

      // Pre-fill monthly amount
      if (agreement.monthlyAmount) {
        setMonthlyAmount(agreement.monthlyAmount);
      }

      // Pre-fill billing cycle (default to Monthly if not specified)
      if ((agreement as any).billingCycle) {
        setBillingCycle((agreement as any).billingCycle);
      } else {
        // Default to Monthly based on monthlyAmount field
        setBillingCycle("Monthly");
      }

      // Pre-fill status
      if (agreement.status) {
        setAgreementStatus(agreement.status as "Open" | "Paid");
      }

      // Pre-fill work description (if available)
      if ((agreement as any).description) {
        setWorkDescription((agreement as any).description);
      }

      // Pre-fill services (if available)
      if ((agreement as any).services && Array.isArray((agreement as any).services)) {
        const services: Record<string, { id: string; name: string; price: number }> = {};
        (agreement as any).services.forEach((svc: any) => {
          services[svc.id] = {
            id: svc.id,
            name: svc.name,
            price: svc.price || 0,
          };
        });
        setSelectedServices(services);
      }

      // Pre-fill service requirements (if available)
      if ((agreement as any).serviceRequirement && Array.isArray((agreement as any).serviceRequirement)) {
        setServiceRequirement((agreement as any).serviceRequirement);
      }
    }
  }, [isEditMode, agreement, currentEmployeeId, isEmployee]);

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


  const filteredServiceCatalog = serviceCatalog.filter(service =>
    service.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const toggleServiceSelection = (service: { id: string; name: string; price: number }) => {
    setSelectedServices(prev => {
      const next = { ...prev };
      if (next[service.id]) {
        delete next[service.id];
      } else {
        next[service.id] = { ...service };
      }
      return next;
    });
  };

  const handleServicePriceChange = (serviceId: string, value: string) => {
    const price = Number(value);
    const normalizedPrice = Number.isNaN(price) ? 0 : price;

    setServiceCatalog(prev =>
      prev.map(service =>
        service.id === serviceId ? { ...service, price: normalizedPrice } : service
      )
    );

    setSelectedServices(prev => {
      if (!prev[serviceId]) return prev;
      return {
        ...prev,
        [serviceId]: { ...prev[serviceId], price: normalizedPrice },
      };
    });
  };

  const handleAddService = () => {
    toast.info("Add service action coming soon");
  };

  const selectedServicesList = Object.values(selectedServices);

  const steps = [
    { number: 1, title: "Customer & Employee" },
    { number: 2, title: "Agreement Type" },
    { number: 3, title: "Select Services" },
    { number: 4, title: "Work Description" },
  ];

  const handleSyncItem = () => {
    toast.success("Syncing agreement items...");
  };

  const handleGoToAgreementList = () => {
    navigate("/agreements");
  };

  // Helper function to get agreement by ID (simulating API call)
  const getAgreementById = (agreementId: string) => {
    return mockAgreements.find(ag => ag.id === agreementId);
  };

  // Update agreement function (simulating API call)
  const updateAgreement = (agreementId: string, payload: any) => {
    // In a real app, this would be an API call
    // For now, we'll just simulate success
    const index = mockAgreements.findIndex(ag => ag.id === agreementId);
    if (index !== -1) {
      // Update the agreement in mock data
      mockAgreements[index] = {
        ...mockAgreements[index],
        ...payload,
      };
      return Promise.resolve({ success: true });
    }
    return Promise.reject(new Error("Agreement not found"));
  };

  const handleSubmit = async () => {
    if (isEditMode && id) {
      // Update existing agreement
      try {
        const payload = {
          customerId: selectedCustomer || "",
          employeeId: selectedEmployee || currentEmployeeId,
          type: agreementType,
          startDate,
          endDate,
          monthlyAmount,
          billingCycle,
          status: agreementStatus,
          description: workDescription,
          services: selectedServicesList,
          serviceRequirement,
        };

        await updateAgreement(id, payload);
        showSuccessToast("Agreement updated successfully");
        navigate("/agreements");
      } catch (error) {
        toast.error("Failed to update agreement");
        console.error("Error updating agreement:", error);
      }
    } else {
      // Create new agreement (existing logic)
      navigate("/agreements");
    }
  };

  const handleAgreementTypeChange = (value: string) => {
    setAgreementType(value);
    if (value !== "Service") {
      setServiceRequirement([]);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader
        title={isEditMode ? "Edit Agreement" : "New Agreement"}
        showBack={true}
        actions={
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
              onClick={handleGoToAgreementList}
              className="h-9 px-2 touch-target hover:bg-gray-100"
            >
              <List className="h-4 w-4 mr-1.5" />
              <span className="text-xs font-medium">List</span>
            </Button>
          </div>
        }
      />

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
              <Label htmlFor="agreement-quick-first-name">First Name</Label>
              <Input
                id="agreement-quick-first-name"
                value={newCustomerFirstName}
                onChange={e => setNewCustomerFirstName(e.target.value)}
                placeholder="Enter first name"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="agreement-quick-last-name">Last Name</Label>
              <Input
                id="agreement-quick-last-name"
                value={newCustomerLastName}
                onChange={e => setNewCustomerLastName(e.target.value)}
                placeholder="Enter last name"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="agreement-quick-email">Email</Label>
              <Input
                id="agreement-quick-email"
                type="email"
                value={newCustomerEmail}
                onChange={e => setNewCustomerEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="agreement-quick-phone">Phone Number</Label>
              <Input
                id="agreement-quick-phone"
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
      
      {/* Progress Indicator */}
      <div className="px-4 pt-16 pb-4">
        <div className="flex items-center justify-center mb-2">
          <div className="flex items-center max-w-full">
            {steps.map((s, idx) => (
              <div key={s.number} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0",
                  step >= s.number ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {step > s.number ? "✓" : s.number}
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn(
                    "w-8 sm:w-12 h-1 mx-2",
                    step > s.number ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Step {step} of {steps.length}: {steps[step - 1].title}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollable px-4 pb-6 space-y-4">
        {/* Step 1: Customer */}
        {step === 1 && (
          <div className="space-y-4">
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
                      ? sortedCustomers.find(customer => customer.id === selectedCustomer)?.name
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

          </div>
        )}

        {/* Step 2: Terms */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-5 space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold tracking-tight">Type of Agreement *</Label>
                <RadioGroup
                  value={agreementType}
                  onValueChange={handleAgreementTypeChange}
                  className="flex flex-row gap-3"
                >
                  {[
                    { value: "One Time", label: "One Time" },
                    { value: "Service", label: "Service" },
                  ].map(option => (
                    <div
                      key={option.value}
                      className={cn(
                        "flex flex-1 items-center gap-3 rounded-2xl border p-4 transition-colors",
                        agreementType === option.value
                          ? "border-orange-500 bg-orange-50/80"
                          : "border-gray-200 hover:border-orange-200"
                      )}
                      onClick={() => handleAgreementTypeChange(option.value)}
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`agreement-type-${option.value.toLowerCase()}`}
                        className="h-5 w-5 border-2 border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white"
                      />
                      <Label
                        htmlFor={`agreement-type-${option.value.toLowerCase()}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {option.label}
                      </Label>
            </div>
                  ))}
                </RadioGroup>

                {agreementType === "Service" && (
                  <div className="ml-3 pl-4 border-l-2 border-orange-100 space-y-3">
                    <div className="space-y-2">
                      {[
                        { value: "snapshot", label: "Take a snapshot" },
                        { value: "photo-id", label: "Upload or capture a picture of Photo ID" },
                      ].map(option => {
                        const checked = serviceRequirement.includes(option.value);
                        return (
                          <label key={option.value} className="flex items-center gap-3">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={isChecked => {
                                setServiceRequirement(prev => {
                                  if (isChecked) {
                                    return [...prev, option.value];
                                  }
                                  return prev.filter(val => val !== option.value);
                                });
                              }}
                              className="h-4 w-4 border-2 border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white"
                            />
                            <span className="text-sm font-medium text-gray-800">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold tracking-tight">Agreement Duration *</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Start Date</span>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="pl-9 h-11"
                      />
              </div>
            </div>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">End Date</span>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="pl-9 h-11"
              />
            </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold tracking-tight">Billing Cycle *</Label>
                <Select
                  value={billingCycle}
                  onValueChange={setBillingCycle}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select billing cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold tracking-tight">Monthly Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={monthlyAmount || ""}
                    onChange={e => setMonthlyAmount(Number(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-8 h-11"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Services */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search services..."
                    value={serviceSearch}
                    onChange={e => setServiceSearch(e.target.value)}
                    className="pl-9 h-11 rounded-2xl border-gray-200"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddService}
                  className="h-11 w-11 rounded-2xl border-gray-200"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

                <div className="rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="hidden sm:grid grid-cols-[1fr_140px] items-center bg-gray-50 px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <span>Name</span>
                    <span className="text-right">Price</span>
                  </div>

                  {filteredServiceCatalog.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                      No services found.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredServiceCatalog.map(service => {
                        const isSelected = Boolean(selectedServices[service.id]);
                        return (
                          <div
                            key={service.id}
                            className={cn(
                              "flex flex-col sm:grid sm:grid-cols-[1fr_140px] gap-3 sm:gap-0 items-start sm:items-center px-4 py-3 transition-colors",
                              isSelected ? "bg-orange-50" : "bg-white hover:bg-orange-50/60"
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => toggleServiceSelection(service)}
                              className="flex w-full sm:w-auto items-center gap-3 text-left"
                            >
                              <span
                                className={cn(
                                  "h-4 w-4 rounded-full border-2 border-orange-500 flex items-center justify-center",
                                  isSelected && "bg-orange-500"
                                )}
                              >
                                {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                              </span>
                              <span className="text-sm font-medium text-gray-900 break-words leading-snug">
                                {service.name}
                              </span>
                            </button>
                            <div className="w-full sm:w-auto flex justify-between sm:justify-end items-center gap-3">
                              <span className="sm:hidden text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price</span>
                              <Input
                                type="number"
                                inputMode="decimal"
                                value={service.price ? service.price.toString() : ""}
                                onChange={e => handleServicePriceChange(service.id, e.target.value)}
                                min="0"
                                step="0.01"
                                className="h-10 w-full sm:w-[110px] rounded-xl text-right"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              {selectedServicesList.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {selectedServicesList.length} service{selectedServicesList.length > 1 ? "s" : ""} selected
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Work Description */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold tracking-tight">Work Description *</Label>
                <span className="text-xs font-medium text-muted-foreground">{workDescription.length}/1000</span>
              </div>
              <Textarea
                placeholder="Enter detailed work description..."
                value={workDescription}
                onChange={e => setWorkDescription(e.target.value.slice(0, 1000))}
                maxLength={1000}
                className="min-h-[180px] resize-none rounded-2xl border-gray-200 focus-visible:ring-orange-500"
              />
              <p className="text-xs text-muted-foreground">
                Include scope, expectations, and any special instructions for the team.
              </p>
            </div>

          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t bg-background space-y-2">
        <div className="flex gap-2">
          {step > 1 && (
            <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              className="flex-1"
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && (!selectedCustomer || !selectedEmployee)) ||
                (step === 2 && (!startDate || !endDate || !billingCycle || !monthlyAmount || (agreementType === "Service" && serviceRequirement.length === 0))) ||
                (step === 3 && selectedServicesList.length === 0) ||
                (step === 4 && !workDescription.trim())
              }
            >
              Next
            </Button>
          ) : (
            <Button className="flex-1" onClick={handleSubmit}>
              {isEditMode ? "Update Agreement" : "Create Agreement"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddAgreement;
