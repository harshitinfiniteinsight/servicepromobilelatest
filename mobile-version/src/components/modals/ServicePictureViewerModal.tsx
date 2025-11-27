import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ServicePictureViewerModalProps {
  open: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

const ServicePictureViewerModal = ({
  open,
  onClose,
  images,
  initialIndex = 0,
}: ServicePictureViewerModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset to initial index when modal opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentIndex, images.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (!open || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-full w-full h-full p-0 gap-0 bg-black/95 border-0 [&>button]:hidden">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Image Display */}
        <div className="flex items-center justify-center w-full h-full p-4">
          <img
            src={currentImage}
            alt={`Service picture ${currentIndex + 1} of ${images.length}`}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              // Handle invalid blob URLs or broken images
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<div class="flex items-center justify-center h-full text-white"><p class="text-sm">Image unavailable</p></div>';
              }
            }}
          />
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServicePictureViewerModal;

