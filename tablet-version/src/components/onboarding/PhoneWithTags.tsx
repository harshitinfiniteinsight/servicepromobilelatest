import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import PhoneFrame from "./PhoneFrame";

export interface FloatingTag {
  icon: LucideIcon;
  label: string;
  subtitle: string;
  /** CSS gradient string, e.g. "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" */
  color: string;
  borderColor: string;
  position: "top-left" | "mid-left" | "bottom-left" | "top-right" | "mid-right" | "bottom-right";
}

interface PhoneWithTagsProps {
  children: React.ReactNode;
  tags: FloatingTag[];
  accentColor?: "blue" | "amber" | "orange" | "cyan" | "purple" | "primary";
  className?: string;
  /** "floating" = tags around phone (default), "inline" = tags in a row below the phone */
  tagLayout?: "floating" | "inline";
  /** Module name displayed in the phone app header (e.g. "Estimate", "Jobs") */
  headerTitle?: string;
}

const entranceDelayMs: Record<FloatingTag["position"], number> = {
  "top-left":    200,
  "mid-left":    350,
  "bottom-left": 500,
  "top-right":   250,
  "mid-right":   400,
  "bottom-right":550,
};

const TagPill = ({ tag, compact = false }: { tag: FloatingTag; compact?: boolean }) => {
  const Icon = tag.icon;
  return (
    <div
      className={cn(
        "flex items-center rounded-xl shadow-lg border backdrop-blur-sm",
        compact ? "gap-1.5 px-2.5 py-1.5" : "gap-2 px-3 py-2"
      )}
      style={{ background: tag.color, borderColor: tag.borderColor }}
    >
      <div className={cn("rounded-md bg-white/25 flex items-center justify-center flex-shrink-0", compact ? "w-5 h-5" : "w-6 h-6")}>
        <Icon className={cn("text-white", compact ? "w-3 h-3" : "w-3.5 h-3.5")} />
      </div>
      <div className="text-left">
        <p className={cn("font-bold text-white leading-tight whitespace-nowrap", compact ? "text-[9px]" : "text-[10px]")}>{tag.label}</p>
        <p className={cn("text-white/80 leading-tight whitespace-nowrap", compact ? "text-[8px]" : "text-[9px]")}>{tag.subtitle}</p>
      </div>
    </div>
  );
};

const PhoneWithTags = ({ children, tags, accentColor = "primary", className, tagLayout = "floating", headerTitle }: PhoneWithTagsProps) => {
  const useInlineLayout = tagLayout === "inline";

  return (
    <div
      className={cn(
        "relative w-full min-w-0 flex flex-col items-center",
        useInlineLayout ? "gap-4 px-2" : "justify-center",
        !useInlineLayout && "px-10 sm:px-14",
        className
      )}
      style={!useInlineLayout ? { minHeight: "360px" } : undefined}
    >
      {/* Wrapper for phone + floating tags (when floating) */}
      <div
        className={cn(
          "relative flex justify-center items-stretch",
          !useInlineLayout && "w-full",
          !useInlineLayout && "flex-1"
        )}
        style={!useInlineLayout ? { minHeight: "360px" } : undefined}
      >
        {!useInlineLayout && (
          <>
            {/* Radial glow behind phone */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: "220px",
                height: "220px",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)",
              }}
            />

            {/* Left tags — positioned by slot, on top of phone for readability */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-4 sm:py-6 pointer-events-none w-[118px] sm:w-[130px] z-20">
              {(["top-left", "mid-left", "bottom-left"] as const).map((slot) => {
                const tag = tags.find((t) => t.position === slot);
                if (!tag) return <div key={slot} className="flex-1 min-h-[44px]" />;
                const Icon = tag.icon;
                const baseDelay = entranceDelayMs[slot];
                const floatDuration = 4;
                return (
                  <div
                    key={slot}
                    className="animate-tag-entrance-left animate-float-tag-left flex justify-start flex-shrink-0"
                    style={{
                      animationDelay: `${baseDelay}ms`,
                      animationFillMode: "both",
                      animationDuration: `${floatDuration}s`,
                    } as React.CSSProperties}
                  >
                    <TagPill tag={tag} compact />
                  </div>
                );
              })}
            </div>

            {/* Right tags — positioned by slot, on top of phone for readability */}
            <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between py-4 sm:py-6 pointer-events-none w-[118px] sm:w-[130px] z-20">
              {(["top-right", "mid-right", "bottom-right"] as const).map((slot) => {
                const tag = tags.find((t) => t.position === slot);
                if (!tag) return <div key={slot} className="flex-1 min-h-[44px]" />;
                const baseDelay = entranceDelayMs[slot];
                const floatDuration = 4;
                return (
                  <div
                    key={slot}
                    className="animate-tag-entrance-right animate-float-tag-right flex justify-end flex-shrink-0"
                    style={{
                      animationDelay: `${baseDelay}ms`,
                      animationFillMode: "both",
                      animationDuration: `${floatDuration}s`,
                    } as React.CSSProperties}
                  >
                    <TagPill tag={tag} compact />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Phone — centered, behind pointer cards so cards are readable */}
        <div className="relative z-0 flex-shrink-0 animate-phone-entrance w-[200px] sm:w-[210px]">
          <PhoneFrame accentColor={accentColor} headerTitle={headerTitle}>
            {children}
          </PhoneFrame>
        </div>
      </div>

      {/* Inline layout: tags in a clean row below the phone */}
      {useInlineLayout && tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 w-full max-w-[280px] animate-in fade-in duration-300">
          {tags.map((tag, index) => (
            <TagPill key={`${tag.label}-${index}`} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PhoneWithTags;
