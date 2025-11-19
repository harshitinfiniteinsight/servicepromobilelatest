import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { toast } from "sonner";

interface AssignEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  equipmentId: string | null;
  currentEmployeeId: string | null;
  availableEmployees: Array<{
    id: string;
    name: string;
  }>;
  onSave?: (equipmentId: string, employeeId: string | null) => void;
}

const AssignEmployeeModal = ({
  open,
  onClose,
  equipmentId,
  currentEmployeeId,
  availableEmployees,
  onSave,
}: AssignEmployeeModalProps) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("unassign");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setSelectedEmployeeId(currentEmployeeId || "unassign");
    }
  }, [open, currentEmployeeId]);

  const handleSave = () => {
    if (!equipmentId) {
      toast.error("Equipment not found");
      return;
    }

    const employeeIdToSave = selectedEmployeeId === "unassign" ? null : selectedEmployeeId;

    if (onSave) {
      onSave(equipmentId, employeeIdToSave);
    } else {
      // Mock save - in real app, this would call an API
      console.info("Assigning employee to equipment", {
        equipmentId,
        employeeId: employeeIdToSave,
      });
      toast.success("Employee assigned successfully");
    }

    onClose();
  };

  const handleClose = () => {
    setSelectedEmployeeId("unassign");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] max-w-sm mx-auto p-5 rounded-2xl shadow-lg bg-white [&>button]:hidden">
        <DialogDescription className="sr-only">
          Assign employee to equipment modal
        </DialogDescription>
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold text-gray-800">Assign Employee</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-gray-100"
            onClick={handleClose}
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </DialogHeader>

        {/* Content */}
        <div className="mt-3 space-y-3">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1.5">Employee</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassign">Unassign</SelectItem>
                {availableEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-5">
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-lg text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignEmployeeModal;

