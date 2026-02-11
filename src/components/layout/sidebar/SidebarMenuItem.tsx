import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MenuItem, SubMenuItem } from "./types";
import { cn } from "@/lib/utils";

interface SidebarMenuItemProps {
  item: MenuItem;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: () => void;
  expandedItems?: string[];
  onToggleNested?: (label: string) => void;
}

// Component for nested sub-items
const NestedSubMenuItem = ({
  subItem,
  depth = 1,
  expandedItems = [],
  onToggleNested
}: {
  subItem: SubMenuItem;
  depth?: number;
  expandedItems?: string[];
  onToggleNested?: (label: string) => void;
}) => {
  const location = useLocation();
  const hasNestedItems = subItem.subItems && subItem.subItems.length > 0;
  const isActive = location.pathname === subItem.path;
  const isExpanded = expandedItems.includes(subItem.label);

  return (
    <div className="space-y-1">
      <Link
        to={subItem.path || "#"}
        onClick={(e) => {
          if (hasNestedItems) {
            e.preventDefault();
            if (onToggleNested) {
              onToggleNested(subItem.label);
            }
          }
        }}
        role={hasNestedItems ? "button" : undefined}
        aria-expanded={hasNestedItems ? isExpanded : undefined}
        aria-current={isActive && !hasNestedItems ? "page" : undefined}
        aria-label={hasNestedItems ? `${subItem.label} - ${isExpanded ? 'expandido' : 'recolhido'}` : subItem.label}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-sm",
          "transition-all duration-200",
          isActive && !hasNestedItems
            ? "bg-primary/10 text-primary font-medium border-l-2 border-primary -ml-[2px]"
            : "text-foreground/60 hover:text-foreground hover:bg-accent/30"
        )}
      >
        <subItem.icon className="w-4 h-4" />
        <span className="flex-1 truncate">{subItem.label}</span>
        {hasNestedItems && (
          <div className="transition-transform duration-200">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </div>
        )}
      </Link>

      {/* Nested sub-items */}
      {isExpanded && hasNestedItems && (
        <div className="pl-4 space-y-1 py-1 overflow-hidden border-l-2 border-border/20 ml-[18px]">
          {subItem.subItems.map((nestedItem, index) => (
            <Link
              key={nestedItem.path || `nested-${index}`}
              to={nestedItem.path || "#"}
              aria-current={location.pathname === nestedItem.path ? "page" : undefined}
              aria-label={nestedItem.label}
              className={cn(
                "flex items-center gap-2 px-3 py-2 min-h-[40px] rounded-lg text-xs",
                "transition-all duration-200",
                location.pathname === nestedItem.path
                  ? "bg-primary/10 text-primary font-medium border-l-2 border-primary -ml-[2px]"
                  : "text-foreground/50 hover:text-foreground hover:bg-accent/20"
              )}
            >
              <nestedItem.icon className="w-3.5 h-3.5" />
              <span className="truncate">{nestedItem.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export const SidebarMenuItem = ({
  item,
  isExpanded,
  isActive,
  onToggle,
  expandedItems = [],
  onToggleNested
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
        role={hasSubItems ? "button" : undefined}
        aria-expanded={hasSubItems ? isExpanded : undefined}
        aria-current={isActive && !hasSubItems ? "page" : undefined}
        aria-label={hasSubItems ? `${item.label} - ${isExpanded ? 'expandido' : 'recolhido'}` : item.label}
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
          {item.subItems.map((subItem, index) => (
            <NestedSubMenuItem
              key={subItem.path || `sub-${index}`}
              subItem={subItem}
              expandedItems={expandedItems}
              onToggleNested={onToggleNested}
            />
          ))}
        </div>
      )}
    </div>
  );
};
