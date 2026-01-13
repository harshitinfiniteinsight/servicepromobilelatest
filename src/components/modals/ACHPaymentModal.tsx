import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface ACHPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  onPaymentComplete?: () => void;
}

export const ACHPaymentModal = ({ open, onOpenChange, totalAmount, onPaymentComplete }: ACHPaymentModalProps) => {
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [nameOnCheck, setNameOnCheck] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const handlePayNow = () => {
    if (!authorized) {
      toast.error("Please authorize the payment");
      return;
    }
    if (!routingNumber || !accountNumber || !nameOnCheck) {
      toast.error("Please fill in all account details");
      return;
    }
    toast.success("ACH payment processed successfully");
    onOpenChange(false);
    onPaymentComplete?.();
  };

  const handleClose = () => {
    // Reset form when closing
    setRoutingNumber("");
    setAccountNumber("");
    setNameOnCheck("");
    setAuthorized(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">ACH Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="routingNumber">Routing Number</Label>
            <Input
              id="routingNumber"
              placeholder="Enter Routing Number"
              value={routingNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 9) setRoutingNumber(value);
              }}
              maxLength={9}
            />
          </div>

          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              placeholder="Enter Account Number"
              value={accountNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setAccountNumber(value);
              }}
            />
          </div>

          <div>
            <Label htmlFor="nameOnCheck">Name on Check</Label>
            <Input
              id="nameOnCheck"
              placeholder="Enter Name on Check"
              value={nameOnCheck}
              onChange={(e) => setNameOnCheck(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              By placing this order, you agree to the{" "}
              <a href="#" className="text-orange-500 hover:underline" onClick={(e) => e.preventDefault()}>
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="#" className="text-orange-500 hover:underline" onClick={(e) => e.preventDefault()}>
                Terms of Use
              </a>
              .
            </p>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <Checkbox
              id="authorize"
              checked={authorized}
              onCheckedChange={(checked) => setAuthorized(checked as boolean)}
            />
            <Label htmlFor="authorize" className="text-sm leading-tight cursor-pointer font-normal">
              I authorize this payment and confirm the above account details are correct.
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
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











