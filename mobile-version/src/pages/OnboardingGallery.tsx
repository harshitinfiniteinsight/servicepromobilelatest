/**
 * Onboarding Gallery - Screenshot capture page
 * All onboarding elements displayed individually in bordered cells for easy screenshot capture.
 */
import { Button } from "@/components/ui/button";
import {
  businessTypes,
  getOnboardingContent,
  type BusinessId,
  type SlideVariant,
} from "@/data/onboardingContent";
import {
  getOnboardingJobs,
  getOnboardingJobsWithMixedStatus,
  getOnboardingEstimates,
  getOnboardingInvoices,
  getOnboardingAppointments,
  getOnboardingAgreements,
  getOnboardingInventory,
  getOnboardingEmployees,
  getOnboardingFeedback,
  getOnboardingStoreItems,
  getOnboardingCrmCustomers,
} from "@/data/onboardingMockData";
import {
  JobCardsPreview,
  EstimateCardPreview,
  InvoiceCardPreview,
  SchedulePreview,
  ScheduleRoutePreview,
  AgreementPreview,
  InventoryPreview,
  PhoneFrame,
  EmployeePreview,
  FeedbackPreview,
  StorePreview,
  StorePaymentsPreview,
  BeforeAfterFeedbackPreview,
  PaymentsPreview,
  CrmPreview,
} from "@/components/onboarding";
import type { FloatingTag } from "@/components/onboarding";
import { ArrowRight, Sparkles, CheckCircle, Calendar, CreditCard, FileText, MapPin, Package, CheckCheck, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { useElementDownload } from "@/hooks/useElementDownload";

const VARIANT_TO_MODULE: Record<SlideVariant, string> = {
  estimates: "Estimate",
  jobs: "Jobs",
  "jobs-status": "Jobs",
  schedule: "Schedule",
  "schedule-routes": "Schedule",
  agreements: "Agreements",
  invoices: "Invoices",
  inventory: "Inventory",
  employees: "Employees",
  feedback: "Feedback",
  store: "Store",
  storePayments: "Payments",
  payments: "Payments",
  beforeAfterFeedback: "Feedback",
  crm: "Customers",
  composite: "Jobs",
};

const phoneAccentMap: Record<BusinessId, "blue" | "amber" | "orange" | "cyan" | "purple" | "primary" | "rose" | "green"> = {
  plumber: "blue",
  carpenter: "amber",
  electrician: "orange",
  hvac: "cyan",
  general: "purple",
  exterminator: "rose",
  landscaper: "green",
};

const HERO_TAGS: FloatingTag[] = [
  { icon: Calendar, label: "Schedule Jobs", subtitle: "Tap & dispatch", color: "linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)", borderColor: "rgba(59,130,246,0.3)", position: "top-left" },
  { icon: CheckCheck, label: "Job Complete", subtitle: "Paid on-site", color: "linear-gradient(135deg,#10b981 0%,#047857 100%)", borderColor: "rgba(16,185,129,0.3)", position: "mid-left" },
  { icon: Package, label: "Inventory", subtitle: "Low stock alert", color: "linear-gradient(135deg,#8b5cf6 0%,#6d28d9 100%)", borderColor: "rgba(139,92,246,0.3)", position: "bottom-left" },
  { icon: CreditCard, label: "Tap to Pay", subtitle: "Same-day cash", color: "linear-gradient(135deg,#f97316 0%,#ea580c 100%)", borderColor: "rgba(249,115,22,0.3)", position: "top-right" },
  { icon: FileText, label: "Estimates", subtitle: "Send in 60 sec", color: "linear-gradient(135deg,#06b6d4 0%,#0891b2 100%)", borderColor: "rgba(6,182,212,0.3)", position: "mid-right" },
  { icon: MapPin, label: "Route Map", subtitle: "Optimized stops", color: "linear-gradient(135deg,#ec4899 0%,#be185d 100%)", borderColor: "rgba(236,72,153,0.3)", position: "bottom-right" },
];

const HERO_PHONE_CONTENT = (
  <div className="space-y-2">
    <div className="flex items-center justify-between pb-1 border-b border-border/40">
      <span className="text-xs font-bold text-foreground">Dashboard</span>
      <span className="text-[9px] text-muted-foreground">Today</span>
    </div>
    <div className="grid grid-cols-3 gap-1">
      <div className="py-1.5 px-1.5 rounded-lg bg-primary/10 border border-primary/20 text-center">
        <p className="text-sm font-bold text-primary">2</p>
        <p className="text-[8px] text-muted-foreground">Jobs</p>
      </div>
      <div className="py-1.5 px-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
        <p className="text-sm font-bold text-green-600 dark:text-green-400">$485</p>
        <p className="text-[8px] text-muted-foreground">Paid</p>
      </div>
      <div className="py-1.5 px-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">3</p>
        <p className="text-[8px] text-muted-foreground">Today</p>
      </div>
    </div>
    <p className="text-[9px] font-semibold text-muted-foreground uppercase">Today&apos;s Activity</p>
    <div className="space-y-1.5">
      <div className="p-2 rounded-xl border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white dark:from-green-950/20 dark:to-zinc-900 border border-border/40 shadow-sm">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[9px] font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 rounded-full">In Progress</span>
          <span className="text-[9px] text-muted-foreground">9:00 AM</span>
        </div>
        <p className="text-[11px] font-semibold truncate">John Smith</p>
        <p className="text-[9px] text-muted-foreground truncate">Pipe leak repair</p>
      </div>
      <div className="p-2 rounded-xl border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/20 dark:to-zinc-900 border border-border/40 shadow-sm">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[9px] font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded-full">Scheduled</span>
          <span className="text-[9px] text-muted-foreground">11:30 AM</span>
        </div>
        <p className="text-[11px] font-semibold truncate">Mary Johnson</p>
        <p className="text-[9px] text-muted-foreground truncate">Water heater install</p>
      </div>
      <div className="p-2 rounded-xl bg-gradient-to-r from-primary/10 to-orange-50 dark:to-orange-950/10 border border-primary/20 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[9px] font-semibold">INV-0042 Paid</p>
          <p className="text-[9px] text-muted-foreground">Mike Davis</p>
        </div>
        <span className="text-[11px] font-bold text-green-600">$485</span>
      </div>
    </div>
  </div>
);

function ElementCell({ 
  label, 
  children,
}: { 
  label: string
  children: React.ReactNode
}) {
  const cellRef = useRef<HTMLDivElement>(null);
  const { downloadElement } = useElementDownload();

  const handleDownload = () => {
    if (cellRef.current) {
      const filename = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      downloadElement(cellRef.current, filename);
    }
  };

  return (
    <div
      ref={cellRef}
      className="relative rounded-xl border border-border/60 bg-white/90 dark:bg-zinc-900/90 p-12 shadow-sm min-w-[280px]"
    >
      <button
        onClick={handleDownload}
        className="absolute top-3 right-3 p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
        title="Download as image"
        type="button"
      >
        <Download className="w-4 h-4 text-primary" />
      </button>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-6 whitespace-nowrap">{label}</p>
      <div className="flex justify-center items-center min-h-[100px]">{children}</div>
    </div>
  );
}

function TagPillCell({ tag, label }: { tag: FloatingTag; label: string }) {
  const Icon = tag.icon;
  return (
    <ElementCell label={label}>
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg border"
        style={{ background: tag.color, borderColor: tag.borderColor }}
      >
        <div className="rounded-md bg-white/25 flex items-center justify-center w-6 h-6 flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="text-left">
          <p className="font-bold text-white leading-tight whitespace-nowrap text-[10px]">{tag.label}</p>
          <p className="text-white/80 leading-tight whitespace-nowrap text-[9px]">{tag.subtitle}</p>
        </div>
      </div>
    </ElementCell>
  );
}

function renderMockPreview(variant: SlideVariant, businessId: BusinessId) {
  switch (variant) {
    case "jobs":
      return <JobCardsPreview jobs={getOnboardingJobs(businessId)} />;
    case "jobs-status":
      return <JobCardsPreview jobs={getOnboardingJobsWithMixedStatus(businessId)} />;
    case "estimates":
      return <EstimateCardPreview estimates={getOnboardingEstimates(businessId)} />;
    case "invoices":
      return <InvoiceCardPreview invoices={getOnboardingInvoices(businessId)} />;
    case "schedule":
      return <SchedulePreview appointments={getOnboardingAppointments(businessId)} />;
    case "schedule-routes":
      return <ScheduleRoutePreview />;
    case "agreements":
      return <AgreementPreview agreements={getOnboardingAgreements(businessId)} />;
    case "inventory":
      return <InventoryPreview items={getOnboardingInventory(businessId)} />;
    case "employees":
      return <EmployeePreview employees={getOnboardingEmployees(businessId)} />;
    case "feedback":
      return <FeedbackPreview items={getOnboardingFeedback(businessId)} />;
    case "store":
      return <StorePreview items={getOnboardingStoreItems(businessId)} />;
    case "storePayments":
      return (
        <StorePaymentsPreview
          items={getOnboardingStoreItems(businessId)}
          invoices={getOnboardingInvoices(businessId)}
        />
      );
    case "payments":
      return <PaymentsPreview />;
    case "beforeAfterFeedback":
      return <BeforeAfterFeedbackPreview feedback={getOnboardingFeedback(businessId)} />;
    case "crm":
      return <CrmPreview customers={getOnboardingCrmCustomers(businessId)} />;
    case "composite":
      return <JobCardsPreview jobs={getOnboardingJobs(businessId)} />;
    default:
      return null;
  }
}

const OnboardingGallery = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { downloadElement } = useElementDownload();

  const downloadAll = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    // Find all ElementCell containers by their consistent class structure
    const elements = Array.from(
      document.querySelectorAll('div.rounded-xl.border.border-border\\/60.bg-white\\/90.dark\\:bg-zinc-900\\/90')
    ).filter((el) => {
      // Ensure it's an ElementCell by checking for the label paragraph
      return el.querySelector('p.text-\\[10px\\].font-semibold.text-muted-foreground') !== null;
    }) as HTMLElement[];

    const total = elements.length;

    for (let i = 0; i < total; i++) {
      const element = elements[i];
      const labelElement = element.querySelector(
        'p.text-\\[10px\\].font-semibold.text-muted-foreground'
      );
      const label = labelElement?.textContent?.trim() || `element-${i + 1}`;
      const filename = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      await downloadElement(element, filename);
      setDownloadProgress(Math.round(((i + 1) / total) * 100));
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    setIsDownloading(false);
    setDownloadProgress(0);
  };

  return (
    <div className="relative h-full overflow-auto bg-muted/30">
      <div className="min-h-full py-20 px-8 md:px-16 lg:px-24">
        {/* Bulk Download Button */}
        <button
          onClick={downloadAll}
          disabled={isDownloading}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-lg hover:bg-primary/90 disabled:opacity-50 transition-all"
          type="button"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Downloading... {downloadProgress}%
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download All
            </>
          )}
        </button>
      <div className="max-w-7xl mx-auto space-y-32 min-w-[1400px]">
        {/* Page title + TOC */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Onboarding Gallery</h1>
          <p className="text-muted-foreground">Screenshot each element individually for development.</p>
          <nav className="flex flex-wrap gap-2 text-sm">
            {["hero", "business-select", ...businessTypes.map((b) => b.id), "cta"].map((id) => (
              <a
                key={id}
                href={`#section-${id}`}
                className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-border/60 hover:bg-muted/50"
              >
                {id.replace("-", " ")}
              </a>
            ))}
          </nav>
        </div>

        {/* Screen 1: Hero */}
        <section id="section-hero" className="space-y-14 pt-8">
          <h2 className="text-xl font-bold border-b pb-6">Screen 1: Hero</h2>
          <div className="grid grid-cols-4 gap-16">
            <ElementCell label="Hero - Badge">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Built for field pros</span>
              </div>
            </ElementCell>
            {HERO_TAGS.map((tag, i) => (
              <TagPillCell key={i} tag={tag} label={`Hero - Tag ${i + 1}: ${tag.label}`} />
            ))}
            <ElementCell label="Hero - Phone mockup">
              <PhoneFrame accentColor="primary" headerTitle="Dashboard">
                {HERO_PHONE_CONTENT}
              </PhoneFrame>
            </ElementCell>
            <ElementCell label="Hero - Headline">
              <h1 className="text-2xl font-bold text-center">
                Run your service business{" "}
                <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">from your pocket</span>
              </h1>
            </ElementCell>
            <ElementCell label="Hero - Stat pill">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-muted/60 border border-border/50">
                <div className="flex -space-x-1">
                  {["#f97316", "#3b82f6", "#10b981"].map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-background" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-xs font-semibold text-muted-foreground">2,500+ pros save 15+ hrs/week · 4.9 / 5</span>
              </div>
            </ElementCell>
            <ElementCell label="Hero - CTA button">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600">
                See how it works for you
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </ElementCell>
            <ElementCell label="Hero - Footer">
              <p className="text-xs text-muted-foreground">Free to try · No credit card needed</p>
            </ElementCell>
          </div>
        </section>

        {/* Screen 2: Business Select */}
        <section id="section-business-select" className="space-y-14 pt-8">
          <h2 className="text-xl font-bold border-b pb-6">Screen 2: Business Select</h2>
          <div className="grid grid-cols-4 gap-16">
            <ElementCell label="Business Select - Heading">
              <h2 className="text-2xl font-bold">What&apos;s your business?</h2>
            </ElementCell>
            <ElementCell label="Business Select - Subline">
              <p className="text-muted-foreground">We&apos;ll show you exactly how Service Pro 911 helps</p>
            </ElementCell>
            {businessTypes.map((business) => {
              const Icon = business.icon;
              return (
                <ElementCell key={business.id} label={`Business Select - ${business.name}`}>
                  <div
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border-l-4 border bg-white dark:bg-zinc-900",
                      business.id === "plumber" && "border-l-blue-500",
                      business.id === "carpenter" && "border-l-amber-500",
                      business.id === "electrician" && "border-l-orange-500",
                      business.id === "hvac" && "border-l-cyan-500",
                      business.id === "general" && "border-l-purple-500",
                      business.id === "exterminator" && "border-l-rose-500",
                      business.id === "landscaper" && "border-l-green-500"
                    )}
                  >
                    <div className={cn("h-14 w-14 rounded-xl flex items-center justify-center", `bg-gradient-to-br ${business.color}`)}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base">{business.name}</h3>
                      <p className="text-sm text-muted-foreground">{business.description}</p>
                    </div>
                  </div>
                </ElementCell>
              );
            })}
          </div>
        </section>

        {/* Per-business journey slides */}
        {businessTypes.map((business) => {
          const content = getOnboardingContent(business.id as BusinessId);
          if (!content?.slides?.length) return null;

          return (
            <section key={business.id} id={`section-${business.id}`} className="space-y-16 pt-12">
              <h2 className="text-xl font-bold border-b pb-6 capitalize">{business.name} – Journey Slides</h2>

              {content.slides.map((slide, slideIndex) => (
                <div key={slideIndex} className="space-y-12">
                  <h3 className="text-lg font-semibold text-muted-foreground">
                    {business.name} – Step {slideIndex + 1}: {VARIANT_TO_MODULE[slide.variant]}
                  </h3>
                  <div className="grid grid-cols-4 gap-16">
                    <ElementCell label={`${business.name} Step ${slideIndex + 1} - Badge`}>
                      <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/25">
                        {slide.badge}
                      </span>
                    </ElementCell>
                    <ElementCell label={`${business.name} Step ${slideIndex + 1} - Headline`}>
                      <h2 className="text-lg font-bold text-center">{slide.headline}</h2>
                    </ElementCell>
                    <ElementCell label={`${business.name} Step ${slideIndex + 1} - Subline`}>
                      <p className="text-sm text-muted-foreground text-center">{slide.subline}</p>
                    </ElementCell>
                    <ElementCell label={`${business.name} Step ${slideIndex + 1} - Step dots`}>
                      <div className="flex gap-1.5">
                        {content.slides.map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-2 rounded-full",
                              i === slideIndex ? "w-5 bg-primary" : "w-2 bg-muted/70"
                            )}
                          />
                        ))}
                      </div>
                    </ElementCell>
                    {slide.tags.map((tag, tagIndex) => (
                      <TagPillCell key={tagIndex} tag={tag} label={`${business.name} Step ${slideIndex + 1} - Tag ${tagIndex + 1}: ${tag.label}`} />
                    ))}
                    <ElementCell label={`${business.name} Step ${slideIndex + 1} - Phone + Preview`}>
                      <PhoneFrame
                        accentColor={phoneAccentMap[business.id as BusinessId] || "primary"}
                        headerTitle={VARIANT_TO_MODULE[slide.variant]}
                      >
                        {renderMockPreview(slide.variant, business.id as BusinessId)}
                      </PhoneFrame>
                    </ElementCell>
                  </div>
                </div>
              ))}
            </section>
          );
        })}

        {/* CTA */}
        <section id="section-cta" className="space-y-14 pt-8">
          <h2 className="text-xl font-bold border-b pb-6">CTA</h2>
          <div className="grid grid-cols-4 gap-16">
            <ElementCell label="CTA - Checkmark icon">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </ElementCell>
            <ElementCell label="CTA - Headline">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">You&apos;re all set!</h2>
            </ElementCell>
            <ElementCell label="CTA - Subline">
              <p className="text-muted-foreground">Join 2,500+ pros saving 15+ hours every week.</p>
            </ElementCell>
            {["Free trial", "No credit card", "Cancel anytime"].map((badge) => (
              <ElementCell key={badge} label={`CTA - Badge: ${badge}`}>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/15 text-primary border border-primary/30">{badge}</span>
              </ElementCell>
            ))}
            <ElementCell label="CTA - Sign Up button">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600">
                Sign Up Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </ElementCell>
            <ElementCell label="CTA - Sign In button">
              <Button variant="outline" size="lg">
                Already have an account? Sign In
              </Button>
            </ElementCell>
          </div>
        </section>
      </div>
      </div>
    </div>
  );
};

export default OnboardingGallery;
