import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockJobs, mockCustomers, mockEmployees, mockInvoices, mockEstimates, mockAgreements } from "@/data/mobileMockData";
import type { JobPaymentStatus, JobSourceType } from "@/data/mobileMockData";
import { Calendar, Clock, MapPin, User, Phone, Mail, Navigation, CreditCard, Receipt, FileCheck, ScrollText, DollarSign, Edit, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";
import { toast } from "sonner";
import SendFeedbackFormModal from "@/components/modals/SendFeedbackFormModal";
import { JobFinancialActions, getFinancialActions } from "@/components/jobs/JobFinancialActions";
import PreviewEstimateModal from "@/components/modals/PreviewEstimateModal";
import PreviewInvoiceModal from "@/components/modals/PreviewInvoiceModal";
import PreviewAgreementModal from "@/components/modals/PreviewAgreementModal";
import JobPaymentModal from "@/components/modals/JobPaymentModal";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobStatus, setJobStatus] = useState<string>("");
  const [showFeedbackFormModal, setShowFeedbackFormModal] = useState(false);
  const [jobFeedbackStatus, setJobFeedbackStatus] = useState<Record<string, { exists: boolean; feedback?: { rating: number; comment: string; submittedAt: string } }>>(() => {
    try {
      const stored = localStorage.getItem("jobFeedbackStatus");
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  });

  // Preview modals state for financial documents
  const [showEstimatePreview, setShowEstimatePreview] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [showAgreementPreview, setShowAgreementPreview] = useState(false);
  const [previewEstimate, setPreviewEstimate] = useState<any>(null);
  const [previewInvoice, setPreviewInvoice] = useState<any>(null);
  const [previewAgreement, setPreviewAgreement] = useState<any>(null);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState<JobPaymentStatus>("unpaid");

  // Get job with extended data from localStorage or mockJobs
  const getJobWithPaymentStatus = () => {
    // First check localStorage for jobs (manually created jobs)
    try {
      const storedJobs = JSON.parse(localStorage.getItem("mockJobs") || "[]");
      const storedJob = storedJobs.find((j: any) => j.id === id);
      if (storedJob) return storedJob;
    } catch (e) {
      console.warn("Could not read stored jobs");
    }
    // Fallback to mockJobs
    return mockJobs.find(j => j.id === id);
  };

  const job = getJobWithPaymentStatus();
  
  useEffect(() => {
    if (job) {
      setJobStatus(job.status);
    }
  }, [job]);
  
  if (!job) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Job not found</p>
      </div>
    );
  }

  const customer = mockCustomers.find(c => c.id === job.customerId);
  const technician = mockEmployees.find(e => e.id === job.technicianId);
  const techInitials = job.technicianName.split(" ").map(n => n[0]).join("");

  // Check if feedback exists for this job
  const hasFeedback = jobFeedbackStatus[job.id]?.exists === true;

  // Auto-send feedback form email (without showing modal)
  const autoSendFeedbackFormEmail = async (jobId: string) => {
    const customerEmail = customer?.email || "";
    
    if (!customerEmail) {
      console.warn(`No email found for customer ${job.customerName}`);
      return;
    }
    
    // In production, this would be an API call to send the email
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mark feedback form as sent
    setJobFeedbackStatus(prev => {
      const updated = {
        ...prev,
        [jobId]: { exists: false }
      };
      localStorage.setItem("jobFeedbackStatus", JSON.stringify(updated));
      return updated;
    });
    
    toast.success(`Feedback form sent automatically to ${customerEmail}`);
  };

  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    const oldStatus = jobStatus;
    setJobStatus(newStatus);
    
    // Check if status changed to Completed
    if (newStatus === "Completed" && oldStatus !== "Completed") {
      const feedbackAutoSendEnabled = typeof window !== "undefined" 
        ? localStorage.getItem("autoSendFeedback") === "true" 
        : false;
      
      if (!hasFeedback) {
        if (feedbackAutoSendEnabled) {
          // Auto-send email without showing modal (async, non-blocking)
          autoSendFeedbackFormEmail(job.id).catch(err => {
            console.error("Failed to auto-send feedback form:", err);
            toast.error("Failed to send feedback form automatically");
          });
        } else {
          // Show modal with delivery options
          setTimeout(() => {
            setShowFeedbackFormModal(true);
          }, 100);
        }
      }
    }
    
    toast.success(`Job status updated to ${newStatus}`);
  };

  // Handle feedback form send (shows modal)
  const handleFeedbackFormSent = () => {
    setJobFeedbackStatus(prev => {
      const updated = {
        ...prev,
        [job.id]: { exists: false }
      };
      localStorage.setItem("jobFeedbackStatus", JSON.stringify(updated));
      return updated;
    });
    setShowFeedbackFormModal(false);
    toast.success("Feedback form sent successfully");
  };

  // Get job source type and payment status
  const jobSourceType: JobSourceType = (job as any).sourceType || "none";
  const jobSourceId: string | undefined = (job as any).sourceId;
  const jobPaymentStatus: JobPaymentStatus = (job as any).paymentStatus || "unpaid";

  // Financial action handlers
  const handleCreateInvoice = () => {
    // Navigate to create invoice with pre-filled job data
    navigate(`/invoices/new?jobId=${job.id}&customerId=${job.customerId}`);
    toast.success("Creating new invoice...");
  };

  const handleViewInvoice = () => {
    if (jobSourceId) {
      const invoice = mockInvoices.find(inv => inv.id === jobSourceId);
      if (invoice) {
        setPreviewInvoice(invoice);
        setShowInvoicePreview(true);
      } else {
        toast.error("Invoice not found");
      }
    }
  };

  const handleCreateEstimate = () => {
    // Navigate to create estimate with pre-filled job data
    navigate(`/estimates/new?jobId=${job.id}&customerId=${job.customerId}`);
    toast.success("Creating new estimate...");
  };

  const handleViewEstimate = () => {
    if (jobSourceId) {
      const estimate = mockEstimates.find(est => est.id === jobSourceId);
      if (estimate) {
        setPreviewEstimate(estimate);
        setShowEstimatePreview(true);
      } else {
        toast.error("Estimate not found");
      }
    }
  };

  const handleViewAgreement = () => {
    if (jobSourceId) {
      const agreement = mockAgreements.find(agr => agr.id === jobSourceId);
      if (agreement) {
        setPreviewAgreement(agreement);
        setShowAgreementPreview(true);
      } else {
        toast.error("Agreement not found");
      }
    }
  };

  const handlePay = () => {
    // Open payment modal instead of navigating
    setShowPaymentModal(true);
  };

  // Handle payment completion
  const handlePaymentComplete = (jobId: string, transactionId: string) => {
    // Update local state to reflect payment
    setCurrentPaymentStatus("paid");
    setShowPaymentModal(false);
  };

  // Edit handlers - for unpaid jobs to modify existing associated documents
  const handleEditInvoice = () => {
    if (jobSourceId) {
      navigate(`/invoices/edit/${jobSourceId}`);
      toast.success("Editing invoice...");
    } else {
      toast.error("No invoice to edit");
    }
  };

  const handleEditEstimate = () => {
    if (jobSourceId) {
      navigate(`/estimates/edit/${jobSourceId}`);
      toast.success("Editing estimate...");
    } else {
      toast.error("No estimate to edit");
    }
  };

  const handleEditAgreement = () => {
    if (jobSourceId) {
      navigate(`/agreements/edit/${jobSourceId}`);
      toast.success("Editing agreement...");
    } else {
      toast.error("No agreement to edit");
    }
  };

  // Associate New handlers - for paid jobs to create additional documents
  const handleAssociateNewInvoice = () => {
    navigate(`/invoices/new?jobId=${job.id}&customerId=${job.customerId}&associateNew=true`);
    toast.success("Creating new associated invoice...");
  };

  const handleAssociateNewEstimate = () => {
    navigate(`/estimates/new?jobId=${job.id}&customerId=${job.customerId}&associateNew=true`);
    toast.success("Creating new associated estimate...");
  };

  const handleAssociateNewAgreement = () => {
    navigate(`/agreements/new?jobId=${job.id}&customerId=${job.customerId}&associateNew=true`);
    toast.success("Creating new associated agreement...");
  };

  // Determine if job is paid for conditional rendering
  // Use currentPaymentStatus if it's been updated by payment completion, otherwise use original
  const isPaid = currentPaymentStatus === "paid" || jobPaymentStatus === "paid";

  // Initialize currentPaymentStatus from job data
  useEffect(() => {
    if (job) {
      setCurrentPaymentStatus(jobPaymentStatus);
    }
  }, [job, jobPaymentStatus]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader 
        title="Job Details"
        showBack={true}
        actions={
          <Button size="sm" variant="outline">
            <Navigation className="h-4 w-4" />
          </Button>
        }
      />
      
      <div className="flex-1 overflow-y-auto scrollable pt-14">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
              <Badge className={cn("text-sm", statusColors[jobStatus || job.status])}>
                {jobStatus || job.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 px-4 py-4">
          <Button variant="outline" className="gap-2" onClick={() => window.location.href = `tel:${customer?.phone}`}>
            <Phone className="h-4 w-4" />
            Call Customer
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.location.href = `tel:${technician?.phone}`}>
            <Phone className="h-4 w-4" />
            Call Tech
          </Button>
        </div>

        {/* Details */}
        <div className="px-4 space-y-4 pb-6">
          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Schedule
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(job.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{job.time}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Customer
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{job.customerName}</p>
              {customer && (
                <>
                  <p className="text-muted-foreground">{customer.email}</p>
                  <p className="text-muted-foreground">{customer.phone}</p>
                </>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Location
            </h3>
            <p className="text-sm">{job.location}</p>
            <Button variant="outline" size="sm" className="mt-3 w-full">
              <Navigation className="h-4 w-4 mr-2" />
              Open in Maps
            </Button>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Assigned Technician
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">{techInitials}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">{job.technicianName}</p>
                {technician && (
                  <>
                    <p className="text-sm text-muted-foreground">{technician.role}</p>
                    <p className="text-sm text-muted-foreground">{technician.phone}</p>
                  </>
                )}
              </div>
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Financial Actions Card */}
          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Financial Actions
            </h3>
            
            {/* Payment Status */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <span className="text-sm text-muted-foreground">Payment Status</span>
              <Badge 
                className={cn(
                  "text-xs",
                  currentPaymentStatus === "paid" 
                    ? "bg-green-100 text-green-700 border-green-200" 
                    : currentPaymentStatus === "partial"
                    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                    : "bg-orange-100 text-orange-700 border-orange-200"
                )}
              >
                {currentPaymentStatus === "paid" ? "Paid" : currentPaymentStatus === "partial" ? "Partially Paid" : "Unpaid"}
              </Badge>
            </div>

            {/* Source Document Info */}
            {jobSourceType !== "none" && (
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <span className="text-sm text-muted-foreground">Source</span>
                <div className="flex items-center gap-2">
                  {jobSourceType === "invoice" && <Receipt className="h-4 w-4 text-muted-foreground" />}
                  {jobSourceType === "estimate" && <FileCheck className="h-4 w-4 text-muted-foreground" />}
                  {jobSourceType === "agreement" && <ScrollText className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm font-medium">
                    {jobSourceType === "invoice" ? "Invoice" : jobSourceType === "estimate" ? "Estimate" : "Agreement"}
                    {jobSourceId && ` (${jobSourceId})`}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {/* Pay Button - Prominent for unpaid/partial */}
              {!isPaid && jobStatus !== "Cancel" && (
                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={handlePay}
                >
                  <CreditCard className="h-4 w-4" />
                  {currentPaymentStatus === "partial" ? "Complete Payment" : "Pay Now"}
                </Button>
              )}

              {/* Source-based actions with Edit vs Associate New logic */}
              {jobSourceType === "estimate" && (
                <>
                  {/* View Estimate */}
                  <Button variant="outline" className="w-full gap-2" onClick={handleViewEstimate}>
                    <FileCheck className="h-4 w-4" />
                    View Estimate
                  </Button>
                  {/* Edit for unpaid, Associate New for paid */}
                  <div className="grid grid-cols-2 gap-2">
                    {!isPaid ? (
                      <Button variant="outline" className="gap-2" onClick={handleEditEstimate}>
                        <Edit className="h-4 w-4" />
                        Edit Estimate
                      </Button>
                    ) : (
                      <Button variant="outline" className="gap-2" onClick={handleAssociateNewEstimate}>
                        <PlusCircle className="h-4 w-4" />
                        New Estimate
                      </Button>
                    )}
                    {!isPaid ? (
                      <Button variant="outline" className="gap-2" onClick={handleCreateInvoice}>
                        <Receipt className="h-4 w-4" />
                        Create Invoice
                      </Button>
                    ) : (
                      <Button variant="outline" className="gap-2" onClick={handleAssociateNewInvoice}>
                        <PlusCircle className="h-4 w-4" />
                        New Invoice
                      </Button>
                    )}
                  </div>
                </>
              )}

              {jobSourceType === "invoice" && (
                <>
                  <Button variant="outline" className="w-full gap-2" onClick={handleViewInvoice}>
                    <Receipt className="h-4 w-4" />
                    View Invoice
                  </Button>
                  {/* Edit for unpaid, Associate New for paid */}
                  {!isPaid ? (
                    <Button variant="outline" className="w-full gap-2" onClick={handleEditInvoice}>
                      <Edit className="h-4 w-4" />
                      Edit Invoice
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full gap-2" onClick={handleAssociateNewInvoice}>
                      <PlusCircle className="h-4 w-4" />
                      Associate New Invoice
                    </Button>
                  )}
                </>
              )}

              {jobSourceType === "agreement" && (
                <>
                  <Button variant="outline" className="w-full gap-2" onClick={handleViewAgreement}>
                    <ScrollText className="h-4 w-4" />
                    View Agreement
                  </Button>
                  {/* Edit for unpaid, Associate New for paid */}
                  <div className="grid grid-cols-2 gap-2">
                    {!isPaid ? (
                      <Button variant="outline" className="gap-2" onClick={handleEditAgreement}>
                        <Edit className="h-4 w-4" />
                        Edit Agreement
                      </Button>
                    ) : (
                      <Button variant="outline" className="gap-2" onClick={handleAssociateNewAgreement}>
                        <PlusCircle className="h-4 w-4" />
                        New Agreement
                      </Button>
                    )}
                    {!isPaid ? (
                      <Button variant="outline" className="gap-2" onClick={handleCreateInvoice}>
                        <Receipt className="h-4 w-4" />
                        Create Invoice
                      </Button>
                    ) : (
                      <Button variant="outline" className="gap-2" onClick={handleAssociateNewInvoice}>
                        <PlusCircle className="h-4 w-4" />
                        New Invoice
                      </Button>
                    )}
                  </div>
                </>
              )}

              {jobSourceType === "none" && (
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="gap-2" onClick={handleCreateEstimate}>
                    <FileCheck className="h-4 w-4" />
                    Create Estimate
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={handleCreateInvoice}>
                    <Receipt className="h-4 w-4" />
                    Create Invoice
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Status Actions */}
          {(jobStatus || job.status) === "Scheduled" && (
            <div className="space-y-2">
              <Button className="w-full" size="lg" onClick={() => handleStatusChange("In Progress")}>
                Start Job
              </Button>
              <Button variant="outline" className="w-full">
                Reschedule
              </Button>
            </div>
          )}

          {(jobStatus || job.status) === "In Progress" && (
            <div className="space-y-2">
              <Button className="w-full" size="lg" onClick={() => handleStatusChange("Completed")}>
                Complete Job
              </Button>
              <Button variant="outline" className="w-full">
                Add Notes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Send Feedback Form Modal */}
      {job && (
        <SendFeedbackFormModal
          isOpen={showFeedbackFormModal}
          onClose={() => setShowFeedbackFormModal(false)}
          job={job}
          customerEmail={customer?.email || ""}
          onSend={handleFeedbackFormSent}
          onFillForm={() => {
            setShowFeedbackFormModal(false);
            // Navigate to feedback form or show feedback form modal
            toast.info("Fill feedback form functionality");
          }}
        />
      )}

      {/* Preview Modals for Financial Documents */}
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

      {/* Job Payment Modal */}
      {job && (
        <JobPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          job={{
            id: job.id,
            title: job.title,
            customerName: job.customerName,
            sourceType: jobSourceType,
            sourceId: jobSourceId,
            paymentStatus: currentPaymentStatus,
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default JobDetails;

