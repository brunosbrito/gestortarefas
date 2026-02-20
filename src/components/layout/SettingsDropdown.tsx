import { Settings, Moon, Sun, User, HelpCircle, LogOut, Contrast } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useHighContrast } from '@/hooks/useHighContrast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { showInfo, showActionSuccess } from '@/lib/feedback';
import { cn } from '@/lib/utils';
import { logout } from '@/services/AuthService';

export const SettingsDropdown = () => {
  const { theme, toggleTheme } = useTheme();
  const { isHighContrast, toggleHighContrast } = useHighContrast();
  const navigate = useNavigate();

  const handleThemeToggle = () => {
    toggleTheme();
    const newTheme = theme === 'light' ? 'escuro' : 'claro';
    showInfo({
      title: 'Tema Alterado',
      description: `Modo ${newTheme} ativado.`,
      duration: 2000,
    });
  };

  const handleHighContrastToggle = () => {
    toggleHighContrast();
    const message = !isHighContrast
      ? 'Modo de alto contraste ativado.'
      : 'Modo de alto contraste desativado.';
    showActionSuccess(message);
  };

  const handleLogout = async () => {
    await logout();

    showInfo({
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
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Aparência
        </DropdownMenuLabel>

        <DropdownMenuItem onClick={handleThemeToggle} className="flex items-center gap-3 cursor-pointer">
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span>Alterar para {theme === 'light' ? 'Escuro' : 'Claro'}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleHighContrastToggle}
          className={cn(
            "flex items-center gap-3 cursor-pointer",
            isHighContrast && "bg-accent"
          )}
        >
          <Contrast className="h-4 w-4" />
          <span>Alto Contraste</span>
          {isHighContrast && (
            <span className="ml-auto text-xs text-muted-foreground">✓</span>
          )}
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