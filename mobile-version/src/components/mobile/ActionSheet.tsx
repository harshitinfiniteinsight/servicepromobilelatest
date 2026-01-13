import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionSheetItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
  icon?: React.ReactNode;
}

interface ActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: ActionSheetItem[];
  title?: string;
}

const ActionSheet = ({ open, onOpenChange, actions, title }: ActionSheetProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md bottom-0 top-auto translate-y-0 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom rounded-t-2xl rounded-b-none p-4 gap-2"
      >
        <DialogTitle className="sr-only">
          {title || "Action Sheet"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {title ? `Action sheet for ${title}` : "Available actions"}
        </DialogDescription>
        {title && (
          <h3 className="font-semibold text-center text-muted-foreground text-sm mb-2">
            {title}
          </h3>
        )}
        <div className="space-y-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "outline"}
              className={cn(
                "w-full justify-start touch-target text-base h-12",
                action.variant === "destructive" && "text-destructive"
              )}
              onClick={() => {
                action.onClick();
                onOpenChange(false);
              }}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          className="w-full mt-2 touch-target"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ActionSheet;


