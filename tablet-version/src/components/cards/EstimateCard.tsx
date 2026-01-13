import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
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
}

const EstimateCard = ({ estimate, onClick, payButton, actionButtons }: EstimateCardProps) => {
  const statusLabel = estimate.status === "Open" ? "Unpaid" : estimate.status;
  const isPaid = statusLabel === "Paid";

  return (
    <div
      className="p-3 rounded-lg border border-gray-200 bg-white active:scale-[0.98] transition-all duration-200 cursor-pointer hover:shadow-md hover:border-primary/30"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-semibold text-sm">{estimate.id}</span>
            <Badge className={cn("text-[10px] px-1.5 py-0.5", statusColors[estimate.status])}>
              {statusLabel}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">{estimate.customerName}</p>
        </div>
        <div className="text-right flex items-center gap-1.5 flex-shrink-0 ml-2">
          <div
            className={cn(
              "text-lg font-bold whitespace-nowrap",
              isPaid && "text-success"
            )}
          >
            ${estimate.amount.toLocaleString()}
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
          <span className="truncate">Created: {new Date(estimate.date).toLocaleDateString()}</span>
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

export default EstimateCard;


