import React from "react";
import { cn } from "@/lib/utils";

interface BottomActionBarProps {
  children: React.ReactNode;
  className?: string;
}

const BottomActionBar = ({ children, className }: BottomActionBarProps) => {
  return (
    <div
      className={cn(
        "fixed left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-40",
        "px-4 py-3",
        className
      )}
      style={{
        bottom: 'calc(64px + env(safe-area-inset-bottom))',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
      }}
    >
      {children}
    </div>
  );
};

export default BottomActionBar;


