import {
  Wrench,
  Hammer,
  Zap,
  CheckCheck,
  Wind,
  Briefcase,
  Calendar,
  FileText,
  Users,
  DollarSign,
  Package,
  ClipboardList,
  CreditCard,
  Camera,
  ArrowRightLeft,
  BarChart3,
  Star,
  ShoppingCart,
  UserCheck,
  Route,
  MessageSquare,
  Layers,
  Wallet,
  RefreshCcw,
  Bell,
  TrendingUp,
  Map,
  Navigation,
  ListOrdered,
  Phone,
  History,
  StickyNote,
  PenLine,
  Smartphone,
  Shield,
  AlertTriangle,
  Link2,
  type LucideIcon,
} from "lucide-react";

export type BusinessId = "plumber" | "carpenter" | "electrician" | "hvac" | "general";

export type SlideVariant =
  | "jobs"
  | "jobs-status"
  | "estimates"
  | "invoices"
  | "schedule"
  | "schedule-routes"
  | "agreements"
  | "inventory"
  | "employees"
  | "feedback"
  | "store"
  | "storePayments"
  | "beforeAfterFeedback"
  | "crm"
  | "composite";

export interface FloatingTag {
  icon: LucideIcon;
  label: string;
  subtitle: string;
  color: string;
  borderColor: string;
  position: "top-left" | "mid-left" | "bottom-left" | "top-right" | "mid-right" | "bottom-right";
}

export interface OnboardingSlide {
  variant: SlideVariant;
  headline: string;
  subline: string;
  badge?: string;
  tags: FloatingTag[];
}

export interface BusinessConfig {
  id: BusinessId;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
  tagline?: string;
  slides: OnboardingSlide[];
}

// ---------------------------------------------------------------------------
// Tag color presets
// ---------------------------------------------------------------------------
const TAG = {
  blue:   { color: "linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)", borderColor: "rgba(59,130,246,0.3)" },
  green:  { color: "linear-gradient(135deg,#10b981 0%,#047857 100%)", borderColor: "rgba(16,185,129,0.3)" },
  orange: { color: "linear-gradient(135deg,#f97316 0%,#ea580c 100%)", borderColor: "rgba(249,115,22,0.3)" },
  cyan:   { color: "linear-gradient(135deg,#06b6d4 0%,#0891b2 100%)", borderColor: "rgba(6,182,212,0.3)" },
  purple: { color: "linear-gradient(135deg,#8b5cf6 0%,#6d28d9 100%)", borderColor: "rgba(139,92,246,0.3)" },
  indigo: { color: "linear-gradient(135deg,#6366f1 0%,#4338ca 100%)", borderColor: "rgba(99,102,241,0.3)" },
  pink:   { color: "linear-gradient(135deg,#ec4899 0%,#be185d 100%)", borderColor: "rgba(236,72,153,0.3)" },
  teal:   { color: "linear-gradient(135deg,#14b8a6 0%,#0f766e 100%)", borderColor: "rgba(20,184,166,0.3)" },
  amber:  { color: "linear-gradient(135deg,#f59e0b 0%,#d97706 100%)", borderColor: "rgba(245,158,11,0.3)" },
  rose:   { color: "linear-gradient(135deg,#f43f5e 0%,#be123c 100%)", borderColor: "rgba(244,63,94,0.3)" },
  violet: { color: "linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%)", borderColor: "rgba(124,58,237,0.3)" },
};

// ---------------------------------------------------------------------------
// SLIDE FACTORIES — shared across businesses (business-specific copy)
// ---------------------------------------------------------------------------

function jobsSlide(headline: string, subline: string, tags: FloatingTag[]): OnboardingSlide {
  return { variant: "jobs", headline, subline, badge: "Real-time dashboard", tags };
}

function scheduleSlide(headline: string, subline: string, tags: FloatingTag[]): OnboardingSlide {
  return { variant: "schedule", headline, subline, badge: "Optimized routes", tags };
}

function estimatesSlide(headline: string, subline: string, tags: FloatingTag[]): OnboardingSlide {
  return { variant: "estimates", headline, subline, badge: "3x faster approvals", tags };
}

function invoicesSlide(headline: string, subline: string, tags: FloatingTag[]): OnboardingSlide {
  return { variant: "invoices", headline, subline, badge: "Auto-reminders", tags };
}

function paymentsSlide(headline: string, subline: string, tags: FloatingTag[]): OnboardingSlide {
  return { variant: "invoices", headline, subline, badge: "5 payment methods", tags };
}

