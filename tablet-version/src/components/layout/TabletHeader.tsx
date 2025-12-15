import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TabletHeaderProps {
  title: string;
  showBack?: boolean;
  actions?: React.ReactNode;
  className?: string;
  onBack?: () => void;
  breadcrumbs?: { label: string; path?: string }[];
}

const TabletHeader = ({ 
  title, 
  showBack = false, 
  actions, 
  className, 
  onBack,
  breadcrumbs 
}: TabletHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Auto-generate breadcrumbs if not provided
  const displayBreadcrumbs = breadcrumbs || generateBreadcrumbs(location.pathname);

  return (
    <header className={cn(
      "bg-white border-b border-gray-200 shadow-sm",
      className
    )}>
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-9 w-9 hover:bg-gray-100 flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Button>
          )}
          
          <div className="flex flex-col min-w-0 flex-1">
            {/* Breadcrumbs - only show if not on home page and breadcrumbs exist */}
            {displayBreadcrumbs.length > 1 && location.pathname !== "/" && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-0.5">
                {displayBreadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    {crumb.path ? (
                      <button
                        onClick={() => navigate(crumb.path!)}
                        className="hover:text-primary transition-colors"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                    {index < displayBreadcrumbs.length - 1 && (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Page Title */}
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

// Helper function to generate breadcrumbs from pathname
const generateBreadcrumbs = (pathname: string): { label: string; path?: string }[] => {
  const parts = pathname.split('/').filter(Boolean);
  
  if (parts.length === 0) {
    return [{ label: "Home" }];
  }

  const breadcrumbs: { label: string; path?: string }[] = [{ label: "Home", path: "/" }];
  
  let currentPath = "";
  parts.forEach((part, index) => {
    currentPath += `/${part}`;
    const label = part
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Don't make the last breadcrumb clickable
    if (index === parts.length - 1) {
      breadcrumbs.push({ label });
    } else {
      breadcrumbs.push({ label, path: currentPath });
    }
  });

  return breadcrumbs;
};

export default TabletHeader;
