import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0 && !refreshing) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY.current);
      
      if (distance > 0) {
        setPulling(true);
        setPullDistance(Math.min(distance, threshold * 1.5));
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    setPulling(false);
    setPullDistance(0);
    startY.current = 0;
  };

  return (
    <div className="relative h-full overflow-hidden">
      {(pulling || refreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center transition-transform"
          style={{
            transform: `translateY(${pulling ? pullDistance - 40 : refreshing ? 20 : -40}px)`,
            height: "40px",
          }}
        >
          <Loader2 className={cn("h-5 w-5", refreshing && "animate-spin")} />
        </div>
      )}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto scrollable"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;

