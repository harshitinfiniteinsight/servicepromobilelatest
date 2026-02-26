import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";

interface EstimateCardProps {
  estimate: {
    id: string;
    customerName: string;
    date: string;
    amount: number;
    status: string;
    probability?: number;
  };
  onClick?: () => void;
  payButton?: ReactNode;
  actionButtons?: ReactNode;
  jobId?: string;
}

const EstimateCard = ({ estimate, onClick, payButton, actionButtons, jobId }: EstimateCardProps) => {
  const statusLabel = estimate.status === "Open" ? "Unpaid" : estimate.status;
  const isPaid = statusLabel === "Paid";

  return (
    <div
      className="px-3 py-2 rounded-lg border border-gray-200 bg-white active:scale-[0.98] transition-all duration-200 cursor-pointer hover:shadow-md hover:border-primary/30"
      onClick={onClick}
    >
      {/* Row 1: Estimate ID + Status | Amount + Pay */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-sm">{estimate.id}</span>
          <Badge className={cn("text-[10px] px-1.5 py-0 h-4 leading-4", statusColors[estimate.status])}>
            {statusLabel}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className={cn(
              "text-base font-bold whitespace-nowrap",
              isPaid && "text-success"
            )}
          >
            ${estimate.amount.toLocaleString()}
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
        <p className="text-xs text-muted-foreground truncate flex-1">{estimate.customerName}</p>
        {jobId && (
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 leading-4 bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0">
            <Briefcase className="h-2.5 w-2.5 mr-0.5" />
            {jobId}
          </Badge>
        )}
      </div>

      {/* Row 3: Created Date | Menu */}
      <div className="flex items-center justify-between mt-1.5">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span>Created: {new Date(estimate.date).toLocaleDateString()}</span>
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

export default EstimateCard;


