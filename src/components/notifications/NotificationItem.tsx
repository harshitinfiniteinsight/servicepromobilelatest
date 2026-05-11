import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Bell,
  FileText,
  DollarSign,
  Briefcase,
  Calendar,
  Users,
  Package,
  ClipboardList,
  BarChart3,
  Settings,
} from "lucide-react";
import type { Notification } from "@/services/notificationService";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  estimate: FileText,
  invoice: DollarSign,
  job: Briefcase,
  appointment: Calendar,
  employee: Users,
  inventory: Package,
  agreement: ClipboardList,
  report: BarChart3,
  settings: Settings,
  payment: DollarSign,
};

const COLOR_MAP: Record<string, string> = {
  estimate: "bg-blue-100 text-blue-600",
  invoice: "bg-green-100 text-green-600",
  job: "bg-orange-100 text-orange-600",
  appointment: "bg-purple-100 text-purple-600",
  employee: "bg-indigo-100 text-indigo-600",
  inventory: "bg-yellow-100 text-yellow-700",
  agreement: "bg-teal-100 text-teal-600",
  report: "bg-pink-100 text-pink-600",
  settings: "bg-gray-100 text-gray-600",
  payment: "bg-emerald-100 text-emerald-600",
};

interface NotificationItemProps {
  notification: Notification;
  onClick: (n: Notification) => void;
}

const NotificationItem = ({ notification, onClick }: NotificationItemProps) => {
  const iconKey = notification.iconType || "payment";
  const Icon = ICON_MAP[iconKey] || Bell;
  const colorClass = COLOR_MAP[iconKey] || "bg-gray-100 text-gray-600";
  const isUnread = !notification.isRead;

  const formatTime = (iso: string) => {
    try {
      const distance = formatDistanceToNow(new Date(iso), { addSuffix: false });
      // Shorten: "about 2 hours" → "2h", "3 minutes" → "3m"
      return distance
        .replace("about ", "")
        .replace(" hours", "h")
        .replace(" hour", "h")
        .replace(" minutes", "m")
        .replace(" minute", "m")
        .replace(" days", "d")
        .replace(" day", "d")
        .replace(" seconds", "s")
        .replace(" second", "s")
        .replace("less than am", "<1m");
    } catch {
      return "now";
    }
  };

  return (
    <button
      onClick={() => onClick(notification)}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors active:bg-gray-100",
        isUnread ? "bg-green-50 hover:bg-green-100/70" : "hover:bg-gray-50"
      )}
    >
      {/* Icon avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5",
          colorClass
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-[13px] leading-tight truncate",
              isUnread ? "font-bold text-gray-900" : "font-semibold text-gray-700"
            )}
          >
            {notification.title}
          </p>
          <span className="flex-shrink-0 text-[11px] text-gray-400 whitespace-nowrap">
            {formatTime(notification.createdAt)} ago
          </span>
        </div>
        <p className="text-[12px] text-gray-500 mt-0.5 leading-snug line-clamp-2">
          {notification.message}
        </p>
      </div>

      {/* Unread dot */}
      {isUnread && (
        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 mt-2" />
      )}
    </button>
  );
};

export default NotificationItem;
