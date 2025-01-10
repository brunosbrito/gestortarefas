import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { navItems } from "./sidebar/menuItems";
import { SidebarMenuItem } from "./sidebar/SidebarMenuItem";

export const Sidebar = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    const shouldExpandObras = location.pathname.includes('/obras');
    if (shouldExpandObras && !expandedItems.includes('Obras')) {
      setExpandedItems(prev => [...prev, 'Obras']);
    }
  }, [location.pathname]);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <nav className="flex-1 p-4 space-y-2">
      {navItems.map((item) => (
        <SidebarMenuItem
          key={item.label}
          item={item}
          isExpanded={expandedItems.includes(item.label)}
          isActive={location.pathname === item.path}
          onToggle={() => toggleExpand(item.label)}
        />
      ))}
    </nav>
  );
};