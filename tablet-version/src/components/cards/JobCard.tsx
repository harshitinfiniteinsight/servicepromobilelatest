import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Edit, Eye, Share2, FileText, MessageSquare, UserCog, MapPin, Image as ImageIcon, RefreshCw, CreditCard, Link } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Source document type for jobs
type SourceDocumentType = "invoice" | "estimate" | "agreement" | null;

interface JobCardProps {
  job: {
    id: string;
    title: string;
    customerName: string;
    technicianName: string;
    date: string;
    time: string;
    status: string;
    location: string;
    images?: string[];
    sourceType?: SourceDocumentType;
    customerId?: string;
  };
  jobType?: "Agreement" | "Estimate" | "Invoice";
  paymentStatus?: "Paid" | "Open";
  customerEmail?: string;
  customerPhone?: string;
  hasFeedback?: boolean;
  isEmployee?: boolean;
  hasPictures?: boolean;
  onClick?: () => void;
  onStatusChange?: (jobId: string, newStatus: string) => void;
  onSendFeedbackForm?: () => void;
  onViewFeedback?: () => void;
  onQuickAction?: (action: string) => void;
  onPreview?: (documentId: string, jobType: "Agreement" | "Estimate" | "Invoice") => void;
  onReassignEmployee?: () => void;
  onReschedule?: () => void;
  onAddPictures?: () => void;
  onViewPictures?: () => void;
  onPay?: () => void;
  onAssociate?: (documentType: "Invoice" | "Estimate" | "Agreement") => void;
  // Additional props used in Jobs.tsx
  index?: number;
  showAnimation?: boolean;
  userRole?: "merchant" | "employee";
  onSendFeedback?: () => void;
  onFillFeedback?: () => void;
  previewEstimate?: () => void;
  previewInvoice?: () => void;
  previewAgreement?: () => void;
  onEdit?: () => void;
  onReassign?: () => void;
}

