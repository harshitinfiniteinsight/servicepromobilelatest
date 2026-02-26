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
  // Map all statuses to either Paid or Unpaid
  const statusLabel = invoice.status === "Paid" ? "Paid" : "Unpaid";
  const isPaid = statusLabel === "Paid";

  return (
    <div
      className={cn(
        "p-3 rounded-lg border border-gray-200 bg-white active:scale-[0.98] transition-all duration-200 cursor-pointer hover:shadow-md hover:border-primary/30",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-semibold text-sm">{invoice.id}</span>
            <Badge className={cn("text-[10px] px-1.5 py-0.5", statusColors[invoice.status])}>
              {statusLabel}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">{invoice.customerName}</p>
        </div>
        <div className="text-right flex items-center gap-1.5 flex-shrink-0 ml-2">
          {jobId && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 leading-4 bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0">
              <Briefcase className="h-2.5 w-2.5 mr-0.5" />
              {jobId}
            </Badge>
          )}
          <div
            className={cn(
              "text-lg font-bold whitespace-nowrap",
              isPaid && "text-success"
            )}
          >
            ${invoice.amount.toLocaleString()}
          </div>
          {payButton && (
            <div
              className="w-auto"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {payButton}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
        </div>
        {actionButtons && (
          <div
            className="flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {actionButtons}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceCard;


