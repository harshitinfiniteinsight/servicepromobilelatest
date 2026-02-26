import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

/**
 * Global function to show success toast notifications
 * Matches iOS-style success toast with light green background and smooth animations
 * @param message - The success message to display
 */
export function showSuccessToast(message: string) {
  toast.success(message, {
    duration: 2500,
    position: "top-center",
    className: "success-toast-custom",
    style: {
      background: "#E7F8EF",
      border: "1px solid #34C759",
      color: "#0F5132",
      borderRadius: "12px",
      padding: "12px 14px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
    icon: <CheckCircle2 className="h-5 w-5" style={{ color: "#34C759" }} />,
  });
};

/**
 * Global function to show error toast notifications
 * @param message - The error message to display
 */
export function showErrorToast(message: string) {
  toast.error(message, {
    duration: 3000,
    position: "top-center",
    style: {
      background: "#FEF2F2",
      border: "1px solid #EF4444",
      color: "#991B1B",
      borderRadius: "12px",
      padding: "12px 14px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
    icon: <XCircle className="h-5 w-5" style={{ color: "#EF4444" }} />,
  });
};

