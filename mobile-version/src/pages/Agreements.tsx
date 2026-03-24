import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import MinimumDepositPercentageModal from "@/components/modals/MinimumDepositPercentageModal";
import { DocumentVerificationModal } from "@/components/modals/DocumentVerificationModal";
import InvoicePaymentModal from "@/components/modals/InvoicePaymentModal";
import SendSMSModal from "@/components/modals/SendSMSModal";
import SendEmailModal from "@/components/modals/SendEmailModal";
import DateRangePickerModal from "@/components/modals/DateRangePickerModal";
import ScheduleServiceModal from "@/components/modals/ScheduleServiceModal";
import AssignToJobModal from "@/components/modals/AssignToJobModal";
import { mockAgreements, mockCustomers, mockEmployees } from "@/data/mobileMockData";
import { cn } from "@/lib/utils";
import { createJobLookupMap } from "@/utils/jobLookup";
import { Plus, Calendar, Percent, Eye, Mail, MessageSquare, Edit, CreditCard, FilePlus, Briefcase, Search, Calendar as CalendarIcon, Link, Receipt } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { createPaymentNotification } from "@/services/notificationService";
import { convertToJob } from "@/services/jobConversionService";
import { convertAgreementToInvoice } from "@/services/agreementToInvoiceService";
import { applyPayment } from "@/services/invoiceService";

type AgreementStatus = "open" | "converted_to_invoice";

type Agreement = (typeof mockAgreements)[number] & {
  status: AgreementStatus;
  invoice_id?: string | null;
  amount_paid?: number;
  balance_due?: number;
  workflow_status?: string;
  paymentMethod?: string;
};

const AGREEMENT_STORAGE_KEY = "servicepro_agreements";
const LEGACY_AGREEMENT_STORAGE_KEY = "mockAgreements";

