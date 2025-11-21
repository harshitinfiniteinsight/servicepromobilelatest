import { CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

const PaymentSuccessModal = ({ isOpen, onClose, total }: PaymentSuccessModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[calc(100%-2rem)] p-6 gap-0 rounded-2xl [&>button]:hidden">
        <DialogTitle className="sr-only">Success</DialogTitle>
        <DialogDescription className="sr-only">
          Payment success modal for amount ${total.toFixed(2)}
        </DialogDescription>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-orange-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Success</h3>
            <p className="text-sm text-gray-600 mb-1">Payment received successfully</p>
            <p className="text-lg font-semibold text-orange-600">${total.toFixed(2)}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl"
          >
            Continue
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSuccessModal;


