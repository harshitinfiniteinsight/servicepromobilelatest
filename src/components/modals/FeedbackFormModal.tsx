import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import StarRating from "@/components/common/StarRating";
import { toast } from "sonner";

interface FeedbackFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    customerName: string;
    technicianName?: string;
  };
  onSubmit?: (feedback: {
    rating: number;
    comment: string;
    jobId: string;
  }) => void;
}

const FeedbackFormModal = ({
  isOpen,
  onClose,
  job,
  onSubmit,
}: FeedbackFormModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setComment("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    const feedbackData = {
      rating,
      comment: comment.trim(),
      jobId: job.id,
    };

    if (onSubmit) {
      onSubmit(feedbackData);
    } else {
      // Default behavior: show success toast
      toast.success("Feedback submitted successfully");
    }

    // Close modal and reset form
    onClose();
    setRating(0);
    setComment("");
  };

  const isSubmitDisabled = rating === 0 || !comment.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] sm:w-[95%] max-w-md p-0 gap-0 rounded-[20px] max-h-[90vh] overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Submit Feedback</DialogTitle>
        <DialogDescription className="sr-only">
          Submit feedback for {job.title}
        </DialogDescription>
        
        {/* Header */}
        <div className="bg-orange-500 text-white px-5 py-4 flex items-center justify-between safe-top rounded-t-[20px]">
          <h2 className="text-lg sm:text-xl font-bold text-white">Submit Feedback</h2>
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
        <div className="px-5 py-5 overflow-y-auto max-h-[calc(90vh-200px)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
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
          <div className="mb-4">
            <Label className="text-sm font-semibold block mb-2" style={{ color: '#333' }}>
              Rating <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center">
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                maxRating={5}
                size="sm"
              />
            </div>
            {rating > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {rating} out of 5 stars
              </p>
            )}
          </div>

          {/* Feedback Textarea */}
          <div className="mb-4">
            <Label className="text-sm font-semibold block mb-2" style={{ color: '#333' }}>
              Feedback <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Please share your feedback about the service..."
              className="resize-none rounded-xl border focus:border-[#F57C00] focus:ring-2 focus:ring-[#F57C00]/20"
              style={{ 
                minHeight: '120px', 
                maxHeight: '150px',
                borderColor: '#E5E5E5',
                padding: '12px 14px'
              }}
              rows={5}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length} characters
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 bg-white rounded-b-[20px]" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`
              w-full font-bold text-white transition-all rounded-2xl
              ${
                isSubmitDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#F57C00] hover:bg-[#E65100] active:scale-[0.98]"
              }
            `}
            style={{ 
              height: '52px',
              marginTop: '16px',
              marginBottom: '16px'
            }}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackFormModal;

