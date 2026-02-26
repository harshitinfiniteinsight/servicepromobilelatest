import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { toast } from "sonner";

// Common country codes
const countryCodes = [
  { code: "+1", country: "US" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "IN" },
  { code: "+86", country: "CN" },
  { code: "+81", country: "JP" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
  { code: "+61", country: "AU" },
  { code: "+55", country: "BR" },
  { code: "+52", country: "MX" },
  { code: "+34", country: "ES" },
  { code: "+39", country: "IT" },
  { code: "+82", country: "KR" },
  { code: "+65", country: "SG" },
  { code: "+971", country: "AE" },
];

interface SendCurrentReportModalProps {
  open: boolean;
  onClose: () => void;
  onSend?: (data: {
    email?: string;
    phone?: string;
    countryCode?: string;
  }) => void;
}

const SendCurrentReportModal = ({
  open,
  onClose,
  onSend,
}: SendCurrentReportModalProps) => {
  const [emailSelected, setEmailSelected] = useState(false);
  const [phoneSelected, setPhoneSelected] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setEmailSelected(false);
      setPhoneSelected(false);
      setEmail("");
      setPhone("");
      setCountryCode("+1");
    }
  }, [open]);

  const handleSend = () => {
    // Validation
    if (!emailSelected && !phoneSelected) {
      toast.error("Please select at least one delivery method");
      return;
    }

    if (emailSelected && !email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (emailSelected && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (phoneSelected && !phone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    const sendData: { email?: string; phone?: string; countryCode?: string } = {};
    if (emailSelected) {
      sendData.email = email.trim();
    }
    if (phoneSelected) {
      sendData.phone = phone.trim();
      sendData.countryCode = countryCode;
    }

    if (onSend) {
      onSend(sendData);
    } else {
      // Mock send - in real app, this would call an API
      console.info("Sending current report:", sendData);
      toast.success("Report sent successfully");
    }

    handleClose();
  };

  const handleClose = () => {
    setEmailSelected(false);
    setPhoneSelected(false);
    setEmail("");
    setPhone("");
    setCountryCode("+1");
    onClose();
  };

  const isSendDisabled = !emailSelected && !phoneSelected;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] max-w-sm mx-auto p-5 rounded-2xl shadow-lg bg-white [&>button]:hidden">
        <DialogDescription className="sr-only">
          Send current report modal
        </DialogDescription>
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
          <DialogTitle className="text-base font-semibold text-gray-800">Send Current Report</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-gray-100"
            onClick={handleClose}
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </DialogHeader>

        {/* Form Fields */}
        <div className="space-y-4 mt-3">
          {/* Email Option */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="emailOption"
                checked={emailSelected}
                onCheckedChange={(checked) => setEmailSelected(checked === true)}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <Label
                htmlFor="emailOption"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Email
              </Label>
            </div>
            {emailSelected && (
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
            )}
          </div>

          {/* Phone Option */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="phoneOption"
                checked={phoneSelected}
                onCheckedChange={(checked) => setPhoneSelected(checked === true)}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <Label
                htmlFor="phoneOption"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Phone
              </Label>
            </div>
            {phoneSelected && (
              <div className="flex items-center gap-2">
                {/* Country Code Dropdown */}
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-[90px] h-[38px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {countryCodes.map((item) => (
                      <SelectItem key={item.code} value={item.code}>
                        {item.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Phone Number Input */}
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 h-[38px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Button */}
        <div className="flex justify-end pt-3 mt-4 border-t border-gray-100">
          <Button
            onClick={handleSend}
            disabled={isSendDisabled}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-1.5 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
          >
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendCurrentReportModal;

