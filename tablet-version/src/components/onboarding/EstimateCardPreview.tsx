import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";

interface EstimatePreview {
  id: string;
  customerName: string;
  date: string;
  amount: number;
  status: string;
}

interface EstimateCardPreviewProps {
  estimates: EstimatePreview[];
  className?: string;
}

/** Short status labels for compact card display to prevent overlap */
const compactStatus = (status: string): string => {
  if (status === "Converted to Invoice") return "Invoiced";
  if (status === "Open") return "Unpaid";
  return status;
};

const EstimateCardPreview = ({ estimates, className }: EstimateCardPreviewProps) => {
  if (!estimates.length) return null;

  return (
    <div className={cn("space-y-2.5", className)}>
      {estimates.map((est, index) => {
        const statusLabel = compactStatus(est.status);
        const isPaid = statusLabel === "Paid";

        return (
          <div
            key={est.id}
            className={cn(
              "px-3 py-2 rounded-xl border-l-4 border-l-green-500 border border-border/60",
              "bg-gradient-to-r from-white to-green-50/30 dark:from-zinc-900/90 dark:to-green-950/20",
              "backdrop-blur-xl shadow-md shadow-black/5 animate-in fade-in duration-300"
            )}
            style={{ animationDelay: `${index * 80}ms` } as React.CSSProperties}
          >
            {/* Row 1: ID and amount - fixed positions, no overlap */}
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold text-sm flex-shrink-0">{est.id}</span>
              <span
                className={cn(
                  "text-sm font-bold whitespace-nowrap flex-shrink-0",
                  isPaid && "text-green-600 dark:text-green-400"
                )}
              >
                ${est.amount.toLocaleString()}
              </span>
            </div>
            {/* Row 2: Status badge on its own line */}
            <div className="mt-1">
              <Badge
                className={cn(
                  "text-[9px] px-1.5 py-0 h-3.5 leading-none font-medium",
                  statusColors[est.status]
                )}
              >
                {statusLabel}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {est.customerName}
            </p>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
              <Calendar className="h-2.5 w-2.5 flex-shrink-0" />
              <span>Created: {new Date(est.date).toLocaleDateString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EstimateCardPreview;
