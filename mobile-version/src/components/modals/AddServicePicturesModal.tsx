import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Maximum number of images allowed per section (configurable)
const MAX_IMAGES_PER_SECTION = 10;

interface AddServicePicturesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobStatus: string;
  // Support both single image (legacy) and multiple images (new)
  beforeImage?: string | null;
  afterImage?: string | null;
  beforeImages?: string[];
  afterImages?: string[];
  onSave: (jobId: string, beforeImages: string[], afterImages: string[]) => void;
}

const AddServicePicturesModal = ({
  open,
  onOpenChange,
  jobId,
  jobStatus,
  beforeImage,
  afterImage,
  beforeImages,
  afterImages,
  onSave,
}: AddServicePicturesModalProps) => {
  // Initialize state from props - support both legacy single image and new array format
  const getInitialBeforeImages = (): string[] => {
    if (beforeImages && beforeImages.length > 0) return beforeImages;
    if (beforeImage) return [beforeImage];
    return [];
  };

  const getInitialAfterImages = (): string[] => {
    if (afterImages && afterImages.length > 0) return afterImages;
    if (afterImage) return [afterImage];
    return [];
  };

  const [localBeforeImages, setLocalBeforeImages] = useState<string[]>(getInitialBeforeImages);
  const [localAfterImages, setLocalAfterImages] = useState<string[]>(getInitialAfterImages);
  const [dragOverBefore, setDragOverBefore] = useState(false);
  const [dragOverAfter, setDragOverAfter] = useState(false);
  const fileInputBeforeRef = useRef<HTMLInputElement>(null);
  const fileInputAfterRef = useRef<HTMLInputElement>(null);

  /**
   * Process and validate a single file, then return its data URL
   */
  const processFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        reject(new Error("Please select an image file"));
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error("Image size must be less than 10MB"));
        return;
      }

      // Convert file to data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        resolve(imageUrl);
      };
      reader.onerror = () => {
        reject(new Error("Failed to read image file"));
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * Handle multiple file selection from file input
   * Adds new images to existing array without replacing
   */
  const handleFileSelect = async (type: "before" | "after", files: FileList) => {
    const currentImages = type === "before" ? localBeforeImages : localAfterImages;
    const remainingSlots = MAX_IMAGES_PER_SECTION - currentImages.length;

    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_IMAGES_PER_SECTION} images allowed per section`);
      return;
    }

    // Limit files to remaining slots
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} more image(s) can be added. Extra files ignored.`);
    }

    const newImages: string[] = [];
    let errorCount = 0;

    for (const file of filesToProcess) {
      try {
        const imageUrl = await processFile(file);
        newImages.push(imageUrl);
      } catch (error) {
        errorCount++;
        console.error("Error processing file:", error);
      }
    }

    if (newImages.length > 0) {
      if (type === "before") {
        setLocalBeforeImages(prev => [...prev, ...newImages]);
      } else {
        setLocalAfterImages(prev => [...prev, ...newImages]);
      }
      toast.success(`${newImages.length} image(s) uploaded successfully`);
    }

    if (errorCount > 0) {
      toast.error(`${errorCount} file(s) could not be uploaded`);
    }
  };

  /**
   * Handle drag and drop - supports multiple files
   */
  const handleDrop = (type: "before" | "after", e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (type === "before") {
      setDragOverBefore(false);
    } else {
      setDragOverAfter(false);
    }

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(type, files);
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
      setLocalBeforeImages(getInitialBeforeImages());
      setLocalAfterImages(getInitialAfterImages());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, beforeImage, afterImage, beforeImages, afterImages]);

  /**
   * Remove a specific image from the array by index
   */
  const handleRemoveImage = (type: "before" | "after", index: number) => {
    if (type === "before") {
      setLocalBeforeImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setLocalAfterImages(prev => prev.filter((_, i) => i !== index));
    }
    toast.success("Image removed");
  };

  const handleSave = () => {
    onSave(jobId, localBeforeImages, localAfterImages);
    onOpenChange(false);
    toast.success("Pictures saved successfully");
  };

  const handleCancel = () => {
    // Reset to original values
    setLocalBeforeImages(getInitialBeforeImages());
    setLocalAfterImages(getInitialAfterImages());
    onOpenChange(false);
  };

  /**
   * Render a responsive grid of image thumbnails with remove buttons
   */
  const renderImageGrid = (images: string[], type: "before" | "after") => {
    const canAddMore = images.length < MAX_IMAGES_PER_SECTION;
    const isDragOver = type === "before" ? dragOverBefore : dragOverAfter;

    return (
      <div className="space-y-2">
        {/* Image grid - responsive: 2 columns on mobile, 3 on larger screens */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {images.map((image, index) => (
              <div key={`${type}-${index}`} className="relative aspect-square">
                <img
                  src={image}
                  alt={`${type === "before" ? "Before" : "After"} service ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemoveImage(type, index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-md"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Dropzone for adding more images - always visible if under limit */}
        {canAddMore && (
          <div
            onClick={() => handleDropzoneClick(type)}
            onDrop={(e) => handleDrop(type, e)}
            onDragOver={(e) => handleDragOver(type, e)}
            onDragLeave={(e) => handleDragLeave(type, e)}
            className={cn(
              "flex flex-col items-center justify-center bg-white rounded-lg border-2 border-dashed transition-colors cursor-pointer",
              images.length === 0 ? "h-40" : "h-24",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            )}
          >
            {images.length === 0 ? (
              <>
                <Camera className={cn("h-10 w-10 mb-2 transition-colors", isDragOver ? "text-primary" : "text-gray-400")} />
                <span className={cn("text-sm transition-colors", isDragOver ? "text-primary font-medium" : "text-gray-500")}>
                  {isDragOver ? "Drop images here" : "Tap to add or drag images"}
                </span>
              </>
            ) : (
              <>
                <Plus className={cn("h-6 w-6 transition-colors", isDragOver ? "text-primary" : "text-gray-400")} />
                <span className={cn("text-xs transition-colors mt-1", isDragOver ? "text-primary font-medium" : "text-gray-500")}>
                  {isDragOver ? "Drop images here" : "Add more"}
                </span>
              </>
            )}
          </div>
        )}

        {/* Image count indicator */}
        <div className="text-xs text-gray-500 text-center">
          {images.length} / {MAX_IMAGES_PER_SECTION} images
        </div>
      </div>
    );
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
            {/* Hidden file inputs - multiple selection enabled */}
            <input
              type="file"
              ref={fileInputBeforeRef}
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  handleFileSelect("before", files);
                }
                // Reset input so same files can be selected again
                e.target.value = "";
              }}
            />
            <input
              type="file"
              ref={fileInputAfterRef}
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  handleFileSelect("after", files);
                }
                // Reset input so same files can be selected again
                e.target.value = "";
              }}
            />

            {/* Before Service Section */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Before Service</Label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                {renderImageGrid(localBeforeImages, "before")}
              </div>
            </div>

            {/* After Service Section */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">After Service</Label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                {renderImageGrid(localAfterImages, "after")}
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
    </>
  );
};

AddServicePicturesModal.displayName = "AddServicePicturesModal";

export default AddServicePicturesModal;

