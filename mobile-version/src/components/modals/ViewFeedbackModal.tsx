import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Star, MessageSquare } from "lucide-react";

interface ViewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    customerName: string;
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
      <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden [&>button]:hidden">
        <DialogDescription className="sr-only">
          View feedback for {job.title}
        </DialogDescription>
        
        {/* Header */}
        <div className="bg-orange-500 text-white px-4 py-4 flex items-center justify-between safe-top">
          <h2 className="text-lg sm:text-xl font-bold text-white">Customer Feedback</h2>
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
              Feedback from <span className="font-semibold text-gray-900">{job.customerName}</span> for job:
            </p>
            <p className="text-base font-semibold text-gray-900">{job.title}</p>
          </div>

          <div className="pt-4 space-y-4 border-t border-gray-200">
            {/* Rating */}
            {displayFeedback.rating > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900">Rating</Label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < displayFeedback.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-gray-700">
                    {displayFeedback.rating}/5
                  </span>
                </div>
              </div>
            )}

            {/* Comment */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900">Comment</Label>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 min-h-[100px]">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {displayFeedback.comment}
                </p>
              </div>
            </div>

            {/* Submitted Date */}
            {displayFeedback.submittedAt && (
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Submitted on</Label>
                <p className="text-sm text-gray-600">{displayFeedback.submittedAt}</p>
              </div>
            )}

            {/* No Feedback State */}
            {!feedback && (
              <div className="text-center py-6">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Feedback form has been sent, but no response received yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewFeedbackModal;

