import { useLocation } from "react-router-dom";
import { User } from "@/interfaces/UserInterface";
import { useModule } from "@/contexts/ModuleContext";
import { getMenuItemsByModule } from "./layout/ModuleMenuItems";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";

interface AppSidebarProps {
  user: User;
}

export const AppSidebar = ({ user }: AppSidebarProps) => {
  const location = useLocation();
  const { activeModule } = useModule();
  const { state } = useSidebar();
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

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="bg-card border-r border-border">
      <SidebarContent className="overflow-y-auto">
        {filteredNavItems.map((group) => {
          const isExpanded = expandedItems.includes(group.label);
          const hasActiveChild = group.subItems?.some(child => 
            location.pathname === child.path
          );

          if (group.subItems) {
            return (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {!isCollapsed && group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => toggleExpand(group.label)}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                          isExpanded 
                            ? 'bg-accent text-accent-foreground' 
                            : 'hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        <group.icon className="h-4 w-4" />
                        {!isCollapsed && (
                          <>
                            <span>{group.label}</span>
                            <span className="ml-auto text-xs">
                              {isExpanded ? '−' : '+'}
                            </span>
                          </>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {isExpanded && group.subItems.map((subItem) => (
                      <SidebarMenuItem key={subItem.path} className="ml-4">
                        <SidebarMenuButton>
                          <NavLink
                            to={subItem.path}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors w-full ${
                                isActive
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-accent hover:text-accent-foreground'
                              }`
                            }
                          >
                            <subItem.icon className="h-4 w-4" />
                            {!isCollapsed && <span>{subItem.label}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <NavLink
                        to={group.path!}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors w-full ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-accent hover:text-accent-foreground'
                          }`
                        }
                      >
                        <group.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{group.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
};