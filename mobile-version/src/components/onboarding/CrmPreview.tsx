import { cn } from "@/lib/utils";
import { Phone, Clock, Briefcase } from "lucide-react";

interface CrmCustomer {
  id: string;
  name: string;
  phone: string;
  lastService: string;
  totalJobs: number;
  lifetimeValue: number;
}

interface CrmPreviewProps {
  customers: CrmCustomer[];
  className?: string;
}

const avatarColors = [
  "from-violet-500 to-violet-700",
  "from-rose-500 to-rose-700",
  "from-blue-500 to-blue-700",
];

const CrmPreview = ({ customers, className }: CrmPreviewProps) => {
  if (!customers.length) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {customers.map((customer, index) => {
        const initials = customer.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
        return (
          <div
            key={customer.id}
            className={cn(
              "p-3 rounded-xl border-l-4 border-l-violet-500 border border-border/60",
              "bg-gradient-to-r from-white to-violet-50/30 dark:from-zinc-900/90 dark:to-violet-950/20",
              "backdrop-blur-xl shadow-xl shadow-black/10 animate-in fade-in duration-300"
            )}
            style={{ animationDelay: `${index * 80}ms` } as React.CSSProperties}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-sm",
                  avatarColors[index % avatarColors.length]
                )}
              >
                <span className="text-xs font-bold text-white">{initials}</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{customer.name}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                  <Phone className="w-2.5 h-2.5" />
                  <span>{customer.phone}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <span className="text-sm font-bold text-violet-700 dark:text-violet-400">
                  ${customer.lifetimeValue.toLocaleString()}
                </span>
                <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Briefcase className="w-2.5 h-2.5" />
                  <span>{customer.totalJobs} jobs</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground border-t border-border/30 pt-2">
              <Clock className="w-2.5 h-2.5" />
              <span>Last service: {customer.lastService}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CrmPreview;
