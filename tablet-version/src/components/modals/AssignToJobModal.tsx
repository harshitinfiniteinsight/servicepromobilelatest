import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, MapPin, Calendar, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

interface AssignToJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentType: "invoice" | "estimate" | "agreement";
  jobs: any[];
  onAssign: (jobId: string) => void;
}

const AssignToJobModal = ({
  isOpen,
  onClose,
  documentId,
  documentType,
  jobs,
  onAssign,
}: AssignToJobModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Filter jobs based on document type
  const compatibleJobs = useMemo(() => {
    return jobs.filter(job => job.sourceType === documentType);
  }, [jobs, documentType]);

  // Filter jobs based on search query
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return compatibleJobs;

    const query = searchQuery.toLowerCase();
    return compatibleJobs.filter(job => 
      job.id.toLowerCase().includes(query) ||
      job.customerName.toLowerCase().includes(query) ||
      job.title?.toLowerCase().includes(query) ||
      job.jobAddress?.toLowerCase().includes(query)
    );
  }, [compatibleJobs, searchQuery]);

  const handleAssign = () => {
    if (!selectedJobId) {
      toast.error("Please select a job");
      return;
    }

    onAssign(selectedJobId);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedJobId(null);
    onClose();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "in progress":
        return "bg-amber-100 text-amber-700";
      case "completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className="tablet:w-[780px] tablet:max-w-[780px] w-[90%] max-w-sm mx-auto p-0 rounded-2xl shadow-lg bg-white [&>button]:hidden max-h-[85vh] flex flex-col overflow-hidden" 
        onInteractOutside={handleClose}
      >
        <DialogDescription className="sr-only">
          Assign {documentType} {documentId} to an existing job
        </DialogDescription>
        
        {/* Header - Orange Theme */}
        <DialogHeader className="tablet:bg-primary tablet:text-white bg-white flex flex-row items-center justify-between px-6 tablet:px-8 py-4 tablet:py-5 border-b tablet:border-none border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Briefcase className="hidden tablet:block h-5 w-5" />
            <DialogTitle className="tablet:text-white text-lg tablet:text-xl font-semibold text-gray-800">
              Assign to Job
            </DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full tablet:hover:bg-white/10 tablet:text-white hover:bg-gray-100"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        {/* Search Section */}
        <div className="px-4 tablet:px-8 pt-5 tablet:pt-6 pb-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by Job ID, customer, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        {/* Job List - Scrollable */}
        <div className={cn(
          "flex-1 px-4 tablet:px-8 py-4 space-y-3 min-h-0",
          filteredJobs.length > 5 ? "overflow-y-auto" : "overflow-hidden"
        )}>
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                  selectedJobId === job.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                {/* Top Row: Job ID and Status */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{job.id}</span>
                  <Badge className={cn("text-xs", getStatusBadgeColor(job.status))}>
                    {job.status}
                  </Badge>
                </div>

                {/* Second Row: Title or Source Label */}
                <div className="mb-2">
                  {job.title ? (
                    <p className="text-sm text-gray-700">{job.title}</p>
                  ) : job.sourceId ? (
                    <p className="text-sm text-gray-600">
                      From {documentType.charAt(0).toUpperCase() + documentType.slice(1)} {job.sourceId}
                    </p>
                  ) : null}
                </div>

                {/* Third Row: Customer and Date */}
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-gray-700">{job.customerName}</span>
                  {job.scheduledDate && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{format(new Date(job.scheduledDate), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>

                {/* Fourth Row: Address */}
                {job.jobAddress && (
                  <div className="flex items-start gap-1.5 text-sm text-gray-600">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{job.jobAddress}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Briefcase className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No matching jobs found
              </h3>
              <p className="text-sm text-gray-600 max-w-sm">
                {compatibleJobs.length === 0
                  ? `No jobs created from ${documentType}s yet. Create a job first to assign this ${documentType}.`
                  : "Create a job first or adjust your search."}
              </p>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="flex gap-3 px-4 tablet:px-8 py-4 tablet:py-5 border-t border-gray-200 bg-white flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 tablet:flex-initial tablet:px-8 rounded-lg text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedJobId}
            className="flex-1 tablet:flex-initial tablet:px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Assign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignToJobModal;
