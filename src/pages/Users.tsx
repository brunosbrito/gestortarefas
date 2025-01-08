import React from "react";
import Layout from "@/components/Layout";

const Users = () => {
  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          {/* Conteúdo da tabela de usuários será adicionado aqui */}
          <div className="p-6">
            <p>Lista de usuários em desenvolvimento</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Users;