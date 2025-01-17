import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PontoForm } from "@/components/registro-ponto/PontoForm";
import { PontoTable } from "@/components/registro-ponto/PontoTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEffectivesByShiftAndDate } from "@/services/EffectiveService";
import ObrasService from "@/services/ObrasService";
import ColaboradorService from "@/services/ColaboradorService";

interface Funcionario {
  id: number;
  nome: string;
  setor: "PRODUCAO" | "ADMINISTRATIVO";
  status: "PRESENTE" | "FALTA";
  turno: 1 | 2 | 3;
  obra?: string;
  motivoFalta?: string;
}

const RegistroPonto = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [currentTurno, setCurrentTurno] = useState("1");
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [obras, setObras] = useState<string[]>([]);
  const [colaboradores, setColaboradores] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [funcionariosData, obrasData, colaboradoresData] = await Promise.all([
          getEffectivesByShiftAndDate(currentTurno),
          ObrasService.getAllObras(),
          ColaboradorService.getAllColaboradores()
        ]);

        setFuncionarios(funcionariosData);
        setObras(obrasData.map(obra => obra.name));
        setColaboradores(colaboradoresData.data.map(col => col.name));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error("Erro ao carregar dados. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentTurno]);

  const handleDelete = async (id: number) => {
    toast.success("Registro excluído com sucesso");
  };

  const handleEdit = (funcionario: Funcionario) => {
    setSelectedFuncionario(funcionario);
    setIsEditDialogOpen(true);
  };

  const onSubmit = (data: any) => {
    const novoFuncionario: Funcionario = {
      id: Math.random(),
      nome: data.colaborador,
      setor: data.tipo === "PRODUCAO" ? "PRODUCAO" : "ADMINISTRATIVO",
      status: data.tipo === "FALTA" ? "FALTA" : "PRESENTE",
      turno: Number(data.turno) as 1 | 2 | 3,
      obra: data.obra,
      motivoFalta: data.motivoFalta
    };

    setIsDialogOpen(false);
    toast.success("Registro adicionado com sucesso");
  };

  const onEditSubmit = (data: any) => {
    if (!selectedFuncionario) return;

    setIsEditDialogOpen(false);
    setSelectedFuncionario(null);
    toast.success("Registro atualizado com sucesso");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-lg text-gray-600">Carregando registros...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-construction-800">Registro de Ponto</h1>
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
        </div>

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

        <Tabs defaultValue="turno1" className="w-full" onValueChange={(value) => setCurrentTurno(value.replace('turno', ''))}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="turno1">1º Turno (06:00 - 14:00)</TabsTrigger>
            <TabsTrigger value="turno2">2º Turno (14:00 - 22:00)</TabsTrigger>
            <TabsTrigger value="turno3">Turno Central (08:00 - 17:00)</TabsTrigger>
          </TabsList>
          <TabsContent value="turno1" className="mt-6">
            <PontoTable
              funcionarios={funcionarios}
              turno={1}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabsContent>
          <TabsContent value="turno2" className="mt-6">
            <PontoTable
              funcionarios={funcionarios}
              turno={2}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabsContent>
          <TabsContent value="turno3" className="mt-6">
            <PontoTable
              funcionarios={funcionarios}
              turno={3}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default RegistroPonto;