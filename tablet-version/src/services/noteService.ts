// Unified note service for managing notes across invoices, estimates, customers, jobs, and equipment
// Uses localStorage as a mock backend for persistence

export interface NoteAttachment {
  name: string;
  url: string;
  type: string;
}

export interface Note {
  id: string;
  entityId: string; // invoice ID, estimate ID, customer ID, job ID, or equipment ID
  entityType: "invoice" | "estimate" | "customer" | "job" | "equipment";
  customerId: string; // Always include customerId for filtering
  text: string;
  createdBy: string;
  createdAt: string; // ISO string for proper sorting
  // Support both old format (single attachment) and new format (attachments array)
  attachment?: NoteAttachment; // Legacy: single attachment
  attachments?: NoteAttachment[]; // New: multiple attachments
}

const STORAGE_KEY = "servicepro_unified_notes";

// Initialize notes storage if it doesn't exist
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};

// Get all notes from storage
const getAllNotes = (): Note[] => {
  initializeStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save notes to storage
const saveNotes = (notes: Note[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

/**
 * Get notes for a specific document (invoice or estimate)
 * This maintains backward compatibility with existing code
 * Notes are grouped and merged by entityId, createdAt, and createdBy
 */
export const getNotes = (documentId: string, documentType: "invoice" | "estimate"): Note[] => {
  const allNotes = getAllNotes();
  const filteredNotes = allNotes.filter(
    (note) => note.entityId === documentId && note.entityType === documentType
  );
  return groupAndMergeNotes(filteredNotes);
};

/**
 * Get all notes for a specific customer (from invoices, estimates, and customer notes)
 * Notes are grouped and merged by entityId, createdAt, and createdBy
 */
export const getNotesByCustomer = (customerId: string): Note[] => {
  const allNotes = getAllNotes();
  const filteredNotes = allNotes.filter((note) => note.customerId === customerId);
  return groupAndMergeNotes(filteredNotes);
};

/**
 * Add a note to any entity (invoice, estimate, customer, job, equipment)
 */
export const addNote = (
  entityId: string,
  entityType: "invoice" | "estimate" | "customer" | "job" | "equipment",
  customerId: string,
  noteText: string,
  attachment?: NoteAttachment,
  attachments?: NoteAttachment[]
): Note => {
  const allNotes = getAllNotes();
  
  // Get current user name
  const userName = localStorage.getItem("userName") || 
                   localStorage.getItem("userFullName") || 
                   "Current User";
  const createdBy = userName.split(" ")[0]; // Use first name only
  
  // Create new note with ISO timestamp for proper sorting
  const newNote: Note = {
    id: `NOTE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    entityId,
    entityType,
    customerId,
    text: noteText.trim(),
    createdBy,
    createdAt: new Date().toISOString(),
    // Support both formats for backward compatibility
    ...(attachment && !attachments && { attachment }), // Legacy single attachment
    ...(attachments && attachments.length > 0 && { attachments }), // New multiple attachments
  };
  
  // Add note to the beginning (newest first)
  allNotes.unshift(newNote);
  saveNotes(allNotes);
  
  return newNote;
};

/**
 * Group and merge notes by entityId, createdAt, and createdBy
 * This merges notes that were saved separately (e.g., text + attachments)
 */
export const groupAndMergeNotes = (notes: Note[]): Note[] => {
  const grouped = new Map<string, Note>();
  
  notes.forEach((note) => {
    // Create group key: entityId-createdAt-createdBy
    // Round createdAt to nearest second to group notes created at the same time
    const createdAtDate = new Date(note.createdAt);
    const roundedTime = new Date(
      Math.floor(createdAtDate.getTime() / 1000) * 1000
    ).toISOString();
    const groupKey = `${note.entityId}-${roundedTime}-${note.createdBy}`;
    
    if (grouped.has(groupKey)) {
      // Merge with existing note
      const existing = grouped.get(groupKey)!;
      
      // Merge text (combine if both have text)
      if (note.text && existing.text && note.text !== existing.text) {
        existing.text = `${existing.text}\n${note.text}`;
      } else if (note.text && !existing.text) {
        existing.text = note.text;
      }
      
      // Merge attachments
      const existingAttachments = existing.attachments || (existing.attachment ? [existing.attachment] : []);
      const newAttachments = note.attachments || (note.attachment ? [note.attachment] : []);
      
      // Combine and deduplicate by URL
      const allAttachments = [...existingAttachments];
      newAttachments.forEach((newAtt) => {
        if (!allAttachments.some((att) => att.url === newAtt.url)) {
          allAttachments.push(newAtt);
        }
      });
      
      if (allAttachments.length > 0) {
        existing.attachments = allAttachments;
        // Remove legacy attachment field if we have attachments array
        if (existing.attachment && allAttachments.length > 1) {
          delete existing.attachment;
        }
      }
    } else {
      // Create new grouped note
      const groupedNote: Note = {
        ...note,
        // Convert single attachment to attachments array if needed
        attachments: note.attachments || (note.attachment ? [note.attachment] : []),
      };
      if (groupedNote.attachments && groupedNote.attachments.length > 0) {
        delete groupedNote.attachment; // Remove legacy field
      }
      grouped.set(groupKey, groupedNote);
    }
  });
  
  return Array.from(grouped.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Add multiple notes at once (useful when saving notes from invoice/estimate creation)
 */
export const addNotes = (
  notes: Array<{
    entityId: string;
    entityType: "invoice" | "estimate" | "customer" | "job" | "equipment";
    customerId: string;
    text: string;
    attachment?: NoteAttachment;
    attachments?: NoteAttachment[];
  }>
): Note[] => {
  const allNotes = getAllNotes();
  
  // Get current user name
  const userName = localStorage.getItem("userName") || 
                   localStorage.getItem("userFullName") || 
                   "Current User";
  const createdBy = userName.split(" ")[0];
  
  const newNotes: Note[] = notes.map((noteData) => ({
    id: `NOTE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    entityId: noteData.entityId,
    entityType: noteData.entityType,
    customerId: noteData.customerId,
    text: noteData.text.trim(),
    createdBy,
    createdAt: new Date().toISOString(),
    // Support both formats
    ...(noteData.attachment && !noteData.attachments && { attachment: noteData.attachment }),
    ...(noteData.attachments && noteData.attachments.length > 0 && { attachments: noteData.attachments }),
  }));
  
  // Add all notes to the beginning (newest first)
  allNotes.unshift(...newNotes);
  saveNotes(allNotes);
  
  return newNotes;
};

/**
 * Delete a note
 */
export const deleteNote = (noteId: string): boolean => {
  const allNotes = getAllNotes();
  const beforeLength = allNotes.length;
  const filtered = allNotes.filter((note) => note.id !== noteId);
  
  if (filtered.length < beforeLength) {
    saveNotes(filtered);
    return true;
  }
  
  return false;
};

/**
 * Legacy function for backward compatibility - delete note by document
 */
export const deleteNoteByDocument = (
  documentId: string,
  documentType: "invoice" | "estimate",
  noteId: string
): boolean => {
  return deleteNote(noteId);
};

