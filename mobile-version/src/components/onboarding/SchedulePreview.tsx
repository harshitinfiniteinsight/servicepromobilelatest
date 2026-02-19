import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppointmentPreview {
  id: string;
  customerName: string;
  time: string;
  service: string;
  duration: string;
  technicianName: string;
  status: string;
}

interface SchedulePreviewProps {
  appointments: AppointmentPreview[];
  className?: string;
}

const SchedulePreview = ({ appointments, className }: SchedulePreviewProps) => {
  if (!appointments.length) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {appointments.map((apt, index) => (
        <div
          key={apt.id}
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl border-l-4 border-l-purple-500 border border-border/60",
            "bg-gradient-to-r from-white to-purple-50/30 dark:from-zinc-900/90 dark:to-purple-950/20",
            "backdrop-blur-xl shadow-xl shadow-black/10 animate-in fade-in duration-300"
          )}
          style={{ animationDelay: `${index * 80}ms` } as React.CSSProperties}
        >
          <div className="flex flex-col items-center justify-center w-14 flex-shrink-0 py-1.5 px-2 rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-xs font-bold text-primary">{apt.time}</span>
            <span className="text-[10px] text-muted-foreground">{apt.duration}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base truncate">{apt.customerName}</p>
            <p className="text-sm text-muted-foreground truncate">{apt.service}</p>
            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-muted-foreground">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{apt.technicianName}</span>
            </div>
          </div>
          <span
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full flex-shrink-0",
              apt.status === "Confirmed"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            )}
          >
            {apt.status}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SchedulePreview;
