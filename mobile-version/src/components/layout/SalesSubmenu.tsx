import { useNavigate, useLocation } from "react-router-dom";
import { FileText, TrendingUp, ClipboardList, ShoppingCart, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SalesSubmenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const salesOptions = [
  { label: "Invoices", path: "/invoices", icon: FileText },
  { label: "Estimates", path: "/estimates", icon: TrendingUp },
  { label: "Agreements", path: "/agreements", icon: ClipboardList },
  { label: "Sell Product", path: "/sales/sell-product", icon: ShoppingCart },
];

const SalesSubmenu = ({ isOpen, onClose }: SalesSubmenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleOptionClick = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200"
        onClick={onClose}
      />
      
      {/* Submenu */}
      <div className="fixed bottom-20 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl safe-bottom transition-all duration-200">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Sales</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 touch-target"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          {/* Options */}
          <div className="p-2">
            {salesOptions.map((option) => {
              const Icon = option.icon;
              const isActive = location.pathname.startsWith(option.path);
              
              return (
                <button
                  key={option.path}
                  onClick={() => handleOptionClick(option.path)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl transition-all touch-target",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-50 text-gray-700"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={cn(
                    "font-medium",
                    isActive && "font-bold"
                  )}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesSubmenu;

