import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SubMenuItem } from "./types";
import { cn } from "@/lib/utils";

interface SubMenuItemComponentProps {
  subItem: SubMenuItem;
  level?: number;
}

export const SubMenuItemComponent = ({
  subItem,
  level = 1
}: SubMenuItemComponentProps) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubItems = subItem.subItems && subItem.subItems.length > 0;
  const isActive = location.pathname === subItem.path;

  const paddingLeft = level === 1 ? "pl-6" : "pl-12";

  return (
    <div className="space-y-1">
      <Link
        to={subItem.path || "#"}
        onClick={(e) => {
          if (hasSubItems) {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        role={hasSubItems ? "button" : undefined}
        aria-expanded={hasSubItems ? isExpanded : undefined}
        aria-current={isActive && !hasSubItems ? "page" : undefined}
        aria-label={subItem.label}
        className={cn(
          "flex items-center gap-3 py-2.5 min-h-[44px] rounded-lg text-sm",
          "transition-all duration-200",
          paddingLeft,
          isActive && !hasSubItems
            ? "bg-primary/10 text-primary font-medium border-l-2 border-primary -ml-[2px]"
            : "text-foreground/60 hover:text-foreground hover:bg-accent/30"
        )}
      >
        <subItem.icon className="w-4 h-4" />
        <span className="flex-1 truncate">{subItem.label}</span>

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

      {/* Nested sub-items */}
      {isExpanded && hasSubItems && (
        <div className="space-y-1">
          {subItem.subItems.map((nestedItem, index) => (
            <SubMenuItemComponent
              key={nestedItem.path || `nested-${index}`}
              subItem={nestedItem}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
