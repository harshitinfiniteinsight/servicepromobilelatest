import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Mail, Phone, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AlertSettings {
  emailEnabled: boolean;
  email: string;
  smsEnabled: boolean;
  phone: string;
}

interface SetLowInventoryAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSettings?: AlertSettings;
  onSave?: (settings: AlertSettings) => void;
}

const SetLowInventoryAlertModal = ({
  isOpen,
  onClose,
  initialSettings,
  onSave,
}: SetLowInventoryAlertModalProps) => {
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [email, setEmail] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [phone, setPhone] = useState("");

  // Initialize with provided settings or defaults
  useEffect(() => {
    if (isOpen) {
      if (initialSettings) {
        setEmailEnabled(initialSettings.emailEnabled);
        setEmail(initialSettings.email || "");
        setSmsEnabled(initialSettings.smsEnabled);
        setPhone(initialSettings.phone || "");
      } else {
        // Default values
        setEmailEnabled(false);
        setEmail("");
        setSmsEnabled(false);
        setPhone("");
      }
    }
  }, [isOpen, initialSettings]);

  const handleSave = () => {
    // Validate email if enabled
    if (emailEnabled && !email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (emailEnabled && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate phone if enabled
    if (smsEnabled && !phone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    const settings: AlertSettings = {
      emailEnabled,
      email: email.trim(),
      smsEnabled,
      phone: phone.trim(),
    };

    if (onSave) {
      onSave(settings);
    } else {
      // Mock save - in real app, this would call an API
      console.info("Saving alert settings:", settings);
      toast.success("Alert settings saved successfully");
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-full max-w-[440px] p-0 rounded-2xl shadow-2xl bg-white flex flex-col !fixed !left-1/2 !top-1/2 !translate-x-[-50%] !translate-y-[-50%]"
        style={{ minWidth: 320 }}
      >
        <DialogDescription className="sr-only">
          Set low inventory alert settings
        </DialogDescription>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <DialogTitle className="text-lg font-bold text-gray-800">Set Low Inventory Alert</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Email Alert Option */}
          <div className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <Mail className="h-6 w-6 text-orange-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base text-gray-900">Email Alert</div>
              <div className="text-xs text-gray-500">Receive email notifications when inventory is low</div>
            </div>
            <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
          </div>
          {/* Email Input */}
          {emailEnabled && (
            <div className="w-full flex items-center gap-2 pl-10">
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 text-sm border border-gray-200 rounded-lg px-3 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
              <Edit className="h-4 w-4 text-gray-400" />
            </div>
          )}
          {/* SMS Alert Option */}
          <div className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <Phone className="h-6 w-6 text-orange-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base text-gray-900">SMS Alert</div>
              <div className="text-xs text-gray-500">Receive text messages when inventory is low</div>
            </div>
            <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
          </div>
          {/* Phone Input */}
          {smsEnabled && (
            <div className="w-full flex items-center gap-2 pl-10">
              <Input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 text-sm border border-gray-200 rounded-lg px-3 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
              <Edit className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>
        {/* Sticky Save Button */}
        <div className="sticky bottom-0 left-0 right-0 bg-white px-6 pt-2 pb-5 rounded-b-2xl z-20 border-t border-gray-100">
          <Button
            onClick={handleSave}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg text-base"
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SetLowInventoryAlertModal;

