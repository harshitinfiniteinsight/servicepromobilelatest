import { cn } from "@/lib/utils";
import { Briefcase, Clock } from "lucide-react";

interface EmployeePreviewItem {
  id: string;
  name: string;
  role: string;
  status: "Available" | "On Job" | "Off Duty";
  jobsToday: number;
  initials: string;
}

interface EmployeePreviewProps {
  employees: EmployeePreviewItem[];
  className?: string;
}

const statusStyles: Record<string, string> = {
  "Available":  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "On Job":     "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Off Duty":   "bg-zinc-100 text-zinc-500 dark:bg-zinc-800/40 dark:text-zinc-400",
};

const avatarColors = [
  "from-indigo-500 to-indigo-700",
  "from-blue-500 to-blue-700",
  "from-purple-500 to-purple-700",
  "from-cyan-500 to-cyan-700",
];

const EmployeePreview = ({ employees, className }: EmployeePreviewProps) => {
  if (!employees.length) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {employees.map((emp, index) => (
        <div
          key={emp.id}
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl border-l-4 border-l-indigo-500 border border-border/60",
            "bg-gradient-to-r from-white to-indigo-50/30 dark:from-zinc-900/90 dark:to-indigo-950/20",
            "backdrop-blur-xl shadow-xl shadow-black/10 animate-in fade-in duration-300"
          )}
          style={{ animationDelay: `${index * 80}ms` } as React.CSSProperties}
        >
          {/* Avatar */}
          <div
            className={cn(
              "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-sm",
              avatarColors[index % avatarColors.length]
            )}
          >
            <span className="text-xs font-bold text-white">{emp.initials}</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{emp.name}</p>
            <p className="text-xs text-muted-foreground truncate">{emp.role}</p>
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", statusStyles[emp.status])}>
              {emp.status}
            </span>
            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Briefcase className="w-2.5 h-2.5" />
              <span>{emp.jobsToday} jobs today</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeePreview;
