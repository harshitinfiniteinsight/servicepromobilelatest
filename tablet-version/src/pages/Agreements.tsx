import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import TabletHeader from "@/components/layout/TabletHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import MinimumDepositPercentageModal from "@/components/modals/MinimumDepositPercentageModal";
import { DocumentVerificationModal } from "@/components/modals/DocumentVerificationModal";
import PaymentModal from "@/components/modals/PaymentModal";
import SendSMSModal from "@/components/modals/SendSMSModal";
import SendEmailModal from "@/components/modals/SendEmailModal";
import { mockAgreements, mockCustomers, mockEmployees, mockInventory } from "@/data/mobileMockData";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Calendar, DollarSign, Percent, Eye, Mail, MessageSquare, Edit, CreditCard, FilePlus, Briefcase, Search, RefreshCw, X, Minus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";
import { toast } from "sonner";
import { createPaymentNotification } from "@/services/notificationService";
import { convertToJob } from "@/services/jobConversionService";

const Agreements = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showDocumentVerificationModal, setShowDocumentVerificationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Add Agreement Form State (Tablet)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Customer & Employee
  const [newAgreementCustomer, setNewAgreementCustomer] = useState("");
  const [newAgreementJobAddress, setNewAgreementJobAddress] = useState("");
  const [newAgreementEmployee, setNewAgreementEmployee] = useState("");
  
  // Step 2: Job Details
  const [agreementType, setAgreementType] = useState<"one-time" | "service">("one-time");
  const [serviceRequirement, setServiceRequirement] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Step 3: Pricing / Items
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<Set<string>>(new Set());
  const [itemPrices, setItemPrices] = useState<Record<string, number>>({});
  const [itemSearch, setItemSearch] = useState("");
  
  // Step 4: Attachments
  const [workDescription, setWorkDescription] = useState("");
  
  // Step 5: Terms & Cancellation
  const [termsConditions, setTermsConditions] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);
  const [selectedAgreementAmount, setSelectedAgreementAmount] = useState<number>(0);
  const [selectedAgreement, setSelectedAgreement] = useState<typeof mockAgreements[0] | null>(null);
  const [selectedAgreementForSms, setSelectedAgreementForSms] = useState<{ id: string; customerId: string; customerPhone?: string; customerName?: string } | null>(null);
  const [selectedAgreementForEmail, setSelectedAgreementForEmail] = useState<{ id: string; customerId: string; customerEmail?: string; customerName?: string } | null>(null);

  // State for managing all agreements (sorted list)
  const [allAgreements, setAllAgreements] = useState<typeof mockAgreements>([]);

  // Get user role
  const userType = typeof window !== "undefined" ? localStorage.getItem("userType") || "merchant" : "merchant";
  const isEmployee = userType === "employee";

  // Load and sort agreements on mount
  useEffect(() => {
    // Add createdAt timestamps to mock agreements if not present
    const agreementsWithTimestamps = mockAgreements.map((agreement, index) => ({
      ...agreement,
      createdAt: agreement.createdAt || new Date(Date.now() - (mockAgreements.length - index) * 86400000).toISOString(),
    }));

    // Sort by createdAt DESC (newest first)
    const sortedAgreements = [...agreementsWithTimestamps].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    setAllAgreements(sortedAgreements);
  }, []);

  // Filter agreements based on search
  const filteredAgreements = allAgreements.filter(agreement => {
    const matchesSearch = agreement.id.toLowerCase().includes(search.toLowerCase()) ||
      agreement.customerName.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  // Step validation functions
  const isStep1Valid = () => {
    return newAgreementCustomer && newAgreementJobAddress && newAgreementEmployee;
  };

  const isStep2Valid = () => {
    if (!startDate || !endDate) return false;
    if (agreementType === "service" && !startDate && !endDate) return false;
    if (agreementType === "service" && serviceRequirement.length === 0) return false;
    if (endDate && startDate && new Date(endDate) <= new Date(startDate)) return false;
    return true;
  };

  const isStep3Valid = () => {
    if (selectedInventoryIds.size === 0) return false;
    // Check that all selected items have valid prices > 0
    for (const id of selectedInventoryIds) {
      const price = itemPrices[id];
      if (!price || price <= 0) return false;
    }
    return true;
  };

  const isStep4Valid = () => {
    return true; // Work description is optional
  };

  const isStep5Valid = () => {
    return true; // Terms are optional
  };

  // Stepper navigation
  const handleNext = () => {
    if (currentStep === 1 && !isStep1Valid()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (currentStep === 2 && !isStep2Valid()) {
      toast.error("Please provide valid agreement dates");
      return;
    }
    if (currentStep === 3 && !isStep3Valid()) {
      toast.error("Please add at least one item");
      return;
    }
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateAgreement = () => {
    // Validate all steps
    if (!isStep1Valid() || !isStep2Valid() || !isStep3Valid()) {
      toast.error("Please complete all required fields");
      return;
    }

    // Calculate total amount from selected items
    const totalAmount = Array.from(selectedInventoryIds).reduce((sum, id) => {
      return sum + (itemPrices[id] || 0);
    }, 0);

    // Create new agreement object
    const newAgreement = {
      id: `AGR-${String(allAgreements.length + 1).padStart(3, '0')}`,
      customerId: newAgreementCustomer,
      customerName: mockCustomers.find(c => c.id === newAgreementCustomer)?.name || "Unknown Customer",
      type: agreementType === "one-time" ? "One-Time Service" : "Service Agreement",
      startDate: startDate,
      endDate: endDate,
      monthlyAmount: totalAmount,
      status: "Open" as const,
      renewalStatus: "Manual" as const,
      createdAt: new Date().toISOString(),
    };

    // Add new agreement to the top of the list (optimistic update)
    setAllAgreements([newAgreement, ...allAgreements]);

    // Show success toast
    toast.success("Agreement created successfully!");
    
    // Reset form
    setCurrentStep(1);
    setNewAgreementCustomer("");
    setNewAgreementJobAddress("");
    setNewAgreementEmployee("");
    setAgreementType("one-time");
    setServiceRequirement([]);
    setStartDate("");
    setEndDate("");
    setSelectedInventoryIds(new Set());
    setItemPrices({});
    setItemSearch("");
    setWorkDescription("");
    setTermsConditions("");
    setCancellationPolicy("");
  };

  const handlePayNow = (agreementId: string) => {
    const agreement = mockAgreements.find(a => a.id === agreementId);
    if (agreement) {
      setSelectedAgreementId(agreementId);
      setSelectedAgreementAmount(agreement.monthlyAmount || 0);
      setSelectedAgreement(agreement);
      setShowDocumentVerificationModal(true);
    }
  };

  const handleVerificationComplete = (data: {
    signature: string;
    documentType: string;
    document: File | string;
  }) => {
    // Here you would typically:
    // 1. Upload the signature and document to backend
    // 2. Link verification data to the agreement
    // The upload is already handled in DocumentVerificationModal's handleSend

    // Close document verification modal
    setShowDocumentVerificationModal(false);

    // Immediately open payment modal (modal swap, no navigation)
    setTimeout(() => {
      setShowPaymentModal(true);
    }, 100); // Small delay to ensure smooth modal transition
  };

  const handlePaymentComplete = () => {
    if (selectedAgreementId) {
      // Create payment notification
      createPaymentNotification("agreement", selectedAgreementId);
    }
    setShowPaymentModal(false);
    setSelectedAgreementId(null);
    setSelectedAgreementAmount(0);
    setSelectedAgreement(null);
    toast.success("Payment processed successfully");
  };

  const handleMenuAction = (agreementId: string, action: string, event?: React.MouseEvent) => {
    // Stop event propagation to prevent card onClick from firing
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    switch (action) {
      case "preview":
        navigate(`/agreements/${agreementId}`);
        break;
      case "send-email":
        const agreementForEmail = mockAgreements.find(a => a.id === agreementId);
        if (agreementForEmail) {
          const customer = mockCustomers.find(c => c.id === agreementForEmail.customerId);
          if (!customer?.email) {
            toast.error("No email address available for this customer");
            return;
          }
          setSelectedAgreementForEmail({
            id: agreementId,
            customerId: agreementForEmail.customerId,
            customerEmail: customer.email,
            customerName: customer.name,
          });
          setShowEmailModal(true);
        }
        break;
      case "send-sms":
        const agreement = mockAgreements.find(a => a.id === agreementId);
        if (agreement) {
          const customer = mockCustomers.find(c => c.id === agreement.customerId);
          if (!customer?.phone) {
            toast.error("No phone number available for this customer");
            return;
          }
          setSelectedAgreementForSms({
            id: agreementId,
            customerId: agreement.customerId,
            customerPhone: customer.phone,
            customerName: customer.name,
          });
          setShowSmsModal(true);
        }
        break;
      case "edit":
        // Directly navigate to edit screen, skipping details screen
        navigate(`/agreements/${agreementId}/edit`);
        break;
      case "pay":
        handlePayNow(agreementId);
        break;
      case "create-new-agreement":
        const createAgreement = mockAgreements.find(ag => ag.id === agreementId);
        if (createAgreement) {
          const customer = mockCustomers.find(c => c.id === createAgreement.customerId);
          // Find employee by name if employeeName exists, otherwise use first employee
          const employee = (createAgreement as any).employeeName
            ? mockEmployees.find(emp => emp.name === (createAgreement as any).employeeName)
            : mockEmployees[0];

          navigate("/agreements/new", {
            state: {
              prefill: {
                customerId: createAgreement.customerId,
                jobAddress: (createAgreement as any).jobAddress || customer?.address || "",
                employeeId: employee?.id || mockEmployees[0]?.id || "1",
              }
            }
          });
        }
        break;
      case "convert-to-job":
        const result = convertToJob("agreement", agreementId);
        if (result.success) {
          toast.success("Job created successfully");
          navigate("/jobs");
        } else {
          toast.error(result.error || "Failed to convert to job");
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <TabletHeader
        title="Agreements"
        actions={
          <div className="flex items-center gap-1.5">
            {!isEmployee && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs font-medium tablet:h-8 tablet:px-3"
                onClick={() => setShowDepositModal(true)}
              >
                <Percent className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Min Deposit</span>
              </Button>
            )}
            <Button size="sm" className="h-8 w-8 p-0 tablet:hidden" onClick={() => navigate("/agreements/new")}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* Mobile Layout */}
      <div
        className="flex-1 overflow-y-auto scrollable px-3 pb-4 space-y-2 tablet:hidden"
        style={{ paddingTop: "calc(3rem + env(safe-area-inset-top) + 0.5rem)" }}
      >
        <div className="space-y-2">
          {mockAgreements.map(agreement => {
            // Check if agreement is paid (case-insensitive)
            const isPaid = agreement.status?.toLowerCase() === "paid";

            // Check if agreement has already been converted to job
            const isConverted = agreement.status?.toLowerCase() === "job created / converted" ||
              agreement.status?.toLowerCase() === "job created" ||
              agreement.status?.toLowerCase() === "converted";

            // Build menu items based on payment status and user role
            const kebabMenuItems: KebabMenuItem[] = isPaid
              ? [
                // Paid agreements: Preview, Convert to Job (if not converted), and Create New Agreement
                { label: "Preview", icon: Eye, action: () => handleMenuAction(agreement.id, "preview") },
                // Only show "Convert to Job" if not already converted
                ...(!isConverted ? [{ label: "Convert to Job", icon: Briefcase, action: () => handleMenuAction(agreement.id, "convert-to-job") }] : []),
                { label: "Create New Agreement", icon: FilePlus, action: () => handleMenuAction(agreement.id, "create-new-agreement"), separator: true },
              ]
              : [
                // Unpaid agreements: Preview, Send Email, Send SMS, Edit Agreement
                // "Convert to Job" should only appear for Paid agreements, not Unpaid
                { label: "Preview", icon: Eye, action: () => handleMenuAction(agreement.id, "preview") },
                { label: "Send Email", icon: Mail, action: () => handleMenuAction(agreement.id, "send-email") },
                { label: "Send SMS", icon: MessageSquare, action: () => handleMenuAction(agreement.id, "send-sms") },
                // Edit Agreement: Only for merchants, not employees
                ...(isEmployee ? [] : [{
                  label: "Edit Agreement",
                  icon: Edit,
                  action: () => {
                    // Directly navigate to edit screen, skipping details screen
                    handleMenuAction(agreement.id, "edit");
                  }
                }]),
              ];

            return (
              <div
                key={agreement.id}
                className="p-2.5 rounded-lg border bg-card active:scale-[0.98] transition-transform cursor-pointer"
                onClick={(e) => {
                  // Don't navigate if clicking on kebab menu, pay button, or its dropdown
                  const target = e.target as HTMLElement;
                  if (target.closest('[role="menu"]') || target.closest('[role="menuitem"]') || target.closest('button[aria-haspopup="menu"]') || target.closest('button[class*="Pay"]')) {
                    return;
                  }
                  navigate(`/agreements/${agreement.id}`);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="font-semibold text-base truncate">{agreement.id}</h3>
                      <Badge className={cn("text-[10px] px-2 py-0.5 h-5 flex-shrink-0", statusColors[agreement.status])}>
                        {agreement.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1.5 truncate">{agreement.customerName}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {new Date(agreement.startDate).toLocaleDateString()} - {new Date(agreement.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-baseline gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span className="text-lg font-bold whitespace-nowrap">${agreement.monthlyAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-right whitespace-nowrap">per month</p>
                    <div className="flex items-center gap-2">
                      {/* Pay button for unpaid agreements */}
                      {!isPaid && (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-auto min-h-0 px-2 py-1 text-xs font-semibold whitespace-nowrap bg-primary hover:bg-primary/90 rounded-xl shadow-sm hover:shadow-md transition-all leading-tight"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayNow(agreement.id);
                          }}
                        >
                          Pay
                        </Button>
                      )}
                      <KebabMenu items={kebabMenuItems} menuWidth="w-44" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tablet Layout: Two-column grid */}
      <div className="hidden tablet:flex tablet:flex-1 tablet:overflow-hidden">
        {/* Left Panel: Add Agreement - Tablet Only */}
        <aside className="tablet:w-[40%] bg-gray-50/80 border-r overflow-y-auto flex flex-col" style={{ contain: 'layout style paint' }}>
          <div className="sticky top-0 bg-gray-50/95 border-b px-4 py-3 z-10" style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-foreground">Add Agreement</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.info("Syncing items...");
                }}
                className="flex items-center gap-1.5 text-xs h-7"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Sync Item
              </Button>
            </div>
            
            {/* Stepper Progress */}
            <div className="relative flex items-center">
              <div className="absolute inset-0 flex items-center px-4">
                <div className="w-full h-0.5 bg-gray-200" />
              </div>
              <div className="relative w-full grid grid-cols-5">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors z-10 ${
                      step < currentStep 
                        ? 'bg-green-500 text-white' 
                        : step === currentStep 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step < currentStep ? '✓' : step}
                    </div>
                    <span className={`text-[9px] mt-1 font-medium text-center px-1 ${
                      step === currentStep ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step === 1 && 'Customer'}
                      {step === 2 && 'Job Details'}
                      {step === 3 && 'Pricing'}
                      {step === 4 && 'Attachments'}
                      {step === 5 && 'Terms'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
                <div className="w-full flex">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-0.5 flex-1 transition-colors ${
                        step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      style={{ marginLeft: step === 1 ? '0' : '0', marginRight: '0' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4" style={{ contain: 'layout style paint' }}>
            {/* Step 1: Customer & Employee */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer *</label>
                  <Select value={newAgreementCustomer} onValueChange={setNewAgreementCustomer}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCustomers
                        .filter(c => c.status === "Active")
                        .map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Job Address *</label>
                  <Input
                    placeholder="Enter job address"
                    value={newAgreementJobAddress}
                    onChange={(e) => setNewAgreementJobAddress(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Select Employee *</label>
                  <Select value={newAgreementEmployee} onValueChange={setNewAgreementEmployee}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockEmployees
                        .filter(e => e.status === "Active")
                        .map(employee => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Job Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type of Agreement *</label>
                  <RadioGroup value={agreementType} onValueChange={(value: any) => setAgreementType(value)}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="one-time" id="one-time" />
                      <Label htmlFor="one-time" className="flex-1 cursor-pointer">One Time</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="service" id="service" />
                      <Label htmlFor="service" className="flex-1 cursor-pointer">Service Agreement</Label>
                    </div>
                  </RadioGroup>

                  {agreementType === "service" && (
                    <div className="ml-3 pl-4 border-l-2 border-orange-100 space-y-3 mt-3">
                      <div className="space-y-2">
                        {[
                          { value: "snapshot", label: "Take a snapshot" },
                          { value: "photo-id", label: "Upload or capture a picture of Photo ID" },
                        ].map(option => {
                          const checked = serviceRequirement.includes(option.value);
                          return (
                            <label key={option.value} className="flex items-center gap-3 cursor-pointer">
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

                <div className="space-y-4">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Agreement Duration *</label>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium">End Date</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Pricing / Items */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {/* Step Header */}
                <div className="pb-3 border-b">
                  <h4 className="text-sm font-semibold text-foreground">Step 3 of 5: Pricing / Items</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Select variable items and set pricing</p>
                </div>

                {/* Search Field */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search for items..."
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Inventory List */}
                {(() => {
                  // Filter to only variable inventory items (type "V")
                  const variableInventory = mockInventory.filter(item => item.type === "V");
                  
                  // Apply search filter
                  const filteredInventory = variableInventory.filter(item =>
                    item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
                    item.sku.toLowerCase().includes(itemSearch.toLowerCase())
                  );

                  if (variableInventory.length === 0) {
                    return (
                      <div className="bg-gray-100 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground font-medium">No variable items available</p>
                        <p className="text-xs text-muted-foreground mt-1">Add variable items in Inventory to continue</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-semibold text-foreground uppercase tracking-wide">Variable Inventory Items</h5>
                        {selectedInventoryIds.size > 0 && (
                          <span className="text-xs text-muted-foreground">({selectedInventoryIds.size} selected)</span>
                        )}
                      </div>

                      {/* Scrollable List */}
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                        {filteredInventory.length === 0 ? (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                            <p className="text-sm text-muted-foreground">No items match your search</p>
                          </div>
                        ) : (
                          filteredInventory.map((item) => {
                            const isSelected = selectedInventoryIds.has(item.id);
                            const currentPrice = itemPrices[item.id] || item.unitPrice;
                            const hasInvalidPrice = isSelected && (!currentPrice || currentPrice <= 0);

                            return (
                              <div
                                key={item.id}
                                className={cn(
                                  "bg-background border rounded-lg p-3 transition-all",
                                  isSelected ? "border-primary/50 bg-primary/5" : "border-border"
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Checkbox */}
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      const newSelected = new Set(selectedInventoryIds);
                                      if (checked) {
                                        newSelected.add(item.id);
                                        // Initialize with default price if not set
                                        if (!itemPrices[item.id]) {
                                          setItemPrices(prev => ({
                                            ...prev,
                                            [item.id]: item.unitPrice
                                          }));
                                        }
                                      } else {
                                        newSelected.delete(item.id);
                                        // Clear price when deselected
                                        setItemPrices(prev => {
                                          const updated = { ...prev };
                                          delete updated[item.id];
                                          return updated;
                                        });
                                      }
                                      setSelectedInventoryIds(newSelected);
                                    }}
                                    className="mt-0.5"
                                  />

                                  {/* Item Info and Price */}
                                  <div className="flex-1 min-w-0 space-y-2">
                                    <div>
                                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                                      <p className="text-xs text-muted-foreground">SKU: {item.sku} • Default: ${item.unitPrice.toFixed(2)}</p>
                                    </div>

                                    {/* Price Input - Only enabled when selected */}
                                    <div className="flex items-center gap-2">
                                      <label className="text-xs text-muted-foreground font-medium whitespace-nowrap">Price:</label>
                                      <div className="relative flex-1 max-w-[150px]">
                                        <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">$</span>
                                        <Input
                                          type="number"
                                          min="0.01"
                                          step="0.01"
                                          value={isSelected ? currentPrice : ""}
                                          onChange={(e) => {
                                            const value = parseFloat(e.target.value) || 0;
                                            setItemPrices(prev => ({
                                              ...prev,
                                              [item.id]: value
                                            }));
                                          }}
                                          disabled={!isSelected}
                                          placeholder="0.00"
                                          className={cn(
                                            "pl-6 h-8 text-sm",
                                            hasInvalidPrice && "border-red-500 focus-visible:ring-red-500"
                                          )}
                                        />
                                      </div>
                                    </div>

                                    {/* Validation Error */}
                                    {hasInvalidPrice && (
                                      <p className="text-xs text-red-500 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Price must be greater than 0
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Validation Message */}
                {selectedInventoryIds.size === 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
                    <p className="text-xs text-amber-800">At least one item with valid pricing is required to proceed</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Attachments */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Work Description</label>
                  <Textarea
                    placeholder="Describe the work to be performed..."
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    className="min-h-[120px] text-sm resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Optional: Provide details about the agreement scope</p>
                </div>
              </div>
            )}

            {/* Step 5: Terms & Cancellation */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Terms & Conditions</label>
                  <Textarea
                    placeholder="Enter terms and conditions..."
                    value={termsConditions}
                    onChange={(e) => setTermsConditions(e.target.value)}
                    className="min-h-[100px] text-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cancellation & Return Policy</label>
                  <Textarea
                    placeholder="Enter cancellation and return policy..."
                    value={cancellationPolicy}
                    onChange={(e) => setCancellationPolicy(e.target.value)}
                    className="min-h-[100px] text-sm resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="sticky bottom-0 bg-gray-50/95 border-t px-4 py-3">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-9"
                >
                  Back
                </Button>
              )}
              {currentStep < 5 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !isStep1Valid()) ||
                    (currentStep === 2 && !isStep2Valid()) ||
                    (currentStep === 3 && !isStep3Valid())
                  }
                  className="flex-1 h-9"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleCreateAgreement}
                  className="flex-1 h-9"
                >
                  Create Agreement
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* Right Panel: Agreements List */}
        <div className="flex-1 overflow-y-auto scrollable bg-gray-50/50 px-6 py-4" style={{ contain: 'layout style paint' }}>
          <div className="max-w-5xl mx-auto space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agreements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* Agreements List */}
            {filteredAgreements.length > 0 ? (
              <div className="space-y-2">
                {filteredAgreements.map(agreement => {
                  // Check if agreement is paid (case-insensitive)
                  const isPaid = agreement.status?.toLowerCase() === "paid";

                  // Check if agreement has already been converted to job
                  const isConverted = agreement.status?.toLowerCase() === "job created / converted" ||
                    agreement.status?.toLowerCase() === "job created" ||
                    agreement.status?.toLowerCase() === "converted";

                  // Build menu items based on payment status and user role
                  const kebabMenuItems: KebabMenuItem[] = isPaid
                    ? [
                      // Paid agreements: Preview, Convert to Job (if not converted), and Create New Agreement
                      { label: "Preview", icon: Eye, action: () => handleMenuAction(agreement.id, "preview") },
                      // Only show "Convert to Job" if not already converted
                      ...(!isConverted ? [{ label: "Convert to Job", icon: Briefcase, action: () => handleMenuAction(agreement.id, "convert-to-job") }] : []),
                      { label: "Create New Agreement", icon: FilePlus, action: () => handleMenuAction(agreement.id, "create-new-agreement"), separator: true },
                    ]
                    : [
                      // Unpaid agreements: Preview, Send Email, Send SMS, Edit Agreement
                      { label: "Preview", icon: Eye, action: () => handleMenuAction(agreement.id, "preview") },
                      { label: "Send Email", icon: Mail, action: () => handleMenuAction(agreement.id, "send-email") },
                      { label: "Send SMS", icon: MessageSquare, action: () => handleMenuAction(agreement.id, "send-sms") },
                      // Edit Agreement: Only for merchants, not employees
                      ...(isEmployee ? [] : [{
                        label: "Edit Agreement",
                        icon: Edit,
                        action: () => {
                          handleMenuAction(agreement.id, "edit");
                        }
                      }]),
                    ];

                  return (
                    <div
                      key={agreement.id}
                      className="p-2.5 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('[role="menu"]') || target.closest('[role="menuitem"]') || target.closest('button[aria-haspopup="menu"]') || target.closest('button[class*="Pay"]')) {
                          return;
                        }
                        navigate(`/agreements/${agreement.id}`);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <h3 className="font-semibold text-base truncate">{agreement.id}</h3>
                            <Badge className={cn("text-[10px] px-2 py-0.5 h-5 flex-shrink-0", statusColors[agreement.status])}>
                              {agreement.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1.5 truncate">{agreement.customerName}</p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {new Date(agreement.startDate).toLocaleDateString()} - {new Date(agreement.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-baseline gap-1">
                            <DollarSign className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span className="text-lg font-bold whitespace-nowrap">${agreement.monthlyAmount.toFixed(2)}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground text-right whitespace-nowrap">per month</p>
                          <div className="flex items-center gap-2">
                            {!isPaid && (
                              <Button
                                size="sm"
                                variant="default"
                                className="h-auto min-h-0 px-2 py-1 text-xs font-semibold whitespace-nowrap bg-primary hover:bg-primary/90 rounded-xl shadow-sm hover:shadow-md transition-all leading-tight"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePayNow(agreement.id);
                                }}
                              >
                                Pay
                              </Button>
                            )}
                            <KebabMenu items={kebabMenuItems} menuWidth="w-44" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No agreements found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <MinimumDepositPercentageModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
      />

      {selectedAgreementId && (
        <>
          <DocumentVerificationModal
            open={showDocumentVerificationModal}
            onOpenChange={setShowDocumentVerificationModal}
            agreementId={selectedAgreementId}
            onVerificationComplete={handleVerificationComplete}
          />

          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedAgreementId(null);
              setSelectedAgreementAmount(0);
              setSelectedAgreement(null);
            }}
            amount={selectedAgreementAmount}
            onPaymentMethodSelect={handlePaymentComplete}
            entityType="agreement"
            agreement={selectedAgreement ? {
              id: selectedAgreement.id,
              totalPayable: selectedAgreement.monthlyAmount || selectedAgreementAmount,
              minimumDepositFraction: (selectedAgreement as any).minimumDepositFraction,
            } : undefined}
          />
        </>
      )}

      {/* Send SMS Modal - Always render when selectedAgreementForSms exists */}
      {selectedAgreementForSms ? (
        <SendSMSModal
          key={`sms-${selectedAgreementForSms.id}`}
          isOpen={showSmsModal}
          onClose={() => {
            setShowSmsModal(false);
            setSelectedAgreementForSms(null);
          }}
          customerPhone={selectedAgreementForSms.customerPhone || ""}
          customerCountryCode="+1"
          entityId={selectedAgreementForSms.id}
          entityType="agreement"
          customerName={selectedAgreementForSms.customerName}
        />
      ) : null}

      {/* Send Email Modal - Always render when selectedAgreementForEmail exists */}
      {selectedAgreementForEmail ? (
        <SendEmailModal
          key={`email-${selectedAgreementForEmail.id}`}
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedAgreementForEmail(null);
          }}
          customerEmail={selectedAgreementForEmail.customerEmail || ""}
          customerName={selectedAgreementForEmail.customerName}
        />
      ) : null}
    </div>
  );
};

export default Agreements;
