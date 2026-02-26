import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";

interface InvoicePreview {
  id: string;
  customerName: string;
  dueDate: string;
  amount: number;
  status: string;
}

interface InvoiceCardPreviewProps {
  invoices: InvoicePreview[];
  className?: string;
}

const InvoiceCardPreview = ({ invoices, className }: InvoiceCardPreviewProps) => {
  if (!invoices.length) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {invoices.map((inv, index) => {
        const statusLabel = inv.status === "Open" ? "Unpaid" : inv.status;
        const isPaid = statusLabel === "Paid";
        const isOverdue = statusLabel === "Overdue";

        return (
          <div
            key={inv.id}
            className={cn(
              "px-3 py-2.5 rounded-xl border-l-4 border-l-emerald-500 border border-border/60",
              "bg-gradient-to-r from-white to-emerald-50/30 dark:from-zinc-900/90 dark:to-emerald-950/20",
              "backdrop-blur-xl shadow-xl shadow-black/10 animate-in fade-in duration-300"
            )}
            style={{ animationDelay: `${index * 80}ms` } as React.CSSProperties}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-semibold text-sm">{inv.id}</span>
                <Badge
                  className={cn(
                    "text-[10px] px-1.5 py-0 h-4 leading-4",
                    statusColors[inv.status]
                  )}
                >
                  {statusLabel}
                </Badge>
              </div>
              <span
                className={cn(
                  "text-base font-bold whitespace-nowrap",
                  isPaid && "text-green-600 dark:text-green-400",
                  isOverdue && "text-red-600 dark:text-red-400"
                )}
              >
                ${inv.amount.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {inv.customerName}
            </p>
            <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InvoiceCardPreview;
