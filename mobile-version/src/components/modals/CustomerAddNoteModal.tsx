import { useState, useEffect, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Camera } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
  attachment?: {
    name: string;
    url: string;
    type: string;
  };
}

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
  const prevOpenRef = useRef<boolean>(false);
  const existingNotesRef = useRef<Note[]>(existingNotes);

  // Update ref when existingNotes changes
  useEffect(() => {
    existingNotesRef.current = existingNotes;
  }, [existingNotes]);

  // Sync notes only when modal opens (not on every existingNotes change)
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      // Modal just opened, sync with existingNotes
      setNotes(existingNotesRef.current);
    }
    prevOpenRef.current = open;
  }, [open]);

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

  const handleAddNote = () => {
    if (!noteText.trim()) {
      toast.error("Please enter a note");
      return;
    }

    if (!customer) {
      toast.error("Customer information is missing");
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newNote: Note = {
      id: Date.now().toString(),
      text: noteText.trim(),
      createdBy: "Current User", // Replace with actual user name from context/auth
      createdAt: `${formattedDate} ${formattedTime}`,
      ...(uploadedFile && {
        attachment: {
          name: uploadedFile.name,
          url: URL.createObjectURL(uploadedFile), // In real app, upload to server and get URL
          type: uploadedFile.type,
        },
      }),
    };
    
    setNotes([newNote, ...notes]);
    
    if (onAddNote) {
      onAddNote(customer.id, noteText.trim());
    } else {
      // Mock save - in real app, this would call an API
      console.info("Saving note for customer", customer.id, noteText.trim(), uploadedFile?.name);
      toast.success("Note added successfully");
      // Note: If onAddNote is provided, the parent component handles the toast
    }
    
    setNoteText("");
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatDate = (dateString: string) => {
    return dateString; // Already formatted in the note object
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
              disabled={!noteText.trim()}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg text-sm font-medium shadow hover:bg-orange-600 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[44px]"
            >
              Add Note
            </Button>
          </div>

          {/* Existing Notes */}
          {notes.length > 0 && (
            <div className="space-y-3 mt-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">Existing Notes</h3>
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm space-y-1"
                >
                  <p className="text-gray-800 leading-relaxed">{note.text}</p>
                  <p className="text-xs text-gray-500">Created by: {note.createdBy}</p>
                  <p className="text-xs text-gray-500">Created at: {formatDate(note.createdAt)}</p>
                  {note.attachment && (
                    <a
                      href={note.attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 underline cursor-pointer flex items-center gap-1"
                    >
                      <span>📎</span>
                      <span>Document: {note.attachment.name}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerAddNoteModal;

