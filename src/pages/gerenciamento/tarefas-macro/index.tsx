import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { NovaTarefaMacroForm } from "@/components/gerenciamento/tarefas-macro/NovaTarefaMacroForm";
import { TarefasMacroList } from "@/components/gerenciamento/tarefas-macro/TarefasMacroList";

const TarefasMacro = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-construction-800">Tarefas Macro</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-secondary">
                <Plus className="w-4 h-4 mr-2" />
                Nova Tarefa Macro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Tarefa Macro</DialogTitle>
              </DialogHeader>
              <NovaTarefaMacroForm />
            </DialogContent>
          </Dialog>
        </div>

        <TarefasMacroList />
      </div>
    </Layout>
  );
};

export default TarefasMacro;