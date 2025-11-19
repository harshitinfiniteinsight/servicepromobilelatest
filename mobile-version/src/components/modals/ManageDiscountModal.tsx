import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";

interface Discount {
  id: string;
  name: string;
  value: number;
  type: "%" | "$";
  startDate: string;
  endDate: string;
  active: boolean;
  usageCount: number;
}

interface ManageDiscountModalProps {
  open: boolean;
  onClose: () => void;
  discounts: Discount[];
  onAdd?: () => void;
  onEdit?: (discount: Discount) => void;
  onDelete?: (discountId: string) => void;
}

const ManageDiscountModal = ({
  open,
  onClose,
  discounts,
  onAdd,
  onEdit,
  onDelete,
}: ManageDiscountModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter discounts based on search query
  const filteredDiscounts = useMemo(() => {
    if (!searchQuery.trim()) {
      return discounts;
    }
    const query = searchQuery.toLowerCase();
    return discounts.filter(
      (discount) =>
        discount.name.toLowerCase().includes(query) ||
        discount.value.toString().includes(query) ||
        discount.type.toLowerCase().includes(query)
    );
  }, [discounts, searchQuery]);

  const handleEdit = (discount: Discount) => {
    if (onEdit) {
      onEdit(discount);
    } else {
      toast.info("Edit discount functionality");
    }
  };

  const handleDelete = (discountId: string) => {
    if (onDelete) {
      onDelete(discountId);
    } else {
      toast.info("Delete discount functionality");
    }
  };

  const formatDiscountValue = (value: number, type: "%" | "$") => {
    if (type === "%") {
      return `${value}%`;
    }
    return `$${value}`;
  };

  // Reset search when modal closes
  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] max-w-sm mx-auto p-4 rounded-2xl shadow-lg bg-white [&>button]:hidden max-h-[80vh] flex flex-col">
        <DialogDescription className="sr-only">
          Manage discounts modal
        </DialogDescription>
        {/* Header */}
        <DialogHeader className="flex flex-row justify-between items-center pb-2 border-b border-gray-100 flex-shrink-0 mb-3">
          <DialogTitle className="text-base font-semibold text-gray-800">Manage Discount</DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                if (onAdd) {
                  onAdd();
                } else {
                  toast.info("Add discount functionality");
                }
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm px-2.5 py-1.5 shadow-sm"
            >
              + Add
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-9 w-9 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </DialogHeader>

        {/* Search Field */}
        <div className="flex-shrink-0 mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search discounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Existing Discounts - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pb-20 pr-1">
          {filteredDiscounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">
                {searchQuery.trim() ? "No discounts found" : "No discounts available"}
              </p>
            </div>
          ) : (
            filteredDiscounts.map((discount) => (
              <div
                key={discount.id}
                className="flex justify-between items-center border border-gray-200 rounded-lg p-2.5 bg-white shadow-sm"
              >
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-800">{discount.name}</span>
                  <span className="text-xs text-gray-600 mt-0.5">
                    Value: {formatDiscountValue(discount.value, discount.type)} • Type: {discount.type === "%" ? "Percentage" : "Fixed"}
                  </span>
                </div>

                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(discount)}
                    className="text-gray-500 hover:text-orange-500 transition-colors p-1"
                    aria-label="Edit discount"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(discount.id)}
                    className="text-gray-500 hover:text-red-500 transition-colors p-1"
                    aria-label="Delete discount"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default ManageDiscountModal;

