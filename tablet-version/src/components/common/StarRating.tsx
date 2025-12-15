import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const StarRating = ({
  rating,
  onRatingChange,
  maxRating = 5,
  size = "md",
  disabled = false,
}: StarRatingProps) => {
  const sizeClasses = {
    sm: "h-5 w-5", // 20px (h-5 = 1.25rem = 20px)
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const handleClick = (value: number) => {
    if (!disabled) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center" style={{ gap: size === "sm" ? "8px" : "4px" }}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const value = index + 1;
        const isFilled = value <= rating;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(value)}
            disabled={disabled}
            className={cn(
              "transition-all duration-150 active:scale-95",
              !disabled && "cursor-pointer hover:scale-110",
              disabled && "cursor-not-allowed opacity-50"
            )}
            aria-label={`Rate ${value} out of ${maxRating}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled
                  ? "fill-[#F57C00] text-[#F57C00]"
                  : "fill-none text-gray-300 stroke-gray-300 stroke-2"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;

