import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import JobCard from "@/components/cards/JobCard";
import EmptyState from "@/components/cards/EmptyState";
import { mockJobs, mockCustomers, mockEmployees, mockEstimates, mockInvoices, mockAgreements } from "@/data/mobileMockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Briefcase, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import SendFeedbackFormModal from "@/components/modals/SendFeedbackFormModal";
import ViewFeedbackModal from "@/components/modals/ViewFeedbackModal";
import FeedbackFormModal from "@/components/modals/FeedbackFormModal";
import PreviewEstimateModal from "@/components/modals/PreviewEstimateModal";
import PreviewInvoiceModal from "@/components/modals/PreviewInvoiceModal";
import PreviewAgreementModal from "@/components/modals/PreviewAgreementModal";
import DateRangePickerModal from "@/components/modals/DateRangePickerModal";

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
  
  // Filter states
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  
  // Check if user is employee
  const userRole = localStorage.getItem("userType") || "merchant";
  const isEmployee = userRole === "employee";
  
  // Get current employee info for filtering
  const currentEmployeeId = localStorage.getItem("currentEmployeeId") || "1";
  const currentEmployee = mockEmployees.find(emp => emp.id === currentEmployeeId);
  const currentEmployeeName = currentEmployee?.name || "";
  
  // Transform invoices, estimates, and agreements into job format
  const transformDocumentsToJobs = useMemo(() => {
    // Helper to assign technician based on customer or random assignment
    const assignTechnician = (customerId: string, index: number) => {
      const technicians = ["Mike Johnson", "Tom Wilson", "Chris Davis", "Sarah Martinez"];
      // Use customer ID to consistently assign same technician to same customer
      const techIndex = (parseInt(customerId) + index) % technicians.length;
      return technicians[techIndex];
    };

    // Transform invoices to jobs
    const invoiceJobs = mockInvoices.map((invoice, index) => ({
      id: invoice.id,
      title: `Invoice ${invoice.id}`,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      technicianId: "1", // Default, can be enhanced
      technicianName: assignTechnician(invoice.customerId, index),
      date: invoice.issueDate,
      time: "09:00 AM", // Default time
      status: invoice.status === "Paid" ? "Completed" : invoice.status === "Overdue" ? "In Progress" : "Scheduled",
      location: "", // Can be enhanced with customer address
    }));

    // Transform estimates to jobs
    const estimateJobs = mockEstimates.map((estimate, index) => ({
      id: estimate.id,
      title: `Estimate ${estimate.id}`,
      customerId: estimate.customerId,
      customerName: estimate.customerName,
      technicianId: "1",
      technicianName: assignTechnician(estimate.customerId, index),
      date: estimate.date,
      time: "10:00 AM",
      status: estimate.status === "Paid" ? "Completed" : "Scheduled",
      location: "",
    }));

    // Transform agreements to jobs
    const agreementJobs = mockAgreements.map((agreement, index) => ({
      id: agreement.id,
      title: agreement.type,
      customerId: agreement.customerId,
      customerName: agreement.customerName,
      technicianId: "1",
      technicianName: assignTechnician(agreement.customerId, index),
      date: agreement.startDate,
      time: "11:00 AM",
      status: agreement.status === "Paid" ? "Completed" : "In Progress",
      location: "",
    }));

    // Combine all jobs
    const allJobs = [...mockJobs, ...invoiceJobs, ...estimateJobs, ...agreementJobs];

    // For employees, filter to only their assigned jobs
    if (isEmployee && currentEmployeeName) {
      return allJobs.filter(job => job.technicianName === currentEmployeeName);
    }

    return allJobs;
  }, [isEmployee, currentEmployeeName]);

  // Manage job statuses (initialize from combined jobs, but allow updates)
  const [jobs, setJobs] = useState(transformDocumentsToJobs);
  
  // Update jobs when transformDocumentsToJobs changes (e.g., when employee changes)
  useEffect(() => {
    setJobs(transformDocumentsToJobs);
  }, [transformDocumentsToJobs]);
  
  // Track feedback status for completed jobs
  // Load from localStorage if available (for persistence across page reloads)
  const [jobFeedbackStatus, setJobFeedbackStatus] = useState<JobFeedbackStatus>(() => {
    try {
      const stored = localStorage.getItem("jobFeedbackStatus");
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn("Failed to load feedback from localStorage:", error);
      return {};
    }
  });
  
  // Modals state
  const [showFeedbackFormModal, setShowFeedbackFormModal] = useState(false);
  const [showViewFeedbackModal, setShowViewFeedbackModal] = useState(false);
  const [showFillFeedbackFormModal, setShowFillFeedbackFormModal] = useState(false);
  const [selectedJobForFeedback, setSelectedJobForFeedback] = useState<typeof mockJobs[0] | null>(null);
  
  // Preview modals state
  const [showEstimatePreview, setShowEstimatePreview] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [showAgreementPreview, setShowAgreementPreview] = useState(false);
  const [previewEstimate, setPreviewEstimate] = useState<any>(null);
  const [previewInvoice, setPreviewInvoice] = useState<any>(null);
  const [previewAgreement, setPreviewAgreement] = useState<any>(null);
  
  // Get unique employees from jobs
  const availableEmployees = useMemo(() => {
    const employeeSet = new Set<string>();
    jobs.forEach(job => {
      if (job.technicianName) {
        employeeSet.add(job.technicianName);
      }
    });
    return Array.from(employeeSet).sort();
  }, [jobs]);
  
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
                         job.customerName.toLowerCase().includes(search.toLowerCase()) ||
                         job.technicianName.toLowerCase().includes(search.toLowerCase());
    
    // Handle status filtering - normalize status values
    let matchesStatus = true;
    if (statusFilter !== "all") {
      if (statusFilter === "inprogress") {
        matchesStatus = job.status === "In Progress";
      } else if (statusFilter === "feedbackreceived") {
        matchesStatus = job.status === "Feedback Received";
      } else {
        matchesStatus = job.status.toLowerCase() === statusFilter.toLowerCase();
      }
    }
    
    // Date range filtering
    let matchesDateRange = true;
    if (dateRange.from || dateRange.to) {
      const jobDate = new Date(job.date);
      jobDate.setHours(0, 0, 0, 0);
      
      if (dateRange.from) {
        const start = new Date(dateRange.from);
        start.setHours(0, 0, 0, 0);
        if (jobDate < start) matchesDateRange = false;
      }
      if (dateRange.to) {
        const end = new Date(dateRange.to);
        end.setHours(23, 59, 59, 999);
        if (jobDate > end) matchesDateRange = false;
      }
    }
    
    // Job type filtering - derive from job ID
    let matchesJobType = true;
    if (jobTypeFilter !== "all") {
      const jobId = job.id.toUpperCase();
      if (jobTypeFilter === "agreement") {
        matchesJobType = jobId.startsWith("AG") || jobId.includes("AGR");
      } else if (jobTypeFilter === "estimate") {
        matchesJobType = jobId.startsWith("EST");
      } else if (jobTypeFilter === "invoice") {
        matchesJobType = jobId.startsWith("INV");
      }
    }
    
    // Employee filtering - for employees, always match their own jobs (already filtered)
    let matchesEmployee = true;
    if (!isEmployee && employeeFilter !== "all") {
      matchesEmployee = job.technicianName === employeeFilter;
    }
    
    return matchesSearch && matchesStatus && matchesDateRange && matchesJobType && matchesEmployee;
  });
  
  // Clear all filters
  const clearFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setJobTypeFilter("all");
    setEmployeeFilter("all");
    setStatusFilter("all");
  };

  // Handle date range selection with proper start/end logic
  const handleDateRangeConfirm = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
  };
  
  // Check if any filters are active
  const hasActiveFilters = dateRange.from || dateRange.to || jobTypeFilter !== "all" || (!isEmployee && employeeFilter !== "all") || statusFilter !== "all";

  const summary = useMemo(() => ({
    total: filteredJobs.length,
    scheduled: filteredJobs.filter(j => j.status === "Scheduled").length,
    inProgress: filteredJobs.filter(j => j.status === "In Progress").length,
    completed: filteredJobs.filter(j => j.status === "Completed").length,
    feedbackReceived: filteredJobs.filter(j => j.status === "Feedback Received").length,
  }), [filteredJobs]);

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

  // Handle fill feedback form directly
  const handleFillFeedbackForm = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJobForFeedback(job);
      // Close send modal and open feedback form modal
      setShowFeedbackFormModal(false);
      setTimeout(() => {
        setShowFillFeedbackFormModal(true);
      }, 150);
    }
  };

  // Handle feedback form submission
  const handleFeedbackSubmit = (feedback: {
    rating: number;
    comment: string;
    jobId: string;
  }) => {
    // Update job feedback status with submitted feedback
    const updatedStatus = {
      ...jobFeedbackStatus,
      [feedback.jobId]: {
        exists: true,
        feedback: {
          rating: feedback.rating,
          comment: feedback.comment,
          submittedAt: new Date().toLocaleString(),
        },
      },
    };
    
    setJobFeedbackStatus(updatedStatus);
    
    // Change job status from "Completed" to "Feedback Received" when feedback is submitted
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === feedback.jobId && job.status === "Completed"
          ? { ...job, status: "Feedback Received" }
          : job
      )
    );
    
    // Persist to localStorage so it can be accessed from other pages (e.g., Employees)
    try {
      localStorage.setItem("jobFeedbackStatus", JSON.stringify(updatedStatus));
    } catch (error) {
      console.warn("Failed to save feedback to localStorage:", error);
    }

    toast.success("Feedback submitted successfully");
    
    // Close any open modals
    setShowFillFeedbackFormModal(false);
    setShowFeedbackFormModal(false);
    setSelectedJobForFeedback(null);
  };

  // Handle view feedback
  const handleViewFeedback = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJobForFeedback(job);
      setShowViewFeedbackModal(true);
    }
  };

  // Handle preview - open appropriate modal based on document type
  const handlePreview = (documentId: string, jobType: "Agreement" | "Estimate" | "Invoice") => {
    if (jobType === "Estimate") {
      const estimate = mockEstimates.find(e => e.id === documentId);
      if (estimate) {
        setPreviewEstimate(estimate);
        setShowEstimatePreview(true);
      } else {
        toast.error(`Estimate ${documentId} not found`);
      }
    } else if (jobType === "Invoice") {
      const invoice = mockInvoices.find(i => i.id === documentId);
      if (invoice) {
        setPreviewInvoice(invoice);
        setShowInvoicePreview(true);
      } else {
        toast.error(`Invoice ${documentId} not found`);
      }
    } else if (jobType === "Agreement") {
      const agreement = mockAgreements.find(a => a.id === documentId);
      if (agreement) {
        setPreviewAgreement(agreement);
        setShowAgreementPreview(true);
      } else {
        toast.error(`Agreement ${documentId} not found`);
      }
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
      />
      
      <div className="flex-1 overflow-y-auto scrollable px-4 pb-6 space-y-2" style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top) + 0.5rem)' }}>
        {/* Row 1: Search + Date Range (side by side) */}
        <div className="flex items-center gap-2">
          {/* Search Field */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9 text-xs"
              />
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="flex-[0.48] min-w-0">
            <Button
              variant="outline"
              onClick={() => setShowDateRangePicker(true)}
              className="w-full h-9 px-2.5 text-xs font-normal justify-start gap-1.5"
            >
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              {dateRange.from && dateRange.to ? (
                <span className="truncate text-left text-xs">
                  {format(dateRange.from, "MM/dd/yyyy")} - {format(dateRange.to, "MM/dd/yyyy")}
                </span>
              ) : dateRange.from ? (
                <span className="truncate text-left text-xs">{format(dateRange.from, "MM/dd/yyyy")}</span>
              ) : (
                <span className="text-muted-foreground truncate text-left text-xs">Date Range</span>
              )}
            </Button>
          </div>
        </div>

        {/* Row 2: Job Type + Job Status (side by side) - For Employee */}
        {isEmployee ? (
          <div className="flex items-center gap-2">
            {/* Job Type Filter */}
            <div className="flex-[0.48] min-w-0">
              <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                <SelectTrigger className="w-full h-9 px-2.5 text-xs">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="agreement">Agreement</SelectItem>
                  <SelectItem value="estimate">Estimate</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Job Status Filter */}
            <div className="flex-[0.48] min-w-0">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full h-9 px-2.5 text-xs">
                  <SelectValue placeholder="Job Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="inprogress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="feedbackreceived">Feedback Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <>
            {/* Row 2: Date Range + Job Status (48% each) - For Merchant */}
            <div className="flex items-center gap-2">
              {/* Date Range Filter */}
              <div className="flex-[0.48] min-w-0">
                <Button
                  variant="outline"
                  onClick={() => setShowDateRangePicker(true)}
                  className="w-full h-9 px-2.5 text-xs font-normal justify-start gap-1.5"
                >
                  <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  {dateRange.from && dateRange.to ? (
                    <span className="truncate text-left text-xs">
                      {format(dateRange.from, "MM/dd/yyyy")} - {format(dateRange.to, "MM/dd/yyyy")}
                    </span>
                  ) : dateRange.from ? (
                    <span className="truncate text-left text-xs">{format(dateRange.from, "MM/dd/yyyy")}</span>
                  ) : (
                    <span className="text-muted-foreground truncate text-left text-xs">Date Range</span>
                  )}
                </Button>
              </div>

              {/* Job Status Filter */}
              <div className="flex-[0.48] min-w-0">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full h-9 px-2.5 text-xs">
                    <SelectValue placeholder="Job Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="inprogress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="feedbackreceived">Feedback Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Job Type + Employee (48% each) - For Merchant */}
            <div className="flex items-center gap-2">
              {/* Job Type Filter */}
              <div className="flex-[0.48] min-w-0">
                <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                  <SelectTrigger className="w-full h-9 px-2.5 text-xs">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="agreement">Agreement</SelectItem>
                    <SelectItem value="estimate">Estimate</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Employee Filter */}
              <div className="flex-[0.48] min-w-0">
                <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                  <SelectTrigger className="w-full h-9 px-2.5 text-xs">
                    <SelectValue placeholder="Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {availableEmployees.map((employee) => (
                      <SelectItem key={employee} value={employee}>
                        {employee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {/* Clear Filters Button - Only show if filters are active */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear Filters
            </Button>
          </div>
        )}
        
        {/* Summary Cards - Four Metrics */}
        <div className="grid grid-cols-4 gap-2">
          {/* Scheduled - Light Peach */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#FFE5D9] border border-[#FFD4C4] min-h-[80px]">
            <p className="text-xs text-[#8B4513] font-medium mb-1.5 text-center leading-tight">Scheduled</p>
            <p className="text-xl font-bold text-[#8B4513] text-center">{summary.scheduled}</p>
          </div>
          
          {/* In Progress - Light Yellow */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#FFF9E6] border border-[#FFE8B3] min-h-[80px]">
            <p className="text-xs text-[#B8860B] font-medium mb-1.5 text-center leading-tight">In Progress</p>
            <p className="text-xl font-bold text-[#B8860B] text-center">{summary.inProgress}</p>
          </div>
          
          {/* Completed - Light Green */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#E6F7E6] border border-[#B3E6B3] min-h-[80px]">
            <p className="text-xs text-[#2D5016] font-medium mb-1.5 text-center leading-tight">Completed</p>
            <p className="text-xl font-bold text-[#2D5016] text-center">{summary.completed}</p>
          </div>
          
          {/* Feedback Received - Light Mint */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#E0F7F4] border border-[#B3E6DE] min-h-[80px]">
            <p className="text-xs text-[#0D4D3D] font-medium mb-1.5 text-center leading-tight">Feedback Received</p>
            <p className="text-xl font-bold text-[#0D4D3D] text-center">{summary.feedbackReceived}</p>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-2.5">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => {
              const customer = mockCustomers.find(c => c.id === job.customerId);
              
              // Derive jobType from job ID or assign based on job index/pattern
              const getJobType = (): "Agreement" | "Estimate" | "Invoice" | undefined => {
                const id = job.id.toUpperCase();
                if (id.startsWith("AG") || id.includes("AGR")) return "Agreement";
                if (id.startsWith("EST")) return "Estimate";
                if (id.startsWith("INV")) return "Invoice";
                // For generic JOB-XXX IDs, assign types in a pattern for demo purposes
                // In real app, this would come from the actual job/invoice/estimate/agreement data
                if (id.startsWith("JOB")) {
                  const jobNum = parseInt(id.replace(/[^0-9]/g, "")) || 0;
                  // Assign types in a rotating pattern: Invoice, Estimate, Agreement
                  const typeIndex = jobNum % 3;
                  if (typeIndex === 0) return "Invoice";
                  if (typeIndex === 1) return "Estimate";
                  return "Agreement";
                }
                return undefined;
              };
              
              // Derive paymentStatus from document status or job status
              const getPaymentStatus = (): "Paid" | "Open" | undefined => {
                const id = job.id.toUpperCase();
                
                // Check invoice status
                if (id.startsWith("INV")) {
                  const invoice = mockInvoices.find(inv => inv.id === job.id);
                  if (invoice) {
                    return invoice.status === "Paid" ? "Paid" : "Open";
                  }
                }
                
                // Check estimate status
                if (id.startsWith("EST")) {
                  const estimate = mockEstimates.find(est => est.id === job.id);
                  if (estimate) {
                    return estimate.status === "Paid" ? "Paid" : "Open";
                  }
                }
                
                // Check agreement status
                if (id.startsWith("AGR") || id.includes("AGR")) {
                  const agreement = mockAgreements.find(agr => agr.id === job.id);
                  if (agreement) {
                    return agreement.status === "Paid" ? "Paid" : "Open";
                  }
                }
                
                // For generic JOB-XXX IDs, use job status
                if (job.status === "Completed" || job.status === "Feedback Received") return "Paid";
                return "Open";
              };
              
              return (
                  <JobCard 
                    key={job.id} 
                    job={job}
                    jobType={getJobType()}
                    paymentStatus={getPaymentStatus()}
                    customerEmail={customer?.email}
                    customerPhone={customer?.phone}
                    hasFeedback={hasFeedback(job.id)}
                    isEmployee={isEmployee}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    onStatusChange={(newStatus) => handleStatusChange(job.id, newStatus)}
                    onSendFeedbackForm={() => handleSendFeedbackForm(job.id)}
                    onViewFeedback={() => handleViewFeedback(job.id)}
                    onPreview={handlePreview}
                    onQuickAction={(action) => {
                    switch (action) {
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
            />
          )}
        </div>
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
          onFillForm={() => handleFillFeedbackForm(selectedJobForFeedback.id)}
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

      {/* Fill Feedback Form Modal */}
      {selectedJobForFeedback && (
        <FeedbackFormModal
          isOpen={showFillFeedbackFormModal}
          onClose={() => {
            setShowFillFeedbackFormModal(false);
            setSelectedJobForFeedback(null);
          }}
          job={selectedJobForFeedback}
          onSubmit={handleFeedbackSubmit}
        />
      )}

      {/* Date Range Picker Modal */}
      <DateRangePickerModal
        open={showDateRangePicker}
        onOpenChange={setShowDateRangePicker}
        initialRange={dateRange}
        onConfirm={handleDateRangeConfirm}
        resetToToday={true}
      />

      {/* Preview Modals */}
      {previewEstimate && (
        <PreviewEstimateModal
          isOpen={showEstimatePreview}
          onClose={() => {
            setShowEstimatePreview(false);
            setPreviewEstimate(null);
          }}
          estimate={previewEstimate}
          onAction={(action) => {
            if (action === "edit") {
              navigate(`/estimates/${previewEstimate.id}/edit`);
              setShowEstimatePreview(false);
              setPreviewEstimate(null);
            } else if (action !== "print") {
              setShowEstimatePreview(false);
              setPreviewEstimate(null);
            }
          }}
        />
      )}

      {previewInvoice && (
        <PreviewInvoiceModal
          isOpen={showInvoicePreview}
          onClose={() => {
            setShowInvoicePreview(false);
            setPreviewInvoice(null);
          }}
          invoice={previewInvoice}
          onAction={(action) => {
            if (action === "edit") {
              navigate(`/invoices/${previewInvoice.id}/edit`);
              setShowInvoicePreview(false);
              setPreviewInvoice(null);
            } else if (action !== "print") {
              setShowInvoicePreview(false);
              setPreviewInvoice(null);
            }
          }}
        />
      )}

      {previewAgreement && (
        <PreviewAgreementModal
          isOpen={showAgreementPreview}
          onClose={() => {
            setShowAgreementPreview(false);
            setPreviewAgreement(null);
          }}
          agreement={previewAgreement}
          onAction={(action) => {
            if (action === "edit") {
              navigate(`/agreements/${previewAgreement.id}/edit`);
              setShowAgreementPreview(false);
              setPreviewAgreement(null);
            } else if (action !== "print") {
              setShowAgreementPreview(false);
              setPreviewAgreement(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default Jobs;
