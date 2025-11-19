import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileText, Receipt, User, X, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  time: string;
  service: string;
  duration: string;
  technicianId: string;
  technicianName: string;
  status: string;
}

interface AppointmentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSave?: (appointment: Appointment) => void;
  onCreateEstimate?: () => void;
  onCreateInvoice?: () => void;
  onViewCustomer?: () => void;
  onEdit?: (appointmentId: string) => void;
}

const repeatOptions = [
  "Not Repeated",
  "Daily",
  "Weekly",
  "Monthly",
] as const;

const AppointmentDetailsModal = ({
  open,
  onClose,
  appointment,
  onSave,
  onCreateEstimate,
  onCreateInvoice,
  onViewCustomer,
  onEdit,
}: AppointmentDetailsModalProps) => {
  const [subject, setSubject] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [note, setNote] = useState("");
  const [repeated, setRepeated] = useState("Not Repeated");
  const [shareVia, setShareVia] = useState<"email" | "sms" | "both">("both");
  const [shareAudience, setShareAudience] = useState<"customer" | "employee" | "both">("both");
  const [isDeactivated, setIsDeactivated] = useState(false);

  useEffect(() => {
    if (appointment) {
      setSubject(appointment.service);
      setCustomerName(appointment.customerName);
      setEmployeeName(appointment.technicianName);
      setNote("");
      setRepeated("Not Repeated");
      setIsDeactivated(appointment.status.toLowerCase() !== "confirmed");
    }
  }, [appointment]);

  const handleEdit = () => {
    if (appointment && onEdit) {
      onEdit(appointment.id);
      onClose();
    }
  };

  const formatDateTime = () => {
    if (!appointment) return "";
    const date = new Date(appointment.date + 'T00:00:00');
    const formattedDate = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    return `${formattedDate} ${appointment.time}–${appointment.duration}`;
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-hidden flex flex-col [&>button]:hidden">
        <DialogDescription className="sr-only">
          Appointment details modal for {appointment?.customerName || "appointment"}
        </DialogDescription>
        <DialogHeader className="px-5 pt-5 pb-3 flex flex-row items-center justify-between border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold text-gray-900">Appointment Details</DialogTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="deactivate-toggle" className="text-xs font-medium text-gray-600 cursor-pointer">
                Deactivate
              </Label>
              <Switch
                id="deactivate-toggle"
                checked={isDeactivated}
                onCheckedChange={setIsDeactivated}
                disabled
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-gray-100"
              onClick={handleEdit}
            >
              <Edit2 className="h-4 w-4 text-gray-600" />
            </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <div className="w-full">
              <Label className="block text-xs font-medium text-gray-600 mb-1.5">Subject</Label>
              <Input
                value={subject}
                readOnly
                disabled
                className="w-full h-10 min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div className="w-full">
              <Label className="block text-xs font-medium text-gray-600 mb-1.5">Appointment Date & Time</Label>
              <Input
                value={formatDateTime()}
                readOnly
                disabled
                className="w-full h-10 min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <div className="w-full">
              <Label className="block text-xs font-medium text-gray-600 mb-1.5">Customer Name</Label>
              <Input
                value={customerName}
                readOnly
                disabled
                className="w-full h-10 min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div className="w-full">
              <Label className="block text-xs font-medium text-gray-600 mb-1.5">Employee Name</Label>
              <Input
                value={employeeName}
                readOnly
                disabled
                className="w-full h-10 min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="w-full">
            <Label className="block text-xs font-medium text-gray-600 mb-1.5">Appointment Note</Label>
            <Textarea
              value={note || "-"}
              readOnly
              disabled
              className="w-full min-h-[60px] border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div className="w-full">
            <Label className="block text-xs font-medium text-gray-600 mb-1.5">Repeated</Label>
            <Select value={repeated} disabled>
              <SelectTrigger className="w-full h-10 min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {repeatOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold text-gray-700">Share Appointments</p>
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={shareVia === "both" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-9 text-xs font-medium border-gray-300",
                  shareVia === "both" ? "bg-primary text-white border-primary" : "text-gray-700"
                )}
                onClick={() => setShareVia("both")}
              >
                Email & SMS
              </Button>
              <Button
                variant={shareVia === "email" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-9 text-xs font-medium border-gray-300",
                  shareVia === "email" ? "bg-primary text-white border-primary" : "text-gray-700"
                )}
                onClick={() => setShareVia("email")}
              >
                Email
              </Button>
              <Button
                variant={shareVia === "sms" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-9 text-xs font-medium border-gray-300",
                  shareVia === "sms" ? "bg-primary text-white border-primary" : "text-gray-700"
                )}
                onClick={() => setShareVia("sms")}
              >
                SMS
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={shareAudience === "customer" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-9 text-xs font-medium border-gray-300",
                  shareAudience === "customer" ? "bg-primary text-white border-primary" : "text-gray-700"
                )}
                onClick={() => setShareAudience("customer")}
              >
                Customer
              </Button>
              <Button
                variant={shareAudience === "employee" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-9 text-xs font-medium border-gray-300",
                  shareAudience === "employee" ? "bg-primary text-white border-primary" : "text-gray-700"
                )}
                onClick={() => setShareAudience("employee")}
              >
                Employee
              </Button>
              <Button
                variant={shareAudience === "both" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-9 text-xs font-medium border-gray-300",
                  shareAudience === "both" ? "bg-primary text-white border-primary" : "text-gray-700"
                )}
                onClick={() => setShareAudience("both")}
              >
                Both
              </Button>
            </div>

            <Button
              className="w-full h-10 bg-primary text-white rounded-lg mt-2 hover:bg-primary/90"
              onClick={() => {
                console.log("Share appointment", { shareVia, shareAudience });
                onClose();
              }}
            >
              Share
            </Button>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2 text-sm">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex flex-col items-center gap-1 text-gray-700 hover:bg-gray-50 px-1 py-2 h-auto"
            onClick={onCreateEstimate}
          >
            <FileText className="h-4 w-4" />
            <span className="text-[10px] leading-tight text-center">Create Estimate</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex flex-col items-center gap-1 text-gray-700 hover:bg-gray-50 px-1 py-2 h-auto"
            onClick={onCreateInvoice}
          >
            <Receipt className="h-4 w-4" />
            <span className="text-[10px] leading-tight text-center">Create Invoice</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex flex-col items-center gap-1 text-gray-700 hover:bg-gray-50 px-1 py-2 h-auto"
            onClick={onViewCustomer}
          >
            <User className="h-4 w-4" />
            <span className="text-[10px] leading-tight text-center">View Customer</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsModal;

