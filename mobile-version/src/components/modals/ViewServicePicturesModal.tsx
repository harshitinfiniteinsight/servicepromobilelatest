import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, X, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Maximum number of images allowed per section (should match AddServicePicturesModal)
const MAX_IMAGES_PER_SECTION = 10;

interface ViewServicePicturesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  // Support both legacy single image and new array format
  beforeImage?: string | null;
  afterImage?: string | null;
  beforeImages?: string[];
  afterImages?: string[];
  onDelete: (jobId: string, type: "before" | "after", index?: number) => void;
  // Updated to accept actual image data URLs
  onAddImages: (jobId: string, type: "before" | "after", images: string[]) => void;
}

const ViewServicePicturesModal = ({
  open,
  onOpenChange,
  jobId,
  beforeImage,
  afterImage,
  beforeImages,
  afterImages,
  onDelete,
  onAddImages,
}: ViewServicePicturesModalProps) => {
  // Normalize images to array format
  const getBeforeImages = (): string[] => {
    if (beforeImages && beforeImages.length > 0) return beforeImages;
    if (beforeImage) return [beforeImage];
    return [];
  };

  const getAfterImages = (): string[] => {
    if (afterImages && afterImages.length > 0) return afterImages;
    if (afterImage) return [afterImage];
    return [];
  };

  const normalizedBeforeImages = getBeforeImages();
  const normalizedAfterImages = getAfterImages();

  const [activeTab, setActiveTab] = useState<"before" | "after">("before");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  // Shared file input ref - used by "Add More" button for both tabs
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Trigger the hidden file input when "Add More" is clicked.
   * The activeTab state determines which section receives the new images.
   */
  const handleAddMoreClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Process selected files and convert to data URLs, then call onAddImages
   */
  const handleFileSelect = async (files: FileList) => {
    const currentImages = activeTab === "before" ? normalizedBeforeImages : normalizedAfterImages;
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
        // Validate file type
        if (!file.type.startsWith("image/")) {
          errorCount++;
          continue;
        }
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          errorCount++;
          continue;
        }
        // Convert to data URL
        const imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        });
        newImages.push(imageUrl);
      } catch {
        errorCount++;
      }
    }

    if (newImages.length > 0) {
      onAddImages(jobId, activeTab, newImages);
      toast.success(`${newImages.length} image(s) added successfully`);
    }

    if (errorCount > 0) {
      toast.error(`${errorCount} file(s) could not be added`);
    }
  };

  /**
   * Delete a specific image by index
   */
  const handleDeleteImage = (type: "before" | "after", index: number) => {
    if (confirm(`Are you sure you want to delete this ${type === "before" ? "Before" : "After"} Service image?`)) {
      onDelete(jobId, type, index);
      toast.success("Image deleted successfully");
    }
  };

  /**
   * Delete all images in a section
   */
  const handleDeleteAllImages = (type: "before" | "after") => {
    if (confirm(`Are you sure you want to delete ALL ${type === "before" ? "Before" : "After"} Service images?`)) {
      onDelete(jobId, type);
      toast.success("All images deleted successfully");
    }
  };

  /**
   * Render a responsive grid of image thumbnails
   */
  const renderImageGrid = (images: string[], type: "before" | "after") => {
    if (images.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Camera className="h-16 w-16 text-gray-400 mb-3" />
          <p className="text-sm text-gray-500">No images uploaded</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* Image grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div
              key={`${type}-${index}`}
              className={cn(
                "relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                selectedImageIndex === index && activeTab === type
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent hover:border-gray-300"
              )}
              onClick={() => setSelectedImageIndex(index)}
            >
              <img
                src={image}
                alt={`${type === "before" ? "Before" : "After"} service ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteImage(type, index);
                }}
                className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-md"
                aria-label={`Delete image ${index + 1}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Selected image preview */}
        {selectedImageIndex !== null && images[selectedImageIndex] && (
          <div className="relative">
            <img
              src={images[selectedImageIndex]}
              alt={`${type === "before" ? "Before" : "After"} service preview`}
              className="w-full h-48 object-contain rounded-lg bg-gray-100"
            />
          </div>
        )}

        {/* Image count */}
        <div className="text-xs text-gray-500 text-center">
          {images.length} / {MAX_IMAGES_PER_SECTION} images
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleAddMoreClick}
            disabled={images.length >= MAX_IMAGES_PER_SECTION}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add More
          </Button>
          {images.length > 0 && (
            <Button
              variant="outline"
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDeleteAllImages(type)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 
        Shared hidden file input for adding images.
        This input is triggered by the "Add More" button and uses the activeTab 
        state to determine which section (Before/After) receives the new images.
      */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files);
          }
          // Reset input so same files can be selected again
          e.target.value = "";
        }}
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-lg font-semibold">Service Pictures</DialogTitle>
            <DialogDescription className="sr-only">
              View, delete, or add before and after service pictures for this job
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4">
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => {
                setActiveTab(value as "before" | "after");
                setSelectedImageIndex(null); // Reset selected image when switching tabs
              }}
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="before">
                  Before Service
                  {normalizedBeforeImages.length > 0 && (
                    <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                      {normalizedBeforeImages.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="after">
                  After Service
                  {normalizedAfterImages.length > 0 && (
                    <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                      {normalizedAfterImages.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="before" className="space-y-4">
                {renderImageGrid(normalizedBeforeImages, "before")}
              </TabsContent>

              <TabsContent value="after" className="space-y-4">
                {renderImageGrid(normalizedAfterImages, "after")}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ViewServicePicturesModal;

