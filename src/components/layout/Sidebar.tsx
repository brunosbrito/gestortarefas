import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { SidebarMenuItem } from "./sidebar/SidebarMenuItem";
import { User } from "@/interfaces/UserInterface";
import { navItems } from "./sidebar/menuItems";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  user: User;
}

export const Sidebar = ({ user }: SidebarProps) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    const shouldExpandPCP =
      location.pathname.includes('/dashboard') ||
      location.pathname.includes('/atividade') ||
      location.pathname.includes('/assistente-ia') ||
      location.pathname.includes('/users') ||
      location.pathname.includes('/obras') ||
      location.pathname.includes('/fabricas') ||
      location.pathname.includes('/mineradoras');

    const shouldExpandQualidade =
      location.pathname.includes('/nao-conformidades') ||
      location.pathname.includes('/qualidade/assistente-ia') ||
      location.pathname.includes('/qualidade/acoes-corretivas') ||
      location.pathname.includes('/qualidade/inspecoes') ||
      location.pathname.includes('/qualidade/planos-inspecao') ||
      location.pathname.includes('/qualidade/certificados') ||
      location.pathname.includes('/qualidade/calibracao') ||
      location.pathname.includes('/qualidade/indicadores') ||
      location.pathname.includes('/qualidade/databook');

    const shouldExpandConfiguracoes =
      location.pathname.includes('/gerenciamento');

    if (shouldExpandPCP && !expandedItems.includes('PCP')) {
      setExpandedItems(prev => [...prev, 'PCP']);
    }
    if (shouldExpandQualidade && !expandedItems.includes('Qualidade')) {
      setExpandedItems(prev => [...prev, 'Qualidade']);
    }
    if (shouldExpandConfiguracoes && !expandedItems.includes('Configurações')) {
      setExpandedItems(prev => [...prev, 'Configurações']);
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
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly) {
      return user.role === 'admin';
    }
    return true;
  });

  return (
    <ScrollArea className="flex-1 min-h-0">
      <nav className="p-4 space-y-1" aria-label="Menu de navegação principal">
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