function storeSlide(headline: string, subline: string, tags: FloatingTag[]): OnboardingSlide {
  return { variant: "store", headline, subline, badge: "In-app store", tags };
}

function agreementsSlide(headline: string, subline: string, tags: FloatingTag[]): OnboardingSlide {
  return { variant: "agreements", headline, subline, badge: "Recurring revenue", tags };
}

function employeesSlide(headline: string, subline: string, tags: FloatingTag[]): OnboardingSlide {
  return { variant: "employees", headline, subline, badge: "Individual schedules", tags };
}

function crmSlide(headline: string, subline: string, tags: FloatingTag[]): OnboardingSlide {
  return { variant: "crm", headline, subline, badge: "Integrated CRM", tags };
}

function feedbackSlide(headline: string, subline: string, tags: FloatingTag[]): OnboardingSlide {
  return { variant: "feedback", headline, subline, badge: "Build reputation", tags };
}

function allInOneSlide(headline: string, subline: string, tags: FloatingTag[]): OnboardingSlide {
  return { variant: "jobs", headline, subline, badge: "All-in-one app", tags };
}

// 7-step journey slide factories
function journey1EstimateSlide(headline: string, subline: string, tags: FloatingTag[]): OnboardingSlide {
  return { variant: "estimates", headline, subline, badge: "Step 1", tags };
}
function journey2JobScheduleSlide(headline: string, subline: string, tags: FloatingTag[]): OnboardingSlide {
  return { variant: "jobs", headline, subline, badge: "Step 2", tags };
}
function journey3AgreementSlide(headline: string, subline: string, tags: FloatingTag[]): OnboardingSlide {
  return { variant: "agreements", headline, subline, badge: "Step 3", tags };
}
function journey4RouteSlide(headline: string, subline: string, tags: FloatingTag[]): OnboardingSlide {
  return { variant: "schedule-routes", headline, subline, badge: "Step 4", tags };
}
function journey5JobStatusSlide(headline: string, subline: string, tags: FloatingTag[]): OnboardingSlide {
  return { variant: "jobs-status", headline, subline, badge: "Step 5", tags };
}
function journey6BeforeAfterFeedbackSlide(headline: string, subline: string, tags: FloatingTag[]): OnboardingSlide {
  return { variant: "beforeAfterFeedback", headline, subline, badge: "Step 6", tags };
}
function journey7StorePaymentsSlide(headline: string, subline: string, tags: FloatingTag[]): OnboardingSlide {
  return { variant: "storePayments", headline, subline, badge: "Step 7", tags };
}

