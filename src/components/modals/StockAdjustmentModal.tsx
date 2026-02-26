import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { toast } from "sonner";

interface StockAdjustmentModalProps {
  open: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    sku: string;
    stock: number;
  } | null;
  onSave?: (itemId: string, adjustment: number, transactionType: "stock-in" | "stock-out", reason: string, remarks: string) => void;
  initialTransactionType?: "stock-in" | "stock-out";
  initialAdjustmentReason?: string;
  initialRemarks?: string;
  initialAdjustBy?: string;
}

const StockAdjustmentModal = ({
  open,
  onClose,
  item,
  onSave,
  initialTransactionType,
  initialAdjustmentReason,
  initialRemarks,
  initialAdjustBy,
}: StockAdjustmentModalProps) => {
  const [adjustBy, setAdjustBy] = useState<string>("");
  const [transactionType, setTransactionType] = useState<"stock-in" | "stock-out">("stock-out");
  const [adjustmentReason, setAdjustmentReason] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  // Reset form when modal opens/closes or when initial values change
  useEffect(() => {
    if (open) {
      setAdjustBy(initialAdjustBy || "");
      setTransactionType(initialTransactionType || "stock-out");
      setAdjustmentReason(initialAdjustmentReason || "");
      setRemarks(initialRemarks || "");
    }
  }, [open, initialTransactionType, initialAdjustmentReason, initialRemarks, initialAdjustBy]);

  // Track if this is the initial load to prevent resetting adjustment reason
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (open) {
      setIsInitialLoad(true);
      // Reset flag after a brief delay to allow initial values to be set
      const timer = setTimeout(() => setIsInitialLoad(false), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    // Only reset adjustment reason if transaction type changes after initial load
    if (open && !isInitialLoad && transactionType) {
      // Don't reset if we have an initial reason and the transaction type matches initial
      if (!(initialAdjustmentReason && transactionType === initialTransactionType)) {
        setAdjustmentReason("");
      }
    }
  }, [transactionType, open, isInitialLoad, initialAdjustmentReason, initialTransactionType]);

  const handleSave = () => {
    const adjustmentValue = parseInt(adjustBy, 10);
    
    if (!adjustBy || isNaN(adjustmentValue) || adjustmentValue <= 0) {
      toast.error("Please enter a valid adjustment amount greater than 0");
      return;
    }

    if (!adjustmentReason) {
      toast.error("Please select an adjustment reason");
      return;
    }

    if (!item) {
      toast.error("Inventory item not found");
      return;
    }

    if (onSave) {
      onSave(item.id, adjustmentValue, transactionType, adjustmentReason, remarks);
    } else {
      // Mock save - in real app, this would call an API
      console.info("Saving stock adjustment", {
        itemId: item.id,
        adjustment: adjustmentValue,
        transactionType,
        reason: adjustmentReason,
        remarks,
      });
      toast.success("Stock adjustment saved successfully");
    }

    onClose();
  };

  const handleClose = () => {
    setAdjustBy("");
    setTransactionType("stock-out");
    setAdjustmentReason("");
    setRemarks("");
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[92%] max-w-sm mx-auto p-4 rounded-2xl shadow-lg bg-white [&>button]:hidden max-h-[85vh] overflow-y-auto">
        <DialogDescription className="sr-only">
          Stock adjustment modal for {item?.name || "inventory item"}
        </DialogDescription>
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold text-gray-900">Stock Adjustment</DialogTitle>
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
        <div className="space-y-3 pt-3">
          {/* Item Information */}
          <div className="space-y-1.5">
            <h3 className="font-semibold text-gray-700 text-sm mb-1.5">Item Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-600">Inventory Name</Label>
                <Input
                  type="text"
                  value={item.name}
                  readOnly
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-gray-50 text-gray-600"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-600">SKU</Label>
                <Input
                  type="text"
                  value={item.sku}
                  readOnly
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Quantity Adjustment */}
          <div className="space-y-1.5">
            <h3 className="font-semibold text-gray-700 text-sm mb-1.5">Quantity Adjustment</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-600">Current For-Sale Qty</Label>
                <Input
                  type="number"
                  value={item.stock}
                  readOnly
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-gray-50 text-gray-600"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-600">Adjust By *</Label>
                <Input
                  type="number"
                  placeholder="Enter adjustment amount"
                  value={adjustBy}
                  onChange={(e) => setAdjustBy(e.target.value)}
                  min="1"
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600">Transaction Type</Label>
              <div className="flex gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="transactionType"
                    value="stock-out"
                    checked={transactionType === "stock-out"}
                    onChange={() => setTransactionType("stock-out")}
                    className="w-3.5 h-3.5 text-orange-500 border-gray-300 focus:ring-orange-500"
                  />
                  <span className="text-xs text-gray-700">Stock-Out</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="transactionType"
                    value="stock-in"
                    checked={transactionType === "stock-in"}
                    onChange={() => setTransactionType("stock-in")}
                    className="w-3.5 h-3.5 text-orange-500 border-gray-300 focus:ring-orange-500"
                  />
                  <span className="text-xs text-gray-700">Stock-In</span>
                </label>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-1.5">
            <h3 className="font-semibold text-gray-700 text-sm mb-1.5">Additional Information</h3>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600">Adjustment Reason</Label>
              <Select value={adjustmentReason} onValueChange={setAdjustmentReason}>
                <SelectTrigger className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 h-9">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {transactionType === "stock-out" ? (
                    <>
                      <SelectItem value="Correction">Correction</SelectItem>
                      <SelectItem value="Theft or Loss">Theft or Loss</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Received Inventory">Received Inventory</SelectItem>
                      <SelectItem value="Correction">Correction</SelectItem>
                      <SelectItem value="Return or Restock">Return or Restock</SelectItem>
                      <SelectItem value="Marked as Damaged">Marked as Damaged</SelectItem>
                      <SelectItem value="Marked as Demo Units">Marked as Demo Units</SelectItem>
                      <SelectItem value="Marked for Internal/Self Use">Marked for Internal/Self Use</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600">Remarks</Label>
              <Textarea
                placeholder="Enter remarks here"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 resize-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-orange-500 text-white rounded-lg py-2 text-xs font-medium hover:bg-orange-600"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockAdjustmentModal;

