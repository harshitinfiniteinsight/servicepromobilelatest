import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Camera, FileImage } from "lucide-react";
import { toast } from "sonner";
import { getNotes, addNote, type Note } from "@/services/noteService";
import { format } from "date-fns";

interface DocumentNoteModalProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
  documentType: "invoice" | "estimate";
  customerId?: string; // Optional, will be fetched from invoice/estimate if not provided
  customerName?: string; // Optional, for display
  onNoteAdded?: () => void;
}

const DocumentNoteModal = ({
  open,
  onClose,
  documentId,
  documentType,
  customerId,
  customerName,
  onNoteAdded,
}: DocumentNoteModalProps) => {
  const [noteText, setNoteText] = useState<string>("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resolvedCustomerId, setResolvedCustomerId] = useState<string>("");

  // Resolve customerId from invoice/estimate if not provided
  useEffect(() => {
    if (open && documentId && !customerId) {
      // Try to get customerId from localStorage invoices/estimates
      if (documentType === "invoice") {
        const invoices = JSON.parse(localStorage.getItem("servicepro_invoices") || "[]");
        const invoice = invoices.find((inv: any) => inv.id === documentId);
        if (invoice?.customerId) {
          setResolvedCustomerId(invoice.customerId);
        }
      } else if (documentType === "estimate") {
        const estimates = JSON.parse(localStorage.getItem("servicepro_estimates") || "[]");
        const estimate = estimates.find((est: any) => est.id === documentId);
        if (estimate?.customerId) {
          setResolvedCustomerId(estimate.customerId);
        }
      }
    } else if (customerId) {
      setResolvedCustomerId(customerId);
    }
  }, [open, documentId, documentType, customerId]);

  // Load existing notes when modal opens
  useEffect(() => {
    if (open && documentId) {
      const existingNotes = getNotes(documentId, documentType);
      setNotes(existingNotes);
    }
  }, [open, documentId, documentType]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setNoteText("");
      setUploadedFile(null);
      setUploadedFileUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setUploadedFileUrl(url);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    if (!noteText.trim() && !uploadedFile) {
      toast.error("Please enter a note or upload a file");
      return;
    }

    if (!documentId) {
      toast.error("Document not found");
      return;
    }

    if (!resolvedCustomerId) {
      toast.error("Customer information not found");
      return;
    }

    try {
      // Prepare attachment if file is uploaded
      const attachment = uploadedFile
        ? {
            name: uploadedFile.name,
            url: uploadedFileUrl, // In real app, upload to server and get URL
            type: uploadedFile.type,
          }
        : undefined;

      // Add note (will create if noteText is empty but file exists)
      const noteToSave = noteText.trim() || `File: ${uploadedFile?.name || "Attachment"}`;
      const newNote = addNote(documentId, documentType, resolvedCustomerId, noteToSave, attachment);

      // Reload notes to get all notes including creation notes
      const updatedNotes = getNotes(documentId, documentType);
      setNotes(updatedNotes);

      // Clear form
      setNoteText("");
      setUploadedFile(null);
      setUploadedFileUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Note added successfully");

      // Notify parent if callback provided
      if (onNoteAdded) {
        onNoteAdded();
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    }
  };

  const handleClose = () => {
    setNoteText("");
    setUploadedFile(null);
    setUploadedFileUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const formatDate = (dateString: string) => {
    try {
      // Try to parse as ISO string first
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return format(date, "MMM d, yyyy h:mm a");
      }
      // If not ISO, return as-is (legacy format)
      return dateString;
    } catch {
      return dateString;
    }
  };

  const isAddButtonDisabled = !noteText.trim() && !uploadedFile;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] max-w-sm mx-auto p-5 rounded-2xl shadow-lg bg-white [&>button]:hidden max-h-[85vh] overflow-y-auto flex flex-col">
        <DialogDescription className="sr-only">
          Add note modal for {documentType} {documentId}
        </DialogDescription>
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold text-gray-800">Add Note</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-gray-100"
            onClick={handleClose}
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-4 mt-3 flex-1 min-h-0 overflow-y-auto">
          {/* Add Note Field */}
          <div>
            <div className="relative">
              <Textarea
                placeholder="Write a note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm pr-10 focus:ring-1 focus:ring-orange-500 resize-none"
                rows={3}
              />
              <button
                onClick={handleCameraClick}
                className="absolute bottom-2 right-2 text-gray-500 hover:text-orange-600 transition-colors"
                type="button"
                aria-label="Upload file"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* File Preview */}
            {uploadedFile && (
              <div className="mt-2 flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <FileImage className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <span className="text-xs text-gray-700 truncate flex-1">{uploadedFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUploadedFile(null);
                    setUploadedFileUrl("");
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Add Button */}
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleSave}
                disabled={isAddButtonDisabled}
                className={isAddButtonDisabled 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed rounded-md px-3 py-1.5 text-sm shadow-sm"
                  : "bg-orange-500 hover:bg-orange-600 text-white rounded-md px-3 py-1.5 text-sm shadow-sm"
                }
              >
                Add Note
              </Button>
            </div>
          </div>

          {/* Existing Notes */}
          <div className="border-t pt-3 space-y-3">
            <p className="text-sm font-medium text-gray-700">Existing Notes</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No notes yet</p>
              ) : (
                notes.map((note) => {
                  // Get all attachments (support both old and new format)
                  const allAttachments = note.attachments || (note.attachment ? [note.attachment] : []);
                  
                  return (
                    <div
                      key={note.id}
                      className="border border-gray-200 rounded-lg p-2 bg-gray-50"
                    >
                      {/* Header: Entity Type and ID */}
                      <div className="flex items-center justify-between mb-1 pb-1 border-b border-gray-200">
                        <span className="text-xs font-medium text-orange-600 capitalize">
                          {note.entityType}
                        </span>
                        <span className="text-xs text-gray-400">{note.entityId}</span>
                      </div>
                      
                      {/* Body: Text */}
                      {note.text && (
                        <p className="text-sm text-gray-700 mb-2">{note.text}</p>
                      )}
                      
                      {/* Body: Attachments */}
                      {allAttachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            Attachment{allAttachments.length > 1 ? "s" : ""}:
                          </p>
                          {allAttachments.map((attachment, idx) => (
                            <a
                              key={idx}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 underline"
                            >
                              <FileImage className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{attachment.name}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      
                      {/* Footer: Creator and Timestamp */}
                      <p className="text-xs text-gray-500 mt-2 pt-1 border-t border-gray-200">
                        {note.createdBy} • {formatDate(note.createdAt)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentNoteModal;

