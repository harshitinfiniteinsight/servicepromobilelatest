import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface KeyboardTimeInputProps {
  hours: number;
  minutes: number;
  onHoursChange: (hours: number) => void;
  onMinutesChange: (minutes: number) => void;
}

const KeyboardTimeInput = ({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
}: KeyboardTimeInputProps) => {
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= 0 && value <= 23) {
      onHoursChange(value);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= 0 && value <= 59) {
      onMinutesChange(value);
    }
  };

  const handleHoursBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    if (value < 0) onHoursChange(0);
    if (value > 23) onHoursChange(23);
  };

  const handleMinutesBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    if (value < 0) onMinutesChange(0);
    if (value > 59) onMinutesChange(59);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center gap-2 text-orange-600 mb-4">
        <Clock className="h-5 w-5" />
        <span className="text-lg font-medium">Set time</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Hours Input */}
        <div className="flex flex-col items-center space-y-2">
          <Label className="text-sm font-medium text-gray-700">Hour</Label>
          <Input
            type="number"
            min="0"
            max="23"
            value={hours}
            onChange={handleHoursChange}
            onBlur={handleHoursBlur}
            className="w-20 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            placeholder="00"
          />
          <span className="text-xs text-gray-500">0-23</span>
        </div>

        {/* Colon Separator */}
        <div className="text-4xl font-bold text-gray-400 mt-8">:</div>

        {/* Minutes Input */}
        <div className="flex flex-col items-center space-y-2">
          <Label className="text-sm font-medium text-gray-700">Minute</Label>
          <Input
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={handleMinutesChange}
            onBlur={handleMinutesBlur}
            className="w-20 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            placeholder="00"
          />
          <span className="text-xs text-gray-500">0-59</span>
        </div>
      </div>
    </div>
  );
};

export default KeyboardTimeInput;