// ---------------------------------------------------------------------------
// PLUMBER — 7-step journey
// ---------------------------------------------------------------------------
const plumberSlides: OnboardingSlide[] = [
  journey1EstimateSlide(
    "Create estimate and send to customer for approval",
    "Quote plumbing jobs on-site with line items, labor, and parts. Send by text or email. Customer approves before you leave.",
    [
      { icon: FileText,      label: "On-Site Estimate",  subtitle: "Create in under 2 min", ...TAG.green,  position: "top-right" },
      { icon: ArrowRightLeft, label: "Convert to Invoice", subtitle: "One tap, no re-entry",  ...TAG.blue,   position: "mid-left" },
      { icon: MessageSquare,  label: "Send real-time notifications", subtitle: "Via email and SMS", ...TAG.orange, position: "bottom-right" },
    ]
  ),
  journey2JobScheduleSlide(
    "Create the job and assign it to your employee",
    "Turn approved estimates into jobs. Map each job to an employee's calendar. One tap to assign, drag to reschedule.",
    [
      { icon: UserCheck,   label: "Assign by Skill",    subtitle: "Right tech, right job",  ...TAG.green,  position: "top-right" },
      { icon: Route,       label: "Set employee route", subtitle: "Optimize daily stops",   ...TAG.blue,   position: "mid-left" },
      { icon: Star,        label: "Get customer feedback", subtitle: "After job completion", ...TAG.orange, position: "bottom-right" },
    ]
  ),
  journey3AgreementSlide(
    "Create agreements. Get signed approval. Reduce chargebacks.",
    "Set visit frequency, capture customer signatures on-site, and protect your business with fewer disputes.",
    [
      { icon: Calendar,   label: "Recurring Schedule", subtitle: "Set visit frequency",   ...TAG.purple, position: "top-right" },
      { icon: PenLine,     label: "Get customer signature", subtitle: "Sign on-site",       ...TAG.cyan,   position: "mid-left" },
      { icon: Shield,      label: "Reduce chargeback",  subtitle: "Fewer disputes",       ...TAG.green,  position: "bottom-right" },
    ]
  ),
  journey4RouteSlide(
    "Manage schedules and routes. Save hours every day.",
    "Build optimized routes with job stops in the best order. Drag to reorder. Assign by area. Minimize drive time.",
    [
      { icon: Route,       label: "Create Route",       subtitle: "Drag & reorder stops",   ...TAG.blue,   position: "top-right" },
      { icon: ListOrdered, label: "Reorder Stops",      subtitle: "Optimized sequence",     ...TAG.teal,   position: "mid-left" },
      { icon: Map,         label: "Assign by Area",     subtitle: "Minimize drive time",   ...TAG.purple, position: "bottom-right" },
    ]
  ),
  journey5JobStatusSlide(
    "Track every job status. From scheduled to complete.",
    "Scheduled, In Progress, Completed — see where every plumbing job stands. Techs update status from the field with one tap.",
    [
      { icon: ClipboardList, label: "Scheduled",        subtitle: "Upcoming jobs queued",   ...TAG.blue,   position: "top-right" },
      { icon: Smartphone,   label: "In Progress",      subtitle: "Update from the field",  ...TAG.orange, position: "mid-left" },
      { icon: CheckCheck,   label: "Completed",        subtitle: "Paid & closed",          ...TAG.green,  position: "bottom-right" },
    ]
  ),
  journey6BeforeAfterFeedbackSlide(
    "Document the job. Get the review.",
    "Capture before and after photos. Attach to the job. Share with customers. Send a feedback request — build your 5-star reputation.",
    [
      { icon: Camera,     label: "Before/After Photos", subtitle: "Proof of quality",      ...TAG.pink,   position: "top-right" },
      { icon: Star,       label: "Post-Job Feedback",   subtitle: "5-star reviews",       ...TAG.amber,  position: "mid-left" },
      { icon: Users,      label: "Build Reputation",    subtitle: "More referrals",       ...TAG.green,  position: "bottom-right" },
    ]
  ),
  journey7StorePaymentsSlide(
    "Sell on the go. Get paid your way.",
    "Techs browse your parts catalog, check stock, and sell directly to customers. Card, ACH, NFC Tap to Pay, cash — all options, one app.",
    [
      { icon: ShoppingCart, label: "Sell from Phone",   subtitle: "Catalog in your pocket", ...TAG.teal,   position: "top-right" },
      { icon: CreditCard,   label: "Tap to Pay",       subtitle: "NFC, no reader needed",  ...TAG.orange, position: "mid-left" },
      { icon: Wallet,       label: "5 Payment Options", subtitle: "Card, ACH, cash, more",  ...TAG.blue,   position: "bottom-right" },
    ]
  ),
];

