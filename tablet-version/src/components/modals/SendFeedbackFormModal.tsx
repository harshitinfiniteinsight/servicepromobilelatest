import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Mail, FileText } from "lucide-react";
import SendEmailModal from "./SendEmailModal";

interface SendFeedbackFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    customerName: string;
    technicianName?: string;
  };
  customerEmail: string;
  onSend: () => void;
  onFillForm?: () => void;
}

const SendFeedbackFormModal = ({
  isOpen,
  onClose,
  job,
  customerEmail,
  onSend,
  onFillForm,
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

  const handleFillFormClick = () => {
    // Close the send modal first
    onClose();
    // Trigger the callback to open feedback form modal (managed at parent level)
    if (onFillForm) {
      onFillForm();
    }
  };

  const handleEmailClick = () => {
    setShowEmailModal(true);
  };

  const handleEmailClose = () => {
    setShowEmailModal(false);
    // Assume email was sent when modal closes (in production, this would be a callback from SendEmailModal)
    setEmailSent(true);
  };

  if (!job) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden [&>button]:hidden">
          <DialogTitle className="sr-only">Send Feedback Form</DialogTitle>
          <DialogDescription className="sr-only">
            Send feedback form for {job?.title || 'job'}
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
              
              {/* Option 1: Fill Feedback Form */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3 px-4 border-2 hover:border-orange-500 hover:bg-orange-50 active:bg-orange-100 transition-colors"
                onClick={handleFillFormClick}
              >
                <FileText className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">Fill Feedback Form</div>
                  <div className="text-xs text-gray-500">Open the feedback form now</div>
                </div>
              </Button>

              {/* Option 2: Send Email */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3 px-4 border-2 hover:border-orange-500 hover:bg-orange-50 active:bg-orange-100 transition-colors"
                onClick={handleEmailClick}
                disabled={!customerEmail}
              >
                <Mail className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">Send Email</div>
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

