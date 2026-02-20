import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  PhoneWithTags,
  GradientOrbs,
  StepProgress,
  EmployeePreview,
  FeedbackPreview,
  StorePreview,
  StorePaymentsPreview,
  BeforeAfterFeedbackPreview,
  PaymentsPreview,
  CrmPreview,
} from "@/components/onboarding";
import { ArrowRight, Sparkles, CheckCircle, Calendar, CreditCard, FileText, MapPin, Package, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FloatingTag } from "@/components/onboarding";

type OnboardingStep = "hero" | "select" | "slides" | "cta";

/** Module names for phone header based on slide variant */
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

const HERO_TAGS: FloatingTag[] = [
  {
    icon: Calendar,
    label: "Schedule Jobs",
    subtitle: "Tap & dispatch",
    color: "linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)",
    borderColor: "rgba(59,130,246,0.3)",
    position: "top-left",
  },
  {
    icon: CheckCheck,
    label: "Job Complete",
    subtitle: "Paid on-site",
    color: "linear-gradient(135deg,#10b981 0%,#047857 100%)",
    borderColor: "rgba(16,185,129,0.3)",
    position: "mid-left",
  },
  {
    icon: Package,
    label: "Inventory",
    subtitle: "Low stock alert",
    color: "linear-gradient(135deg,#8b5cf6 0%,#6d28d9 100%)",
    borderColor: "rgba(139,92,246,0.3)",
    position: "bottom-left",
  },
  {
    icon: CreditCard,
    label: "Tap to Pay",
    subtitle: "Same-day cash",
    color: "linear-gradient(135deg,#f97316 0%,#ea580c 100%)",
    borderColor: "rgba(249,115,22,0.3)",
    position: "top-right",
  },
  {
    icon: FileText,
    label: "Estimates",
    subtitle: "Send in 60 sec",
    color: "linear-gradient(135deg,#06b6d4 0%,#0891b2 100%)",
    borderColor: "rgba(6,182,212,0.3)",
    position: "mid-right",
  },
  {
    icon: MapPin,
    label: "Route Map",
    subtitle: "Optimized stops",
    color: "linear-gradient(135deg,#ec4899 0%,#be185d 100%)",
    borderColor: "rgba(236,72,153,0.3)",
    position: "bottom-right",
  },
];

