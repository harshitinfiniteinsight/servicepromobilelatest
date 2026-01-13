import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  actions?: React.ReactNode;
  className?: string;
  onBack?: () => void;
}

const MobileHeader = ({ title, showBack = false, actions, className, onBack }: MobileHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-b border-gray-200 safe-top shadow-sm",
      className
    )}>
      <div className="flex items-center justify-between h-12 px-3 max-w-md mx-auto">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 text-gray-700" />
            </Button>
          )}
          <h1 className="text-base font-bold truncate text-gray-900">{title}</h1>
        </div>
        {actions && (
          <div className="flex items-center gap-1.5">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;


