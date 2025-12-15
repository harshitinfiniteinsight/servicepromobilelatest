import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const MobileCard = ({ children, className, onClick }: MobileCardProps) => {
  return (
    <Card
      className={cn(
        "p-4 cursor-pointer active:scale-[0.98] transition-all duration-200 touch-target",
        onClick && "hover:bg-gray-50 hover:border-primary/20",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Card>
  );
};

export default MobileCard;


