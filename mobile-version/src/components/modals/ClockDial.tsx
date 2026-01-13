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
  const [isPM, setIsPM] = useState(hours >= 12);
  const clockRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Update isPM when hours change externally
  useEffect(() => {
    setIsPM(hours >= 12);
  }, [hours]);

  // Clock dimensions - using relative sizing
  const clockSize = 260; // Total clock size in pixels
  const radius = 100; // Radius for hour/minute markers
  const center = clockSize / 2; // Center point

  // Generate hour positions (1-12) around the clock
  const hourPositions = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1;
    const angleDeg = hour * 30 - 90; // 30 degrees per hour, start from top (12 o'clock = -90°)
    const angleRad = angleDeg * (Math.PI / 180);
    return {
      hour,
      x: center + radius * Math.cos(angleRad),
      y: center + radius * Math.sin(angleRad),
      angleDeg,
    };
  });

  // Generate minute positions (0, 5, 10, ..., 55)
  const minutePositions = Array.from({ length: 12 }, (_, i) => {
    const minute = i * 5;
    const angleDeg = minute * 6 - 90; // 6 degrees per minute, start from top
    const angleRad = angleDeg * (Math.PI / 180);
    return {
      minute,
      x: center + radius * Math.cos(angleRad),
      y: center + radius * Math.sin(angleRad),
      angleDeg,
    };
  });

  // Get angle from a point relative to clock center
  const getAngleFromPoint = (clientX: number, clientY: number) => {
    const rect = clockRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const clockCenterX = rect.left + rect.width / 2;
    const clockCenterY = rect.top + rect.height / 2;

    const dx = clientX - clockCenterX;
    const dy = clientY - clockCenterY;
    
    // Calculate angle in degrees, with 0° at top (12 o'clock position)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    return angle;
  };

  // Convert angle to hour or minute value
  const getValueFromAngle = (angle: number) => {
    if (mode === "hours") {
      let hour = Math.round(angle / 30);
      if (hour === 0) hour = 12;
      if (hour > 12) hour = hour % 12 || 12;
      return hour;
    } else {
      let minute = Math.round(angle / 6);
      minute = Math.round(minute / 5) * 5; // Round to nearest 5
      if (minute >= 60) minute = 0;
      return minute;
    }
  };

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    const angle = getAngleFromPoint(clientX, clientY);
    if (angle === null) return;

    const value = getValueFromAngle(angle);
    if (mode === "hours") {
      // Convert 12-hour to 24-hour based on AM/PM
      let h24: number;
      if (isPM) {
        h24 = value === 12 ? 12 : value + 12;
      } else {
        h24 = value === 12 ? 0 : value;
      }
      onHoursChange(h24);
    } else {
      onMinutesChange(value);
    }
  }, [mode, isPM, onHoursChange, onMinutesChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    handlePointerMove(touch.clientX, touch.clientY);
  };

  const handleMouseUp = useCallback(() => {
    if (isDragging && mode === "hours") {
      // Auto-switch to minutes after selecting hour
      setTimeout(() => setMode("minutes"), 200);
    }
    setIsDragging(false);
  }, [isDragging, mode]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handlePointerMove(e.clientX, e.clientY);
    }
  }, [isDragging, handlePointerMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [isDragging, handlePointerMove]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, { passive: true });
      document.addEventListener("touchend", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  // Calculate clock hand angle (in degrees, 0° = pointing up/12 o'clock)
  const getHandAngleDeg = () => {
    if (mode === "hours") {
      const hour12 = hours % 12;
      return hour12 * 30; // 30° per hour
    } else {
      return minutes * 6; // 6° per minute
    }
  };

  const handAngleDeg = getHandAngleDeg();
  const handLength = mode === "hours" ? radius * 0.65 : radius * 0.85;

  // Handle AM/PM toggle
  const handleAmPmToggle = (newIsPM: boolean) => {
    setIsPM(newIsPM);
    // Update hours to reflect AM/PM change
    const hour12 = hours % 12;
    if (newIsPM) {
      onHoursChange(hour12 === 0 ? 12 : hour12 + 12);
    } else {
      onHoursChange(hour12);
    }
  };

  // Handle hour click
  const handleHourClick = (hour: number) => {
    let h24: number;
    if (isPM) {
      h24 = hour === 12 ? 12 : hour + 12;
    } else {
      h24 = hour === 12 ? 0 : hour;
    }
    onHoursChange(h24);
    // Auto-switch to minutes
    setTimeout(() => setMode("minutes"), 200);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Mode Toggle & AM/PM Toggle Row */}
      <div className="flex items-center justify-between w-full mb-4 gap-3">
        {/* Hours/Minutes Toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMode("hours")}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              mode === "hours"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            )}
          >
            Hours
          </button>
          <button
            onClick={() => setMode("minutes")}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              mode === "minutes"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            )}
          >
            Minutes
          </button>
        </div>

        {/* AM/PM Toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleAmPmToggle(false)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              !isPM
                ? "bg-orange-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            )}
          >
            AM
          </button>
          <button
            onClick={() => handleAmPmToggle(true)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              isPM
                ? "bg-orange-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            )}
          >
            PM
          </button>
        </div>
      </div>

      {/* Clock Face */}
      <div
        ref={clockRef}
        className="relative touch-none select-none"
        style={{ width: clockSize, height: clockSize }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Clock Background Circle */}
        <div 
          className="absolute rounded-full bg-gray-50 border-2 border-gray-200"
          style={{
            width: clockSize,
            height: clockSize,
            left: 0,
            top: 0,
          }}
        />

        {/* Inner circle for visual effect */}
        <div 
          className="absolute rounded-full bg-orange-50"
          style={{
            width: clockSize - 40,
            height: clockSize - 40,
            left: 20,
            top: 20,
          }}
        />

        {/* Hour Markers */}
        {mode === "hours" &&
          hourPositions.map((pos) => {
            const isSelected = (hours % 12 || 12) === pos.hour;
            return (
              <button
                key={pos.hour}
                type="button"
                className={cn(
                  "absolute w-9 h-9 -ml-[18px] -mt-[18px] rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-150 z-10",
                  isSelected
                    ? "bg-orange-500 text-white shadow-md scale-110"
                    : "bg-white text-gray-700 hover:bg-orange-100 shadow-sm border border-gray-200"
                )}
                style={{
                  left: pos.x,
                  top: pos.y,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleHourClick(pos.hour);
                }}
              >
                {pos.hour}
              </button>
            );
          })}

        {/* Minute Markers */}
        {mode === "minutes" &&
          minutePositions.map((pos) => {
            const isSelected = Math.round(minutes / 5) * 5 === pos.minute;
            return (
              <button
                key={pos.minute}
                type="button"
                className={cn(
                  "absolute w-9 h-9 -ml-[18px] -mt-[18px] rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-150 z-10",
                  isSelected
                    ? "bg-orange-500 text-white shadow-md scale-110"
                    : "bg-white text-gray-700 hover:bg-orange-100 shadow-sm border border-gray-200"
                )}
                style={{
                  left: pos.x,
                  top: pos.y,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onMinutesChange(pos.minute);
                }}
              >
                {String(pos.minute).padStart(2, "0")}
              </button>
            );
          })}

        {/* Clock Hand - SVG for precise rendering */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={clockSize}
          height={clockSize}
          style={{ overflow: "visible" }}
        >
          {/* Hand line */}
          <line
            x1={center}
            y1={center}
            x2={center + handLength * Math.sin(handAngleDeg * Math.PI / 180)}
            y2={center - handLength * Math.cos(handAngleDeg * Math.PI / 180)}
            stroke="#F97316"
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-200"
          />
          {/* Center dot */}
          <circle
            cx={center}
            cy={center}
            r="6"
            fill="#F97316"
          />
          {/* Hand tip dot */}
          <circle
            cx={center + handLength * Math.sin(handAngleDeg * Math.PI / 180)}
            cy={center - handLength * Math.cos(handAngleDeg * Math.PI / 180)}
            r="4"
            fill="#F97316"
            className="transition-all duration-200"
          />
        </svg>
      </div>

      {/* Current Time Display */}
      <div className="mt-4 text-center">
        <span className="text-2xl font-bold text-gray-800">
          {String(hours % 12 || 12).padStart(2, "0")}
          <span className="text-orange-500">:</span>
          {String(minutes).padStart(2, "0")}
        </span>
        <span className="ml-2 text-lg font-medium text-orange-500">
          {isPM ? "PM" : "AM"}
        </span>
      </div>
    </div>
  );
};

export default ClockDial;
