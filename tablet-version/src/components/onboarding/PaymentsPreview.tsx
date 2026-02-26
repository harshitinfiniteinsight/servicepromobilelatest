import { cn } from "@/lib/utils";
import { CreditCard, Wallet, Smartphone, Banknote, FileCheck, CheckCircle } from "lucide-react";

interface PaymentsPreviewProps {
  className?: string;
}

const paymentMethods = [
  { label: "Credit Card", subtitle: "Visa, MC, Amex", icon: CreditCard, accent: "bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-400" },
  { label: "ACH Transfer", subtitle: "Bank direct", icon: Wallet, accent: "bg-indigo-500/15 border-indigo-500/30 text-indigo-700 dark:text-indigo-400" },
  { label: "NFC Tap to Pay", subtitle: "No reader needed", icon: Smartphone, accent: "bg-orange-500/15 border-orange-500/30 text-orange-700 dark:text-orange-400" },
  { label: "Cash", subtitle: "Tracked in-app", icon: Banknote, accent: "bg-green-500/15 border-green-500/30 text-green-700 dark:text-green-400" },
  { label: "Check", subtitle: "Photo capture", icon: FileCheck, accent: "bg-purple-500/15 border-purple-500/30 text-purple-700 dark:text-purple-400" },
];

const PaymentsPreview = ({ className }: PaymentsPreviewProps) => {
  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center gap-1.5 pb-1 border-b border-border/40">
        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
        <span className="text-[11px] font-bold text-green-600 dark:text-green-400">INV-0042 Paid</span>
        <span className="text-[11px] font-bold text-green-600 dark:text-green-400 ml-auto">$485</span>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {paymentMethods.map((m, i) => (
          <div
            key={m.label}
            className={cn(
              "flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border-2 transition-all",
              m.accent,
              i === 2 && "ring-2 ring-orange-400/50 ring-offset-1 ring-offset-background"
            )}
          >
            <m.icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold leading-tight text-center">{m.label}</span>
            <span className="text-[8px] opacity-70 leading-tight">{m.subtitle}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentsPreview;
