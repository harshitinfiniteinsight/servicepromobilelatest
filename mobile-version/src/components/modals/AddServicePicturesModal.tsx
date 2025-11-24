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

  const isCompleted = jobStatus === "Completed";

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

    if (type === "after" && !isCompleted) {
      return;
    }

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

    if (type === "after" && !isCompleted) {
      return;
    }

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
    if (type === "after" && !isCompleted) {
      return;
    }

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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0" onInteractOutside={handleCancel}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-lg font-semibold">Add Service Pictures</DialogTitle>
            <DialogDescription className="sr-only">
              Upload before and after service pictures for this job
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 space-y-6">
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
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Before Service</Label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                {localBeforeImage ? (
                  <div className="relative">
                    <img
                      src={localBeforeImage}
                      alt="Before service"
                      className="w-full h-48 object-cover rounded-lg"
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
                      "flex flex-col items-center justify-center h-48 bg-white rounded-lg border-2 border-dashed transition-colors cursor-pointer",
                      dragOverBefore
                        ? "border-primary bg-primary/5 border-primary"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    )}
                  >
                    <Camera className={cn("h-12 w-12 mb-2 transition-colors", dragOverBefore ? "text-primary" : "text-gray-400")} />
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
            <div className="space-y-3">
              <Label className="text-sm font-semibold">After Service</Label>
              <div className={cn(
                "rounded-xl border p-4 space-y-3",
                isCompleted ? "border-gray-200 bg-gray-50" : "border-gray-200 bg-gray-100 opacity-60"
              )}>
                {localAfterImage ? (
                  <div className="relative">
                    <img
                      src={localAfterImage}
                      alt="After service"
                      className="w-full h-48 object-cover rounded-lg"
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
                      "flex flex-col items-center justify-center h-48 bg-white rounded-lg border-2 border-dashed transition-colors",
                      !isCompleted && "cursor-not-allowed opacity-60",
                      isCompleted && "cursor-pointer",
                      dragOverAfter && isCompleted
                        ? "border-primary bg-primary/5 border-primary"
                        : isCompleted
                        ? "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        : "border-gray-300"
                    )}
                  >
                    <Camera className={cn(
                      "h-12 w-12 mb-2 transition-colors",
                      dragOverAfter && isCompleted ? "text-primary" : "text-gray-400"
                    )} />
                    <span className={cn(
                      "text-sm transition-colors",
                      dragOverAfter && isCompleted ? "text-primary font-medium" : "text-gray-500"
                    )}>
                      {dragOverAfter && isCompleted ? "Drop image here" : "Dropzone"}
                    </span>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowUploadSheet("after")}
                  disabled={!isCompleted}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {localAfterImage ? "Replace Image" : "Upload"}
                </Button>
                {!isCompleted && (
                  <p className="text-xs text-muted-foreground text-center">
                    Available only when job status is Completed
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 pt-4 border-t flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleCancel}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave}>
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

