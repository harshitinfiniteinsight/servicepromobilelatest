import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import JobCard from "@/components/cards/JobCard";
import EmptyState from "@/components/cards/EmptyState";
import { mockJobs, mockCustomers, mockEmployees, mockEstimates, mockInvoices, mockAgreements } from "@/data/mobileMockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Briefcase, Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Filter, Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import SendFeedbackFormModal from "@/components/modals/SendFeedbackFormModal";
import ViewFeedbackModal from "@/components/modals/ViewFeedbackModal";
import FeedbackFormModal from "@/components/modals/FeedbackFormModal";
import PreviewEstimateModal from "@/components/modals/PreviewEstimateModal";
import PreviewInvoiceModal from "@/components/modals/PreviewInvoiceModal";
import PreviewAgreementModal from "@/components/modals/PreviewAgreementModal";
import DateRangePickerModal from "@/components/modals/DateRangePickerModal";
import AddServicePicturesModal from "@/components/modals/AddServicePicturesModal";
import ViewServicePicturesModal from "@/components/modals/ViewServicePicturesModal";
import CannotEditModal from "@/components/modals/CannotEditModal";
import RescheduleJobModal from "@/components/modals/RescheduleJobModal";
import JobPaymentModal from "@/components/modals/JobPaymentModal";
import AssociateDocumentsModal from "@/components/modals/AssociateDocumentsModal";

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

// Track job pictures - now stores arrays of images for multi-photo support
type JobPictures = {
  [jobId: string]: {
    beforeImages: string[];
    afterImages: string[];
  };
};

// Maximum number of images allowed per section
const MAX_IMAGES_PER_SECTION = 10;

