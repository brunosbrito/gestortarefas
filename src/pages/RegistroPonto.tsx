
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import { PontoForm } from '@/components/registro-ponto/PontoForm';
import { PontoTable } from '@/components/registro-ponto/PontoTable';
import { PontoLoteForm } from '@/components/registro-ponto/PontoLoteForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ObrasService from '@/services/ObrasService';
import ColaboradorService from '@/services/ColaboradorService';
import { Obra } from '@/interfaces/ObrasInterface';
import {
  createEffective,
  deleteEffectives,
  getEffectivesByShiftAndDate,
  updateEffective,
} from '@/services/EffectiveService';
import { Funcionario } from '@/interfaces/FuncionarioInterface';
import { CreateEffectiveDto } from '@/interfaces/EffectiveInterface';
import { Colaborador } from '@/interfaces/ColaboradorInterface';

const RegistroPonto = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoteDialogOpen, setIsLoteDialogOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] =
    useState<Funcionario | null>(null);
  const [currentTurno, setCurrentTurno] = useState('1');
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const funcionariosData = await getEffectivesByShiftAndDate(currentTurno);
      const obrasData = await ObrasService.getAllObras();
      const colaboradoresData = await ColaboradorService.getAllColaboradores();

      setFuncionarios(funcionariosData);
      setObras(obrasData);
      setColaboradores(colaboradoresData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentTurno]);

  const handleDelete = async (id: number) => {
    await deleteEffectives(id);
    toast.success('Registro excluído com sucesso');
    fetchData();
  };

  const handleEdit = (funcionario: Funcionario) => {
    setSelectedFuncionario(funcionario);
    setIsEditDialogOpen(true);
  };

  const onEditSubmit = async (data: any) => {
    if (!selectedFuncionario) return;
    try {
      await updateEffective(data, selectedFuncionario.id);
      setIsEditDialogOpen(false);
      setSelectedFuncionario(null);
      toast.success('Registro atualizado com sucesso');
      fetchData();
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      toast.error('Erro ao atualizar registro. Tente novamente.');
    }
  };

  const onLoteSubmit = async (registros: any) => {
    try {
      await createEffective(registros);
      setIsLoteDialogOpen(false);
      toast.success(`${registros.length} registros criados com sucesso!`);
      fetchData();
    } catch (error) {
      console.error('Erro ao criar registros em lote:', error);
      toast.error('Erro ao criar registros em lote. Tente novamente.');
    }
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-construction-800">
            Registro de Ponto
          </h1>
          <div className="flex gap-2">
            <Dialog open={isLoteDialogOpen} onOpenChange={setIsLoteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#FFA500] hover:bg-[#FFA500]/90 w-full sm:w-auto">
                  <Users className="w-4 h-4 mr-2" />
                  Adicionar Registro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Registro - Turno {currentTurno}</DialogTitle>
                  <DialogDescription>
                    Registre o ponto de múltiplos colaboradores de uma vez.
                  </DialogDescription>
                </DialogHeader>
                <PontoLoteForm
                  colaboradores={colaboradores}
                  obras={obras}
                  onSubmit={onLoteSubmit}
                  onClose={() => setIsLoteDialogOpen(false)}
                  turno={currentTurno}
                />
              </DialogContent>
            </Dialog>
          </div>
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
                  shift: selectedFuncionario.shift.toString(),
                  typeRegister: selectedFuncionario.typeRegister,
                  username: selectedFuncionario.username,
                  project: selectedFuncionario.project,
                  sector: selectedFuncionario.sector,
                  reason: selectedFuncionario.reason,
                }}
                isEdit
              />
            )}
          </DialogContent>
        </Dialog>

        <Tabs
          value={`turno${currentTurno}`}
          onValueChange={(value) => setCurrentTurno(value.replace('turno', ''))}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2">
            <TabsTrigger value="turno1" className="text-sm sm:text-base">
              1º Turno
            </TabsTrigger>
            <TabsTrigger value="turno2" className="text-sm sm:text-base">
              2º Turno
            </TabsTrigger>
            <TabsTrigger value="turno3" className="text-sm sm:text-base">
              Turno Central
            </TabsTrigger>
          </TabsList>
          <TabsContent value="turno1" className="mt-6">
            <PontoTable
              funcionarios={funcionarios}
              turno={1}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRefresh={fetchData}
            />
          </TabsContent>
          <TabsContent value="turno2" className="mt-6">
            <PontoTable
              funcionarios={funcionarios}
              turno={2}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRefresh={fetchData}
            />
          </TabsContent>
          <TabsContent value="turno3" className="mt-6">
            <PontoTable
              funcionarios={funcionarios}
              turno={3}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRefresh={fetchData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default RegistroPonto;
