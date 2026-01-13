import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface SendStockInOutReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendStockInOutReportModal({ open, onOpenChange }: SendStockInOutReportModalProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<"email" | "phone" | "">("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSend = () => {
    if (!deliveryMethod) {
      toast.error("Please select a delivery method");
      return;
    }

    if (deliveryMethod === "email" && !email) {
      toast.error("Please enter an email address");
      return;
    }

    if (deliveryMethod === "phone" && !phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    // Validate email format if email is selected
    if (deliveryMethod === "email" && email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    // Send report logic here
    const deliveryInfo = deliveryMethod === "email" 
      ? `Email: ${email}` 
      : `Phone: ${countryCode}${phoneNumber}`;

    toast.success(`Stock In/Out report sent successfully to ${deliveryInfo}`);
    
    // Reset form
    setDeliveryMethod("");
    setEmail("");
    setCountryCode("+1");
    setPhoneNumber("");
    onOpenChange(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset form when closing
      setDeliveryMethod("");
      setEmail("");
      setCountryCode("+1");
      setPhoneNumber("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Send Stock In/Out Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Radio Group for Delivery Method */}
          <RadioGroup value={deliveryMethod} onValueChange={(value) => setDeliveryMethod(value as "email" | "phone")}>
            {/* Email Option */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email-radio" />
                <Label htmlFor="email-radio" className="text-sm font-semibold cursor-pointer">
                  Email
                </Label>
              </div>
              {deliveryMethod === "email" && (
                <div className="ml-6">
                  <Label htmlFor="email" className="text-sm text-muted-foreground mb-2 block">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Phone Number Option */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone-radio" />
                <Label htmlFor="phone-radio" className="text-sm font-semibold cursor-pointer">
                  Phone Number
                </Label>
              </div>
              {deliveryMethod === "phone" && (
                <div className="ml-6">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Phone Number with Country Code
                  </Label>
                  <div className="flex gap-2">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+1">+1 (US/CA)</SelectItem>
                        <SelectItem value="+44">+44 (UK)</SelectItem>
                        <SelectItem value="+91">+91 (IN)</SelectItem>
                        <SelectItem value="+86">+86 (CN)</SelectItem>
                        <SelectItem value="+81">+81 (JP)</SelectItem>
                        <SelectItem value="+49">+49 (DE)</SelectItem>
                        <SelectItem value="+33">+33 (FR)</SelectItem>
                        <SelectItem value="+61">+61 (AU)</SelectItem>
                        <SelectItem value="+52">+52 (MX)</SelectItem>
                        <SelectItem value="+55">+55 (BR)</SelectItem>
                        <SelectItem value="+7">+7 (RU)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="Phone number"
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
            </div>
          </RadioGroup>

          {/* Send Button */}
          <div className="pt-4">
            <Button
              onClick={handleSend}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold py-6"
            >
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}











