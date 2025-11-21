import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import MinimumDepositPercentageModal from "@/components/modals/MinimumDepositPercentageModal";
import { mockAgreements } from "@/data/mobileMockData";
import { Plus, Calendar, DollarSign, Percent, Eye, Mail, MessageSquare, Edit, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";
import { toast } from "sonner";

const Agreements = () => {
  const navigate = useNavigate();
  const [showDepositModal, setShowDepositModal] = useState(false);

  // Get user role
  const userType = typeof window !== "undefined" ? localStorage.getItem("userType") || "merchant" : "merchant";
  const isEmployee = userType === "employee";

  const handlePayNow = (agreementId: string) => {
    toast.success(`Initiating payment for ${agreementId}`);
  };

  const handleMenuAction = (agreementId: string, action: string) => {
    switch (action) {
      case "preview":
        navigate(`/agreements/${agreementId}`);
        break;
      case "send-email":
        toast.success(`Sending agreement email for ${agreementId}`);
        break;
      case "send-sms":
        toast.success(`Sending agreement SMS for ${agreementId}`);
        break;
      case "edit":
        navigate(`/agreements/${agreementId}/edit`);
        break;
      case "pay":
        handlePayNow(agreementId);
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
            const isPaid = agreement.status === "Paid";
            
            // Build menu items based on payment status and user role
            const kebabMenuItems: KebabMenuItem[] = isPaid
              ? [
                  // Paid agreements: Only Preview (for both merchant and employee)
                  { label: "Preview", icon: Eye, action: () => handleMenuAction(agreement.id, "preview") },
                ]
              : [
                  // Unpaid agreements: Preview, Send Email, Send SMS, Pay
                  { label: "Preview", icon: Eye, action: () => handleMenuAction(agreement.id, "preview") },
                  { label: "Send Email", icon: Mail, action: () => handleMenuAction(agreement.id, "send-email") },
                  { label: "Send SMS", icon: MessageSquare, action: () => handleMenuAction(agreement.id, "send-sms") },
                  // Edit Agreement: Only for merchants, not employees
                  ...(isEmployee ? [] : [{ label: "Edit Agreement", icon: Edit, action: () => handleMenuAction(agreement.id, "edit") }]),
                  { label: "Pay", icon: CreditCard, action: () => handleMenuAction(agreement.id, "pay") },
                ];

            return (
              <div
                key={agreement.id}
                className="p-2.5 rounded-lg border bg-card active:scale-[0.98] transition-transform cursor-pointer"
                onClick={() => navigate(`/agreements/${agreement.id}`)}
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
                  <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
                    <div className="flex items-baseline gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span className="text-lg font-bold whitespace-nowrap">${agreement.monthlyAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-right whitespace-nowrap">per month</p>
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
    </div>
  );
};

export default Agreements;
