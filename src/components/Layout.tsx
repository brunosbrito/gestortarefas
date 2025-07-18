import React, { useState, useEffect } from "react";
import { Header } from "./layout/Header";
import { Sidebar } from "./layout/Sidebar";
import { useUser } from "./layout/useUser";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { getStoredToken } from "@/services/AuthService";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);

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
    <div className="flex h-screen bg-construction-50">
      {/* Overlay para mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static h-full bg-white border-r border-construction-200 z-50 transition-all duration-300 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${
          isDesktopSidebarCollapsed ? "md:w-0 md:border-r-0" : "w-[280px]"
        }`}
        style={{
          width: isDesktopSidebarCollapsed ? '0px' : '280px'
        }}
      >
        <div className={`${isDesktopSidebarCollapsed ? 'hidden' : 'block'}`}>
          <Header user={user} />
          <Sidebar user={user} />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto w-full relative">
        {/* Desktop toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
          className="hidden md:flex fixed top-4 left-4 z-10 bg-white border border-construction-200 shadow-sm hover:bg-construction-50"
          style={{
            left: isDesktopSidebarCollapsed ? '16px' : '296px',
            transition: 'left 0.3s ease'
          }}
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Mobile header */}
        <div className="md:hidden flex items-center p-4 bg-white border-b border-construction-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Sistema de Gestão</h1>
        </div>

        <div className={`container mx-auto p-4 md:p-6 ${isDesktopSidebarCollapsed ? 'md:pl-16' : 'md:pl-6'} transition-all duration-300`}>{children}</div>
      </main>
    </div>
  );
};

export default Layout;