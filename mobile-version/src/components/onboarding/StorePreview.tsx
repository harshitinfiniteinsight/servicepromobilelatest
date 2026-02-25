import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  Package,
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

interface StorePreviewProps {
  items: StoreItem[];
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
  "pest control": Bug,
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

const StorePreview = ({ items, className }: StorePreviewProps) => {
  if (!items.length) return null;

  return (
    <div className={cn("space-y-3 w-full", className)}>
      {items.map((item, index) => {
        const Icon = getCategoryIcon(item.category);
        return (
          <div
            key={item.id}
            className={cn(
              "p-3 rounded-xl border-l-4 border-l-teal-500 border border-border/60 w-full min-w-0",
              "bg-gradient-to-r from-white to-teal-50/30 dark:from-zinc-900/90 dark:to-teal-950/20",
              "backdrop-blur-xl shadow-xl shadow-black/10 animate-in fade-in duration-300"
            )}
            style={{ animationDelay: `${index * 80}ms` } as React.CSSProperties}
          >
            {/* Fixed, non-responsive layout: grid prevents reflow */}
            <div className="grid grid-cols-[40px_1fr] gap-2">
              <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0 col-span-1">
                <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="min-w-0 col-span-1">
                <p className="font-semibold text-xs leading-snug break-words">{item.name}</p>
                <p className="text-[11px] text-muted-foreground">{item.category}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 mt-2 flex-nowrap">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400 whitespace-nowrap">
                ${item.price.toFixed(2)}
              </span>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {item.stock} in stock
              </span>
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-500 text-white text-[10px] font-semibold shadow-sm flex-shrink-0 whitespace-nowrap">
                <ShoppingCart className="w-3 h-3" />
                Sell
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StorePreview;
