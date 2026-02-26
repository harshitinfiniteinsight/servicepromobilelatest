import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, X, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ViewServicePicturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  beforeImage?: string | null;
  afterImage?: string | null;
  onDelete: (jobId: string, type: "before" | "after") => void;
  onReplace: (jobId: string, type: "before" | "after") => void;
}

const ViewServicePicturesModal = ({
  isOpen,
  onClose,
  jobId,
  beforeImage,
  afterImage,
  onDelete,
  onReplace,
}: ViewServicePicturesModalProps) => {
  const [activeTab, setActiveTab] = useState<"before" | "after">("before");
  const [showUploadSheet, setShowUploadSheet] = useState<"before" | "after" | null>(null);

  // Convert single images to arrays for consistent display
  const beforeImages = beforeImage ? [beforeImage] : [];
  const afterImages = afterImage ? [afterImage] : [];
  const currentImages = activeTab === "before" ? beforeImages : afterImages;
  
  // Max images per tab
  const MAX_IMAGES = 20;
  const canAddMore = currentImages.length < MAX_IMAGES;
  const handleImageUpload = (type: "before" | "after", source: "camera" | "gallery") => {
    setShowUploadSheet(null);
    onReplace(jobId, type);
    toast.success(`Image ${source === "camera" ? "captured" : "selected"} successfully`);
  };

  const handleDelete = (type: "before" | "after") => {
    if (confirm(`Are you sure you want to delete the ${type === "before" ? "Before" : "After"} Service image?`)) {
      onDelete(jobId, type);
      toast.success("Image deleted successfully");
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent 
          className="tablet:w-[780px] tablet:max-w-[780px] w-[90%] max-w-sm mx-auto p-0 rounded-2xl shadow-lg bg-white [&>button]:hidden max-h-[85vh] flex flex-col overflow-hidden" 
          onInteractOutside={handleClose}
        >
          <DialogDescription className="sr-only">
            View, delete, or replace before and after service pictures for this job
          </DialogDescription>
          
          {/* Header - Orange Theme (Tablet Optimized) */}
          <DialogHeader className="tablet:bg-primary tablet:text-white bg-white flex flex-row items-center justify-between px-6 tablet:px-8 py-4 tablet:py-5 border-b tablet:border-none border-gray-100 flex-shrink-0">
            <DialogTitle className="tablet:text-white text-lg tablet:text-xl font-semibold text-gray-800">
              Service Pictures
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full tablet:hover:bg-white/10 tablet:text-white hover:bg-gray-100"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>

          {/* Tabs Section (Tablet View) */}
          <div className="hidden tablet:block border-b border-gray-200 bg-white flex-shrink-0">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "before" | "after")} className="w-full">
              <TabsList className="w-full flex justify-center gap-8 bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="before" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent py-4 px-6 text-base font-medium transition-colors"
                >
                  Before Service ({beforeImages.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="after" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent py-4 px-6 text-base font-medium transition-colors"
                >
                  After Service ({afterImages.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 tablet:px-8 py-5 tablet:py-6">
            
            {/* Mobile View - Stacked Tabs */}
            <div className="tablet:hidden mb-4">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "before" | "after")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="before">Before ({beforeImages.length})</TabsTrigger>
                  <TabsTrigger value="after">After ({afterImages.length})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Image Display */}
            {currentImages.length > 0 ? (
              <div className="space-y-5">
                {/* Tablet View - Grid Layout */}
                <div className="hidden tablet:grid tablet:grid-cols-3 xl:grid-cols-4 gap-4">
                  {currentImages.map((image, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={image}
                        alt={`${activeTab} service ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => handleDelete(activeTab)}
                        className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600 hover:scale-110 transition-all shadow-lg"
                        aria-label="Delete image"
                        title="Delete image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Mobile View - Single Image */}
                <div className="tablet:hidden space-y-4">
                  <div className="relative w-full">
                    <img
                      src={currentImages[0]}
                      alt={`${activeTab} service`}
                      className="w-full h-64 object-contain rounded-lg bg-gray-100"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 tablet:gap-3 tablet:pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 tablet:border-primary tablet:text-primary tablet:hover:bg-primary/5"
                    onClick={() => setShowUploadSheet(activeTab)}
                    disabled={!canAddMore}
                    title={!canAddMore ? "Maximum 20 images allowed" : "Add more images"}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    <span className="hidden tablet:inline">Add More</span>
                    <span className="tablet:hidden">Replace</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => handleDelete(activeTab)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
                
                {/* Max images warning (tablet only) */}
                {!canAddMore && (
                  <p className="hidden tablet:block text-sm text-amber-600 text-center pt-2">
                    Maximum {MAX_IMAGES} images allowed
                  </p>
                )}
              </div>
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center tablet:h-96 h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <ImageIcon className="h-16 w-16 text-gray-400 mb-3" />
                <p className="text-base font-medium text-gray-700 mb-1">
                  No images uploaded for this service
                </p>
                <p className="text-sm text-gray-500">
                  Upload images to document service progress
                </p>
              </div>
            )}
          </div>

          {/* Footer - Fixed */}
          <div className="flex gap-3 px-4 tablet:px-8 py-4 tablet:py-5 border-t border-gray-200 bg-white flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 tablet:flex-initial tablet:ml-auto tablet:px-8 rounded-lg text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Sheet for Upload Options */}
      {showUploadSheet && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setShowUploadSheet(null)}
        >
          <div
            className="w-full bg-white rounded-t-2xl p-4 space-y-2 animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-12 bg-gray-300 rounded-full mx-auto mb-4" />
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-base"
              onClick={() => handleImageUpload(showUploadSheet, "camera")}
            >
              <Camera className="h-5 w-5 mr-3" />
              Take Photo
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-base"
              onClick={() => handleImageUpload(showUploadSheet, "gallery")}
            >
              <Upload className="h-5 w-5 mr-3" />
              Choose from Gallery
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-base text-red-600"
              onClick={() => setShowUploadSheet(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewServicePicturesModal;

