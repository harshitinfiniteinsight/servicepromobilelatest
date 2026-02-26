import { useState, useEffect, useMemo } from "react";
import { X, Search, Briefcase, Calendar, MapPin, User, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  assignToJob, 
  getAllJobs, 
  getJobForDocument,
  type DocumentType 
} from "@/services/jobAssignmentService";

interface AssignToJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: DocumentType;
  documentId: string;
  customerId?: string;
  onAssigned?: (jobId: string) => void;
}

interface Job {
  id: string;
  title: string;
  customerName: string;
  customerId?: string;
  status: string;
  date?: string;
  scheduledDate?: string;
  location?: string;
  technicianName?: string;
  assignedTo?: string;
}

const statusColors: Record<string, string> = {
  "Scheduled": "bg-blue-100 text-blue-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  "Completed": "bg-green-100 text-green-700",
  "Cancelled": "bg-red-100 text-red-700",
  "On Hold": "bg-gray-100 text-gray-700",
};

const AssignToJobModal = ({
  isOpen,
  onClose,
  documentType,
  documentId,
  customerId,
  onAssigned,
}: AssignToJobModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  // Load jobs when modal opens
  useEffect(() => {
    if (isOpen) {
      const allJobs = getAllJobs();
      setJobs(allJobs);
      setSearchQuery("");
      setSelectedJobId(null);
    }
  }, [isOpen]);

  // Check if document is already assigned to a job
  const existingJobId = useMemo(() => {
    if (!isOpen) return null;
    return getJobForDocument(documentType, documentId);
  }, [isOpen, documentType, documentId]);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let result = jobs;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (job) =>
          job.id.toLowerCase().includes(query) ||
          job.title?.toLowerCase().includes(query) ||
          job.customerName?.toLowerCase().includes(query)
      );
    }

    // Sort: same customer jobs first, then by date (most recent first)
    result = [...result].sort((a, b) => {
      // Same customer first
      if (customerId) {
        const aMatch = a.customerId === customerId ? 1 : 0;
        const bMatch = b.customerId === customerId ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
      }

      // Then by date (most recent first)
      const aDate = new Date(a.date || a.scheduledDate || "2000-01-01").getTime();
      const bDate = new Date(b.date || b.scheduledDate || "2000-01-01").getTime();
      return bDate - aDate;
    });

    return result;
  }, [jobs, searchQuery, customerId]);

  // Track analytics on open
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(
        new CustomEvent("analytics", {
          detail: {
            event: "assign_to_job_clicked",
            documentType,
            documentId,
          },
        })
      );
    }
  }, [isOpen, documentType, documentId]);

  const handleAssign = async () => {
    if (!selectedJobId) {
      toast.error("Please select a job");
      return;
    }

    setIsAssigning(true);

    try {
      const result = assignToJob(documentType, documentId, selectedJobId);

      if (result.success) {
        toast.success("Assigned to Job successfully");
        onAssigned?.(selectedJobId);
        onClose();
      } else {
        toast.error(result.error || "Failed to assign to job");
      }
    } catch (error) {
      toast.error("An error occurred while assigning to job");
      console.error("Assign to job error:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not scheduled";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getDocumentTypeLabel = () => {
    switch (documentType) {
      case "estimate":
        return "Estimate";
      case "invoice":
        return "Invoice";
      case "agreement":
        return "Agreement";
      default:
        return "Document";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Assign to Job</DialogTitle>
        <DialogDescription className="sr-only">
          Assign {getDocumentTypeLabel()} {documentId} to an existing job
        </DialogDescription>

        {/* Header with orange background */}
        <div className="bg-orange-500 text-white px-4 py-4 flex items-center justify-between safe-top">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Assign to Job</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-orange-600 h-9 w-9 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content Area */}
        <div className="bg-white flex flex-col overflow-hidden safe-bottom">
          {/* Already assigned warning */}
          {existingJobId && (
            <div className="px-4 pt-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                <p>
                  This {getDocumentTypeLabel().toLowerCase()} is already assigned to{" "}
                  <span className="font-semibold">{existingJobId}</span>
                </p>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="px-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Job ID, customer, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>

          {/* Jobs List */}
          <ScrollArea className="flex-1 max-h-[45vh]">
            <div className="px-4 pb-4 space-y-2">
              {filteredJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground font-medium">No jobs found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery
                      ? "Try adjusting your search"
                      : "No jobs available to assign"}
                  </p>
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const isSelected = selectedJobId === job.id;
                  const isCurrentlyAssigned = existingJobId === job.id;
                  const jobDate = job.date || job.scheduledDate;

                  return (
                    <div
                      key={job.id}
                      onClick={() => {
                        if (!isCurrentlyAssigned) {
                          setSelectedJobId(isSelected ? null : job.id);
                        }
                      }}
                      className={cn(
                        "p-3 rounded-lg border-2 cursor-pointer transition-all",
                        isSelected
                          ? "border-orange-500 bg-orange-50"
                          : isCurrentlyAssigned
                          ? "border-green-300 bg-green-50 cursor-not-allowed"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      {/* Row 1: Job ID + Status + Selected indicator */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{job.id}</span>
                          <Badge
                            className={cn(
                              "text-[10px] px-1.5 py-0 h-4 leading-4",
                              statusColors[job.status] || "bg-gray-100 text-gray-700"
                            )}
                          >
                            {job.status}
                          </Badge>
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-5 w-5 text-orange-500" />
                        )}
                        {isCurrentlyAssigned && (
                          <Badge className="text-[10px] px-1.5 py-0 h-4 leading-4 bg-green-100 text-green-700">
                            Assigned
                          </Badge>
                        )}
                      </div>

                      {/* Row 2: Title */}
                      <p className="text-sm font-medium mt-1 truncate">{job.title}</p>

                      {/* Row 3: Customer + Date */}
                      <div className="flex items-center justify-between gap-2 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 truncate">
                          <User className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{job.customerName}</span>
                          {customerId && job.customerId === customerId && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0 h-3.5 leading-3.5 ml-1"
                            >
                              Same Customer
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(jobDate)}</span>
                        </div>
                      </div>

                      {/* Row 4: Location (if available) */}
                      {job.location && (
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Action Buttons */}
          <div className="px-4 py-4 border-t bg-white flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11"
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white"
              disabled={!selectedJobId || isAssigning}
            >
              {isAssigning ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignToJobModal;
