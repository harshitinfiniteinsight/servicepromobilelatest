import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import MinimumDepositPercentageModal from "@/components/modals/MinimumDepositPercentageModal";
import { DocumentVerificationModal } from "@/components/modals/DocumentVerificationModal";
import PaymentModal from "@/components/modals/PaymentModal";
import SendSmsModal from "@/components/modals/SendSmsModal";
import SendEmailModal from "@/components/modals/SendEmailModal";
import { mockAgreements, mockCustomers, mockEmployees } from "@/data/mobileMockData";
import { Plus, Calendar, DollarSign, Percent, Eye, Mail, MessageSquare, Edit, CreditCard, FilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";
import { toast } from "sonner";

const Agreements = () => {
  const navigate = useNavigate();
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
        className="flex-1 overflow-y-auto scrollable px-3 pb-4 space-y-2"
        style={{ paddingTop: "calc(3rem + env(safe-area-inset-top) + 0.5rem)" }}
      >
        <div className="space-y-2">
          {mockAgreements.map(agreement => {
            // Check if agreement is paid (case-insensitive)
            const isPaid = agreement.status?.toLowerCase() === "paid";
            
            // Build menu items based on payment status and user role
            const kebabMenuItems: KebabMenuItem[] = isPaid
              ? [
                  // Paid agreements: Preview and Create New Agreement
                  { label: "Preview", icon: Eye, action: () => handleMenuAction(agreement.id, "preview") },
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
                      <h3 className="font-semibold text-base truncate">{agreement.type}</h3>
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
        <SendSmsModal
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
