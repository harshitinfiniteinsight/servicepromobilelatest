import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const BottomSheet = ({ open, onOpenChange, title, children, className }: BottomSheetProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-md bottom-0 top-auto translate-y-0 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom rounded-t-2xl rounded-b-none p-0 max-h-[90vh] overflow-hidden",
          className
        )}
      >
        {title && (
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        <div className="p-4 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BottomSheet;


