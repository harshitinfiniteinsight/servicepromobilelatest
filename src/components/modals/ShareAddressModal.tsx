import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockEmployees } from "@/data/mobileMockData";
import { toast } from "sonner";

interface ShareAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobAddress: string;
  estimateId?: string;
}

const ShareAddressModal = ({
  isOpen,
  onClose,
  jobAddress,
  estimateId,
}: ShareAddressModalProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedEmployee("all");
      setPhoneNumber("");
      setCountryCode("+1");
    }
  }, [isOpen]);

  const handleSend = () => {
    if (phoneNumber && phoneNumber.trim().length > 0) {
      toast.success(`Job address sent to ${countryCode}${phoneNumber}`);
    } else if (selectedEmployee === "all") {
      toast.success("Job address sent to all employees");
    } else {
      const employee = mockEmployees.find(emp => emp.id === selectedEmployee);
      toast.success(`Job address sent to ${employee?.name || "selected employee"}`);
    }
    onClose();
  };

  const activeEmployees = mockEmployees.filter(emp => emp.status === "Active");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden [&>button]:hidden">
        <DialogDescription className="sr-only">
          Share job address for estimate {estimateId}
        </DialogDescription>
        
        {/* Header with orange background */}
        <div className="bg-orange-500 text-white px-4 py-4 flex items-center justify-between safe-top">
          <h2 className="text-lg sm:text-xl font-bold text-white">Share Address</h2>
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
          {/* Job Address Display */}
          <div className="px-8 sm:px-10">
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-xs text-gray-500 mb-1 block">Job Address</Label>
              <p className="text-sm font-medium text-gray-900">{jobAddress}</p>
            </div>
          </div>

          <div className="space-y-3 px-8 sm:px-10">
            <Label className="text-sm text-gray-600 font-semibold">Select Employee</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Choose employee" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover">
                <SelectItem value="all" className="text-base">All Employees</SelectItem>
                {activeEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id} className="text-base">
                    {employee.name} - {employee.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-center text-lg font-semibold text-gray-400 py-2 px-8 sm:px-10">
            OR
          </div>

          <div className="space-y-3 px-8 sm:px-10">
            <Label className="text-sm text-gray-600 font-semibold">Enter Phone Number</Label>
            <div className="flex gap-2">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-24 h-11 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover">
                  <SelectItem value="+1">+1</SelectItem>
                  <SelectItem value="+44">+44</SelectItem>
                  <SelectItem value="+91">+91</SelectItem>
                  <SelectItem value="+86">+86</SelectItem>
                  <SelectItem value="+81">+81</SelectItem>
                  <SelectItem value="+49">+49</SelectItem>
                  <SelectItem value="+33">+33</SelectItem>
                  <SelectItem value="+61">+61</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Phone number"
                className="flex-1 h-11 text-base"
              />
            </div>
          </div>

          <div className="px-8 sm:px-10 pt-2 pb-4">
            <Button 
              onClick={handleSend} 
              className="w-full border-2 border-orange-500 text-orange-500 bg-white hover:bg-orange-50 font-semibold py-4 px-6 text-base"
            >
              SEND
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareAddressModal;