const Jobs = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

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

  // State to trigger job list refresh when new jobs are created
  const [jobListRefreshTrigger, setJobListRefreshTrigger] = useState(0);

  // Transform invoices, estimates, and agreements into job format
  const transformDocumentsToJobs = useMemo(() => {
    // Helper to assign technician based on customer or random assignment
    const assignTechnician = (customerId: string, index: number) => {
      const technicians = ["Mike Johnson", "Tom Wilson", "Chris Davis", "Sarah Martinez"];
      // Use customer ID to consistently assign same technician to same customer
      const techIndex = (parseInt(customerId) + index) % technicians.length;
      return technicians[techIndex];
    };

    // Helper to get customer address
    const getCustomerAddress = (customerId: string): string => {
      const customer = mockCustomers.find(c => c.id === customerId);
      return customer?.address || "";
    };

    // Load jobs from localStorage (jobs created manually via "Convert to Job" action)
    // Only show manually converted jobs, not auto-generated ones
    const storedJobs: typeof mockJobs = (() => {
      try {
        const stored = localStorage.getItem("mockJobs");
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.warn("Failed to load jobs from localStorage:", error);
        return [];
      }
    })();

    // Only show manually converted jobs (storedJobs) and mockJobs
    // Do NOT auto-transform invoices, estimates, or agreements into jobs
    const allJobs = [...storedJobs, ...mockJobs];

    // Remove duplicates based on job ID (prioritize stored jobs)
    const uniqueJobs = Array.from(
      new Map(allJobs.map(job => [job.id, job])).values()
    );

    // Sort jobs by createdAt in descending order (newest first)
    // Jobs without createdAt are sorted by ID (which contains timestamp for JOB-* format)
    const sortedJobs = uniqueJobs.sort((a, b) => {
      const aCreatedAt = (a as any).createdAt;
      const bCreatedAt = (b as any).createdAt;
      
      // If both have createdAt, compare them
      if (aCreatedAt && bCreatedAt) {
        return new Date(bCreatedAt).getTime() - new Date(aCreatedAt).getTime();
      }
      
      // Jobs with createdAt come first (they are newly created)
      if (aCreatedAt && !bCreatedAt) return -1;
      if (!aCreatedAt && bCreatedAt) return 1;
      
      // For jobs without createdAt, sort by ID (JOB-timestamp format means newer IDs are larger)
      const aTimestamp = a.id.match(/JOB-(\d+)/)?.[1];
      const bTimestamp = b.id.match(/JOB-(\d+)/)?.[1];
      if (aTimestamp && bTimestamp) {
        return parseInt(bTimestamp) - parseInt(aTimestamp);
      }
      
      // Fallback: sort by date descending
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // For employees, filter to only their assigned jobs
    if (isEmployee && currentEmployeeName) {
      return sortedJobs.filter(job => job.technicianName === currentEmployeeName);
    }

    return sortedJobs;
  }, [isEmployee, currentEmployeeName, jobListRefreshTrigger]);

  // Manage job statuses (initialize from combined jobs, but allow updates)
  const [jobs, setJobs] = useState(transformDocumentsToJobs);

  // Update jobs when transformDocumentsToJobs changes (e.g., when employee changes)
  useEffect(() => {
    setJobs(transformDocumentsToJobs);
  }, [transformDocumentsToJobs]);

  // Listen for jobCreated event (when a job is created from notification)
  useEffect(() => {
    const handleJobCreated = () => {
      // Trigger refresh by updating the trigger state
      // This will cause transformDocumentsToJobs to recalculate
      setJobListRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener("jobCreated", handleJobCreated);
    return () => {
      window.removeEventListener("jobCreated", handleJobCreated);
    };
  }, []);

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

  // Picture modals state
  const [showAddPicturesModal, setShowAddPicturesModal] = useState(false);
  const [showViewPicturesModal, setShowViewPicturesModal] = useState(false);
  const [selectedJobForPictures, setSelectedJobForPictures] = useState<typeof mockJobs[0] | null>(null);

  // Cannot Edit modal state
  const [showCannotEditModal, setShowCannotEditModal] = useState(false);
  const [selectedJobForCannotEdit, setSelectedJobForCannotEdit] = useState<{
    id: string;
    jobType: "Estimate" | "Invoice" | "Agreement";
  } | null>(null);

  // Track job pictures - load from localStorage
  const [jobPictures, setJobPictures] = useState<JobPictures>(() => {
    try {
      const stored = localStorage.getItem("jobPictures");
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn("Failed to load pictures from localStorage:", error);
      return {};
    }
  });

  // Save job pictures to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("jobPictures", JSON.stringify(jobPictures));
    } catch (error) {
      console.warn("Failed to save pictures to localStorage:", error);
    }
  }, [jobPictures]);

  // Preview modals state
  const [showEstimatePreview, setShowEstimatePreview] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [showAgreementPreview, setShowAgreementPreview] = useState(false);
  const [previewEstimate, setPreviewEstimate] = useState<any>(null);
  const [previewInvoice, setPreviewInvoice] = useState<any>(null);
  const [previewAgreement, setPreviewAgreement] = useState<any>(null);

  // Reschedule job modal state
  // Note: Employee reassignment is now handled within this modal
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedJobForReschedule, setSelectedJobForReschedule] = useState<typeof jobs[0] | null>(null);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedJobForPayment, setSelectedJobForPayment] = useState<typeof jobs[0] | null>(null);

  // Associate Documents modal state
  const [showAssociateDocumentsModal, setShowAssociateDocumentsModal] = useState(false);
  const [selectedJobForAssociation, setSelectedJobForAssociation] = useState<typeof jobs[0] | null>(null);
  const [associateDocumentsInitialTab, setAssociateDocumentsInitialTab] = useState<"invoice" | "estimate" | "agreement" | undefined>(undefined);

  // Metrics carousel state
  const [metricsGroupIndex, setMetricsGroupIndex] = useState(0);
  const metricsCarouselRef = useRef<HTMLDivElement>(null);

  // Total groups: Group 1 (Scheduled, In Progress, Completed), Group 2 (Cancel, Feedback Received)
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
      } else if (statusFilter === "cancel") {
        matchesStatus = job.status === "Cancel";
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
          paymentStatus = (estimate.status === "Converted to Invoice" || estimate.status === "Paid") ? "Paid" : "Open";
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

  // Get active filters summary for collapsed view
  const getActiveFiltersSummary = () => {
    const activeFilters: string[] = [];

    if (dateRange.from || dateRange.to) {
      if (dateRange.from && dateRange.to) {
        activeFilters.push(`${format(dateRange.from, "MM/dd")} - ${format(dateRange.to, "MM/dd")}`);
      } else if (dateRange.from) {
        activeFilters.push(`From ${format(dateRange.from, "MM/dd")}`);
      }
    }

    if (!isEmployee && employeeFilter !== "all") {
      activeFilters.push(employeeFilter);
    }

    if (jobTypeFilter !== "all") {
      activeFilters.push(jobTypeFilter.charAt(0).toUpperCase() + jobTypeFilter.slice(1));
    }

    if (statusFilter !== "all") {
      const statusLabel = statusFilter === "inprogress"
        ? "In Progress"
        : statusFilter === "feedbackreceived"
          ? "Feedback Received"
          : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
      activeFilters.push(statusLabel);
    }

    if (paymentStatusFilter !== "all") {
      activeFilters.push(paymentStatusFilter.charAt(0).toUpperCase() + paymentStatusFilter.slice(1));
    }

    return activeFilters.length > 0 ? activeFilters.join(", ") : "No filters";
  };

  const summary = useMemo(() => ({
    total: filteredJobs.length,
    scheduled: filteredJobs.filter(j => j.status === "Scheduled").length,
    inProgress: filteredJobs.filter(j => j.status === "In Progress").length,
    completed: filteredJobs.filter(j => j.status === "Completed").length,
    cancelled: filteredJobs.filter(j => j.status === "Cancel").length,
    feedbackReceived: filteredJobs.filter(j => j.status === "Feedback Received").length,
  }), [filteredJobs]);

  // Handle status change
  // Auto-send feedback form email (without showing modal)
  const autoSendFeedbackFormEmail = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const customer = mockCustomers.find(c => c.id === job.customerId);
    const customerEmail = customer?.email || "";

    if (!customerEmail) {
      console.warn(`No email found for customer ${job.customerName}`);
      return;
    }

    // In production, this would be an API call to send the email
    // For now, simulate async email sending
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mark feedback form as sent
    setJobFeedbackStatus(prev => ({
      ...prev,
      [jobId]: { exists: false } // Form sent, but feedback not yet received
    }));

    toast.success(`Feedback form sent automatically to ${customerEmail}`);
  };

  const handleStatusChange = (jobId: string, newStatus: string) => {
    const oldJob = jobs.find(j => j.id === jobId);
    const oldStatus = oldJob?.status;

    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );

    // Check if status changed to Cancel - deactivate the underlying document
    if (newStatus === "Cancel" && oldStatus !== "Cancel") {
      const jobIdUpper = jobId.toUpperCase();

      // Deactivate invoice
      if (jobIdUpper.startsWith("INV")) {
        const invoice = mockInvoices.find(inv => inv.id === jobId);
        if (invoice) {
          // In production, this would be an API call to deactivate
          // For now, we'll track deactivation in localStorage
          const deactivatedInvoices = JSON.parse(localStorage.getItem("deactivatedInvoices") || "[]");
          if (!deactivatedInvoices.includes(jobId)) {
            deactivatedInvoices.push(jobId);
            localStorage.setItem("deactivatedInvoices", JSON.stringify(deactivatedInvoices));
          }
          toast.success(`Invoice ${jobId} has been cancelled and deactivated`);
        }
      }
      // Deactivate estimate
      else if (jobIdUpper.startsWith("EST")) {
        const estimate = mockEstimates.find(est => est.id === jobId);
        if (estimate) {
          const deactivatedEstimates = JSON.parse(localStorage.getItem("deactivatedEstimates") || "[]");
          if (!deactivatedEstimates.includes(jobId)) {
            deactivatedEstimates.push(jobId);
            localStorage.setItem("deactivatedEstimates", JSON.stringify(deactivatedEstimates));
          }
          toast.success(`Estimate ${jobId} has been cancelled and deactivated`);
        }
      }
      // Deactivate agreement
      else if (jobIdUpper.startsWith("AGR") || jobIdUpper.includes("AGR")) {
        const agreement = mockAgreements.find(agr => agr.id === jobId);
        if (agreement) {
          const deactivatedAgreements = JSON.parse(localStorage.getItem("deactivatedAgreements") || "[]");
          if (!deactivatedAgreements.includes(jobId)) {
            deactivatedAgreements.push(jobId);
            localStorage.setItem("deactivatedAgreements", JSON.stringify(deactivatedAgreements));
          }
          toast.success(`Agreement ${jobId} has been cancelled and deactivated`);
        }
      }
    }

    // Check if status changed from Cancel to something else - reactivate the document
    if (oldStatus === "Cancel" && newStatus !== "Cancel" && !isEmployee) {
      const jobIdUpper = jobId.toUpperCase();

      // Reactivate invoice
      if (jobIdUpper.startsWith("INV")) {
        const deactivatedInvoices = JSON.parse(localStorage.getItem("deactivatedInvoices") || "[]");
        const updated = deactivatedInvoices.filter((id: string) => id !== jobId);
        localStorage.setItem("deactivatedInvoices", JSON.stringify(updated));
        toast.success(`Invoice ${jobId} has been reactivated`);
      }
      // Reactivate estimate
      else if (jobIdUpper.startsWith("EST")) {
        const deactivatedEstimates = JSON.parse(localStorage.getItem("deactivatedEstimates") || "[]");
        const updated = deactivatedEstimates.filter((id: string) => id !== jobId);
        localStorage.setItem("deactivatedEstimates", JSON.stringify(updated));
        toast.success(`Estimate ${jobId} has been reactivated`);
      }
      // Reactivate agreement
      else if (jobIdUpper.startsWith("AGR") || jobIdUpper.includes("AGR")) {
        const deactivatedAgreements = JSON.parse(localStorage.getItem("deactivatedAgreements") || "[]");
        const updated = deactivatedAgreements.filter((id: string) => id !== jobId);
        localStorage.setItem("deactivatedAgreements", JSON.stringify(updated));
        toast.success(`Agreement ${jobId} has been reactivated`);
      }
    }

    // Check if status changed to Completed
    if (newStatus === "Completed" && oldStatus !== "Completed") {
      const feedbackAutoSendEnabled = typeof window !== "undefined"
        ? localStorage.getItem("autoSendFeedback") === "true"
        : false;

      if (oldJob && !hasFeedback(jobId)) {
        if (feedbackAutoSendEnabled) {
          // Auto-send email without showing modal (async, non-blocking)
          autoSendFeedbackFormEmail(jobId).catch(err => {
            console.error("Failed to auto-send feedback form:", err);
            toast.error("Failed to send feedback form automatically");
          });
        } else {
          // Show modal with delivery options
          setTimeout(() => {
            handleSendFeedbackForm(jobId);
          }, 100);
        }
      }
    }

    toast.success(`Job status updated to ${newStatus}`);
  };

  // Handle feedback form send (shows modal)
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

  // Check if job has any pictures
  const hasPictures = (jobId: string): boolean => {
    const pictures = jobPictures[jobId];
    // Check for either new array format or legacy single image format
    if (!pictures) return false;
    const hasBeforeImages = pictures.beforeImages && pictures.beforeImages.length > 0;
    const hasAfterImages = pictures.afterImages && pictures.afterImages.length > 0;
    return hasBeforeImages || hasAfterImages;
  };

  // Handle add pictures
  const handleAddPictures = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJobForPictures(job);
      setShowAddPicturesModal(true);
    }
  };

  // Handle view pictures
  const handleViewPictures = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJobForPictures(job);
      setShowViewPicturesModal(true);
    }
  };

  // Handle save pictures - now accepts arrays of images
  const handleSavePictures = (jobId: string, beforeImages: string[], afterImages: string[]) => {
    setJobPictures(prev => ({
      ...prev,
      [jobId]: {
        beforeImages,
        afterImages,
      },
    }));
  };

  // Handle delete picture - removes a specific image by index, or all images if index is -1
  const handleDeletePicture = (jobId: string, type: "before" | "after", index?: number) => {
    setJobPictures(prev => {
      const current = prev[jobId] || { beforeImages: [], afterImages: [] };
      const key = type === "before" ? "beforeImages" : "afterImages";
      const images = current[key] || [];
      
      // If index is provided, remove specific image; otherwise clear all
      const newImages = index !== undefined && index >= 0
        ? images.filter((_, i) => i !== index)
        : [];
      
      return {
        ...prev,
        [jobId]: {
          ...current,
          [key]: newImages,
        },
      };
    });
  };

  // Handle adding multiple images to a section - appends to existing images
  const handleAddImages = (jobId: string, type: "before" | "after", newImages: string[]) => {
    setJobPictures(prev => {
      const current = prev[jobId] || { beforeImages: [], afterImages: [] };
      const key = type === "before" ? "beforeImages" : "afterImages";
      const existingImages = current[key] || [];
      
      // Enforce max limit
      const availableSlots = MAX_IMAGES_PER_SECTION - existingImages.length;
      const imagesToAdd = newImages.slice(0, availableSlots);
      
      return {
        ...prev,
        [jobId]: {
          ...current,
          [key]: [...existingImages, ...imagesToAdd],
        },
      };
    });
  };

  // Handle edit job - conditional navigation based on job type and payment status
  const handleEditJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    // Determine job type
    const getJobType = (): "Estimate" | "Invoice" | "Agreement" | null => {
      const id = job.id.toUpperCase();
      if (id.startsWith("AG") || id.includes("AGR")) return "Agreement";
      if (id.startsWith("EST")) return "Estimate";
      if (id.startsWith("INV")) return "Invoice";
      // For generic JOB-XXX IDs, assign types in a pattern
      if (id.startsWith("JOB")) {
        const jobNum = parseInt(id.replace(/[^0-9]/g, "")) || 0;
        const typeIndex = jobNum % 3;
        if (typeIndex === 0) return "Invoice";
        if (typeIndex === 1) return "Estimate";
        return "Agreement";
      }
      return null;
    };

    // Determine payment status
    const getPaymentStatus = (): "Paid" | "Open" => {
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
          return (estimate.status === "Converted to Invoice" || estimate.status === "Paid") ? "Paid" : "Open";
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

    const jobType = getJobType();
    const paymentStatus = getPaymentStatus();

    // If paid, show cannot edit modal
    if (paymentStatus === "Paid" && jobType) {
      setSelectedJobForCannotEdit({
        id: jobId,
        jobType: jobType,
      });
      setShowCannotEditModal(true);
      return;
    }

    // If open, navigate to correct edit screen based on job type
    if (jobType === "Estimate") {
      navigate(`/estimates/${jobId}/edit`);
    } else if (jobType === "Invoice") {
      navigate(`/invoices/${jobId}/edit`);
    } else if (jobType === "Agreement") {
      navigate(`/agreements/${jobId}/edit`);
    } else {
      // Fallback to generic job edit if type cannot be determined
      navigate(`/jobs/${jobId}/edit`);
    }
  };

  // Handle create new from Cannot Edit modal
  const handleCreateNewFromCannotEdit = () => {
    if (!selectedJobForCannotEdit) return;

    const { jobType } = selectedJobForCannotEdit;

    if (jobType === "Estimate") {
      navigate("/estimates/new");
    } else if (jobType === "Invoice") {
      navigate("/invoices/new");
    } else if (jobType === "Agreement") {
      navigate("/agreements/new");
    }
    setShowCannotEditModal(false);
    setSelectedJobForCannotEdit(null);
  };

  // Handle reschedule job
  const handleRescheduleJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJobForReschedule(job);
      setShowRescheduleModal(true);
    }
  };

  /**
   * Handle reschedule confirmation
   * PROTOTYPE: Updates job locally without backend call
   * TODO for production:
   * - Add real API call to update job schedule
   * - Add validation for employee availability
   * - Add notification to affected parties
   */
  const handleRescheduleConfirm = (newDate: string, newTime: string, newEmployeeId: string, updatedAddress?: string) => {
    if (!selectedJobForReschedule) return;

    const newEmployee = mockEmployees.find(emp => emp.id === newEmployeeId);
    
    // Update the job with new schedule, employee, and optionally address
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === selectedJobForReschedule.id
          ? {
              ...job,
              date: newDate,
              time: newTime,
              technicianId: newEmployeeId,
              technicianName: newEmployee?.name || job.technicianName,
              ...(updatedAddress && { jobAddress: updatedAddress }),
            }
          : job
      )
    );

    // PROTOTYPE: Also update localStorage if job exists there
    try {
      const storedJobs = JSON.parse(localStorage.getItem("mockJobs") || "[]");
      const updatedStoredJobs = storedJobs.map((job: any) =>
        job.id === selectedJobForReschedule.id
          ? {
              ...job,
              date: newDate,
              time: newTime,
              technicianId: newEmployeeId,
              technicianName: newEmployee?.name || job.technicianName,
              ...(updatedAddress && { jobAddress: updatedAddress }),
            }
          : job
      );
      localStorage.setItem("mockJobs", JSON.stringify(updatedStoredJobs));
    } catch (e) {
      console.warn("Could not update localStorage jobs");
    }

    toast.success("Job rescheduled successfully");
    setShowRescheduleModal(false);
    setSelectedJobForReschedule(null);
  };

  // Financial action handlers for jobs
  const handleCreateInvoice = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      navigate(`/invoices/new?jobId=${jobId}&customerId=${job.customerId}`);
      toast.success("Creating new invoice...");
    }
  };

  const handleViewJobInvoice = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    const sourceId = (job as any)?.sourceId;
    if (sourceId) {
      const invoice = mockInvoices.find(inv => inv.id === sourceId);
      if (invoice) {
        setPreviewInvoice(invoice);
        setShowInvoicePreview(true);
      } else {
        toast.error("Invoice not found");
      }
    }
  };

  const handleCreateEstimate = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      navigate(`/estimates/new?jobId=${jobId}&customerId=${job.customerId}`);
      toast.success("Creating new estimate...");
    }
  };

  const handleViewJobEstimate = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    const sourceId = (job as any)?.sourceId;
    if (sourceId) {
      const estimate = mockEstimates.find(est => est.id === sourceId);
      if (estimate) {
        setPreviewEstimate(estimate);
        setShowEstimatePreview(true);
      } else {
        toast.error("Estimate not found");
      }
    }
  };

  const handleViewJobAgreement = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    const sourceId = (job as any)?.sourceId;
    if (sourceId) {
      const agreement = mockAgreements.find(agr => agr.id === sourceId);
      if (agreement) {
        setPreviewAgreement(agreement);
        setShowAgreementPreview(true);
      } else {
        toast.error("Agreement not found");
      }
    }
  };

  const handlePayJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJobForPayment(job);
      setShowPaymentModal(true);
    }
  };

  // Handle payment completion - update job list state
  const handlePaymentComplete = (jobId: string, transactionId: string) => {
    // Update local state to reflect payment
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId 
          ? { ...job, paymentStatus: "paid" as const }
          : job
      )
    );
    
    // Trigger refresh to ensure consistency
    setJobListRefreshTrigger(prev => prev + 1);
    
    // Close the modal
    setShowPaymentModal(false);
    setSelectedJobForPayment(null);
  };

  // Handle Associate Document action - opens modal to associate existing documents to job
  const handleAssociateDocument = (jobId: string, sourceType?: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJobForAssociation(job);
      // Set initial tab based on job source type
      if (sourceType === "invoice") {
        setAssociateDocumentsInitialTab("invoice");
      } else if (sourceType === "estimate") {
        setAssociateDocumentsInitialTab("estimate");
      } else if (sourceType === "agreement") {
        setAssociateDocumentsInitialTab("agreement");
      } else {
        setAssociateDocumentsInitialTab(undefined);
      }
      setShowAssociateDocumentsModal(true);
    }
  };

  // Handle successful document association
  const handleDocumentAssociated = () => {
    // Trigger refresh to show updated associations
    setJobListRefreshTrigger(prev => prev + 1);
  };

  // Edit handlers - for unpaid jobs to modify existing associated documents
  const handleEditInvoice = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    const sourceId = (job as any)?.sourceId;
    if (sourceId) {
      navigate(`/invoices/edit/${sourceId}`);
      toast.success("Editing invoice...");
    } else {
      toast.error("No invoice to edit");
    }
  };

  const handleEditEstimate = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    const sourceId = (job as any)?.sourceId;
    if (sourceId) {
      navigate(`/estimates/edit/${sourceId}`);
      toast.success("Editing estimate...");
    } else {
      toast.error("No estimate to edit");
    }
  };

  const handleEditAgreement = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    const sourceId = (job as any)?.sourceId;
    if (sourceId) {
      navigate(`/agreements/edit/${sourceId}`);
      toast.success("Editing agreement...");
    } else {
      toast.error("No agreement to edit");
    }
  };

  // Associate New handlers - for paid jobs to create additional documents
  const handleAssociateNewInvoice = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      navigate(`/invoices/new?jobId=${jobId}&customerId=${job.customerId}&associateNew=true`);
      toast.success("Creating new associated invoice...");
    }
  };

  const handleAssociateNewEstimate = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      navigate(`/estimates/new?jobId=${jobId}&customerId=${job.customerId}&associateNew=true`);
      toast.success("Creating new associated estimate...");
    }
  };

  const handleAssociateNewAgreement = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      navigate(`/agreements/new?jobId=${jobId}&customerId=${job.customerId}&associateNew=true`);
      toast.success("Creating new associated agreement...");
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <MobileHeader
        title="Jobs"
      />

      {/* Search & Filter Header - Fixed with scrolling content */}
      <div className="px-4 pt-3 pb-2 bg-background border-b z-10 shadow-sm">
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
          <Input
            placeholder="Search jobs, customers..."
            className="w-full h-14 pl-12 pr-4 text-base bg-white border-2 border-gray-400 rounded-xl shadow-md focus:border-primary focus:ring-2 focus:ring-primary/30 focus:shadow-lg transition-all placeholder:text-gray-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Toggle & Active Summary */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 text-xs font-medium gap-1.5 ${filtersExpanded ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 py-0 text-[10px] rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                {[
                  dateRange.from || dateRange.to,
                  jobTypeFilter !== "all",
                  !isEmployee && employeeFilter !== "all",
                  statusFilter !== "all",
                  paymentStatusFilter !== "all"
                ].filter(Boolean).length}
              </Badge>
            )}
            {filtersExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>

          {/* Clear filters button (only show when filters active) */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={clearFilters}
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Summary of active filters (only show when filters collapsed and active) */}
        {!filtersExpanded && hasActiveFilters && (
          <div className="text-xs text-muted-foreground truncate px-1">
            <span className="font-medium text-foreground">Active:</span> {getActiveFiltersSummary()}
          </div>
        )}

        {/* Expanded Filters Section */}
        {filtersExpanded && (
          <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
                onClick={() => setShowDateRangePicker(true)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>

              <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="agreement">Agreement</SelectItem>
                  <SelectItem value="estimate">Estimate</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="inprogress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="feedbackreceived">Feedback Received</SelectItem>
                  <SelectItem value="cancel">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Payment</SelectItem>
                  <SelectItem value="open">Open / Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isEmployee && (
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {availableEmployees.map(emp => (
                    <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollable bg-gray-50/50" style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top) + 0.5rem)' }}>
        {/* Metrics Section - Scrollable Carousel */}
        <div className="relative border-b bg-background shadow-sm mb-1">
          {/* Navigation Arrows - Absolute Positioned */}
          {metricsGroupIndex > 0 && (
            <button
              onClick={handlePreviousGroup}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-background/80 shadow-md flex items-center justify-center border text-muted-foreground hover:text-primary transition-colors"
              aria-label="Previous metrics"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {metricsGroupIndex < totalGroups - 1 && (
            <button
              onClick={handleNextGroup}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-background/80 shadow-md flex items-center justify-center border text-muted-foreground hover:text-primary transition-colors"
              aria-label="Next metrics"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {/* Horizontal Scroll Container (Hidden Scrollbar) */}
          <div
            ref={metricsCarouselRef}
            className="flex overflow-x-hidden snap-x snap-mandatory scroll-smooth"
          >
            {/* Group 1: Scheduled, In Progress, Completed */}
            <div className="min-w-full flex justify-around py-3 px-2 snap-center">
              <div className="text-center w-1/3">
                <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 animate-in zoom-in duration-500">
                  {summary.scheduled}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-1">Scheduled</p>
              </div>
              <div className="w-px bg-border h-10 self-center" />
              <div className="text-center w-1/3">
                <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 animate-in zoom-in duration-500 delay-75">
                  {summary.inProgress}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-1">In Progress</p>
              </div>
              <div className="w-px bg-border h-10 self-center" />
              <div className="text-center w-1/3">
                <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 animate-in zoom-in duration-500 delay-150">
                  {summary.completed}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-1">Completed</p>
              </div>
            </div>

            {/* Group 2: Cancelled, Feedback Received */}
            <div className="min-w-full flex justify-around py-3 px-2 snap-center">
              <div className="text-center w-1/2">
                <p className="text-2xl font-bold text-destructive animate-in zoom-in duration-500">
                  {summary.cancelled}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-1">Cancelled</p>
              </div>
              <div className="w-px bg-border h-10 self-center" />
              <div className="text-center w-1/2">
                <p className="text-2xl font-bold text-yellow-500 animate-in zoom-in duration-500 delay-75">
                  {summary.feedbackReceived}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-1">Feedback Received</p>
              </div>
            </div>
          </div>

          {/* Pagination Indicators */}
          <div className="flex justify-center gap-1.5 pb-1.5">
            {[...Array(totalGroups)].map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === metricsGroupIndex ? 'w-4 bg-primary' : 'w-1.5 bg-muted'}`}
              />
            ))}
          </div>
        </div>

        <div className="px-3 pb-20 space-y-2.5">
          {filteredJobs.length === 0 ? (
            <EmptyState
              title="No jobs found"
              description={
                search || hasActiveFilters
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first job"
              }
              actionLabel={search || hasActiveFilters ? "Clear Filters" : "Create Job"}
              onAction={search || hasActiveFilters ? clearFilters : () => navigate("/jobs/new")}
            />
          ) : (
            filteredJobs.map((job, index) => (
              <JobCard
                key={job.id}
                job={{
                  ...job,
                  title: (job.id.startsWith("AG") || job.id.includes("AGR")) ? job.id : job.title,
                  status: job.status as any,
                  sourceType: (job as any).sourceType,
                  sourceId: (job as any).sourceId,
                  paymentStatus: (job as any).paymentStatus,
                }}
                onStatusChange={handleStatusChange}
                index={index}
                showAnimation={true}
                userRole={userRole as "merchant" | "employee"}
                onSendFeedback={() => handleSendFeedbackForm(job.id)}
                onFillFeedback={() => handleFillFeedbackForm(job.id)}
                onViewFeedback={() => handleViewFeedback(job.id)}
                hasFeedback={hasFeedback(job.id)}
                hasPictures={hasPictures(job.id)}
                onAddPictures={() => handleAddPictures(job.id)}
                onViewPictures={() => handleViewPictures(job.id)}
                previewEstimate={() => handlePreview(job.id, "Estimate")}
                previewInvoice={() => handlePreview(job.id, "Invoice")}
                previewAgreement={() => handlePreview(job.id, "Agreement")}
                onEdit={() => handleEditJob(job.id)}
                onReschedule={() => handleRescheduleJob(job.id)}
                // Financial action handlers
                onCreateInvoice={() => handleCreateInvoice(job.id)}
                onViewInvoice={() => handleViewJobInvoice(job.id)}
                onCreateEstimate={() => handleCreateEstimate(job.id)}
                onViewEstimate={() => handleViewJobEstimate(job.id)}
                onViewAgreement={() => handleViewJobAgreement(job.id)}
                onPay={() => handlePayJob(job.id)}
                // Edit handlers (for unpaid jobs)
                onEditInvoice={() => handleEditInvoice(job.id)}
                onEditEstimate={() => handleEditEstimate(job.id)}
                onEditAgreement={() => handleEditAgreement(job.id)}
                // Associate New handlers (for paid jobs)
                onAssociateNewInvoice={() => handleAssociateNewInvoice(job.id)}
                onAssociateNewEstimate={() => handleAssociateNewEstimate(job.id)}
                onAssociateNewAgreement={() => handleAssociateNewAgreement(job.id)}
                // Associate existing documents to job
                onAssociateDocument={(sourceType) => handleAssociateDocument(job.id, sourceType)}
              />
            ))
          )}
        </div>
      </div>

      {/* Date Range Picker Modal */}
      <DateRangePickerModal
        isOpen={showDateRangePicker}
        onClose={() => setShowDateRangePicker(false)}
        dateRange={dateRange}
        onConfirm={handleDateRangeConfirm}
      />

      {/* Send Feedback Form Modal */}
      {selectedJobForFeedback && (
        <SendFeedbackFormModal
          isOpen={showFeedbackFormModal}
          onClose={() => {
            setShowFeedbackFormModal(false);
            setSelectedJobForFeedback(null);
          }}
          job={{
            id: selectedJobForFeedback.id,
            title: selectedJobForFeedback.title,
            customerName: selectedJobForFeedback.customerName,
            technicianName: selectedJobForFeedback.technicianName,
          }}
          customerEmail={mockCustomers.find(c => c.id === selectedJobForFeedback.customerId)?.email || ""}
          onSend={() => handleFeedbackFormSent(selectedJobForFeedback.id)}
          onFillForm={() => handleFillFeedbackForm(selectedJobForFeedback.id)}
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
          job={{
            id: selectedJobForFeedback.id,
            title: selectedJobForFeedback.title,
            customerName: selectedJobForFeedback.customerName,
            technicianName: selectedJobForFeedback.technicianName,
          }}
          onSubmit={handleFeedbackSubmit}
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
          job={{
            id: selectedJobForFeedback.id,
            title: selectedJobForFeedback.title,
            customerName: selectedJobForFeedback.customerName,
            technicianName: selectedJobForFeedback.technicianName,
          }}
          feedback={jobFeedbackStatus[selectedJobForFeedback.id]?.feedback}
        />
      )}

      {/* Add Pictures Modal */}
      <AddServicePicturesModal
        open={showAddPicturesModal && selectedJobForPictures !== null}
        onOpenChange={(open) => {
          setShowAddPicturesModal(open);
          if (!open) {
            setSelectedJobForPictures(null);
          }
        }}
        jobId={selectedJobForPictures?.id || ""}
        jobStatus={selectedJobForPictures?.status || ""}
        beforeImages={selectedJobForPictures ? (jobPictures[selectedJobForPictures.id]?.beforeImages || []) : []}
        afterImages={selectedJobForPictures ? (jobPictures[selectedJobForPictures.id]?.afterImages || []) : []}
        onSave={handleSavePictures}
      />

      {/* View Pictures Modal */}
      <ViewServicePicturesModal
        open={showViewPicturesModal && selectedJobForPictures !== null}
        onOpenChange={(open) => {
          setShowViewPicturesModal(open);
          if (!open) {
            setSelectedJobForPictures(null);
          }
        }}
        jobId={selectedJobForPictures?.id || ""}
        beforeImages={selectedJobForPictures ? (jobPictures[selectedJobForPictures.id]?.beforeImages || []) : []}
        afterImages={selectedJobForPictures ? (jobPictures[selectedJobForPictures.id]?.afterImages || []) : []}
        onDelete={handleDeletePicture}
        onAddImages={handleAddImages}
      />

      {/* Cannot Edit Modal */}
      <CannotEditModal
        isOpen={showCannotEditModal}
        onClose={() => {
          setShowCannotEditModal(false);
          setSelectedJobForCannotEdit(null);
        }}
        jobId={selectedJobForCannotEdit?.id || ""}
        jobType={selectedJobForCannotEdit?.jobType || "Invoice"}
      />

      {/* Preview Modals */}
      {previewEstimate && (
        <PreviewEstimateModal
          open={showEstimatePreview}
          onOpenChange={setShowEstimatePreview}
          data={previewEstimate}
        />
      )}

      {previewInvoice && (
        <PreviewInvoiceModal
          open={showInvoicePreview}
          onOpenChange={setShowInvoicePreview}
          data={previewInvoice}
        />
      )}

      {previewAgreement && (
        <PreviewAgreementModal
          open={showAgreementPreview}
          onOpenChange={setShowAgreementPreview}
          data={previewAgreement}
        />
      )}

      {/* Reschedule Job Modal - also handles employee reassignment */}
      {selectedJobForReschedule && (
        <RescheduleJobModal
          isOpen={showRescheduleModal}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedJobForReschedule(null);
          }}
          onConfirm={handleRescheduleConfirm}
          job={{
            id: selectedJobForReschedule.id,
            title: selectedJobForReschedule.title,
            customerName: selectedJobForReschedule.customerName,
            technicianId: (selectedJobForReschedule as any).technicianId || "1",
            technicianName: selectedJobForReschedule.technicianName,
            date: selectedJobForReschedule.date,
            time: selectedJobForReschedule.time,
            jobAddress: (selectedJobForReschedule as any).jobAddress || "Address not available",
          }}
        />
      )}

      {/* Job Payment Modal */}
      {selectedJobForPayment && (
        <JobPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedJobForPayment(null);
          }}
          job={{
            id: selectedJobForPayment.id,
            title: selectedJobForPayment.title,
            customerName: selectedJobForPayment.customerName,
            sourceType: (selectedJobForPayment as any).sourceType,
            sourceId: (selectedJobForPayment as any).sourceId,
            paymentStatus: (selectedJobForPayment as any).paymentStatus,
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Associate Documents Modal */}
      {selectedJobForAssociation && (
        <AssociateDocumentsModal
          isOpen={showAssociateDocumentsModal}
          onClose={() => {
            setShowAssociateDocumentsModal(false);
            setSelectedJobForAssociation(null);
            setAssociateDocumentsInitialTab(undefined);
          }}
          jobId={selectedJobForAssociation.id}
          customerId={(selectedJobForAssociation as any).customerId}
          onDocumentAssociated={handleDocumentAssociated}
          initialTab={associateDocumentsInitialTab}
          jobSourceType={(selectedJobForAssociation as any).sourceType}
        />
      )}
    </div>
  );
};

export default Jobs;
