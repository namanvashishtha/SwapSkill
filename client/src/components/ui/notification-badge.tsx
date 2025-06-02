import React from "react";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  children: React.ReactNode;
  className?: string;
  maxCount?: number;
  showZero?: boolean;
}

export function NotificationBadge({ 
  count, 
  children, 
  className,
  maxCount = 99,
  showZero = false 
}: NotificationBadgeProps) {
  const shouldShowBadge = count > 0 || showZero;
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <div className={cn("relative inline-block", className)}>
      {children}
      {shouldShowBadge && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 border-2 border-white shadow-sm">
          {displayCount}
        </span>
      )}
    </div>
  );
}