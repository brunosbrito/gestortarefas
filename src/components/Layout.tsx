import React, { useState, useEffect, useRef } from "react";
import { Header } from "./layout/Header";
import { Sidebar } from "./layout/Sidebar";
import { useUser } from "./layout/useUser";
import { Menu, X, Keyboard, GripVertical } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { getStoredToken } from "@/services/AuthService";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useSystemHighContrast } from "@/hooks/useHighContrast";
import { ShortcutsModal } from "./shortcuts/ShortcutsModal";

const SIDEBAR_WIDTH_KEY = 'sidebar-width';
const DEFAULT_SIDEBAR_WIDTH = 280;
const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 500;

const Layout = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const stored = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return stored ? parseInt(stored, 10) : DEFAULT_SIDEBAR_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

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

  // Persistir largura da sidebar no localStorage
  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  // Handlers para redimensionamento da sidebar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

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
        ref={sidebarRef}
        style={{
          width: `${sidebarWidth}px`,
        }}
        className={`fixed md:static h-screen bg-card/95 backdrop-blur-xl border-r border-border/50 z-50 transition-transform duration-300 ease-in-out transform ${
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

        {/* Resize Handle - Desktop only */}
        <div
          onMouseDown={() => setIsResizing(true)}
          className="hidden md:block absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize group hover:bg-primary/20 transition-colors"
          aria-label="Redimensionar barra lateral"
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-primary text-primary-foreground rounded-md p-1 shadow-lg">
              <GripVertical className="w-3 h-3" />
            </div>
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