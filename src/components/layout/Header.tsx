import { UserCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  userName: string;
}

export const Header = ({ userName }: HeaderProps) => {
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
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
        </div>
      </div>
    </>
  );
};