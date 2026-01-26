import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";

interface InvoiceCardProps {
  invoice: {
    id: string;
    customerId: string;
    customerName: string;
    issueDate: string;
    dueDate: string;
    amount: number;
    status: string;
    paymentMethod: string;
    type?: "single" | "recurring" | "deactivated";
    source?: "sell_product" | "manual" | "estimate" | "agreement";
  };
  onClick?: () => void;
  payButton?: ReactNode;
  actionButtons?: ReactNode;
  className?: string;
  jobId?: string;
}

const InvoiceCard = ({ invoice, onClick, payButton, actionButtons, className, jobId }: InvoiceCardProps) => {
  const statusLabel = invoice.status === "Open" ? "Unpaid" : invoice.status;
  const isOverdue = statusLabel === "Overdue";
  const isPaid = statusLabel === "Paid";

  return (
    <div
      className={cn(
        "px-3 py-2 rounded-lg border border-gray-200 bg-white active:scale-[0.98] transition-all duration-200 cursor-pointer hover:shadow-md hover:border-primary/30",
        className
      )}
      onClick={onClick}
    >
      {/* Row 1: Invoice ID + Status | Amount + Pay */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-sm">{invoice.id}</span>
          <Badge className={cn("text-[10px] px-1.5 py-0 h-4 leading-4", statusColors[invoice.status])}>
            {statusLabel}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className={cn(
              "text-base font-bold whitespace-nowrap",
              isPaid && "text-success",
              isOverdue && "text-destructive"
            )}
          >
            ${invoice.amount.toLocaleString()}
          </span>
          {payButton && (
            <div onClick={(e) => e.stopPropagation()}>
              {payButton}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Customer Name | Job ID */}
      <div className="flex items-center justify-between gap-2 mt-1">
        <p className="text-xs text-muted-foreground truncate flex-1">{invoice.customerName}</p>
        {jobId && (
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 leading-4 bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0">
            <Briefcase className="h-2.5 w-2.5 mr-0.5" />
            {jobId}
          </Badge>
        )}
      </div>

      {/* Row 3: Due Date | Menu */}
      <div className="flex items-center justify-between mt-1.5">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
        </div>
        {actionButtons && (
          <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0 -mr-1">
            {actionButtons}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceCard;


