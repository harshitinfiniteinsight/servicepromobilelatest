import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Camera } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id: string;
  text: string;
  author: string;
  date: string;
}

interface AddNoteModalProps {
  open: boolean;
  onClose: () => void;
  equipmentId: string | null;
  existingNotes?: Note[];
  onSave?: (equipmentId: string, noteText: string) => void;
}

const AddNoteModal = ({
  open,
  onClose,
  equipmentId,
  existingNotes = [],
  onSave,
}: AddNoteModalProps) => {
  const [noteText, setNoteText] = useState<string>("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setNoteText("");
    }
  }, [open]);

  const handleSave = () => {
    if (!equipmentId) {
      toast.error("Equipment not found");
      return;
    }

    if (!noteText.trim()) {
      toast.error("Please enter a note");
      return;
    }

    if (onSave) {
      onSave(equipmentId, noteText.trim());
    } else {
      // Mock save - in real app, this would call an API
      console.info("Saving note for equipment", {
        equipmentId,
        noteText: noteText.trim(),
      });
      toast.success("Note added successfully");
    }

    setNoteText("");
    onClose();
  };

  const handleClose = () => {
    setNoteText("");
    onClose();
  };

  const handleCameraClick = () => {
    // Handle camera/photo upload functionality
    toast.info("Camera functionality - to be implemented");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] max-w-sm mx-auto p-5 rounded-2xl shadow-lg bg-white [&>button]:hidden max-h-[85vh] overflow-y-auto">
        <DialogDescription className="sr-only">
          Add note modal
        </DialogDescription>
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
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
        <div className="space-y-4 mt-3">
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
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            {/* Add Button */}
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleSave}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-md px-3 py-1.5 text-sm shadow-sm"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Existing Notes */}
          <div className="border-t pt-3 space-y-3 max-h-48 overflow-y-auto">
            <p className="text-sm font-medium text-gray-700">Existing Notes</p>
            <div className="space-y-2">
              {existingNotes.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No notes yet</p>
              ) : (
                existingNotes.map((note) => (
                  <div
                    key={note.id}
                    className="border border-gray-200 rounded-lg p-2 bg-gray-50"
                  >
                    <p className="text-sm text-gray-700">{note.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {note.author} • {formatDate(note.date)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Cancel Button Only */}
        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-lg text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddNoteModal;
