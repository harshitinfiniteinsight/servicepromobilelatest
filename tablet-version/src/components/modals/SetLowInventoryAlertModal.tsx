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
        className="w-[90%] max-w-sm p-4 rounded-2xl shadow-lg bg-white [&>button]:hidden max-h-[65vh] flex flex-col !fixed !left-1/2 !top-auto !translate-x-[-50%] !translate-y-0"
        style={{
          bottom: 'calc(64px + env(safe-area-inset-bottom) + 24px)',
        }}
      >
        <DialogDescription className="sr-only">
          Set low inventory alert settings
        </DialogDescription>
        
        {/* Header */}
        <DialogHeader className="flex flex-row justify-between items-center pb-2 border-b border-gray-100 flex-shrink-0 mb-3">
          <DialogTitle className="text-base font-semibold text-gray-800">Set Low Inventory Alert</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-2.5 min-h-0 pb-20 pr-1">
          {/* Email Alert Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2.5 shadow-sm">
            {/* Email Alert Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-semibold text-gray-900">Email Alert</span>
              </div>
              <div className="scale-90 origin-right">
                <Switch
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 leading-relaxed">
              Receive email notifications when inventory is low
            </p>

            {/* Email Input */}
            {emailEnabled && (
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 pr-8 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Edit className="h-3.5 w-3.5 text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {/* SMS Alert Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2.5 shadow-sm">
            {/* SMS Alert Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-semibold text-gray-900">SMS Alert</span>
              </div>
              <div className="scale-90 origin-right">
                <Switch
                  checked={smsEnabled}
                  onCheckedChange={setSmsEnabled}
                />
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 leading-relaxed">
              Receive text messages when inventory is low
            </p>

            {/* Phone Input */}
            {smsEnabled && (
              <div className="relative">
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-9 pr-8 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Edit className="h-3.5 w-3.5 text-gray-400" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Save Button */}
        <div className="flex-shrink-0 pt-3 pb-4 px-1">
          <Button
            onClick={handleSave}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg text-sm"
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SetLowInventoryAlertModal;

