import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { SidebarMenuItem } from "./sidebar/SidebarMenuItem";
import { User } from "@/interfaces/UserInterface";
import { useModule } from "@/contexts/ModuleContext";
import { getMenuItemsByModule } from "./ModuleMenuItems";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  user: User;
}

export const Sidebar = ({ user }: SidebarProps) => {
  const location = useLocation();
  const { activeModule } = useModule();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Obtém os itens do menu baseado no módulo ativo
  const menuItems = getMenuItemsByModule(activeModule);

  useEffect(() => {
    const shouldExpandObras = location.pathname.includes('/obras');
    const shouldExpandGerenciamento = location.pathname.includes('/gerenciamento');
    
    if (shouldExpandObras && !expandedItems.includes('Obras')) {
      setExpandedItems(prev => [...prev, 'Obras']);
    }
    if (shouldExpandGerenciamento && !expandedItems.includes('Gerenciamento')) {
      setExpandedItems(prev => [...prev, 'Gerenciamento']);
    }
  }, [location.pathname]);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  // Filtra os itens do menu baseado na role do usuário
  const filteredNavItems = menuItems.filter(item => {
    if (item.adminOnly) {
      return user.role === 'admin';
    }
    return true;
  });

  return (
    <ScrollArea className="flex-1 min-h-0">
      <nav className="p-4 space-y-1">
        {filteredNavItems.map((item) => (
          <SidebarMenuItem
            key={item.label}
            item={item}
            isExpanded={expandedItems.includes(item.label)}
            isActive={location.pathname === item.path}
            onToggle={() => toggleExpand(item.label)}
          />
        ))}
      </nav>
    </ScrollArea>
  );
};