const Agreements = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AgreementStatus>("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showDocumentVerificationModal, setShowDocumentVerificationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);
  const [selectedAgreementAmount, setSelectedAgreementAmount] = useState<number>(0);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [selectedAgreementForSms, setSelectedAgreementForSms] = useState<{ id: string; customerId: string; customerPhone?: string; customerName?: string } | null>(null);
  const [selectedAgreementForEmail, setSelectedAgreementForEmail] = useState<{ id: string; customerId: string; customerEmail?: string; customerName?: string } | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [agreementToConvert, setAgreementToConvert] = useState<Agreement | null>(null);
  const [showAssignToJobModal, setShowAssignToJobModal] = useState(false);
  const [agreementForAssignJob, setAgreementForAssignJob] = useState<Agreement | null>(null);
  const [jobLookupRefreshKey, setJobLookupRefreshKey] = useState(0);
  const [allAgreements, setAllAgreements] = useState<Agreement[]>([]);

  // Get user role
  const userType = typeof window !== "undefined" ? localStorage.getItem("userType") || "merchant" : "merchant";
  const isEmployee = userType === "employee";

  // Date range filtering helper
  const isWithinDateRange = (dateString: string) => {
    if (!dateRange.from && !dateRange.to) return true;
    
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    
    if (dateRange.from && dateRange.to) {
      const start = new Date(dateRange.from);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateRange.to);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    } else if (dateRange.from) {
      const start = new Date(dateRange.from);
      start.setHours(0, 0, 0, 0);
      return date >= start;
    } else if (dateRange.to) {
      const end = new Date(dateRange.to);
      end.setHours(23, 59, 59, 999);
      return date <= end;
    }
    return true;
  };

  const handleDateRangeConfirm = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
    setShowDateRangePicker(false);
  };

  const normalizeAgreementStatus = (agreement: any): AgreementStatus => {
    const normalizedStatus = String(agreement?.status || "").trim().toLowerCase();
    const normalizedWorkflowStatus = String(agreement?.workflow_status || "").trim().toLowerCase();

    if (
      agreement?.invoice_id ||
      normalizedStatus === "converted to invoice" ||
      normalizedStatus === "converted_to_invoice" ||
      normalizedStatus === "paid" ||
      normalizedStatus === "partial" ||
      normalizedWorkflowStatus === "converted_to_invoice"
    ) {
      return "converted_to_invoice";
    }

    return "open";
  };

  const hasExplicitConvertedMarker = (agreement: any) => {
    const normalizedStatus = String(agreement?.status || "").trim().toLowerCase();
    const normalizedWorkflowStatus = String(agreement?.workflow_status || "").trim().toLowerCase();
    return (
      normalizedStatus === "converted to invoice" ||
      normalizedStatus === "converted_to_invoice" ||
      normalizedWorkflowStatus === "converted_to_invoice"
    );
  };

  const loadAgreements = () => {
    const serviceAgreements = JSON.parse(localStorage.getItem(AGREEMENT_STORAGE_KEY) || "[]");
    const legacyAgreements = JSON.parse(localStorage.getItem(LEGACY_AGREEMENT_STORAGE_KEY) || "[]");
    const merged = [...mockAgreements, ...legacyAgreements, ...serviceAgreements];
    const unique = new Map<string, Agreement>();

    merged.forEach((agreement: Agreement) => {
      const totalAmount = Math.max(0, Number((agreement as any).total_amount ?? agreement.monthlyAmount ?? (agreement as any).amount ?? 0));
      const normalizedPaidAmount = Math.min(totalAmount, Math.max(0, Number(agreement.amount_paid ?? (agreement as any).paidAmount ?? 0)));
      const normalizedStatus = normalizeAgreementStatus(agreement);
      if (normalizedStatus === "converted_to_invoice" && !agreement.invoice_id && hasExplicitConvertedMarker(agreement)) {
        console.error(`[Agreements] Converted agreement ${agreement.id} is missing invoice_id`);
      }

      unique.set(agreement.id, {
        ...unique.get(agreement.id),
        ...agreement,
        status: normalizedStatus,
        workflow_status: normalizedStatus,
        amount_paid: normalizedPaidAmount,
        balance_due: Math.max(0, totalAmount - normalizedPaidAmount),
      });
    });

    setAllAgreements(Array.from(unique.values()));
  };

  useEffect(() => {
    loadAgreements();
  }, []);

  const isAgreementConvertedToInvoice = (agreement: Agreement) => {
    return normalizeAgreementStatus(agreement) === "converted_to_invoice";
  };

  const getAgreementDisplayStatus = (agreement: Agreement) => {
    return agreement.status === "converted_to_invoice" ? "Converted to Invoice" : "Open";
  };

  const handleViewInvoice = async (agreement: Agreement) => {
    const linkedInvoiceId = agreement.invoice_id;
    if (!linkedInvoiceId) {
      console.error(`[Agreements] Missing invoice_id for converted agreement ${agreement.id}`);
      toast.error("Linked invoice not found");
      return;
    }
    navigate(`/invoices/${linkedInvoiceId}`);
  };

  // Create job lookup map for agreements (refreshes after job assignment)
  const agreementJobLookup = useMemo(() => createJobLookupMap("agreement"), [jobLookupRefreshKey]);

  // Filter agreements
  const filteredAgreements = allAgreements.filter(agreement => {
    // Search filter - by agreement ID or customer name
    const matchesSearch = search === "" || 
      agreement.id.toLowerCase().includes(search.toLowerCase()) ||
      agreement.customerName.toLowerCase().includes(search.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all" || agreement.status === statusFilter;

    // Date range filter - check start date
    const matchesDateRange = isWithinDateRange(agreement.startDate);

    return matchesSearch && matchesStatus && matchesDateRange;
  }).sort((a, b) => {
    if (a.status === "open" && b.status !== "open") return -1;
    if (a.status !== "open" && b.status === "open") return 1;

    const dateA = new Date((a as any).created_at || (a as any).createdAt || a.startDate || 0).getTime();
    const dateB = new Date((b as any).created_at || (b as any).createdAt || b.startDate || 0).getTime();
    return dateB - dateA;
  });

  const handlePayNow = (agreementId: string) => {
    const agreement = allAgreements.find(a => a.id === agreementId);
    if (!agreement) return;
    if (isAgreementConvertedToInvoice(agreement)) {
      void handleViewInvoice(agreement);
      return;
    }

    setSelectedAgreementId(agreementId);
    setSelectedAgreementAmount(agreement.balance_due || agreement.monthlyAmount || 0);
    setSelectedAgreement(agreement);
    setShowDocumentVerificationModal(true);
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

  const handlePaymentComplete = async (method: string, amount: number) => {
    if (!selectedAgreementId) return;

    const conversionResult = await convertAgreementToInvoice(selectedAgreementId);
    if (!conversionResult.success || !conversionResult.invoiceId) {
      toast.error(conversionResult.error || "Failed to convert agreement to invoice");
      return;
    }

    const updatedInvoice = await applyPayment(conversionResult.invoiceId, "invoice", amount, method);
    if (!updatedInvoice) {
      toast.error("Failed to apply payment to invoice");
      return;
    }

    createPaymentNotification("invoice", conversionResult.invoiceId);
    loadAgreements();
    setShowPaymentModal(false);
    setSelectedAgreementId(null);
    setSelectedAgreementAmount(0);
    setSelectedAgreement(null);
    toast.success(`Agreement converted to invoice. Payment of $${amount.toFixed(2)} applied to ${conversionResult.invoiceId}`);
    navigate(`/invoices/${conversionResult.invoiceId}`);
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
      case "view-invoice":
        const agreementForInvoice = allAgreements.find(a => a.id === agreementId);
        if (agreementForInvoice) {
          void handleViewInvoice(agreementForInvoice);
        }
        break;
      case "send-email":
        const agreementForEmail = allAgreements.find(a => a.id === agreementId);
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
        const agreement = allAgreements.find(a => a.id === agreementId);
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
        const createAgreement = allAgreements.find(ag => ag.id === agreementId);
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
        const agreementForConversion = allAgreements.find(a => a.id === agreementId);
        if (agreementForConversion) {
          setAgreementToConvert(agreementForConversion);
          setShowScheduleModal(true);
        }
        break;
      case "assign-to-job":
        const agreementForAssign = allAgreements.find(a => a.id === agreementId);
        if (agreementForAssign) {
          setAgreementForAssignJob(agreementForAssign);
          setShowAssignToJobModal(true);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader
        title="Agreements"
        actions={
          <div className="flex items-center gap-1.5">
            {!isEmployee && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs font-medium"
                onClick={() => setShowDepositModal(true)}
              >
                <Percent className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Min Deposit</span>
              </Button>
            )}
            <Button size="sm" className="h-8 w-8 p-0" onClick={() => navigate("/agreements/new")}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div
        className="flex-1 overflow-y-auto scrollable px-3 pb-4 space-y-3"
        style={{ paddingTop: "calc(3rem + env(safe-area-inset-top) + 0.5rem)" }}
      >
        {/* Search Field */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search agreements…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm py-2"
          />
        </div>

        {/* Date Range & Status Filter Row */}
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
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | AgreementStatus)}>
              <SelectTrigger className="w-full h-9 text-xs py-2 px-3">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="converted_to_invoice">Converted to Invoice</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Agreements List */}
        <div className="space-y-2">
          {filteredAgreements.map(agreement => {
            const displayStatus = getAgreementDisplayStatus(agreement);
            const isConvertedToInvoice = isAgreementConvertedToInvoice(agreement);
            const isOpenAgreement = agreement.status === "open";

            // Check if agreement has already been converted to job using lookup map
            const hasAssociatedJob = agreementJobLookup.has(agreement.id);
            const isConverted = hasAssociatedJob ||
              agreement.status?.toLowerCase() === "job created / converted" ||
              agreement.status?.toLowerCase() === "job created" ||
              agreement.status?.toLowerCase() === "converted";

            // Build menu items based on payment status and user role
            const kebabMenuItems: KebabMenuItem[] = isConvertedToInvoice
              ? [
                { label: "Preview", icon: Eye, action: () => handleMenuAction(agreement.id, "preview") },
                ...(agreement.invoice_id ? [{ label: "View Invoice", icon: Receipt, action: () => handleMenuAction(agreement.id, "view-invoice") }] : []),
                ...(!isConverted ? [{ label: "Convert to Job", icon: Briefcase, action: () => handleMenuAction(agreement.id, "convert-to-job") }] : []),
                ...(!hasAssociatedJob ? [{ label: "Assign to Job", icon: Link, action: () => handleMenuAction(agreement.id, "assign-to-job") }] : []),
                { label: "Create New Agreement", icon: FilePlus, action: () => handleMenuAction(agreement.id, "create-new-agreement"), separator: true },
              ]
              : [
                // Open agreements: Preview, Convert to Job, Assign to Job, Send Email/SMS, Edit
                { label: "Preview", icon: Eye, action: () => handleMenuAction(agreement.id, "preview") },
                ...(!isConverted ? [{ label: "Convert to Job", icon: Briefcase, action: () => handleMenuAction(agreement.id, "convert-to-job") }] : []),
                ...(!hasAssociatedJob ? [{ label: "Assign to Job", icon: Link, action: () => handleMenuAction(agreement.id, "assign-to-job") }] : []),
                { label: "Send Email", icon: Mail, action: () => handleMenuAction(agreement.id, "send-email") },
                { label: "Send SMS", icon: MessageSquare, action: () => handleMenuAction(agreement.id, "send-sms") },
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
                className={cn(
                  "px-3 py-2 rounded-lg border bg-card active:scale-[0.98] transition-transform cursor-pointer",
                  isOpenAgreement
                    ? "border-amber-200 shadow-sm"
                    : "border-gray-200 opacity-90"
                )}
                onClick={(e) => {
                  // Don't navigate if clicking on kebab menu, pay button, or its dropdown
                  const target = e.target as HTMLElement;
                  if (target.closest('[role="menu"]') || target.closest('[role="menuitem"]') || target.closest('button[aria-haspopup="menu"]') || target.closest('button[class*="Pay"]')) {
                    return;
                  }
                  navigate(`/agreements/${agreement.id}`);
                }}
              >
                {/* Row 1: Agreement ID + Status | Amount + Action */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="font-semibold text-sm shrink-0">{agreement.id}</span>
                    <Badge
                      variant="outline"
                      className={agreement.status === "open"
                        ? "text-[10px] px-1.5 py-0 h-4 leading-4 bg-amber-50 text-amber-700 border-amber-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[132px]"
                        : "text-[10px] px-1.5 py-0 h-4 leading-4 bg-gray-50 text-gray-700 border-gray-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-[132px]"
                      }
                    >
                      {displayStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <div className="text-right">
                      <span className="text-base font-bold whitespace-nowrap">${agreement.monthlyAmount.toFixed(2)}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">/mo</span>
                    </div>
                    {isOpenAgreement ? (
                      <Button
                        size="sm"
                        variant="default"
                        className="h-6 min-h-0 px-2 py-0 text-xs font-semibold whitespace-nowrap bg-primary hover:bg-primary/90 rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePayNow(agreement.id);
                        }}
                      >
                        Pay
                      </Button>
                    ) : null}
                  </div>
                </div>

                {/* Row 2: Customer Name | Job ID */}
                <div className="flex items-center justify-between gap-2 mt-1">
                  <p className="text-xs text-muted-foreground truncate flex-1">{agreement.customerName}</p>
                  {agreementJobLookup.get(agreement.id) && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 leading-4 bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0">
                      <Briefcase className="h-2.5 w-2.5 mr-0.5" />
                      {agreementJobLookup.get(agreement.id)}
                    </Badge>
                  )}
                </div>

                {/* Row 3: Date Range | Menu */}
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span>
                      {new Date(agreement.startDate).toLocaleDateString()} - {new Date(agreement.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0 -mr-1">
                    <KebabMenu items={kebabMenuItems} menuWidth="w-44" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <MinimumDepositPercentageModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
      />

      {/* Date Range Picker Modal */}
      <DateRangePickerModal
        isOpen={showDateRangePicker}
        onClose={() => setShowDateRangePicker(false)}
        dateRange={dateRange}
        onConfirm={handleDateRangeConfirm}
      />

      {selectedAgreementId && (
        <>
          <DocumentVerificationModal
            open={showDocumentVerificationModal}
            onOpenChange={setShowDocumentVerificationModal}
            agreementId={selectedAgreementId}
            onVerificationComplete={handleVerificationComplete}
          />

          <InvoicePaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedAgreementId(null);
              setSelectedAgreementAmount(0);
              setSelectedAgreement(null);
            }}
            entityLabel="Agreement"
            totalAmount={selectedAgreementAmount}
            paidAmount={Math.min(selectedAgreementAmount, selectedAgreement?.amount_paid || 0)}
            onPaymentComplete={handlePaymentComplete}
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

      {/* Schedule Service Modal for Convert to Job */}
      {agreementToConvert && (
        <ScheduleServiceModal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setAgreementToConvert(null);
          }}
          onConfirm={(date, time, employeeId, updatedAddress, jobTitle) => {
            try {
              const result = convertToJob("agreement", agreementToConvert.id, date, time, employeeId, updatedAddress, jobTitle);
              if (result.success) {
                toast.success("Job scheduled successfully");
                setShowScheduleModal(false);
                setAgreementToConvert(null);
                navigate("/jobs");
              } else {
                toast.error(result.error || "Failed to create job");
                setShowScheduleModal(false);
                setAgreementToConvert(null);
              }
            } catch (error) {
              console.error("Error creating job:", error);
              toast.error("Failed to create job");
              setShowScheduleModal(false);
              setAgreementToConvert(null);
            }
          }}
          employee={{
            id: mockEmployees.find(e => e.name === (agreementToConvert as any).employeeName)?.id || mockEmployees[0].id,
            name: (agreementToConvert as any).employeeName || mockEmployees[0].name,
            email: mockEmployees.find(e => e.name === (agreementToConvert as any).employeeName)?.email || mockEmployees[0].email,
          }}
          sourceType="agreement"
          sourceId={agreementToConvert.id}
          jobAddress={undefined}
          defaultJobTitle={(agreementToConvert as any).type || (agreementToConvert as any).title || `Agreement ${agreementToConvert.id} Service`}
        />
      )}

      {/* Assign to Job Modal */}
      {agreementForAssignJob && (
        <AssignToJobModal
          isOpen={showAssignToJobModal}
          onClose={() => {
            setShowAssignToJobModal(false);
            setAgreementForAssignJob(null);
          }}
          documentType="agreement"
          documentId={agreementForAssignJob.id}
          customerId={agreementForAssignJob.customerId}
          onAssigned={(jobId) => {
            // Refresh the job lookup map to show the Job ID badge
            setJobLookupRefreshKey(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
};

export default Agreements;
