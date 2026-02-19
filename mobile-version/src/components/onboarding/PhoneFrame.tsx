import { cn } from "@/lib/utils";
import { Signal, Wifi, Battery } from "lucide-react";

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: "blue" | "amber" | "orange" | "cyan" | "purple" | "primary";
  /** Module name displayed in the app header (e.g. "Estimate", "Jobs") */
  headerTitle?: string;
}

const accentShadow: Record<string, string> = {
  blue: "shadow-[0_0_60px_-12px_rgba(59,130,246,0.4)]",
  amber: "shadow-[0_0_60px_-12px_rgba(217,119,6,0.35)]",
  orange: "shadow-[0_0_60px_-12px_rgba(249,115,22,0.4)]",
  cyan: "shadow-[0_0_60px_-12px_rgba(6,182,212,0.4)]",
  purple: "shadow-[0_0_60px_-12px_rgba(139,92,246,0.4)]",
  primary: "shadow-[0_0_60px_-12px_hsl(var(--primary)/.4)]",
};

const accentGradient: Record<string, string> = {
  blue: "from-blue-500 to-blue-600",
  amber: "from-amber-500 to-amber-600",
  orange: "from-orange-500 to-orange-600",
  cyan: "from-cyan-500 to-cyan-600",
  purple: "from-purple-500 to-purple-600",
  primary: "from-orange-500 to-orange-600",
};

const PhoneFrame = ({ children, className, accentColor = "primary", headerTitle = "Service Pro 911" }: PhoneFrameProps) => {
  return (
    <div className={cn("relative mx-auto w-[min(100%,260px)] animate-pop-in", className)}>
      <div
        className={cn(
          "relative rounded-[2.25rem] overflow-hidden",
          "bg-gradient-to-br from-zinc-700 to-zinc-900 dark:from-zinc-800 dark:to-zinc-950",
          "shadow-2xl shadow-black/50",
          "drop-shadow-2xl",
          accentShadow[accentColor] || accentShadow.primary,
          "ring-2 ring-zinc-600/50 dark:ring-zinc-500/30",
          "border-[6px] border-gradient-to-br border-zinc-700 dark:border-zinc-800",
          "transition-transform duration-300 hover:scale-[1.02]"
        )}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-24 h-5 bg-zinc-800 dark:bg-zinc-900 rounded-b-xl" />
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-20 w-14 h-3 bg-zinc-700 dark:bg-zinc-800 rounded-full" />

        {/* Screen - taller for better content visibility */}
        <div className="relative mt-0.5 mx-0.5 mb-0.5 rounded-[1.5rem] overflow-hidden bg-background min-h-[400px] shadow-inner shadow-black/20">
          {/* Fake Status Bar */}
          <div className="flex items-center justify-between px-2.5 py-1 bg-muted/50 border-b border-border/30 text-[10px] font-medium text-foreground/70">
            <span>9:41</span>
            <div className="flex items-center gap-0.5">
              <Signal className="w-2.5 h-2.5" />
              <Wifi className="w-2.5 h-2.5" />
              <Battery className="w-2.5 h-2.5" />
            </div>
          </div>

          {/* App Header Bar — orange branding */}
          <div
            className={cn(
              "flex items-center justify-between px-2.5 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600",
              "border-b border-white/20"
            )}
          >
            <span className="text-[11px] font-bold text-white">{headerTitle}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
          </div>

          {/* Content */}
          <div className="p-2.5 overflow-y-auto max-h-[340px] overscroll-contain [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted">
            {children}
          </div>
        </div>
      </div>

      {/* Floating decorative dots around frame */}
      <div className="absolute w-1 h-1 rounded-full bg-primary/40" style={{ top: "-8px", left: "20px" }} />
      <div className="absolute w-1.5 h-1.5 rounded-full bg-primary/30" style={{ bottom: "-10px", right: "15px" }} />
      <div className="absolute w-1 h-1 rounded-full bg-primary/25" style={{ top: "50%", right: "-6px", transform: "translateY(-50%)" }} />
    </div>
  );
};

export default PhoneFrame;

