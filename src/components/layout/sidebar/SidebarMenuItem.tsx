import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MenuItem } from "./types";
import { cn } from "@/lib/utils";

interface SidebarMenuItemProps {
  item: MenuItem;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: () => void;
}

export const SidebarMenuItem = ({
  item,
  isExpanded,
  isActive,
  onToggle
}: SidebarMenuItemProps) => {
  const location = useLocation();
  const hasSubItems = item.subItems && item.subItems.length > 0;

  return (
    <div className="space-y-1">
      <Link
        to={item.path || "#"}
        onClick={(e) => {
          if (hasSubItems) {
            e.preventDefault();
            onToggle();
          }
        }}
        className={cn(
          // Base styles - minimum 44px touch target
          "group flex items-center w-full gap-3 px-3 py-3 min-h-[48px] rounded-xl",
          "text-sm font-medium transition-all duration-200",

          // Inactive state
          "text-foreground/70 hover:text-foreground",
          "hover:bg-accent/50",

          // Active state
          isActive && [
            "bg-primary text-primary-foreground",
            "shadow-lg shadow-primary/20",
            "hover:bg-primary/90"
          ]
        )}
      >
        {/* Icon with background */}
        <div className={cn(
          "p-1.5 rounded-lg transition-colors",
          isActive ? "bg-primary-foreground/20" : "bg-transparent group-hover:bg-accent"
        )}>
          <item.icon className="w-4 h-4" />
        </div>

        {/* Label */}
        <span className="flex-1 truncate">{item.label}</span>

        {/* Chevron for expandable items */}
        {hasSubItems && (
          <div className="transition-transform duration-200">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        )}
      </Link>

      {/* Sub-items with animation */}
      {isExpanded && hasSubItems && (
        <div className="pl-6 space-y-1 py-1 overflow-hidden border-l-2 border-border/30 ml-[18px]">
          {item.subItems.map((subItem) => (
            <Link
              key={subItem.path}
              to={subItem.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-sm",
                "transition-all duration-200",
                location.pathname === subItem.path
                  ? "bg-primary/10 text-primary font-medium border-l-2 border-primary -ml-[2px]"
                  : "text-foreground/60 hover:text-foreground hover:bg-accent/30"
              )}
            >
              <subItem.icon className="w-4 h-4" />
              <span className="truncate">{subItem.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
