import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface FeatureIllustrationProps {
  icon: LucideIcon;
  accentColor?: string;
  className?: string;
}

const FeatureIllustration = ({
  icon: Icon,
  accentColor = "from-orange-400 to-orange-600",
  className,
}: FeatureIllustrationProps) => {
  return (
    <div
      className={cn(
        "relative w-32 h-32 mx-auto mb-6",
        className
      )}
    >
      {/* Outer pulsing ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-full",
          "bg-gradient-to-br",
          accentColor,
          "opacity-15 animate-pulse-ring"
        )}
      />

      {/* Middle decorative ring */}
      <div
        className={cn(
          "absolute inset-2 rounded-full border border-dashed",
          "border-orange-300/40"
        )}
      />

      {/* Icon container with gradient background */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          "bg-gradient-to-br",
          accentColor,
          "rounded-full shadow-lg shadow-orange-500/25"
        )}
      >
        <Icon className="w-14 h-14 text-white" />
      </div>

      {/* Floating decorative dots */}
      <div className="absolute w-2 h-2 rounded-full bg-orange-400/60" style={{ top: "4px", right: "8px" }} />
      <div className="absolute w-1.5 h-1.5 rounded-full bg-orange-300/40" style={{ bottom: "12px", left: "4px" }} />
      <div className="absolute w-2 h-2 rounded-full bg-orange-400/50" style={{ top: "50%", right: "-8px", transform: "translateY(-50%)" }} />
    </div>
  );
};

export default FeatureIllustration;