const HERO_PHONE_CONTENT = (
  <div className="space-y-2">
    {/* Dashboard header */}
    <div className="flex items-center justify-between pb-1 border-b border-border/40">
      <span className="text-xs font-bold text-foreground">Dashboard</span>
      <span className="text-[9px] text-muted-foreground">Today</span>
    </div>

    {/* Quick stats row */}
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

    {/* Today's Activity */}
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

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>("hero");
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessId | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");

  const content = selectedBusiness ? getOnboardingContent(selectedBusiness) : null;
  const slides = content?.slides ?? [];
  const slide = slides[currentSlide];
  const totalSlides = slides.length;

  const handleHeroContinue = () => setStep("select");
  const handleSelectBusiness = (businessId: BusinessId) => {
    setSelectedBusiness(businessId);
    setCurrentSlide(0);
    setStep("slides");
    sessionStorage.setItem("onboardingBusinessType", businessId);
  };

  const handleNextSlide = () => {
    setSlideDirection("next");
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setStep("cta");
    }
  };

  const handlePrevSlide = () => {
    setSlideDirection("prev");
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else {
      setStep("select");
    }
  };

  const handleSignUp = () => {
    const biz = selectedBusiness ?? "general";
    navigate(`/signup?business=${biz}`);
  };

  const handleSignIn = () => navigate("/signin");

  const handleSkip = () => {
    if (step === "hero" || step === "select") navigate("/signin");
    else setStep("cta");
  };

  const handleBack = () => {
    if (step === "slides") {
      if (currentSlide > 0) {
        setSlideDirection("prev");
        setCurrentSlide(currentSlide - 1);
      } else {
        setStep("select");
      }
    }
  };

  const renderMockPreview = (variant: SlideVariant) => {
    if (!selectedBusiness) return null;
    switch (variant) {
      case "jobs":
        return <JobCardsPreview jobs={getOnboardingJobs(selectedBusiness)} />;
      case "jobs-status":
        return <JobCardsPreview jobs={getOnboardingJobsWithMixedStatus(selectedBusiness)} />;
      case "estimates":
        return <EstimateCardPreview estimates={getOnboardingEstimates(selectedBusiness)} />;
      case "invoices":
        return <InvoiceCardPreview invoices={getOnboardingInvoices(selectedBusiness)} />;
      case "schedule":
        return <SchedulePreview appointments={getOnboardingAppointments(selectedBusiness)} />;
      case "schedule-routes":
        return <ScheduleRoutePreview />;
      case "agreements":
        return <AgreementPreview agreements={getOnboardingAgreements(selectedBusiness)} />;
      case "inventory":
        return <InventoryPreview items={getOnboardingInventory(selectedBusiness)} />;
      case "employees":
        return <EmployeePreview employees={getOnboardingEmployees(selectedBusiness)} />;
      case "feedback":
        return <FeedbackPreview items={getOnboardingFeedback(selectedBusiness)} />;
      case "store":
        return <StorePreview items={getOnboardingStoreItems(selectedBusiness)} />;
      case "storePayments":
        return (
          <StorePaymentsPreview
            items={getOnboardingStoreItems(selectedBusiness)}
            invoices={getOnboardingInvoices(selectedBusiness)}
          />
        );
      case "payments":
        return <PaymentsPreview />;
      case "beforeAfterFeedback":
        return <BeforeAfterFeedbackPreview feedback={getOnboardingFeedback(selectedBusiness)} />;
      case "crm":
        return <CrmPreview customers={getOnboardingCrmCustomers(selectedBusiness)} />;
      case "composite":
        return <JobCardsPreview jobs={getOnboardingJobs(selectedBusiness)} />;
      default:
        return null;
    }
  };

  const phoneAccentMap: Record<BusinessId, "blue" | "amber" | "orange" | "cyan" | "purple" | "primary"> = {
    plumber: "blue",
    carpenter: "amber",
    electrician: "orange",
    hvac: "cyan",
    general: "purple",
  };

  const orbColorMap: Record<BusinessId, "blue" | "amber" | "orange" | "cyan" | "purple" | "primary"> = {
    plumber: "blue",
    carpenter: "amber",
    electrician: "orange",
    hvac: "cyan",
    general: "purple",
  };

  const showBackButton = step === "slides";
  const showSkipButton = ["hero", "select", "slides"].includes(step);

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden bg-background">
      <GradientOrbs businessColor={selectedBusiness ? orbColorMap[selectedBusiness] : "primary"} />

      <div className="relative z-10 h-full w-full flex flex-col px-5 pt-5 pb-4 transition-all duration-300 overflow-hidden">
        {/* Progress bar */}
        <div className="mb-3 flex-shrink-0">
          <StepProgress
            step={step}
            currentSlide={currentSlide}
            totalSlides={totalSlides}
            businessSelected={!!selectedBusiness}
            accentColor={selectedBusiness ? orbColorMap[selectedBusiness] : "primary"}
          />
        </div>

        {/* Top bar */}
        <div className="flex justify-between items-center mb-3 flex-shrink-0">
          {(step === "hero" || step === "select") && (
            <button
              onClick={() => navigate("/signin")}
              className="text-muted-foreground touch-target text-sm font-medium hover:text-foreground transition-colors"
            >
              Already have an account? Sign In
            </button>
          )}
          {showBackButton && (
            <button
              onClick={handleBack}
              className="text-muted-foreground touch-target text-sm font-medium hover:text-foreground transition-colors"
            >
              Back
            </button>
          )}
          {showSkipButton && (
            <button
              onClick={handleSkip}
              className="text-muted-foreground touch-target text-sm font-medium hover:text-foreground transition-colors ml-auto"
            >
              Skip
            </button>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center overflow-y-auto min-h-0">

          {/* ── HERO ── */}
          {step === "hero" && (
            <div className="flex flex-col items-center text-center max-w-lg mx-auto w-full">
              <div className="mb-4 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/20 animate-pop-in shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Built for field pros</span>
              </div>

              <PhoneWithTags tags={HERO_TAGS} accentColor="primary" className="mb-4" headerTitle="Dashboard">
                {HERO_PHONE_CONTENT}
              </PhoneWithTags>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight animate-slide-up-fade mb-3" style={{ animationDelay: "100ms" } as React.CSSProperties}>
                Run your service business{" "}
                <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  from your pocket
                </span>
              </h1>

              <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-muted/60 border border-border/50 animate-slide-up-fade mb-5" style={{ animationDelay: "200ms" } as React.CSSProperties}>
                <div className="flex -space-x-1">
                  {["#f97316", "#3b82f6", "#10b981"].map((color, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-background" style={{ background: color }} />
                  ))}
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  2,500+ pros save 15+ hrs/week · 4.9 / 5 rating
                </span>
              </div>

              <Button
                onClick={handleHeroContinue}
                size="lg"
                className="w-full h-14 text-base font-semibold rounded-2xl shadow-2xl shadow-primary/40 active:scale-[0.98] transition-all bg-gradient-to-r from-primary to-orange-500"
              >
                See how it works for you
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              <p className="text-xs text-muted-foreground mt-3">
                Free to try · No credit card needed
              </p>
            </div>
          )}

          {/* ── BUSINESS SELECT ── */}
          {step === "select" && (
            <div className="space-y-5 max-w-md mx-auto w-full">
              <div className="text-center animate-pop-in">
                <h2 className="text-3xl font-bold mb-2 tracking-tight">What's your business?</h2>
                <p className="text-muted-foreground">We'll show you exactly how Service Pro 911 helps</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {businessTypes.map((business, index) => {
                  const Icon = business.icon;
                  return (
                    <button
                      key={business.id}
                      onClick={() => handleSelectBusiness(business.id)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl",
                        "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl",
                        "border-l-4 border border-border/60",
                        "shadow-xl shadow-black/5",
                        "hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] hover:scale-[1.02]",
                        "active:scale-[0.97]",
                        "transition-all duration-200 touch-target text-left animate-pop-in",
                        business.id === "plumber"     && "border-l-blue-500",
                        business.id === "carpenter"   && "border-l-amber-500",
                        business.id === "electrician" && "border-l-orange-500",
                        business.id === "hvac"        && "border-l-cyan-500",
                        business.id === "general"     && "border-l-purple-500",
                      )}
                      style={{ animationDelay: `${75 + index * 75}ms` } as React.CSSProperties}
                    >
                      <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${business.color} flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/20`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-base">{business.name}</h3>
                        <p className="text-sm text-muted-foreground">{business.description}</p>
                        {business.tagline && (
                          <p className="text-xs text-muted-foreground italic mt-0.5">"{business.tagline}"</p>
                        )}
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── FEATURE SLIDES ── */}
          {step === "slides" && slide && content && (
            <div
              key={currentSlide}
              className={cn(
                "flex flex-col items-center w-full max-w-md mx-auto px-1",
                slideDirection === "next" && "animate-in fade-in slide-in-from-right-4 duration-300",
                slideDirection === "prev" && "animate-in fade-in slide-in-from-left-4 duration-300"
              )}
            >
              {/* Badge */}
              {slide.badge && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/25 mb-4">
                  {slide.badge}
                </span>
              )}

              {/* Headline + subline */}
              <h2 className="text-xl sm:text-2xl font-bold text-center tracking-tight px-1 mb-2 max-w-sm">
                {slide.headline}
              </h2>
              <p className="text-sm text-muted-foreground text-center max-w-[320px] mb-6 leading-relaxed">
                {slide.subline}
              </p>

              {/* Phone section: steps above, then phone with tags */}
              <div className="relative w-full flex flex-col items-center">
                {/* Step dots — directly above the mobile screen */}
                <div className="flex gap-1.5 px-4 py-2.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-border/60 shadow-lg shadow-black/5 mb-3">
                  {slides.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-2 rounded-full transition-all duration-200 flex-shrink-0",
                        index === currentSlide ? "w-5 bg-primary" : "w-2 bg-muted/70"
                      )}
                    />
                  ))}
                </div>

                {/* Phone with tags — floating pop-outs around the phone */}
                <PhoneWithTags
                  tags={slide.tags}
                  accentColor={phoneAccentMap[content.id] || "primary"}
                  tagLayout="floating"
                  headerTitle={VARIANT_TO_MODULE[slide.variant]}
                >
                  {renderMockPreview(slide.variant)}
                </PhoneWithTags>
              </div>
            </div>
          )}

          {/* ── CTA ── */}
          {step === "cta" && (
            <div className="flex flex-col items-center text-center max-w-md mx-auto w-full space-y-6 animate-pop-in">
              <div className="relative">
                <div
                  className="absolute rounded-full blur-2xl animate-pulse"
                  style={{ width: "120px", height: "120px", background: "linear-gradient(135deg,#10b981,#f97316)", inset: 0 }}
                />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl shadow-green-500/40">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                    You're all set!
                  </span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Join 2,500+ pros saving 15+ hours every week.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {["Free trial", "No credit card", "Cancel anytime"].map((badge) => (
                  <span key={badge} className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/15 text-primary border border-primary/30">
                    {badge}
                  </span>
                ))}
              </div>

              <div className="w-full space-y-4">
                <Button
                  onClick={handleSignUp}
                  size="lg"
                  className="w-full h-14 text-base font-semibold rounded-xl shadow-xl shadow-primary/30 active:scale-[0.98] transition-all bg-gradient-to-r from-primary to-orange-500"
                >
                  Sign Up Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <button
                  onClick={handleSignIn}
                  className="w-full h-12 font-semibold rounded-xl text-foreground hover:bg-muted/50 transition-colors"
                >
                  Already have an account? Sign In
                </button>
              </div>

              <p className="text-xs text-muted-foreground/70">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          )}
        </div>

        {/* ── SLIDE CONTROLS (dots moved above phone as pop-outs) ── */}
        {step === "slides" && slide && (
          <div className="mt-4 flex flex-col items-center gap-3 max-w-md mx-auto w-full flex-shrink-0">
            <div className="flex gap-3 w-full">
              {currentSlide > 0 && (
                <Button variant="outline" onClick={handlePrevSlide} className="flex-1 h-12 font-semibold rounded-xl border-2">
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNextSlide}
                className={cn("h-12 font-semibold rounded-xl shadow-lg active:scale-[0.98] transition-all", currentSlide > 0 ? "flex-1" : "w-full")}
              >
                {currentSlide < totalSlides - 1 ? "Next" : "Continue"}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* ── POWER FEATURES CONTROLS ── */}
        {step === "powerFeatures" && (
          <div className="mt-4 flex flex-col items-center gap-3 max-w-md mx-auto w-full flex-shrink-0">
            <div className="flex gap-1.5">
              {powerFeaturesSlides.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-200",
                    index === powerFeatureIndex ? "w-6 bg-primary" : "w-1.5 bg-muted"
                  )}
                />
              ))}
            </div>
            <div className="flex gap-3 w-full">
              {powerFeatureIndex > 0 && (
                <Button variant="outline" onClick={handlePrevPowerFeature} className="flex-1 h-12 font-semibold rounded-xl border-2">
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNextPowerFeature}
                className={cn("h-12 font-semibold rounded-xl shadow-lg active:scale-[0.98] transition-all", powerFeatureIndex > 0 ? "flex-1" : "w-full")}
              >
                {powerFeatureIndex < totalPowerFeatures - 1 ? "Next" : "Continue"}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* ── DEEP-DIVE CONTINUE ── */}
        {step === "featuresDeepDive" && (
          <div className="mt-4 max-w-md mx-auto w-full flex-shrink-0">
            <Button onClick={() => setStep("cta")} className="w-full h-12 font-semibold rounded-xl shadow-lg active:scale-[0.98] transition-all">
              Continue to Sign Up
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
