import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
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
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { createPaymentNotification } from "@/services/notificationService";
import { convertToJob } from "@/services/jobConversionService";
import { getAllInvoices, type Invoice as InvoiceType } from "@/services/invoiceService";

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
        toast.success("Invoice deactivated");
        break;
      case "activate":
        toast.success("Invoice activated");
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
        // "Convert to Job" should only appear for Paid invoices, not Unpaid
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
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader 
        title="Invoices"
        showBack={true}
        actions={
          <Button size="sm" className="h-8 w-8 p-0" onClick={() => navigate("/invoices/new")}>
            <Plus className="h-4 w-4" />
          </Button>
        }
      />
      
      <div className="flex-1 overflow-y-auto scrollable px-3 pb-4 space-y-3" style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top) + 0.5rem)' }}>
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
    </div>
  );
};

export default Invoices;
