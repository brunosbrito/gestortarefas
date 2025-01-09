import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Building2, ClipboardList, Activity, UserCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

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

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        
        if (profile?.name) {
          setUserName(profile.name);
        }
      }
    };

    getUser();
  }, []);

  return (
    <div className="flex h-screen bg-construction-50">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-construction-200">
        <div className="p-4 border-b border-construction-200">
          <h1 className="text-2xl font-bold text-primary">ConstructTask</h1>
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