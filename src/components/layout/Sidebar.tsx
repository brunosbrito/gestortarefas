import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Building2, ClipboardList, Activity } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Usuários", path: "/users" },
  { icon: Building2, label: "Obras", path: "/obras" },
  { icon: ClipboardList, label: "Ordens de Serviço", path: "/os" },
  { icon: Activity, label: "Atividades", path: "/atividades" },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
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
  );
};