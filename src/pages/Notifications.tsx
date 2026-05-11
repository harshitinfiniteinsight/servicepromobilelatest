import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  markAllNotificationsRead,
  deleteNotification,
  type Notification,
  type NotificationModule,
} from "@/services/notificationService";
import { handleNotificationAction } from "@/utils/notificationActions";
import {
  Bell,
  FileText,
  Briefcase,
  DollarSign,
  Calendar,
  Users,
  Package,
  ClipboardList,
  BarChart3,
  Settings,
  X,
  CheckCheck,
  Inbox,
} from "lucide-react";

// ─── Tab config ────────────────────────────────────────────────────────────────
type Tab = "All" | NotificationModule;

const TABS: Tab[] = [
  "All",
  "Estimate",
  "Invoice",
  "Job",
  "Appointment",
  "Employee",
  "Inventory",
  "Agreement",
  "Reports",
  "Settings",
];

// ─── Icon map ──────────────────────────────────────────────────────────────────
const MODULE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
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

const MODULE_COLOR: Record<string, string> = {
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

// ─── Component ─────────────────────────────────────────────────────────────────
const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const load = useCallback(() => {
    setNotifications(getNotifications());
  }, []);

  useEffect(() => {
    load();
    window.addEventListener("notificationCreated", load);
    window.addEventListener("notificationUpdated", load);
    return () => {
      window.removeEventListener("notificationCreated", load);
      window.removeEventListener("notificationUpdated", load);
    };
  }, [load]);

  // Filter by active tab
  const filtered = notifications.filter((n) => {
    if (activeTab === "All") return true;
    return n.module === activeTab;
  });

  // Unread counts per tab
  const unreadByTab = (tab: Tab) => {
    if (tab === "All") return notifications.filter((n) => !n.isRead).length;
    return notifications.filter((n) => n.module === tab && !n.isRead).length;
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    load();
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(id);
    load();
  };

  const handleAction = (n: Notification) => {
    handleNotificationAction(n, navigate);
    load();
  };

  const formatTime = (iso: string) => {
    try {
      return formatDistanceToNow(new Date(iso), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const totalUnread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      <MobileHeader
        title="Notifications"
        showBack
        actions={
          totalUnread > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-8 px-3 text-xs font-semibold border-gray-300 rounded-lg"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {/* Category Tabs */}
      <div
        className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide border-b border-gray-200 bg-white"
        style={{ paddingTop: "calc(3rem + env(safe-area-inset-top) + 0.5rem)" }}
      >
        {TABS.map((tab) => {
          const count = unreadByTab(tab);
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap",
                isActive
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {tab}
              {count > 0 && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                    isActive ? "bg-white/30 text-white" : "bg-primary/10 text-primary"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Inbox className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No notifications</p>
            <p className="text-xs text-gray-400">
              {activeTab === "All" ? "You're all caught up!" : `No ${activeTab} notifications`}
            </p>
          </div>
        ) : (
          filtered.map((n) => {
            const iconKey = n.iconType || "payment";
            const Icon = MODULE_ICON[iconKey] || Bell;
            const colorClass = MODULE_COLOR[iconKey] || "bg-gray-100 text-gray-600";
            const isUnread = !n.isRead;

            return (
              <div
                key={n.id}
                className={cn(
                  "relative flex items-start gap-3 rounded-xl p-3.5 border transition-all cursor-pointer",
                  isUnread
                    ? "bg-green-50 border-green-200 border-l-4 border-l-green-500"
                    : "bg-white border-gray-200"
                )}
                onClick={() => handleAction(n)}
              >
                {/* Module icon */}
                <div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                    colorClass
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        isUnread ? "font-bold text-gray-900" : "font-semibold text-gray-700"
                      )}
                    >
                      {n.title}
                    </p>
                    {isUnread && (
                      <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-green-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <span className="text-[11px] text-gray-400">{formatTime(n.createdAt)}</span>
                    {n.action && (
                      <button
                        className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-md transition-colors",
                          isUnread
                            ? "text-green-700 hover:bg-green-100"
                            : "text-primary hover:bg-primary/10"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(n);
                        }}
                      >
                        {n.action}
                      </button>
                    )}
                  </div>
                </div>

                {/* Dismiss button */}
                <button
                  onClick={(e) => handleDismiss(n.id, e)}
                  className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-3.5 w-3.5 text-gray-400" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
