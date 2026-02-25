import { cn } from "@/lib/utils";
import { Signal, Wifi, Battery } from "lucide-react";

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: "blue" | "amber" | "orange" | "cyan" | "purple" | "primary" | "rose" | "green";
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
  rose: "shadow-[0_0_60px_-12px_rgba(244,63,94,0.4)]",
  green: "shadow-[0_0_60px_-12px_rgba(34,197,94,0.4)]",
};

const accentGradient: Record<string, string> = {
  blue: "from-blue-500 to-blue-600",
  amber: "from-amber-500 to-amber-600",
  orange: "from-orange-500 to-orange-600",
  cyan: "from-cyan-500 to-cyan-600",
  purple: "from-purple-500 to-purple-600",
  primary: "from-orange-500 to-orange-600",
  rose: "from-rose-500 to-rose-600",
  green: "from-green-500 to-emerald-600",
};

const PhoneFrame = ({ children, className, accentColor = "primary", headerTitle = "Service Pro 911" }: PhoneFrameProps) => {
  return (
    <div className={cn("relative mx-auto w-[min(100%,280px)] animate-pop-in", className)}>
      {/* Phone frame - standard smartphone aspect ratio (~9:19.5 like iPhone) */}
      <div
        className={cn(
          "relative overflow-hidden rounded-[2rem]",
          "aspect-[9/19.5] max-h-[620px]",
          "bg-gradient-to-br from-zinc-700 to-zinc-900 dark:from-zinc-800 dark:to-zinc-950",
          "shadow-2xl shadow-black/50",
          "drop-shadow-2xl",
          accentShadow[accentColor] || accentShadow.primary,
          "ring-2 ring-zinc-600/50 dark:ring-zinc-500/30",
          "border-[5px] border-zinc-700 dark:border-zinc-800",
          "transition-transform duration-300 hover:scale-[1.02]"
        )}
      >
        {/* Notch - proportional to phone width */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-20 h-4 bg-zinc-800 dark:bg-zinc-900 rounded-b-lg" />
        <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20 w-12 h-2.5 bg-zinc-700 dark:bg-zinc-800 rounded-full" />

        {/* Screen - fills frame with proper rounding */}
        <div className="absolute inset-0.5 rounded-[1.4rem] overflow-hidden bg-background shadow-inner shadow-black/20 flex flex-col">
          {/* Fake Status Bar */}
          <div className="flex shrink-0 items-center justify-between px-2 py-0.5 bg-muted/50 border-b border-border/30 text-[9px] font-medium text-foreground/70">
            <span>9:41</span>
            <div className="flex items-center gap-0.5">
              <Signal className="w-2 h-2" />
              <Wifi className="w-2 h-2" />
              <Battery className="w-2 h-2" />
            </div>
          </div>

          {/* App Header Bar — orange branding */}
          <div
            className={cn(
              "flex shrink-0 items-center justify-between px-2 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600",
              "border-b border-white/20"
            )}
          >
            <span className="text-[10px] font-bold text-white">{headerTitle}</span>
            <div className="w-1 h-1 rounded-full bg-white/80" />
          </div>

          {/* Content - fills remaining space, scrolls */}
          <div className="flex-1 min-h-0 p-2 overflow-y-auto overflow-x-hidden overscroll-contain [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted">
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

