import { powerFeaturesSlides, type PowerFeatureSlide } from "@/data/onboardingContent";
import { cn } from "@/lib/utils";
import { ArrowRight, CreditCard, CheckCheck, ArrowRightLeft, Camera, Image } from "lucide-react";
import PhoneWithTags from "./PhoneWithTags";
import type { FloatingTag } from "./PhoneWithTags";

interface PowerFeaturesSlideProps {
  currentIndex: number;
  className?: string;
}

// Phone content for each power feature
const EstimateToInvoiceContent = () => (
  <div className="space-y-2">
    <div className="px-3 py-2 rounded-xl border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/20 dark:to-zinc-900 border border-border/40">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded-full">Approved</span>
        <span className="text-sm font-bold">$1,240</span>
      </div>
      <p className="text-xs font-semibold mt-1">EST-0031 · John Smith</p>
      <p className="text-[10px] text-muted-foreground">Pipe repair + labor</p>
    </div>
    <div className="flex items-center justify-center gap-2 py-1">
      <div className="h-px flex-1 bg-border/40" />
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
        <ArrowRight className="w-3 h-3 text-primary" />
        <span className="text-[9px] font-semibold text-primary">One tap convert</span>
      </div>
      <div className="h-px flex-1 bg-border/40" />
    </div>
    <div className="px-3 py-2 rounded-xl border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white dark:from-green-950/20 dark:to-zinc-900 border border-border/40">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 rounded-full">Invoice Created</span>
        <span className="text-sm font-bold text-green-600">$1,240</span>
      </div>
      <p className="text-xs font-semibold mt-1">INV-0058 · John Smith</p>
      <p className="text-[10px] text-muted-foreground">Ready to send</p>
    </div>
  </div>
);

const BeforeAfterContent = () => (
  <div className="space-y-2">
    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">JOB-0042 · Service Pictures</p>
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-lg bg-slate-200 dark:bg-slate-800 border border-border/40 aspect-square flex flex-col items-center justify-center gap-1">
        <Image className="w-6 h-6 text-slate-400" />
        <span className="text-[9px] font-semibold text-slate-500">Before</span>
      </div>
      <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300/60 aspect-square flex flex-col items-center justify-center gap-1">
        <CheckCheck className="w-6 h-6 text-emerald-500" />
        <span className="text-[9px] font-semibold text-emerald-600">After</span>
      </div>
    </div>
    <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-muted/40 to-muted/20 border border-border/40 flex items-center justify-between">
      <span className="text-[10px] text-muted-foreground">Attached to job</span>
      <span className="text-[10px] font-semibold text-primary">Share with customer</span>
    </div>
  </div>
);

const PayOnSpotContent = () => (
  <div className="space-y-2">
    <div className="px-3 py-2.5 rounded-xl border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-950/20 dark:to-zinc-900 border border-border/40">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded-full">Paid</span>
        <span className="text-sm font-bold text-emerald-600">$485</span>
      </div>
      <p className="text-xs font-semibold mt-1">INV-0042 · Mary Davis</p>
    </div>
    <div className="grid grid-cols-3 gap-1.5">
      {["Card", "ACH", "Tap"].map((method) => (
        <div key={method} className={cn(
          "py-2 rounded-lg text-center text-[9px] font-bold border",
          method === "Tap"
            ? "bg-primary text-white border-primary/30"
            : "bg-muted/40 text-foreground border-border/40"
        )}>
          {method === "Tap" ? "NFC Tap" : method}
        </div>
      ))}
    </div>
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-orange-50 dark:to-orange-950/10 border border-primary/20">
      <CreditCard className="w-4 h-4 text-primary flex-shrink-0" />
      <span className="text-[10px] font-semibold text-primary">Payment received · Same day</span>
    </div>
  </div>
);

const POWER_TAGS: FloatingTag[][] = [
  // Slide 0: Estimate to Invoice
  [
    {
      icon: ArrowRightLeft,
      label: "Zero Re-entry",
      subtitle: "All data flows over",
      color: "linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)",
      borderColor: "rgba(59,130,246,0.3)",
      position: "top-left",
    },
    {
      icon: CheckCheck,
      label: "One Tap Convert",
      subtitle: "Estimate → Invoice",
      color: "linear-gradient(135deg,#10b981 0%,#047857 100%)",
      borderColor: "rgba(16,185,129,0.3)",
      position: "mid-right",
    },
    {
      icon: ArrowRight,
      label: "Get Paid Faster",
      subtitle: "No billing delay",
      color: "linear-gradient(135deg,#f97316 0%,#ea580c 100%)",
      borderColor: "rgba(249,115,22,0.3)",
      position: "bottom-left",
    },
  ],
  // Slide 1: Before/After Pictures
  [
    {
      icon: Camera,
      label: "Before Photos",
      subtitle: "Attach at job start",
      color: "linear-gradient(135deg,#64748b 0%,#475569 100%)",
      borderColor: "rgba(100,116,139,0.3)",
      position: "top-left",
    },
    {
      icon: CheckCheck,
      label: "After Photos",
      subtitle: "Proof of quality",
      color: "linear-gradient(135deg,#10b981 0%,#047857 100%)",
      borderColor: "rgba(16,185,129,0.3)",
      position: "mid-right",
    },
    {
      icon: ArrowRight,
      label: "Share Instantly",
      subtitle: "Customer & disputes",
      color: "linear-gradient(135deg,#ec4899 0%,#be185d 100%)",
      borderColor: "rgba(236,72,153,0.3)",
      position: "bottom-right",
    },
  ],
  // Slide 2: Pay on Spot
  [
    {
      icon: CreditCard,
      label: "Tap to Pay",
      subtitle: "NFC, no reader needed",
      color: "linear-gradient(135deg,#f97316 0%,#ea580c 100%)",
      borderColor: "rgba(249,115,22,0.3)",
      position: "top-right",
    },
    {
      icon: CheckCheck,
      label: "Same-Day Payout",
      subtitle: "Collected on-site",
      color: "linear-gradient(135deg,#10b981 0%,#047857 100%)",
      borderColor: "rgba(16,185,129,0.3)",
      position: "mid-left",
    },
    {
      icon: ArrowRight,
      label: "5 Methods",
      subtitle: "Card, ACH, cash, NFC",
      color: "linear-gradient(135deg,#8b5cf6 0%,#6d28d9 100%)",
      borderColor: "rgba(139,92,246,0.3)",
      position: "bottom-right",
    },
  ],
];

const PHONE_CONTENT = [
  <EstimateToInvoiceContent key="est" />,
  <BeforeAfterContent key="ba" />,
  <PayOnSpotContent key="pay" />,
];

const PowerFeaturesSlide = ({ currentIndex, className }: PowerFeaturesSlideProps) => {
  const slide = powerFeaturesSlides[currentIndex];
  if (!slide) return null;

  return (
    <div className={cn("flex flex-col items-center text-center w-full", className)}>
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30 mb-4 shadow-sm">
        {slide.badge}
      </span>

      <h2 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight px-2 max-w-sm">
        <span className="bg-gradient-to-r from-primary via-orange-500 to-orange-600 bg-clip-text text-transparent">
          {slide.headline}
        </span>
      </h2>

      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs px-2 mb-4">
        {slide.subline}
      </p>

      <PhoneWithTags tags={POWER_TAGS[currentIndex] ?? []} accentColor="primary">
        {PHONE_CONTENT[currentIndex]}
      </PhoneWithTags>
    </div>
  );
};

export default PowerFeaturesSlide;
export { powerFeaturesSlides };
export type { PowerFeatureSlide };
