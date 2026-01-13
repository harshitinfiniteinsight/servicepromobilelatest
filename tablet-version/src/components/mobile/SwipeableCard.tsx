import { useState, useRef } from "react";
import { Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableCardProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

const SwipeableCard = ({ children, onEdit, onDelete, className }: SwipeableCardProps) => {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const actionWidth = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentX.current = e.touches[0].clientX;
    const diff = startX.current - currentX.current;
    
    if (diff > 0) {
      setOffset(Math.min(diff, actionWidth * (onEdit && onDelete ? 2 : 1)));
    } else {
      setOffset(0);
    }
  };

  const handleTouchEnd = () => {
    if (offset > 40) {
      setOffset(actionWidth * (onEdit && onDelete ? 2 : 1));
    } else {
      setOffset(0);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute right-0 top-0 bottom-0 flex">
        {onEdit && (
          <button
            className="w-20 bg-primary text-primary-foreground flex items-center justify-center touch-target"
            onClick={() => {
              onEdit();
              setOffset(0);
            }}
          >
            <Edit className="h-5 w-5" />
          </button>
        )}
        {onDelete && (
          <button
            className="w-20 bg-destructive text-destructive-foreground flex items-center justify-center touch-target"
            onClick={() => {
              onDelete();
              setOffset(0);
            }}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>
      <div
        ref={cardRef}
        className={cn(
          "transition-transform duration-200 bg-background",
          className
        )}
        style={{
          transform: `translateX(-${offset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableCard;


