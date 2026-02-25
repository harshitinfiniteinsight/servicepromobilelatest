import { cn } from "@/lib/utils";

interface GradientOrbsProps {
  businessColor?: "blue" | "amber" | "orange" | "cyan" | "purple" | "primary" | "rose" | "green";
  className?: string;
}

const orbColors: Record<string, string> = {
  blue: "from-blue-400 to-blue-600",
  amber: "from-amber-400 to-amber-600",
  orange: "from-orange-400 to-orange-600",
  cyan: "from-cyan-400 to-cyan-600",
  purple: "from-purple-400 to-purple-600",
  primary: "from-orange-400 to-orange-600",
  rose: "from-rose-400 to-rose-600",
  green: "from-green-400 to-emerald-600",
};

const GradientOrbs = ({ businessColor = "primary", className }: GradientOrbsProps) => {
  const colorClass = orbColors[businessColor] || orbColors.primary;

  return (
    <div className={cn("fixed inset-0 overflow-hidden pointer-events-none z-0", className)}>
      {/* Orb 1 - Top left, slow drift */}
      <div
        className={cn(
          "absolute w-96 h-96 rounded-full blur-3xl opacity-30",
          "bg-gradient-to-br",
          colorClass
        )}
        style={{
          top: "-120px",
          left: "-80px",
          animation: "drift 25s ease-in-out infinite",
        }}
      />

      {/* Orb 2 - Bottom right, medium speed drift */}
      <div
        className={cn(
          "absolute w-80 h-80 rounded-full blur-3xl opacity-25",
          "bg-gradient-to-tl from-rose-400 to-pink-600"
        )}
        style={{
          bottom: "-60px",
          right: "-40px",
          animation: "drift 30s ease-in-out infinite 5s",
        }}
      />

      {/* Orb 3 - Upper right, accent color */}
      <div
        className={cn(
          "absolute w-64 h-64 rounded-full blur-3xl opacity-20",
          "bg-gradient-to-br from-cyan-400 to-blue-500"
        )}
        style={{
          top: "10%",
          right: "-20px",
          animation: "drift 35s ease-in-out infinite 8s",
        }}
      />

      {/* Orb 4 - Lower left, secondary */}
      <div
        className={cn(
          "absolute w-56 h-56 rounded-full blur-3xl opacity-15",
          "bg-gradient-to-br from-violet-400 to-purple-600"
        )}
        style={{
          bottom: "15%",
          left: "-30px",
          animation: "drift 28s ease-in-out infinite 12s",
        }}
      />
    </div>
  );
};

export default GradientOrbs;
