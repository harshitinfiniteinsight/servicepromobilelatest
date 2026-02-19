import { cn } from "@/lib/utils";
import { Camera, CheckCheck, Star, Send } from "lucide-react";

interface FeedbackItem {
  customerName: string;
  rating: number;
  comment: string;
  jobRef: string;
  daysAgo: number;
}

interface BeforeAfterFeedbackPreviewProps {
  feedback: FeedbackItem[];
  className?: string;
}

const ratingColors = ["text-red-400", "text-orange-400", "text-amber-400", "text-amber-400", "text-green-500"];

const BeforeAfterFeedbackPreview = ({ feedback, className }: BeforeAfterFeedbackPreviewProps) => {
  const item = feedback[0];
  const secondItem = feedback[1];

  return (
    <div className={cn("space-y-2.5", className)}>
      {/* Job + Photos section */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-foreground">JOB-0042</span>
          <span className="text-[9px] text-muted-foreground">Pipe Repair</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800/80 aspect-[4/3] flex flex-col items-center justify-center gap-0.5">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <Camera className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">Before</span>
            <span className="text-[8px] text-slate-400">Tap to add</span>
          </div>
          <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 aspect-[4/3] flex flex-col items-center justify-center gap-0.5 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-200 dark:bg-emerald-800/60 flex items-center justify-center">
              <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400">After</span>
          </div>
        </div>
      </div>

      {/* Send feedback CTA */}
      <button className="w-full py-1.5 px-2 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center gap-1.5 hover:bg-primary/20 transition-colors">
        <Send className="w-3 h-3 text-primary" />
        <span className="text-[10px] font-semibold text-primary">Send feedback request</span>
      </button>

      {/* Customer reviews */}
      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Customer Reviews</p>
      <div className="space-y-1.5">
        {item && (
          <div className="p-2.5 rounded-xl border-l-4 border-l-amber-500 border border-border/40 bg-gradient-to-r from-amber-50/50 to-white dark:from-amber-950/20 dark:to-zinc-900 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn("w-3 h-3", star <= item.rating ? cn("fill-amber-400 text-amber-400") : "text-muted-foreground/20")}
                  />
                ))}
              </div>
              <span className="text-[9px] text-muted-foreground flex-shrink-0">{item.daysAgo}d ago</span>
            </div>
            <p className="text-[11px] font-semibold truncate">{item.customerName}</p>
            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">&ldquo;{item.comment}&rdquo;</p>
          </div>
        )}
        {secondItem && (
          <div className="p-2 rounded-xl border border-border/40 bg-muted/30 dark:bg-zinc-900/60">
            <div className="flex items-center gap-0.5 mb-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn("w-2.5 h-2.5", star <= secondItem.rating ? cn("fill-amber-400 text-amber-400") : "text-muted-foreground/20")}
                />
              ))}
              <span className="text-[8px] text-muted-foreground ml-1">{secondItem.daysAgo}d ago</span>
            </div>
            <p className="text-[10px] font-semibold truncate">{secondItem.customerName}</p>
            <p className="text-[9px] text-muted-foreground line-clamp-2">&ldquo;{secondItem.comment}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeforeAfterFeedbackPreview;
