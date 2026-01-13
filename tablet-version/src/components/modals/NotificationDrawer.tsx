import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Briefcase, Loader2 } from "lucide-react";
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

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDrawer = ({ isOpen, onClose }: NotificationDrawerProps) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [convertingJobId, setConvertingJobId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Refresh notifications when drawer opens
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

      // Close drawer
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

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden [&>div]:p-0 [&>button]:hidden">
        <DialogTitle className="sr-only">Notifications</DialogTitle>
        <DialogDescription className="sr-only">Notification center</DialogDescription>
        
        {/* Header */}
        <div className="bg-orange-500 px-4 py-3 flex items-center justify-between safe-top">
          <h2 className="text-base sm:text-lg font-semibold text-white">Notifications</h2>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.isRead) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-white hover:bg-orange-600 h-8 px-2 text-xs"
              >
                Mark all read
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 -mr-1.5 rounded-full hover:bg-orange-600 transition-colors touch-target"
              aria-label="Close"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white flex-1 overflow-y-auto safe-bottom">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">No notifications</p>
              <p className="text-xs text-gray-500 text-center">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "px-4 py-3 cursor-pointer transition-colors",
                    notification.isRead ? "bg-white" : "bg-orange-50/30"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex-shrink-0 w-2 h-2 rounded-full mt-2",
                      notification.isRead ? "bg-transparent" : "bg-orange-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium mb-1",
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
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDrawer;
