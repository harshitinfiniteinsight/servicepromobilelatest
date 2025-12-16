import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import MinimumDepositPercentageModal from "@/components/modals/MinimumDepositPercentageModal";
import { DocumentVerificationModal } from "@/components/modals/DocumentVerificationModal";
import PaymentModal from "@/components/modals/PaymentModal";
import SendSMSModal from "@/components/modals/SendSMSModal";
import SendEmailModal from "@/components/modals/SendEmailModal";
import DateRangePickerModal from "@/components/modals/DateRangePickerModal";
import { mockAgreements, mockCustomers, mockEmployees } from "@/data/mobileMockData";
import { Plus, Calendar, DollarSign, Percent, Eye, Mail, MessageSquare, Edit, CreditCard, FilePlus, Briefcase, Search, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";
import { toast } from "sonner";
import { format } from "date-fns";
import { createPaymentNotification } from "@/services/notificationService";
import { convertToJob } from "@/services/jobConversionService";

const Agreements = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Paid" | "Open">("all");
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
  const [selectedAgreement, setSelectedAgreement] = useState<typeof mockAgreements[0] | null>(null);
  const [selectedAgreementForSms, setSelectedAgreementForSms] = useState<{ id: string; customerId: string; customerPhone?: string; customerName?: string } | null>(null);
  const [selectedAgreementForEmail, setSelectedAgreementForEmail] = useState<{ id: string; customerId: string; customerEmail?: string; customerName?: string } | null>(null);

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

  // Filter agreements
  const filteredAgreements = mockAgreements.filter(agreement => {
    // Search filter - by agreement ID or customer name
    const matchesSearch = search === "" || 
      agreement.id.toLowerCase().includes(search.toLowerCase()) ||
      agreement.customerName.toLowerCase().includes(search.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all" || agreement.status === statusFilter;

    // Date range filter - check start date
    const matchesDateRange = isWithinDateRange(agreement.startDate);

    return matchesSearch && matchesStatus && matchesDateRange;
  });

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
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "Paid" | "Open")}>
              <SelectTrigger className="w-full h-9 text-xs py-2 px-3">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Agreements List */}
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
                // Unpaid agreements: Preview, Convert to Job (if not converted), Send Email, Send SMS, Edit Agreement
                { label: "Preview", icon: Eye, action: () => handleMenuAction(agreement.id, "preview") },
                // Add "Convert to Job" for unpaid agreements (same as paid)
                ...(!isConverted ? [{ label: "Convert to Job", icon: Briefcase, action: () => handleMenuAction(agreement.id, "convert-to-job") }] : []),
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
