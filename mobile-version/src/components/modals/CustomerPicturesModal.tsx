import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CustomerPicture } from "@/services/customerService";

interface CustomerPicturesModalProps {
  open: boolean;
  onClose: () => void;
  pictures: CustomerPicture[];
  customerName?: string;
}

const CustomerPicturesModal = ({
  open,
  onClose,
  pictures,
  customerName = "Customer",
}: CustomerPicturesModalProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Reset selected image when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedImage(null);
    }
  }, [open]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[90%] max-w-md mx-auto p-5 rounded-2xl shadow-lg bg-white [&>button]:hidden max-h-[85vh] overflow-y-auto">
        <DialogTitle className="sr-only">Customer Pictures</DialogTitle>
        <DialogDescription className="sr-only">
          View all pictures for {customerName}
        </DialogDescription>

        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Customer Pictures</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </DialogHeader>

        {/* Content */}
        <div className="mt-4">
          {pictures.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No pictures uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pictures.map((picture) => (
                <div
                  key={picture.id}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImage(picture.url)}
                >
                  <img
                    src={picture.thumbnailUrl || picture.url}
                    alt={`Picture ${picture.id}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Handle invalid blob URLs or broken images
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="flex items-center justify-center h-full"><p class="text-xs text-gray-400">Image unavailable</p></div>';
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Full-size image view */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-full max-h-full">
              <img
                src={selectedImage}
                alt="Full size"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-9 w-9 rounded-full bg-white/90 hover:bg-white"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-5 w-5 text-gray-900" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerPicturesModal;

