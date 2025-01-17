import React from "react";
import { Header } from "./layout/Header";
import { Sidebar } from "./layout/Sidebar";
import { useUser } from "./layout/useUser";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="flex h-screen bg-construction-50">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-construction-200">
        <Header user={user} />
        <Sidebar user={user} />
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;