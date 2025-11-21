import { X, Printer, Edit, Mail, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockCustomers } from "@/data/mobileMockData";
import { Calendar, DollarSign, User, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";

interface PreviewAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreement: {
    id: string;
    customerId: string;
    customerName: string;
    type: string;
    startDate: string;
    endDate: string;
    monthlyAmount: number;
    status: string;
    renewalStatus: string;
  };
  onAction?: (action: string) => void;
}

const PreviewAgreementModal = ({ isOpen, onClose, agreement, onAction }: PreviewAgreementModalProps) => {
  const customer = mockCustomers.find(c => c.id === agreement.customerId);

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action);
    }
    if (action === "close") {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!fixed !inset-0 !translate-x-0 !translate-y-0 max-w-full w-full h-full max-h-full p-0 gap-0 rounded-none m-0 flex flex-col sm:!left-[50%] sm:!top-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] sm:max-w-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-lg sm:!inset-auto [&>button]:hidden">
        <DialogTitle className="sr-only">Preview Agreement</DialogTitle>
        <DialogDescription className="sr-only">
          Preview agreement {agreement.id}
        </DialogDescription>
        
        {/* Header */}
        <div className="bg-orange-500 px-4 py-3 flex items-center justify-between safe-top">
          <h2 className="text-lg font-bold text-white">Preview Agreement</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction("print")}
              className="text-white hover:bg-orange-600 h-9 px-3"
            >
              <Printer className="h-4 w-4 mr-1.5" />
              <span className="text-sm">Print</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-orange-600 h-9 w-9 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-white">
          {/* Header Section */}
          <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{agreement.type}</h2>
                <Badge className={cn("text-sm", statusColors[agreement.status])}>
                  {agreement.status}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Monthly</p>
                <p className="text-2xl font-bold text-primary">${agreement.monthlyAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="px-4 space-y-4 pb-6">
            <div className="p-4 rounded-xl border bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Customer
              </h3>
              <p className="font-medium">{agreement.customerName}</p>
              {customer && (
                <p className="text-sm text-muted-foreground mt-1">{customer.email}</p>
              )}
            </div>

            <div className="p-4 rounded-xl border bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Agreement Period
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Start:</span> {new Date(agreement.startDate).toLocaleDateString()}</p>
                <p><span className="text-muted-foreground">End:</span> {new Date(agreement.endDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-primary" />
                Renewal
              </h3>
              <Badge variant="outline">{agreement.renewalStatus}</Badge>
            </div>

            <div className="p-4 rounded-xl border bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Payment Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Amount:</span>
                  <span className="font-semibold">${agreement.monthlyAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Total Value:</span>
                  <span className="font-bold">${(agreement.monthlyAmount * 12).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Sticky Footer */}
        <div className="bg-orange-500 safe-bottom">
          <div className="px-3 pt-3 pb-4">
            <div className="flex flex-row items-center justify-between gap-2 sm:gap-3 w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction("send-email")}
                className="text-white hover:bg-orange-600 h-9 px-2 sm:px-3 py-2 flex-1 min-w-0 justify-center text-xs rounded-lg"
              >
                <Mail className="h-3.5 w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                <span className="whitespace-nowrap text-[10px] sm:text-xs">Send Email</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction("send-sms")}
                className="text-white hover:bg-orange-600 h-9 px-2 sm:px-3 py-2 flex-1 min-w-0 justify-center text-xs rounded-lg"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                <span className="whitespace-nowrap text-[10px] sm:text-xs">Send SMS</span>
              </Button>
              {onAction && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction("edit")}
                  className="text-white hover:bg-orange-600 h-9 px-2 sm:px-3 py-2 flex-1 min-w-0 justify-center text-xs rounded-lg"
                >
                  <Edit className="h-3.5 w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                  <span className="whitespace-nowrap text-[10px] sm:text-xs">Edit</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewAgreementModal;

