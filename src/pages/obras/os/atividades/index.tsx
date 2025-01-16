import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NovaAtividadeForm } from '@/components/atividades/NovaAtividadeForm';
import { StatusList } from '@/components/atividades/StatusList';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { useParams } from 'react-router-dom';
import { getActivitiesByServiceOrderId } from '@/services/ActivityService';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { AtualizarStatusDialog } from '@/components/atividades/AtualizarStatusDialog';
import ObrasService from '@/services/ObrasService';
import { Obra } from '@/interfaces/ObrasInterface';

const statusListas = [
  'Planejadas',
  'Em execução',
  'Concluídas',
  'Paralizadas',
] as const;

const Atividades = () => {
  const [atividades, setAtividades] = useState<AtividadeStatus[]>([]);
  const [openNovaAtividade, setOpenNovaAtividade] = useState(false);
  const [obra, setObra] = useState<Obra | null>(null);
  const [dialogStatus, setDialogStatus] = useState<{
    open: boolean;
    atividade: AtividadeStatus | null;
    novoStatus: string;
  }>({
    open: false,
    atividade: null,
    novoStatus: '',
  });
  const { projectId, serviceOrderId } = useParams();

  const getByServiceOrderId = async () => {
    try {
      const data = await getActivitiesByServiceOrderId(serviceOrderId);
      setAtividades(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getByServiceOrderId();
    
    // Buscar informações da obra
    const fetchObra = async () => {
      if (projectId) {
        try {
          const obraData = await ObrasService.getObraById(Number(projectId));
          setObra(obraData);
        } catch (error) {
          console.error('Erro ao buscar obra:', error);
        }
      }
    };
    
    fetchObra();
  }, [projectId, serviceOrderId]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const atividade = atividades.find((a) => a.id === Number(draggableId));

      if (atividade) {
        setDialogStatus({
          open: true,
          atividade,
          novoStatus: destination.droppableId,
        });
      }
    }
  };

  const handleSuccess = () => {
    setOpenNovaAtividade(false);
    getByServiceOrderId();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-construction-800">
            Atividades
          </h1>
          {obra?.status !== 'finalizado' && (
            <Dialog open={openNovaAtividade} onOpenChange={setOpenNovaAtividade}>
              <DialogTrigger asChild>
                <Button className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Atividade
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Atividade</DialogTitle>
                </DialogHeader>
                <NovaAtividadeForm
                  projectId={Number(projectId)}
                  orderServiceId={Number(serviceOrderId)}
                  onSuccess={handleSuccess}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {statusListas.map((status) => (
              <StatusList
                key={status}
                status={status}
                atividades={atividades}
                droppableId={status}
              />
            ))}
          </div>
        </DragDropContext>

        <AtualizarStatusDialog
          open={dialogStatus.open}
          onOpenChange={(open) =>
            setDialogStatus((prev) => ({ ...prev, open }))
          }
          atividade={dialogStatus.atividade}
          novoStatus={dialogStatus.novoStatus}
          onSuccess={getByServiceOrderId}
        />
      </div>
    </Layout>
  );
};

export default Atividades;