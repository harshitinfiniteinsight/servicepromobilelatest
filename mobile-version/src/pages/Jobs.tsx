import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import JobCard from "@/components/cards/JobCard";
import EmptyState from "@/components/cards/EmptyState";
import { mockJobs, mockCustomers, mockEmployees, mockEstimates, mockInvoices, mockAgreements } from "@/data/mobileMockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Search, Briefcase, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import SendFeedbackFormModal from "@/components/modals/SendFeedbackFormModal";
import ViewFeedbackModal from "@/components/modals/ViewFeedbackModal";
import FeedbackFormModal from "@/components/modals/FeedbackFormModal";
import PreviewEstimateModal from "@/components/modals/PreviewEstimateModal";
import PreviewInvoiceModal from "@/components/modals/PreviewInvoiceModal";
import PreviewAgreementModal from "@/components/modals/PreviewAgreementModal";

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
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  
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
    
    // Payment status filtering
    let matchesPaymentStatus = true;
    if (paymentStatusFilter !== "all") {
      // Derive payment status: Completed jobs are "Paid", others are "Open"
      const paymentStatus = job.status === "Completed" ? "paid" : "open";
      matchesPaymentStatus = paymentStatus === paymentStatusFilter.toLowerCase();
    }
    
    return matchesSearch && matchesStatus && matchesDateRange && matchesJobType && matchesEmployee && matchesPaymentStatus;
  });
  
  // Clear all filters
  const clearFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setJobTypeFilter("all");
    setEmployeeFilter("all");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
  };

  // Handle date range selection with proper start/end logic
  const handleDateRangeSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (range) {
      // If end date is earlier than start date, treat it as new start date
      if (range.from && range.to && range.to < range.from) {
        setDateRange({ from: range.to, to: undefined });
      } else {
        setDateRange(range);
      }
    }
  };
  
  // Check if any filters are active
  const hasActiveFilters = dateRange.from || dateRange.to || jobTypeFilter !== "all" || (!isEmployee && employeeFilter !== "all") || statusFilter !== "all" || paymentStatusFilter !== "all";

  const summary = useMemo(() => ({
    total: filteredJobs.length,
    scheduled: filteredJobs.filter(j => j.status === "Scheduled").length,
    inProgress: filteredJobs.filter(j => j.status === "In Progress").length,
    completed: filteredJobs.filter(j => j.status === "Completed").length,
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

        {/* Row 2: Job Type + Payment Status (side by side) - For Employee */}
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

            {/* Payment Status Filter */}
            <div className="flex-[0.48] min-w-0">
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger className="w-full h-9 px-2.5 text-xs">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
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
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="inprogress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
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
                if (job.status === "Completed") return "Paid";
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

      {/* Mobile Date Range Picker Dialog - Centered Pop-up Modal */}
      <Dialog open={showDateRangePicker} onOpenChange={setShowDateRangePicker}>
        <DialogContent className="w-[90%] max-w-md p-0 rounded-2xl shadow-xl bg-white max-h-[90vh] flex flex-col overflow-hidden [&>button]:hidden">
          {/* Header with Title and Close */}
          <div className="flex items-center justify-between px-5 py-4 border-b relative">
            <DialogTitle className="text-lg font-semibold text-center flex-1 absolute left-0 right-0 pointer-events-none">
              Select Date Range
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDateRangePicker(false)}
              className="h-8 w-8 ml-auto relative z-10"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <DialogDescription className="sr-only">
            Choose a start date and end date to filter jobs by date range
          </DialogDescription>

          {/* Calendar Container - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0 overflow-x-hidden calendar-date-picker">
            <style>{`
              .calendar-date-picker table {
                display: block !important;
              }
              .calendar-date-picker table thead,
              .calendar-date-picker table tbody {
                display: block !important;
              }
              .calendar-date-picker table thead tr,
              .calendar-date-picker table tbody tr {
                display: grid !important;
                grid-template-columns: repeat(7, 1fr) !important;
                width: 100% !important;
                gap: 0 !important;
              }
              .calendar-date-picker table thead th,
              .calendar-date-picker table tbody td {
                display: flex !important;
                width: 100% !important;
                max-width: 100% !important;
              }
            `}</style>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={1}
              initialFocus
              showOutsideDays={false}
              className="w-full"
              classNames={{
                months: "flex flex-col w-full",
                month: "space-y-3 w-full",
                caption: "relative flex items-center justify-center mb-4 px-0 w-full min-h-[44px]",
                caption_label: "text-base font-semibold text-foreground text-center z-10",
                nav: "absolute left-0 right-0 flex items-center justify-between w-full pointer-events-none px-0",
                nav_button: "h-10 w-10 p-0 hover:bg-accent rounded-md flex items-center justify-center touch-target active:bg-accent/80 flex-shrink-0 pointer-events-auto",
                nav_button_previous: "",
                nav_button_next: "",
                table: "w-full border-collapse mx-auto",
                head_row: "grid grid-cols-7 mb-2 w-full gap-0",
                head_cell: "text-muted-foreground font-medium text-xs flex items-center justify-center py-2 text-center",
                row: "grid grid-cols-7 w-full mb-1 gap-0",
                cell: "h-[44px] text-center text-sm p-0 relative flex items-center justify-center [&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-range-start)]:rounded-l-full [&:has([aria-selected].day-range-middle)]:bg-primary/20",
                day: "h-[44px] w-full p-0 font-normal rounded-full hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors touch-target active:scale-95 flex items-center justify-center mx-auto max-w-[44px]",
                day_range_start: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-full font-semibold",
                day_range_end: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-full font-semibold",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-full font-semibold",
                day_range_middle: "bg-primary/20 text-foreground hover:bg-primary/30 rounded-none aria-selected:bg-primary/20",
                day_today: "bg-accent/50 text-accent-foreground font-semibold border-2 border-accent",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
                day_hidden: "invisible",
              }}
              components={{
                IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5" {...props} />,
                IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5" {...props} />,
              }}
            />
          </div>

          {/* Action Buttons - Sticky Footer */}
          <div className="flex gap-3 px-5 py-4 border-t bg-white">
            <Button
              variant="outline"
              onClick={() => {
                setDateRange({ from: undefined, to: undefined });
                setShowDateRangePicker(false);
              }}
              className="flex-1 h-11 text-base font-medium"
            >
              Clear
            </Button>
            <Button
              onClick={() => setShowDateRangePicker(false)}
              className="flex-1 h-11 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!dateRange.from || !dateRange.to}
            >
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
