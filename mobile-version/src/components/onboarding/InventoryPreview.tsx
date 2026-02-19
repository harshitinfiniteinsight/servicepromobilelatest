import { Package, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryItemPreview {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  lowStockThreshold: number;
  unitPrice: number;
}

interface InventoryPreviewProps {
  items: InventoryItemPreview[];
  className?: string;
}

const InventoryPreview = ({ items, className }: InventoryPreviewProps) => {
  if (!items.length) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, index) => {
        const isLowStock = item.stock <= item.lowStockThreshold;
        return (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border-l-4 border border",
              isLowStock
                ? "border-l-amber-500 border-amber-300/60 bg-gradient-to-r from-amber-50/50 to-amber-50/20 dark:from-amber-950/30 dark:to-amber-950/10 dark:border-amber-700/40"
                : "border-l-cyan-500 border-border/60 bg-gradient-to-r from-white to-cyan-50/30 dark:from-zinc-900/80 dark:to-cyan-950/20",
              "backdrop-blur-sm shadow-lg shadow-black/5 animate-in fade-in duration-300"
            )}
            style={{ animationDelay: `${index * 80}ms` } as React.CSSProperties}
          >
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                isLowStock ? "bg-amber-200/50 dark:bg-amber-800/30" : "bg-primary/10"
              )}
            >
              {isLowStock ? (
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <Package className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base truncate">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.category} • ${item.unitPrice.toFixed(2)} each
              </p>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <span
                className={cn(
                  "font-bold text-sm",
                  isLowStock ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                )}
              >
                {item.stock}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Low: {item.lowStockThreshold}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InventoryPreview;
