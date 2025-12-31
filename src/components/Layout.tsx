import React, { useState, useEffect } from "react";
import { Header } from "./layout/Header";
import { Sidebar } from "./layout/Sidebar";
import { useUser } from "./layout/useUser";
import { Menu, X, Keyboard } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { getStoredToken } from "@/services/AuthService";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useSystemHighContrast } from "@/hooks/useHighContrast";
import { ShortcutsModal } from "./shortcuts/ShortcutsModal";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Atalhos de teclado globais
  useKeyboardShortcuts({
    onOpenShortcutsModal: () => setIsShortcutsModalOpen(true),
    onToggleSidebar: () => setIsSidebarOpen(prev => !prev),
  });

  // Detectar preferência de alto contraste do sistema
  useSystemHighContrast();

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
    <div className="flex h-screen bg-background">
      {/* Overlay para mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static w-[280px] h-screen bg-card/95 backdrop-blur-xl border-r border-border/50 z-50 transition-all duration-300 ease-in-out transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 shadow-xl md:shadow-none flex flex-col`}
      >
        <Header user={user} />
        <Sidebar user={user} />

        {/* Footer com versão */}
        <div className="mt-auto p-4 border-t border-border/50 bg-muted/30">
          <div className="text-center space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              GMX Soluções Industriais
            </p>
            <p className="text-[10px] text-muted-foreground/70">
              v2.0.0 • 2025
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto w-full bg-background">
        {/* Mobile header */}
        <div className="md:hidden sticky top-0 z-40 flex items-center justify-between p-4 bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-elevation-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hover:bg-accent rounded-lg"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          <h1 className="text-base font-semibold text-foreground">
            Gestor Master
          </h1>

          {/* Botão de ajuda */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsShortcutsModalOpen(true)}
            className="hover:bg-accent rounded-lg"
            aria-label="Mostrar atalhos de teclado"
          >
            <Keyboard className="h-5 w-5" />
          </Button>
        </div>

        <div className="container mx-auto p-4 md:p-6 max-w-7xl">{children}</div>
      </main>

      {/* Modal de Atalhos */}
      <ShortcutsModal
        open={isShortcutsModalOpen}
        onOpenChange={setIsShortcutsModalOpen}
      />
    </div>
  );
};

export default Layout;