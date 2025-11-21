import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X } from "lucide-react";

interface ACHSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACHSuccessModal = ({ isOpen, onClose }: ACHSuccessModalProps) => {
  return (
    <>
      {/* Custom backdrop opacity style */}
      <style>{`
        [data-radix-dialog-overlay][data-state="open"] {
          background-color: rgba(0, 0, 0, 0.45) !important;
        }
      `}</style>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-[320px] w-[85%] p-0 gap-0 rounded-[20px] overflow-hidden [&>button]:hidden bg-white m-0 fixed left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] h-auto shadow-xl z-[60] animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogTitle className="sr-only">Success</DialogTitle>
        <DialogDescription className="sr-only">
          ACH payment success modal
        </DialogDescription>
        {/* Header with close icon */}
        <div className="flex justify-end p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
        
        <div className="flex flex-col items-center px-6 pb-8 bg-white rounded-[20px]">
          {/* Success Icon - 56-64px */}
          <div className="w-16 h-16 rounded-full border-4 border-[#FF8A3C] flex items-center justify-center mb-5 bg-white">
            <CheckCircle2 className="w-9 h-9 text-[#FF8A3C]" strokeWidth={2.5} />
          </div>

          {/* Title - Orange colored, 18-20px */}
          <h2 className="text-[19px] font-medium text-[#FF8A3C] mb-3 text-center">Success</h2>

          {/* Message - Grey subtitle, 14px, max width 260px */}
          <p className="text-sm text-[#6B6B6B] text-center mb-6 leading-relaxed max-w-[260px]">
            Your payment is being processed and will be confirmed once settled
          </p>
        </div>
      </DialogContent>
      </Dialog>
    </>
  );
};

export default ACHSuccessModal;

