import { LucideIcon } from "lucide-react";

export interface SubMenuItem {
  icon: LucideIcon;
  label: string;
  path?: string;
  subItems?: SubMenuItem[]; // Allow nested submenus
}

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  path?: string;
  subItems?: SubMenuItem[];
  adminOnly?: boolean;
}