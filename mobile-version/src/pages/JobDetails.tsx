import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockJobs, mockCustomers, mockEmployees, mockInvoices, mockEstimates, mockAgreements } from "@/data/mobileMockData";
import type { JobPaymentStatus, JobSourceType } from "@/data/mobileMockData";
import { getLinkedDocuments, type LinkedDocument } from "@/services/jobAssignmentService";
import { Calendar, Clock, MapPin, User, Mail, MessageSquare, Navigation, CreditCard, Receipt, FileCheck, ScrollText, DollarSign, Edit, PlusCircle, FileText, ChevronDown, Link } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";
import { toast } from "sonner";
import SendFeedbackFormModal from "@/components/modals/SendFeedbackFormModal";
import { JobFinancialActions, getFinancialActions } from "@/components/jobs/JobFinancialActions";
import PreviewEstimateModal from "@/components/modals/PreviewEstimateModal";
import PreviewInvoiceModal from "@/components/modals/PreviewInvoiceModal";
import PreviewAgreementModal from "@/components/modals/PreviewAgreementModal";
import JobPaymentModal from "@/components/modals/JobPaymentModal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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

  // Refresh key for linked documents - incremented when documents are associated/unassociated
  const [linkedDocumentsRefreshKey, setLinkedDocumentsRefreshKey] = useState(0);

  // Listen for document assignment events to refresh linked documents
  useEffect(() => {
    const handleDocumentAssigned = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.jobId === id) {
        setLinkedDocumentsRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener("documentAssignedToJob", handleDocumentAssigned);
    return () => {
      window.removeEventListener("documentAssignedToJob", handleDocumentAssigned);
    };
  }, [id]);

  // Get job with extended data from location state, localStorage, or mockJobs
  const getJobWithPaymentStatus = () => {
    // First check if job was passed via navigation state (for demo/generated jobs)
    const stateJob = (location.state as any)?.job;
    if (stateJob && stateJob.id === id) {
      return stateJob;
    }
    
    // Then check localStorage for jobs (manually created jobs)
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

  // Derive meaningful title from associated document if current title is generic
  const getDerivedJobTitle = (job: any) => {
    if (!job) return "Service Job";
    
    const currentTitle = job.title || "";
    
    // If title already looks meaningful (not a document ID pattern), use it
    if (!currentTitle.match(/^(Invoice|Estimate|Agreement)\s+[A-Z0-9\-]+$/)) {
      return currentTitle;
    }
    
    // Try to get service name from associated document
    const sourceId = (job as any).sourceId;
    const sourceType = (job as any).sourceType;
    
    if (sourceId && sourceType) {
      if (sourceType === "invoice") {
        const invoice = mockInvoices.find(inv => inv.id === sourceId);
        if (invoice?.serviceName) return invoice.serviceName;
        // Fallback to "Plumbing Work" for invoices without serviceName
        return "Plumbing Work";
      } else if (sourceType === "estimate") {
        const estimate = mockEstimates.find(est => est.id === sourceId);
        if (estimate?.serviceName) return estimate.serviceName;
        return "Plumbing Work";
      } else if (sourceType === "agreement") {
        const agreement = mockAgreements.find(agr => agr.id === sourceId);
        if (agreement?.serviceName) return agreement.serviceName;
        return "Plumbing Work";
      }
    }
    
    // Fallback for document ID pattern - return "Plumbing Work"
    return "Plumbing Work";
  };
  
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

  // Get linked documents for this job (refreshes when linkedDocumentsRefreshKey changes)
  const linkedDocuments: LinkedDocument[] = useMemo(() => {
    return id ? getLinkedDocuments(id) : [];
  }, [id, linkedDocumentsRefreshKey]);
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

  // Get all invoices associated with this job (source + linked)
  const getAllAssociatedInvoices = () => {
    const invoices: any[] = [];
    
    // Add source invoice if job was created from an invoice
    if (jobSourceType === "invoice" && jobSourceId) {
      const sourceInvoice = mockInvoices.find(inv => inv.id === jobSourceId);
      if (sourceInvoice) {
        invoices.push({
          id: sourceInvoice.id,
          items: sourceInvoice.items || [],
          subtotal: sourceInvoice.subtotal || 0,
          discount: sourceInvoice.discount || 0,
          tax: sourceInvoice.tax || 0,
          total: sourceInvoice.amount || 0,
          status: sourceInvoice.status,
          paymentMethod: sourceInvoice.paymentMethod
        });
      }
    }
    
    // Add all linked invoices
    const linked = linkedDocuments.filter(doc => doc.type === "invoice");
    linked.forEach(doc => {
      // Avoid duplicates - don't add source invoice again
      if (doc.id === jobSourceId) return;
      
      const invoice = mockInvoices.find(inv => inv.id === doc.id);
      if (invoice) {
        invoices.push({
          id: invoice.id,
          items: invoice.items || [],
          subtotal: invoice.subtotal || 0,
          discount: invoice.discount || 0,
          tax: invoice.tax || 0,
          total: invoice.amount || 0,
          status: invoice.status,
          paymentMethod: invoice.paymentMethod
        });
      }
    });
    
    // If no invoices found, return demo invoices for display
    if (invoices.length === 0) {
      return [
        {
          id: "INV-001",
          items: [
            {
              name: "HVAC Filter - Standard",
              quantity: 1,
              price: 25.99,
              discount: 2,
              discountName: "custom",
              discountType: "$",
              taxRate: 5
            }
          ],
          subtotal: 25.99,
          discount: 2.00,
          tax: 1.20,
          total: 25.19,
          status: "Paid",
          paymentMethod: "Card"
        },
        {
          id: "INV-002",
          items: [
            {
              name: "Thermostat - Programmable",
              quantity: 1,
              price: 89.99,
              discount: 10,
              discountName: "new",
              discountType: "$",
              taxRate: 2
            }
          ],
          subtotal: 89.99,
          discount: 10.00,
          tax: 1.60,
          total: 81.59,
          status: "Unpaid",
          paymentMethod: null
        }
      ];
    }
    
    return invoices;
  };

  const invoicesWithItems = getAllAssociatedInvoices();

  // Get items from associated document (invoice, estimate, or agreement)
  // For demo jobs, return sample items
  const getDocumentItems = () => {
    // Demo items for jobs without associated documents
    const demoItems = [
      {
        name: "HVAC Filter - Standard",
        quantity: 1,
        price: 25.99,
        discount: 2,
        discountName: "custom",
        discountType: "$",
        taxRate: 5
      },
      {
        name: "Thermostat - Programmable",
        quantity: 1,
        price: 89.99,
        discount: 10,
        discountName: "new",
        discountType: "$",
        taxRate: 2
      }
    ];
    
    if (!jobSourceId) {
      // Return demo items for jobs without associated documents
      return { 
        items: demoItems, 
        subtotal: 104.38, 
        discount: 11.60, 
        tax: 10.44, 
        total: 114.82 
      };
    }
    
    if (jobSourceType === "invoice") {
      const invoice = mockInvoices.find(inv => inv.id === jobSourceId);
      if (invoice) {
        return {
          items: invoice.items || [],
          subtotal: invoice.subtotal || 0,
          discount: invoice.discount || 0,
          tax: invoice.tax || 0,
          total: invoice.amount || 0
        };
      }
    } else if (jobSourceType === "estimate") {
      const estimate = mockEstimates.find(est => est.id === jobSourceId);
      if (estimate) {
        return {
          items: estimate.items || [],
          subtotal: estimate.subtotal || 0,
          discount: estimate.discount || 0,
          tax: estimate.tax || 0,
          total: estimate.amount || 0
        };
      }
    } else if (jobSourceType === "agreement") {
      const agreement = mockAgreements.find(agr => agr.id === jobSourceId);
      if (agreement) {
        return {
          items: agreement.items || [],
          subtotal: agreement.subtotal || 0,
          discount: agreement.discount || 0,
          tax: agreement.tax || 0,
          total: agreement.amount || 0
        };
      }
    }
    
    // Fallback to demo items
    return { 
      items: demoItems, 
      subtotal: 104.38, 
      discount: 11.60, 
      tax: 10.44, 
      total: 114.82 
    };
  };

  const { items: documentItems, subtotal, discount, tax, total } = getDocumentItems();

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
      />
      
      <div className="flex-1 overflow-y-auto scrollable pt-14">
        {/* Header - Compact Mobile Layout */}
        <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/5">
          {/* Title and Status Row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="text-xl font-bold flex-1">{getDerivedJobTitle(job)}</h2>
            <Badge className={cn("text-xs shrink-0", statusColors[jobStatus || job.status])}>
              {jobStatus || job.status}
            </Badge>
          </div>
          
          {/* Meta Row: Job ID + Date + Time */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>ID: {job.id}</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(job.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {job.time}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 px-4 mt-4">
          <Button 
            variant="outline" 
            className="gap-2" 
            disabled={!customer?.email}
            onClick={() => {
              if (customer?.email) {
                const subject = encodeURIComponent(`Job ${job.id}`);
                window.location.href = `mailto:${customer.email}?subject=${subject}`;
              }
            }}
          >
            <Mail className="h-4 w-4" />
            Send Email
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            disabled={!customer?.phone}
            onClick={() => {
              if (customer?.phone) {
                window.location.href = `sms:${customer.phone}`;
              }
            }}
          >
            <MessageSquare className="h-4 w-4" />
            Send SMS
          </Button>
        </div>

        {/* Details */}
        <div className="px-4 mt-4 space-y-4 pb-6">
          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Customer Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium text-right">{job.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Job Address</span>
                <span className="font-medium text-right max-w-[200px]">{job.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned to</span>
                <span className="font-medium text-right">{job.technicianName}</span>
              </div>
              {customer && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-right">{customer.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium text-right">{customer.phone}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Items Section - Accordion by Invoice */}
          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Items
            </h3>

            {invoicesWithItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No items added yet</p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {invoicesWithItems.map((invoice: any) => (
                  <AccordionItem key={invoice.id} value={invoice.id} className="border-b last:border-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-primary" />
                        <span className="font-medium text-primary">{invoice.id}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {invoice.items.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No items added</p>
                      ) : (
                        <div className="space-y-4 pt-2">
                          {/* Items List */}
                          <div className="space-y-4">
                            {invoice.items.map((item: any, idx: number) => {
                              // Helper to calculate item subtotal with all discounts and taxes
                              const calculateItemSubtotal = () => {
                                let total = item.price * item.quantity;
                                
                                // Apply default discounts
                                if (item.defaultDiscounts && Array.isArray(item.defaultDiscounts)) {
                                  item.defaultDiscounts.forEach((discount: any) => {
                                    const amount = discount.type === "%" 
                                      ? total * (discount.value / 100)
                                      : discount.value;
                                    total -= amount;
                                  });
                                }
                                
                                // Apply single discount field for backwards compatibility
                                if (item.discount && item.discount > 0) {
                                  const amount = item.discountType === "%" 
                                    ? total * (item.discount / 100)
                                    : item.discount;
                                  total -= amount;
                                }
                                
                                // Apply default taxes
                                if (item.defaultTaxes && Array.isArray(item.defaultTaxes)) {
                                  item.defaultTaxes.forEach((tax: any) => {
                                    const amount = total * (tax.value / 100);
                                    total += amount;
                                  });
                                }
                                
                                // Apply single tax field for backwards compatibility
                                if (item.taxRate && item.taxRate > 0) {
                                  const amount = total * (item.taxRate / 100);
                                  total += amount;
                                }
                                
                                return total;
                              };

                              return (
                                <div key={idx} className="pb-4 border-b last:border-0 last:pb-0">
                                  {/* Item Header - Item Name and Base Amount */}
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <p className="font-semibold">{item.name}</p>
                                    </div>
                                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {item.quantity} × ${item.price.toFixed(2)}
                                  </p>
                                  
                                  {/* Inventory-Level Discounts (Item-Level) */}
                                  {item.defaultDiscounts && item.defaultDiscounts.length > 0 && (
                                    <div className="space-y-1 mb-2">
                                      {item.defaultDiscounts.map((discount: any, didx: number) => {
                                        const baseAmount = item.price * item.quantity;
                                        const discountAmount = discount.type === "%" 
                                          ? baseAmount * (discount.value / 100)
                                          : discount.value;
                                        return (
                                          <div key={didx} className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                              {discount.name} ({discount.type === "%" ? `${discount.value}%` : `$${discount.value}`})
                                            </span>
                                            <span className="font-medium text-green-600">-${discountAmount.toFixed(2)}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                  
                                  {/* Custom/Manual Discounts - single discount field */}
                                  {item.discount && item.discount > 0 && (
                                    <div className="flex items-center justify-between text-sm mb-2">
                                      <span className="text-muted-foreground">
                                        {item.discountName || "Discount"} ({item.discountType === "%" ? `${item.discount}%` : `$${item.discount}`})
                                      </span>
                                      <span className="font-medium text-green-600">-${item.discount.toFixed(2)}</span>
                                    </div>
                                  )}
                                  
                                  {/* Inventory-Level Taxes (Item-Level) */}
                                  {item.defaultTaxes && item.defaultTaxes.length > 0 && (
                                    <div className="space-y-1 mb-2">
                                      {item.defaultTaxes.map((tax: any, tidx: number) => {
                                        const baseAmount = item.price * item.quantity;
                                        let afterDiscounts = baseAmount;
                                        
                                        // Calculate after inventory discounts
                                        if (item.defaultDiscounts) {
                                          item.defaultDiscounts.forEach((disc: any) => {
                                            const dAmount = disc.type === "%" 
                                              ? afterDiscounts * (disc.value / 100)
                                              : disc.value;
                                            afterDiscounts -= dAmount;
                                          });
                                        }
                                        
                                        const taxAmount = afterDiscounts * (tax.value / 100);
                                        return (
                                          <div key={tidx} className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                              {tax.name} ({tax.value}%)
                                            </span>
                                            <span className="font-medium text-blue-600">+${taxAmount.toFixed(2)}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                  
                                  {/* Custom Tax */}
                                  {item.taxRate && item.taxRate > 0 && (
                                    <div className="flex items-center justify-between text-sm mb-2">
                                      <span className="text-muted-foreground">
                                        Item Tax ({item.taxRate}%)
                                      </span>
                                      <span className="font-medium text-blue-600">+${((item.price * item.quantity - (item.discount || 0)) * (item.taxRate / 100)).toFixed(2)}</span>
                                    </div>
                                  )}
                                  
                                  {/* Item Subtotal */}
                                  <div className="flex items-center justify-between text-sm font-semibold pt-2 border-t border-gray-200">
                                    <span>Item Subtotal:</span>
                                    <span>${calculateItemSubtotal().toFixed(2)}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Invoice Pricing Breakdown */}
                          <div className="pt-4 border-t space-y-2">
                            {/* Subtotal */}
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-muted-foreground">Subtotal:</span>
                              <span className="font-semibold">${invoice.subtotal.toFixed(2)}</span>
                            </div>
                            
                            {/* Discount - only show if applicable */}
                            {invoice.discount > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-muted-foreground">Discount:</span>
                                <span className="font-semibold text-green-600">-${invoice.discount.toFixed(2)}</span>
                              </div>
                            )}
                            
                            {/* Tax - only show if applicable */}
                            {invoice.tax > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-muted-foreground">Tax:</span>
                                <span className="font-semibold">${invoice.tax.toFixed(2)}</span>
                              </div>
                            )}
                            
                            {/* Total Amount - emphasized */}
                            <div className="flex justify-between pt-2 border-t mt-2">
                              <span className="font-bold text-base">Total Amount:</span>
                              <span className="font-bold text-lg text-primary">${invoice.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          {/* Payment Section */}
          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment
            </h3>
            
            {/* All Associated Invoice Payment Info */}
            <div className="space-y-3">
              {invoicesWithItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No payments available</p>
              ) : (
                invoicesWithItems.map((invoice: any, index: number) => {
                  const isPaidInvoice = invoice.status === "Paid";
                  const isOverdue = invoice.status === "Overdue";
                  
                  return (
                    <div 
                      key={invoice.id} 
                      className={cn(
                        "flex items-center justify-between text-sm py-2",
                        index < invoicesWithItems.length - 1 && "border-b"
                      )}
                    >
                      <button
                        onClick={() => {
                          const foundInvoice = mockInvoices.find(inv => inv.id === invoice.id);
                          if (foundInvoice) {
                            setPreviewInvoice(foundInvoice);
                            setShowInvoicePreview(true);
                          } else {
                            toast.error("Invoice not found");
                          }
                        }}
                        className="font-medium text-primary hover:underline"
                      >
                        {invoice.id}
                      </button>
                      <div className="flex items-center gap-4">
                        <Badge 
                          className={cn(
                            "text-xs",
                            isPaidInvoice
                              ? "bg-green-100 text-green-700 border-green-200"
                              : isOverdue
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-orange-100 text-orange-700 border-orange-200"
                          )}
                        >
                          {invoice.status || (isPaidInvoice ? "Paid" : "Unpaid")}
                        </Badge>
                        <span className="text-muted-foreground min-w-[60px] text-right">
                          {isPaidInvoice ? (invoice.paymentMethod || "Card") : "-"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
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
          isOpen={showInvoicePreview}
          onClose={() => {
            setShowInvoicePreview(false);
            setPreviewInvoice(null);
          }}
          invoice={previewInvoice}
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

