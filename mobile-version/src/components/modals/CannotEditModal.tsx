import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface CannotEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobType: "Estimate" | "Invoice" | "Agreement";
  onCreateNew: () => void;
}

const CannotEditModal = ({
  open,
  onOpenChange,
  jobType,
  onCreateNew,
}: CannotEditModalProps) => {
  const handleCreateNew = () => {
    onCreateNew();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">Cannot Edit</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Paid {jobType.toLowerCase()} cannot be edited
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            You cannot make changes to a paid {jobType === "Invoice" ? "invoice" : jobType === "Estimate" ? "estimate" : "agreement"}. Create a new one.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button className="flex-1" onClick={handleCreateNew}>
            Create New
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CannotEditModal;

