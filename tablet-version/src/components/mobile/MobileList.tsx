import { cn } from "@/lib/utils";

interface MobileListProps {
  children: React.ReactNode;
  className?: string;
  onRefresh?: () => void;
}

const MobileList = ({ children, className, onRefresh }: MobileListProps) => {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto scrollable space-y-3 p-4",
        className
      )}
    >
      {children}
    </div>
  );
};

export default MobileList;


