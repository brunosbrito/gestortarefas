import { LucideIcon } from "lucide-react";

export interface SubMenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  path?: string;
  subItems?: SubMenuItem[];
  adminOnly?: boolean;
}