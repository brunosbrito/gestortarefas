import { 
  LayoutDashboard, 
  Users,
  Building2,
  Clock,
  Settings,
  ListTodo,
  GitFork
} from "lucide-react";
import { MenuItem } from "./types";

export const navItems: MenuItem[] = [
  { 
    icon: LayoutDashboard, 
    label: "Dashboard", 
    path: "/" 
  },
  { 
    icon: Users, 
    label: "Usuários", 
    path: "/users" 
  },
  { 
    icon: Building2, 
    label: "Obras", 
    path: "/obras" 
  },
  {
    icon: Settings,
    label: "Gerenciamento",
    subItems: [
      {
        icon: Users,
        label: "Colaboradores",
        path: "/gerenciamento/colaboradores"
      },
      {
        icon: ListTodo,
        label: "Tarefas Macro",
        path: "/gerenciamento/tarefas-macro"
      },
      {
        icon: GitFork,
        label: "Processos",
        path: "/gerenciamento/processos"
      }
    ]
  },
  { 
    icon: Clock, 
    label: "Registro de Ponto", 
    path: "/ponto" 
  },
];