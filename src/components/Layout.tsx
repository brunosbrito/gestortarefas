import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Building2, ClipboardList, Activity, UserCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Usuários", path: "/users" },
  { icon: Building2, label: "Obras", path: "/obras" },
  { icon: ClipboardList, label: "Ordens de Serviço", path: "/os" },
  { icon: Activity, label: "Atividades", path: "/atividades" },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [userName, setUserName] = React.useState("Carregando...");
  const { toast } = useToast();

  React.useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        
        if (user) {
          // Primeiro busca o usuário na tabela users usando o user_ref
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('name')
            .eq('user_ref', user.id)
            .maybeSingle();
          
          if (userError) throw userError;
          
          if (userData?.name) {
            setUserName(userData.name);
          } else {
            // Se não encontrar na tabela users, tenta buscar na tabela profiles como fallback
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', user.id)
              .maybeSingle();
            
            if (profileError) throw profileError;
            
            if (profile?.name) {
              setUserName(profile.name);
            } else {
              setUserName("Usuário");
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar as informações do usuário."
        });
        setUserName("Usuário");
      }
    };

    getUser();
  }, [toast]);

  return (
    <div className="flex h-screen bg-construction-50">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-construction-200">
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

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ icon: Icon, label, path }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === path
                  ? "bg-primary text-white"
                  : "text-construction-600 hover:bg-construction-100"
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;