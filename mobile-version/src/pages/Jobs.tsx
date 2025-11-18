import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import JobCard from "@/components/cards/JobCard";
import EmptyState from "@/components/cards/EmptyState";
import { mockJobs } from "@/data/mobileMockData";
import { mockCustomers } from "@/data/mobileMockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Briefcase } from "lucide-react";
import { toast } from "sonner";
import SendFeedbackFormModal from "@/components/modals/SendFeedbackFormModal";
import ViewFeedbackModal from "@/components/modals/ViewFeedbackModal";

// Track job feedback status
type JobFeedbackStatus = {
  [jobId: string]: {
    exists: boolean;
    feedback?: {
      rating: number;
      comment: string;
      submittedAt: string;
    };
  };
};

const Jobs = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Manage job statuses (initialize from mockJobs, but allow updates)
  const [jobs, setJobs] = useState(mockJobs);
  
  // Track feedback status for completed jobs
  const [jobFeedbackStatus, setJobFeedbackStatus] = useState<JobFeedbackStatus>({});
  
  // Modals state
  const [showFeedbackFormModal, setShowFeedbackFormModal] = useState(false);
  const [showViewFeedbackModal, setShowViewFeedbackModal] = useState(false);
  const [selectedJobForFeedback, setSelectedJobForFeedback] = useState<typeof mockJobs[0] | null>(null);
  
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
                         job.customerName.toLowerCase().includes(search.toLowerCase()) ||
                         job.technicianName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status.toLowerCase() === statusFilter.toLowerCase().replace(" ", "");
    return matchesSearch && matchesStatus;
  });

  const summary = useMemo(() => ({
    total: jobs.length,
    scheduled: jobs.filter(j => j.status === "Scheduled").length,
    inProgress: jobs.filter(j => j.status === "In Progress").length,
    completed: jobs.filter(j => j.status === "Completed").length,
  }), [jobs]);

  // Handle status change
  const handleStatusChange = (jobId: string, newStatus: string) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
    toast.success(`Job status updated to ${newStatus}`);
  };

  // Handle feedback form send
  const handleSendFeedbackForm = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJobForFeedback(job);
      setShowFeedbackFormModal(true);
    }
  };

  // Handle feedback form submission
  const handleFeedbackFormSent = (jobId: string) => {
    // Mark feedback as sent (but not yet received)
    setJobFeedbackStatus(prev => ({
      ...prev,
      [jobId]: { exists: false } // Form sent, but feedback not yet received
    }));
    setShowFeedbackFormModal(false);
    setSelectedJobForFeedback(null);
    toast.success("Feedback form sent successfully");
  };

  // Handle view feedback
  const handleViewFeedback = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJobForFeedback(job);
      setShowViewFeedbackModal(true);
    }
  };

  // Check if feedback exists for a job
  const hasFeedback = (jobId: string) => {
    return jobFeedbackStatus[jobId]?.exists === true;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader 
        title="Jobs"
        showBack={true}
        actions={
          <Button size="sm" onClick={() => navigate("/jobs/new")}>
            <Plus className="h-4 w-4" />
          </Button>
        }
      />
      
      <div className="flex-1 overflow-y-auto scrollable px-4 pb-6 space-y-4" style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top) + 0.5rem)' }}>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Scheduled</p>
            <p className="text-xl font-bold">{summary.scheduled}</p>
          </div>
          <div className="p-3 rounded-xl bg-warning/5 border border-warning/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">In Progress</p>
            <p className="text-xl font-bold">{summary.inProgress}</p>
          </div>
          <div className="p-3 rounded-xl bg-success/5 border border-success/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Completed</p>
            <p className="text-xl font-bold">{summary.completed}</p>
          </div>
        </div>

        {/* Status Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="inprogress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-4 space-y-3">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => {
                const customer = mockCustomers.find(c => c.id === job.customerId);
                return (
                  <JobCard 
                    key={job.id} 
                    job={job}
                    customerEmail={customer?.email}
                    customerPhone={customer?.phone}
                    hasFeedback={hasFeedback(job.id)}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    onStatusChange={(newStatus) => handleStatusChange(job.id, newStatus)}
                    onSendFeedbackForm={() => handleSendFeedbackForm(job.id)}
                    onViewFeedback={() => handleViewFeedback(job.id)}
                    onQuickAction={(action) => {
                      switch (action) {
                        case "view":
                          navigate(`/jobs/${job.id}`);
                          break;
                        case "edit":
                          navigate(`/jobs/${job.id}/edit`);
                          break;
                        case "share":
                          // Handle share action
                          break;
                        case "cancel":
                          // Handle cancel action
                          break;
                      }
                    }}
                  />
                );
              })
            ) : (
              <EmptyState
                icon={<Briefcase className="h-10 w-10 text-muted-foreground" />}
                title="No jobs found"
                description="Try adjusting your search or filters"
                actionLabel="Create Job"
                onAction={() => navigate("/jobs/new")}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Send Feedback Form Modal */}
      {selectedJobForFeedback && (
        <SendFeedbackFormModal
          isOpen={showFeedbackFormModal}
          onClose={() => {
            setShowFeedbackFormModal(false);
            setSelectedJobForFeedback(null);
          }}
          job={selectedJobForFeedback}
          customerEmail={mockCustomers.find(c => c.id === selectedJobForFeedback.customerId)?.email || ""}
          onSend={() => handleFeedbackFormSent(selectedJobForFeedback.id)}
        />
      )}

      {/* View Feedback Modal */}
      {selectedJobForFeedback && (
        <ViewFeedbackModal
          isOpen={showViewFeedbackModal}
          onClose={() => {
            setShowViewFeedbackModal(false);
            setSelectedJobForFeedback(null);
          }}
          job={selectedJobForFeedback}
          feedback={jobFeedbackStatus[selectedJobForFeedback.id]?.feedback}
        />
      )}
    </div>
  );
};

export default Jobs;
