import { cn } from "@/lib/utils";

interface StepProgressProps {
  step: "hero" | "select" | "slides" | "cta";
  currentSlide?: number;
  totalSlides?: number;
  businessSelected?: boolean;
  accentColor?: "blue" | "amber" | "orange" | "cyan" | "purple" | "primary" | "rose" | "green";
}

const StepProgress = ({
  step,
  currentSlide = 0,
  totalSlides = 1,
  businessSelected = false,
  accentColor = "primary",
}: StepProgressProps) => {
  const steps = ["hero", "select", "slides", "cta"];
  const stepIndex = steps.indexOf(step);

  let progressPercent = (stepIndex / (steps.length - 1)) * 100;

  if (step === "slides" && totalSlides > 1) {
    const slideProgress = (currentSlide / (totalSlides - 1)) * (1 / (steps.length - 1));
    const baseProgress = (stepIndex / (steps.length - 1)) * 100;
    progressPercent = baseProgress + slideProgress * 100;
  }

  const accentColorMap: Record<string, string> = {
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    orange: "bg-orange-500",
    cyan: "bg-cyan-500",
    purple: "bg-purple-500",
    primary: "bg-orange-500",
    rose: "bg-rose-500",
    green: "bg-green-500",
  };

  const barColor = businessSelected ? accentColorMap[accentColor] || accentColorMap.primary : "bg-muted";

  return (
    <div className="w-full h-1 bg-muted/30 overflow-hidden rounded-full flex-shrink-0">
      <div
        className={cn(
          "h-full transition-all duration-500 ease-out",
          barColor
        )}
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  );
};

export default StepProgress;
