import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import TabletHeader from "@/components/layout/TabletHeader";
import InvoiceCard from "@/components/cards/InvoiceCard";
import EmptyState from "@/components/cards/EmptyState";
import PaymentModal from "@/components/modals/PaymentModal";
import CashPaymentModal from "@/components/modals/CashPaymentModal";
import SendEmailModal from "@/components/modals/SendEmailModal";
import SendSMSModal from "@/components/modals/SendSMSModal";
import ReassignEmployeeModal from "@/components/modals/ReassignEmployeeModal";
import PreviewInvoiceModal from "@/components/modals/PreviewInvoiceModal";
import InvoiceDueAlertModal from "@/components/modals/InvoiceDueAlertModal";
import DateRangePickerModal from "@/components/modals/DateRangePickerModal";
import DocumentNoteModal from "@/components/modals/DocumentNoteModal";
import { mockCustomers, mockInvoices, mockEmployees } from "@/data/mobileMockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import {
  Plus,
  Search,
  FileText,
  Eye,
  Mail,
  MessageSquare,
  Edit,
  History,
  UserCog,
  RotateCcw,
  XCircle,
  Bell,
  Calendar as CalendarIcon,
  FilePlus,
  CreditCard,
  DollarSign,
  Briefcase,
  StickyNote,
  Package,
  ListPlus,
  Pencil,
  Upload,
  Wand2,
  Camera,
  Paperclip,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { createPaymentNotification } from "@/services/notificationService";
import { convertToJob } from "@/services/jobConversionService";
import { getAllInvoices, updateInvoice, createInvoice as saveInvoice, type Invoice as InvoiceType } from "@/services/invoiceService";

type InvoiceTab = "single" | "recurring" | "deactivated";
type InvoiceStatusFilter = "all" | "paid" | "open";
type Invoice = (typeof mockInvoices)[number] | InvoiceType;

