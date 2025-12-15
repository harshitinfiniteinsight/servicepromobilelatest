import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, Briefcase, Loader2, Bell, Settings, DollarSign, FileText, Handshake } from "lucide-react";
import { 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  type Notification 
} from "@/services/notificationService";
import { convertToJob } from "@/services/jobConversionService";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [convertingJobId, setConvertingJobId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Refresh notifications when panel opens
      setNotifications(getNotifications());
    }
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      markNotificationRead(notification.id);
      // Refresh notifications list
      const updated = getNotifications();
      setNotifications(updated);
    }
  };

  const handleConvertToJob = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Prevent multiple clicks
    if (convertingJobId === notification.id) {
      return;
    }

    setConvertingJobId(notification.id);

    try {
      // Convert document to job
      const result = convertToJob(
        notification.sourceType as "invoice" | "estimate" | "agreement",
        notification.sourceId
      );

      if (!result.success) {
        toast.error(result.error || "Failed to convert to job");
        setConvertingJobId(null);
        return;
      }

      // Mark notification as read
      if (!notification.isRead) {
        markNotificationRead(notification.id);
      }

      // Show success toast
      const documentTypeMap = {
        invoice: "Invoice",
        estimate: "Estimate",
        agreement: "Agreement",
      };
      const documentType = documentTypeMap[notification.sourceType as keyof typeof documentTypeMap] || notification.sourceType;
      toast.success(`Job created successfully from ${documentType} ${notification.sourceId}`);

      // Refresh notifications
      const updated = getNotifications();
      setNotifications(updated);

      // Close panel
      onClose();

      // Navigate to jobs dashboard
      navigate("/jobs");
    } catch (error) {
      console.error("Error converting to job:", error);
      toast.error("An error occurred while converting to job");
      setConvertingJobId(null);
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setNotifications(getNotifications());
  };

  const handleViewAll = () => {
    onClose();
    // Navigate to a notifications page if it exists, otherwise just close
    // For now, we'll just close since there may not be a dedicated notifications page
    toast.info("View all notifications feature coming soon");
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const getNotificationIcon = (notification: Notification) => {
    if (notification.type === "payment") {
      return DollarSign;
    }
    // Add more icon types as needed
    return Bell;
  };

  const getNotificationIconColor = (notification: Notification) => {
    if (notification.type === "payment") {
      return "bg-green-100 text-green-600";
    }
    return "bg-blue-100 text-blue-600";
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 bottom-0 z-50 flex flex-col bg-white transition-transform duration-300 ease-in-out",
      isOpen ? "translate-y-0" : "-translate-y-full"
    )}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between" style={{ paddingTop: "calc(3rem + env(safe-area-inset-top))" }}>
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors touch-target"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No notifications</p>
            <p className="text-xs text-gray-500 text-center">You're all caught up!</p>
          </div>
        ) : (
          <div className="px-4 py-3 space-y-3">
            {notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification);
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "bg-white rounded-xl p-4 cursor-pointer transition-all shadow-sm border border-gray-100",
                    "hover:shadow-md active:scale-[0.98]",
                    notification.isRead ? "" : "ring-2 ring-orange-100"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                      getNotificationIconColor(notification)
                    )}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-semibold mb-1",
                        notification.isRead ? "text-gray-700" : "text-gray-900"
                      )}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                      {notification.type === "payment" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => handleConvertToJob(notification, e)}
                          disabled={convertingJobId === notification.id}
                          className="h-7 px-3 text-xs border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 disabled:opacity-50"
                        >
                          {convertingJobId === notification.id ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                              Converting...
                            </>
                          ) : (
                            <>
                              <Briefcase className="h-3 w-3 mr-1.5" />
                              Convert to Job
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="bg-white border-t border-gray-200 px-4 py-3" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-10 text-sm"
              onClick={handleMarkAllRead}
              disabled={notifications.every(n => n.isRead)}
            >
              Mark all as read
            </Button>
            <Button
              className="flex-1 h-10 text-sm"
              onClick={handleViewAll}
            >
              View all notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;

