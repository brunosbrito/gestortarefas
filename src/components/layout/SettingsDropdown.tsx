import { Settings, Moon, Sun, User, HelpCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const SettingsDropdown = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-9 w-9 bg-white/10 hover:bg-white/20 border border-white/20 text-white"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-card/95 backdrop-blur-sm border-border/50"
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};