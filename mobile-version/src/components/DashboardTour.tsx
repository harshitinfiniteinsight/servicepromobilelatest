import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

const TOUR_STEPS = [
  {
    id: "tour-customers",
    title: "👥 Customers",
    text: "Create your first customer here. Add their name and contact details to get started.",
  },
  {
    id: "tour-estimates",
    title: "📄 Estimates",
    text: "Create and send estimates to your customers in minutes. Once approved, you can convert them into invoices.",
  },
  {
    id: "tour-jobs",
    title: "🔨 Jobs",
    text: "Manage and track all your jobs in one place. Assign work and monitor progress easily.",
  },
  {
    id: "tour-invoices",
    title: "💰 Invoices",
    text: "Generate invoices from approved estimates or create them directly to bill your customers.",
  },
  {
    id: "tour-scheduled-routes",
    title: "🗺️ Scheduled Routes",
    text: "Plan and organize your team's daily routes and appointments efficiently.",
  },
  {
    id: "tour-employees",
    title: "👷 Employees",
    text: "Add your team members and assign jobs to keep everything running smoothly.",
  },
  {
    id: "tour-payments",
    title: "💳 Collect Payments",
    text: "Record and track payments from customers to keep your finances up to date.",
  },
  {
    id: "tour-dashboard",
    title: "🏠 Dashboard",
    text: "This is your dashboard. Get a quick overview of your business activity and performance.",
  },
];

const TOUR_KEY = "sp911_tour_completed";

function getRect(id: string): DOMRect | null {
  const el = document.querySelector(`[data-tour-id="${id}"]`);
  return el ? el.getBoundingClientRect() : null;
}

export default function DashboardTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      const t = setTimeout(() => setActive(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  const finish = useCallback(() => {
    setActive(false);
    localStorage.setItem(TOUR_KEY, "true");
  }, []);

  useEffect(() => {
    if (!active) return;
    let s = step;
    while (s < TOUR_STEPS.length) {
      const r = getRect(TOUR_STEPS[s].id);
      if (r) {
        // Scroll element into view then re-measure
        const el = document.querySelector(`[data-tour-id="${TOUR_STEPS[s].id}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        setTimeout(() => {
          const fresh = getRect(TOUR_STEPS[s].id);
          if (fresh) setRect(fresh);
        }, 300);
        setRect(r);
        return;
      }
      s++;
    }
    finish();
  }, [active, step, finish]);

  const next = () => { if (step < TOUR_STEPS.length - 1) setStep(s => s + 1); else finish(); };
  const back = () => { if (step > 0) setStep(s => s - 1); };

  if (!active || !rect) return null;

  const cur = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const isFirst = step === 0;

  const GAP = 12;
  const TT_W = Math.min(296, window.innerWidth - 32);
  const TT_H = 180;
  const vH = window.innerHeight;
  const vW = window.innerWidth;
  const PAD = 8;

  const hl = { top: rect.top - PAD, left: rect.left - PAD, w: rect.width + PAD * 2, h: rect.height + PAD * 2 };

  let ttTop = rect.bottom + GAP;
  if (ttTop + TT_H > vH - 16) ttTop = rect.top - TT_H - GAP;
  let ttLeft = rect.left + rect.width / 2 - TT_W / 2;
  ttLeft = Math.max(16, Math.min(ttLeft, vW - TT_W - 16));

  const arrowUp = ttTop > rect.bottom;
  const arrowX = Math.min(Math.max(rect.left + rect.width / 2 - ttLeft - 8, 16), TT_W - 32);

  return createPortal(
    <>
      {/* Overlay */}
      <div style={{ position: "fixed", inset: 0, zIndex: 9998, pointerEvents: "all" }} onClick={finish}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <mask id="sp-tour-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect x={hl.left} y={hl.top} width={hl.w} height={hl.h} rx={10} fill="black" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#sp-tour-mask)" />
        </svg>
      </div>

      {/* Highlight ring */}
      <div style={{
        position: "fixed", top: hl.top, left: hl.left, width: hl.w, height: hl.h,
        borderRadius: 10, border: "2px solid #f85520",
        boxShadow: "0 0 0 4px rgba(248,85,32,.25)",
        zIndex: 9999, pointerEvents: "none",
        animation: "sp-tour-pulse 1.8s ease-in-out infinite",
      }} />

      {/* Tooltip */}
      <div
        style={{ position: "fixed", top: ttTop, left: ttLeft, width: TT_W, zIndex: 10000, pointerEvents: "all" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Arrow */}
        <div style={{
          position: "absolute",
          ...(arrowUp ? { top: -8 } : { bottom: -8 }),
          left: arrowX, width: 0, height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          ...(arrowUp
            ? { borderBottom: "8px solid #fff", filter: "drop-shadow(0 -1px 1px rgba(0,0,0,.07))" }
            : { borderTop: "8px solid #fff", filter: "drop-shadow(0 1px 1px rgba(0,0,0,.07))" }),
        }} />

        {/* Card */}
        <div style={{
          background: "#fff", borderRadius: 16, padding: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,.18)", border: "1px solid rgba(0,0,0,.06)",
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{cur.title}</span>
            <button onClick={finish} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9ca3af", display: "flex", alignItems: "center" }} aria-label="Skip tour">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6, margin: "0 0 14px" }}>{cur.text}</p>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Step dots */}
            <div style={{ display: "flex", gap: 5 }}>
              {TOUR_STEPS.map((_, i) => (
                <div key={i} style={{
                  width: i === step ? 16 : 6, height: 6, borderRadius: 3,
                  background: i === step ? "#f85520" : "#e5e7eb",
                  transition: "width .25s, background .25s",
                }} />
              ))}
            </div>
            {/* Buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              {!isFirst && (
                <button onClick={back} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "6px 12px", borderRadius: 8,
                  border: "1.5px solid #e5e7eb", background: "#fff",
                  fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer",
                }}>
                  <ChevronLeft size={14} /> Back
                </button>
              )}
              <button onClick={next} style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "6px 14px", borderRadius: 8, border: "none",
                background: "linear-gradient(135deg,#f85520,#ff7340)",
                fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer",
                boxShadow: "0 3px 10px rgba(248,85,32,.35)",
              }}>
                {isLast ? "Done 🎉" : <><span>Next</span><ChevronRight size={14} /></>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sp-tour-pulse {
          0%,100% { box-shadow: 0 0 0 4px rgba(248,85,32,.25); }
          50%      { box-shadow: 0 0 0 9px rgba(248,85,32,.08); }
        }
      `}</style>
    </>,
    document.body
  );
}

/** Call this to reset the tour (useful for testing) */
export function resetTour() {
  localStorage.removeItem(TOUR_KEY);
}
