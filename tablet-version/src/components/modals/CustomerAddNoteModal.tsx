import { useState, useEffect, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Camera } from "lucide-react";
import { toast } from "sonner";
import { getNotesByCustomer, addNote, type Note } from "@/services/noteService";
import { format } from "date-fns";

interface CustomerAddNoteModalProps {
  open: boolean;
  onClose: () => void;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
  existingNotes?: Note[];
  onAddNote?: (customerId: string, noteText: string) => void;
}

const CustomerAddNoteModal = ({
  open,
  onClose,
  customer,
  existingNotes = [],
  onAddNote,
}: CustomerAddNoteModalProps) => {
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<Note[]>(existingNotes);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all customer notes when modal opens
  useEffect(() => {
    if (open && customer) {
      const allCustomerNotes = getNotesByCustomer(customer.id);
      setNotes(allCustomerNotes);
    }
  }, [open, customer]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setNoteText("");
      setUploadedFile(null);
    }
  }, [open]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid file (image, PDF, or Word document)");
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setUploadedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddNote = async () => {
    if (!noteText.trim() && !uploadedFile) {
      toast.error("Please enter a note or upload a file");
      return;
    }

    if (!customer) {
      toast.error("Customer information is missing");
      return;
    }

    try {
      // Prepare attachment if file is uploaded
      const attachment = uploadedFile
        ? {
            name: uploadedFile.name,
            url: URL.createObjectURL(uploadedFile), // In real app, upload to server and get URL
            type: uploadedFile.type,
          }
        : undefined;

      // Add note (will create if noteText is empty but file exists)
      const noteToSave = noteText.trim() || `File: ${uploadedFile?.name || "Attachment"}`;
      const newNote = addNote(
        customer.id, // entityId (customer ID for customer notes)
        "customer", // entityType
        customer.id, // customerId
        noteToSave,
        attachment
      );

      // Reload all customer notes to get updated list
      const updatedNotes = getNotesByCustomer(customer.id);
      setNotes(updatedNotes);
      
      if (onAddNote) {
        onAddNote(customer.id, noteText.trim());
      } else {
        toast.success("Note added successfully");
      }
      
      setNoteText("");
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    }
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

  // Get source label for note
  const getNoteSource = (note: Note) => {
    if (note.entityType === "invoice") {
      return "Invoice";
    } else if (note.entityType === "estimate") {
      return "Estimate";
    } else if (note.entityType === "customer") {
      return "Customer";
    } else if (note.entityType === "job") {
      return "Job";
    } else if (note.entityType === "equipment") {
      return "Equipment";
    }
    return "";
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[90%] p-0 gap-0 rounded-2xl bg-white shadow-md max-h-[85vh] overflow-y-auto flex flex-col [&>button]:hidden">
        <DialogDescription className="sr-only">
          Add note modal for customer {customer?.name || "customer"}
        </DialogDescription>
        {/* Header */}
        <DialogHeader className="px-4 pt-4 pb-4 flex flex-row items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
          <DialogTitle className="text-lg font-semibold text-gray-900">Add Note</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </DialogHeader>

        <div className="px-4 py-4 space-y-4">
          {/* Note input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm text-gray-700 font-medium">Note</Label>
              {/* Camera/Upload button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleUploadClick}
                className="flex items-center justify-center w-9 h-9 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
              >
                <Camera className="h-5 w-5 text-orange-600" />
              </Button>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                id="noteAttachment"
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type your note..."
              rows={4}
              className="w-full text-gray-800 text-sm rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
            />
          </div>

          {/* Show uploaded file name */}
          {uploadedFile && (
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
              <Camera className="h-4 w-4 text-orange-600 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate flex-1">{uploadedFile.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-orange-100"
                onClick={() => {
                  setUploadedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                <X className="h-3 w-3 text-gray-400" />
              </Button>
            </div>
          )}

          {/* Add Note button */}
          <div className="pt-2 flex justify-center">
            <Button
              onClick={handleAddNote}
              disabled={!noteText.trim() && !uploadedFile}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg text-sm font-medium shadow hover:bg-orange-600 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[44px]"
            >
              Add Note
            </Button>
          </div>

          {/* Existing Notes */}
          {notes.length > 0 && (
            <div className="space-y-3 mt-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">Existing Notes</h3>
              {notes.map((note) => {
                // Get all attachments (support both old and new format)
                const allAttachments = note.attachments || (note.attachment ? [note.attachment] : []);
                
                return (
                  <div
                    key={note.id}
                    className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm space-y-1"
                  >
                    {/* Header: Entity Type and ID */}
                    <div className="flex items-center justify-between mb-1 pb-1 border-b border-gray-200">
                      <span className="text-xs font-medium text-orange-600 capitalize">
                        {getNoteSource(note)}
                      </span>
                      {note.entityType !== "customer" && (
                        <span className="text-xs text-gray-400">{note.entityId}</span>
                      )}
                    </div>
                    
                    {/* Body: Text */}
                    {note.text && (
                      <p className="text-gray-800 leading-relaxed mb-2">{note.text}</p>
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
                            className="text-xs text-blue-600 underline cursor-pointer flex items-center gap-1"
                          >
                            <span>📎</span>
                            <span>Document: {attachment.name}</span>
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
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerAddNoteModal;