const Invoices = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<InvoiceTab>("single");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCashPaymentModal, setShowCashPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<{ id: string; amount: number } | null>(null);
  const [actionInvoice, setActionInvoice] = useState<(Invoice & { customerEmail?: string; customerPhone?: string }) | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<(Invoice & { customerEmail?: string; customerPhone?: string }) | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showInvoiceDueAlertModal, setShowInvoiceDueAlertModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedInvoiceForNote, setSelectedInvoiceForNote] = useState<Invoice | null>(null);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [newInvoiceId, setNewInvoiceId] = useState<string | null>(null);

  // Add Invoice Form State (Tablet)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Customer & Job Details
  const [newInvoiceCustomer, setNewInvoiceCustomer] = useState("");
  const [newInvoiceJobAddress, setNewInvoiceJobAddress] = useState("");
  const [newInvoiceEmployee, setNewInvoiceEmployee] = useState("");
  const [newInvoiceType, setNewInvoiceType] = useState<"single" | "recurring">("single");
  
  // Recurring Invoice Options
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState("");
  const [recurringEndType, setRecurringEndType] = useState<"date" | "occurrences">("date");
  const [recurringEndDate, setRecurringEndDate] = useState("");
  const [recurringOccurrences, setRecurringOccurrences] = useState("");
  
  // Step 2: Select Service
  const [selectedServices, setSelectedServices] = useState<Array<{id: string; name: string; price: number; quantity: number}>>([]);
  
  // Step 2 Modals
  const [showExistingItemModal, setShowExistingItemModal] = useState(false);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  
  // Add Custom Item Modal State
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");
  const [customItemImage, setCustomItemImage] = useState("");
  
  // Add Inventory Modal State
  const [inventoryName, setInventoryName] = useState("");
  const [inventoryType, setInventoryType] = useState<"fixed" | "perunit" | "variable">("fixed");
  const [inventoryPrice, setInventoryPrice] = useState("");
  const [inventoryItemUnit, setInventoryItemUnit] = useState("");
  const [inventorySKU, setInventorySKU] = useState("");
  const [inventoryAutoSKU, setInventoryAutoSKU] = useState(false);
  const [inventoryStockQty, setInventoryStockQty] = useState("");
  
  // Existing Item Search
  const [existingItemSearch, setExistingItemSearch] = useState("");
  
  // Step 3: Pricing
  const [subtotal, setSubtotal] = useState(0);
  const [taxRate, setTaxRate] = useState("10");
  const [discount, setDiscount] = useState("");
  const [showDiscount, setShowDiscount] = useState(false);
  const [newInvoiceDueDate, setNewInvoiceDueDate] = useState("");
  
  // Step 4: Terms & Cancellation
  const [paymentTerms, setPaymentTerms] = useState("Due on Receipt");
  const [termsConditions, setTermsConditions] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [invoiceAttachments, setInvoiceAttachments] = useState<File[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Get user role from localStorage
  const userRole = localStorage.getItem("userType") || "merchant";
  const isEmployee = userRole === "employee";

  // Load invoices from both localStorage and mockData
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const storedInvoices = await getAllInvoices();
        // Merge stored invoices with mock invoices, prioritizing stored ones
        // Convert stored invoices to match mock invoice format
        const mergedInvoices: Invoice[] = [
          ...storedInvoices.map(inv => ({
            ...inv,
            // Ensure all required fields are present
            issueDate: inv.issueDate || new Date().toISOString().split("T")[0],
            dueDate: inv.dueDate || new Date().toISOString().split("T")[0],
            status: inv.status || "Open",
            type: inv.type || "single",
          })),
          // Add mock invoices that don't exist in stored invoices
          ...mockInvoices.filter(mockInv =>
            !storedInvoices.some(storedInv => storedInv.id === mockInv.id)
          ),
        ];

        // Sort by newest first (by issueDate or createdAt)
        mergedInvoices.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.issueDate).getTime();
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.issueDate).getTime();
          return dateB - dateA;
        });

        setAllInvoices(mergedInvoices);
      } catch (error) {
        console.error("Error loading invoices:", error);
        // Fallback to mock invoices only
        setAllInvoices(mockInvoices);
      }
    };

    loadInvoices();
  }, []);

  // Handle tab query parameter and new invoice ID from navigation state
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && (tabParam === "single" || tabParam === "recurring" || tabParam === "deactivated")) {
      if (!isEmployee || tabParam !== "deactivated") {
        setActiveTab(tabParam);
      }
    }

    // Get new invoice ID from navigation state
    const state = location.state as { newInvoiceId?: string } | null;
    if (state?.newInvoiceId) {
      setNewInvoiceId(state.newInvoiceId);
      // Reload invoices to include the new one
      const loadInvoices = async () => {
        try {
          const storedInvoices = await getAllInvoices();
          const mergedInvoices: Invoice[] = [
            ...storedInvoices.map(inv => ({
              ...inv,
              issueDate: inv.issueDate || new Date().toISOString().split("T")[0],
              dueDate: inv.dueDate || new Date().toISOString().split("T")[0],
              status: inv.status || "Open",
              type: inv.type || "single",
            })),
            ...mockInvoices.filter(mockInv =>
              !storedInvoices.some(storedInv => storedInv.id === mockInv.id)
            ),
          ];
          mergedInvoices.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.issueDate).getTime();
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.issueDate).getTime();
            return dateB - dateA;
          });
          setAllInvoices(mergedInvoices);
        } catch (error) {
          console.error("Error loading invoices:", error);
          setAllInvoices(mockInvoices);
        }
      };
      loadInvoices();

      // Clear the state after processing
      window.history.replaceState({}, document.title);
    }
  }, [searchParams, location.state, isEmployee]);

  // Ensure employees don't start on deactivated tab
  useEffect(() => {
    if (isEmployee && activeTab === "deactivated") {
      setActiveTab("single");
      setSearchParams({ tab: "single" });
    }
  }, [isEmployee, activeTab, setSearchParams]);

  // Clear highlight after 5 seconds
  useEffect(() => {
    if (newInvoiceId) {
      const timer = setTimeout(() => {
        setNewInvoiceId(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [newInvoiceId]);

  const handleTabChange = (value: string) => {
    const tabValue = value as InvoiceTab;
    // Prevent employees from accessing deactivated tab
    if (isEmployee && tabValue === "deactivated") {
      setActiveTab("single");
      setSearchParams({ tab: "single" });
      return;
    }
    setActiveTab(tabValue);
    setSearchParams({ tab: tabValue });
    if (tabValue !== "deactivated") {
      return;
    }
    setStatusFilter("all");
    setDateRange({ from: undefined, to: undefined });
  };

  const isWithinDateRange = (dateString: string) => {
    // If no date range is selected, show all invoices
    if (!dateRange.from && !dateRange.to) return true;

    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);

    // Check if target date is within the selected range
    if (dateRange.from && dateRange.to) {
      const start = new Date(dateRange.from);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateRange.to);
      end.setHours(23, 59, 59, 999);
      return targetDate >= start && targetDate <= end;
    } else if (dateRange.from) {
      const start = new Date(dateRange.from);
      start.setHours(0, 0, 0, 0);
      return targetDate >= start;
    } else if (dateRange.to) {
      const end = new Date(dateRange.to);
      end.setHours(23, 59, 59, 999);
      return targetDate <= end;
    }

    return true;
  };

  const handleDateRangeConfirm = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
  };

  // Calculate totals for Step 3
  useEffect(() => {
    const sub = selectedServices.reduce((sum, service) => sum + (service.price * service.quantity), 0);
    setSubtotal(sub);
  }, [selectedServices]);

  const calculateTax = () => {
    const rate = parseFloat(taxRate) || 0;
    return (subtotal * rate) / 100;
  };

  const calculateDiscount = () => {
    return parseFloat(discount) || 0;
  };

  const calculateTotal = () => {
    return subtotal + calculateTax() - calculateDiscount();
  };

  // Step validation
  const isStep1Valid = () => {
    const baseValid = newInvoiceCustomer && newInvoiceJobAddress && newInvoiceEmployee && newInvoiceType;
    
    // Additional validation for recurring invoices
    if (newInvoiceType === "recurring" && recurringEnabled) {
      const intervalValid = recurringInterval !== "";
      const endConditionValid = 
        (recurringEndType === "date" && recurringEndDate !== "") ||
        (recurringEndType === "occurrences" && recurringOccurrences !== "");
      return baseValid && intervalValid && endConditionValid;
    }
    
    return baseValid;
  };

  const isStep2Valid = () => {
    return selectedServices.length > 0;
  };

  const isStep3Valid = () => {
    return true; // All fields in Step 3 are optional
  };

  const isStep4Valid = () => {
    return true; // All fields in Step 4 are optional
  };

  // Stepper navigation
  const handleNext = () => {
    if (currentStep === 1 && !isStep1Valid()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (currentStep === 2 && !isStep2Valid()) {
      toast.error("Please select at least one service");
      return;
    }
    if (currentStep === 3 && !isStep3Valid()) {
      toast.error("Please complete pricing details");
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle final invoice creation (Step 4)
  const handleCreateInvoice = async () => {
    if (!isStep4Valid()) {
      toast.error("Please accept the terms to continue");
      return;
    }

    try {
      // Create new invoice object
      const invoiceData = {
        customerId: newInvoiceCustomer,
        customerName: mockCustomers.find(c => c.id === newInvoiceCustomer)?.name || "Unknown Customer",
        jobAddress: newInvoiceJobAddress,
        employeeId: newInvoiceEmployee,
        employeeName: mockEmployees.find(e => e.id === newInvoiceEmployee)?.name || "Unassigned",
        amount: calculateTotal(),
        status: "Open" as const,
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: newInvoiceDueDate || new Date().toISOString().split("T")[0],
        type: newInvoiceType as "single" | "recurring",
        source: "manual" as const,
      };

      // Save invoice using the service
      const newInvoice = await saveInvoice(invoiceData);

      // Add new invoice to the top of the list (optimistic update)
      setAllInvoices([newInvoice, ...allInvoices]);

      // Show success toast
      toast.success("Invoice created successfully");

      // Reset form
      setCurrentStep(1);
      setNewInvoiceCustomer("");
      setNewInvoiceJobAddress("");
      setNewInvoiceEmployee("");
      setNewInvoiceType("single");
      setRecurringEnabled(false);
      setRecurringInterval("");
      setRecurringEndType("date");
      setRecurringEndDate("");
      setRecurringOccurrences("");
      setSelectedServices([]);
      setTaxRate("10");
      setDiscount("");
      setNewInvoiceDueDate("");
      setPaymentTerms("Due on Receipt");
      setTermsConditions("");
      setCancellationPolicy("");
      setInvoiceNotes("");
      setInvoiceAttachments([]);
      setTermsAccepted(false);
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    }
  };

  // Add service to selection
  const handleAddService = (serviceId: string) => {
    const service = { id: serviceId, name: `Service ${serviceId}`, price: 100, quantity: 1 };
    setSelectedServices([...selectedServices, service]);
  };

  // Update service quantity
  const handleUpdateServiceQuantity = (index: number, quantity: number) => {
    const updated = [...selectedServices];
    updated[index].quantity = Math.max(1, quantity);
    setSelectedServices(updated);
  };

  // Remove service from selection
  const handleRemoveService = (index: number) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  // Handle Add Existing Item
  const handleAddExistingItem = (item: {id: string; name: string; price: number; type: string; sku: string}) => {
    const newService = { id: item.id, name: item.name, price: item.price, quantity: 1 };
    setSelectedServices([...selectedServices, newService]);
    setShowExistingItemModal(false);
    toast.success(`${item.name} added to invoice`);
  };

  // Handle Add Custom Item Submit
  const handleCustomItemSubmit = () => {
    if (!customItemName || !customItemPrice) {
      toast.error("Please fill in all required fields");
      return;
    }
    const price = parseFloat(customItemPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    const newService = {
      id: `custom-${Date.now()}`,
      name: customItemName,
      price: price,
      quantity: 1
    };
    setSelectedServices([...selectedServices, newService]);
    setCustomItemName("");
    setCustomItemPrice("");
    setCustomItemImage("");
    setShowCustomItemModal(false);
    toast.success("Custom item added to invoice");
  };

  // Auto-generate SKU
  const generateSKU = () => {
    const sku = `SKU-${Date.now().toString().slice(-8)}`;
    setInventorySKU(sku);
    toast.success("SKU generated");
  };

  // Handle Add Inventory Submit
  const handleInventorySubmit = () => {
    if (!inventoryName || !inventoryPrice) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (inventoryType === "perunit" && !inventoryItemUnit) {
      toast.error("Please specify the item unit");
      return;
    }
    const price = parseFloat(inventoryPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    const newService = {
      id: `inventory-${Date.now()}`,
      name: inventoryName,
      price: price,
      quantity: 1
    };
    setSelectedServices([...selectedServices, newService]);
    // Reset form
    setInventoryName("");
    setInventoryType("fixed");
    setInventoryPrice("");
    setInventoryItemUnit("");
    setInventorySKU("");
    setInventoryAutoSKU(false);
    setInventoryStockQty("");
    setShowInventoryModal(false);
    toast.success("Inventory added to invoice");
  };

  // Mock existing inventory items
  const mockInventoryItems = [
    { id: "inv-1", name: "Plumbing Service", sku: "PLB-001", price: 150, type: "F" },
    { id: "inv-2", name: "Electrical Repair", sku: "ELC-002", price: 200, type: "V" },
    { id: "inv-3", name: "HVAC Maintenance", sku: "HVAC-003", price: 175, type: "U" },
    { id: "inv-4", name: "Carpentry Work", sku: "CRP-004", price: 125, type: "F" },
    { id: "inv-5", name: "Painting Service", sku: "PNT-005", price: 100, type: "V" },
  ];

  const filteredInventoryItems = mockInventoryItems.filter(item =>
    item.name.toLowerCase().includes(existingItemSearch.toLowerCase()) ||
    item.sku.toLowerCase().includes(existingItemSearch.toLowerCase())
  );

  const getFilteredInvoices = (type: InvoiceTab) => {
    return allInvoices
      .filter(inv => (inv.type ?? "single") === type)
      .filter(inv => {
        const matchesSearch =
          inv.id.toLowerCase().includes(search.toLowerCase()) ||
          inv.customerName.toLowerCase().includes(search.toLowerCase());

        const matchesAllowedStatus =
          type === "deactivated" ? true : ["Paid", "Open", "Overdue"].includes(inv.status);

        if (!matchesAllowedStatus) {
          return false;
        }

        const matchesStatus =
          type === "deactivated"
            ? true
            : statusFilter === "all"
              ? true
              : statusFilter === "paid"
                ? inv.status === "Paid"
                : inv.status === "Open";

        const matchesDate = isWithinDateRange(inv.issueDate);

        return matchesSearch && matchesStatus && matchesDate;
      });
  };

  const handlePayNow = (invoiceId: string) => {
    const invoice = allInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      toast.error("Invoice not found");
      return;
    }
    setSelectedInvoice({ id: invoiceId, amount: invoice.amount });
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = (method: string) => {
    // Payment processing toast removed - only success toast shown after payment completes
    // No processing toast for cash payments
    if (selectedInvoice) {
      // Create payment notification
      createPaymentNotification("invoice", selectedInvoice.id);
    }
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setSelectedInvoice(null);
  };

  const handlePayCash = (invoiceId: string) => {
    const invoice = allInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      toast.error("Invoice not found");
      return;
    }
    setSelectedInvoice({ id: invoiceId, amount: invoice.amount });
    setShowCashPaymentModal(true);
  };

  const handleCashPaymentComplete = () => {
    if (selectedInvoice) {
      // Create payment notification
      createPaymentNotification("invoice", selectedInvoice.id);
    }
    setShowCashPaymentModal(false);
    setSelectedInvoice(null);
    toast.success("Payment completed");
  };

  const handleCashPaymentClose = () => {
    setShowCashPaymentModal(false);
    setSelectedInvoice(null);
  };

  const handleMenuAction = (invoice: Invoice, action: string) => {
    const customer = mockCustomers.find(c => c.id === invoice.customerId);

    switch (action) {
      case "preview":
        setPreviewInvoice({
          ...invoice,
          customerEmail: customer?.email,
          customerPhone: customer?.phone,
        });
        setShowPreviewModal(true);
        break;
      case "send-email":
        if (!customer?.email) {
          toast.error("No email address available for this customer");
          return;
        }
        setActionInvoice({
          ...invoice,
          customerEmail: customer.email,
          customerPhone: customer?.phone,
        });
        setShowEmailModal(true);
        break;
      case "send-sms":
        if (!customer?.phone) {
          toast.error("No phone number available for this customer");
          return;
        }
        setActionInvoice({
          ...invoice,
          customerEmail: customer?.email,
          customerPhone: customer.phone,
        });
        setShowSMSModal(true);
        break;
      case "edit":
        navigate(`/invoices/${invoice.id}/edit`);
        break;
      case "doc-history":
        navigate(`/customers/${invoice.customerId}`);
        break;
      case "add-note":
        setSelectedInvoiceForNote(invoice);
        setShowNoteModal(true);
        break;
      case "reassign":
        setActionInvoice({
          ...invoice,
          customerEmail: customer?.email,
          customerPhone: customer?.phone,
        });
        setShowReassignModal(true);
        break;
      case "refund":
        toast.success("Processing refund...");
        break;
      case "deactivate":
        // Update invoice status using service
        const deactivateInvoice = async () => {
          await updateInvoice(invoice.id, { status: "Deactivated" });

          // Log activity
          const { addActivityLog } = await import("@/services/activityLogService");
          addActivityLog({
            type: "invoice",
            action: "deactivated",
            documentId: invoice.id,
            customerName: invoice.customerName,
            amount: invoice.amount,
          });

          toast.success("Invoice deactivated");

          // Refresh list by effectively reloading
          const updatedInvoices = allInvoices.map(inv =>
            inv.id === invoice.id ? { ...inv, status: "Deactivated" } : inv
          );
          setAllInvoices(updatedInvoices as Invoice[]);
        };
        deactivateInvoice();
        break;
      case "activate":
        // Update invoice status using service
        const activateInvoice = async () => {
          await updateInvoice(invoice.id, { status: "Open" }); // Or previous status if tracked

          // Log activity
          const { addActivityLog } = await import("@/services/activityLogService");
          addActivityLog({
            type: "invoice",
            action: "reactivated",
            documentId: invoice.id,
            customerName: invoice.customerName,
            amount: invoice.amount,
          });

          toast.success("Invoice activated");

          // Refresh list
          const updatedInvoices = allInvoices.map(inv =>
            inv.id === invoice.id ? { ...inv, status: "Open" } : inv
          );
          setAllInvoices(updatedInvoices as Invoice[]);
        };
        activateInvoice();
        break;
      case "create-new-invoice":
        // Find employee by name if employeeName exists, otherwise use first employee
        const employee = (invoice as any).employeeName
          ? mockEmployees.find(emp => emp.name === (invoice as any).employeeName)
          : mockEmployees[0];

        navigate("/invoices/new", {
          state: {
            prefill: {
              customerId: invoice.customerId,
              jobAddress: (invoice as any).jobAddress || customer?.address || "",
              employeeId: employee?.id || mockEmployees[0]?.id || "1",
            }
          }
        });
        break;
      case "pay-now":
        handlePayNow(invoice.id);
        break;
      case "pay-cash":
        handlePayCash(invoice.id);
        break;
      case "convert-to-job":
        const result = convertToJob("invoice", invoice.id);
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

  const handlePreviewAction = (invoice: Invoice, action: string) => {
    switch (action) {
      case "send-email":
        handleMenuAction(invoice, "send-email");
        break;
      case "send-sms":
        handleMenuAction(invoice, "send-sms");
        break;
      case "reassign":
        handleMenuAction(invoice, "reassign");
        break;
      case "pay-now":
        handlePayNow(invoice.id);
        break;
      case "print":
        toast.success("Sending invoice to printer...");
        break;
      default:
        break;
    }
  };

  const renderActionButtons = (invoice: Invoice, type: InvoiceTab) => {
    if (type === "deactivated") {
      const items: KebabMenuItem[] = [
        {
          label: "Preview",
          icon: Eye,
          action: () => handleMenuAction(invoice, "preview"),
        },
        {
          label: "Activate",
          icon: RotateCcw,
          action: () => handleMenuAction(invoice, "activate"),
        },
      ];
      return <KebabMenu items={items} menuWidth="w-44" />;
    }

    if (invoice.status === "Paid") {
      // Check if invoice has already been converted to job
      // The jobConversionService changes status to "Job Created" when converted
      const invoiceStatus = (invoice as any).status || invoice.status;
      const isConverted = invoiceStatus === "Job Created";

      // Check if invoice is from sell_product (should not show Convert to Job)
      // source is optional, so undefined means it's not from sell_product
      const invoiceSource = (invoice as any).source;
      const isSellProduct = invoiceSource === "sell_product";

      const items: KebabMenuItem[] = [
        {
          label: "Preview",
          icon: Eye,
          action: () => handleMenuAction(invoice, "preview"),
        },
      ];

      // Add "Convert to Job" right after Preview for all paid invoices
      // Only exclude if:
      // 1. Invoice is from sell_product (source === "sell_product")
      // 2. Invoice has already been converted (status === "Job Created")
      // For all other paid invoices, show the option
      const shouldShowConvertToJob = !isSellProduct && !isConverted;

      if (shouldShowConvertToJob) {
        items.push({
          label: "Convert to Job",
          icon: Briefcase,
          action: () => handleMenuAction(invoice, "convert-to-job"),
        });
      }

      // Add remaining menu items
      items.push(
        {
          label: "Send Email",
          icon: Mail,
          action: () => handleMenuAction(invoice, "send-email"),
        },
        {
          label: "Send SMS",
          icon: MessageSquare,
          action: () => handleMenuAction(invoice, "send-sms"),
        }
      );

      // Employees should NOT see sensitive admin actions on paid invoices
      if (!isEmployee) {
        items.push(
          {
            label: "Customer History",
            icon: History,
            action: () => handleMenuAction(invoice, "doc-history"),
          },
          {
            label: "Add Note",
            icon: StickyNote,
            action: () => handleMenuAction(invoice, "add-note"),
          },
          {
            label: "Reassign Employee",
            icon: UserCog,
            action: () => handleMenuAction(invoice, "reassign"),
          },
          {
            label: "Refund",
            icon: RotateCcw,
            action: () => handleMenuAction(invoice, "refund"),
            separator: true,
          }
        );
      }

      // Add "Create New Invoice" option for paid invoices
      items.push({
        label: "Create New Invoice",
        icon: FilePlus,
        action: () => handleMenuAction(invoice, "create-new-invoice"),
        separator: true,
      });

      return <KebabMenu items={items} menuWidth="w-48" />;
    }

    if (invoice.status === "Open" || invoice.status === "Unpaid") {
      // For employees on unpaid invoices, remove Edit, Reassign, and Deactivate
      const isUnpaidInvoice = invoice.status === "Open" || invoice.status === "Unpaid";
      const shouldRestrictActions = isEmployee && isUnpaidInvoice;

      // Check if invoice has been converted or is from sell_product
      const invoiceStatus = (invoice as any).status || invoice.status;
      const isConverted = invoiceStatus === "Job Created";
      const invoiceSource = (invoice as any).source;
      const isSellProduct = invoiceSource === "sell_product";

      const items: KebabMenuItem[] = [
        {
          label: "Preview",
          icon: Eye,
          action: () => handleMenuAction(invoice, "preview"),
        },
        {
          label: "Pay Now",
          icon: CreditCard,
          action: () => handleMenuAction(invoice, "pay-now"),
        },
        {
          label: "Pay Cash",
          icon: DollarSign,
          action: () => handleMenuAction(invoice, "pay-cash"),
        },
        // Add "Convert to Job" for unpaid invoices (same as paid)
        ...(!isSellProduct && !isConverted ? [{
          label: "Convert to Job",
          icon: Briefcase,
          action: () => handleMenuAction(invoice, "convert-to-job"),
        }] : []),
        {
          label: "Send Email",
          icon: Mail,
          action: () => handleMenuAction(invoice, "send-email"),
        },
        {
          label: "Send SMS",
          icon: MessageSquare,
          action: () => handleMenuAction(invoice, "send-sms"),
        },
      ];

      // Only add restricted actions if user is not an employee or invoice is paid
      if (!shouldRestrictActions) {
        items.push(
          {
            label: "Edit Invoice",
            icon: Edit,
            action: () => handleMenuAction(invoice, "edit"),
            separator: true,
          },
          {
            label: "Customer History",
            icon: History,
            action: () => handleMenuAction(invoice, "doc-history"),
          },
          {
            label: "Add Note",
            icon: StickyNote,
            action: () => handleMenuAction(invoice, "add-note"),
          },
          {
            label: "Reassign Employee",
            icon: UserCog,
            action: () => handleMenuAction(invoice, "reassign"),
          },
          {
            label: "Deactivate",
            icon: XCircle,
            action: () => handleMenuAction(invoice, "deactivate"),
          }
        );
      }

      return <KebabMenu items={items} menuWidth="w-56" />;
    }

    const items: KebabMenuItem[] = [
      {
        label: "Preview",
        icon: Eye,
        action: () => handleMenuAction(invoice, "preview"),
      },
      {
        label: "Send Email",
        icon: Mail,
        action: () => handleMenuAction(invoice, "send-email"),
      },
      {
        label: "Send SMS",
        icon: MessageSquare,
        action: () => handleMenuAction(invoice, "send-sms"),
      },
      {
        label: "Reassign Employee",
        icon: UserCog,
        action: () => handleMenuAction(invoice, "reassign"),
      },
      {
        label: "Refund",
        icon: RotateCcw,
        action: () => handleMenuAction(invoice, "refund"),
        separator: true,
      },
    ];
    return <KebabMenu items={items} menuWidth="w-48" />;
  };

  const renderInvoices = (type: InvoiceTab) => {
    const invoices = getFilteredInvoices(type);
    const showFilters = type !== "deactivated";

    return (
      <div className="space-y-2.5">
        {showFilters && (
          <div className="flex gap-2">
            <div className="flex-1 min-w-0">
              <Button
                variant="outline"
                onClick={() => setShowDateRangePicker(true)}
                className="w-full h-9 px-2.5 text-xs font-normal justify-start gap-1.5"
              >
                <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                {dateRange.from && dateRange.to ? (
                  <span className="truncate text-left text-xs">
                    {format(dateRange.from, "MM/dd/yyyy")} - {format(dateRange.to, "MM/dd/yyyy")}
                  </span>
                ) : dateRange.from ? (
                  <span className="truncate text-left text-xs">{format(dateRange.from, "MM/dd/yyyy")}</span>
                ) : (
                  <span className="text-muted-foreground truncate text-left text-xs">Date Range</span>
                )}
              </Button>
            </div>

            <div className="flex-1 min-w-0">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as InvoiceStatusFilter)}>
                <SelectTrigger className="w-full h-9 text-xs py-2 px-3">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {invoices.length > 0 ? (
          <div className="space-y-2">
            {invoices.map(invoice => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onClick={() => navigate(`/invoices/${invoice.id}`)}
                className={newInvoiceId === invoice.id ? "ring-2 ring-primary ring-offset-2 bg-primary/5 border-primary" : ""}
                payButton={
                  invoice.status === "Open" ? (
                    <Button
                      size="sm"
                      variant="default"
                      className="h-auto min-h-0 px-2 py-1 text-xs font-semibold whitespace-nowrap bg-primary hover:bg-primary/90 rounded-xl shadow-sm hover:shadow-md transition-all leading-tight"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePayNow(invoice.id);
                      }}
                    >
                      Pay
                    </Button>
                  ) : undefined
                }
                actionButtons={renderActionButtons(invoice, type)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileText className="h-8 w-8 text-muted-foreground" />}
            title="No invoices found"
            description="Try adjusting your search or filters"
            actionLabel="Create Invoice"
            onAction={() => navigate("/invoices/new")}
          />
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <TabletHeader
        title="Invoices"
        actions={
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 tablet:hidden" onClick={() => navigate("/invoices/new")}>
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      {/* Mobile Layout */}
      <div className="flex-1 overflow-y-auto scrollable px-3 pb-4 space-y-3 tablet:hidden" style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top) + 0.5rem)' }}>
        {/* Search and Invoice Due Alert Button */}
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm py-2"
            />
          </div>
          {/* Hide Alert button for employees */}
          {!isEmployee && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInvoiceDueAlertModal(true)}
              className="h-9 px-2 sm:px-3 text-xs font-medium flex-shrink-0"
            >
              <Bell className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Invoice Due Alert</span>
              <span className="sm:hidden">Alert</span>
            </Button>
          )}
        </div>

        {/* Invoice Type Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-3">
          <TabsList className={`w-full grid h-9 ${isEmployee ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <TabsTrigger value="single" className="text-xs py-1.5 px-2">Single</TabsTrigger>
            <TabsTrigger value="recurring" className="text-xs py-1.5 px-2">Recurring</TabsTrigger>
            {/* Hide Deactivated tab for employees */}
            {!isEmployee && (
              <TabsTrigger value="deactivated" className="text-xs py-1.5 px-2">Deactivated</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="single" className="mt-1.5">
            {renderInvoices("single")}
          </TabsContent>
          <TabsContent value="recurring" className="mt-1.5">
            {renderInvoices("recurring")}
          </TabsContent>
          {/* Hide Deactivated tab content for employees */}
          {!isEmployee && (
            <TabsContent value="deactivated" className="mt-1.5">
              {renderInvoices("deactivated")}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Tablet Layout: Two-column grid */}
      <div className="hidden tablet:flex tablet:flex-1 tablet:overflow-hidden">
        {/* Left Panel: Add Invoice - Tablet Only */}
        <aside className="tablet:w-[40%] bg-gray-50/80 border-r overflow-y-auto flex flex-col" style={{ contain: 'layout style paint' }}>
          <div className="sticky top-0 bg-gray-50/95 border-b px-4 py-3 z-10" style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-foreground">Add Invoice</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.info("Syncing items...");
                  // Placeholder for sync functionality
                }}
                className="flex items-center gap-1.5 text-xs h-7"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Sync Item
              </Button>
            </div>
            
            {/* Stepper Progress */}
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      step < currentStep 
                        ? 'bg-green-500 text-white' 
                        : step === currentStep 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step < currentStep ? '✓' : step}
                    </div>
                    <span className={`text-[9px] mt-1 font-medium ${
                      step === currentStep ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step === 1 && 'Details'}
                      {step === 2 && 'Service'}
                      {step === 3 && 'Pricing'}
                      {step === 4 && 'Terms'}
                    </span>
                  </div>
                  {step < 4 && (
                    <div className={`h-0.5 flex-1 transition-colors ${
                      step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {/* Step 1: Customer & Job Details */}
            {currentStep === 1 && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer *</label>
                  <Select value={newInvoiceCustomer} onValueChange={setNewInvoiceCustomer}>
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

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Job Address *</label>
                  <Input
                    placeholder="Enter job address"
                    value={newInvoiceJobAddress}
                    onChange={(e) => setNewInvoiceJobAddress(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Select Employee *</label>
                  <Select value={newInvoiceEmployee} onValueChange={setNewInvoiceEmployee}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockEmployees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Invoice Type - Radio Buttons */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Invoice Type *</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="invoiceType"
                        value="single"
                        checked={newInvoiceType === "single"}
                        onChange={(e) => {
                          setNewInvoiceType("single");
                          setRecurringEnabled(false);
                        }}
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <span className="text-sm font-medium">Single</span>
                    </label>
                    <label className="flex items-center gap-2 flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="invoiceType"
                        value="recurring"
                        checked={newInvoiceType === "recurring"}
                        onChange={(e) => setNewInvoiceType("recurring")}
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <span className="text-sm font-medium">Recurring</span>
                    </label>
                  </div>
                </div>

                {/* Recurring Options - Only show when Recurring is selected */}
                {newInvoiceType === "recurring" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    {/* Recurring Checkbox */}
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="recurring-enabled"
                        checked={recurringEnabled}
                        onChange={(e) => setRecurringEnabled(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="recurring-enabled" className="text-xs text-foreground cursor-pointer leading-relaxed">
                        Recurring invoicing automatically sends the invoice on the following intervals.
                      </label>
                    </div>

                    {/* Conditional Fields - Only show when checkbox is checked */}
                    {recurringEnabled && (
                      <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-200">
                        {/* Interval Selector */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-foreground">Interval *</label>
                          <Select value={recurringInterval} onValueChange={setRecurringInterval}>
                            <SelectTrigger className="h-9 text-sm bg-background">
                              <SelectValue placeholder="Select interval" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Recurring End Condition */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-foreground">End Condition *</label>
                          
                          {/* End Date Option */}
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="recurringEndType"
                                value="date"
                                checked={recurringEndType === "date"}
                                onChange={(e) => setRecurringEndType("date")}
                                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                              />
                              <span className="text-xs font-medium">End Date of Your Recurring</span>
                            </label>
                            {recurringEndType === "date" && (
                              <Input
                                type="date"
                                value={recurringEndDate}
                                onChange={(e) => setRecurringEndDate(e.target.value)}
                                className="h-9 text-sm bg-background ml-6"
                                placeholder="dd/mm/yyyy"
                              />
                            )}
                          </div>

                          {/* Number of Occurrences Option */}
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="recurringEndType"
                                value="occurrences"
                                checked={recurringEndType === "occurrences"}
                                onChange={(e) => setRecurringEndType("occurrences")}
                                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                              />
                              <span className="text-xs font-medium">Number of Occurrences</span>
                            </label>
                            {recurringEndType === "occurrences" && (
                              <Input
                                type="number"
                                min="1"
                                value={recurringOccurrences}
                                onChange={(e) => setRecurringOccurrences(e.target.value)}
                                className="h-9 text-sm bg-background ml-6"
                                placeholder="Enter number"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Select Service */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {/* Step Header */}
                <div className="pb-2 border-b">
                  <h4 className="text-sm font-semibold text-foreground">Step 2 of 4: Services</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Add items to your invoice</p>
                </div>

                {/* Three Action Buttons - In One Row */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="min-h-[56px] h-auto text-xs font-medium hover:bg-primary/5 hover:border-primary flex flex-col items-center justify-center gap-1 py-2.5 px-2"
                    onClick={() => setShowExistingItemModal(true)}
                  >
                    <ListPlus className="h-4 w-4 flex-shrink-0" />
                    <span className="leading-tight text-center">
                      Add Existing<br />Item
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="min-h-[56px] h-auto text-xs font-medium hover:bg-primary/5 hover:border-primary flex flex-col items-center justify-center gap-1 py-2.5 px-2"
                    onClick={() => setShowCustomItemModal(true)}
                  >
                    <Pencil className="h-4 w-4 flex-shrink-0" />
                    <span className="leading-tight text-center">
                      Add Custom<br />Item
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="min-h-[56px] h-auto text-xs font-medium hover:bg-primary/5 hover:border-primary flex flex-col items-center justify-center gap-1 py-2.5 px-2"
                    onClick={() => setShowInventoryModal(true)}
                  >
                    <Package className="h-4 w-4 flex-shrink-0" />
                    <span className="leading-tight text-center">Add Inventory</span>
                  </Button>
                </div>

                {/* Selected Items Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-semibold text-foreground uppercase tracking-wide">Selected Items</h5>
                    {selectedServices.length > 0 && (
                      <span className="text-xs text-muted-foreground">({selectedServices.length} {selectedServices.length === 1 ? 'item' : 'items'})</span>
                    )}
                  </div>

                  {/* Empty State */}
                  {selectedServices.length === 0 ? (
                    <div className="bg-gray-100 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No items added yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Use the buttons above to add items</p>
                    </div>
                  ) : (
                    /* Selected Items List */
                    <div className="space-y-2">
                      {selectedServices.map((service, idx) => (
                        <div key={idx} className="bg-background border rounded-lg p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{service.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">${service.price.toFixed(2)} per unit</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:bg-destructive/10"
                              onClick={() => handleRemoveService(idx)}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-muted-foreground font-medium">Qty:</label>
                              <Input
                                type="number"
                                min="1"
                                value={service.quantity}
                                onChange={(e) => handleUpdateServiceQuantity(idx, parseInt(e.target.value) || 1)}
                                className="w-20 h-8 text-sm text-center"
                              />
                            </div>
                            <div className="flex-1 text-right">
                              <p className="text-sm font-semibold text-foreground">
                                ${(service.price * service.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing Summary - Only show when items exist */}
                {selectedServices.length > 0 && (
                  <div className="bg-gray-50 border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium text-foreground">
                        ${selectedServices.reduce((sum, service) => sum + (service.price * service.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="text-sm font-semibold text-foreground">Total</span>
                      <span className="text-base font-bold text-primary">
                        ${selectedServices.reduce((sum, service) => sum + (service.price * service.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Validation Message */}
                {selectedServices.length === 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded p-2 text-center">
                    <p className="text-xs text-amber-800">At least one item is required to proceed</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Pricing */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {/* Terms Section */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Terms</label>
                  <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 45">Net 45</SelectItem>
                      <SelectItem value="Net 60">Net 60</SelectItem>
                      <SelectItem value="Net 90">Net 90</SelectItem>
                      <SelectItem value="Net 120">Net 120</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Add Order Discount Button */}
                {!showDiscount && (
                  <Button
                    variant="outline"
                    className="w-full h-9 text-xs font-medium hover:bg-primary/5 hover:border-primary"
                    onClick={() => setShowDiscount(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Order Discount
                  </Button>
                )}

                {/* Discount Input - Shown when Add Order Discount is clicked */}
                {showDiscount && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Discount ($)</label>
                      <button
                        onClick={() => {
                          setShowDiscount(false);
                          setDiscount("");
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="pl-9 h-9 text-sm"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                )}

                {/* Order Summary Card */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Order Summary</div>
                  <div className="bg-background rounded border p-3 space-y-2.5">
                    {/* Subtotal */}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>

                    {/* Tax with Inline Input */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Tax</span>
                        <Input
                          type="number"
                          placeholder="10"
                          value={taxRate}
                          onChange={(e) => setTaxRate(e.target.value)}
                          className="h-7 w-14 text-xs px-2"
                          step="0.1"
                          min="0"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                      <span className="font-medium">${calculateTax().toFixed(2)}</span>
                    </div>

                    {/* Discount Display (if applied) */}
                    {showDiscount && discount && parseFloat(discount) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium text-destructive">-${parseFloat(discount).toFixed(2)}</span>
                      </div>
                    )}

                    {/* Total */}
                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="text-sm font-semibold text-foreground">Total</span>
                      <span className="text-lg font-bold text-primary">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes Section with Attachment */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</label>
                  <div className="relative">
                    <textarea
                      placeholder="Add any notes or special instructions…"
                      value={invoiceNotes}
                      onChange={(e) => setInvoiceNotes(e.target.value)}
                      className="w-full min-h-[80px] px-3 py-2 pb-10 text-sm rounded-md border border-input bg-background resize-none"
                    />
                    {/* Attachment Icon */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-2">
                      {invoiceAttachments.length > 0 && (
                        <span className="text-xs text-primary font-medium">
                          {invoiceAttachments.length} file{invoiceAttachments.length > 1 ? 's' : ''}
                        </span>
                      )}
                      <label
                        htmlFor="invoice-attachment"
                        className="cursor-pointer p-1.5 rounded hover:bg-primary/10 transition-colors group"
                        title="Attach file or image"
                      >
                        <Camera className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <input
                          id="invoice-attachment"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,application/pdf"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              const newFiles = Array.from(e.target.files);
                              const validFiles = newFiles.filter(file => {
                                const maxSize = 10 * 1024 * 1024; // 10MB
                                if (file.size > maxSize) {
                                  toast.error(`${file.name} exceeds 10MB limit`);
                                  return false;
                                }
                                return true;
                              });
                              setInvoiceAttachments(prev => [...prev, ...validFiles]);
                              if (validFiles.length > 0) {
                                toast.success(`${validFiles.length} file(s) attached`);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  {/* Display attached files */}
                  {invoiceAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {invoiceAttachments.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 px-2 py-1 bg-primary/5 border border-primary/20 rounded text-xs"
                        >
                          <span className="text-muted-foreground truncate max-w-[120px]">{file.name}</span>
                          <button
                            onClick={() => {
                              setInvoiceAttachments(prev => prev.filter((_, i) => i !== idx));
                              toast.success('Attachment removed');
                            }}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Terms & Cancellation */}
            {currentStep === 4 && (
              <div className="space-y-4">
                {/* Terms & Conditions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Terms & Conditions</label>
                  <textarea
                    placeholder="Enter terms and conditions..."
                    value={termsConditions}
                    onChange={(e) => setTermsConditions(e.target.value)}
                    className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y"
                  />
                </div>

                {/* Cancellation & Return Policy */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cancellation & Return Policy</label>
                  <textarea
                    placeholder="Enter cancellation and return policy..."
                    value={cancellationPolicy}
                    onChange={(e) => setCancellationPolicy(e.target.value)}
                    className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="sticky bottom-0 bg-gray-50/95 border-t px-4 py-3" style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}>
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-9 text-sm"
                >
                  Back
                </Button>
              )}
              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  className="flex-1 h-9 text-sm font-medium"
                  disabled={
                    (currentStep === 1 && !isStep1Valid()) ||
                    (currentStep === 2 && !isStep2Valid()) ||
                    (currentStep === 3 && !isStep3Valid())
                  }
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleCreateInvoice}
                  className="flex-1 h-9 text-sm font-medium"
                  disabled={!isStep4Valid()}
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* Right Panel: Invoice List */}
        <div className="tablet:flex-1 tablet:overflow-y-auto scrollable bg-gray-50/50" style={{ contain: 'layout style paint' }}>
          <div className="px-4 py-4 space-y-3 tablet:max-w-5xl tablet:mx-auto">
            {/* Search and Invoice Due Alert Button */}
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm py-2"
                />
              </div>
              {/* Hide Alert button for employees */}
              {!isEmployee && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInvoiceDueAlertModal(true)}
                  className="h-9 px-3 text-xs font-medium flex-shrink-0"
                >
                  <Bell className="h-3.5 w-3.5 mr-1.5" />
                  <span>Invoice Due Alert</span>
                </Button>
              )}
            </div>

            {/* Invoice Type Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-3">
              <TabsList className={`w-full grid h-9 ${isEmployee ? 'grid-cols-2' : 'grid-cols-3'}`}>
                <TabsTrigger value="single" className="text-xs py-1.5 px-2">Single</TabsTrigger>
                <TabsTrigger value="recurring" className="text-xs py-1.5 px-2">Recurring</TabsTrigger>
                {/* Hide Deactivated tab for employees */}
                {!isEmployee && (
                  <TabsTrigger value="deactivated" className="text-xs py-1.5 px-2">Deactivated</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="single" className="mt-1.5">
                {renderInvoices("single")}
              </TabsContent>
              <TabsContent value="recurring" className="mt-1.5">
                {renderInvoices("recurring")}
              </TabsContent>
              {/* Hide Deactivated tab content for employees */}
              {!isEmployee && (
                <TabsContent value="deactivated" className="mt-1.5">
                  {renderInvoices("deactivated")}
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>

      {selectedInvoice && (
        <>
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={handlePaymentModalClose}
            amount={selectedInvoice.amount}
            onPaymentMethodSelect={handlePaymentMethodSelect}
          />
          <CashPaymentModal
            isOpen={showCashPaymentModal}
            onClose={handleCashPaymentClose}
            onBack={handleCashPaymentClose}
            amount={selectedInvoice.amount}
            onPaymentComplete={handleCashPaymentComplete}
          />
        </>
      )}

      {actionInvoice && showEmailModal && (
        <SendEmailModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setActionInvoice(null);
          }}
          customerEmail={actionInvoice.customerEmail || ""}
          customerName={actionInvoice.customerName}
        />
      )}

      {actionInvoice && (
        <SendSMSModal
          isOpen={showSMSModal}
          onClose={() => {
            setShowSMSModal(false);
            setActionInvoice(null);
          }}
          customerPhone={actionInvoice.customerPhone || ""}
          customerCountryCode="+1"
          entityId={actionInvoice.id}
          entityType="invoice"
          customerName={actionInvoice.customerName}
        />
      )}

      {actionInvoice && showReassignModal && (
        <ReassignEmployeeModal
          isOpen={showReassignModal}
          onClose={() => {
            setShowReassignModal(false);
            setActionInvoice(null);
          }}
          currentEmployeeId={actionInvoice.customerId}
          estimateId={actionInvoice.id}
        />
      )}
      {previewInvoice && (
        <PreviewInvoiceModal
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewInvoice(null);
          }}
          invoice={previewInvoice}
          onAction={(action) => {
            handlePreviewAction(previewInvoice, action);
            if (action !== "print") {
              setShowPreviewModal(false);
              setPreviewInvoice(null);
            }
          }}
        />
      )}

      {/* Document Note Modal */}
      {selectedInvoiceForNote && (
        <DocumentNoteModal
          open={showNoteModal}
          onClose={() => {
            setShowNoteModal(false);
            setSelectedInvoiceForNote(null);
          }}
          documentId={selectedInvoiceForNote.id}
          documentType="invoice"
          customerId={selectedInvoiceForNote.customerId}
          customerName={selectedInvoiceForNote.customerName}
          onNoteAdded={() => {
            // Optionally refresh invoice data or show updated notes
          }}
        />
      )}

      <InvoiceDueAlertModal
        isOpen={showInvoiceDueAlertModal}
        onClose={() => setShowInvoiceDueAlertModal(false)}
      />

      {/* Date Range Picker Modal */}
      <DateRangePickerModal
        open={showDateRangePicker}
        onOpenChange={setShowDateRangePicker}
        initialRange={dateRange}
        onConfirm={handleDateRangeConfirm}
        resetToToday={false}
      />

      {/* Add Existing Item Modal */}
      <Dialog open={showExistingItemModal} onOpenChange={setShowExistingItemModal}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Existing Item</DialogTitle>
            <DialogDescription>
              Search and select items from your inventory to add to this invoice.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={existingItemSearch}
                onChange={(e) => setExistingItemSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* Inventory Type Legend */}
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center">F</Badge>
                <span className="text-muted-foreground">Fixed</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center">V</Badge>
                <span className="text-muted-foreground">Variable</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center">U</Badge>
                <span className="text-muted-foreground">Per Unit</span>
              </div>
            </div>

            {/* Scrollable Item List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {filteredInventoryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAddExistingItem(item)}
                  className="w-full text-left p-3 bg-background border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">SKU: {item.sku}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {item.type}
                      </Badge>
                      <span className="text-sm font-semibold text-foreground">${item.price}</span>
                    </div>
                  </div>
                </button>
              ))}
              {filteredInventoryItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No items found
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Custom Item Modal */}
      <Dialog open={showCustomItemModal} onOpenChange={setShowCustomItemModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Item</DialogTitle>
            <DialogDescription>
              Create a one-time custom item for this invoice.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Upload Item Image */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Item Image (Optional)</label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Click to upload or drag and drop</p>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCustomItemImage(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </div>
              {customItemImage && (
                <div className="relative w-20 h-20">
                  <img src={customItemImage} alt="Preview" className="w-full h-full object-cover rounded" />
                  <button
                    onClick={() => setCustomItemImage("")}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Item Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Item Name *</label>
              <Input
                placeholder="Enter item name"
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Price *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={customItemPrice}
                  onChange={(e) => setCustomItemPrice(e.target.value)}
                  className="pl-9 h-9 text-sm"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomItemModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomItemSubmit}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Inventory Modal */}
      <Dialog open={showInventoryModal} onOpenChange={setShowInventoryModal}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Add Inventory</DialogTitle>
                <DialogDescription>
                  Add a new inventory item and include it in this invoice.
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.info("Syncing inventory...");
                  // Placeholder for sync functionality
                }}
                className="flex items-center gap-1.5 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Sync Item
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Inventory Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Inventory Name *</label>
              <Input
                placeholder="Enter inventory name"
                value={inventoryName}
                onChange={(e) => setInventoryName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Inventory Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Inventory Type *</label>
              <Select value={inventoryType} onValueChange={(value: any) => setInventoryType(value)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="perunit">Per Unit</SelectItem>
                  <SelectItem value="variable">Variable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional: Item Unit (only for Per Unit) */}
            {inventoryType === "perunit" && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-medium text-muted-foreground">Item Unit *</label>
                <Input
                  placeholder="e.g., kg, lbs, pcs"
                  value={inventoryItemUnit}
                  onChange={(e) => setInventoryItemUnit(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            )}

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Price *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={inventoryPrice}
                  onChange={(e) => setInventoryPrice(e.target.value)}
                  className="pl-9 h-9 text-sm"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* SKU with Auto-generate */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">SKU</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateSKU}
                  className="h-7 px-2 text-xs"
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  Auto-generate
                </Button>
              </div>
              <Input
                placeholder="Enter or auto-generate SKU"
                value={inventorySKU}
                onChange={(e) => setInventorySKU(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Stock Quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Stock Quantity</label>
              <Input
                type="number"
                placeholder="0"
                value={inventoryStockQty}
                onChange={(e) => setInventoryStockQty(e.target.value)}
                className="h-9 text-sm"
                min="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInventoryModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleInventorySubmit}>
              Save & Add to Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
