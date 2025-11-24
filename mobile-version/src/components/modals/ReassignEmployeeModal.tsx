import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockEmployees } from "@/data/mobileMockData";
import { toast } from "sonner";

interface ReassignEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmployeeId?: string;
  estimateId?: string;
  onSave?: (employeeId: string) => void;
}

const ReassignEmployeeModal = ({
  isOpen,
  onClose,
  currentEmployeeId,
  estimateId,
  onSave,
}: ReassignEmployeeModalProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setSelectedEmployee(currentEmployeeId || "");
    }
  }, [isOpen, currentEmployeeId]);

  const handleSave = () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    if (onSave) {
      onSave(selectedEmployee);
    } else {
      // Fallback behavior if onSave not provided
      const employee = mockEmployees.find(emp => emp.id === selectedEmployee);
      if (employee) {
        toast.success(`Employee reassigned to ${employee.name}`);
        onClose();
      }
    }
  };

  const activeEmployees = mockEmployees.filter(emp => emp.status === "Active");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Reassign Employee</DialogTitle>
        <DialogDescription className="sr-only">
          Reassign employee for estimate {estimateId}
        </DialogDescription>
        
        {/* Header with orange background */}
        <div className="bg-orange-500 text-white px-4 py-4 flex items-center justify-between safe-top">
          <h2 className="text-lg sm:text-xl font-bold text-white">Reassign Employee</h2>
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
            <Label className="text-sm text-gray-600 font-semibold">Select New Employee</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Choose employee" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover">
                {activeEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id} className="text-base">
                    {employee.name} - {employee.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="px-8 sm:px-10 pt-2 pb-4">
            <Button 
              onClick={handleSave} 
              className="w-full border-2 border-orange-500 text-orange-500 bg-white hover:bg-orange-50 font-semibold py-4 px-6 text-base"
            >
              SAVE
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReassignEmployeeModal;

