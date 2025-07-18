import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { MenuItem } from "./types";

interface SidebarMenuItemProps {
  item: MenuItem;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
}

export const SidebarMenuItem = ({ item, isExpanded, isActive, onToggle, isCollapsed = false }: SidebarMenuItemProps) => {
  const location = useLocation();

  if (item.subItems && item.subItems.length > 0) {
    return (
      <div className="space-y-1">
        <button
          onClick={onToggle}
          className={`flex items-center w-full p-3 text-left hover:bg-construction-100 rounded-lg transition-colors group ${
            isActive ? 'bg-[#FF7F0E] text-white' : 'text-construction-700'
          } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
          title={isCollapsed ? item.label : undefined}
        >
          <div className="flex items-center">
            <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </div>
          {!isCollapsed && (
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            />
          )}
        </button>
        
        {isExpanded && !isCollapsed && (
          <div className="ml-8 space-y-1 animate-accordion-down">
            {item.subItems.map((child) => (
              <Link
                key={child.path}
                to={child.path}
                className={`flex items-center p-2 text-sm hover:bg-construction-100 rounded-lg transition-colors ${
                  location.pathname === child.path 
                    ? 'bg-[#FF7F0E] text-white' 
                    : 'text-construction-600'
                }`}
              >
                <child.icon className="w-4 h-4 mr-2" />
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.path}
      className={`flex items-center p-3 hover:bg-construction-100 rounded-lg transition-colors group ${
        isActive ? 'bg-[#FF7F0E] text-white' : 'text-construction-700'
      } ${isCollapsed ? 'justify-center' : ''}`}
      title={isCollapsed ? item.label : undefined}
    >
      <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
      {!isCollapsed && <span className="font-medium">{item.label}</span>}
    </Link>
  );
};