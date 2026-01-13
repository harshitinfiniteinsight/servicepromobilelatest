import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { toast } from "sonner";

interface LowInventoryAlertModalProps {
  open: boolean;
  onClose: () => void;
  itemId: string | null;
  currentThreshold?: number;
  onSave?: (itemId: string, threshold: number) => void;
}

const LowInventoryAlertModal = ({
  open,
  onClose,
  itemId,
  currentThreshold,
  onSave,
}: LowInventoryAlertModalProps) => {
  const [threshold, setThreshold] = useState<string>("");

  // Pre-fill threshold when modal opens
  useEffect(() => {
    if (open && currentThreshold !== undefined) {
      setThreshold(currentThreshold.toString());
    } else if (open) {
      setThreshold("");
    }
  }, [open, currentThreshold]);

  const handleSave = () => {
    const thresholdValue = parseInt(threshold, 10);
    
    if (!threshold || isNaN(thresholdValue) || thresholdValue <= 0) {
      toast.error("Please enter a valid threshold greater than 0");
      return;
    }

    if (!itemId) {
      toast.error("Inventory item not found");
      return;
    }

    if (onSave) {
      onSave(itemId, thresholdValue);
    } else {
      // Mock save - in real app, this would call an API
      console.info("Saving low inventory alert threshold", itemId, thresholdValue);
      toast.success("Low inventory alert updated successfully");
    }

    onClose();
  };

  const handleClose = () => {
    setThreshold("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm w-[90%] mx-auto p-4 rounded-2xl shadow-lg bg-white [&>button]:hidden">
        <DialogDescription className="sr-only">
          Low inventory alert settings modal
        </DialogDescription>
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold text-gray-900">Low Inventory Alert</DialogTitle>
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
        <div className="space-y-4 pt-4">
          <div>
            <Label className="text-sm text-gray-700 font-medium">Enter Minimum Quantity</Label>
            <Input
              type="number"
              placeholder="Enter minimum quantity"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              min="1"
              className="w-full h-10 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 mt-1"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-orange-500 text-white rounded-lg w-full py-2 font-medium hover:bg-orange-600"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LowInventoryAlertModal;