// ---------------------------------------------------------------------------
// ELECTRICIAN — 7-step journey
// ---------------------------------------------------------------------------
const electricianSlides: OnboardingSlide[] = [
  journey1EstimateSlide(
    "Create estimate and send to customer for approval",
    "Quote panel upgrades and installs with labor, materials, and permit fees. Send for approval — customer signs on your phone.",
    [
      { icon: FileText,      label: "Itemized Estimates", subtitle: "Labor + materials",      ...TAG.green,  position: "top-right" },
      { icon: ArrowRightLeft, label: "Convert to Invoice", subtitle: "One tap",               ...TAG.blue,   position: "mid-left" },
      { icon: MessageSquare,  label: "Send real-time notifications", subtitle: "Via email and SMS", ...TAG.orange, position: "bottom-right" },
    ]
  ),
  journey2JobScheduleSlide(
    "Create the job and assign it to your employee",
    "Assign panel upgrades, outlet installs, emergency calls to the right tech. One tap to map to their calendar.",
    [
      { icon: UserCheck,   label: "Skill Matching",     subtitle: "Right tech, right permit", ...TAG.blue,   position: "top-right" },
      { icon: Route,       label: "Set employee route", subtitle: "Optimize daily stops",   ...TAG.orange, position: "mid-left" },
      { icon: Star,        label: "Get customer feedback", subtitle: "After job completion", ...TAG.green,  position: "bottom-right" },
    ]
  ),
  journey3AgreementSlide(
    "Create agreements. Get signed approval. Reduce chargebacks.",
    "Set visit frequency, capture customer signatures on-site, and protect your business with fewer disputes.",
    [
      { icon: Calendar,   label: "Recurring Schedule", subtitle: "Set visit frequency",   ...TAG.purple, position: "top-right" },
      { icon: PenLine,     label: "Get customer signature", subtitle: "Sign on-site",       ...TAG.cyan,   position: "mid-left" },
      { icon: Shield,     label: "Reduce chargeback",  subtitle: "Fewer disputes",       ...TAG.green,  position: "bottom-right" },
    ]
  ),
  journey4RouteSlide(
    "Route your crew across job sites efficiently.",
    "Build optimized daily routes for each electrician. Drag stops to reorder, assign by neighborhood.",
    [
      { icon: Route,       label: "Route Creation",     subtitle: "Build in seconds",      ...TAG.blue,   position: "top-right" },
      { icon: ListOrdered, label: "Reorder Stops",      subtitle: "Drag to optimize",      ...TAG.teal,   position: "mid-left" },
      { icon: Navigation,  label: "Zone Dispatch",      subtitle: "Assign by location",    ...TAG.indigo, position: "bottom-right" },
    ]
  ),
  journey5JobStatusSlide(
    "Track every job status. From scheduled to complete.",
    "Scheduled, In Progress, Completed — see where every wiring job stands. Techs update status from the field.",
    [
      { icon: ClipboardList, label: "Scheduled",       subtitle: "Upcoming jobs queued",   ...TAG.blue,   position: "top-right" },
      { icon: Smartphone,   label: "In Progress",     subtitle: "Update from the field",  ...TAG.orange, position: "mid-left" },
      { icon: CheckCheck,   label: "Completed",        subtitle: "Paid & closed",          ...TAG.green,  position: "bottom-right" },
    ]
  ),
  journey6BeforeAfterFeedbackSlide(
    "Document the job. Get the review.",
    "Before and after photos attached to every job. Share with customers. Send feedback request — build your 5-star reputation.",
    [
      { icon: Camera,     label: "Before/After Photos", subtitle: "Proof of quality",     ...TAG.pink,   position: "top-right" },
      { icon: Star,       label: "Post-Job Feedback",   subtitle: "5-star reviews",       ...TAG.amber,  position: "mid-left" },
      { icon: Users,      label: "Build Reputation",    subtitle: "More referrals",        ...TAG.green,  position: "bottom-right" },
    ]
  ),
  journey7StorePaymentsSlide(
    "Sell on the go. Get paid your way.",
    "Browse GFCI outlets, breakers, wire — sell from the truck. Card, ACH, Tap to Pay, cash — all options in one app.",
    [
      { icon: ShoppingCart, label: "Parts Catalog",   subtitle: "Search by keyword",       ...TAG.teal,   position: "top-right" },
      { icon: CreditCard,   label: "Tap to Pay",      subtitle: "Phone is the reader",     ...TAG.orange, position: "mid-left" },
      { icon: Wallet,       label: "5 Payment Options", subtitle: "All methods accepted", ...TAG.blue,   position: "bottom-right" },
    ]
  ),
];

