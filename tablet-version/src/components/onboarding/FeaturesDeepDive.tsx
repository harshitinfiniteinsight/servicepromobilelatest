import { allFeatures } from "@/data/onboardingContent";
import { cn } from "@/lib/utils";

interface FeaturesDeepDiveProps {
  className?: string;
}

const colorClassMap: Record<string, { bg: string; icon: string }> = {
  blue:    { bg: "bg-blue-100 dark:bg-blue-900/30",    icon: "text-blue-600 dark:text-blue-400" },
  green:   { bg: "bg-green-100 dark:bg-green-900/30",  icon: "text-green-600 dark:text-green-400" },
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: "text-emerald-600 dark:text-emerald-400" },
  purple:  { bg: "bg-purple-100 dark:bg-purple-900/30", icon: "text-purple-600 dark:text-purple-400" },
  amber:   { bg: "bg-amber-100 dark:bg-amber-900/30",  icon: "text-amber-600 dark:text-amber-400" },
  indigo:  { bg: "bg-indigo-100 dark:bg-indigo-900/30", icon: "text-indigo-600 dark:text-indigo-400" },
  pink:    { bg: "bg-pink-100 dark:bg-pink-900/30",    icon: "text-pink-600 dark:text-pink-400" },
  teal:    { bg: "bg-teal-100 dark:bg-teal-900/30",    icon: "text-teal-600 dark:text-teal-400" },
  violet:  { bg: "bg-violet-100 dark:bg-violet-900/30", icon: "text-violet-600 dark:text-violet-400" },
  slate:   { bg: "bg-slate-200 dark:bg-slate-900/30",  icon: "text-slate-600 dark:text-slate-400" },
};

const FeaturesDeepDive = ({ className }: FeaturesDeepDiveProps) => {
  return (
    <div className={cn("flex flex-col w-full", className)}>
      {/* Decorative divider line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-6" />

      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight">
          <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Everything you need
          </span>
        </h2>
        <p className="text-muted-foreground">
          Jobs, customers, payments, inventory, and more
        </p>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1 -mr-1">
        {allFeatures.map((feature, index) => {
          const Icon = feature.icon;
          const colorConfig = colorClassMap[feature.colorClass] || {
            bg: "bg-primary/10",
            icon: "text-primary",
          };

          // Chess-board stagger pattern for grid
          const delay = (index % 2) * 50 + Math.floor(index / 2) * 100;

          return (
            <div
              key={feature.title}
              className={cn(
                "flex flex-col items-center text-center p-4 rounded-xl",
                "border border-border/40 backdrop-blur-sm",
                "bg-gradient-to-br from-white to-muted/30 dark:from-zinc-900/50 dark:to-zinc-950/30",
                "shadow-sm hover:shadow-md transition-shadow",
                "animate-pop-in"
              )}
              style={{ animationDelay: `${delay}ms` } as React.CSSProperties}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                  colorConfig.bg
                )}
              >
                <Icon className={cn("h-6 w-6", colorConfig.icon)} />
              </div>
              <h3 className="font-semibold text-sm leading-tight">{feature.title}</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturesDeepDive;
