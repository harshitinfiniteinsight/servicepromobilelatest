import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface CardDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  onPaymentComplete?: () => void;
}

export const CardDetailsModal = ({ open, onOpenChange, totalAmount, onPaymentComplete }: CardDetailsModalProps) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [validThru, setValidThru] = useState("");
  const [cvv, setCvv] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    // Format with spaces every 4 digits
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(formatted);
  };

  const handleValidThruChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    // Format as MM/YY
    if (value.length >= 2) {
      value = value.slice(0, 2) + " / " + value.slice(2);
    }
    setValidThru(value);
  };

  const handlePayNow = () => {
    if (!authorized) {
      toast.error("Please authorize the payment");
      return;
    }
    if (!cardNumber || !cardName || !validThru || !cvv || !zipCode) {
      toast.error("Please fill in all card details");
      return;
    }
    toast.success("Payment processed successfully");
    onOpenChange(false);
    onPaymentComplete?.();
  };

  const handleClose = () => {
    // Reset form when closing
    setCardNumber("");
    setCardName("");
    setValidThru("");
    setCvv("");
    setZipCode("");
    setAuthorized(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Card Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
            />
          </div>

          <div>
            <Label htmlFor="cardName">Name on Card</Label>
            <Input
              id="cardName"
              placeholder="Enter Name on Card"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="validThru">Valid Thru</Label>
              <Input
                id="validThru"
                placeholder="00 / 00"
                value={validThru}
                onChange={handleValidThruChange}
                maxLength={7}
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="password"
                placeholder="***"
                value={cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 4) setCvv(value);
                }}
                maxLength={4}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="zipCode">Zip</Label>
            <Input
              id="zipCode"
              placeholder="Zip Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />
          </div>

          <div className="flex items-start gap-2 pt-2">
            <Checkbox
              id="authorize"
              checked={authorized}
              onCheckedChange={(checked) => setAuthorized(checked as boolean)}
            />
            <Label htmlFor="authorize" className="text-sm leading-tight cursor-pointer font-normal">
              I authorize this payment and confirm the above card details are correct.
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50" onClick={handleClose}>
              View Order
            </Button>
            <Button
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handlePayNow}
            >
              Pay Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};