// ---------------------------------------------------------------------------
// HVAC — 7-step journey
// ---------------------------------------------------------------------------
const hvacSlides: OnboardingSlide[] = [
  journey1EstimateSlide(
    "Create estimate and send to customer for approval",
    "Quote equipment replacements, tune-ups, and repairs with refrigerant, labor, and warranty. Customer approves on your phone.",
    [
      { icon: FileText,      label: "Equipment Quote",   subtitle: "Parts + labor + warranty", ...TAG.green, position: "top-right" },
      { icon: ArrowRightLeft, label: "Convert to Invoice", subtitle: "Instant conversion",    ...TAG.blue,  position: "mid-left" },
      { icon: MessageSquare,  label: "Send real-time notifications", subtitle: "Via email and SMS",  ...TAG.cyan,  position: "bottom-right" },
    ]
  ),
  journey2JobScheduleSlide(
    "Create the job and assign it to your employee",
    "Assign installs, tune-ups, emergency calls to certified techs. One tap to map to their calendar.",
    [
      { icon: UserCheck,   label: "Certified Techs",   subtitle: "Match by certification",   ...TAG.blue,   position: "top-right" },
      { icon: Route,       label: "Set employee route", subtitle: "Optimize daily stops",   ...TAG.cyan,   position: "mid-left" },
      { icon: Star,        label: "Get customer feedback", subtitle: "After job completion", ...TAG.green,  position: "bottom-right" },
    ]
  ),
  journey3AgreementSlide(
    "Create agreements. Get signed approval. Reduce chargebacks.",
    "Set visit frequency, capture customer signatures on-site, and protect your business with fewer disputes.",
    [
      { icon: Calendar,   label: "Recurring Schedule", subtitle: "Set visit frequency",    ...TAG.purple, position: "top-right" },
      { icon: PenLine,     label: "Get customer signature", subtitle: "Sign on-site",      ...TAG.cyan,   position: "mid-left" },
      { icon: Shield,     label: "Reduce chargeback", subtitle: "Fewer disputes",        ...TAG.green,  position: "bottom-right" },
    ]
  ),
  journey4RouteSlide(
    "Manage schedules and routes. Plan seasonal efficiency.",
    "Create routes for spring/fall tune-up season. Drag stops to reorder. Assign techs by zone. Minimize drive time.",
    [
      { icon: Route,       label: "Seasonal Routes",   subtitle: "Spring & fall planned",   ...TAG.cyan,   position: "top-right" },
      { icon: ListOrdered, label: "Stop Ordering",    subtitle: "Drag to reorder",         ...TAG.teal,   position: "mid-left" },
      { icon: Map,         label: "Zone Coverage",    subtitle: "Full area mapped",        ...TAG.blue,   position: "bottom-right" },
    ]
  ),
  journey5JobStatusSlide(
    "Track every job status. From scheduled to complete.",
    "Scheduled, In Progress, Completed — see where every HVAC job stands. Techs update status from the field.",
    [
      { icon: ClipboardList, label: "Scheduled",       subtitle: "Upcoming jobs queued",    ...TAG.blue,   position: "top-right" },
      { icon: Smartphone,   label: "In Progress",      subtitle: "Update from the field",   ...TAG.cyan,   position: "mid-left" },
      { icon: CheckCheck,   label: "Completed",        subtitle: "Paid & closed",           ...TAG.green,  position: "bottom-right" },
    ]
  ),
  journey6BeforeAfterFeedbackSlide(
    "Document the job. Get the review.",
    "Before and after photos at every unit. Share with customers. Send feedback request — build your 5-star reputation.",
    [
      { icon: Camera,     label: "Before/After Photos", subtitle: "Proof of quality",     ...TAG.pink,   position: "top-right" },
      { icon: Star,       label: "Post-Job Feedback",   subtitle: "5-star reviews",      ...TAG.amber,  position: "mid-left" },
      { icon: Users,      label: "Build Reputation",    subtitle: "More referrals",       ...TAG.green,  position: "bottom-right" },
    ]
  ),
  journey7StorePaymentsSlide(
    "Sell on the go. Get paid your way.",
    "Techs sell filters and refrigerant from the truck. Card, ACH, Tap to Pay, cash — all options in one app.",
    [
      { icon: ShoppingCart, label: "Filter Catalog",   subtitle: "Find by model number",   ...TAG.teal,   position: "top-right" },
      { icon: CreditCard,   label: "Tap to Pay",       subtitle: "NFC at the unit",        ...TAG.cyan,   position: "mid-left" },
      { icon: Wallet,       label: "5 Payment Options", subtitle: "All methods accepted", ...TAG.blue,   position: "bottom-right" },
    ]
  ),
];

