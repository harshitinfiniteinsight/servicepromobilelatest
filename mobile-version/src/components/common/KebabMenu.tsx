import * as React from "react";
import { MoreVertical, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface KebabMenuItem {
  label: string;
  icon: LucideIcon;
  action: () => void;
  separator?: boolean; // Add separator before this item
  disabled?: boolean;
  variant?: "default" | "destructive"; // For destructive actions (red text)
}

interface KebabMenuProps {
  items: KebabMenuItem[];
  align?: "start" | "end" | "center";
  className?: string;
  triggerClassName?: string;
  menuWidth?: string; // e.g., "w-44", "w-48", "w-56"
}

const KebabMenu = ({
  items,
  align = "end",
  className,
  triggerClassName,
  menuWidth = "w-48",
}: KebabMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-full hover:bg-orange-50",
            triggerClassName
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className={cn(
          menuWidth,
          "rounded-xl border border-gray-200 bg-white shadow-lg p-2",
          className
        )}
        sideOffset={4}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          const menuItem = (
            <DropdownMenuItem
              key={index}
              onSelect={(event) => {
                event.preventDefault();
                if (!item.disabled) {
                  item.action();
                }
              }}
              disabled={item.disabled}
              className={cn(
                "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                "hover:bg-gray-100 focus:bg-gray-100",
                "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
                item.variant === "destructive" && "text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50"
              )}
            >
              <Icon className={cn(
                "mr-3 h-4 w-4 flex-shrink-0",
                item.variant === "destructive" ? "text-red-600" : "text-muted-foreground"
              )} />
              <span>{item.label}</span>
            </DropdownMenuItem>
          );

          if (item.separator && index > 0) {
            return (
              <React.Fragment key={index}>
                <DropdownMenuSeparator className="my-1.5 bg-gray-200" />
                {menuItem}
              </React.Fragment>
            );
          }

          return menuItem;
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default KebabMenu;




