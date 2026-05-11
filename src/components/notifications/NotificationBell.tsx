import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  getUnreadCount,
  type Notification,
} from "@/services/notificationService";
import NotificationDropdown from "./NotificationDropdown";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(() => {
    const all = getNotifications();
    setNotifications(all.slice(0, 3)); // Only 3 most recent
    setUnreadCount(getUnreadCount());
  }, []);

  useEffect(() => {
    loadNotifications();

    const handleChange = () => loadNotifications();
    window.addEventListener("notificationCreated", handleChange);
    window.addEventListener("notificationUpdated", handleChange);

    // Polling fallback for same-tab localStorage updates
    const interval = setInterval(loadNotifications, 3000);

    return () => {
      window.removeEventListener("notificationCreated", handleChange);
      window.removeEventListener("notificationUpdated", handleChange);
      clearInterval(interval);
    };
  }, [loadNotifications]);

  // Re-load when dropdown opens to ensure fresh data
  useEffect(() => {
    if (isOpen) loadNotifications();
  }, [isOpen, loadNotifications]);

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="ghost"
        className={cn(
          "h-8 w-8 p-0 shrink-0 touch-target relative transition-colors",
          isOpen && "bg-gray-100"
        )}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell
          className={cn(
            "h-4 w-4 transition-colors",
            isOpen ? "text-primary" : "text-gray-700"
          )}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      <NotificationDropdown
        notifications={notifications}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onNotificationsChange={loadNotifications}
      />
    </div>
  );
};

export default NotificationBell;
