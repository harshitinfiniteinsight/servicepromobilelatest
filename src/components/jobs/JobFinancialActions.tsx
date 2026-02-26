import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Receipt,
  FileCheck,
  ScrollText,
  Edit,
  PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// Types for job source and payment status
export type JobSourceType = "estimate" | "invoice" | "agreement" | "none";
export type JobPaymentStatus = "paid" | "unpaid" | "partial";

export interface JobFinancialActionsProps {
  sourceType: JobSourceType;
  sourceId?: string;
  paymentStatus: JobPaymentStatus;
  onCreateInvoice?: () => void;
  onViewInvoice?: () => void;
  onCreateEstimate?: () => void;
  onViewEstimate?: () => void;
  onViewAgreement?: () => void;
  onPay?: () => void;
  // Edit handlers (for unpaid jobs with associated documents)
  onEditInvoice?: () => void;
  onEditEstimate?: () => void;
  onEditAgreement?: () => void;
  // Associate New handlers (for paid jobs to create additional documents)
  onAssociateNewInvoice?: () => void;
  onAssociateNewEstimate?: () => void;
  onAssociateNewAgreement?: () => void;
  variant?: "inline" | "menu"; // inline = buttons shown directly, menu = items for dropdown
  className?: string;
  compact?: boolean; // For mobile-friendly compact view
}

export interface FinancialAction {
  label: string;
  icon: LucideIcon;
  action: () => void;
  variant?: "default" | "primary" | "destructive";
  visible: boolean;
}

/**
 * Determine available financial actions based on job source and payment status
 * This is the core logic that can be reused across the app
 * 
 * Logic for Edit vs Associate New:
 * - UNPAID jobs: Show "Edit [Document]" to modify existing associated document
 * - PAID jobs: Show "Associate New [Document]" to create additional documents
 * - Never show both Edit and Associate New at the same time for the same document type
 */
export function getFinancialActions(
  sourceType: JobSourceType,
  paymentStatus: JobPaymentStatus,
  handlers: {
    onCreateInvoice?: () => void;
    onViewInvoice?: () => void;
    onCreateEstimate?: () => void;
    onViewEstimate?: () => void;
    onViewAgreement?: () => void;
    onPay?: () => void;
    // Edit handlers (for unpaid jobs)
    onEditInvoice?: () => void;
    onEditEstimate?: () => void;
    onEditAgreement?: () => void;
    // Associate New handlers (for paid jobs)
    onAssociateNewInvoice?: () => void;
    onAssociateNewEstimate?: () => void;
    onAssociateNewAgreement?: () => void;
  }
): FinancialAction[] {
  const actions: FinancialAction[] = [];
  const isPaid = paymentStatus === "paid";

  // Conversion-based actions
  switch (sourceType) {
    case "estimate":
      // Job was converted from an Estimate
      // Show View Estimate first
      if (handlers.onViewEstimate) {
        actions.push({
          label: "View Estimate",
          icon: FileCheck,
          action: handlers.onViewEstimate,
          variant: "default",
          visible: true,
        });
      }
      // For unpaid: Edit Estimate; For paid: Associate New Estimate
      if (!isPaid && handlers.onEditEstimate) {
        actions.push({
          label: "Edit Estimate",
          icon: Edit,
          action: handlers.onEditEstimate,
          variant: "default",
          visible: true,
        });
      } else if (isPaid && handlers.onAssociateNewEstimate) {
        actions.push({
          label: "Associate New Estimate",
          icon: PlusCircle,
          action: handlers.onAssociateNewEstimate,
          variant: "default",
          visible: true,
        });
      }
      // For unpaid: Create Invoice (if no invoice exists); For paid: Associate New Invoice
      if (!isPaid && handlers.onCreateInvoice) {
        actions.push({
          label: "Create Associated Invoice",
          icon: Receipt,
          action: handlers.onCreateInvoice,
          variant: "default",
          visible: true,
        });
      } else if (isPaid && handlers.onAssociateNewInvoice) {
        actions.push({
          label: "Associate New Invoice",
          icon: PlusCircle,
          action: handlers.onAssociateNewInvoice,
          variant: "default",
          visible: true,
        });
      }
      break;

    case "invoice":
      // Job was converted from an Invoice
      // For unpaid: Edit Invoice; For paid: Associate New Invoice
      if (!isPaid && handlers.onEditInvoice) {
        actions.push({
          label: "Edit Invoice",
          icon: Edit,
          action: handlers.onEditInvoice,
          variant: "default",
          visible: true,
        });
      } else if (isPaid && handlers.onAssociateNewInvoice) {
        actions.push({
          label: "Associate New Invoice",
          icon: PlusCircle,
          action: handlers.onAssociateNewInvoice,
          variant: "default",
          visible: true,
        });
      }
      break;

    case "agreement":
      // Job was converted from an Agreement
      if (handlers.onViewAgreement) {
        actions.push({
          label: "View Agreement",
          icon: ScrollText,
          action: handlers.onViewAgreement,
          variant: "default",
          visible: true,
        });
      }
      // For unpaid: Edit Agreement; For paid: Associate New Agreement
      if (!isPaid && handlers.onEditAgreement) {
        actions.push({
          label: "Edit Agreement",
          icon: Edit,
          action: handlers.onEditAgreement,
          variant: "default",
          visible: true,
        });
      } else if (isPaid && handlers.onAssociateNewAgreement) {
        actions.push({
          label: "Associate New Agreement",
          icon: PlusCircle,
          action: handlers.onAssociateNewAgreement,
          variant: "default",
          visible: true,
        });
      }
      // Invoice actions for agreement-sourced jobs
      if (!isPaid && handlers.onCreateInvoice) {
        actions.push({
          label: "Create Associated Invoice",
          icon: Receipt,
          action: handlers.onCreateInvoice,
          variant: "default",
          visible: true,
        });
      } else if (isPaid && handlers.onAssociateNewInvoice) {
        actions.push({
          label: "Associate New Invoice",
          icon: PlusCircle,
          action: handlers.onAssociateNewInvoice,
          variant: "default",
          visible: true,
        });
      }
      break;

    case "none":
    default:
      // No associated financial document - show create options
      if (handlers.onCreateInvoice) {
        actions.push({
          label: "Create Associated Invoice",
          icon: Receipt,
          action: handlers.onCreateInvoice,
          variant: "default",
          visible: true,
        });
      }
      if (handlers.onCreateEstimate) {
        actions.push({
          label: "Create Associated Estimate",
          icon: FileCheck,
          action: handlers.onCreateEstimate,
          variant: "default",
          visible: true,
        });
      }
      break;
  }

  // Payment status handling - add Pay button if not fully paid
  if (paymentStatus !== "paid" && handlers.onPay) {
    actions.push({
      label: paymentStatus === "partial" ? "Complete Payment" : "Pay",
      icon: CreditCard,
      action: handlers.onPay,
      variant: "primary",
      visible: true,
    });
  }

  return actions.filter(action => action.visible);
}

