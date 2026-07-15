import { useState, useEffect, useMemo, useCallback } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import {
  ChevronDown,
  Search,
  Bell,
  Briefcase,
  FileText,
  TrendingUp,
  ClipboardList,
  Calendar,
  Users,
  Package,
  UserCog,
  BellRing,
  X,
} from "lucide-react";
import { showSuccessToast } from "@/utils/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type Channel = "push" | "inApp" | "email";

interface NotificationEvent {
  id: string;
  title: string;
  channels: Channel[];
}

interface NotificationCategory {
  id: string;
  title: string;
  colorBg: string;
  colorText: string;
  Icon: React.ElementType;
  events: NotificationEvent[];
}

type EventSettingsMap = Record<string, Record<Channel, boolean>>;

// ─── Static configuration ─────────────────────────────────────────────────────

const CATEGORIES: NotificationCategory[] = [
  {
    id: "jobs",
    title: "Jobs",
    colorBg: "bg-orange-100",
    colorText: "text-orange-600",
    Icon: Briefcase,
    events: [
      { id: "job_status_changed", title: "Job Status Changed", channels: ["push", "inApp"] },
      { id: "job_rescheduled", title: "Job Rescheduled", channels: ["push", "inApp", "email"] },
      { id: "job_invoice_associated", title: "New Invoice Associated to Job", channels: ["push", "inApp"] },
      { id: "job_file_uploaded", title: "Job File Uploaded", channels: ["push", "inApp"] },
    ],
  },
  {
    id: "invoices",
    title: "Invoices",
    colorBg: "bg-green-100",
    colorText: "text-green-600",
    Icon: FileText,
    events: [
      { id: "invoice_created", title: "Invoice Created", channels: ["push", "inApp"] },
      { id: "payment_received", title: "Payment Received", channels: ["push", "inApp", "email"] },
      { id: "refund_initiated", title: "Refund Initiated", channels: ["push", "inApp", "email"] },
      { id: "recurring_completed", title: "Recurring Invoice Completed", channels: ["push", "inApp"] },
      { id: "invoice_to_job", title: "Invoice Converted to Job", channels: ["push", "inApp"] },
    ],
  },
  {
    id: "estimates",
    title: "Estimates",
    colorBg: "bg-blue-100",
    colorText: "text-blue-600",
    Icon: TrendingUp,
    events: [
      { id: "estimate_created", title: "Estimate Created", channels: ["push", "inApp"] },
      { id: "estimate_updated", title: "Estimate Updated", channels: ["push", "inApp"] },
      { id: "estimate_to_job", title: "Estimate Converted to Job", channels: ["push", "inApp"] },
      { id: "estimate_to_invoice", title: "Estimate Converted to Invoice", channels: ["push", "inApp"] },
    ],
  },
  {
    id: "agreements",
    title: "Agreements",
    colorBg: "bg-teal-100",
    colorText: "text-teal-600",
    Icon: ClipboardList,
    events: [
      { id: "agreement_created", title: "Agreement Created", channels: ["push", "inApp"] },
      { id: "agreement_updated", title: "Agreement Updated", channels: ["push", "inApp"] },
      { id: "agreement_to_invoice", title: "Agreement Converted to Invoice", channels: ["push", "inApp"] },
    ],
  },
  {
    id: "appointments",
    title: "Appointments",
    colorBg: "bg-purple-100",
    colorText: "text-purple-600",
    Icon: Calendar,
    events: [
      { id: "appt_assigned", title: "Appointment Assigned", channels: ["push", "inApp"] },
      { id: "appt_created", title: "Appointment Created", channels: ["push", "inApp"] },
      { id: "appt_reminder", title: "Appointment Reminder", channels: ["push", "inApp"] },
      { id: "appt_scheduled", title: "Date & Time Scheduled", channels: ["push", "inApp"] },
    ],
  },
  {
    id: "customers",
    title: "Customers",
    colorBg: "bg-pink-100",
    colorText: "text-pink-600",
    Icon: Users,
    events: [
      { id: "customer_created", title: "New Customer Created", channels: ["push", "inApp"] },
      { id: "customer_deactivated", title: "Customer Deactivated", channels: ["push", "inApp"] },
    ],
  },
  {
    id: "inventory",
    title: "Inventory",
    colorBg: "bg-yellow-100",
    colorText: "text-yellow-700",
    Icon: Package,
    events: [
      { id: "inventory_added", title: "New Inventory Added", channels: ["push", "inApp"] },
      { id: "stock_adjusted", title: "Stock Adjusted", channels: ["push", "inApp"] },
      { id: "low_stock_alert", title: "Low Stock Alert", channels: ["push", "inApp", "email"] },
      { id: "equipment_assigned", title: "Equipment Assigned", channels: ["push", "inApp"] },
    ],
  },
  {
    id: "employees",
    title: "Employees",
    colorBg: "bg-indigo-100",
    colorText: "text-indigo-600",
    Icon: UserCog,
    events: [
      { id: "employee_created", title: "New Employee Added", channels: ["push", "inApp"] },
      { id: "employee_deactivated", title: "Employee Deactivated", channels: ["push", "inApp"] },
    ],
  },
  {
    id: "system",
    title: "System & Security",
    colorBg: "bg-gray-100",
    colorText: "text-gray-600",
    Icon: BellRing,
    events: [
      { id: "password_changed", title: "Password Changed", channels: ["push", "inApp", "email"] },
      { id: "card_reader_configured", title: "Card Reader Configured", channels: ["push", "inApp"] },
      { id: "permissions_updated", title: "Permissions Updated", channels: ["push", "inApp"] },
    ],
  },
];

