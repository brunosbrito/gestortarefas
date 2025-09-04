import React, { useEffect } from "react";
import { Header } from "./layout/Header";
import { AppSidebar } from "./AppSidebar";
import { useUser } from "./layout/useUser";
import { useNavigate } from "react-router-dom";
import { getStoredToken } from "@/services/AuthService";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        {/* Header fixo no topo */}
        <div className="fixed top-0 left-0 right-0 z-40">
          <Header user={user} />
        </div>

        {/* Sidebar */}
        <div className="pt-[120px]"> {/* Espaço para o header */}
          <AppSidebar user={user} />
        </div>

        {/* Main content */}
        <SidebarInset className="pt-[120px]"> {/* Espaço para o header */}
          {/* Mobile header - só mostra em telas pequenas */}
          <div className="md:hidden flex items-center p-4 bg-card border-b border-border shadow-sm">
            <SidebarTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-accent"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SidebarTrigger>
            <h1 className="ml-4 text-lg font-semibold text-foreground">Sistema de Gestão</h1>
          </div>

          <div className="container mx-auto p-4 md:p-6 max-w-7xl">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;