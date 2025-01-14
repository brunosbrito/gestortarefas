import { 
  LayoutDashboard, 
  Users, 
  Building2,
  Clock,
  ClipboardList,
} from "lucide-react";
import { MenuItem } from "./types";

export const navItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Usuários", path: "/users" },
  { icon: Building2, label: "Obras", path: "/obras" },
  { icon: ClipboardList, label: "Ordens de Serviço", path: "/obras/os" },
  { icon: Clock, label: "Registro de Ponto", path: "/ponto" },
];