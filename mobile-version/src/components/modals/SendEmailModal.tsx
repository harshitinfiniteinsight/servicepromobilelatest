import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerEmail: string;
  customerName?: string;
}

const SendEmailModal = ({
  isOpen,
  onClose,
  customerEmail,
  customerName,
}: SendEmailModalProps) => {
  const [email, setEmail] = useState(customerEmail);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(customerEmail);
      setIsLoading(false);
    }
  }, [customerEmail, isOpen]);

  const handleSend = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call - replace with actual backend call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, this would be:
      // await sendAgreementEmail(email, agreementId);
      
      toast.success(`Email sent successfully to ${email}`);
      onClose();
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Send email</DialogTitle>
        <DialogDescription className="sr-only">
          Send email to {customerName || customerEmail}
        </DialogDescription>
        
        {/* Header with orange background */}
        <div className="bg-orange-500 text-white px-4 py-4 flex items-center justify-between safe-top">
          <h2 className="text-lg sm:text-xl font-bold text-white">Send email</h2>
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
            <Label className="text-sm text-gray-600">Email send to :</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              className="border-0 border-b-2 border-gray-300 rounded-none px-0 focus-visible:ring-0 focus-visible:border-orange-500 text-orange-500 font-medium text-base"
            />
          </div>

          <div className="px-8 sm:px-10 pt-2 pb-4">
            <Button 
              onClick={handleSend}
              disabled={isLoading}
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

export default SendEmailModal;

