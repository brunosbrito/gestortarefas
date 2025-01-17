import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { PontoForm } from "@/components/registro-ponto/PontoForm";
import { PontoTable } from "@/components/registro-ponto/PontoTable";

interface Funcionario {
  id: number;
  nome: string;
  setor: "PRODUCAO" | "ADMINISTRATIVO";
  status: "PRESENTE" | "FALTA";
  turno: 1 | 2 | 3;
  obra?: string;
  motivoFalta?: string;
}

const funcionariosIniciais: Funcionario[] = [
  {
    id: 1,
    nome: "João Silva",
    setor: "PRODUCAO",
    status: "PRESENTE",
    turno: 1,
    obra: "Obra A"
  },
  {
    id: 2,
    nome: "Maria Santos",
    setor: "ADMINISTRATIVO",
    status: "PRESENTE",
    turno: 3
  }
];

const obras = ["Obra A", "Obra B", "Obra C"];
const colaboradores = ["João Silva", "Maria Santos", "Pedro Alves"];

const RegistroPonto = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(funcionariosIniciais);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);

  const handleDelete = (id: number) => {
    setFuncionarios(prev => prev.filter(f => f.id !== id));
    toast.success("Registro excluído com sucesso");
  };

  const handleEnviar = () => {
    console.log("Enviando dados do ponto:", funcionarios);
    toast.success("Registros enviados com sucesso");
  };

  const handleEdit = (funcionario: Funcionario) => {
    setSelectedFuncionario(funcionario);
    setIsEditDialogOpen(true);
  };

  const onSubmit = (data: any) => {
    const novoFuncionario: Funcionario = {
      id: funcionarios.length + 1,
      nome: data.colaborador,
      setor: data.tipo === "PRODUCAO" ? "PRODUCAO" : "ADMINISTRATIVO",
      status: data.tipo === "FALTA" ? "FALTA" : "PRESENTE",
      turno: Number(data.turno) as 1 | 2 | 3,
      obra: data.obra,
      motivoFalta: data.motivoFalta
    };

    setFuncionarios(prev => [...prev, novoFuncionario]);
    setIsDialogOpen(false);
  };

  const onEditSubmit = (data: any) => {
    if (!selectedFuncionario) return;

    const funcionarioAtualizado: Funcionario = {
      ...selectedFuncionario,
      nome: data.colaborador,
      setor: data.tipo === "PRODUCAO" ? "PRODUCAO" : "ADMINISTRATIVO",
      status: data.tipo === "FALTA" ? "FALTA" : "PRESENTE",
      turno: Number(data.turno) as 1 | 2 | 3,
      obra: data.obra,
      motivoFalta: data.motivoFalta
    };

    setFuncionarios(prev => 
      prev.map(f => f.id === selectedFuncionario.id ? funcionarioAtualizado : f)
    );
    setIsEditDialogOpen(false);
    setSelectedFuncionario(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-construction-800">Registro de Ponto</h1>
          <div className="space-x-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Registro
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Novo Registro de Ponto</DialogTitle>
                  <DialogDescription>
                    Preencha os campos abaixo para adicionar um novo registro de ponto.
                  </DialogDescription>
                </DialogHeader>
                <PontoForm
                  onSubmit={onSubmit}
                  obras={obras}
                  colaboradores={colaboradores}
                  onClose={() => setIsDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Editar Registro de Ponto</DialogTitle>
                  <DialogDescription>
                    Edite as informações do registro de ponto.
                  </DialogDescription>
                </DialogHeader>
                {selectedFuncionario && (
                  <PontoForm
                    onSubmit={onEditSubmit}
                    obras={obras}
                    colaboradores={colaboradores}
                    onClose={() => setIsEditDialogOpen(false)}
                    defaultValues={{
                      turno: selectedFuncionario.turno.toString(),
                      tipo: selectedFuncionario.setor,
                      colaborador: selectedFuncionario.nome,
                      obra: selectedFuncionario.obra,
                      setor: selectedFuncionario.setor === "ADMINISTRATIVO" ? selectedFuncionario.setor : "",
                      motivoFalta: selectedFuncionario.motivoFalta,
                    }}
                    isEdit
                  />
                )}
              </DialogContent>
            </Dialog>

            <Button onClick={handleEnviar} variant="secondary">
              <Send className="w-4 h-4 mr-2" />
              Enviar Registros
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <PontoTable
            funcionarios={funcionarios}
            turno={1}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <PontoTable
            funcionarios={funcionarios}
            turno={2}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <PontoTable
            funcionarios={funcionarios}
            turno={3}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </Layout>
  );
};

export default RegistroPonto;
