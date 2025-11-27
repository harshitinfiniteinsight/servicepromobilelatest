import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddServicePicturesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobStatus: string;
  beforeImage?: string | null;
  afterImage?: string | null;
  onSave: (jobId: string, beforeImage: string | null, afterImage: string | null) => void;
}

const AddServicePicturesModal = ({
  open,
  onOpenChange,
  jobId,
  jobStatus,
  beforeImage,
  afterImage,
  onSave,
}: AddServicePicturesModalProps) => {
  const [localBeforeImage, setLocalBeforeImage] = useState<string | null>(beforeImage || null);
  const [localAfterImage, setLocalAfterImage] = useState<string | null>(afterImage || null);
  const [showUploadSheet, setShowUploadSheet] = useState<"before" | "after" | null>(null);
  const [dragOverBefore, setDragOverBefore] = useState(false);
  const [dragOverAfter, setDragOverAfter] = useState(false);
  const fileInputBeforeRef = useRef<HTMLInputElement>(null);
  const fileInputAfterRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (type: "before" | "after", source: "camera" | "gallery") => {
    if (source === "gallery") {
      // Open file picker
      if (type === "before" && fileInputBeforeRef.current) {
        fileInputBeforeRef.current.click();
      } else if (type === "after" && fileInputAfterRef.current) {
        fileInputAfterRef.current.click();
      }
      setShowUploadSheet(null);
    } else {
      // Simulate camera capture - in a real app, this would use actual camera API
      const mockImageUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
      
      if (type === "before") {
        setLocalBeforeImage(mockImageUrl);
      } else {
        setLocalAfterImage(mockImageUrl);
      }
      
      setShowUploadSheet(null);
      toast.success("Image captured successfully");
    }
  };

  const handleFileSelect = (type: "before" | "after", file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    // Convert file to data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      if (type === "before") {
        setLocalBeforeImage(imageUrl);
      } else {
        setLocalAfterImage(imageUrl);
      }
      toast.success("Image uploaded successfully");
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (type: "before" | "after", e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (type === "before") {
      setDragOverBefore(false);
    } else {
      setDragOverAfter(false);
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(type, files[0]);
    }
  };

  const handleDragOver = (type: "before" | "after", e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (type === "before") {
      setDragOverBefore(true);
    } else {
      setDragOverAfter(true);
    }
  };

  const handleDragLeave = (type: "before" | "after", e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (type === "before") {
      setDragOverBefore(false);
    } else {
      setDragOverAfter(false);
    }
  };

  const handleDropzoneClick = (type: "before" | "after") => {
    if (type === "before" && fileInputBeforeRef.current) {
      fileInputBeforeRef.current.click();
    } else if (type === "after" && fileInputAfterRef.current) {
      fileInputAfterRef.current.click();
    }
  };
  
  // Reset local state when modal opens/closes
  useEffect(() => {
    if (open) {
      setLocalBeforeImage(beforeImage || null);
      setLocalAfterImage(afterImage || null);
    }
  }, [open, beforeImage, afterImage]);

  const handleRemoveImage = (type: "before" | "after") => {
    if (type === "before") {
      setLocalBeforeImage(null);
    } else {
      setLocalAfterImage(null);
    }
    toast.success("Image removed");
  };

  const handleSave = () => {
    onSave(jobId, localBeforeImage, localAfterImage);
    onOpenChange(false);
    toast.success("Pictures saved successfully");
  };

  const handleCancel = () => {
    // Reset to original values
    setLocalBeforeImage(beforeImage || null);
    setLocalAfterImage(afterImage || null);
    setShowUploadSheet(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleCancel}>
        <DialogContent className="w-[90%] max-w-sm mx-auto p-5 rounded-2xl shadow-lg bg-white [&>button]:hidden max-h-[85vh] overflow-y-auto" onInteractOutside={handleCancel}>
          <DialogDescription className="sr-only">
            Upload before and after service pictures for this job
          </DialogDescription>
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
            <DialogTitle className="text-lg font-semibold text-gray-800">Add Service Pictures</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-gray-100"
              onClick={handleCancel}
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </DialogHeader>

          <div className="space-y-4 mt-3">
            {/* Hidden file inputs */}
            <input
              type="file"
              ref={fileInputBeforeRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileSelect("before", file);
                }
                // Reset input so same file can be selected again
                e.target.value = "";
              }}
            />
            <input
              type="file"
              ref={fileInputAfterRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileSelect("after", file);
                }
                // Reset input so same file can be selected again
                e.target.value = "";
              }}
            />

            {/* Before Service Section */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Before Service</Label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2">
                {localBeforeImage ? (
                  <div className="relative">
                    <img
                      src={localBeforeImage}
                      alt="Before service"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleRemoveImage("before")}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => handleDropzoneClick("before")}
                    onDrop={(e) => handleDrop("before", e)}
                    onDragOver={(e) => handleDragOver("before", e)}
                    onDragLeave={(e) => handleDragLeave("before", e)}
                    className={cn(
                      "flex flex-col items-center justify-center h-40 bg-white rounded-lg border-2 border-dashed transition-colors cursor-pointer",
                      dragOverBefore
                        ? "border-primary bg-primary/5 border-primary"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    )}
                  >
                    <Camera className={cn("h-10 w-10 mb-2 transition-colors", dragOverBefore ? "text-primary" : "text-gray-400")} />
                    <span className={cn("text-sm transition-colors", dragOverBefore ? "text-primary font-medium" : "text-gray-500")}>
                      {dragOverBefore ? "Drop image here" : "Dropzone"}
                    </span>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowUploadSheet("before")}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {localBeforeImage ? "Replace Image" : "Upload"}
                </Button>
              </div>
            </div>

            {/* After Service Section */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">After Service</Label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2">
                {localAfterImage ? (
                  <div className="relative">
                    <img
                      src={localAfterImage}
                      alt="After service"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleRemoveImage("after")}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => handleDropzoneClick("after")}
                    onDrop={(e) => handleDrop("after", e)}
                    onDragOver={(e) => handleDragOver("after", e)}
                    onDragLeave={(e) => handleDragLeave("after", e)}
                    className={cn(
                      "flex flex-col items-center justify-center h-40 bg-white rounded-lg border-2 border-dashed transition-colors cursor-pointer",
                      dragOverAfter
                        ? "border-primary bg-primary/5 border-primary"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    )}
                  >
                    <Camera className={cn(
                      "h-10 w-10 mb-2 transition-colors",
                      dragOverAfter ? "text-primary" : "text-gray-400"
                    )} />
                    <span className={cn(
                      "text-sm transition-colors",
                      dragOverAfter ? "text-primary font-medium" : "text-gray-500"
                    )}>
                      {dragOverAfter ? "Drop image here" : "Dropzone"}
                    </span>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowUploadSheet("after")}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {localAfterImage ? "Replace Image" : "Upload"}
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 rounded-lg text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm"
            >
              Save
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

AddServicePicturesModal.displayName = "AddServicePicturesModal";

export default AddServicePicturesModal;

