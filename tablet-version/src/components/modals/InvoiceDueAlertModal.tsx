import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { toast } from "sonner";

interface InvoiceDueAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvoiceDueAlertModal = ({ isOpen, onClose }: InvoiceDueAlertModalProps) => {
  const [reminderDays, setReminderDays] = useState("1");
  const [emailAlertEnabled, setEmailAlertEnabled] = useState(true);
  const [smsAlertEnabled, setSmsAlertEnabled] = useState(true);

  const handleSave = () => {
    // Persist the settings
    toast.success("Invoice Due Alert settings saved successfully");
    onClose();
  };

  const handleCancel = () => {
    // Reset to defaults
    setReminderDays("1");
    setEmailAlertEnabled(true);
    setSmsAlertEnabled(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-md rounded-xl p-0 gap-0 [&>button]:hidden">
        <DialogDescription className="sr-only">
          Invoice due alert settings modal
        </DialogDescription>
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Invoice Due Alert
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-4 py-4 space-y-4">
          {/* Days Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">
              Select days to send Invoice Due Alert to customer
            </Label>
            <Select value={reminderDays} onValueChange={setReminderDays}>
              <SelectTrigger className="w-full h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="2">2 days</SelectItem>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="5">5 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Invoice due reminder will be repeatedly sent to your customer every{" "}
              <span className="font-semibold text-gray-900">{reminderDays}</span>{" "}
              {reminderDays === "1" ? "day" : "days"} until paid.
            </p>
          </div>

          {/* Email Alert Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50/50">
            <div className="flex flex-col">
              <Label htmlFor="email-alert" className="text-sm font-semibold text-gray-900 cursor-pointer">
                Email Alert
              </Label>
              <span className="text-xs text-muted-foreground mt-0.5">
                {emailAlertEnabled ? "ON" : "OFF"}
              </span>
            </div>
            <Switch
              id="email-alert"
              checked={emailAlertEnabled}
              onCheckedChange={setEmailAlertEnabled}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* SMS Alert Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50/50">
            <div className="flex flex-col">
              <Label htmlFor="sms-alert" className="text-sm font-semibold text-gray-900 cursor-pointer">
                SMS Alert
              </Label>
              <span className="text-xs text-muted-foreground mt-0.5">
                {smsAlertEnabled ? "ON" : "OFF"}
              </span>
            </div>
            <Switch
              id="sms-alert"
              checked={smsAlertEnabled}
              onCheckedChange={setSmsAlertEnabled}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-4 pb-4 pt-2 flex gap-2 justify-end border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="h-10 px-6 text-sm font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="h-10 px-6 text-sm font-semibold bg-primary hover:bg-primary/90 text-white"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDueAlertModal;