/**
 * Reusable component for displaying job financial actions
 * Can be used in job cards (inline or menu) and job detail views
 */
export function JobFinancialActions({
  sourceType,
  sourceId: _sourceId, // Reserved for future use (e.g., linking to specific documents)
  paymentStatus,
  onCreateInvoice,
  onViewInvoice,
  onCreateEstimate,
  onViewEstimate,
  onViewAgreement,
  onPay,
  variant = "inline",
  className,
  compact = false,
}: JobFinancialActionsProps) {
  const actions = getFinancialActions(sourceType, paymentStatus, {
    onCreateInvoice,
    onViewInvoice,
    onCreateEstimate,
    onViewEstimate,
    onViewAgreement,
    onPay,
  });

  if (actions.length === 0) {
    return null;
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 flex-wrap", className)}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isPrimary = action.variant === "primary";
          
          return (
            <Button
              key={index}
              variant={isPrimary ? "default" : "outline"}
              size={compact ? "sm" : "default"}
              className={cn(
                compact ? "h-8 px-2 text-xs" : "h-9 px-3",
                isPrimary && "bg-primary hover:bg-primary/90",
                !isPrimary && "border-gray-200 hover:bg-gray-50"
              )}
              onClick={(e) => {
                e.stopPropagation();
                action.action();
              }}
            >
              <Icon className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4", "mr-1.5")} />
              {action.label}
            </Button>
          );
        })}
      </div>
    );
  }

  // For menu variant, return the actions array for parent to render in dropdown
  return null;
}

/**
 * Get menu items for use in kebab/dropdown menu
 */
export function getFinancialMenuItems(
  sourceType: JobSourceType,
  paymentStatus: JobPaymentStatus,
  handlers: {
    onCreateInvoice?: () => void;
    onViewInvoice?: () => void;
    onCreateEstimate?: () => void;
    onViewEstimate?: () => void;
    onViewAgreement?: () => void;
    onPay?: () => void;
    // Edit handlers (for unpaid jobs)
    onEditInvoice?: () => void;
    onEditEstimate?: () => void;
    onEditAgreement?: () => void;
    // Associate New handlers (for paid jobs)
    onAssociateNewInvoice?: () => void;
    onAssociateNewEstimate?: () => void;
    onAssociateNewAgreement?: () => void;
  }
) {
  const actions = getFinancialActions(sourceType, paymentStatus, handlers);
  
  return actions.map(action => ({
    label: action.label,
    icon: action.icon,
    action: action.action,
    separator: action.variant === "primary", // Add separator before Pay button
  }));
}

export default JobFinancialActions;
