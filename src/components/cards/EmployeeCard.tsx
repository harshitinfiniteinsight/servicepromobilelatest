import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import { Phone, Mail, Edit, XCircle, RotateCcw, Star } from "lucide-react";

interface EmployeeCardProps {
  employee: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role?: string;
    status?: string;
    color?: string;
  };
  variant?: "default" | "deactivated";
  feedbackSummary?: {
    averageRating: number;
    totalFeedbackCount: number;
  } | null;
  onActivate?: () => void;
  onQuickAction?: (action: string) => void;
  onColorChange?: (color: string) => void;
}

const EMPLOYEE_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#EC4899", // Pink
  "#EAB308", // Yellow
  "#EF4444", // Red
  "#14B8A6", // Teal
];

const formatEmployeeId = (id: string) => {
  const numeric = id.replace(/\D/g, "");
  if (numeric.length === 0) return `ID: E-${id}`;
  return `ID: E-${numeric.padStart(3, "0")}`;
};

const EmployeeCard = ({ 
  employee, 
  variant = "default",
  feedbackSummary,
  onActivate, 
  onQuickAction,
  onColorChange 
}: EmployeeCardProps) => {
  const navigate = useNavigate();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const initials = employee.name.split(" ").map(n => n[0]).join("");
  const isDeactivated =
    variant === "deactivated" ||
    employee.status === "Deactivated" ||
    employee.status === "Inactive";
  
  const employeeColor = employee.color || "#3B82F6";

  const handleColorSelect = (color: string) => {
    if (onColorChange) {
      onColorChange(color);
    }
    setColorPickerOpen(false);
  };

  if (isDeactivated) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col space-y-2 border border-gray-200 opacity-75">
        <div className="flex justify-between items-start">
          <div 
            className="flex items-center space-x-3 flex-1 cursor-pointer"
            onClick={() => navigate(`/employees/${employee.id}`)}
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-gray-200 flex-shrink-0">
              <span className="font-semibold text-gray-500 text-sm">{initials}</span>
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{employee.name}</h3>
              <p className="text-xs text-gray-500">{formatEmployeeId(employee.id)}</p>
            </div>
          </div>
          {onQuickAction && onActivate && (
            <KebabMenu
              items={[
                {
                  label: "Activate",
                  icon: RotateCcw,
                  action: () => {
                    onActivate();
                    onQuickAction("activate");
                  },
                },
              ]}
              menuWidth="w-44"
            />
          )}
        </div>
        <div className="pl-12 space-y-1">
          <p className="flex items-center text-xs text-gray-600">
            <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{employee.phone}</span>
          </p>
          <p className="flex items-center text-xs text-gray-600">
            <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{employee.email}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col space-y-2 border border-gray-200">
      <div className="flex justify-between items-start">
        <div 
          className="flex items-center space-x-3 flex-1 cursor-pointer"
          onClick={() => navigate(`/employees/${employee.id}`)}
        >
          {/* Color Circle */}
          <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
            <PopoverTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setColorPickerOpen(true);
                }}
                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: employeeColor }}
              >
                <span className="font-semibold text-white text-sm">{initials}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="start" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700 mb-2">Select Color</p>
                <div className="grid grid-cols-4 gap-2">
                  {EMPLOYEE_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex flex-col leading-tight min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <h3 className="text-sm font-semibold text-gray-900">{employee.name}</h3>
              {/* Feedback Rating - Only for merchant, inline with name */}
              {feedbackSummary !== undefined && feedbackSummary && feedbackSummary.totalFeedbackCount > 0 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="text-[#F28A2E] fill-[#F28A2E]" style={{ width: '14px', height: '14px', minWidth: '14px' }} />
                  <span className="text-xs text-gray-700 font-medium whitespace-nowrap">
                    {feedbackSummary.averageRating.toFixed(1)} ({feedbackSummary.totalFeedbackCount})
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">{formatEmployeeId(employee.id)}</p>
          </div>
        </div>
        {onQuickAction && (
          <KebabMenu
            items={[
              {
                label: "Edit Employee",
                icon: Edit,
                action: () => onQuickAction("edit"),
              },
              {
                label: "Deactivate",
                icon: XCircle,
                action: () => onQuickAction("deactivate"),
                variant: "destructive",
              },
            ]}
            menuWidth="w-44"
          />
        )}
      </div>
      <div className="pl-12 space-y-1">
        <p className="flex items-center text-xs text-gray-600">
          <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{employee.phone}</span>
        </p>
        <p className="flex items-center text-xs text-gray-600">
          <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{employee.email}</span>
        </p>
        {/* Show "No feedback yet" if employee has completed jobs but no feedback */}
        {feedbackSummary === null && (
          <p className="text-xs text-gray-500 mt-1">No feedback yet</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeCard;

