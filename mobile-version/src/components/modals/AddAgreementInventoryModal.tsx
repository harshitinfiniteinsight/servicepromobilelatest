import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { toast } from "sonner";

interface AddAgreementInventoryModalProps {
  open: boolean;
  onClose: () => void;
  availableInventory: Array<{
    id: string;
    name: string;
    sku: string;
  }>;
  onAdd?: (inventoryId: string) => void;
}

const AddAgreementInventoryModal = ({
  open,
  onClose,
  availableInventory,
  onAdd,
}: AddAgreementInventoryModalProps) => {
  const [selectedInventory, setSelectedInventory] = useState<string>("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setSelectedInventory("");
    }
  }, [open]);

  const handleSave = () => {
    if (!selectedInventory) {
      toast.error("Please select an inventory item");
      return;
    }

    if (onAdd) {
      onAdd(selectedInventory);
    } else {
      // Mock add - in real app, this would call an API
      console.info("Adding inventory to agreement", selectedInventory);
      toast.success("Inventory added to agreement successfully");
    }

    onClose();
  };

  const handleClose = () => {
    setSelectedInventory("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[92%] max-w-sm mx-auto p-4 rounded-2xl shadow-lg bg-white [&>button]:hidden max-h-[85vh] overflow-y-auto">
        <DialogDescription className="sr-only">
          Add agreement inventory modal
        </DialogDescription>
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
          <DialogTitle className="text-base font-semibold text-gray-900">Add Agreement Inventory</DialogTitle>
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
        <div className="space-y-2 pt-2">
          {/* Explanatory Text */}
          <div className="text-xs text-gray-600 leading-relaxed space-y-1.5">
            <p>
              Every E-sign agreement comes with default inventory. You may edit the default inventory name by going to the inventory item and updating the name and information.
            </p>
            <p className="font-semibold text-gray-700 text-xs">
              IMPORTANT: You may only use <em>Variable</em> inventory for the E-sign agreement.
            </p>
            <p>
              When adding inventory for the E-sign Agreement, make sure to choose <em>Variable</em> under the field Price Type.
            </p>
            <p>
              Once saved, you will see the newly added variable inventory inside the E-sign Agreement inventory. Choose the newly created inventory and add it to the E-sign agreement as per your requirements or select an existing inventory shown below.
            </p>
          </div>

          {/* Form Field */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-700">Select Agreement Inventory *</Label>
            <Select value={selectedInventory} onValueChange={setSelectedInventory}>
              <SelectTrigger className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 h-8">
                <SelectValue placeholder="Choose inventory" />
              </SelectTrigger>
              <SelectContent>
                {availableInventory.length === 0 ? (
                  <SelectItem value="no-items" disabled>
                    No variable inventory available
                  </SelectItem>
                ) : (
                  availableInventory.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.sku})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-orange-500 text-white rounded-lg py-1.5 text-xs font-medium hover:bg-orange-600"
            >
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAgreementInventoryModal;

