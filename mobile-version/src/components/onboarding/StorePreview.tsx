import { cn } from "@/lib/utils";
import { ShoppingCart, Package } from "lucide-react";

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

const StorePreview = ({ items, className }: StorePreviewProps) => {
  if (!items.length) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "p-3 rounded-xl border-l-4 border-l-teal-500 border border-border/60",
            "bg-gradient-to-r from-white to-teal-50/30 dark:from-zinc-900/90 dark:to-teal-950/20",
            "backdrop-blur-xl shadow-xl shadow-black/10 animate-in fade-in duration-300"
          )}
          style={{ animationDelay: `${index * 80}ms` } as React.CSSProperties}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.category}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-teal-700 dark:text-teal-400">
                  ${item.price.toFixed(2)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {item.stock} in stock
                </span>
              </div>
            </div>

            <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-500 text-white text-[10px] font-semibold shadow-sm flex-shrink-0">
              <ShoppingCart className="w-3 h-3" />
              Sell
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StorePreview;
