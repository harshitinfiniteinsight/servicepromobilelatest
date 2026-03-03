import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TabletHeader from "@/components/layout/TabletHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockJobs, mockCustomers, mockEmployees, mockInvoices, mockEstimates } from "@/data/mobileMockData";
import { Calendar, Clock, MapPin, User, Phone, Mail, Briefcase, ChevronDown, ChevronUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";
import { toast } from "sonner";
import SendFeedbackFormModal from "@/components/modals/SendFeedbackFormModal";
import RescheduleJobModal from "@/components/modals/RescheduleJobModal";
import { format } from "date-fns";

// Demo-safe fallback job data
const createMockJobData = (jobId: string) => ({
  id: jobId,
  title: "Plumbing Work",
  services: ["Plumbing Repair", "Pipe Inspection"],
  customerId: "1",
  customerName: "John Smith",
  technicianId: "1",
  technicianName: "Mike Johnson",
  date: new Date().toISOString().slice(0, 10),
  time: "11:00 AM",
  status: "Scheduled",
  location: "123 Main St, Springfield, IL",
  sourceType: "invoice" as const,
  sourceId: "INV-001",
  paymentStatus: "unpaid" as const
});

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobStatus, setJobStatus] = useState<string>("");
  const [showFeedbackFormModal, setShowFeedbackFormModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [jobFeedbackStatus, setJobFeedbackStatus] = useState<Record<string, { exists: boolean; feedback?: { rating: number; comment: string; submittedAt: string } }>>(() => {
    try {
      const stored = localStorage.getItem("jobFeedbackStatus");
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  });

  // Load jobs from both mockJobs and localStorage (for dynamically created jobs)
  const allJobs = (() => {
    try {
      const storedJobs = JSON.parse(localStorage.getItem("mockJobs") || "[]");
      return [...storedJobs, ...mockJobs];
    } catch (error) {
      console.warn("Error loading stored jobs:", error);
      return mockJobs;
    }
  })();

  // Find job in all jobs (both static mockJobs and dynamically created jobs in localStorage)
  let job = allJobs.find(j => j.id === id);
  
  // Demo-safe fallback: If job not found, create mock data
  if (!job && id) {
    console.warn(`Job ${id} not found in mockJobs or localStorage, using fallback data for demo`);
    job = createMockJobData(id);
  }
  
  useEffect(() => {
    if (job) {
      setJobStatus(job.status);
    }
  }, [job]);
  
  // This should never happen now, but keep as final safety
  if (!job || !id) {
    return (
      <div className="h-full flex flex-col overflow-hidden bg-muted/10">
        <TabletHeader 
          title="Job Details"
          showBack={true}
          className="px-4 md:px-6 lg:px-8"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Job information unavailable</p>
            <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
          </div>
        </div>
      </div>
    );
  }

  const customer = mockCustomers.find(c => c.id === job.customerId) || {
    id: job.customerId || "1",
    name: job.customerName,
    email: "customer@example.com",
    phone: "(555) 123-4567",
    address: job.location,
    status: "Active" as const
  };
  
  const technician = mockEmployees.find(e => e.id === job.technicianId) || {
    id: job.technicianId || "1",
    name: job.technicianName,
    email: "tech@example.com",
    phone: "(555) 987-6543",
    role: "Technician" as const,
    status: "Active" as const
  };
  
  const techInitials = job.technicianName.split(" ").map(n => n[0]).join("");

  // Get related invoices and estimates (graceful handling)
  let relatedInvoices: any[] = [];
  let relatedEstimates: any[] = [];
  
  try {
    relatedInvoices = mockInvoices.filter(inv => {
      const linkedJobs = JSON.parse(localStorage.getItem('invoice-job-links') || '{}');
      return linkedJobs[inv.id] === job.id || inv.id === job.sourceId;
    });

    relatedEstimates = mockEstimates.filter(est => {
      const linkedJobs = JSON.parse(localStorage.getItem('estimate-job-links') || '{}');
      return linkedJobs[est.id] === job.id || est.id === job.sourceId;
    });
  } catch (error) {
    console.warn('Error fetching related documents:', error);
  }

  const allItems = [
    ...relatedInvoices.map(inv => ({ ...inv, type: 'invoice' as const })),
    ...relatedEstimates.map(est => ({ ...est, type: 'estimate' as const }))
  ];

  // Check if feedback exists for this job
  const hasFeedback = jobFeedbackStatus[job.id]?.exists === true;

  // Auto-send feedback form email (without showing modal)
  const autoSendFeedbackFormEmail = async (jobId: string) => {
    const customerEmail = customer?.email || "";
    
    if (!customerEmail) {
      console.warn(`No email found for customer ${job.customerName}`);
      toast.info("Customer email not available");
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

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Demo line items for fallback (demo-safe)
  const createDemoLineItems = (item: any) => {
    const itemPrice = item.total || 100;
    const discount = itemPrice * 0.08; // 8% discount
    const subtotal = itemPrice;
    const taxRate = 5;
    const tax = (subtotal - discount) * (taxRate / 100);
    const unitPrice = subtotal;

    return [
      {
        name: item.type === 'invoice' ? "HVAC Filter - Standard" : "Service Inspection",
        description: item.type === 'invoice' ? "HVAC Filter - Standard" : "Service Inspection",
        quantity: 1,
        price: unitPrice,
        unitPrice: unitPrice,
        discount: discount,
        customAdjustment: -discount,
        taxRate: taxRate,
        tax: tax,
        subtotal: subtotal - discount + tax
      }
    ];
  };

  const handleSendEmail = () => {
    if (customer?.email) {
      toast.success(`Email sent to ${customer.email}`);
    } else {
      toast.error("No email address available");
    }
  };

  const handleSendSMS = () => {
    if (customer?.phone) {
      toast.success(`SMS sent to ${customer.phone}`);
    } else {
      toast.error("No phone number available");
    }
  };

  const handleEditJob = () => {
    toast.info("Edit job functionality coming soon");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-muted/10">
      <TabletHeader 
        title="Job Details"
        showBack={true}
        className="px-4 md:px-6 lg:px-8"
      />
      
      <div className="flex-1 overflow-y-auto scrollable">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
          {/* SECTION 1: Job Header Card with Status */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-6 md:p-8">
            <div className="flex items-start justify-between gap-6 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">ID:</span>
                    <span>{job.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{format(new Date(job.date), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{job.time}</span>
                  </div>
                </div>
              </div>
              <Badge className={cn("text-sm flex-shrink-0 px-4 py-2 h-fit", statusColors[jobStatus || job.status])}>
                {jobStatus || job.status}
              </Badge>
            </div>
          </div>

          {/* SECTION 2: Customer Details Card with Inline Actions */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 gap-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Customer Details
              </h2>
              <div className="flex gap-3 flex-shrink-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-10 gap-2 whitespace-nowrap"
                  onClick={handleSendSMS}
                >
                  <Phone className="h-4 w-4" />
                  <span className="hidden sm:inline">Send SMS</span>
                </Button>
                <Button 
                  size="sm"
                  className="h-10 gap-2 whitespace-nowrap"
                  onClick={handleSendEmail}
                >
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">Send Email</span>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Name</p>
                <p className="text-base font-medium text-gray-900">{job.customerName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Job Address</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-base font-medium text-gray-900 break-words">{job.location}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assigned To</p>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    {techInitials}
                  </div>
                  <p className="text-base font-medium text-gray-900">{job.technicianName}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email</p>
                <p className="text-base font-medium text-gray-900">{customer?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Phone</p>
                <p className="text-base font-medium text-gray-900">{customer?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* SECTION 3: Two-Column Layout - Items (Left 2/3) and Payment (Right 1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Items Card (2 columns) */}
            <div className="lg:col-span-2">
              {/* SECTION 3: Items Card */}
              <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-6 md:p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Items
                </h2>
                {allItems.length === 0 ? (
                  <p className="text-sm text-gray-500">No invoices or estimates linked to this job</p>
                ) : (
                  <div className="space-y-3">
                    {allItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div
                          className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleItem(item.id)}
                        >
                          <div className="flex items-center gap-3">
                            <a href="#" className="font-semibold text-primary hover:underline">{item.id}</a>
                            <Badge className={cn("text-xs", statusColors[item.status])}>
                              {item.status}
                            </Badge>
                          </div>
                          {expandedItems[item.id] ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        {expandedItems[item.id] && (
                          <div className="px-6 pb-6 pt-4 bg-gray-50 border-t border-gray-200">
                            {/* Line Items */}
                            {(() => {
                              // Use demo fallback if no items available (demo-safe)
                              const lineItems = (item.items && item.items.length > 0) 
                                ? item.items 
                                : createDemoLineItems(item);
                              
                              return (
                                <div className="space-y-5">
                                  {lineItems.map((lineItem: any, index: number) => (
                                    <div key={index} className="space-y-3">
                                      <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 space-y-1.5">
                                          <p className="font-medium text-base text-gray-900">{lineItem.name || lineItem.description}</p>
                                          <p className="text-sm text-gray-500">
                                            {lineItem.quantity || 1} × ${(lineItem.price || lineItem.unitPrice || 0).toFixed(2)}
                                          </p>
                                          {lineItem.discount && lineItem.discount > 0 && (
                                            <p className="text-sm text-gray-600">Discount -${(lineItem.discount || 0).toFixed(2)}</p>
                                          )}
                                          {lineItem.customAdjustment && lineItem.customAdjustment !== 0 && (
                                            <p className="text-sm text-gray-600">Custom ({lineItem.customAdjustment > 0 ? '+' : ''}${Math.abs(lineItem.customAdjustment || 0).toFixed(2)})</p>
                                          )}
                                          {lineItem.tax && lineItem.tax > 0 && (
                                            <p className="text-sm text-gray-600">Item Tax ({lineItem.taxRate || 5}%) +${(lineItem.tax || 0).toFixed(2)}</p>
                                          )}
                                        </div>
                                        <div className="text-right">
                                          <span className="font-semibold text-base text-gray-900">${((lineItem.quantity || 1) * (lineItem.price || lineItem.unitPrice || 0)).toFixed(2)}</span>
                                        </div>
                                      </div>
                                      {lineItem.subtotal !== undefined && (
                                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                                          <span className="text-gray-600">Item Subtotal:</span>
                                          <span className="font-medium text-gray-900">${(lineItem.subtotal || 0).toFixed(2)}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}

                                  {/* Divider */}
                                  <div className="border-t-2 border-gray-300 my-4"></div>

                                  {/* Totals Section - Right Aligned */}
                                  <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Subtotal:</span>
                                      <span className="font-medium text-gray-900">${(item.subtotal || item.total || 0).toFixed(2)}</span>
                                    </div>
                                    {item.discount && item.discount > 0 && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Discount:</span>
                                        <span className="font-medium text-gray-900">-${(item.discount || 0).toFixed(2)}</span>
                                      </div>
                                    )}
                                    {item.tax && item.tax > 0 && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax:</span>
                                        <span className="font-medium text-gray-900">${(item.tax || 0).toFixed(2)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-gray-200">
                                      <span className="text-gray-900">Total Amount:</span>
                                      <span className="text-primary">${(item.total || 0).toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Payment Card (1 column) */}
            <div className="lg:col-span-1">

              <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-6 md:p-8 h-fit sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Payment
                </h2>
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Invoice ID</p>
                    <p className="text-base font-medium text-gray-900">{job.sourceId || 'N/A'}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Status</p>
                    <Badge className={cn("w-full text-center py-2.5 text-sm font-medium", statusColors[job.paymentStatus || 'unpaid'])}>
                      {job.paymentStatus || 'Unpaid'}
                    </Badge>
                  </div>
                  <div className="border-t border-gray-200 pt-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Method</p>
                    <p className="text-base font-medium text-gray-900">Credit Card</p>
                  </div>
                </div>
              </div>
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

      {/* Reschedule Job Modal */}
      {job && (
        <RescheduleJobModal
          isOpen={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          job={{
            id: job.id,
            title: job.title,
            customer: job.customerName,
            address: job.location,
            date: job.date,
            time: job.time,
            assignedEmployee: job.technicianName,
            assignedEmployeeId: job.technicianId
          }}
          onReschedule={(updatedJob) => {
            console.log('Rescheduled job:', updatedJob);
            setShowRescheduleModal(false);
            toast.success('Job rescheduled successfully');
          }}
        />
      )}
    </div>
  );
};

export default JobDetails;

