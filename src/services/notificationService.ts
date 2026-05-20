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
const SEED_KEY = "notifications_seeded_v3";

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
  const existing = getNotifications();
  // Always seed if no notifications exist, even if seed key is set
  if (existing.length > 0) return;

  const now = Date.now();
  const mins = (m: number) => new Date(now - m * 60 * 1000).toISOString();

  // P0 priority notifications only (from CSV: Notifications - SPS - Updated)
  const mocks: Notification[] = [
    // ── Estimate P0 ──────────────────────────────────────────────────────────
    {
      id: "notif-seed-1",
      module: "Estimate",
      iconType: "estimate",
      title: "Estimate Created Successfully",
      message: "Estimate #EST-001 has been created for John Smith by Mike Torres",
      action: "View Estimate",
      actionPath: "/estimates/EST-001",
      createdAt: mins(3),
      isRead: false,
      sourceType: "estimate",
      sourceId: "EST-001",
    },
    {
      id: "notif-seed-2",
      module: "Estimate",
      iconType: "estimate",
      title: "Estimate Converted to Job",
      message: "Estimate #EST-002 converted into Job #JOB-001",
      action: "View Job Details",
      actionPath: "/jobs/JOB-001",
      createdAt: mins(10),
      isRead: false,
      sourceType: "estimate",
      sourceId: "EST-002",
    },
    {
      id: "notif-seed-3",
      module: "Estimate",
      iconType: "estimate",
      title: "Estimate Converted to Invoice",
      message: "Estimate #EST-003 converted into Invoice #INV-001 upon payment",
      action: "View Invoice",
      actionPath: "/invoices/INV-001",
      createdAt: mins(20),
      isRead: false,
      sourceType: "estimate",
      sourceId: "EST-003",
    },
    {
      id: "notif-seed-4",
      module: "Estimate",
      iconType: "job",
      title: "New Job Assigned",
      message: "You have been assigned to Job #JOB-002 for Sarah Johnson",
      action: "View Job",
      actionPath: "/jobs/JOB-002",
      createdAt: mins(30),
      isRead: false,
    },
    {
      id: "notif-seed-5",
      module: "Estimate",
      iconType: "estimate",
      title: "Estimate Assigned to Existing Job",
      message: "Estimate #EST-004 assigned to Job #JOB-003",
      action: "View Job",
      actionPath: "/jobs/JOB-003",
      createdAt: mins(45),
      isRead: true,
      sourceType: "estimate",
      sourceId: "EST-004",
    },
    {
      id: "notif-seed-6",
      module: "Estimate",
      iconType: "estimate",
      title: "Estimate Updated",
      message: "Estimate #EST-001 updated by Mike Torres",
      action: "View Estimate",
      actionPath: "/estimates/EST-001",
      createdAt: mins(55),
      isRead: true,
      sourceType: "estimate",
      sourceId: "EST-001",
    },
    // ── Invoice P0 ───────────────────────────────────────────────────────────
    {
      id: "notif-seed-7",
      module: "Invoice",
      iconType: "invoice",
      title: "Invoice Created Successfully",
      message: "Invoice #INV-002 created for Sarah Johnson",
      action: "View Invoice",
      actionPath: "/invoices/INV-002",
      createdAt: mins(65),
      isRead: false,
      sourceType: "invoice",
      sourceId: "INV-002",
    },
    {
      id: "notif-seed-8",
      module: "Invoice",
      iconType: "invoice",
      title: "Recurring Invoice Completed",
      message: "Recurring invoice #INV-003 has ended",
      action: "View Details",
      actionPath: "/invoices/INV-003",
      createdAt: mins(80),
      isRead: false,
      sourceType: "invoice",
      sourceId: "INV-003",
    },
    {
      id: "notif-seed-9",
      module: "Invoice",
      iconType: "payment",
      title: "Payment Successful",
      message: "Payment received for Invoice #INV-001",
      action: "View Receipt",
      actionPath: "/invoices/INV-001",
      createdAt: mins(90),
      isRead: false,
      sourceType: "invoice",
      sourceId: "INV-001",
    },
    {
      id: "notif-seed-10",
      module: "Invoice",
      iconType: "invoice",
      title: "Invoice Converted to Job",
      message: "Invoice #INV-002 converted into Job #JOB-004",
      action: "View Job",
      actionPath: "/jobs/JOB-004",
      createdAt: mins(110),
      isRead: true,
      sourceType: "invoice",
      sourceId: "INV-002",
    },
    {
      id: "notif-seed-11",
      module: "Invoice",
      iconType: "payment",
      title: "Refund Initiated",
      message: "Refund of $150.00 initiated for Invoice #INV-001",
      action: "View Invoice",
      actionPath: "/invoices/INV-001",
      createdAt: mins(130),
      isRead: true,
      sourceType: "invoice",
      sourceId: "INV-001",
    },
    // ── Agreement P0 ─────────────────────────────────────────────────────────
    {
      id: "notif-seed-12",
      module: "Agreement",
      iconType: "agreement",
      title: "Agreement Created Successfully",
      message: "Agreement #AGR-001 created for John Smith",
      action: "View Agreement",
      actionPath: "/agreements/AGR-001",
      createdAt: mins(150),
      isRead: false,
      sourceType: "agreement",
      sourceId: "AGR-001",
    },
    {
      id: "notif-seed-13",
      module: "Agreement",
      iconType: "agreement",
      title: "Agreement Updated",
      message: "Agreement #AGR-001 updated by Mike Torres",
      action: "View Agreement",
      actionPath: "/agreements/AGR-001",
      createdAt: mins(165),
      isRead: true,
      sourceType: "agreement",
      sourceId: "AGR-001",
    },
    {
      id: "notif-seed-14",
      module: "Agreement",
      iconType: "payment",
      title: "Agreement Converted to Invoice",
      message: "Agreement #AGR-002 converted into Invoice #INV-004 upon payment",
      action: "View Invoice",
      actionPath: "/invoices/INV-004",
      createdAt: mins(180),
      isRead: true,
      sourceType: "agreement",
      sourceId: "AGR-002",
    },
    // ── Job P0 ───────────────────────────────────────────────────────────────
    {
      id: "notif-seed-15",
      module: "Job",
      iconType: "job",
      title: "Job File Uploaded",
      message: "File uploaded for Job #JOB-001",
      action: "View Uploads",
      actionPath: "/jobs/JOB-001",
      createdAt: mins(200),
      isRead: false,
    },
    {
      id: "notif-seed-16",
      module: "Job",
      iconType: "invoice",
      title: "New Invoice Associated To Job",
      message: "New invoice associated to Job #JOB-002",
      action: "View Invoice",
      actionPath: "/jobs/JOB-002",
      createdAt: mins(220),
      isRead: false,
    },
    {
      id: "notif-seed-17",
      module: "Job",
      iconType: "job",
      title: "Job Rescheduled",
      message: "Job #JOB-001 rescheduled to May 20 at 10:00 AM",
      action: "View Schedule",
      actionPath: "/jobs/JOB-001",
      createdAt: mins(240),
      isRead: true,
    },
    {
      id: "notif-seed-18",
      module: "Job",
      iconType: "job",
      title: "Job Status Changed",
      message: "Job status changed to In Progress for Job #JOB-003",
      action: "View Job Details",
      actionPath: "/jobs/JOB-003",
      createdAt: mins(260),
      isRead: true,
    },
    // ── Appointment P0 ───────────────────────────────────────────────────────
    {
      id: "notif-seed-19",
      module: "Appointment",
      iconType: "appointment",
      title: "Appointment Assigned",
      message: "You have been assigned Appointment #APT-001",
      action: "View Appointment",
      actionPath: "/appointments/manage",
      createdAt: mins(280),
      isRead: false,
    },
    // ── Inventory P0 ─────────────────────────────────────────────────────────
    {
      id: "notif-seed-20",
      module: "Inventory",
      iconType: "inventory",
      title: "New Inventory Added",
      message: "Power Drill has been added to the inventory list",
      action: "View Inventory",
      actionPath: "/inventory",
      createdAt: mins(300),
      isRead: false,
    },
    {
      id: "notif-seed-21",
      module: "Inventory",
      iconType: "inventory",
      title: "Stock Adjusted Successfully",
      message: "Stock updated for Power Drill",
      action: "View Inventory",
      actionPath: "/inventory/INV-ITEM-001",
      createdAt: mins(330),
      isRead: true,
    },
    {
      id: "notif-seed-22",
      module: "Inventory",
      iconType: "inventory",
      title: "Equipment Assigned",
      message: "Equipment Cordless Drill assigned to Mike Torres",
      action: "View Equipment",
      actionPath: "/inventory/INV-ITEM-002",
      createdAt: mins(360),
      isRead: true,
    },
    // ── Settings P0 ──────────────────────────────────────────────────────────
    {
      id: "notif-seed-23",
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
      id: "notif-seed-24",
      module: "Settings",
      iconType: "settings",
      title: "Card Reader Configured",
      message: "Card reader configured successfully",
      action: "Test Reader",
      actionPath: "/settings/configure-card-reader",
      createdAt: mins(430),
      isRead: true,
    },
  ];

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

export function markAllNotificationsUnread(): void {
  const notifications = getNotifications();
  notifications.forEach((n) => { n.isRead = false; });
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
