import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import JobCard from "@/components/cards/JobCard";
import EmptyState from "@/components/cards/EmptyState";
import { mockJobs, mockCustomers, mockEmployees, mockEstimates, mockInvoices, mockAgreements } from "@/data/mobileMockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Briefcase, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import SendFeedbackFormModal from "@/components/modals/SendFeedbackFormModal";
import ViewFeedbackModal from "@/components/modals/ViewFeedbackModal";
import FeedbackFormModal from "@/components/modals/FeedbackFormModal";
import PreviewEstimateModal from "@/components/modals/PreviewEstimateModal";
import PreviewInvoiceModal from "@/components/modals/PreviewInvoiceModal";
import PreviewAgreementModal from "@/components/modals/PreviewAgreementModal";
import DateRangePickerModal from "@/components/modals/DateRangePickerModal";
import ReassignEmployeeModal from "@/components/modals/ReassignEmployeeModal";

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
  
  // Reassign employee modal state
  const [showReassignEmployeeModal, setShowReassignEmployeeModal] = useState(false);
  const [selectedJobForReassign, setSelectedJobForReassign] = useState<typeof jobs[0] | null>(null);
  
  // Metrics carousel state
  const [metricsGroupIndex, setMetricsGroupIndex] = useState(0);
  const metricsCarouselRef = useRef<HTMLDivElement>(null);
  
  // Total groups: Group 1 (Scheduled, In Progress, Completed), Group 2 (Cancelled, Feedback Received)
  const totalGroups = 2;
  
  // Handle carousel navigation
  const handlePreviousGroup = () => {
    if (metricsGroupIndex > 0) {
      setMetricsGroupIndex(metricsGroupIndex - 1);
    }
  };
  
  const handleNextGroup = () => {
    if (metricsGroupIndex < totalGroups - 1) {
      setMetricsGroupIndex(metricsGroupIndex + 1);
    }
  };
  
  // Scroll carousel when group index changes
  useEffect(() => {
    if (metricsCarouselRef.current) {
      const container = metricsCarouselRef.current;
      // Each group is exactly the container's visible width (100% width)
      // Scroll by the container's clientWidth (visible width without scrollbar)
      const scrollAmount = metricsGroupIndex * container.clientWidth;
      container.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [metricsGroupIndex]);
  
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
      } else if (statusFilter === "cancelled") {
        matchesStatus = job.status === "Cancelled";
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
      const id = job.id.toUpperCase();
      let paymentStatus: "Paid" | "Open" | undefined = undefined;
      
      // Check invoice status
      if (id.startsWith("INV")) {
        const invoice = mockInvoices.find(inv => inv.id === job.id);
        if (invoice) {
          paymentStatus = invoice.status === "Paid" ? "Paid" : "Open";
        }
      }
      // Check estimate status
      else if (id.startsWith("EST")) {
        const estimate = mockEstimates.find(est => est.id === job.id);
        if (estimate) {
          paymentStatus = estimate.status === "Paid" ? "Paid" : "Open";
        }
      }
      // Check agreement status
      else if (id.startsWith("AGR") || id.includes("AGR")) {
        const agreement = mockAgreements.find(agr => agr.id === job.id);
        if (agreement) {
          paymentStatus = agreement.status === "Paid" ? "Paid" : "Open";
        }
      }
      // For generic JOB-XXX IDs, use job status
      else {
        if (job.status === "Completed" || job.status === "Feedback Received") {
          paymentStatus = "Paid";
        } else {
          paymentStatus = "Open";
        }
      }
      
      if (paymentStatusFilter === "open") {
        matchesPaymentStatus = paymentStatus === "Open";
      } else if (paymentStatusFilter === "paid") {
        matchesPaymentStatus = paymentStatus === "Paid";
      }
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
  const handleDateRangeConfirm = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
  };
  
  // Check if any filters are active
  const hasActiveFilters = dateRange.from || dateRange.to || jobTypeFilter !== "all" || (!isEmployee && employeeFilter !== "all") || statusFilter !== "all" || paymentStatusFilter !== "all";

  const summary = useMemo(() => ({
    total: filteredJobs.length,
    scheduled: filteredJobs.filter(j => j.status === "Scheduled").length,
    inProgress: filteredJobs.filter(j => j.status === "In Progress").length,
    completed: filteredJobs.filter(j => j.status === "Completed").length,
    cancelled: filteredJobs.filter(j => j.status === "Cancelled").length,
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

  // Handle reassign employee
  const handleReassignEmployee = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJobForReassign(job);
      setShowReassignEmployeeModal(true);
    }
  };

  // Handle employee reassignment save
  const handleReassignSave = (newEmployeeId: string) => {
    if (!selectedJobForReassign) return;
    
    const newEmployee = mockEmployees.find(emp => emp.id === newEmployeeId);
    if (newEmployee) {
      // Update the job's technician
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === selectedJobForReassign.id 
            ? { ...job, technicianName: newEmployee.name, technicianId: newEmployee.id }
            : job
        )
      );
      toast.success(`Employee reassigned to ${newEmployee.name}`);
      setShowReassignEmployeeModal(false);
      setSelectedJobForReassign(null);
    }
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
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="feedbackreceived">Feedback Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <>
            {/* Row 2: Employees + Type of Job + Job Status + Payment Status - For Merchant */}
            <div className="flex items-center gap-2 flex-wrap">
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
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="feedbackreceived">Feedback Received</SelectItem>
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
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
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
        
        {/* Summary Cards - Carousel with 3 Metrics at a Time */}
        <div className="relative mb-4 px-10">
          {/* Left Arrow */}
          <button
            onClick={handlePreviousGroup}
            disabled={metricsGroupIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center transition-all ${
              metricsGroupIndex === 0
                ? 'opacity-40 cursor-not-allowed'
                : 'opacity-100 hover:bg-gray-50 active:scale-95'
            }`}
            aria-label="Previous metrics"
          >
            <ChevronLeft className="h-4 w-4 text-gray-700" />
          </button>
          
          {/* Carousel Container */}
          <div
            ref={metricsCarouselRef}
            className="flex gap-2 overflow-x-hidden scroll-smooth"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {/* Group 1: Scheduled, In Progress, Completed */}
            <div className="flex gap-2 flex-shrink-0" style={{ width: '100%', scrollSnapAlign: 'start' }}>
              {/* Scheduled - Light Peach */}
              <div className="flex flex-col p-2.5 rounded-xl bg-orange-50/30 border border-orange-200/40 shadow-sm flex-shrink-0" style={{ width: 'calc((100% - 1rem) / 3)' }}>
                <p className="text-[10px] font-medium text-orange-700 mb-1 leading-tight text-left">Scheduled</p>
                <p className="text-lg font-bold text-orange-700 leading-tight text-left">{summary.scheduled}</p>
              </div>
              
              {/* In Progress - Light Yellow */}
              <div className="flex flex-col p-2.5 rounded-xl bg-yellow-50/30 border border-yellow-200/40 shadow-sm flex-shrink-0" style={{ width: 'calc((100% - 1rem) / 3)' }}>
                <p className="text-[10px] font-medium text-yellow-700 mb-1 leading-tight text-left">In Progress</p>
                <p className="text-lg font-bold text-yellow-700 leading-tight text-left">{summary.inProgress}</p>
              </div>
              
              {/* Completed - Light Green */}
              <div className="flex flex-col p-2.5 rounded-xl bg-green-50/30 border border-green-200/40 shadow-sm flex-shrink-0" style={{ width: 'calc((100% - 1rem) / 3)' }}>
                <p className="text-[10px] font-medium text-green-700 mb-1 leading-tight text-left">Completed</p>
                <p className="text-lg font-bold text-green-700 leading-tight text-left">{summary.completed}</p>
              </div>
            </div>
            
            {/* Group 2: Cancelled, Feedback Received */}
            <div className="flex gap-2 flex-shrink-0" style={{ width: '100%', scrollSnapAlign: 'start' }}>
              {/* Cancelled - Light Red */}
              <div className="flex flex-col p-2.5 rounded-xl bg-red-50/30 border border-red-200/40 shadow-sm flex-shrink-0" style={{ width: 'calc((100% - 1rem) / 3)' }}>
                <p className="text-[10px] font-medium text-red-700 mb-1 leading-tight text-left">Cancelled</p>
                <p className="text-lg font-bold text-red-700 leading-tight text-left">{summary.cancelled}</p>
              </div>
              
              {/* Feedback Received - Light Teal */}
              <div className="flex flex-col p-2.5 rounded-xl bg-teal-50/30 border border-teal-200/40 shadow-sm flex-shrink-0" style={{ width: 'calc((100% - 1rem) / 3)' }}>
                <p className="text-[10px] font-medium text-teal-700 mb-1 leading-tight text-left">Feedback</p>
                <p className="text-lg font-bold text-teal-700 leading-tight text-left">{summary.feedbackReceived}</p>
              </div>
            </div>
          </div>
          
          {/* Right Arrow */}
          <button
            onClick={handleNextGroup}
            disabled={metricsGroupIndex === totalGroups - 1}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center transition-all ${
              metricsGroupIndex === totalGroups - 1
                ? 'opacity-40 cursor-not-allowed'
                : 'opacity-100 hover:bg-gray-50 active:scale-95'
            }`}
            aria-label="Next metrics"
          >
            <ChevronRight className="h-4 w-4 text-gray-700" />
          </button>
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
                    onReassignEmployee={() => handleReassignEmployee(job.id)}
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

      {/* Reassign Employee Modal */}
      {selectedJobForReassign && (
        <ReassignEmployeeModal
          isOpen={showReassignEmployeeModal}
          onClose={() => {
            setShowReassignEmployeeModal(false);
            setSelectedJobForReassign(null);
          }}
          currentEmployeeId={mockEmployees.find(emp => emp.name === selectedJobForReassign.technicianName)?.id}
          estimateId={selectedJobForReassign.id}
          onSave={handleReassignSave}
        />
      )}

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
