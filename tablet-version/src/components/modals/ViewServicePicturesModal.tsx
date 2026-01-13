import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ViewServicePicturesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  beforeImage?: string | null;
  afterImage?: string | null;
  onDelete: (jobId: string, type: "before" | "after") => void;
  onReplace: (jobId: string, type: "before" | "after") => void;
}

const ViewServicePicturesModal = ({
  open,
  onOpenChange,
  jobId,
  beforeImage,
  afterImage,
  onDelete,
  onReplace,
}: ViewServicePicturesModalProps) => {
  const [activeTab, setActiveTab] = useState<"before" | "after">("before");
  const [showUploadSheet, setShowUploadSheet] = useState<"before" | "after" | null>(null);

  const handleImageUpload = (type: "before" | "after", source: "camera" | "gallery") => {
    // Simulate file upload - in a real app, this would use actual file picker/camera API
    const mockImageUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
    
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-lg font-semibold">Service Pictures</DialogTitle>
            <DialogDescription className="sr-only">
              View, delete, or replace before and after service pictures for this job
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "before" | "after")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="before">Before Service</TabsTrigger>
                <TabsTrigger value="after">After Service</TabsTrigger>
              </TabsList>

              <TabsContent value="before" className="space-y-4">
                {beforeImage ? (
                  <>
                    <div className="relative w-full">
                      <img
                        src={beforeImage}
                        alt="Before service"
                        className="w-full h-64 object-contain rounded-lg bg-gray-100"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowUploadSheet("before")}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Replace
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete("before")}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Camera className="h-16 w-16 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-500">No image uploaded</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="after" className="space-y-4">
                {afterImage ? (
                  <>
                    <div className="relative w-full">
                      <img
                        src={afterImage}
                        alt="After service"
                        className="w-full h-64 object-contain rounded-lg bg-gray-100"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowUploadSheet("after")}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Replace
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete("after")}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Camera className="h-16 w-16 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-500">No image uploaded</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
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

