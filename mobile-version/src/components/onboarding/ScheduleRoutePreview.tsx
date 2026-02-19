import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

/** Route stop for map preview */
const ROUTE_PINS = [
  { id: 1, x: 22, y: 18, label: "Stop 1" },
  { id: 2, x: 72, y: 32, label: "Stop 2" },
  { id: 3, x: 45, y: 58, label: "Stop 3" },
  { id: 4, x: 78, y: 72, label: "Stop 4" },
];

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const CALENDAR_DAYS = [17, 18, 19, 20, 21, 22, 23];
const DAYS_WITH_APTS = [18, 19, 21];

const ScheduleRoutePreview = ({ className }: { className?: string }) => {
  return (
    <div className={cn("space-y-2.5", className)}>
      {/* Mini calendar */}
      <div className="rounded-xl border border-border/60 bg-white dark:bg-zinc-900/80 p-2 shadow-sm">
        <div className="text-[10px] font-semibold text-muted-foreground mb-1.5 flex items-center justify-between">
          <span>Feb 2025</span>
          <span className="text-primary">Today</span>
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center text-[9px] font-medium text-muted-foreground py-0.5">
              {d}
            </div>
          ))}
          {CALENDAR_DAYS.map((day) => {
            const hasApt = DAYS_WITH_APTS.includes(day);
            const isToday = day === 19;
            return (
              <div
                key={day}
                className={cn(
                  "flex flex-col items-center justify-center py-1 rounded-md text-[11px] font-medium",
                  isToday && "bg-primary text-primary-foreground",
                  !isToday && hasApt && "text-primary",
                  !isToday && !hasApt && "text-muted-foreground"
                )}
              >
                {day}
                {hasApt && !isToday && (
                  <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Map with route pins */}
      <div className="relative rounded-xl border border-border/60 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 min-h-[140px] shadow-sm">
        {/* Stylized roads / map background */}
        <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
          <defs>
            <pattern id="road-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 0 10 L 20 10 M 10 0 L 10 20" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#road-pattern)" />
          {/* Curved route path */}
          <path
            d="M 15% 15% Q 35% 20% 50% 35% T 75% 60% L 80% 75%"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray="4 3"
            opacity="0.8"
          />
        </svg>

        {/* Route pins */}
        {ROUTE_PINS.map((pin) => (
          <div
            key={pin.id}
            className="absolute z-10 -translate-x-1/2 -translate-y-full"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <MapPin className="h-5 w-5 text-primary drop-shadow-md" fill="hsl(var(--primary))" stroke="white" strokeWidth={1.5} />
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold text-primary bg-white dark:bg-zinc-800 px-1 rounded shadow-sm">
              {pin.label}
            </span>
          </div>
        ))}

        {/* Map label */}
        <div className="absolute bottom-1 right-1 text-[9px] text-muted-foreground bg-white/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded">
          Route · 4 stops
        </div>
      </div>
    </div>
  );
};

export default ScheduleRoutePreview;
