import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";
import type { JobPaymentStatus } from "@/data/mobileMockData";

interface JobPreview {
  id: string;
  title: string;
  customerName: string;
  technicianName: string;
  date: string;
  time: string;
  status: string;
  location: string;
  paymentStatus?: JobPaymentStatus;
}

interface JobCardsPreviewProps {
  jobs: JobPreview[];
  className?: string;
}

const JobCardsPreview = ({ jobs, className }: JobCardsPreviewProps) => {
  if (!jobs.length) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {jobs.map((job, index) => {
        const techInitials = job.technicianName.split(" ").map((n) => n[0]).join("");
        return (
          <div
            key={job.id}
            className={cn(
              "p-2.5 rounded-lg border-l-[3px] border-l-blue-500 border border-border/50",
              "bg-white/95 dark:bg-zinc-900/95 shadow-sm",
              "animate-in fade-in duration-300"
            )}
            style={{ animationDelay: `${index * 60}ms` } as React.CSSProperties}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-medium text-muted-foreground shrink-0">
                {job.id}
              </span>
              <Badge
                className={cn(
                  "text-[9px] px-1.5 py-0 h-[18px] leading-[18px]",
                  statusColors[job.status] || "bg-muted text-muted-foreground"
                )}
              >
                {job.status}
              </Badge>
            </div>
            <h3 className="font-semibold text-[13px] leading-tight truncate">{job.customerName}</h3>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {job.title}
            </p>
            <div className="flex items-center justify-between gap-2 pt-1.5 mt-1.5 border-t border-border/30">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground min-w-0">
                <Calendar className="h-2.5 w-2.5 flex-shrink-0" />
                <span className="truncate">
                  {new Date(job.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                  {job.time && <> · {job.time}</>}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-[8px] font-semibold text-primary">
                    {techInitials}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground truncate max-w-[52px]">
                  {job.technicianName}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default JobCardsPreview;
