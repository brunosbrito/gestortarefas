import { LogOut, UserCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/interfaces/UserInterface';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '../ui/use-toast';

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
      <div className="p-4 border-b border-construction-200">
        <h1 className="text-2xl font-bold text-primary">Gestor de Tarefas</h1>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 border-b border-construction-200">
        <h1 className="text-2xl font-bold text-primary">Gestor de Tarefas</h1>
      </div>

      <div className="p-4 border-b border-construction-200">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-white">
              <UserCircle2 className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">{user.username}</p>
            <p className="text-xs text-gray-500">
              {user.role === 'admin' ? 'Administrador' : ''}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </>
  );
};
