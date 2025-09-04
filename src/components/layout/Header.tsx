import { LogOut, UserCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/interfaces/UserInterface';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '../ui/use-toast';
import { ModuleDropdown } from './ModuleDropdown';
import { SettingsDropdown } from './SettingsDropdown';
import { ModuleIndicator } from './ModuleIndicator';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface HeaderProps {
  user: User;
}

export const Header = ({ user }: HeaderProps) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('userEmail');
    sessionStorage.removeItem('authToken');

    toast({
      description: 'Você foi desconectado com sucesso.',
    });

    navigate('/');
  };

  if (!user) {
    return (
      <div className="gradient-primary p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-white">Sistema de Gestão</h1>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-card border-b border-border shadow-sm">
      <div className="gradient-primary p-3 md:p-4">
        <div className="flex items-center justify-between">
          {/* Lado esquerdo: Trigger + Título */}
          <div className="flex items-center gap-3">
            <SidebarTrigger className="hidden md:flex h-8 w-8 bg-white/20 hover:bg-white/30 border-white/30 text-white" />
            <h1 className="text-lg md:text-xl font-bold text-white">
              <span className="hidden sm:inline">Sistema de Gestão</span>
              <span className="sm:hidden">SG</span>
            </h1>
          </div>
          
          {/* Centro: Módulos e Configurações */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <ModuleDropdown />
            <SettingsDropdown />
          </div>
          
          {/* Lado direito: User info + Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white/20 text-white text-xs">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs opacity-80 capitalize">{user.role}</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white/80 hover:text-white hover:bg-white/20 flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sair</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Indicador do módulo em uma linha separada */}
      <ModuleIndicator />
    </div>
  );
};
