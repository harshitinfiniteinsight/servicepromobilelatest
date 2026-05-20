import { markNotificationRead, type Notification } from "@/services/notificationService";

type NavigateFn = (to: string) => void;

const extractByRegex = (text: string, regex: RegExp): string | null => {
  const match = text.match(regex);
  return match?.[0] ?? null;
};

export function resolveNotificationRoute(notification: Notification): string {
  const sourceText = `${notification.title} ${notification.message}`;

  switch (notification.module) {
    case "Estimate": {
      const estimateId =
        notification.sourceType === "estimate"
          ? notification.sourceId
          : extractByRegex(sourceText, /EST-\d+/i);
      return estimateId ? `/estimates/${estimateId.toUpperCase()}` : "/estimates";
    }

    case "Invoice": {
      const invoiceId =
        notification.sourceType === "invoice"
          ? notification.sourceId
          : extractByRegex(sourceText, /INV-\d+/i);
      return invoiceId ? `/invoices/${invoiceId.toUpperCase()}` : "/invoices";
    }

    case "Job": {
      const jobId = extractByRegex(sourceText, /JOB-\d+/i);
      return jobId ? `/jobs/${jobId.toUpperCase()}` : "/jobs";
    }

    case "Appointment": {
      const appointmentId = extractByRegex(sourceText, /APT-\d+/i);
      return appointmentId ? `/appointments/${appointmentId.toUpperCase()}` : "/appointments/manage";
    }

    case "Employee": {
      const numericEmployeeId = extractByRegex(sourceText, /\b\d+\b/);
      const employeeId = notification.sourceId || numericEmployeeId || "1";
      return `/employees/${employeeId}`;
    }

    case "Inventory": {
      const itemId = extractByRegex(sourceText, /INV-ITEM-\d+/i);
      return itemId ? `/inventory/${itemId.toUpperCase()}` : "/inventory/INV-ITEM-001";
    }

    case "Agreement": {
      const agreementId =
        notification.sourceType === "agreement"
          ? notification.sourceId
          : extractByRegex(sourceText, /AGR-\d+/i);
      return agreementId ? `/agreements/${agreementId.toUpperCase()}` : "/agreements";
    }

    case "Reports":
      return notification.actionPath || "/reports";

    case "Settings":
      return notification.actionPath || "/settings/change-password";

    default:
      return notification.actionPath || "/notifications";
  }
}

export function handleNotificationAction(notification: Notification, navigate: NavigateFn): string {
  if (!notification.isRead) {
    markNotificationRead(notification.id);
  }

  const route = resolveNotificationRoute(notification);
  navigate(route);
  return route;
}
