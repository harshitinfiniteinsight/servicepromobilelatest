import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type DocumentType =
  | "driving_license"
  | "passport"
  | "social_security_card"
  | "real_id";

interface DocumentVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreementId: string;
  onVerificationComplete?: (data: {
    signature: string;
    documentType: DocumentType;
    document: File | string;
  }) => void;
}

export const DocumentVerificationModal = ({
  open,
  onOpenChange,
  agreementId,
  onVerificationComplete,
}: DocumentVerificationModalProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType | "">("");
  const [uploadedDocument, setUploadedDocument] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const signatureBoxRef = useRef<HTMLDivElement>(null);

  // Helper function to get canvas coordinates accounting for scaling
  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    // Since the context is already scaled by DPR, we use display coordinates directly
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Function to save signature as base64 image
  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Check if canvas has any content by checking if any pixel has been drawn
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasContent = imageData.data.some((channel, index) => {
      // Check alpha channel (every 4th value) - if any pixel has been drawn, alpha will be > 0
      return index % 4 === 3 && channel > 0;
    });
    
    if (hasContent) {
      // Export at display size (accounting for device pixel ratio)
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.width / dpr;
      const displayHeight = canvas.height / dpr;
      
      // Create a new canvas at display size
      const displayCanvas = document.createElement("canvas");
      const displayCtx = displayCanvas.getContext("2d");
      if (displayCtx) {
        displayCanvas.width = displayWidth;
        displayCanvas.height = displayHeight;
        // Draw the scaled canvas content to the display canvas
        displayCtx.drawImage(canvas, 0, 0, displayWidth, displayHeight);
        const signatureData = displayCanvas.toDataURL("image/png");
        setSignature(signatureData);
      }
    } else {
      setSignature(null);
    }
  };

  // Function to initialize/resize canvas
  const initializeCanvas = () => {
    if (!canvasRef.current || !signatureBoxRef.current) return;
    
    const canvas = canvasRef.current;
    const box = signatureBoxRef.current;
    
    // Set canvas size to match container (accounting for high-DPI displays)
    const rect = box.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set display size (CSS pixels)
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    // Set actual size in memory (scaled for high-DPI)
    const scaledWidth = rect.width * dpr;
    const scaledHeight = rect.height * dpr;
    
    // Only resize if dimensions changed to avoid clearing the canvas
    if (canvas.width !== scaledWidth || canvas.height !== scaledHeight) {
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
    }
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Reset transform and scale drawing context to account for device pixel ratio
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  };

  // Initialize canvas with proper scaling and attach non-passive touch listeners
  useEffect(() => {
    if (!open) return;
    
    let cleanup: (() => void) | null = null;
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!canvasRef.current || !signatureBoxRef.current) return;
      
      const canvas = canvasRef.current;
      
      // Initialize canvas size
      initializeCanvas();

      // Get context once and reuse
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Attach non-passive touch event listeners to allow preventDefault
      const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        if (touch && ctx) {
          const coords = getCanvasCoordinates(touch.clientX, touch.clientY);
          isDrawingRef.current = true;
          setIsDrawing(true);
          ctx.beginPath();
          ctx.moveTo(coords.x, coords.y);
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (!isDrawingRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        if (touch && ctx) {
          const coords = getCanvasCoordinates(touch.clientX, touch.clientY);
          ctx.lineTo(coords.x, coords.y);
          ctx.stroke();
        }
      };

      const handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isDrawingRef.current) {
          isDrawingRef.current = false;
          setIsDrawing(false);
          // Save signature as image
          saveSignature();
        }
      };

      // Add event listeners with { passive: false } to allow preventDefault
      canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
      canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
      canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false });

      // Handle window resize
      const handleResize = () => {
        initializeCanvas();
        // Re-apply context settings after resize
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.scale(dpr, dpr);
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 2.5;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
        }
      };
      window.addEventListener("resize", handleResize);

      // Store cleanup function
      cleanup = () => {
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchmove", handleTouchMove);
        canvas.removeEventListener("touchend", handleTouchEnd);
        canvas.removeEventListener("touchcancel", handleTouchEnd);
        window.removeEventListener("resize", handleResize);
      };
    }, 100);

    return () => {
      clearTimeout(timer);
      if (cleanup) cleanup();
    };
  }, [open]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      clearSignature();
      setDocumentType("");
      setUploadedDocument(null);
      setUploadedFile(null);
    }
  }, [open]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Mouse event handlers for desktop
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawingRef.current = true;
    setIsDrawing(true);
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      setIsDrawing(false);
      // Save signature as image
      saveSignature();
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear the entire canvas (accounting for scaling)
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.width / dpr;
    const displayHeight = canvas.height / dpr;
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    setSignature(null);
    isDrawingRef.current = false;
    setIsDrawing(false);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        setUploadedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedDocument(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Please upload an image or PDF file");
      }
    }
  };

  const handleRemoveDocument = () => {
    setUploadedDocument(null);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    // Validation
    if (!signature) {
      toast.error("Please sign the document");
      return;
    }
    
    if (!documentType) {
      toast.error("Please select a document type");
      return;
    }
    
    if (!uploadedDocument || !uploadedFile) {
      toast.error("Please upload a document");
      return;
    }

    try {
      // Upload verification data to backend
      const verificationData = {
        signature,
        documentType: documentType as DocumentType,
        document: uploadedFile,
      };

      // Simulate API call to upload verification data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call completion handler - this will close the verification modal and open payment modal
      onVerificationComplete?.(verificationData);
      
      // Note: Do NOT call onOpenChange(false) here - let the parent handle modal transitions
    } catch (error) {
      toast.error("Failed to submit verification. Please try again.");
      console.error("Verification error:", error);
    }
  };

  const isFormValid = signature !== null && documentType !== "" && uploadedDocument !== null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className={cn(
          "max-w-sm w-[90%] max-w-[420px] mx-auto",
          "p-4 rounded-2xl shadow-lg bg-white",
          "flex flex-col max-h-[90vh]",
          "[&>button]:hidden"
        )}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogDescription className="sr-only">
          Document verification modal
        </DialogDescription>
        
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold text-gray-900">Document Verification</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-gray-100"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </DialogHeader>

        {/* Content - No Scroll */}
        <div 
          ref={containerRef}
          className="space-y-3 pt-3"
        >
          {/* Signature Pad Section */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-sm text-gray-700 font-medium">Please sign here</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSignature}
                className="text-sm text-gray-600 hover:text-gray-700 h-auto p-1"
                disabled={!signature}
              >
                Clear
              </Button>
            </div>
            <div 
              ref={signatureBoxRef}
              className="border border-gray-200 rounded-lg bg-white overflow-hidden mt-1 h-[160px] w-full"
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full touch-none cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ touchAction: "none", display: "block" }}
              />
            </div>
          </div>

          {/* Document Type Dropdown */}
          <div>
            <Label className="text-sm text-gray-700 font-medium">Select Document Type</Label>
            <Select value={documentType} onValueChange={(value) => setDocumentType(value as DocumentType)}>
              <SelectTrigger className="w-full h-10 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 mt-1">
                <SelectValue placeholder="Select Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="driving_license">Driving License</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="social_security_card">Social Security Card</SelectItem>
                <SelectItem value="real_id">REAL ID Act</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upload Area */}
          <div>
            <Label className="text-sm text-gray-700 font-medium">Upload Document</Label>
            <div 
              className="border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-100/50 transition-colors cursor-pointer min-h-[140px] mt-1"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files[0];
                if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
                  setUploadedFile(file);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setUploadedDocument(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                } else {
                  toast.error("Please upload an image or PDF file");
                }
              }}
            >
              {uploadedDocument ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {uploadedFile?.type === "application/pdf" ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-red-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">{uploadedFile.name}</p>
                    </div>
                  ) : (
                    <img 
                      src={uploadedDocument} 
                      alt="Uploaded document" 
                      className="max-h-[120px] max-w-full object-contain rounded"
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full hover:bg-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDocument();
                    }}
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative mb-2">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Camera className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 text-center mb-0.5">
                    Tap to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    Image or PDF (max 10MB)
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleDocumentUpload}
              className="hidden"
              capture="camera"
            />
          </div>
        </div>

        {/* Footer with SEND Button */}
        <div className="flex gap-2 pt-3 border-t border-gray-200 flex-shrink-0 mt-auto">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            className="flex-1 bg-orange-500 text-white rounded-lg w-full py-2 font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isFormValid}
          >
            SEND
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

