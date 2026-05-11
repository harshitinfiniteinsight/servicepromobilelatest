// Notification service for managing all app notifications

export type NotificationModule =
  | "Estimate"
  | "Invoice"
  | "Job"
  | "Appointment"
  | "Employee"
  | "Inventory"
  | "Agreement"
  | "Reports"
  | "Settings";

export type NotificationIconType =
  | "estimate"
  | "invoice"
  | "job"
  | "appointment"
  | "employee"
  | "inventory"
  | "agreement"
  | "report"
  | "settings"
  | "payment";

export interface Notification {
  id: string;
  module: NotificationModule;
  iconType: NotificationIconType;
  title: string;
  message: string;
  action?: string;
  actionPath?: string;
  createdAt: string;
  isRead: boolean;
  // Legacy support
  type?: string;
  sourceType?: "invoice" | "estimate" | "agreement";
  sourceId?: string;
}

const STORAGE_KEY = "notifications";
const SEED_KEY = "notifications_seeded_v2";

export function getNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Notification[];
  } catch {
    return [];
  }
}

function saveNotifications(notifications: Notification[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {}
}

export function seedMockNotifications(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEED_KEY)) return;

  const now = Date.now();
  const mins = (m: number) => new Date(now - m * 60 * 1000).toISOString();

  const mocks: Notification[] = [
    {
      id: "notif-seed-1",
      module: "Invoice",
      iconType: "payment",
      title: "Payment Successful",
      message: "Payment received for Invoice #INV-001",
      action: "View Receipt",
      actionPath: "/invoices/INV-001",
      createdAt: mins(3),
      isRead: false,
      sourceType: "invoice",
      sourceId: "INV-001",
    },
    {
      id: "notif-seed-2",
      module: "Estimate",
      iconType: "estimate",
      title: "Estimate Created Successfully",
      message: "Estimate #EST-001 has been created for John Smith",
      action: "View Estimate",
      actionPath: "/estimates/EST-001",
      createdAt: mins(12),
      isRead: false,
      sourceType: "estimate",
      sourceId: "EST-001",
    },
    {
      id: "notif-seed-3",
      module: "Inventory",
      iconType: "inventory",
      title: "Stock Adjusted Successfully",
      message: "Stock updated for INV-ITEM-001",
      action: "View Inventory",
      actionPath: "/inventory/INV-ITEM-001",
      createdAt: mins(25),
      isRead: false,
    },
    {
      id: "notif-seed-4",
      module: "Job",
      iconType: "job",
      title: "Job Rescheduled",
      message: "Job #JOB-001 rescheduled to May 12 at 10:00 AM",
      action: "View Schedule",
      actionPath: "/jobs/JOB-001",
      createdAt: mins(60),
      isRead: true,
    },
    {
      id: "notif-seed-5",
      module: "Appointment",
      iconType: "appointment",
      title: "Appointment Created Successfully",
      message: "Appointment #APT-001 created for John Smith",
      action: "View Appointment",
      actionPath: "/appointments/APT-001",
      createdAt: mins(90),
      isRead: false,
    },
    {
      id: "notif-seed-6",
      module: "Employee",
      iconType: "employee",
      title: "Employee Created Successfully",
      message: "Employee 1 created successfully",
      action: "View Employee",
      actionPath: "/employees/1",
      createdAt: mins(120),
      isRead: true,
      sourceId: "1",
    },
    {
      id: "notif-seed-7",
      module: "Invoice",
      iconType: "invoice",
      title: "Invoice Created Successfully",
      message: "Invoice #INV-002 created for Sarah Johnson",
      action: "View Invoice",
      actionPath: "/invoices/INV-002",
      createdAt: mins(150),
      isRead: false,
      sourceType: "invoice",
      sourceId: "INV-002",
    },
    {
      id: "notif-seed-8",
      module: "Agreement",
      iconType: "agreement",
      title: "Agreement Created Successfully",
      message: "Agreement #AGR-001 created for John Smith",
      action: "View Agreement",
      actionPath: "/agreements/AGR-001",
      createdAt: mins(200),
      isRead: true,
      sourceType: "agreement",
      sourceId: "AGR-001",
    },
    {
      id: "notif-seed-9",
      module: "Reports",
      iconType: "report",
      title: "Report Exported",
      message: "Invoice report exported successfully",
      action: "Download Report",
      actionPath: "/reports/invoice",
      createdAt: mins(300),
      isRead: true,
    },
    {
      id: "notif-seed-10",
      module: "Settings",
      iconType: "settings",
      title: "Password Changed Successfully",
      message: "Password updated successfully for Mike Torres",
      action: "Login Again",
      actionPath: "/signin",
      createdAt: mins(400),
      isRead: true,
    },
    {
      id: "notif-seed-11",
      module: "Estimate",
      iconType: "estimate",
      title: "Estimate Converted to Job",
      message: "Estimate #EST-001 converted into Job #JOB-002",
      action: "View Job",
      actionPath: "/jobs/JOB-002",
      createdAt: mins(500),
      isRead: true,
      sourceType: "estimate",
      sourceId: "EST-001",
    },
    {
      id: "notif-seed-12",
      module: "Inventory",
      iconType: "inventory",
      title: "Equipment Assigned",
      message: "Equipment INV-ITEM-002 assigned to employee",
      action: "View Equipment",
      actionPath: "/inventory/INV-ITEM-002",
      createdAt: mins(600),
      isRead: true,
    },
  ];

  const existing = getNotifications();
  const existingIds = new Set(existing.map((n) => n.id));
  const toAdd = mocks.filter((m) => !existingIds.has(m.id));
  saveNotifications([...toAdd, ...existing]);
  localStorage.setItem(SEED_KEY, "true");
}

export function createNotification(
  notification: Omit<Notification, "id" | "createdAt" | "isRead">
): Notification {
  const newNotif: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    isRead: false,
  };
  const notifications = getNotifications();
  notifications.unshift(newNotif);
  saveNotifications(notifications);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("notificationCreated", { detail: newNotif }));
  }
  return newNotif;
}

export function createPaymentNotification(
  sourceType: "invoice" | "estimate" | "agreement",
  sourceId: string
): Notification {
  const moduleMap: Record<string, NotificationModule> = {
    invoice: "Invoice",
    estimate: "Estimate",
    agreement: "Agreement",
  };
  const pathMap: Record<string, string> = {
    invoice: `/invoices/${sourceId}`,
    estimate: `/estimates/${sourceId}`,
    agreement: `/agreements/${sourceId}`,
  };
  return createNotification({
    module: moduleMap[sourceType] as NotificationModule,
    iconType: "payment",
    title: "Payment Successful",
    message: `Payment received against ${moduleMap[sourceType]} ${sourceId}`,
    action: "View Receipt",
    actionPath: pathMap[sourceType],
    type: "payment",
    sourceType,
    sourceId,
  });
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.isRead).length;
}

export function markNotificationRead(notificationId: string): void {
  const notifications = getNotifications();
  const notification = notifications.find((n) => n.id === notificationId);
  if (notification) {
    notification.isRead = true;
    saveNotifications(notifications);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notificationUpdated"));
    }
  }
}

export function markAllNotificationsRead(): void {
  const notifications = getNotifications();
  notifications.forEach((n) => { n.isRead = true; });
  saveNotifications(notifications);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("notificationUpdated"));
  }
}

export function deleteNotification(notificationId: string): void {
  const notifications = getNotifications().filter((n) => n.id !== notificationId);
  saveNotifications(notifications);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("notificationUpdated"));
  }
}

export function clearAllNotifications(): void {
  saveNotifications([]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("notificationUpdated"));
  }
}
