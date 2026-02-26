import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Camera, Upload, X, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddServicePicturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  existingBeforeImage?: string | null;
  existingAfterImage?: string | null;
  onSave: (jobId: string, beforeImage: string | null, afterImage: string | null) => void;
}

const AddServicePicturesModal = ({
  isOpen,
  onClose,
  jobId,
  existingBeforeImage,
  existingAfterImage,
  onSave,
}: AddServicePicturesModalProps) => {
  const [localBeforeImage, setLocalBeforeImage] = useState<string | null>(existingBeforeImage || null);
  const [localAfterImage, setLocalAfterImage] = useState<string | null>(existingAfterImage || null);
  const [activeTab, setActiveTab] = useState<"before" | "after">("before");
  const [showUploadSheet, setShowUploadSheet] = useState<"before" | "after" | null>(null);
  const [dragOverBefore, setDragOverBefore] = useState(false);
  const [dragOverAfter, setDragOverAfter] = useState(false);
  
  // Support multiple images for each tab (up to 20)
  const [beforeImages, setBeforeImages] = useState<string[]>([]);
  const [afterImages, setAfterImages] = useState<string[]>([]);
  
  const fileInputBeforeRef = useRef<HTMLInputElement>(null);
  const fileInputAfterRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 20;
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

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
      const currentImages = type === "before" ? beforeImages : afterImages;
      
      if (currentImages.length >= MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        return;
      }
      
      const mockImageUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
      
      if (type === "before") {
        setBeforeImages(prev => [...prev, mockImageUrl]);
        setLocalBeforeImage(mockImageUrl);
      } else {
        setAfterImages(prev => [...prev, mockImageUrl]);
        setLocalAfterImage(mockImageUrl);
      }
      
      setShowUploadSheet(null);
      toast.success("Image captured successfully");
    }
  };

  const handleFileSelect = (type: "before" | "after", files: FileList) => {
    const currentImages = type === "before" ? beforeImages : afterImages;
    const filesArray = Array.from(files);
    
    // Check total image limit
    if (currentImages.length + filesArray.length > MAX_IMAGES) {
      toast.error(`You can upload a maximum of ${MAX_IMAGES} images. ${MAX_IMAGES - currentImages.length} slots remaining.`);
      return;
    }

    const validFiles: File[] = [];
    
    for (const file of filesArray) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not an image file`);
        continue;
      }

      // Validate file size (max 2MB)
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds 2MB limit`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length === 0) return;

    // Convert files to data URLs
    let processedCount = 0;
    const newImages: string[] = [];
    
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        newImages.push(imageUrl);
        processedCount++;
        
        if (processedCount === validFiles.length) {
          if (type === "before") {
            setBeforeImages(prev => [...prev, ...newImages]);
            setLocalBeforeImage(newImages[0]);
          } else {
            setAfterImages(prev => [...prev, ...newImages]);
            setLocalAfterImage(newImages[0]);
          }
          toast.success(`${validFiles.length} image(s) uploaded successfully`);
        }
      };
      reader.onerror = () => {
        toast.error(`Failed to read "${file.name}"`);
      };
      reader.readAsDataURL(file);
    });
  };

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
    if (isOpen) {
      setLocalBeforeImage(existingBeforeImage || null);
      setLocalAfterImage(existingAfterImage || null);
      // Initialize with existing images if present
      if (existingBeforeImage) {
        setBeforeImages([existingBeforeImage]);
      } else {
        setBeforeImages([]);
      }
      if (existingAfterImage) {
        setAfterImages([existingAfterImage]);
      } else {
        setAfterImages([]);
      }
      setActiveTab("before");
    }
  }, [isOpen, existingBeforeImage, existingAfterImage]);

  const handleRemoveImage = (type: "before" | "after", index: number) => {
    if (type === "before") {
      const newImages = beforeImages.filter((_, i) => i !== index);
      setBeforeImages(newImages);
      setLocalBeforeImage(newImages.length > 0 ? newImages[0] : null);
    } else {
      const newImages = afterImages.filter((_, i) => i !== index);
      setAfterImages(newImages);
      setLocalAfterImage(newImages.length > 0 ? newImages[0] : null);
    }
    toast.success("Image removed");
  };

  const handleSave = () => {
    // For now, save the first image of each type (maintaining backward compatibility)
    onSave(jobId, localBeforeImage, localAfterImage);
    onClose();
    toast.success("Pictures saved successfully");
  };

  const handleCancel = () => {
    // Reset to original values
    setLocalBeforeImage(existingBeforeImage || null);
    setLocalAfterImage(existingAfterImage || null);
    setBeforeImages(existingBeforeImage ? [existingBeforeImage] : []);
    setAfterImages(existingAfterImage ? [existingAfterImage] : []);
    setShowUploadSheet(null);
    onClose();
  };

  const currentImages = activeTab === "before" ? beforeImages : afterImages;
  const currentType = activeTab;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent 
          className="tablet:w-[780px] tablet:max-w-[780px] w-[90%] max-w-sm mx-auto p-0 rounded-2xl shadow-lg bg-white [&>button]:hidden max-h-[85vh] flex flex-col overflow-hidden" 
          onInteractOutside={handleCancel}
        >
          <DialogDescription className="sr-only">
            Upload before and after service pictures for this job
          </DialogDescription>
          
          {/* Header - Orange Theme (Tablet Optimized) */}
          <DialogHeader className="tablet:bg-primary tablet:text-white bg-white flex flex-row items-center justify-between px-6 tablet:px-8 py-4 tablet:py-5 border-b tablet:border-none border-gray-100 flex-shrink-0">
            <DialogTitle className="tablet:text-white text-lg tablet:text-xl font-semibold text-gray-800">
              Upload Service Pictures
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full tablet:hover:bg-white/10 tablet:text-white hover:bg-gray-100"
              onClick={handleCancel}
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
                  Before Service ({beforeImages.length}/{MAX_IMAGES})
                </TabsTrigger>
                <TabsTrigger 
                  value="after" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent py-4 px-6 text-base font-medium transition-colors"
                >
                  After Service ({afterImages.length}/{MAX_IMAGES})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 tablet:px-8 py-5 tablet:py-6">
            {/* Hidden file inputs */}
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
                // Reset input so same file can be selected again
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
                // Reset input so same file can be selected again
                e.target.value = "";
              }}
            />

            {/* Mobile View - Stacked Sections */}
            <div className="tablet:hidden space-y-5">
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
                        onClick={() => handleRemoveImage("before", 0)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputBeforeRef.current?.click()}
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
                        onClick={() => handleRemoveImage("after", 0)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputAfterRef.current?.click()}
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

            {/* Tablet View - Tabbed Content with Large Drop Zone */}
            <div className="hidden tablet:block space-y-5">
              {/* Large Upload Drop Zone */}
              <div
                onClick={() => {
                  if (currentType === "before") {
                    fileInputBeforeRef.current?.click();
                  } else {
                    fileInputAfterRef.current?.click();
                  }
                }}
                onDrop={(e) => handleDrop(currentType, e)}
                onDragOver={(e) => handleDragOver(currentType, e)}
                onDragLeave={(e) => handleDragLeave(currentType, e)}
                className={cn(
                  "flex flex-col items-center justify-center h-52 bg-white rounded-xl border-2 border-dashed transition-all cursor-pointer",
                  (currentType === "before" ? dragOverBefore : dragOverAfter)
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"
                )}
              >
                <Camera className={cn(
                  "h-14 w-14 mb-3 transition-colors",
                  (currentType === "before" ? dragOverBefore : dragOverAfter) ? "text-primary" : "text-gray-400"
                )} />
                <p className={cn(
                  "text-base font-medium mb-1 transition-colors",
                  (currentType === "before" ? dragOverBefore : dragOverAfter) ? "text-primary" : "text-gray-700"
                )}>
                  {(currentType === "before" ? dragOverBefore : dragOverAfter) 
                    ? "Drop images here" 
                    : "Click or drag images here to upload"}
                </p>
                <p className="text-sm text-gray-500">
                  {currentImages.length} / {MAX_IMAGES} images
                </p>
              </div>

              {/* Info Banner */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  For best performance, upload images up to 2 MB each.
                </p>
              </div>

              {/* Uploaded Images Grid (4 columns) */}
              {currentImages.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Uploaded Images ({currentImages.length})
                  </h3>
                  <div className="grid grid-cols-4 gap-4 max-h-[300px] overflow-y-auto pr-2">
                    {currentImages.map((image, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={image}
                          alt={`${currentType} service ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(currentType, index);
                          }}
                          className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600 hover:scale-110 transition-all shadow-lg"
                          aria-label="Delete image"
                          title="Delete image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex gap-3 px-4 tablet:px-8 py-4 tablet:py-5 border-t border-gray-200 bg-white flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 rounded-lg text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={beforeImages.length === 0 && afterImages.length === 0}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
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

