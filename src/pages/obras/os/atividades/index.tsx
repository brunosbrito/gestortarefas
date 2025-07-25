
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
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import { useToast } from '@/hooks/use-toast';

const statusListas = [
  'Planejadas',
  'Em execução',
  'Paralizadas',
  'Concluídas',
] as const;

const Atividades = () => {
  const { toast } = useToast();
  const [atividades, setAtividades] = useState<AtividadeStatus[]>([]);
  const [openNovaAtividade, setOpenNovaAtividade] = useState(false);
  const [obra, setObra] = useState<Obra | null>(null);
  const [dialogStatus, setDialogStatus] = useState<{
    open: boolean;
    atividade: { id: string; collaborators?: Colaborador[] } | null;
    novoStatus: string;
  }>({
    open: false,
    atividade: null,
    novoStatus: '',
  });
  const { projectId, serviceOrderId } = useParams();

  const getByServiceOrderId = async () => {
    try {
      if (!serviceOrderId) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar atividades",
          description: "ID da ordem de serviço não encontrado",
        });
        return;
      }
      
      const data = await getActivitiesByServiceOrderId(serviceOrderId);
      setAtividades(data);
    } catch (error) {
      console.error("Erro ao carregar atividades:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar atividades",
        description: "Não foi possível carregar as atividades. Tente novamente.",
      });
    }
  };

  useEffect(() => {
    if (serviceOrderId) {
      getByServiceOrderId();
    }
    
    const fetchObra = async () => {
      if (projectId) {
        try {
          const obraData = await ObrasService.getObraById(Number(projectId));
          setObra(obraData);
        } catch (error) {
          console.error('Erro ao buscar obra:', error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar obra",
            description: "Não foi possível carregar os dados da obra. Tente novamente.",
          });
        }
      }
    };
    
    fetchObra();
  }, [projectId, serviceOrderId, toast]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const atividade = atividades.find((a) => a.id === Number(draggableId));

      if (atividade) {
        setDialogStatus({
          open: true,
          atividade: {
            id: String(atividade.id),
            collaborators: atividade.collaborators
          },
          novoStatus: destination.droppableId,
        });
      }
    }
  };

  const handleMoveAtividade = (atividadeId: number, novoStatus: string) => {
    const atividade = atividades.find((a) => a.id === atividadeId);
    if (atividade) {
      setDialogStatus({
        open: true,
        atividade: {
          id: String(atividadeId),
          collaborators: atividade.collaborators
        },
        novoStatus: novoStatus,
      });
    }
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
                  onSuccess={() => {
                    setOpenNovaAtividade(false);
                    getByServiceOrderId();
                  }}
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
                onMoveAtividade={handleMoveAtividade}
                onDelete={getByServiceOrderId}
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
