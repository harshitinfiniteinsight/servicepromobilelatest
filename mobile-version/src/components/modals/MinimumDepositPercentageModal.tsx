import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { toast } from "sonner";

interface MinimumDepositPercentageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MinimumDepositPercentageModal = ({ isOpen, onClose }: MinimumDepositPercentageModalProps) => {
  const [depositPercentage, setDepositPercentage] = useState("10");

  const handleSave = () => {
    const value = parseFloat(depositPercentage);
    if (isNaN(value) || value < 0 || value > 100) {
      toast.error("Please enter a valid percentage between 0 and 100");
      return;
    }
    
    // Persist the deposit percentage (connect to backend if applicable)
    toast.success(`Minimum deposit percentage set to ${value}%`);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      // Only update if empty or within valid range
      if (value === "" || (!isNaN(numValue) && numValue >= 0 && numValue <= 100)) {
        setDepositPercentage(value);
      }
    }
  };

  const handleBlur = () => {
    // Ensure value is within bounds on blur
    const value = parseFloat(depositPercentage);
    if (isNaN(value)) {
      setDepositPercentage("10");
    } else if (value < 0) {
      setDepositPercentage("0");
    } else if (value > 100) {
      setDepositPercentage("100");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-md rounded-xl p-0 gap-0 [&>button]:hidden">
        <DialogDescription className="sr-only">
          Minimum deposit percentage settings modal
        </DialogDescription>
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Minimum Deposit Percentage
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

        <div className="px-4 py-6 flex flex-col items-center space-y-5">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-700">
            <span>Set minimum deposit amount to accept Agreement</span>
            <div className="relative">
              <Input
                type="number"
                value={depositPercentage}
                onChange={handleInputChange}
                onBlur={handleBlur}
                min="0"
                max="100"
                step="0.1"
                className="w-20 text-center text-base font-medium border-2 border-gray-300 rounded-md py-2 pr-6 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                placeholder="10"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                %
              </span>
            </div>
          </div>
          
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-white rounded-md px-6 py-2 font-semibold text-sm w-4/5 max-w-xs mt-4"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MinimumDepositPercentageModal;

