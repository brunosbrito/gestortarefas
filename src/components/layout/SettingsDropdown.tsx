import { Settings, Moon, Sun, User, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const SettingsDropdown = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = root.classList.contains('dark') ? 'dark' : 'light';
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};