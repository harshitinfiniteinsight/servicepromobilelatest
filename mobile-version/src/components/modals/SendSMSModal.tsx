import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { toast } from "sonner";

interface SendSMSModalProps {
  open: boolean;
  onClose: () => void;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  } | null;
}

const SendSMSModal = ({
  open,
  onClose,
  customer,
}: SendSMSModalProps) => {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open && customer) {
      setPhone(customer.phone);
      setMessage("");
    }
  }, [open, customer]);

  const handleSend = () => {
    if (!phone || phone.trim().length === 0) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    if (!message || message.trim().length === 0) {
      toast.error("Please enter a message");
      return;
    }
    
    // Mock SMS sending
    console.info("Sending SMS", {
      to: phone,
      message: message.trim(),
      customerName: customer?.name,
    });
    
    toast.success(`Message sent successfully to ${customer?.name || phone}.`);
    onClose();
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[90%] p-0 gap-0 rounded-2xl bg-white shadow-md [&>button]:hidden">
        <DialogDescription className="sr-only">
          Send SMS modal
        </DialogDescription>
        <DialogHeader className="px-5 pt-5 pb-4 flex flex-row items-center justify-between border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold text-gray-900 text-center flex-1">Send SMS</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </DialogHeader>

        <div className="px-4 py-4 space-y-4">
          {/* Customer Name (non-editable) */}
          <div className="space-y-1">
            <Label className="text-sm text-gray-600">Customer Name</Label>
            <Input
              type="text"
              value={customer.name}
              readOnly
              disabled
              className="w-full bg-gray-100 text-gray-700 text-sm rounded-lg px-3 py-2 border border-gray-200 cursor-not-allowed"
            />
          </div>

          {/* Phone Number (editable) */}
          <div className="space-y-1">
            <Label className="text-sm text-gray-600">Phone Number</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-gray-800 text-sm rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Message */}
          <div className="space-y-1">
            <Label className="text-sm text-gray-600">Message</Label>
            <Textarea
              placeholder="Type your message..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-gray-800 text-sm rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
            />
          </div>

          {/* Send Button */}
          <div className="pt-2 flex justify-center">
            <Button
              onClick={handleSend}
              disabled={!phone.trim() || !message.trim()}
              className="bg-orange-500 text-white text-sm font-medium px-8 py-2 rounded-lg shadow hover:bg-orange-600 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[44px]"
            >
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendSMSModal;

