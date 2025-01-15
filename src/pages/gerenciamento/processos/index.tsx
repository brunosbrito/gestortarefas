import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { NovoProcessoForm } from "@/components/gerenciamento/processos/NovoProcessoForm";
import { ProcessosList } from "@/components/gerenciamento/processos/ProcessosList";
import { useState } from "react";

const Processos = () => {

   const [reload, setReload] = useState(false)
  
    const getProcessos = () => {
      setReload(prev => !prev)
    }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-construction-800">Processos</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-secondary">
                <Plus className="w-4 h-4 mr-2" />
                Novo Processo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Processo</DialogTitle>
              </DialogHeader>
              <NovoProcessoForm onProcessCreated={getProcessos} />
            </DialogContent>
          </Dialog>
        </div>

        <ProcessosList reload={reload} />
      </div>
    </Layout>
  );
};

export default Processos;