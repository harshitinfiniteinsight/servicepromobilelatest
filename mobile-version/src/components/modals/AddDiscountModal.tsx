import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { toast } from "sonner";

interface AddDiscountModalProps {
  open: boolean;
  onClose: () => void;
  onAdd?: (discount: {
    name: string;
    value: number;
    type: "%" | "$";
    isDefault: boolean;
  }) => void;
  onBack?: () => void;
}

const AddDiscountModal = ({
  open,
  onClose,
  onAdd,
  onBack,
}: AddDiscountModalProps) => {
  const [discountName, setDiscountName] = useState("");
  const [discountValue, setDiscountValue] = useState<string>("");
  const [discountType, setDiscountType] = useState<"%" | "$">("%");
  const [isDefault, setIsDefault] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setDiscountName("");
      setDiscountValue("");
      setDiscountType("%");
      setIsDefault(false);
    }
  }, [open]);

  const handleAdd = () => {
    // Validation
    if (!discountName.trim()) {
      toast.error("Please enter a discount name");
      return;
    }

    const value = parseFloat(discountValue);
    if (isNaN(value) || value <= 0) {
      toast.error("Please enter a valid discount value greater than 0");
      return;
    }

    if (onAdd) {
      onAdd({
        name: discountName.trim(),
        value: value,
        type: discountType,
        isDefault: isDefault,
      });
    } else {
      // Mock add - in real app, this would call an API
      console.info("Adding discount", {
        name: discountName.trim(),
        value: value,
        type: discountType,
        isDefault: isDefault,
      });
      toast.success("Discount added successfully");
    }

    // Close modal and reset form
    handleClose();
  };

  const handleClose = () => {
    setDiscountName("");
    setDiscountValue("");
    setDiscountType("%");
    setIsDefault(false);
    onClose();
  };

  const handleBack = () => {
    handleClose();
    if (onBack) {
      onBack();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] max-w-sm mx-auto p-5 rounded-2xl shadow-lg bg-white [&>button]:hidden">
        <DialogDescription className="sr-only">
          Add discount modal
        </DialogDescription>
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
          <DialogTitle className="text-base font-semibold text-gray-800">Add Discount</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-gray-100"
            onClick={handleClose}
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </DialogHeader>

        {/* Form Fields */}
        <div className="space-y-3 mt-3">
          {/* Discount Name */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Discount Name</Label>
            <Input
              type="text"
              placeholder="Enter discount name"
              value={discountName}
              onChange={(e) => setDiscountName(e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          {/* Discount Value and Type - Same Row */}
          <div className="grid grid-cols-[1fr,auto] gap-2.5 items-end">
            {/* Discount Value */}
            <div className="flex-1 min-w-0">
              <Label className="text-sm font-medium text-gray-700">Discount Value</Label>
              <Input
                type="number"
                placeholder="Enter value"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                min="0"
                step="0.01"
              />
            </div>

            {/* Discount Type Toggle */}
            <div className="flex-shrink-0">
              <Label className="text-sm font-medium text-gray-700 block mb-1 whitespace-nowrap">Type</Label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  className={`border rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 min-w-[44px] ${
                    discountType === "%"
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                  onClick={() => setDiscountType("%")}
                >
                  %
                </button>
                <button
                  type="button"
                  className={`border rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 min-w-[44px] ${
                    discountType === "$"
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                  onClick={() => setDiscountType("$")}
                >
                  $
                </button>
              </div>
            </div>
          </div>

          {/* Default Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="defaultDiscount"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked === true)}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
            />
            <Label
              htmlFor="defaultDiscount"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Set as Default
            </Label>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-3 mt-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={handleBack}
            className="text-gray-700 border-gray-300 rounded-lg py-1.5 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-1.5 text-sm"
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDiscountModal;

