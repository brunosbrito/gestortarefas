import React from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MenuItem } from "./types";

interface SidebarMenuItemProps {
  item: MenuItem;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: () => void;
  onClick?: (path: string, label: string) => void;
}

export const SidebarMenuItem = ({ 
  item, 
  isExpanded, 
  isActive,
  onToggle,
  onClick
}: SidebarMenuItemProps) => {
  const hasSubItems = item.subItems && item.subItems.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    if (hasSubItems) {
      e.preventDefault();
      onToggle();
    } else if (onClick) {
      e.preventDefault();
      onClick(item.path || '', item.label);
    }
  };

  return (
    <div className="space-y-1">
      <Link
        to={item.path || "#"}
        onClick={handleClick}
        className={`flex items-center w-full space-x-3 px-4 py-3 rounded-lg text-construction-600 hover:bg-construction-100 ${
          isActive ? "bg-primary text-white" : ""
        }`}
      >
        <item.icon size={20} />
        <span className="flex-1">{item.label}</span>
        {hasSubItems && (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
      </Link>
      
      {isExpanded && hasSubItems && (
        <div className="pl-4 space-y-1">
          {item.subItems.map((subItem) => (
            <Link
              key={subItem.path}
              to={subItem.path}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === subItem.path
                  ? "bg-primary text-white"
                  : "text-construction-600 hover:bg-construction-100"
              }`}
            >
              <subItem.icon size={18} />
              <span>{subItem.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};