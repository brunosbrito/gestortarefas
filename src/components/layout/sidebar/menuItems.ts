import { 
  LayoutDashboard, 
  Users, 
  Building2,
  Clock,
  FolderTree,
  ListChecks,
} from "lucide-react";
import { MenuItem } from "./types";

export const navItems: MenuItem[] = [
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