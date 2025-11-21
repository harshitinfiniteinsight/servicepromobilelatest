import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ClockDialProps {
  hours: number;
  minutes: number;
  onHoursChange: (hours: number) => void;
  onMinutesChange: (minutes: number) => void;
}

const ClockDial = ({ hours, minutes, onHoursChange, onMinutesChange }: ClockDialProps) => {
  const [mode, setMode] = useState<"hours" | "minutes">("hours");
  const clockRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const radius = 120; // Clock radius in pixels
  const centerX = 150;
  const centerY = 150;

  // Generate hour positions (1-12)
  const hourPositions = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1;
    const angle = (hour * 30 - 90) * (Math.PI / 180); // Convert to radians, start at top
    return {
      hour,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle,
    };
  });

  // Generate minute positions (0, 5, 10, ..., 55)
  const minutePositions = Array.from({ length: 12 }, (_, i) => {
    const minute = i * 5;
    const angle = (minute * 6 - 90) * (Math.PI / 180);
    return {
      minute,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle,
    };
  });

  const getCurrentValue = () => {
    if (mode === "hours") {
      return hours % 12 || 12;
    }
    return Math.round(minutes / 5) * 5;
  };

  const getAngleFromPoint = (x: number, y: number) => {
    const rect = clockRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const centerX_actual = rect.left + rect.width / 2;
    const centerY_actual = rect.top + rect.height / 2;

    const dx = x - centerX_actual;
    const dy = y - centerY_actual;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    return angle;
  };

  const getValueFromAngle = (angle: number) => {
    if (mode === "hours") {
      let hour = Math.round(angle / 30);
      if (hour === 0) hour = 12;
      if (hour > 12) hour = hour - 12;
      return hour;
    } else {
      let minute = Math.round(angle / 6);
      minute = Math.round(minute / 5) * 5; // Round to nearest 5
      if (minute >= 60) minute = 0;
      return minute;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    handlePointerMove(touch.clientX, touch.clientY);
  };

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    const angle = getAngleFromPoint(clientX, clientY);
    if (angle === null) return;

    const value = getValueFromAngle(angle);
    if (mode === "hours") {
      // Convert 12-hour to 24-hour
      let h24 = value;
      if (hours >= 12) {
        if (value === 12) h24 = 12;
        else h24 = value + 12;
      } else {
        if (value === 12) h24 = 0;
        else h24 = value;
      }
      onHoursChange(h24);
    } else {
      onMinutesChange(value);
    }
  }, [mode, hours, minutes, onHoursChange, onMinutesChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handlePointerMove(e.clientX, e.clientY);
    }
  }, [isDragging, handlePointerMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      const touch = e.touches[0];
      handlePointerMove(touch.clientX, touch.clientY);
    }
  }, [isDragging, handlePointerMove]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const getHandAngle = () => {
    if (mode === "hours") {
      const hour12 = hours % 12 || 12;
      return (hour12 * 30 - 90) * (Math.PI / 180);
    } else {
      return (minutes * 6 - 90) * (Math.PI / 180);
    }
  };

  const handAngle = getHandAngle();
  const handLength = mode === "hours" ? radius * 0.6 : radius * 0.8;

  return (
    <div className="flex flex-col items-center">
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("hours")}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors",
            mode === "hours"
              ? "bg-orange-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          Hours
        </button>
        <button
          onClick={() => setMode("minutes")}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors",
            mode === "minutes"
              ? "bg-orange-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          Minutes
        </button>
      </div>

      {/* Clock Face */}
      <div
        ref={clockRef}
        className="relative w-[300px] h-[300px] mx-auto"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
      >
        {/* Clock Circle */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 bg-white" />

        {/* Hour Markers */}
        {mode === "hours" &&
          hourPositions.map((pos, idx) => {
            const isSelected = (hours % 12 || 12) === pos.hour;
            return (
              <div
                key={idx}
                className={cn(
                  "absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer transition-all",
                  isSelected
                    ? "bg-orange-500 text-white scale-110"
                    : "bg-white text-gray-700 hover:bg-orange-100"
                )}
                style={{
                  left: `${pos.x - 16}px`,
                  top: `${pos.y - 16}px`,
                }}
                onClick={() => {
                  let h24 = pos.hour;
                  if (hours >= 12) {
                    if (pos.hour === 12) h24 = 12;
                    else h24 = pos.hour + 12;
                  } else {
                    if (pos.hour === 12) h24 = 0;
                    else h24 = pos.hour;
                  }
                  onHoursChange(h24);
                }}
              >
                {pos.hour}
              </div>
            );
          })}

        {/* Minute Markers */}
        {mode === "minutes" &&
          minutePositions.map((pos, idx) => {
            const isSelected = minutes === pos.minute;
            return (
              <div
                key={idx}
                className={cn(
                  "absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer transition-all",
                  isSelected
                    ? "bg-orange-500 text-white scale-110"
                    : "bg-white text-gray-700 hover:bg-orange-100"
                )}
                style={{
                  left: `${pos.x - 16}px`,
                  top: `${pos.y - 16}px`,
                }}
                onClick={() => onMinutesChange(pos.minute)}
              >
                {pos.minute}
              </div>
            );
          })}

        {/* Clock Hand */}
        <div
          className="absolute origin-bottom transition-transform duration-200"
          style={{
            left: `${centerX}px`,
            top: `${centerY}px`,
            width: "4px",
            height: `${handLength}px`,
            transform: `rotate(${handAngle * (180 / Math.PI)}deg)`,
            transformOrigin: "bottom center",
          }}
        >
          <div className="w-full h-full bg-orange-500 rounded-full" />
        </div>

        {/* Center Dot */}
        <div
          className="absolute w-4 h-4 bg-orange-500 rounded-full"
          style={{
            left: `${centerX - 8}px`,
            top: `${centerY - 8}px`,
          }}
        />
      </div>
    </div>
  );
};

export default ClockDial;

