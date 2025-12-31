import { Settings, Moon, Sun, User, HelpCircle, LogOut } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

export const SettingsDropdown = () => {
  const { theme, toggleTheme } = useTheme();
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative z-10 h-8 w-8 md:h-9 md:w-9 bg-white/10 hover:bg-white/20 border border-white/20 text-white flex-shrink-0"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 md:w-56 bg-card/95 backdrop-blur-sm border-border/50 z-50"
        sideOffset={4}
      >
        <DropdownMenuItem onClick={toggleTheme} className="flex items-center gap-3 cursor-pointer">
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span>Alterar para {theme === 'light' ? 'Escuro' : 'Claro'}</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="flex items-center gap-3 cursor-pointer opacity-50">
          <User className="h-4 w-4" />
          <span>Perfil do Usuário</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center gap-3 cursor-pointer opacity-50">
          <HelpCircle className="h-4 w-4" />
          <span>Ajuda e Suporte</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};