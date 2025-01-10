import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Building2,
  Clock,
  FolderTree,
  ListChecks,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";

interface SubMenuItem {
  icon: any;
  label: string;
  path: string;
}

interface MenuItem {
  icon: any;
  label: string;
  path?: string;
  subItems?: SubMenuItem[];
}

const navItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Usuários", path: "/users" },
  { 
    icon: Building2, 
    label: "Obras",
    path: "/obras",
    subItems: [
      { icon: FolderTree, label: "Ordens de Serviço", path: "/obras/os" },
      { icon: ListChecks, label: "Atividades", path: "/obras/os/atividades" },
    ]
  },
  { icon: Clock, label: "Registro de Ponto", path: "/ponto" },
];

export const Sidebar = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    const shouldExpandObras = location.pathname.includes('/obras');
    if (shouldExpandObras && !expandedItems.includes('Obras')) {
      setExpandedItems(prev => [...prev, 'Obras']);
    }
  }, [location.pathname]);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const isExpanded = expandedItems.includes(item.label);
    const hasSubItems = item.subItems && item.subItems.length > 0;

    if (hasSubItems) {
      return (
        <div key={item.label} className="space-y-1">
          <Link
            to={item.path || "#"}
            onClick={(e) => {
              if (hasSubItems) {
                e.preventDefault();
                toggleExpand(item.label);
              }
            }}
            className={`flex items-center w-full space-x-3 px-4 py-3 rounded-lg text-construction-600 hover:bg-construction-100 ${
              location.pathname === item.path ? "bg-primary text-white" : ""
            }`}
          >
            <item.icon size={20} />
            <span className="flex-1">{item.label}</span>
            {hasSubItems && (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
          </Link>
          
          {isExpanded && (
            <div className="pl-4 space-y-1">
              {item.subItems.map((subItem) => (
                <Link
                  key={subItem.path}
                  to={subItem.path}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === subItem.path
                      ? "bg-primary text-white"
                      : "text-construction-600 hover:bg-construction-100"
                  }`}
                >
                  <subItem.icon size={18} />
                  <span>{subItem.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.path || "#"}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
          location.pathname === item.path
            ? "bg-primary text-white"
            : "text-construction-600 hover:bg-construction-100"
        }`}
      >
        <item.icon size={20} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <nav className="flex-1 p-4 space-y-2">
      {navItems.map(renderMenuItem)}
    </nav>
  );
};