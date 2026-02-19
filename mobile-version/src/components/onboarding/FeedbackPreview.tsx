import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface FeedbackItem {
  id: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  jobRef: string;
  daysAgo: number;
}

interface FeedbackPreviewProps {
  items: FeedbackItem[];
  className?: string;
}

const ratingColors = ["text-red-400", "text-orange-400", "text-yellow-400", "text-amber-400", "text-green-500"];

const FeedbackPreview = ({ items, className }: FeedbackPreviewProps) => {
  if (!items.length) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "p-3 rounded-xl border-l-4 border-l-amber-500 border border-border/60",
            "bg-gradient-to-r from-white to-amber-50/30 dark:from-zinc-900/90 dark:to-amber-950/20",
            "backdrop-blur-xl shadow-xl shadow-black/10 animate-in fade-in duration-300"
          )}
          style={{ animationDelay: `${index * 80}ms` } as React.CSSProperties}
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <p className="font-semibold text-sm">{item.customerName}</p>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">{item.daysAgo}d ago</span>
          </div>

          {/* Star rating */}
          <div className="flex items-center gap-0.5 mb-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-3 h-3",
                  star <= item.rating
                    ? cn("fill-current", ratingColors[item.rating - 1])
                    : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            "{item.comment}"
          </p>

          <p className="text-[10px] text-muted-foreground/60 mt-1.5">{item.jobRef}</p>
        </div>
      ))}
    </div>
  );
};

export default FeedbackPreview;