const JobCard = ({ 
  job, 
  jobType,
  paymentStatus,
  customerEmail,
  customerPhone,
  hasFeedback = false,
  isEmployee = false,
  hasPictures = false,
  onClick, 
  onStatusChange,
  onSendFeedbackForm,
  onViewFeedback,
  onQuickAction,
  onPreview,
  onReassignEmployee,
  onReschedule,
  onAddPictures,
  onViewPictures,
  onPay,
  onAssociate,
  // Additional props from Jobs.tsx
  index,
  showAnimation,
  userRole,
  onSendFeedback,
  onFillFeedback,
  previewEstimate,
  previewInvoice,
  previewAgreement,
  onEdit,
  onReassign
}: JobCardProps) => {
  const navigate = useNavigate();
  
  // Derive isEmployee from userRole prop if provided
  const effectiveIsEmployee = isEmployee || userRole === "employee";
  
  const techInitials = job.technicianName.split(" ").map(n => n[0]).join("");

  // Derive payment status from job if not provided
  const effectivePaymentStatus = paymentStatus || (() => {
    // Check completed/feedback received status means paid
    if (job.status === "Completed" || job.status === "Feedback Received") {
      return "Paid";
    }
    return "Open";
  })();
  
  // Derive source type from job ID if not provided
  const effectiveSourceType: SourceDocumentType = job.sourceType || (() => {
    const id = job.id.toUpperCase();
    if (id.startsWith("INV")) return "invoice";
    if (id.startsWith("EST")) return "estimate";
    if (id.startsWith("AG") || id.includes("AGR")) return "agreement";
    return null;
  })();

  // Derive document ID display format (INV-001, EST-001, AGR-001)
  const getDocumentIdDisplay = () => {
    // If jobType is provided, use it to determine the prefix
    if (jobType) {
      const id = job.id.toUpperCase();
      const numPart = id.replace(/[^0-9]/g, "").slice(-3).padStart(3, "0");
      if (jobType === "Agreement") return `AGR-${numPart}`;
      if (jobType === "Estimate") return `EST-${numPart}`;
      if (jobType === "Invoice") return `INV-${numPart}`;
    }
    
    // Otherwise, derive from job ID
    const id = job.id.toUpperCase();
    if (id.startsWith("AG") || id.includes("AGR")) {
      const numPart = id.replace(/[^0-9]/g, "").slice(-3).padStart(3, "0");
      return `AGR-${numPart}`;
    } else if (id.startsWith("EST")) {
      const numPart = id.replace(/[^0-9]/g, "").slice(-3).padStart(3, "0");
      return `EST-${numPart}`;
    } else if (id.startsWith("INV")) {
      const numPart = id.replace(/[^0-9]/g, "").slice(-3).padStart(3, "0");
      return `INV-${numPart}`;
    } else if (id.startsWith("JOB")) {
      // For generic jobs, derive from jobType if available
      const numPart = id.replace(/[^0-9]/g, "").slice(-3).padStart(3, "0");
      if (jobType === "Agreement") return `AGR-${numPart}`;
      if (jobType === "Estimate") return `EST-${numPart}`;
      if (jobType === "Invoice") return `INV-${numPart}`;
      return `JOB-${numPart}`;
    }
    return id;
  };

  // Get status badge colors for employee dropdown
  const getStatusBadgeColor = (status: string) => {
    if (status === "Scheduled") {
      return "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200";
    } else if (status === "In Progress") {
      return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200";
    } else if (status === "Completed") {
      return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200";
    } else if (status === "Cancel") {
      return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
    }
    return statusColors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  // Handle preview - navigate to Job Details page
  const handlePreview = () => {
    // For demo/prototype, always navigate to Job Details
    // This does NOT depend on invoice/estimate/agreement lookup
    navigate(`/jobs/${job.id}`);
  };

  // Open Google Maps with job address
  const openGoogleMaps = (address: string) => {
    if (!address || address.trim() === "") {
      toast.error("Location unavailable");
      return;
    }

    // URL encode the address
    const encodedAddress = encodeURIComponent(address.trim());
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

    // Open in new tab/window
    try {
      window.open(googleMapsUrl, "_blank");
    } catch (error) {
      console.error("Failed to open Google Maps:", error);
      toast.error("Failed to open map");
    }
  };

  // Build menu items for three-dot menu based on job status
  const buildMenuItems = (): KebabMenuItem[] => {
    const items: KebabMenuItem[] = [];
    
    // Get global feedback auto-send setting
    // feedbackSettingsEnabled = false means auto-send is OFF (show manual send option)
    // feedbackSettingsEnabled = true means auto-send is ON (don't show manual send option)
    const feedbackSettingsEnabled = typeof window !== "undefined" 
      ? localStorage.getItem("autoSendFeedback") === "true" 
      : false;
    
    const jobStatus = job.status;
    const isUnpaid = effectivePaymentStatus === "Open";
    const sourceType = effectiveSourceType;
    const hasImages = hasPictures || (job.images && job.images.length > 0);
    
    // Helper to get source document label
    const getSourceLabel = (type: SourceDocumentType): string => {
      if (type === "invoice") return "Invoice";
      if (type === "estimate") return "Estimate";
      if (type === "agreement") return "Agreement";
      return "";
    };
    
    // Helper to handle preview - navigate to Job Details page
    const handlePreviewAction = () => {
      // For demo/prototype, always navigate to Job Details
      handlePreview();
    };
    
    // Helper to handle edit based on available props
    const handleEditAction = () => {
      if (onEdit) {
        onEdit();
      } else if (onQuickAction) {
        onQuickAction("edit");
      }
    };
    
    // =========================================================
    // TABLET VIEW - UNPAID JOBS MENU (New Requirements)
    // =========================================================
    // This applies to tablet view for unpaid jobs only
    // Order: Preview, Reschedule Job, Show on Map, Upload Pictures,
    //        View Pictures (if exists), Edit {Source}, Pay, Associate {Source}
    // =========================================================
    
    if (isUnpaid) {
      // 1. Preview - always first
      items.push({
        label: "Preview",
        icon: Eye,
        action: handlePreviewAction,
        separator: false,
      });
      
      // 2. Reschedule Job
      if (onReschedule) {
        items.push({
          label: "Reschedule Job",
          icon: RefreshCw,
          action: () => onReschedule(),
          separator: false,
        });
      }
      
      // 3. Show on Map
      items.push({
        label: "Show on Map",
        icon: MapPin,
        action: () => openGoogleMaps(job.location),
        separator: false,
      });
      
      // 4. Upload Pictures - always show
      if (onAddPictures) {
        items.push({
          label: "Upload Pictures",
          icon: ImageIcon,
          action: () => onAddPictures(),
          separator: false,
        });
      }
      
      // 5. View Pictures - only if pictures exist
      if (hasImages && onViewPictures) {
        items.push({
          label: "View Pictures",
          icon: ImageIcon,
          action: () => onViewPictures(),
          separator: false,
        });
      }
      
      // 6. Edit {Source Document} - only if source type exists and user is not employee
      if (sourceType && !effectiveIsEmployee && (onEdit || onQuickAction)) {
        const sourceLabel = getSourceLabel(sourceType);
        items.push({
          label: `Edit ${sourceLabel}`,
          icon: Edit,
          action: handleEditAction,
          separator: false,
        });
      }
      
      // 7. Pay
      if (onPay) {
        items.push({
          label: "Pay",
          icon: CreditCard,
          action: () => onPay(),
          separator: false,
        });
      }
      
      // 8. Associate {Source Document}
      if (onAssociate) {
        if (sourceType) {
          // If job has a source type, show only that associate option
          const sourceLabel = getSourceLabel(sourceType);
          items.push({
            label: `Associate ${sourceLabel}`,
            icon: Link,
            action: () => onAssociate(sourceLabel as "Invoice" | "Estimate" | "Agreement"),
            separator: false,
          });
        } else {
          // If no source type, show all three associate options
          items.push({
            label: "Associate Invoice",
            icon: Link,
            action: () => onAssociate("Invoice"),
            separator: false,
          });
          items.push({
            label: "Associate Estimate",
            icon: Link,
            action: () => onAssociate("Estimate"),
            separator: false,
          });
          items.push({
            label: "Associate Agreement",
            icon: Link,
            action: () => onAssociate("Agreement"),
            separator: false,
          });
        }
      }
      
      return items;
    }
    
    // =========================================================
    // TABLET VIEW - PAID JOBS MENU (New Requirements)
    // =========================================================
    // This applies to tablet view for paid jobs only
    // Order: Preview, Show on Map, Upload Pictures,
    //        Associate New {Source Document}, Associate {Source Document}
    // =========================================================
    
    if (!isUnpaid && effectivePaymentStatus === "Paid") {
      // 1. Preview - always first
      items.push({
        label: "Preview",
        icon: Eye,
        action: handlePreviewAction,
        separator: false,
      });
      
      // 2. Show on Map
      items.push({
        label: "Show on Map",
        icon: MapPin,
        action: () => openGoogleMaps(job.location),
        separator: false,
      });
      
      // 3. Upload Pictures - always show
      if (onAddPictures) {
        items.push({
          label: "Upload Pictures",
          icon: ImageIcon,
          action: () => onAddPictures(),
          separator: false,
        });
      }
      
      // 4 & 5. Associate New and Associate - Dynamic based on sourceType
      if (onAssociate) {
        if (sourceType) {
          // If job has a source type, show specific "Associate New {Source}" and "Associate {Source}"
          const sourceLabel = getSourceLabel(sourceType);
          
          // 4. Associate New {Source Document}
          items.push({
            label: `Associate New ${sourceLabel}`,
            icon: Link,
            action: () => {
              toast.info(`Creating and associating new ${sourceLabel}`);
              // The actual implementation would show a modal or navigate to create form
            },
            separator: false,
          });
          
          // 5. Associate {Source Document}
          items.push({
            label: `Associate ${sourceLabel}`,
            icon: Link,
            action: () => onAssociate(sourceLabel as "Invoice" | "Estimate" | "Agreement"),
            separator: false,
          });
        } else {
          // If no source type, show only the combined "Associate New" option
          // 4. Associate New Invoice / Estimate / Agreement - single combined option
          items.push({
            label: "Associate New Invoice / Estimate / Agreement",
            icon: Link,
            action: () => {
              toast.info("Select document type to create and associate");
              // The actual implementation would show a submenu or modal
            },
            separator: false,
          });
          // No specific "Associate {Source}" option when sourceType is null
        }
      }
      
      return items;
    }
    
    // =========================================================
    // PAID JOBS / OTHER STATUSES - Original behavior
    // =========================================================
    
    // Status-based menu logic
    if (jobStatus === "Scheduled") {
      // Scheduled: Preview, Edit, Reassign Employee, Share, Show on Map, Add Pictures, View Pictures (if exists)
      
      // Preview - always first
      items.push({
        label: "Preview",
        icon: Eye,
        action: handlePreview,
        separator: false,
      });
      
      // Edit - only if payment status is Open AND user is NOT an employee
      if (effectivePaymentStatus === "Open" && onQuickAction && !effectiveIsEmployee) {
        items.push({
          label: "Edit",
          icon: Edit,
          action: () => onQuickAction("edit"),
          separator: false,
        });
      }
      
      // Reschedule Job - for merchants and employees
      if (onReschedule) {
        items.push({
          label: "Reschedule Job",
          icon: RefreshCw,
          action: () => onReschedule(),
          separator: false,
        });
      }

      // Reassign Employee - only for merchant
      if (!effectiveIsEmployee && (onReassignEmployee || onReassign)) {
        items.push({
          label: "Reassign Employee",
          icon: UserCog,
          action: () => (onReassignEmployee || onReassign)?.(),
          separator: false,
        });
      }
      
      // Share
      if (onQuickAction) {
        items.push({
          label: "Share",
          icon: Share2,
          action: () => onQuickAction("share"),
          separator: false,
        });
      }
      
      // Show on Map
      items.push({
        label: "Show on Map",
        icon: MapPin,
        action: () => openGoogleMaps(job.location),
        separator: false,
      });
      
      // Add Pictures
      if (onAddPictures) {
        items.push({
          label: "Add Pictures",
          icon: ImageIcon,
          action: () => onAddPictures(),
          separator: false,
        });
      }
      
      // View Pictures - only if pictures exist
      if (hasPictures && onViewPictures) {
        items.push({
          label: "View Pictures",
          icon: ImageIcon,
          action: () => onViewPictures(),
          separator: false,
        });
      }
      
    } else if (jobStatus === "In Progress") {
      // In Progress: Preview, Share, Show on Map, Add Pictures, View Pictures (if exists)
      
      // Preview
      items.push({
        label: "Preview",
        icon: Eye,
        action: handlePreview,
        separator: false,
      });
      
      // Reschedule Job - for merchants and employees
      if (onReschedule) {
        items.push({
          label: "Reschedule Job",
          icon: RefreshCw,
          action: () => onReschedule(),
          separator: false,
        });
      }

      // Share
      if (onQuickAction) {
        items.push({
          label: "Share",
          icon: Share2,
          action: () => onQuickAction("share"),
          separator: false,
        });
      }
      
      // Show on Map
      items.push({
        label: "Show on Map",
        icon: MapPin,
        action: () => openGoogleMaps(job.location),
        separator: false,
      });
      
      // Add Pictures
      if (onAddPictures) {
        items.push({
          label: "Add Pictures",
          icon: ImageIcon,
          action: () => onAddPictures(),
          separator: false,
        });
      }
      
      // View Pictures - only if pictures exist
      if (hasPictures && onViewPictures) {
        items.push({
          label: "View Pictures",
          icon: ImageIcon,
          action: () => onViewPictures(),
          separator: false,
        });
      }
      
    } else if (jobStatus === "Completed") {
      // Completed: Preview, Share, Show on Map, Add Pictures, View Pictures (if exists), Send Feedback Form (if feedback settings OFF)
      
      // Preview
      items.push({
        label: "Preview",
        icon: Eye,
        action: handlePreview,
        separator: false,
      });
      
      // Share
      if (onQuickAction) {
        items.push({
          label: "Share",
          icon: Share2,
          action: () => onQuickAction("share"),
          separator: false,
        });
      }
      
      // Show on Map
      items.push({
        label: "Show on Map",
        icon: MapPin,
        action: () => openGoogleMaps(job.location),
        separator: false,
      });
      
      // Add Pictures
      if (onAddPictures) {
        items.push({
          label: "Add Pictures",
          icon: ImageIcon,
          action: () => onAddPictures(),
          separator: false,
        });
      }
      
      // View Pictures - only if pictures exist
      if (hasPictures && onViewPictures) {
        items.push({
          label: "View Pictures",
          icon: ImageIcon,
          action: () => onViewPictures(),
          separator: false,
        });
      }
      
      // Send Feedback Form - ONLY IF feedback settings = OFF (autoSendFeedback !== "true")
      // This means feedbackSettingsEnabled = false
      if (!feedbackSettingsEnabled && onSendFeedbackForm) {
        items.push({
          label: "Send Feedback Form",
          icon: FileText,
          action: () => onSendFeedbackForm(),
          separator: false,
        });
      }
      
    } else if (jobStatus === "Cancel" || jobStatus === "Canceled") {
      // Cancel/Canceled: Preview only
      
      // Preview - only option
      items.push({
        label: "Preview",
        icon: Eye,
        action: handlePreview,
        separator: false,
      });
      
    } else {
      // Fallback for any other status: Show Preview at minimum
      items.push({
        label: "Preview",
        icon: Eye,
        action: handlePreview,
        separator: false,
      });
    }
    
    return items;
  };

  const menuItems = buildMenuItems();

  return (
    <div
      className="p-3 tablet:p-2.5 rounded-xl border border-gray-200 bg-white active:scale-[0.98] transition-all duration-200 hover:shadow-md hover:border-primary/30"
    >
      {/* Row 1: Job ID, Date, Status - Tablet optimized horizontal layout */}
      <div className="flex items-center justify-between mb-2 tablet:mb-1.5">
        <div className="flex items-center gap-2 tablet:gap-3 flex-1 min-w-0">
          {/* Job ID */}
          <span className="text-xs tablet:text-[11px] font-medium text-muted-foreground">{getDocumentIdDisplay()}</span>
          {/* Date */}
          <div className="hidden tablet:flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="text-[11px]">{new Date(job.date).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Status + Menu */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Status Dropdown */}
          {onStatusChange ? (
            <div onClick={(e) => e.stopPropagation()} className="relative">
              <Select
                value={job.status}
                onValueChange={(value) => {
                  if (value !== job.status) {
                    onStatusChange(value);
                  }
                }}
              >
                <SelectTrigger
                  className={cn(
                    "h-auto py-0.5 px-2 text-xs tablet:text-[11px] font-medium whitespace-nowrap border rounded-full",
                    "focus:ring-0 focus:ring-offset-0 shadow-none",
                    "cursor-pointer transition-colors w-auto min-w-[90px] tablet:min-w-[85px]",
                    getStatusBadgeColor(job.status)
                  )}
                >
                  <SelectValue className="text-xs tablet:text-[11px]">{job.status}</SelectValue>
                </SelectTrigger>
                <SelectContent 
                  className="rounded-xl border border-gray-200 bg-white shadow-lg min-w-[120px]"
                  align="end"
                  sideOffset={4}
                >
                  <SelectItem value="Scheduled" className="text-xs">Scheduled</SelectItem>
                  <SelectItem value="In Progress" className="text-xs">In Progress</SelectItem>
                  <SelectItem value="Completed" className="text-xs">Completed</SelectItem>
                  <SelectItem value="Cancel" className="text-xs">Cancel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Badge className={cn("text-xs tablet:text-[11px] whitespace-nowrap cursor-pointer", statusColors[job.status])}>
              {job.status}
            </Badge>
          )}
          {/* Three-dot Menu */}
          {menuItems.length > 0 && (
            <div onClick={(e) => e.stopPropagation()}>
              <KebabMenu
                items={menuItems}
                menuWidth="w-48"
              />
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Customer Name, Employee, Job Type - Tablet optimized */}
      <div className="cursor-pointer" onClick={onClick}>
        <div className="flex items-center justify-between gap-2">
          {/* Customer Name - Primary */}
          <h3 className="font-semibold text-base tablet:text-sm flex-1 min-w-0 truncate">{job.customerName}</h3>
          
          {/* Right side: Employee + Badges */}
          <div className="flex items-center gap-2 tablet:gap-2.5 flex-shrink-0">
            {/* Employee - Show on tablet */}
            <div className="hidden tablet:flex items-center gap-1">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-[9px] font-bold text-primary">{techInitials}</span>
              </div>
              <span className="text-[11px] text-muted-foreground max-w-[100px] truncate">{job.technicianName}</span>
            </div>
            
            {/* Badges */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {paymentStatus && (
                <Badge 
                  className={cn(
                    "text-[10px] px-1.5 py-0 h-4 rounded-full whitespace-nowrap",
                    paymentStatus === "Paid" 
                      ? "bg-green-100 text-green-700 border-green-200" 
                      : "bg-orange-100 text-orange-700 border-orange-200"
                  )}
                >
                  {paymentStatus}
                </Badge>
              )}
              {jobType && (
                <Badge 
                  variant="outline" 
                  className="text-[10px] px-1.5 py-0 h-4 rounded-full border-muted-foreground/30 bg-muted/30 whitespace-nowrap"
                >
                  {jobType}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile: Date + Employee (shown below on mobile only) */}
        <div className="flex tablet:hidden items-center justify-between pt-1.5 mt-1.5 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span>{new Date(job.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="text-[10px] font-bold text-primary">{techInitials}</span>
            </div>
            <span className="text-xs text-muted-foreground">{job.technicianName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;