// ---------------------------------------------------------------------------
// CARPENTER — 7-step journey
// ---------------------------------------------------------------------------
const carpenterSlides: OnboardingSlide[] = [
  journey1EstimateSlide(
    "Create estimate and send to customer for approval",
    "Quote cabinet installs, deck builds, renovations with materials, labor, and margin. Send for approval — customer signs on your phone.",
    [
      { icon: FileText,      label: "Material + Labor",  subtitle: "Detailed line items",     ...TAG.green,  position: "top-right" },
      { icon: ArrowRightLeft, label: "Convert to Invoice", subtitle: "One tap, no re-entry", ...TAG.blue,   position: "mid-left" },
      { icon: MessageSquare,  label: "Send real-time notifications", subtitle: "Via email and SMS",  ...TAG.amber,  position: "bottom-right" },
    ]
  ),
  journey2JobScheduleSlide(
    "Create the job and assign it to your employee",
    "Assign cabinet installs, deck builds, renovations to the right crew. One tap to map to their calendar.",
    [
      { icon: UserCheck,   label: "Assign by Skill",    subtitle: "Right carpenter, right job", ...TAG.blue,  position: "top-right" },
      { icon: Route,       label: "Set employee route", subtitle: "Optimize daily stops",   ...TAG.amber, position: "mid-left" },
      { icon: Star,        label: "Get customer feedback", subtitle: "After job completion", ...TAG.green, position: "bottom-right" },
    ]
  ),
  journey3AgreementSlide(
    "Create agreements. Get signed approval. Reduce chargebacks.",
    "Set visit frequency, capture customer signatures on-site, and protect your business with fewer disputes.",
    [
      { icon: Calendar,   label: "Recurring Schedule", subtitle: "Set visit frequency",       ...TAG.purple, position: "top-right" },
      { icon: PenLine,     label: "Get customer signature", subtitle: "Sign on-site",            ...TAG.amber,  position: "mid-left" },
      { icon: Shield,      label: "Reduce chargeback",  subtitle: "Fewer disputes",              ...TAG.green,  position: "bottom-right" },
    ]
  ),
  journey4RouteSlide(
    "Manage schedules and routes. Save hours every day.",
    "Build routes across project sites. Drag stops to reorder. Assign crew by zone. Minimize drive time between jobs.",
    [
      { icon: Route,       label: "Site Routes",        subtitle: "Multiple project stops", ...TAG.amber,  position: "top-right" },
      { icon: ListOrdered, label: "Reorder Sites",      subtitle: "Drag to optimize order", ...TAG.teal,   position: "mid-left" },
      { icon: Calendar,    label: "Crew Calendar",      subtitle: "Daily site schedule",    ...TAG.blue,   position: "bottom-right" },
    ]
  ),
  journey5JobStatusSlide(
    "Track every job status. From scheduled to complete.",
    "Scheduled, In Progress, Completed — see where every project stands. Crew updates status from the site.",
    [
      { icon: ClipboardList, label: "Scheduled",       subtitle: "Upcoming jobs queued",   ...TAG.blue,   position: "top-right" },
      { icon: Smartphone,   label: "In Progress",      subtitle: "Update from the field",  ...TAG.amber,  position: "mid-left" },
      { icon: CheckCheck,   label: "Completed",        subtitle: "Paid & closed",          ...TAG.green,  position: "bottom-right" },
    ]
  ),
  journey6BeforeAfterFeedbackSlide(
    "Document the job. Get the review.",
    "Before and after photos at every project. Share with customers. Send feedback request — build your 5-star reputation.",
    [
      { icon: Camera,     label: "Before/After Photos", subtitle: "Build your portfolio",   ...TAG.pink,   position: "top-right" },
      { icon: Star,       label: "Post-Job Feedback",   subtitle: "5-star reviews",       ...TAG.amber,  position: "mid-left" },
      { icon: Users,      label: "Build Reputation",    subtitle: "More referrals",        ...TAG.green,  position: "bottom-right" },
    ]
  ),
  journey7StorePaymentsSlide(
    "Sell on the go. Get paid your way.",
    "Browse lumber, hardware, finish supplies — sell from the truck. Card, ACH, Tap to Pay, cash — all options in one app.",
    [
      { icon: ShoppingCart, label: "Supplies Catalog",  subtitle: "Lumber to hardware",    ...TAG.teal,   position: "top-right" },
      { icon: CreditCard,   label: "Tap to Pay",       subtitle: "NFC at project site",    ...TAG.amber,  position: "mid-left" },
      { icon: Wallet,       label: "5 Payment Options", subtitle: "Deposit to final pay",  ...TAG.blue,   position: "bottom-right" },
    ]
  ),
];

