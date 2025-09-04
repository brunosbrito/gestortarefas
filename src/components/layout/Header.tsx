import { LogOut, UserCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/interfaces/UserInterface';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '../ui/use-toast';
import { ModuleDropdown } from './ModuleDropdown';
import { ModuleIndicator } from './ModuleIndicator';
import { SettingsDropdown } from './SettingsDropdown';

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
    <>
      <div className="gradient-primary p-3 md:p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h1 className="text-lg md:text-xl font-bold text-white truncate">
              <span className="hidden sm:inline">Sistema de Gestão</span>
              <span className="sm:hidden">SG</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <ModuleDropdown />
            <SettingsDropdown />
          </div>
        </div>
        
        {/* Indicador do módulo em segunda linha para todas as larguras */}
        <div className="mt-2 flex justify-center">
          <ModuleIndicator />
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <UserCircle2 className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.username}</p>
            <p className="text-xs text-muted-foreground">
              {user.role === 'admin' ? 'Administrador' : 'Usuário'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </>
  );
};
