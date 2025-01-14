import { 
  LayoutDashboard, 
  Users, 
  Building2,
  Clock,
  FolderTree,
} from "lucide-react";
import { MenuItem } from "./types";

export const navItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Usuários", path: "/users" },
  { 
    icon: Building2, 
    label: "Obras",
    subItems: [
      { icon: Building2, label: "Lista Obras", path: "/obras" },
      { icon: FolderTree, label: "Ordens de Serviço", path: "/obras/os" },
    ]
  },
  { icon: Clock, label: "Registro de Ponto", path: "/ponto" },
];