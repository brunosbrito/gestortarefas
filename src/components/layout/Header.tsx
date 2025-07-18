import { LogOut, UserCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/interfaces/UserInterface';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '../ui/use-toast';

interface HeaderProps {
  user: User;
  isCollapsed?: boolean;
}

export const Header = ({ user, isCollapsed = false }: HeaderProps) => {
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
      <div className="bg-gradient-to-r from-[#FF7F0E] to-[#FFA500] p-4 text-white">
        <div className="flex items-center justify-center">
          <h1 className="text-xl font-bold">Sistema de Gestão</h1>
        </div>
      </div>
    );
  }

  return (
    <header className="bg-gradient-to-r from-[#FF7F0E] to-[#FFA500] p-4 text-white">
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <>
            <div>
              <h1 className="text-xl font-bold">Sistema de Gestão</h1>
              <p className="text-sm opacity-90">Controle de Atividades</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm">Olá, {user.username}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-[#FF7F0E] border-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </>
        )}
        {isCollapsed && (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">{user.username.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
