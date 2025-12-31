import { Building2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/interfaces/UserInterface';
import { SettingsDropdown } from './SettingsDropdown';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user: User;
}

export const Header = ({ user }: HeaderProps) => {
  if (!user) {
    return (
      <div className="gradient-primary p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Gestor Master</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border/50">
      {/* Logo e título */}
      <div className="gradient-primary p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
              <Building2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <h1 className="text-base md:text-lg font-bold text-white">
              <span className="hidden sm:inline">Gestor Master</span>
              <span className="sm:hidden">GM</span>
            </h1>
          </div>

          <SettingsDropdown />
        </div>
      </div>

      {/* Informações do usuário */}
      <div className="p-3 md:p-4 bg-card">
        <div className="flex items-center gap-3">
          <Avatar className={cn(
            "h-10 w-10 ring-2 ring-primary/20 shadow-lg",
            "transition-all duration-200 hover:ring-primary/40"
          )}>
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
              {user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {user.username}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                user.role === 'admin' ? "bg-primary" : "bg-muted-foreground"
              )} />
              {user.role === 'admin' ? 'Administrador' : 'Usuário'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
