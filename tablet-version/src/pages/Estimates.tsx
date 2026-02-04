import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import TabletHeader from "@/components/layout/TabletHeader";
import EstimateCard from "@/components/cards/EstimateCard";
import EmptyState from "@/components/cards/EmptyState";
import PaymentModal from "@/components/modals/PaymentModal";
import CashPaymentModal from "@/components/modals/CashPaymentModal";
import PreviewEstimateModal from "@/components/modals/PreviewEstimateModal";
import PreviewInvoiceModal from "@/components/modals/PreviewInvoiceModal";
import SendEmailModal from "@/components/modals/SendEmailModal";
import SendSMSModal from "@/components/modals/SendSMSModal";
import ReassignEmployeeModal from "@/components/modals/ReassignEmployeeModal";
import ShareAddressModal from "@/components/modals/ShareAddressModal";
import DocumentNoteModal from "@/components/modals/DocumentNoteModal";
import DateRangePickerModal from "@/components/modals/DateRangePickerModal";
import EstimateToInvoiceInfoModal from "@/components/modals/EstimateToInvoiceInfoModal";
import { mockEstimates, mockCustomers, mockEmployees, mockInvoices } from "@/data/mobileMockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, Eye, Mail, MessageSquare, Edit, UserCog, History, RotateCcw, XCircle, Receipt, FilePlus, CreditCard, DollarSign, Briefcase, StickyNote, Package, ListPlus, Pencil, Camera, RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import { createPaymentNotification } from "@/services/notificationService";
import { convertToJob } from "@/services/jobConversionService";
import { convertEstimateToInvoice } from "@/services/estimateToInvoiceService";
import { format } from "date-fns";

