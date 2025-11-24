import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Edit, Eye, Share2, FileText, MessageSquare, UserCog, MapPin, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import { toast } from "sonner";

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
  };
  jobType?: "Agreement" | "Estimate" | "Invoice";
  paymentStatus?: "Paid" | "Open";
  customerEmail?: string;
  customerPhone?: string;
  hasFeedback?: boolean;
  isEmployee?: boolean;
  hasPictures?: boolean;
  onClick?: () => void;
  onStatusChange?: (newStatus: string) => void;
  onSendFeedbackForm?: () => void;
  onViewFeedback?: () => void;
  onQuickAction?: (action: string) => void;
  onPreview?: (documentId: string, jobType: "Agreement" | "Estimate" | "Invoice") => void;
  onReassignEmployee?: () => void;
  onAddPictures?: () => void;
  onViewPictures?: () => void;
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
  onAddPictures,
  onViewPictures
}: JobCardProps) => {
  const techInitials = job.technicianName.split(" ").map(n => n[0]).join("");

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
    } else if (status === "Cancelled") {
      return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
    }
    return statusColors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  // Handle preview - open modal instead of navigating
  const handlePreview = () => {
    const docIdDisplay = getDocumentIdDisplay();
    
    // Determine job type from prop or document ID format
    let determinedJobType: "Agreement" | "Estimate" | "Invoice" | undefined = jobType;
    
    if (!determinedJobType) {
      if (docIdDisplay.startsWith("AGR-")) {
        determinedJobType = "Agreement";
      } else if (docIdDisplay.startsWith("EST-")) {
        determinedJobType = "Estimate";
      } else if (docIdDisplay.startsWith("INV-")) {
        determinedJobType = "Invoice";
      }
    }
    
    // Call onPreview callback if available
    if (onPreview && determinedJobType) {
      onPreview(docIdDisplay, determinedJobType);
    } else if (onQuickAction) {
      // Fallback to onQuickAction if onPreview not available
      onQuickAction("preview");
    }
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

  // Build menu items for three-dot menu
  const buildMenuItems = (): KebabMenuItem[] => {
    const items: KebabMenuItem[] = [];
    
    // Get global feedback auto-send setting
    const feedbackAutoSendEnabled = typeof window !== "undefined" 
      ? localStorage.getItem("autoSendFeedback") === "true" 
      : false;
    
    // Preview - always visible
    items.push({
      label: "Preview",
      icon: Eye,
      action: handlePreview,
      separator: false,
    });
    
    // Edit - only if payment status is Open AND user is NOT an employee
    if (paymentStatus === "Open" && onQuickAction && !isEmployee) {
      items.push({
        label: "Edit",
        icon: Edit,
        action: () => onQuickAction("edit"),
        separator: false,
      });
    }
    
    // Reassign Employee - only for merchant, only when status is Scheduled
    if (!isEmployee && job.status === "Scheduled" && onReassignEmployee) {
      items.push({
        label: "Reassign Employee",
        icon: UserCog,
        action: () => onReassignEmployee(),
        separator: false,
      });
    }
    
    // Share - always visible
    if (onQuickAction) {
      items.push({
        label: "Share",
        icon: Share2,
        action: () => onQuickAction("share"),
        separator: false,
      });
    }
    
    // Show on Map - always visible
    items.push({
      label: "Show on Map",
      icon: MapPin,
      action: () => openGoogleMaps(job.location),
      separator: false,
    });
    
    // Add Pictures - always visible
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
    
    // Feedback menu options based on global setting and feedback existence
    if (feedbackAutoSendEnabled) {
      // Auto-send is ON: Don't show "Send Feedback Form", only show "View Feedback" if feedback exists
      if (hasFeedback && onViewFeedback) {
        items.push({
          label: "View Feedback",
          icon: MessageSquare,
          action: () => onViewFeedback(),
          separator: false,
        });
      }
    } else {
      // Auto-send is OFF: Show "Send Feedback Form" for completed jobs, and "View Feedback" if feedback exists
      if (hasFeedback && onViewFeedback) {
        items.push({
          label: "View Feedback",
          icon: MessageSquare,
          action: () => onViewFeedback(),
          separator: false,
        });
      }
      
      // Show "Send Feedback Form" for completed jobs (but not if feedback already exists)
      if (job.status === "Completed" && !hasFeedback && onSendFeedbackForm) {
        items.push({
          label: "Send Feedback Form",
          icon: FileText,
          action: () => onSendFeedbackForm(),
          separator: false,
        });
      }
    }
    
    return items;
  };

  const menuItems = buildMenuItems();

  return (
    <div
      className="p-3 rounded-xl border border-gray-200 bg-white active:scale-[0.98] transition-all duration-200 hover:shadow-md hover:border-primary/30"
    >
      {/* Row 1: Document ID + Status Dropdown + Three-dot Menu */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">{getDocumentIdDisplay()}</span>
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
                    "h-auto py-0.5 px-2 text-xs font-medium whitespace-nowrap border rounded-full",
                    "focus:ring-0 focus:ring-offset-0 shadow-none",
                    "cursor-pointer transition-colors w-auto min-w-[90px]",
                    getStatusBadgeColor(job.status)
                  )}
                >
                  <SelectValue className="text-xs">{job.status}</SelectValue>
                </SelectTrigger>
                <SelectContent 
                  className="rounded-xl border border-gray-200 bg-white shadow-lg min-w-[120px]"
                  align="end"
                  sideOffset={4}
                >
                  <SelectItem value="Scheduled" className="text-xs">Scheduled</SelectItem>
                  <SelectItem value="In Progress" className="text-xs">In Progress</SelectItem>
                  <SelectItem value="Completed" className="text-xs">Completed</SelectItem>
                  <SelectItem value="Cancelled" className="text-xs">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Badge className={cn("text-xs whitespace-nowrap cursor-pointer", statusColors[job.status])}>
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

      {/* Row 2: Customer Name + Payment Status + Job Type (right-aligned) */}
      <div className="mb-2 cursor-pointer" onClick={onClick}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-base flex-1 min-w-0">{job.customerName}</h3>
          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
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
      
      {/* Row 3: Creation Date + Employee */}
      <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 cursor-pointer" onClick={onClick}>
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
  );
};

export default JobCard;


