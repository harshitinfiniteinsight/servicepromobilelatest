import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Keyboard, X } from "lucide-react";
import ClockDial from "./ClockDial";
import KeyboardTimeInput from "./KeyboardTimeInput";

interface TimePickerModalProps {
  visible: boolean;
  initialTime?: string; // Format: "HH:MM" (24-hour)
  onCancel: () => void;
  onConfirm: (time: string) => void; // Returns "HH:MM" format
  mode?: "start" | "end";
}

const TimePickerModal = ({
  visible,
  initialTime,
  onCancel,
  onConfirm,
  mode = "start",
}: TimePickerModalProps) => {
  const [uiMode, setUiMode] = useState<"clock" | "keyboard">("clock");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  // Parse initial time
  useEffect(() => {
    if (initialTime) {
      const [h, m] = initialTime.split(":").map(Number);
      setHours(h || 0);
      setMinutes(m || 0);
    } else {
      setHours(0);
      setMinutes(0);
    }
  }, [initialTime, visible]);

  const handleConfirm = () => {
    const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    onConfirm(formattedTime);
  };

  const formatTimeDisplay = () => {
    const h = String(hours).padStart(2, "0");
    const m = String(minutes).padStart(2, "0");
    return `${h}:${m}`;
  };

  const formatTime12Hour = () => {
    const h12 = hours % 12 || 12;
    const ampm = hours < 12 ? "AM" : "PM";
    const m = String(minutes).padStart(2, "0");
    return `${h12}:${m} ${ampm}`;
  };

  return (
    <Dialog open={visible} onOpenChange={onCancel}>
      <DialogContent className="max-w-md w-[90%] max-h-[90vh] overflow-hidden rounded-2xl p-0 bg-white [&>button]:hidden">
        <DialogDescription className="sr-only">
          Time picker for {mode === "start" ? "start" : "end"} time
        </DialogDescription>

        {/* Header with Orange Background */}
        <DialogHeader className="px-5 pt-5 pb-4 bg-orange-500 rounded-t-2xl relative">
          <DialogTitle className="text-lg font-semibold text-white text-center">
            {mode === "start" ? "Start Time" : "End Time"}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-orange-600 text-white absolute right-5 top-5"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Content Area */}
        <div className="flex flex-col bg-white">
          {/* Left Panel - Time Display */}
          <div className="px-5 py-4 bg-orange-50 border-b border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {formatTimeDisplay()}
                </div>
                <div className="text-sm text-orange-500">
                  {formatTime12Hour()}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setUiMode(uiMode === "clock" ? "keyboard" : "clock")}
                className="h-10 w-10 rounded-full hover:bg-orange-100 text-orange-600"
              >
                {uiMode === "clock" ? (
                  <Keyboard className="h-5 w-5" />
                ) : (
                  <Clock className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Right Panel - Clock or Keyboard Input */}
          <div className="flex-1 px-5 py-6 min-h-[300px]">
            {uiMode === "clock" ? (
              <ClockDial
                hours={hours}
                minutes={minutes}
                onHoursChange={setHours}
                onMinutesChange={setMinutes}
              />
            ) : (
              <KeyboardTimeInput
                hours={hours}
                minutes={minutes}
                onHoursChange={setHours}
                onMinutesChange={setMinutes}
              />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white rounded-b-2xl flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-11 rounded-lg border-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 h-11 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium"
          >
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimePickerModal;








