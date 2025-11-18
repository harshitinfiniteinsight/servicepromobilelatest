import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Edit, Eye, Share2, XCircle, CheckCircle, ArrowRight, MessageSquare, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";

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
  customerEmail?: string;
  customerPhone?: string;
  hasFeedback?: boolean;
  isEmployee?: boolean;
  onClick?: () => void;
  onStatusChange?: (newStatus: string) => void;
  onSendFeedbackForm?: () => void;
  onViewFeedback?: () => void;
  onQuickAction?: (action: string) => void;
}

const JobCard = ({ 
  job, 
  customerEmail,
  customerPhone,
  hasFeedback = false,
  isEmployee = false,
  onClick, 
  onStatusChange,
  onSendFeedbackForm,
  onViewFeedback,
  onQuickAction 
}: JobCardProps) => {
  const techInitials = job.technicianName.split(" ").map(n => n[0]).join("");

  // Get status badge colors for employee dropdown
  const getStatusBadgeColor = (status: string) => {
    if (status === "Scheduled") {
      return "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200";
    } else if (status === "In Progress") {
      return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200";
    } else if (status === "Completed") {
      return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200";
    }
    return statusColors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  // Build menu items based on job status
  const buildMenuItems = (): KebabMenuItem[] => {
    const items: KebabMenuItem[] = [];
    
    // Status change options (for merchants only - employees use dropdown)
    if (!isEmployee) {
      if (job.status === "Scheduled" && onStatusChange) {
        items.push({
          label: "Change Status",
          icon: ArrowRight,
          action: () => onStatusChange("In Progress"),
          separator: false,
        });
      } else if (job.status === "In Progress" && onStatusChange) {
        items.push({
          label: "Change Status",
          icon: CheckCircle,
          action: () => onStatusChange("Completed"),
          separator: false,
        });
      }
    }
    
    // Feedback options (for Completed jobs only)
    if (job.status === "Completed") {
      if (hasFeedback) {
        // Show "View Feedback" if feedback exists
        if (onViewFeedback) {
          items.push({
            label: "View Feedback",
            icon: MessageSquare,
            action: () => onViewFeedback(),
            separator: false,
          });
        }
      } else {
        // Show "Send Feedback Form" if no feedback exists
        if (onSendFeedbackForm) {
          items.push({
            label: "Send Feedback Form",
            icon: FileText,
            action: () => onSendFeedbackForm(),
            separator: false,
          });
        }
      }
    }
    
    // Standard actions (always available)
    if (onQuickAction) {
      // Add separator before standard actions if there are any status/feedback items above
      const hasStatusOrFeedbackItems = 
        (!isEmployee && (
          (job.status === "Scheduled" && onStatusChange) ||
          (job.status === "In Progress" && onStatusChange)
        )) ||
        (job.status === "Completed" && (hasFeedback ? onViewFeedback : onSendFeedbackForm));
      
      items.push(
        {
          label: "View Details",
          icon: Eye,
          action: () => onQuickAction("view"),
          separator: hasStatusOrFeedbackItems,
        },
        {
          label: "Edit Job",
          icon: Edit,
          action: () => onQuickAction("edit"),
          separator: false,
        },
        {
          label: "Share",
          icon: Share2,
          action: () => onQuickAction("share"),
          separator: false,
        },
        {
          label: "Cancel Job",
          icon: XCircle,
          action: () => onQuickAction("cancel"),
          variant: "destructive",
          separator: false,
        }
      );
    }
    
    return items;
  };

  return (
    <div
      className="p-4 rounded-xl border border-gray-200 bg-white active:scale-[0.98] transition-all duration-200 hover:shadow-md hover:border-primary/30"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 cursor-pointer" onClick={onClick}>
          <h3 className="font-semibold mb-1">{job.title}</h3>
          <p className="text-sm text-muted-foreground">{job.customerName}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Status Badge or Dropdown */}
          {isEmployee && onStatusChange ? (
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
                    "h-auto py-1 px-2.5 text-xs font-medium whitespace-nowrap border rounded-full",
                    "focus:ring-0 focus:ring-offset-0 shadow-none",
                    "cursor-pointer transition-colors",
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
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Badge className={cn("text-xs whitespace-nowrap cursor-pointer", statusColors[job.status])}>
              {job.status}
            </Badge>
          )}
          {(onQuickAction || onStatusChange || onSendFeedbackForm || onViewFeedback) && (
            <div onClick={(e) => e.stopPropagation()}>
              <KebabMenu
                items={buildMenuItems()}
                menuWidth="w-48"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer" onClick={onClick}>
          <Calendar className="h-3 w-3" />
          <span>{new Date(job.date).toLocaleDateString()}</span>
          <Clock className="h-3 w-3 ml-2" />
          <span>{job.time}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer" onClick={onClick}>
          <MapPin className="h-3 w-3" />
          <span className="truncate">{job.location}</span>
        </div>
        
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 cursor-pointer" onClick={onClick}>
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="text-xs font-bold text-primary">{techInitials}</span>
          </div>
          <span className="text-sm text-muted-foreground">{job.technicianName}</span>
        </div>
      </div>
    </div>
  );
};

export default JobCard;


