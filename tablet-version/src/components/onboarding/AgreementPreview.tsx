import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgreementPreviewItem {
  id: string;
  customerName: string;
  type: string;
  startDate: string;
  endDate: string;
  monthlyAmount: number;
  status: string;
  renewalStatus: string;
}

interface AgreementPreviewProps {
  agreements: AgreementPreviewItem[];
  className?: string;
}

const AgreementPreview = ({ agreements, className }: AgreementPreviewProps) => {
  if (!agreements.length) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Agreement view header */}
      <div className="flex items-center justify-between px-1 py-1">
        <span className="text-xs font-semibold text-foreground">My Agreements</span>
        <div className="flex gap-0.5">
          {(["All", "Paid", "Open"] as const).map((tab) => (
            <span
              key={tab}
              className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors",
                tab === "All"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>

      {/* Agreement cards list */}
      <div className="space-y-2">
        {agreements.map((agr, index) => (
          <div
            key={agr.id}
            className={cn(
              "p-2.5 rounded-xl border-l-4 border-l-indigo-500 border border-border/60",
              "bg-gradient-to-r from-white to-indigo-50/30 dark:from-zinc-900/90 dark:to-indigo-950/20",
              "backdrop-blur-xl shadow-sm animate-in fade-in duration-300"
            )}
            style={{ animationDelay: `${index * 80}ms` } as React.CSSProperties}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-semibold text-xs">{agr.type}</span>
              <Badge
                className={cn(
                  "text-[10px] px-1.5 py-0 h-4 leading-4",
                  agr.status === "Paid"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                )}
              >
                {agr.status}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">{agr.customerName}</p>
            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border/40">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar className="h-2.5 w-2.5 flex-shrink-0" />
                <span>
                  {new Date(agr.startDate).toLocaleDateString()} – {new Date(agr.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[10px] text-muted-foreground">{agr.renewalStatus}</span>
              <span className="text-xs font-bold">${agr.monthlyAmount}/mo</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgreementPreview;
