import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, Star } from "lucide-react";
import StarRating from "@/components/common/StarRating";

interface ViewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    customerName: string;
    technicianName?: string;
  };
  feedback?: {
    rating: number;
    comment: string;
    submittedAt: string;
  };
}

const ViewFeedbackModal = ({
  isOpen,
  onClose,
  job,
  feedback,
}: ViewFeedbackModalProps) => {
  // If no feedback provided, show placeholder
  const displayFeedback = feedback || {
    rating: 0,
    comment: "No feedback submitted yet.",
    submittedAt: "",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] sm:w-[95%] max-w-md p-0 gap-0 rounded-[20px] max-h-[90vh] overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Feedback</DialogTitle>
        <DialogDescription className="sr-only">
          View feedback for {job.title}
        </DialogDescription>
        
        {/* Header */}
        <div className="bg-orange-500 text-white px-5 py-4 flex items-center justify-between safe-top rounded-t-[20px]">
          <h2 className="text-lg sm:text-xl font-bold text-white">Feedback</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-orange-600 h-9 w-9 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="px-5 py-5 overflow-y-auto max-h-[calc(90vh-140px)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          {/* Customer Name */}
          <div className="mb-4">
            <Label className="text-sm font-semibold block mb-2" style={{ color: '#333' }}>Customer Name</Label>
            <Input
              type="text"
              value={job.customerName}
              disabled
              readOnly
              className="bg-gray-50 text-gray-700 cursor-not-allowed rounded-lg h-10 border" 
              style={{ borderColor: '#E5E5E5' }}
            />
          </div>

          {/* Employee Name */}
          <div className="mb-4">
            <Label className="text-sm font-semibold block mb-2" style={{ color: '#333' }}>Employee Name</Label>
            <Input
              type="text"
              value={job.technicianName || "N/A"}
              disabled
              readOnly
              className="bg-gray-50 text-gray-700 cursor-not-allowed rounded-lg h-10 border"
              style={{ borderColor: '#E5E5E5' }}
            />
          </div>

          {/* Service */}
          <div className="mb-4">
            <Label className="text-sm font-semibold block mb-2" style={{ color: '#333' }}>Service</Label>
            <Input
              type="text"
              value={job.title}
              disabled
              readOnly
              className="bg-gray-50 text-gray-700 cursor-not-allowed rounded-lg h-10 border"
              style={{ borderColor: '#E5E5E5' }}
            />
          </div>

          {/* Star Rating */}
          {displayFeedback.rating > 0 && (
            <div className="mb-4">
              <Label className="text-sm font-semibold block mb-2" style={{ color: '#333' }}>Rating</Label>
              <div className="flex items-center">
                <StarRating
                  rating={displayFeedback.rating}
                  onRatingChange={() => {}} // Read-only
                  maxRating={5}
                  size="sm"
                  disabled={true}
                />
                <span className="ml-3 text-sm font-semibold" style={{ color: '#333' }}>
                  {displayFeedback.rating}/5
                </span>
              </div>
            </div>
          )}

          {/* Feedback Text */}
          <div className="mb-4">
            <Label className="text-sm font-semibold block mb-2" style={{ color: '#333' }}>Feedback</Label>
            <div 
              className="rounded-xl border bg-gray-50 p-4 min-h-[120px]"
              style={{ 
                borderColor: '#E5E5E5',
                padding: '12px 14px'
              }}
            >
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {displayFeedback.comment || "No feedback provided."}
              </p>
            </div>
          </div>

          {/* Submitted Date */}
          {displayFeedback.submittedAt && (
            <div className="mb-4">
              <Label className="text-xs block mb-1" style={{ color: '#666' }}>Submitted on</Label>
              <p className="text-sm" style={{ color: '#666' }}>{displayFeedback.submittedAt}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 bg-white rounded-b-[20px]" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
          <Button
            onClick={onClose}
            className="w-full font-bold text-white transition-all rounded-2xl bg-[#F57C00] hover:bg-[#E65100] active:scale-[0.98]"
            style={{ 
              height: '52px',
              marginTop: '16px',
              marginBottom: '16px'
            }}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewFeedbackModal;

