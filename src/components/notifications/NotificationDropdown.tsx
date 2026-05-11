import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type Notification,
} from "@/services/notificationService";
import { handleNotificationAction } from "@/utils/notificationActions";
import NotificationItem from "./NotificationItem";

interface NotificationDropdownProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onNotificationsChange: () => void;
}

const NotificationDropdown = ({
  notifications,
  isOpen,
  onClose,
  onNotificationsChange,
}: NotificationDropdownProps) => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click/tap
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle, true);
    document.addEventListener("touchstart", handle, true);
    return () => {
      document.removeEventListener("mousedown", handle, true);
      document.removeEventListener("touchstart", handle, true);
    };
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [isOpen, onClose]);

  const handleNotificationClick = (n: Notification) => {
    handleNotificationAction(n, navigate);
    onNotificationsChange();
    onClose();
  };

  const handleSeeAll = () => {
    onClose();
    navigate("/notifications");
  };

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute right-0 top-full mt-2 w-[320px] max-w-[calc(100vw-32px)]",
        "bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[200]",
        "animate-in fade-in-0 zoom-in-95 duration-150"
      )}
      style={{ transformOrigin: "top right" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
        {notifications.some((n) => !n.isRead) && (
          <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
            {notifications.filter((n) => !n.isRead).length} unread
          </span>
        )}
      </div>

      {/* Notification list */}
      <div className="divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Bell className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No recent notifications</p>
            <p className="text-xs text-gray-400 text-center">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onClick={handleNotificationClick}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <button
        onClick={handleSeeAll}
        className="w-full flex items-center justify-center gap-1.5 px-4 py-3 border-t border-gray-100 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
      >
        See All Notifications
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default NotificationDropdown;
