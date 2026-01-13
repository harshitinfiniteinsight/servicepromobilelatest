import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { toast } from "sonner";

interface SendSMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerPhone: string;
  customerCountryCode?: string;
  entityId?: string;
  entityType?: string;
  customerName?: string;
}

const SendSMSModal = ({
  isOpen,
  onClose,
  customerPhone,
  customerCountryCode = "+1",
  entityId,
  entityType,
  customerName,
}: SendSMSModalProps) => {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Format phone number with country code for display
  const formatPhoneWithCountryCode = (phone: string, countryCode: string) => {
    if (!phone) return "";
    
    // Remove all non-digit characters except + for comparison
    const digitsOnly = phone.replace(/\D/g, "");
    const countryCodeDigits = countryCode.replace(/\D/g, "");
    
    // If phone already starts with country code digits, format it nicely
    if (digitsOnly.startsWith(countryCodeDigits)) {
      // Remove country code from the beginning
      const phoneWithoutCountry = digitsOnly.slice(countryCodeDigits.length);
      // Format: +1 5551234567 -> +1 555 123 4567
      if (phoneWithoutCountry.length === 10) {
        return `${countryCode} ${phoneWithoutCountry.slice(0, 3)} ${phoneWithoutCountry.slice(3, 6)} ${phoneWithoutCountry.slice(6)}`;
      }
      return `${countryCode} ${phoneWithoutCountry}`;
    }
    
    // Extract digits from phone (removes formatting like (555) 123-4567)
    const phoneDigits = phone.replace(/\D/g, "");
    
    // If we have 10 digits (US format), format nicely
    if (phoneDigits.length === 10) {
      return `${countryCode} ${phoneDigits.slice(0, 3)} ${phoneDigits.slice(3, 6)} ${phoneDigits.slice(6)}`;
    }
    
    // Otherwise, just prepend country code
    return `${countryCode} ${phoneDigits}`;
  };

  useEffect(() => {
    if (isOpen && customerPhone) {
      // Format phone number with country code
      const formattedPhone = formatPhoneWithCountryCode(customerPhone, customerCountryCode);
      setPhone(formattedPhone);
      setIsLoading(false);
    }
  }, [isOpen, customerPhone, customerCountryCode]);

  const handleSend = async () => {
    if (!phone || phone.trim().length === 0) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call - replace with actual backend call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, this would be:
      // await sendSMS({
      //   phone: phone.trim(),
      //   entityId,
      //   entityType,
      // });
      
      console.info("Sending SMS", {
        to: phone.trim(),
        entityId,
        entityType,
        customerName: customerName || undefined,
      });
      
      toast.success(`SMS sent successfully to ${phone.trim()}`);
      onClose();
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast.error("Failed to send SMS. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Send SMS</DialogTitle>
        <DialogDescription className="sr-only">
          Send SMS to {customerName || phone || "recipient"}
        </DialogDescription>
        
        {/* Header with orange background */}
        <div className="bg-orange-500 text-white px-4 py-4 flex items-center justify-between safe-top">
          <h2 className="text-lg sm:text-xl font-bold text-white">Send SMS</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-orange-600 h-9 w-9 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content Area */}
        <div className="bg-white py-6 sm:py-8 space-y-6 sm:space-y-8 overflow-y-auto safe-bottom overflow-x-hidden">
          <div className="space-y-3 px-8 sm:px-10">
            <Label className="text-sm text-gray-600">Phone send to :</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 1234567890"
              className="border-0 border-b-2 border-gray-300 rounded-none px-0 focus-visible:ring-0 focus-visible:border-orange-500 text-orange-500 font-medium text-base"
            />
          </div>

          <div className="px-8 sm:px-10 pt-2 pb-4">
            <Button 
              onClick={handleSend}
              disabled={isLoading || !phone.trim()}
              className="w-full border-2 border-orange-500 text-orange-500 bg-white hover:bg-orange-50 font-semibold py-4 px-6 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "SENDING..." : "SEND"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendSMSModal;

