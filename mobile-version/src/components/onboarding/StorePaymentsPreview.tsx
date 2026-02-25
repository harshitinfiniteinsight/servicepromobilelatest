import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  Package,
  CreditCard,
  Wallet,
  Smartphone,
  FileText,
  Calendar,
  Droplet,
  Zap,
  ThermometerSnowflake,
  Hammer,
  Bug,
  TreeDeciduous,
  type LucideIcon,
} from "lucide-react";

interface StoreItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface InvoicePreview {
  id: string;
  customerName: string;
  dueDate: string;
  amount: number;
  status: string;
}

interface StorePaymentsPreviewProps {
  items: StoreItem[];
  invoices?: InvoicePreview[];
  className?: string;
}

const categoryIcons: Record<string, LucideIcon> = {
  fittings: Droplet,
  drain: Droplet,
  seals: Droplet,
  outlets: Zap,
  connectors: Zap,
  breakers: Zap,
  filters: ThermometerSnowflake,
  refrigerant: ThermometerSnowflake,
  controls: ThermometerSnowflake,
  lumber: Hammer,
  fasteners: Hammer,
  finish: Hammer,
  hvac: ThermometerSnowflake,
  electrical: Zap,
  plumbing: Droplet,
  "pest": Bug,
  treatment: Bug,
  rodents: Bug,
  mulch: TreeDeciduous,
  fertilizer: TreeDeciduous,
  equipment: TreeDeciduous,
};

function getCategoryIcon(category: string): LucideIcon {
  const key = category.toLowerCase().split(/\s+/)[0];
  return categoryIcons[key] ?? Package;
}

const StorePaymentsPreview = ({ items, invoices = [], className }: StorePaymentsPreviewProps) => {
  const item = items[0];
  const invoice = invoices[0];

  return (
    <div className={cn("space-y-3", className)}>
      {/* Store product card - fixed layout, non-responsive */}
      {item && (
        <div className="p-3 rounded-xl border-l-[4px] border-l-teal-500 border border-border/50 bg-white/95 dark:bg-zinc-900/95 shadow-sm w-full min-w-0">
          <div className="grid grid-cols-[36px_1fr] gap-2">
            <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
              {(() => {
                const Icon = getCategoryIcon(item.category);
                return <Icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
              })()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-xs leading-snug break-words">{item.name}</p>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                {item.category} · {item.stock} in stock
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end mt-2">
            <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-500 text-white text-[10px] font-semibold flex-shrink-0 whitespace-nowrap">
              <ShoppingCart className="w-3 h-3" />
              Sell
            </button>
          </div>
        </div>
      )}

      {/* Invoice view */}
      {invoice && (
        <div className="p-2.5 rounded-lg border-l-[3px] border-l-emerald-500 border border-border/50 bg-white/95 dark:bg-zinc-900/95 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Recent Invoice</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-xs">{invoice.id}</span>
            <Badge
              className={cn(
                "text-[9px] px-1.5 py-0 h-3.5",
                invoice.status === "Paid"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              )}
            >
              {invoice.status === "Paid" ? "Paid" : "Open"}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{invoice.customerName}</p>
          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border/40">
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <Calendar className="h-2.5 w-2.5" />
              Due {new Date(invoice.dueDate).toLocaleDateString()}
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">${invoice.amount.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Payment options */}
      <p className="text-[9px] font-semibold text-muted-foreground uppercase">Payment options</p>
      <div className="grid grid-cols-3 gap-1">
        {[
          { label: "Card", icon: CreditCard },
          { label: "ACH", icon: Wallet },
          { label: "NFC Tap", icon: Smartphone },
        ].map((m) => (
          <div
            key={m.label}
            className={cn(
              "py-1.5 rounded-lg text-center text-[9px] font-bold border",
              m.label === "NFC Tap" ? "bg-primary text-white border-primary/30" : "bg-muted/40 text-foreground border-border/40"
            )}
          >
            <m.icon className="w-3 h-3 mx-auto mb-0.5" />
            {m.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StorePaymentsPreview;
