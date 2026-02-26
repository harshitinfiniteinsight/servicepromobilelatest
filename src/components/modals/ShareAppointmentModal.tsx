import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ShareAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onShare: (options: { via: "email" | "sms" | "both"; audience: "customer" | "employee" | "both" }) => void;
  selectedCount: number;
  appointmentName?: string;
}

const shareViaOptions = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "both", label: "Email & SMS" },
] as const;

const shareAudienceOptions = [
  { value: "customer", label: "Customer" },
  { value: "employee", label: "Employee" },
  { value: "both", label: "Both" },
] as const;

const ShareAppointmentModal = ({
  open,
  onClose,
  onShare,
  selectedCount,
  appointmentName,
}: ShareAppointmentModalProps) => {
  const [shareVia, setShareVia] = useState<"email" | "sms" | "both">("email");
  const [audience, setAudience] = useState<"customer" | "employee" | "both">("customer");

  useEffect(() => {
    if (open) {
      setShareVia("email");
      setAudience("customer");
    }
  }, [open]);

  const shareCopy = useMemo(() => {
    if (selectedCount === 1 && appointmentName) {
      return `Share "${appointmentName}"`;
    }
    if (selectedCount <= 1) return "Share Appointment";
    return `Share ${selectedCount} Appointments`;
  }, [selectedCount, appointmentName]);

  const modalTitle = useMemo(() => {
    if (selectedCount === 1 && appointmentName) {
      return `Share "${appointmentName}"`;
    }
    return "Share";
  }, [selectedCount, appointmentName]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-11/12 p-0 gap-0 rounded-xl bg-white shadow-lg [&>button]:hidden">
        <DialogHeader className="px-4 pt-4 pb-2 text-left">
          <DialogTitle className="text-lg font-semibold text-gray-900">{modalTitle}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            Choose how you want to share the selected appointments.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="px-4 py-3 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Share via</h3>
            <RadioGroup
              value={shareVia}
              onValueChange={(value: "email" | "sms" | "both") => setShareVia(value)}
              className="grid grid-cols-3 gap-2 justify-items-center"
            >
              {shareViaOptions.map(option => {
                const isSelected = shareVia === option.value;
                return (
                  <Label
                    key={option.value}
                    htmlFor={`share-via-${option.value}`}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium text-center cursor-pointer transition-colors w-full min-h-[44px]",
                      isSelected
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-800 hover:bg-gray-50"
                    )}
                  >
                    <RadioGroupItem value={option.value} id={`share-via-${option.value}`} className="sr-only" />
                    <span>{option.label}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Share with</h3>
            <RadioGroup
              value={audience}
              onValueChange={(value: "customer" | "employee" | "both") => setAudience(value)}
              className="grid grid-cols-3 gap-2 justify-items-center"
            >
              {shareAudienceOptions.map(option => {
                const isSelected = audience === option.value;
                return (
                  <Label
                    key={option.value}
                    htmlFor={`share-audience-${option.value}`}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium text-center cursor-pointer transition-colors w-full min-h-[44px]",
                      isSelected
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-800 hover:bg-gray-50"
                    )}
                  >
                    <RadioGroupItem value={option.value} id={`share-audience-${option.value}`} className="sr-only" />
                    <span>{option.label}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {selectedCount} appointment{selectedCount === 1 ? "" : "s"} selected
          </p>

          <Button
            onClick={() => {
              onShare({ via: shareVia, audience });
              onClose();
            }}
            className="w-full rounded-lg bg-primary text-white py-2.5 text-sm font-semibold hover:bg-primary/90 shadow-md mt-4"
          >
            {shareCopy}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareAppointmentModal;