const STORAGE_KEY = "sp911_notification_settings_v1";

function buildDefaults(): EventSettingsMap {
  const map: EventSettingsMap = {};
  CATEGORIES.forEach((cat) => {
    cat.events.forEach((ev) => {
      map[ev.id] = {
        push: ev.channels.includes("push"),
        inApp: ev.channels.includes("inApp"),
        email: false,
      };
    });
  });
  return map;
}

function loadSettings(): EventSettingsMap {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as EventSettingsMap;
      return { ...buildDefaults(), ...parsed };
    }
  } catch {
    // ignore parse errors
  }
  return buildDefaults();
}

// ─── Channel header meta ───────────────────────────────────────────────────────

const CHANNEL_META: { key: Channel; label: string }[] = [
  { key: "push", label: "Push" },
  { key: "inApp", label: "In-App" },
  { key: "email", label: "Email" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const NotificationSettings = () => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(CATEGORIES.map((c) => c.id))
  );
  const [settings, setSettings] = useState<EventSettingsMap>(loadSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const toggleSection = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateChannel = useCallback(
    (eventId: string, channel: Channel, value: boolean) => {
      setSettings((prev) => ({
        ...prev,
        [eventId]: { ...prev[eventId], [channel]: value },
      }));
    },
    []
  );

  const isCategoryEnabled = useCallback(
    (cat: NotificationCategory) =>
      cat.events.some((ev) => {
        const s = settings[ev.id];
        return s && (s.push || s.inApp || s.email);
      }),
    [settings]
  );

  const countCategoryEnabled = useCallback(
    (cat: NotificationCategory) => {
      let count = 0;
      cat.events.forEach((ev) => {
        const s = settings[ev.id];
        if (s && (s.push || s.inApp || s.email)) count++;
      });
      return count;
    },
    [settings]
  );

  const globalEnabled = useMemo(
    () => CATEGORIES.some((c) => isCategoryEnabled(c)),
    [isCategoryEnabled]
  );

  const toggleGlobal = (enable: boolean) => {
    setSettings((prev) => {
      const next = { ...prev };
      CATEGORIES.forEach((cat) => {
        cat.events.forEach((ev) => {
          next[ev.id] = {
            push: enable,
            inApp: enable,
            email: enable ? (prev[ev.id]?.email ?? false) : false,
          };
        });
      });
      return next;
    });
    showSuccessToast(enable ? "All notifications enabled" : "All notifications disabled");
  };

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.map((cat) => ({
      ...cat,
      events: cat.events.filter((ev) => ev.title.toLowerCase().includes(q)),
    })).filter(
      (cat) => cat.events.length > 0 || cat.title.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      <MobileHeader title="Notification Settings" showBack={true} />

      {/* Sticky header with search + global toggle */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white">
        {/* Search bar */}
        <div className="px-4 py-2.5 relative">
          <Search className="absolute left-6.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-8.5 pr-8 bg-gray-100 border-0 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-1 -m-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Global toggle row */}
        <div className="px-4 py-2 flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">All Notifications</span>
          </div>
          <button
            onClick={() => toggleGlobal(!globalEnabled)}
            className={`relative h-6 w-10 rounded-full transition-colors ${
              globalEnabled ? "bg-orange-500" : "bg-gray-300"
            }`}
            aria-label="Toggle all notifications"
          >
            <div
              className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                globalEnabled ? "translate-x-4.5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollable">
        <div className="pt-1 pb-6">
          {filteredCategories.length > 0 ? (
            <div className="space-y-px">
              {filteredCategories.map((cat) => {
                const isOpen = expanded.has(cat.id);
                const catEnabled = isCategoryEnabled(cat);
                const catCount = countCategoryEnabled(cat);
                const CatIcon = cat.Icon;

                return (
                  <div key={cat.id}>
                    {/* Category header row */}
                    <button
                      onClick={() => toggleSection(cat.id)}
                      className="w-full px-4 py-2.5 flex items-center gap-3 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100"
                      aria-expanded={isOpen}
                    >
                      <div className={`p-2 rounded-lg flex-shrink-0 ${cat.colorBg}`}>
                        <CatIcon className={`h-4 w-4 ${cat.colorText}`} />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-semibold text-gray-900">{cat.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {catCount} of {cat.events.length} enabled
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {catEnabled && (
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                        )}
                        <ChevronDown
                          className={`h-4 w-4 text-gray-400 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Event list - expanded */}
                    {isOpen && (
                      <div className="bg-gray-50 border-b border-gray-100">
                        {cat.events.map((ev, evIdx) => {
                          const evS = settings[ev.id] ?? {
                            push: false,
                            inApp: false,
                            email: false,
                          };

                          return (
                            <div
                              key={ev.id}
                              className={`px-4 py-3 flex items-center justify-between ${
                                evIdx < cat.events.length - 1
                                  ? "border-b border-gray-200"
                                  : ""
                              }`}
                            >
                              <div className="flex-1 min-w-0 pr-3">
                                <p className="text-sm text-gray-700 leading-snug">
                                  {ev.title}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                {CHANNEL_META.map(({ key, label }) => {
                                  const isActive = evS[key];
                                  return (
                                    <label
                                      key={key}
                                      className="flex items-center gap-1.5 cursor-pointer group"
                                    >
                                      <div className={`h-4 w-4 rounded-full flex items-center justify-center border-2 transition-all ${
                                        isActive
                                          ? "bg-orange-500 border-orange-500"
                                          : "bg-white border-gray-300 group-hover:border-orange-400"
                                      }`}>
                                        {isActive && (
                                          <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 16 16" fill="none">
                                            <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        )}
                                      </div>
                                      <span className={`text-xs font-medium transition-colors ${
                                        isActive 
                                          ? "text-gray-900" 
                                          : "text-gray-600 group-hover:text-gray-900"
                                      }`}>
                                        {label}
                                      </span>
                                      <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(e) =>
                                          updateChannel(ev.id, key, e.target.checked)
                                        }
                                        className="hidden"
                                      />
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="p-4 rounded-full bg-gray-100 mb-4">
                <Bell className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-500">No results found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
              <button
                onClick={() => setSearch("")}
                className="mt-4 text-xs font-semibold text-orange-500 active:opacity-70"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
