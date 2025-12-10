import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Zap, Wifi, MoreVertical, CreditCard, DollarSign, Building2, X } from "lucide-react";
import { toast } from "sonner";
import { CardDetailsModal } from "./CardDetailsModal";
import { ACHPaymentModal } from "./ACHPaymentModal";
import { PayCashModal } from "./PayCashModal";

interface InvoicePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any;
}

export const InvoicePaymentModal = ({ open, onOpenChange, invoice }: InvoicePaymentModalProps) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"tap" | "card" | "cash" | "ach" | null>(null);
  const [showCardDetailsModal, setShowCardDetailsModal] = useState(false);
  const [showACHModal, setShowACHModal] = useState(false);
  const [showPayCashModal, setShowPayCashModal] = useState(false);

  if (!invoice) return null;

  const totalAmount = invoice.amount || 0;

  const handlePaymentMethodSelect = (method: "tap" | "card" | "cash" | "ach") => {
    setSelectedPaymentMethod(method);
    if (method === "cash") {
      setShowPayCashModal(true);
    } else if (method === "card") {
      setShowCardDetailsModal(true);
    } else if (method === "tap") {
      toast.success("Tap to Pay selected");
      // Handle tap to pay
    } else if (method === "ach") {
      setShowACHModal(true);
    }
  };

  const handlePaymentComplete = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-orange-500 text-white px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-orange-600 h-8 w-8"
            onClick={() => onOpenChange(false)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold flex-1">Service Pro911 - Payment</h2>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-orange-600 h-8 w-8"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Total Amount Section */}
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative mb-4">
              <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center">
                <CreditCard className="h-10 w-10 text-orange-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Total Amount</p>
            <p className="text-4xl font-bold text-foreground">${totalAmount.toFixed(2)}</p>
          </div>


          {/* Payment Options Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">Payment Options</h3>

            {/* Payment Method Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Tap to Pay */}
              <Card
                className={`cursor-pointer transition-all hover:shadow-md bg-white ${
                  selectedPaymentMethod === "tap"
                    ? "border-orange-500 border-2 bg-orange-50"
                    : "border-gray-200"
                }`}
                onClick={() => handlePaymentMethodSelect("tap")}
              >
                <CardContent className="pt-6 pb-4 flex flex-col items-center justify-center min-h-[120px]">
                  <div className="mb-3">
                    <Zap className="h-10 w-10 text-orange-500" />
                  </div>
                  <p className="text-sm font-medium text-center text-foreground">Tap to Pay</p>
                </CardContent>
              </Card>

              {/* Enter Card Manually */}
              <Card
                className={`cursor-pointer transition-all hover:shadow-md bg-white ${
                  selectedPaymentMethod === "card"
                    ? "border-orange-500 border-2 bg-orange-50"
                    : "border-gray-200"
                }`}
                onClick={() => handlePaymentMethodSelect("card")}
              >
                <CardContent className="pt-6 pb-4 flex flex-col items-center justify-center min-h-[120px]">
                  <div className="mb-3">
                    <CreditCard className="h-10 w-10 text-orange-500" />
                  </div>
                  <p className="text-sm font-medium text-center text-foreground">Enter Card Manually</p>
                </CardContent>
              </Card>

              {/* ACH Payment */}
              <Card
                className={`cursor-pointer transition-all hover:shadow-md bg-white ${
                  selectedPaymentMethod === "ach"
                    ? "border-orange-500 border-2 bg-orange-50"
                    : "border-gray-200"
                }`}
                onClick={() => handlePaymentMethodSelect("ach")}
              >
                <CardContent className="pt-6 pb-4 flex flex-col items-center justify-center min-h-[120px]">
                  <div className="mb-3">
                    <Building2 className="h-10 w-10 text-orange-500" />
                  </div>
                  <p className="text-sm font-medium text-center text-foreground">ACH Payment</p>
                </CardContent>
              </Card>

              {/* Pay by Cash */}
              <Card
                className={`cursor-pointer transition-all hover:shadow-md bg-white ${
                  selectedPaymentMethod === "cash"
                    ? "border-orange-500 border-2 bg-orange-50"
                    : "border-gray-200"
                }`}
                onClick={() => handlePaymentMethodSelect("cash")}
              >
                <CardContent className="pt-6 pb-4 flex flex-col items-center justify-center min-h-[120px]">
                  <div className="mb-3">
                    <DollarSign className="h-10 w-10 text-orange-500" />
                  </div>
                  <p className="text-sm font-medium text-center text-foreground">Pay by Cash</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>

      <CardDetailsModal
        open={showCardDetailsModal}
        onOpenChange={setShowCardDetailsModal}
        totalAmount={totalAmount}
        onPaymentComplete={handlePaymentComplete}
      />

      <ACHPaymentModal
        open={showACHModal}
        onOpenChange={setShowACHModal}
        totalAmount={totalAmount}
        onPaymentComplete={handlePaymentComplete}
      />

      <PayCashModal
        open={showPayCashModal}
        onOpenChange={setShowPayCashModal}
        orderAmount={totalAmount}
        orderId={invoice.id || invoice.orderId || ""}
        onPaymentComplete={handlePaymentComplete}
      />
    </Dialog>
  );
};
