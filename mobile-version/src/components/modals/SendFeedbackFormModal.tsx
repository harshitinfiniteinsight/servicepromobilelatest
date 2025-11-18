import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Mail } from "lucide-react";
import SendEmailModal from "./SendEmailModal";

interface SendFeedbackFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    customerName: string;
  };
  customerEmail: string;
  onSend: () => void;
}

const SendFeedbackFormModal = ({
  isOpen,
  onClose,
  job,
  customerEmail,
  onSend,
}: SendFeedbackFormModalProps) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Track when email modal closes after sending
  useEffect(() => {
    if (!showEmailModal && emailSent) {
      onSend();
      setEmailSent(false);
    }
  }, [showEmailModal, emailSent, onSend]);

  const handleEmailClick = () => {
    setShowEmailModal(true);
  };

  const handleEmailClose = () => {
    setShowEmailModal(false);
    // Assume email was sent when modal closes (in production, this would be a callback from SendEmailModal)
    setEmailSent(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden [&>button]:hidden">
          <DialogDescription className="sr-only">
            Send feedback form for {job.title}
          </DialogDescription>
          
          {/* Header */}
          <div className="bg-orange-500 text-white px-4 py-4 flex items-center justify-between safe-top">
            <h2 className="text-lg sm:text-xl font-bold text-white">Send Feedback Form</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-orange-600 h-9 w-9 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="px-4 py-6 space-y-4 overflow-y-auto max-h-[calc(85vh-80px)]">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Send feedback form to <span className="font-semibold text-gray-900">{job.customerName}</span> for job:
              </p>
              <p className="text-base font-semibold text-gray-900">{job.title}</p>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-sm font-semibold text-gray-900">Choose delivery method:</Label>
              
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3 px-4 border-2 hover:border-orange-500 hover:bg-orange-50"
                onClick={handleEmailClick}
                disabled={!customerEmail}
              >
                <Mail className="h-5 w-5 text-orange-500" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">Email</div>
                  <div className="text-xs text-gray-500">{customerEmail || "No email available"}</div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Modal */}
      {customerEmail && (
        <SendEmailModal
          isOpen={showEmailModal}
          onClose={handleEmailClose}
          customerEmail={customerEmail}
          customerName={job.customerName}
        />
      )}
    </>
  );
};

export default SendFeedbackFormModal;

