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
        className={`fixed md:static w-[280px] h-full bg-white border-r border-construction-200 z-50 transition-transform duration-300 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <Header user={user} />
        <Sidebar user={user} />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden w-full flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden flex items-center p-4 bg-white border-b border-construction-200 flex-shrink-0">
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

        <div className="container mx-auto p-4 md:p-6 flex-1 flex flex-col overflow-hidden">{children}</div>
      </main>
    </div>
  );
};

export default Layout;