// ---------------------------------------------------------------------------
// GENERAL — 7-step journey
// ---------------------------------------------------------------------------
const generalSlides: OnboardingSlide[] = [
  journey1EstimateSlide(
    "Create estimate and send to customer for approval",
    "Quote any service — plumbing, electrical, HVAC, carpentry — with line items and labor. Send for approval. Customer signs on your phone.",
    [
      { icon: FileText,      label: "Any Trade Quote",   subtitle: "One estimate, all work",    ...TAG.green,  position: "top-right" },
      { icon: ArrowRightLeft, label: "Convert to Invoice", subtitle: "Instant, no re-entry",   ...TAG.blue,   position: "mid-left" },
      { icon: MessageSquare,  label: "Send real-time notifications", subtitle: "Via email and SMS",       ...TAG.purple, position: "bottom-right" },
    ]
  ),
  journey2JobScheduleSlide(
    "Create the job and assign it to your employee",
    "Assign any trade to the right tech. One tap to map to their calendar. Plumbing, electrical, HVAC — all in one view.",
    [
      { icon: UserCheck,   label: "Assign by Trade",    subtitle: "Right tech, right job",   ...TAG.blue,   position: "top-right" },
      { icon: Route,       label: "Set employee route", subtitle: "Optimize daily stops",   ...TAG.purple, position: "mid-left" },
      { icon: Star,        label: "Get customer feedback", subtitle: "After job completion", ...TAG.green,  position: "bottom-right" },
    ]
  ),
  journey3AgreementSlide(
    "Create agreements. Get signed approval. Reduce chargebacks.",
    "Set visit frequency, capture customer signatures on-site, and protect your business with fewer disputes.",
    [
      { icon: Calendar,   label: "Recurring Schedule", subtitle: "Set visit frequency",       ...TAG.purple, position: "top-right" },
      { icon: PenLine,     label: "Get customer signature", subtitle: "Sign on-site",       ...TAG.cyan,   position: "mid-left" },
      { icon: Shield,      label: "Reduce chargeback",  subtitle: "Fewer disputes",        ...TAG.green,  position: "bottom-right" },
    ]
  ),
  journey4RouteSlide(
    "Manage schedules and routes. Optimize across all trades.",
    "Build daily routes for plumbers, electricians, HVAC techs. Drag to reorder. Assign by zone. Minimize drive time.",
    [
      { icon: Route,       label: "Cross-Trade Routes", subtitle: "All teams, one view",   ...TAG.purple, position: "top-right" },
      { icon: ListOrdered, label: "Reorder Stops",      subtitle: "Drag to resequence",    ...TAG.teal,   position: "mid-left" },
      { icon: Map,         label: "Zone Dispatch",      subtitle: "Assign by location",    ...TAG.blue,   position: "bottom-right" },
    ]
  ),
  journey5JobStatusSlide(
    "Track every job status. From scheduled to complete.",
    "Scheduled, In Progress, Completed — see where every job stands across all trades. Techs update status from the field.",
    [
      { icon: ClipboardList, label: "Scheduled",       subtitle: "Upcoming jobs queued",   ...TAG.blue,   position: "top-right" },
      { icon: Smartphone,   label: "In Progress",      subtitle: "Update from the field",  ...TAG.purple, position: "mid-left" },
      { icon: CheckCheck,   label: "Completed",        subtitle: "Paid & closed",          ...TAG.green,  position: "bottom-right" },
    ]
  ),
  journey6BeforeAfterFeedbackSlide(
    "Document the job. Get the review.",
    "Before and after photos for every job. Share with customers. Send feedback request — build your 5-star reputation.",
    [
      { icon: Camera,     label: "Before/After Photos", subtitle: "Proof of quality",     ...TAG.pink,   position: "top-right" },
      { icon: Star,       label: "Post-Job Feedback",   subtitle: "5-star reviews",       ...TAG.amber,  position: "mid-left" },
      { icon: Users,      label: "Build Reputation",    subtitle: "More referrals",       ...TAG.green,  position: "bottom-right" },
    ]
  ),
  journey7StorePaymentsSlide(
    "Sell on the go. Get paid your way.",
    "Techs sell parts for any trade from the truck. Card, ACH, Tap to Pay, cash — all options in one app.",
    [
      { icon: ShoppingCart, label: "Multi-Trade Store", subtitle: "Parts for every job",   ...TAG.teal,   position: "top-right" },
      { icon: CreditCard,   label: "Tap to Pay",        subtitle: "Phone is the terminal", ...TAG.purple, position: "mid-left" },
      { icon: Wallet,       label: "5 Payment Options", subtitle: "All methods tracked",  ...TAG.blue,   position: "bottom-right" },
    ]
  ),
];

// ---------------------------------------------------------------------------
// BUSINESS TYPES
// ---------------------------------------------------------------------------
export const businessTypes: BusinessConfig[] = [
  {
    id: "plumber",
    name: "Pro Plumbing Services",
    icon: Wrench,
    color: "from-blue-500 to-blue-600",
    description: "Residential & Commercial Plumbing",
    tagline: "Stop chasing paperwork. Start growing your business.",
    slides: plumberSlides,
  },
  {
    id: "carpenter",
    name: "Master Carpentry Co.",
    icon: Hammer,
    color: "from-amber-600 to-amber-700",
    description: "Custom Woodwork & Renovation",
    tagline: "Accurate estimates. On-time delivery. Happy customers.",
    slides: carpenterSlides,
  },
  {
    id: "electrician",
    name: "Elite Electric Solutions",
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
    description: "Electrical Installation & Repair",
    tagline: "Organized. Compliant. Profitable.",
    slides: electricianSlides,
  },
  {
    id: "hvac",
    name: "Cool Comfort HVAC",
    icon: Wind,
    color: "from-cyan-500 to-blue-600",
    description: "Heating, Cooling & Air Quality",
    tagline: "Recurring revenue. Less admin. More service.",
    slides: hvacSlides,
  },
  {
    id: "general",
    name: "General Service",
    icon: Briefcase,
    color: "from-purple-500 to-indigo-600",
    description: "Multi-Service & General Contractor",
    tagline: "One app for your entire operation.",
    slides: generalSlides,
  },
];