const Estimates = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("activate");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCashPaymentModal, setShowCashPaymentModal] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<{ id: string; amount: number } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewEstimate, setPreviewEstimate] = useState<any>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showShareAddressModal, setShowShareAddressModal] = useState(false);
  const [selectedEstimateForAction, setSelectedEstimateForAction] = useState<any>(null);
  const [deactivatedEstimates, setDeactivatedEstimates] = useState<Set<string>>(new Set());
  const [statusFilterValue, setStatusFilterValue] = useState<string>("all");
  const [convertedEstimates, setConvertedEstimates] = useState<Set<string>>(new Set());
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<any>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedEstimateForNote, setSelectedEstimateForNote] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [showEstimateToInvoiceInfoModal, setShowEstimateToInvoiceInfoModal] = useState(false);

  // State for managing all estimates
  const [allEstimates, setAllEstimates] = useState<typeof mockEstimates>([]);

  // Add Estimate Form State (Tablet)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Customer & Job Details
  const [newEstimateCustomer, setNewEstimateCustomer] = useState("");
  const [newEstimateJobAddress, setNewEstimateJobAddress] = useState("");
  const [newEstimateEmployee, setNewEstimateEmployee] = useState("");
  
  // Step 2: Select Service
  const [selectedServices, setSelectedServices] = useState<Array<{id: string; name: string; price: number; quantity: number}>>([]);
  
  // Step 2 Modals
  const [showExistingItemModal, setShowExistingItemModal] = useState(false);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  
  // Add Custom Item Modal State
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");
  
  // Existing Item Search
  const [existingItemSearch, setExistingItemSearch] = useState("");
  
  // Step 3: Pricing
  const [subtotal, setSubtotal] = useState(0);
  const [taxRate, setTaxRate] = useState("10");
  const [discount, setDiscount] = useState("");
  const [showDiscount, setShowDiscount] = useState(false);
  
  // Step 4: Terms & Cancellation
  const [paymentTerms, setPaymentTerms] = useState("Due on Receipt");
  const [termsConditions, setTermsConditions] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [estimateNotes, setEstimateNotes] = useState("");
  const [estimateAttachments, setEstimateAttachments] = useState<File[]>([]);

  // Get user role from localStorage
  const userRole = localStorage.getItem("userType") || "merchant";
  const isEmployee = userRole === "employee";

  // Load estimates from localStorage and mock data
  useEffect(() => {
    const storedEstimates = localStorage.getItem("estimates");
    const parsedEstimates = storedEstimates ? JSON.parse(storedEstimates) : [];
    
    // Combine stored estimates with mock estimates, remove duplicates
    const combinedEstimates = [...parsedEstimates, ...mockEstimates.filter(
      mock => !parsedEstimates.some((stored: any) => stored.id === mock.id)
    )];
    
    // Sort by createdAt DESC (newest first)
    const sortedEstimates = combinedEstimates.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.issueDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.issueDate || 0).getTime();
      return dateB - dateA;
    });
    
    setAllEstimates(sortedEstimates);
  }, []);

  // Save estimates to localStorage whenever they change
  useEffect(() => {
    if (allEstimates.length > 0) {
      // Only save estimates that were created by the user (have createdAt)
      const userEstimates = allEstimates.filter(est => est.createdAt);
      localStorage.setItem("estimates", JSON.stringify(userEstimates));
    }
  }, [allEstimates]);

  // Ensure employees always use "activate" filter (no tabs for employees)
  useEffect(() => {
    if (isEmployee) {
      setStatusFilter("activate");
    }
  }, [isEmployee]);

  // Load converted and deactivated estimates from localStorage on mount
  useEffect(() => {
    const converted = JSON.parse(localStorage.getItem("convertedEstimates") || "[]");
    if (converted.length > 0) {
      setConvertedEstimates(new Set(converted));
    }

    // Load deactivated estimates
    const deactivated = JSON.parse(localStorage.getItem("deactivatedEstimates") || "[]");
    if (deactivated.length > 0) {
      setDeactivatedEstimates(new Set(deactivated));
    }
  }, []);

  // Persist deactivated estimates
  useEffect(() => {
    if (deactivatedEstimates.size > 0) {
      localStorage.setItem("deactivatedEstimates", JSON.stringify(Array.from(deactivatedEstimates)));
    }
  }, [deactivatedEstimates]);

  const isWithinDateRange = (dateString: string) => {
    // If no date range is selected, show all estimates
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

  const filteredEstimates = allEstimates.map(est => {
    // Check if estimate has been converted
    const isConverted = convertedEstimates.has(est.id);
    // Only update status if it's currently Unpaid and has been converted
    if (isConverted && est.status === "Unpaid") {
      return {
        ...est,
        status: "Converted to Invoice" as const,
      };
    }
    return est;
  }).filter(est => {
    const matchesSearch = est.id.toLowerCase().includes(search.toLowerCase()) ||
      est.customerName.toLowerCase().includes(search.toLowerCase());

    // Filter by status (All / Paid / Unpaid)
    const matchesStatus = statusFilterValue === "all" || est.status === statusFilterValue;

    // Filter by date range
    const matchesDate = isWithinDateRange(est.issueDate);

    // Filter by tab
    // Activate: Both Paid and Unpaid estimates that are NOT deactivated
    // Deactivated: Only Unpaid estimates that ARE deactivated
    let matchesTab = true;
    const isDeactivated = deactivatedEstimates.has(est.id);
    if (statusFilter === "deactivated") {
      matchesTab = est.status === "Unpaid" && isDeactivated;
    } else {
      // Activate tab: exclude deactivated estimates
      matchesTab = !isDeactivated;
    }

    return matchesSearch && matchesStatus && matchesDate && matchesTab;
  });

  const handlePayNow = (estimateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const estimate = mockEstimates.find(est => est.id === estimateId);
    if (estimate) {
      setSelectedEstimate({ id: estimateId, amount: estimate.amount });
      // Show info modal before proceeding to payment
      setShowEstimateToInvoiceInfoModal(true);
    }
  };

  const handleContinueToPayment = () => {
    // Close info modal and show payment modal
    setShowEstimateToInvoiceInfoModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = (method: string) => {
    if (selectedEstimate) {
      // Payment processing toast removed - only success toast shown after payment completes
      // No processing toast for cash payments
      // Create payment notification
      createPaymentNotification("estimate", selectedEstimate.id);
      // Navigate to payment processing page or handle payment
      // navigate(`/payment/${selectedEstimate.id}?method=${method}`);
    }
  };

  const handlePayCash = (estimateId: string) => {
    const estimate = mockEstimates.find(est => est.id === estimateId);
    if (!estimate) {
      toast.error("Estimate not found");
      return;
    }
    setSelectedEstimate({ id: estimateId, amount: estimate.amount });
    setShowCashPaymentModal(true);
  };

  const handleCashPaymentComplete = () => {
    if (selectedEstimate) {
      // Create payment notification
      createPaymentNotification("estimate", selectedEstimate.id);
      
      // Convert estimate to invoice after successful payment
      const conversionResult = convertEstimateToInvoice(selectedEstimate.id);
      if (conversionResult.success) {
        toast.success("Payment completed. Estimate converted to Invoice.");
      } else {
        toast.success("Payment completed");
        console.error("Failed to convert estimate to invoice:", conversionResult.error);
      }
    }
    setShowCashPaymentModal(false);
    setSelectedEstimate(null);
  };

  const handleCashPaymentClose = () => {
    setShowCashPaymentModal(false);
    setSelectedEstimate(null);
  };


  const handleMenuAction = (action: string, estimateId: string) => {
    switch (action) {
      case "preview":
        const estimate = mockEstimates.find(est => est.id === estimateId);
        if (estimate) {
          setPreviewEstimate(estimate);
          setShowPreviewModal(true);
        }
        break;
      case "send-email":
        const emailEstimate = mockEstimates.find(est => est.id === estimateId);
        if (emailEstimate) {
          const customer = mockCustomers.find(c => c.id === emailEstimate.customerId);
          setSelectedEstimateForAction({
            ...emailEstimate,
            customerEmail: customer?.email || "",
            customerPhone: customer?.phone || "",
            customerName: emailEstimate.customerName,
          });
          setShowEmailModal(true);
        }
        break;
      case "send-sms":
        const smsEstimate = mockEstimates.find(est => est.id === estimateId);
        if (smsEstimate) {
          const customer = mockCustomers.find(c => c.id === smsEstimate.customerId);
          setSelectedEstimateForAction({
            ...smsEstimate,
            customerEmail: customer?.email || "",
            customerPhone: customer?.phone || "",
            customerName: smsEstimate.customerName,
          });
          setShowSMSModal(true);
        }
        break;
      case "edit":
        navigate(`/estimates/${estimateId}/edit`);
        break;
      case "share-address":
        const shareEstimate = mockEstimates.find(est => est.id === estimateId);
        if (shareEstimate) {
          const customer = mockCustomers.find(c => c.id === shareEstimate.customerId);
          setSelectedEstimateForAction({
            ...shareEstimate,
            jobAddress: customer?.address || "No address available",
          });
          setShowShareAddressModal(true);
        }
        break;
      case "add-note":
        setSelectedEstimateForNote(estimateId);
        setShowNoteModal(true);
        break;
      case "reassign":
        const reassignEstimate = mockEstimates.find(est => est.id === estimateId);
        if (reassignEstimate) {
          setSelectedEstimateForAction({
            ...reassignEstimate,
            currentEmployeeId: reassignEstimate.customerId, // Using customerId as placeholder for employeeId
          });
          setShowReassignModal(true);
        }
        break;
      case "doc-history":
        const docEstimate = mockEstimates.find(est => est.id === estimateId);
        if (docEstimate) {
          // Navigate to customer profile
          navigate(`/customers/${docEstimate.customerId}`);
        }
        break;
      case "deactivate":
        setDeactivatedEstimates(prev => new Set(prev).add(estimateId));
        toast.success("Estimate deactivated");
        break;
      case "refund":
        toast.success("Processing refund...");
        break;
      case "convert-to-invoice":
        const convertEstimate = mockEstimates.find(est => est.id === estimateId);
        if (convertEstimate) {
          const customer = mockCustomers.find(c => c.id === convertEstimate.customerId);
          // Find employee by name if employeeName exists, otherwise use first employee
          const employee = (convertEstimate as any).employeeName
            ? mockEmployees.find(emp => emp.name === (convertEstimate as any).employeeName)
            : mockEmployees[0];

          // Get job address from estimate or customer address
          const jobAddress = (convertEstimate as any).jobAddress || customer?.address || "";

          // Convert estimate items to invoice items format
          // If estimate has items array, use it; otherwise create a single item from amount
          const estimateItems = (convertEstimate as any).items || [];
          const invoiceItems = estimateItems.length > 0
            ? estimateItems.map((item: any, index: number) => ({
              id: item.id || `item-${index}`,
              name: item.name || item.description || "Service Item",
              quantity: item.quantity || 1,
              price: item.price || item.rate || item.amount || 0,
              isCustom: !item.id,
            }))
            : [{
              id: `item-${convertEstimate.id}`,
              name: "Service Item",
              quantity: 1,
              price: convertEstimate.amount,
            }];

          navigate("/invoices/new", {
            state: {
              fromEstimate: true, // Flag to disable Recurring invoice type
              prefill: {
                customerId: convertEstimate.customerId,
                jobAddress: jobAddress,
                employeeId: employee?.id || mockEmployees[0]?.id || "1",
                items: invoiceItems,
                notes: (convertEstimate as any).notes || (convertEstimate as any).memo || "",
                termsAndConditions: (convertEstimate as any).termsAndConditions || (convertEstimate as any).terms || "",
                cancellationPolicy: (convertEstimate as any).cancellationPolicy || "",
                tax: (convertEstimate as any).taxRate || 0,
                discount: (convertEstimate as any).discount ?
                  (typeof (convertEstimate as any).discount === 'object' ? (convertEstimate as any).discount : null) : null,
                estimateId: estimateId, // Pass estimateId to track conversion
              }
            }
          });
        }
        break;
      case "create-new-estimate":
        const createEstimate = mockEstimates.find(est => est.id === estimateId);
        if (createEstimate) {
          const customer = mockCustomers.find(c => c.id === createEstimate.customerId);
          // Find employee by name if employeeName exists, otherwise use first employee
          const employee = (createEstimate as any).employeeName
            ? mockEmployees.find(emp => emp.name === (createEstimate as any).employeeName)
            : mockEmployees[0];

          navigate("/estimates/new", {
            state: {
              prefill: {
                customerId: createEstimate.customerId,
                jobAddress: (createEstimate as any).jobAddress || customer?.address || "",
                employeeId: employee?.id || mockEmployees[0]?.id || "1",
              }
            }
          });
        }
        break;
      case "view-invoice":
        // Get the invoice ID from the conversion mapping
        const estimateToInvoiceMap = JSON.parse(localStorage.getItem("estimateToInvoiceMap") || "{}");
        const invoiceId = estimateToInvoiceMap[estimateId];

        // If no mapping exists, try to find invoice by matching customer and amount
        // This handles cases where estimate was converted but mapping wasn't saved
        let invoice = invoiceId ? mockInvoices.find(inv => inv.id === invoiceId) : null;

        // If invoice not found by ID, try to find by matching estimate data
        if (!invoice) {
          const estimate = mockEstimates.find(est => est.id === estimateId);
          if (estimate) {
            // Try to find invoice with same customer and similar amount
            invoice = mockInvoices.find(inv =>
              inv.customerId === estimate.customerId &&
              Math.abs(inv.amount - estimate.amount) < 1
            );

            // If still not found, create a temporary invoice from estimate data
            if (!invoice) {
              invoice = {
                id: invoiceId || `INV-EST-${estimateId}`,
                customerId: estimate.customerId,
                customerName: estimate.customerName,
                issueDate: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                amount: estimate.amount,
                status: "Open" as const,
                paymentMethod: "Credit Card",
                type: "single" as const,
              };
            }
          }
        }

        if (invoice) {
          setPreviewInvoice(invoice);
          setShowInvoicePreview(true);
        } else {
          toast.error("Invoice not found for this estimate");
        }
        break;
      case "activate":
        setDeactivatedEstimates(prev => {
          const newSet = new Set(prev);
          newSet.delete(estimateId);
          return newSet;
        });

        // Log activity
        const activateEstimate = async () => {
          const { addActivityLog } = await import("@/services/activityLogService");
          const estimate = mockEstimates.find(e => e.id === estimateId);
          if (estimate) {
            addActivityLog({
              type: "estimate",
              action: "reactivated",
              documentId: estimate.id,
              customerName: estimate.customerName,
              amount: estimate.amount,
            });
          }
        };
        activateEstimate();

        toast.success("Estimate activated");
        break;
      case "pay-now":
        const payNowEstimate = mockEstimates.find(est => est.id === estimateId);
        if (payNowEstimate) {
          setSelectedEstimate({ id: estimateId, amount: payNowEstimate.amount });
          // Show info modal before proceeding to payment
          setShowEstimateToInvoiceInfoModal(true);
        }
        break;
      case "pay-cash":
        handlePayCash(estimateId);
        break;
      case "convert-to-job":
        const result = convertToJob("estimate", estimateId);
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

  const renderActionButtons = (estimate: typeof mockEstimates[0], type: string) => {
    if (type === "deactivated") {
      const items: KebabMenuItem[] = [
        {
          label: "Preview",
          icon: Eye,
          action: () => handleMenuAction("preview", estimate.id),
        },
        {
          label: "Activate",
          icon: RotateCcw,
          action: () => handleMenuAction("activate", estimate.id),
        },
      ];
      return <KebabMenu items={items} menuWidth="w-44" />;
    }

    if (estimate.status === "Paid") {
      // Check if estimate has already been converted to job
      const convertedEstimates = JSON.parse(localStorage.getItem("convertedEstimates") || "[]");
      const isConverted = estimate.status === "Converted to Job" || convertedEstimates.includes(estimate.id);

      const items: KebabMenuItem[] = [
        {
          label: "Preview",
          icon: Eye,
          action: () => handleMenuAction("preview", estimate.id),
        },
        // Only show "Convert to Job" if not already converted
        ...(!isConverted ? [{
          label: "Convert to Job",
          icon: Briefcase,
          action: () => handleMenuAction("convert-to-job", estimate.id),
        }] : []),
        {
          label: "Send Email",
          icon: Mail,
          action: () => handleMenuAction("send-email", estimate.id),
        },
        {
          label: "Send SMS",
          icon: MessageSquare,
          action: () => handleMenuAction("send-sms", estimate.id),
        },
      ];

      // Employees should NOT see sensitive admin actions on paid estimates
      if (!isEmployee) {
        items.push(
          {
            label: "Customer History",
            icon: History,
            action: () => handleMenuAction("doc-history", estimate.id),
          },
          {
            label: "Add Note",
            icon: StickyNote,
            action: () => handleMenuAction("add-note", estimate.id),
          },
          {
            label: "Reassign Employee",
            icon: UserCog,
            action: () => handleMenuAction("reassign", estimate.id),
          },
          {
            label: "Refund",
            icon: RotateCcw,
            action: () => handleMenuAction("refund", estimate.id),
            separator: true,
          }
        );
      }

      // Add "Create New Estimate" option for paid estimates
      items.push({
        label: "Create New Estimate",
        icon: FilePlus,
        action: () => handleMenuAction("create-new-estimate", estimate.id),
        separator: true,
      });

      return <KebabMenu items={items} menuWidth="w-48" />;
    }

    if (estimate.status === "Unpaid") {
      // Check if estimate has already been converted to job
      const convertedEstimates = JSON.parse(localStorage.getItem("convertedEstimates") || "[]");
      const isConverted = estimate.status === "Converted to Job" || convertedEstimates.includes(estimate.id);

      const items: KebabMenuItem[] = [
        {
          label: "Preview",
          icon: Eye,
          action: () => handleMenuAction("preview", estimate.id),
        },
        {
          label: "Pay Now",
          icon: CreditCard,
          action: () => handleMenuAction("pay-now", estimate.id),
        },
        {
          label: "Pay Cash",
          icon: DollarSign,
          action: () => handleMenuAction("pay-cash", estimate.id),
        },
        // Show "Convert to Job" if not already converted
        ...(!isConverted ? [{
          label: "Convert to Job",
          icon: Briefcase,
          action: () => handleMenuAction("convert-to-job", estimate.id),
        }] : []),
        {
          label: "Send Email",
          icon: Mail,
          action: () => handleMenuAction("send-email", estimate.id),
        },
        {
          label: "Send SMS",
          icon: MessageSquare,
          action: () => handleMenuAction("send-sms", estimate.id),
        },
      ];

      // Employees should NOT see sensitive admin actions on unpaid estimates
      if (!isEmployee) {
        items.push(
          {
            label: "Edit Estimate",
            icon: Edit,
            action: () => handleMenuAction("edit", estimate.id),
            separator: true,
          },
          {
            label: "Customer History",
            icon: History,
            action: () => handleMenuAction("doc-history", estimate.id),
          },
          {
            label: "Add Note",
            icon: StickyNote,
            action: () => handleMenuAction("add-note", estimate.id),
          },
          {
            label: "Reassign Employee",
            icon: UserCog,
            action: () => handleMenuAction("reassign", estimate.id),
          }
        );

        // Only show "Convert to Invoice" for Unpaid estimates (not already converted)
        if (estimate.status === "Unpaid") {
          items.push({
            label: "Convert to Invoice",
            icon: Receipt,
            action: () => handleMenuAction("convert-to-invoice", estimate.id),
            separator: true,
          });
        }

        items.push({
          label: "Deactivate",
          icon: XCircle,
          action: () => handleMenuAction("deactivate", estimate.id),
        });
      }

      return <KebabMenu items={items} menuWidth="w-56" />;
    }

    // Handle "Converted to Invoice" status - only show Preview Estimate and View Invoice
    if (estimate.status === "Converted to Invoice") {
      const items: KebabMenuItem[] = [
        {
          label: "Preview Estimate",
          icon: Eye,
          action: () => handleMenuAction("preview", estimate.id),
        },
        {
          label: "View Invoice",
          icon: Receipt,
          action: () => handleMenuAction("view-invoice", estimate.id),
        },
      ];

      return <KebabMenu items={items} menuWidth="w-56" />;
    }

    const items: KebabMenuItem[] = [
      {
        label: "Preview",
        icon: Eye,
        action: () => handleMenuAction("preview", estimate.id),
      },
      {
        label: "Send Email",
        icon: Mail,
        action: () => handleMenuAction("send-email", estimate.id),
      },
      {
        label: "Send SMS",
        icon: MessageSquare,
        action: () => handleMenuAction("send-sms", estimate.id),
      },
      {
        label: "Add Note",
        icon: StickyNote,
        action: () => handleMenuAction("add-note", estimate.id),
      },
      {
        label: "Reassign Employee",
        icon: UserCog,
        action: () => handleMenuAction("reassign", estimate.id),
      },
      {
        label: "Refund",
        icon: RotateCcw,
        action: () => handleMenuAction("refund", estimate.id),
        separator: true,
      },
    ];
    return <KebabMenu items={items} menuWidth="w-48" />;
  };

  // Calculate subtotal whenever selected services change
  useEffect(() => {
    const total = selectedServices.reduce((sum, service) => sum + (service.price * service.quantity), 0);
    setSubtotal(total);
  }, [selectedServices]);

  // Helper functions for step management
  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step validation functions
  const isStep1Valid = () => {
    return !!(newEstimateCustomer && newEstimateJobAddress && newEstimateEmployee);
  };

  const isStep2Valid = () => {
    return selectedServices.length > 0;
  };

  const isStep3Valid = () => {
    // Step 3 is always valid (optional fields)
    return true;
  };

  const isStep4Valid = () => {
    // Step 4 is always valid (optional fields)
    return true;
  };

  // Calculate tax
  const calculateTax = () => {
    const rate = parseFloat(taxRate) || 0;
    return subtotal * (rate / 100);
  };

  // Calculate total
  const calculateTotal = () => {
    const tax = calculateTax();
    const discountAmount = parseFloat(discount) || 0;
    return subtotal + tax - discountAmount;
  };

  // Service management functions
  const handleRemoveService = (index: number) => {
    setSelectedServices(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateServiceQuantity = (index: number, quantity: number) => {
    setSelectedServices(prev =>
      prev.map((service, idx) =>
        idx === index ? { ...service, quantity: Math.max(1, quantity) } : service
      )
    );
  };

  const handleAddExistingItem = (item: any) => {
    const existingIndex = selectedServices.findIndex(s => s.id === item.id);
    if (existingIndex >= 0) {
      // Item already exists, increment quantity
      handleUpdateServiceQuantity(existingIndex, selectedServices[existingIndex].quantity + 1);
      toast.success(`Increased quantity for ${item.name}`);
    } else {
      // Add new item
      setSelectedServices(prev => [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
        }
      ]);
      toast.success(`Added ${item.name}`);
    }
    setShowExistingItemModal(false);
  };

  const handleAddCustomItem = () => {
    if (!customItemName || !customItemPrice) {
      toast.error("Please enter item name and price");
      return;
    }

    const price = parseFloat(customItemPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setSelectedServices(prev => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: customItemName,
        price: price,
        quantity: 1,
      }
    ]);

    toast.success(`Added ${customItemName}`);
    setCustomItemName("");
    setCustomItemPrice("");
    setShowCustomItemModal(false);
  };

  // Mock inventory items for the dialog
  const mockInventoryItems = [
    { id: "inv-1", name: "Premium Cleaning Service", price: 150, type: "fixed", sku: "CLEAN-001", stock: 50 },
    { id: "inv-2", name: "Lawn Maintenance", price: 80, type: "perunit", unit: "hour", sku: "LAWN-001", stock: 30 },
    { id: "inv-3", name: "Plumbing Repair", price: 120, type: "variable", sku: "PLUMB-001", stock: 20 },
    { id: "inv-4", name: "Electrical Work", price: 100, type: "perunit", unit: "hour", sku: "ELEC-001", stock: 25 },
    { id: "inv-5", name: "Painting Service", price: 200, type: "fixed", sku: "PAINT-001", stock: 15 },
  ];

  const filteredInventoryItems = mockInventoryItems.filter(item =>
    item.name.toLowerCase().includes(existingItemSearch.toLowerCase()) ||
    item.sku.toLowerCase().includes(existingItemSearch.toLowerCase())
  );

  // Create Estimate function
  const handleCreateEstimate = () => {
    if (!isStep1Valid() || !isStep2Valid()) {
      toast.error("Please complete all required fields");
      return;
    }

    // Create new estimate object
    const newEstimate = {
      id: `EST-${Date.now()}`,
      customerId: newEstimateCustomer,
      customerName: mockCustomers.find(c => c.id === newEstimateCustomer)?.name || "Unknown Customer",
      jobAddress: newEstimateJobAddress,
      employeeId: newEstimateEmployee,
      employeeName: mockEmployees.find(e => e.id === newEstimateEmployee)?.name || "Unassigned",
      amount: calculateTotal(),
      status: "Unpaid" as const,
      issueDate: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };

    // Add new estimate to the top of the list
    setAllEstimates([newEstimate, ...allEstimates]);

    // Show success toast
    toast.success("Estimate created successfully!");
    
    // Reset form
    setCurrentStep(1);
    setNewEstimateCustomer("");
    setNewEstimateJobAddress("");
    setNewEstimateEmployee("");
    setSelectedServices([]);
    setDiscount("");
    setShowDiscount(false);
    setEstimateNotes("");
    setEstimateAttachments([]);
    setTermsConditions("");
    setCancellationPolicy("");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <TabletHeader
        title="Estimates"
        actions={
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 tablet:hidden" onClick={() => navigate("/estimates/new")}>
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      {/* Mobile Layout */}
      <div className="flex-1 overflow-y-auto scrollable px-3 pb-4 space-y-3 tablet:hidden" style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top) + 0.5rem)' }}>
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search estimates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm py-2"
            />
          </div>
        </div>

        {/* Status Tabs - Hidden for employees */}
        {!isEmployee ? (
          <Tabs
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="space-y-3"
          >
            <TabsList className="w-full grid grid-cols-2 h-9">
              <TabsTrigger value="activate" className="text-xs py-1.5 px-2">Activate</TabsTrigger>
              <TabsTrigger value="deactivated" className="text-xs py-1.5 px-2">Deactivated</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-1.5">
              {(() => {
                const estimates = filteredEstimates;
                const showFilters = statusFilter !== "deactivated";

                return (
                  <div className="space-y-2.5">
                    {showFilters && (
                      <div className="flex gap-2">
                        <div className="flex-1 min-w-0">
                          <Select value={statusFilterValue} onValueChange={setStatusFilterValue}>
                            <SelectTrigger className="w-full h-9 text-xs py-2 px-3">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="Paid">Paid</SelectItem>
                              <SelectItem value="Unpaid">Unpaid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {estimates.length > 0 ? (
                      <div className="space-y-2">
                        {estimates.map(estimate => (
                          <EstimateCard
                            key={estimate.id}
                            estimate={estimate}
                            onClick={() => navigate(`/estimates/${estimate.id}`)}
                            payButton={
                              statusFilter === "activate" && estimate.status === "Unpaid" ? (
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-auto min-h-0 px-2 py-1 text-xs font-semibold whitespace-nowrap bg-primary hover:bg-primary/90 rounded-xl shadow-sm hover:shadow-md transition-all leading-tight"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePayNow(estimate.id, e);
                                  }}
                                >
                                  Pay
                                </Button>
                              ) : undefined
                            }
                            actionButtons={renderActionButtons(estimate, statusFilter)}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={<FileText className="h-8 w-8 text-muted-foreground" />}
                        title="No estimates found"
                        description="Try adjusting your search or filters"
                        actionLabel="Create Estimate"
                        onAction={() => navigate("/estimates/new")}
                      />
                    )}
                  </div>
                );
              })()}
            </TabsContent>
          </Tabs>
        ) : (
          // Employee view: No tabs, just the list with filters
          <div className="space-y-2.5">
            {/* Status Filter */}
            <div className="flex gap-2">
              <div className="flex-1 min-w-0">
                <Select value={statusFilterValue} onValueChange={setStatusFilterValue}>
                  <SelectTrigger className="w-full h-9 text-xs py-2 px-3">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Estimates List */}
            {filteredEstimates.length > 0 ? (
              <div className="space-y-2">
                {filteredEstimates.map(estimate => (
                  <EstimateCard
                    key={estimate.id}
                    estimate={estimate}
                    onClick={() => navigate(`/estimates/${estimate.id}`)}
                    payButton={
                      estimate.status === "Unpaid" ? (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-auto min-h-0 px-2 py-1 text-xs font-semibold whitespace-nowrap bg-primary hover:bg-primary/90 rounded-xl shadow-sm hover:shadow-md transition-all leading-tight"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayNow(estimate.id, e);
                          }}
                        >
                          Pay
                        </Button>
                      ) : undefined
                    }
                    actionButtons={renderActionButtons(estimate, "activate")}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FileText className="h-8 w-8 text-muted-foreground" />}
                title="No estimates found"
                description="Try adjusting your search or filters"
                actionLabel="Create Estimate"
                onAction={() => navigate("/estimates/new")}
              />
            )}
          </div>
        )}
      </div>

      {/* Tablet Layout: Two-column grid */}
      <div className="hidden tablet:flex tablet:flex-1 tablet:overflow-hidden">
        {/* Left Panel: Add Estimate - Tablet Only */}
        <aside className="tablet:w-[40%] bg-gray-50/80 border-r overflow-y-auto flex flex-col" style={{ contain: 'layout style paint' }}>
          <div className="sticky top-0 bg-gray-50/95 border-b px-4 py-3 z-10" style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-foreground">Add Estimate</h3>
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
                      {step === 1 && 'Customer'}
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
          <div className="flex-1 overflow-y-auto px-4 py-4" style={{ contain: 'layout style paint' }}>
            {/* Step 1: Customer & Job Details */}
            {currentStep === 1 && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer *</label>
                  <Select value={newEstimateCustomer} onValueChange={setNewEstimateCustomer}>
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
                    value={newEstimateJobAddress}
                    onChange={(e) => setNewEstimateJobAddress(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Select Employee *</label>
                  <Select value={newEstimateEmployee} onValueChange={setNewEstimateEmployee}>
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
              </div>
            )}

            {/* Step 2: Select Service */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="pb-2 border-b">
                  <h4 className="text-sm font-semibold text-foreground">Step 2 of 4: Services</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Add items to your estimate</p>
                </div>

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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-semibold text-foreground uppercase tracking-wide">Selected Items</h5>
                    {selectedServices.length > 0 && (
                      <span className="text-xs text-muted-foreground">({selectedServices.length} {selectedServices.length === 1 ? 'item' : 'items'})</span>
                    )}
                  </div>

                  {selectedServices.length === 0 ? (
                    <div className="bg-gray-100 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No items added yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Use the buttons above to add items</p>
                    </div>
                  ) : (
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

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Order Summary</div>
                  <div className="bg-background rounded border p-3 space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>

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

                    {showDiscount && discount && parseFloat(discount) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium text-destructive">-${parseFloat(discount).toFixed(2)}</span>
                      </div>
                    )}

                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="text-sm font-semibold text-foreground">Total</span>
                      <span className="text-lg font-bold text-primary">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</label>
                  <div className="relative">
                    <textarea
                      placeholder="Add any notes or special instructions…"
                      value={estimateNotes}
                      onChange={(e) => setEstimateNotes(e.target.value)}
                      className="w-full min-h-[80px] px-3 py-2 pb-10 text-sm rounded-md border border-input bg-background resize-none"
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-2">
                      {estimateAttachments.length > 0 && (
                        <span className="text-xs text-primary font-medium">
                          {estimateAttachments.length} file{estimateAttachments.length > 1 ? 's' : ''}
                        </span>
                      )}
                      <label
                        htmlFor="estimate-attachment"
                        className="cursor-pointer p-1.5 rounded hover:bg-primary/10 transition-colors group"
                        title="Attach file or image"
                      >
                        <Camera className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <input
                          id="estimate-attachment"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,application/pdf"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              const newFiles = Array.from(e.target.files);
                              const validFiles = newFiles.filter(file => {
                                const maxSize = 10 * 1024 * 1024;
                                if (file.size > maxSize) {
                                  toast.error(`${file.name} exceeds 10MB limit`);
                                  return false;
                                }
                                return true;
                              });
                              setEstimateAttachments(prev => [...prev, ...validFiles]);
                              if (validFiles.length > 0) {
                                toast.success(`${validFiles.length} file(s) attached`);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  {estimateAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {estimateAttachments.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 px-2 py-1 bg-primary/5 border border-primary/20 rounded text-xs"
                        >
                          <span className="text-muted-foreground truncate max-w-[120px]">{file.name}</span>
                          <button
                            onClick={() => {
                              setEstimateAttachments(prev => prev.filter((_, i) => i !== idx));
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
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Terms & Conditions</label>
                  <textarea
                    placeholder="Enter terms and conditions..."
                    value={termsConditions}
                    onChange={(e) => setTermsConditions(e.target.value)}
                    className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y"
                  />
                </div>

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
                  onClick={handleCreateEstimate}
                  className="flex-1 h-9 text-sm font-medium"
                  disabled={!isStep4Valid()}
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  Create Estimate
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* Right Panel: Estimate List */}
        <div className="flex-1 overflow-y-auto scrollable bg-gray-50/50 px-6 py-4" style={{ contain: 'layout style paint' }}>
          <div className="max-w-5xl mx-auto space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search estimates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* Status Tabs - Hidden for employees */}
            {!isEmployee ? (
              <Tabs
                value={statusFilter}
                onValueChange={setStatusFilter}
                className="space-y-3"
              >
                <TabsList className="w-full grid grid-cols-2 h-9">
                  <TabsTrigger value="activate" className="text-xs py-1.5 px-2">Activate</TabsTrigger>
                  <TabsTrigger value="deactivated" className="text-xs py-1.5 px-2">Deactivated</TabsTrigger>
                </TabsList>

                <TabsContent value={statusFilter} className="mt-1.5">
                  {(() => {
                    const estimates = filteredEstimates;
                    const showFilters = statusFilter !== "deactivated";

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
                              <Select value={statusFilterValue} onValueChange={setStatusFilterValue}>
                                <SelectTrigger className="w-full h-9 text-xs py-2 px-3">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Statuses</SelectItem>
                                  <SelectItem value="Paid">Paid</SelectItem>
                                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        {estimates.length > 0 ? (
                          <div className="space-y-2">
                            {estimates.map(estimate => (
                              <EstimateCard
                                key={estimate.id}
                                estimate={estimate}
                                onClick={() => navigate(`/estimates/${estimate.id}`)}
                                payButton={
                                  statusFilter === "activate" && estimate.status === "Unpaid" ? (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="h-auto min-h-0 px-2 py-1 text-xs font-semibold whitespace-nowrap bg-primary hover:bg-primary/90 rounded-xl shadow-sm hover:shadow-md transition-all leading-tight"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePayNow(estimate.id, e);
                                      }}
                                    >
                                      Pay
                                    </Button>
                                  ) : undefined
                                }
                                actionButtons={renderActionButtons(estimate, statusFilter)}
                              />
                            ))}
                          </div>
                        ) : (
                          <EmptyState
                            icon={<FileText className="h-8 w-8 text-muted-foreground" />}
                            title="No estimates found"
                            description="Try adjusting your search or filters"
                            actionLabel="Create Estimate"
                            onAction={() => navigate("/estimates/new")}
                          />
                        )}
                      </div>
                    );
                  })()}
                </TabsContent>
              </Tabs>
            ) : (
              // Employee view: No tabs, just the list with filters
              <div className="space-y-2.5">
                {/* Status Filter */}
                <div className="flex gap-2">
                  <div className="flex-1 min-w-0">
                    <Select value={statusFilterValue} onValueChange={setStatusFilterValue}>
                      <SelectTrigger className="w-full h-9 text-xs py-2 px-3">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Estimates List */}
                {filteredEstimates.length > 0 ? (
                  <div className="space-y-2">
                    {filteredEstimates.map(estimate => (
                      <EstimateCard
                        key={estimate.id}
                        estimate={estimate}
                        onClick={() => navigate(`/estimates/${estimate.id}`)}
                        payButton={
                          estimate.status === "Unpaid" ? (
                            <Button
                              size="sm"
                              variant="default"
                              className="h-auto min-h-0 px-2 py-1 text-xs font-semibold whitespace-nowrap bg-primary hover:bg-primary/90 rounded-xl shadow-sm hover:shadow-md transition-all leading-tight"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePayNow(estimate.id, e);
                              }}
                            >
                              Pay
                            </Button>
                          ) : undefined
                        }
                        actionButtons={renderActionButtons(estimate, statusFilter)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<FileText className="h-8 w-8 text-muted-foreground" />}
                    title="No estimates found"
                    description="Try adjusting your search or filters"
                    actionLabel="Create Estimate"
                    onAction={() => navigate("/estimates/new")}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Existing Item Modal */}
      <Dialog open={showExistingItemModal} onOpenChange={setShowExistingItemModal}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Existing Item</DialogTitle>
            <DialogDescription>
              Search and select items from your inventory to add to this estimate.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={existingItemSearch}
                onChange={(e) => setExistingItemSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

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

            <div className="flex-1 overflow-y-auto space-y-2 pr-2" style={{ contain: 'layout style' }}>
              {filteredInventoryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAddExistingItem(item)}
                  className="w-full text-left p-3 bg-background border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                          {item.type === 'fixed' ? 'F' : item.type === 'variable' ? 'V' : 'U'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                      <p className="text-xs text-muted-foreground">Stock: {item.stock}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-primary">${item.price.toFixed(2)}</p>
                      {item.type === 'perunit' && (
                        <p className="text-xs text-muted-foreground">/{item.unit}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {filteredInventoryItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No items found</p>
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
              Create a custom item for this estimate.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Item Name *</label>
              <Input
                placeholder="Enter item name"
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Price *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={customItemPrice}
                  onChange={(e) => setCustomItemPrice(e.target.value)}
                  className="pl-9 h-9"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCustomItemModal(false);
                  setCustomItemName("");
                  setCustomItemPrice("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCustomItem}
                className="flex-1"
              >
                Add Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Inventory Modal */}
      <Dialog open={showInventoryModal} onOpenChange={setShowInventoryModal}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Inventory</DialogTitle>
            <DialogDescription>
              Browse inventory items to add to this estimate.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {mockInventoryItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleAddExistingItem(item)}
                className="w-full text-left p-3 bg-background border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                        {item.type === 'fixed' ? 'F' : item.type === 'variable' ? 'V' : 'U'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                    <p className="text-xs text-muted-foreground">Stock: {item.stock}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-primary">${item.price.toFixed(2)}</p>
                    {item.type === 'perunit' && (
                      <p className="text-xs text-muted-foreground">/{item.unit}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Estimate to Invoice Info Modal */}
      <EstimateToInvoiceInfoModal
        isOpen={showEstimateToInvoiceInfoModal}
        onClose={() => {
          setShowEstimateToInvoiceInfoModal(false);
          setSelectedEstimate(null);
        }}
        onContinue={handleContinueToPayment}
      />

      {/* Payment Modal */}
      {selectedEstimate && (
        <>
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedEstimate(null);
            }}
            amount={selectedEstimate.amount}
            onPaymentMethodSelect={handlePaymentMethodSelect}
          />
          <CashPaymentModal
            isOpen={showCashPaymentModal}
            onClose={handleCashPaymentClose}
            onBack={handleCashPaymentClose}
            amount={selectedEstimate.amount}
            onPaymentComplete={handleCashPaymentComplete}
          />
        </>
      )}

      {/* Preview Estimate Modal */}
      {previewEstimate && (
        <PreviewEstimateModal
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewEstimate(null);
          }}
          estimate={previewEstimate}
          onAction={(action) => {
            if (action === "pay-now") {
              setShowPreviewModal(false);
              setSelectedEstimate({ id: previewEstimate.id, amount: previewEstimate.amount });
              // Show info modal before proceeding to payment
              setShowEstimateToInvoiceInfoModal(true);
            } else if (action === "edit") {
              navigate(`/estimates/${previewEstimate.id}/edit`);
              setShowPreviewModal(false);
            } else {
              handleMenuAction(action, previewEstimate.id);
            }
          }}
        />
      )}

      {/* Send Email Modal */}
      {selectedEstimateForAction && (
        <SendEmailModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedEstimateForAction(null);
          }}
          customerEmail={selectedEstimateForAction.customerEmail}
          customerName={selectedEstimateForAction.customerName}
        />
      )}

      {/* Send SMS Modal */}
      {selectedEstimateForAction && (
        <SendSMSModal
          isOpen={showSMSModal}
          onClose={() => {
            setShowSMSModal(false);
            setSelectedEstimateForAction(null);
          }}
          customerPhone={selectedEstimateForAction.customerPhone || ""}
          customerCountryCode="+1"
          entityId={selectedEstimateForAction.id}
          entityType="estimate"
          customerName={selectedEstimateForAction.customerName}
        />
      )}

      {/* Reassign Employee Modal */}
      {selectedEstimateForAction && (
        <ReassignEmployeeModal
          isOpen={showReassignModal}
          onClose={() => {
            setShowReassignModal(false);
            setSelectedEstimateForAction(null);
          }}
          currentEmployeeId={selectedEstimateForAction.currentEmployeeId}
          estimateId={selectedEstimateForAction.id}
        />
      )}

      {/* Share Address Modal */}
      {selectedEstimateForAction && (
        <ShareAddressModal
          isOpen={showShareAddressModal}
          onClose={() => {
            setShowShareAddressModal(false);
            setSelectedEstimateForAction(null);
          }}
          jobAddress={selectedEstimateForAction.jobAddress}
          estimateId={selectedEstimateForAction.id}
        />
      )}

      {/* Document Note Modal */}
      {selectedEstimateForNote && (() => {
        const estimate = mockEstimates.find(est => est.id === selectedEstimateForNote);
        if (!estimate) return null;
        return (
          <DocumentNoteModal
            open={showNoteModal}
            onClose={() => {
              setShowNoteModal(false);
              setSelectedEstimateForNote(null);
            }}
            documentId={selectedEstimateForNote}
            documentType="estimate"
            customerId={estimate.customerId}
            customerName={estimate.customerName}
            onNoteAdded={() => {
              // Optionally refresh estimate data or show updated notes
            }}
          />
        );
      })()}

      {/* Preview Invoice Modal */}
      {previewInvoice && (
        <PreviewInvoiceModal
          isOpen={showInvoicePreview}
          onClose={() => {
            setShowInvoicePreview(false);
            setPreviewInvoice(null);
          }}
          invoice={previewInvoice}
          onAction={(action) => {
            if (action === "close" || action === "edit") {
              setShowInvoicePreview(false);
              setPreviewInvoice(null);
            }
          }}
        />
      )}

      {/* Date Range Picker Modal */}
      <DateRangePickerModal
        open={showDateRangePicker}
        onOpenChange={setShowDateRangePicker}
        initialRange={dateRange}
        onConfirm={handleDateRangeConfirm}
        resetToToday={false}
      />
    </div>
  );
};

export default Estimates;
