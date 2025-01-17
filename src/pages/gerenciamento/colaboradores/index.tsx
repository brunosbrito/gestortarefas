import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { NovoColaboradorForm } from "@/components/gerenciamento/colaboradores/NovoColaboradorForm";
import { ColaboradoresList } from "@/components/gerenciamento/colaboradores/ColaboradoresList";
import { useState } from "react";

const Colaboradores = () => {
  const [reload, setReload] = useState(false);

  const getColaboradores = () => {
    setReload(prev => !prev);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-construction-800">Colaboradores</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
                <Plus className="w-4 h-4 mr-2" />
                Novo Colaborador
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Colaborador</DialogTitle>
              </DialogHeader>
              <NovoColaboradorForm onSuccess={getColaboradores} />
            </DialogContent>
          </Dialog>
        </div>

        <ColaboradoresList reload={reload} />
      </div>
    </Layout>
  );
};

export default Colaboradores;