export const getOnboardingContent = (businessId: BusinessId): BusinessConfig | undefined =>
  businessTypes.find((b) => b.id === businessId);

/** Hero/welcome screen content shown before business selection */
export const heroContent = {
  headline: "Run your service business from your pocket",
  subline: "Schedule jobs. Send estimates. Get paid same day. Everything field pros need — in one app.",
  statLine: "Join thousands of pros who save 15+ hours every week",
  ctaText: "See how it works for you",
};

/** Power Features - unique differentiators (3 slides) */
export interface PowerFeatureSlide {
  icon: LucideIcon;
  headline: string;
  subline: string;
  badge: string;
}

export const powerFeaturesSlides: PowerFeatureSlide[] = [
  {
    icon: ArrowRightLeft,
    headline: "Estimate to Invoice in One Tap",
    subline: "Convert approved estimates to invoices instantly. No re-typing. Customer, line items, and totals flow automatically — one tap and you're billing. Get paid faster.",
    badge: "Zero data re-entry",
  },
  {
    icon: Camera,
    headline: "Before/After Service Pictures",
    subline: "Document every job with before and after photos attached directly to the job. Share with customers, use for disputes, build your portfolio. Visual proof that builds trust.",
    badge: "Visual proof for every job",
  },
  {
    icon: CreditCard,
    headline: "Pay on the Spot",
    subline: "Collect payment before you leave. Cards, ACH, cash — or Tap to Pay with NFC. No chasing invoices. Get paid same day, every day.",
    badge: "Same-day payment",
  },
];

/** Feature Deep-Dive - comprehensive feature list */
export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  colorClass: string;
}

export const allFeatures: FeatureItem[] = [
  {
    icon: ClipboardList,
    title: "Jobs & Scheduling",
    description: "Assign by skill. Create optimized routes. Convert estimates to jobs. Real-time status.",
    colorClass: "blue",
  },
  {
    icon: FileText,
    title: "Estimates",
    description: "Create on-site. Convert to invoice in one tap. Pay Now. Send via text or email.",
    colorClass: "green",
  },
  {
    icon: DollarSign,
    title: "Invoices",
    description: "Single and recurring. Payment tracking. Due date alerts. Auto-reminders.",
    colorClass: "emerald",
  },
  {
    icon: ClipboardList,
    title: "Service Agreements",
    description: "Maintenance plans and recurring visits. Auto-renewals. Seasonal reminders.",
    colorClass: "purple",
  },
  {
    icon: Package,
    title: "Inventory + Store",
    description: "Stock tracking. Low-stock alerts. In-app store — techs sell to customers on site.",
    colorClass: "amber",
  },
  {
    icon: Users,
    title: "Employees",
    description: "Individual schedules. Availability tracking. Performance metrics per person.",
    colorClass: "indigo",
  },
  {
    icon: Camera,
    title: "Service Pictures",
    description: "Before/after photos attached to jobs. Customer gallery. Full-screen viewer.",
    colorClass: "pink",
  },
  {
    icon: CreditCard,
    title: "5 Payment Methods",
    description: "Cards, ACH, Tap to Pay NFC, check, and cash. All tracked automatically.",
    colorClass: "teal",
  },
  {
    icon: UserCheck,
    title: "Customer CRM",
    description: "Full job history, contact info, notes, and follow-ups per customer. Integrated.",
    colorClass: "violet",
  },
  {
    icon: Star,
    title: "Customer Feedback",
    description: "Post-job surveys sent automatically. Ratings build reputation and referrals.",
    colorClass: "amber",
  },
  {
    icon: BarChart3,
    title: "Reports",
    description: "Revenue by trade, employee performance, invoice aging. Export PDF and Excel.",
    colorClass: "slate",
  },
  {
    icon: Layers,
    title: "Multi-Trade",
    description: "One app for plumbing, electrical, HVAC, and more. Unified dispatch and billing.",
    colorClass: "violet",
  },
];
