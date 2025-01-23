import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { navItems } from "./sidebar/menuItems";
import { SidebarMenuItem } from "./sidebar/SidebarMenuItem";
import { User } from "@/interfaces/UserInterface";
import { logout } from "@/services/AuthService";
import { useToast } from "@/components/ui/use-toast";
import { LogOut } from "lucide-react";

interface SidebarProps {
  user: User;
}

export const Sidebar = ({ user }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const handleLogout = () => {
    logout();
    toast({
      description: "Você foi desconectado com sucesso.",
    });
    navigate('/login');
  };

  // Filtra os itens do menu baseado na role do usuário
  const filteredNavItems = navItems.filter(item => {
    if (item.label === 'Usuários' || item.label === 'Gerenciamento') {
      return user.role === 'admin';
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 p-4 space-y-2">
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
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{user.username}</span>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-600 hover:text-red-700"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};