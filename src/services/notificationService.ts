// Notification service for managing payment notifications

export type NotificationSourceType = "invoice" | "estimate" | "agreement";

export interface Notification {
  id: string;
  type: "payment";
  message: string;
  sourceType: NotificationSourceType;
  sourceId: string;
  createdAt: string; // ISO date string
  isRead: boolean;
}

const STORAGE_KEY = "notifications";

/**
 * Get all notifications from storage
 */
export function getNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Notification[];
  } catch (error) {
    console.error("Error reading notifications:", error);
    return [];
  }
}

/**
 * Save notifications to storage
 */
function saveNotifications(notifications: Notification[]): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error("Error saving notifications:", error);
  }
}

/**
 * Create a new payment notification
 */
export function createPaymentNotification(
  sourceType: NotificationSourceType,
  sourceId: string
): Notification {
  const documentTypeMap = {
    invoice: "Invoice",
    estimate: "Estimate",
    agreement: "Agreement",
  };

  const notification: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: "payment",
    message: `Payment received against ${documentTypeMap[sourceType]} ${sourceId}`,
    sourceType,
    sourceId,
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  const notifications = getNotifications();
  notifications.unshift(notification); // Add to beginning
  saveNotifications(notifications);

  // Dispatch custom event to notify other components
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("notificationCreated", { detail: notification }));
  }

  return notification;
}

/**
 * Get unread notification count
 */
export function getUnreadCount(): number {
  const notifications = getNotifications();
  return notifications.filter((n) => !n.isRead).length;
}

/**
 * Mark a notification as read
 */
export function markNotificationRead(notificationId: string): void {
  const notifications = getNotifications();
  const notification = notifications.find((n) => n.id === notificationId);
  if (notification) {
    notification.isRead = true;
    saveNotifications(notifications);
    
    // Dispatch custom event to notify other components
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notificationUpdated"));
    }
  }
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsRead(): void {
  const notifications = getNotifications();
  notifications.forEach((n) => {
    n.isRead = true;
  });
  saveNotifications(notifications);
  
  // Dispatch custom event to notify other components
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("notificationUpdated"));
  }
}

/**
 * Delete a notification
 */
export function deleteNotification(notificationId: string): void {
  const notifications = getNotifications();
  const filtered = notifications.filter((n) => n.id !== notificationId);
  saveNotifications(filtered);
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): void {
  saveNotifications([]);
}

