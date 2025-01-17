import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  User,
  Building2,
  ClipboardList,
  Hash,
  Weight,
  FileText,
} from 'lucide-react';
import { ServiceOrder } from '@/interfaces/ServiceOrderInterface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateServiceOrderProgress } from '@/services/ServiceOrderService';

interface VisualizarOSDialogProps {
  os: ServiceOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProgress?: () => void;
}

export const VisualizarOSDialog = ({
  os,
  open,
  onOpenChange,
  onUpdateProgress,
}: VisualizarOSDialogProps) => {
  const [progress, setProgress] = useState<number>();
  const { toast } = useToast();

  useEffect(() => {
    setProgress(os.progress);
  }, []);

  if (!os) return null;

  const handleUpdateProgress = async () => {
    if (progress < 0) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar progresso',
        description: 'O progresso deve ser entre 0 e 100.',
      });
      return;
    }

    try {
      const response = await updateServiceOrderProgress(
        Number(os.id),
        progress
      );

      if (response?.data?.progress) {
        setProgress(response.data.progress);
      }

      toast({
        title: 'Progresso atualizado',
        description: 'O progresso da OS foi atualizado com sucesso!',
      });

      if (onUpdateProgress) {
        onUpdateProgress();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar progresso',
        description: 'Não foi possível atualizar o progresso da OS.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Ordem de Serviço</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              OS-{os.serviceOrderNumber.toString().padStart(3, '0')}
            </h2>
            <Badge
              variant={
                os.status === 'em_andamento'
                  ? 'default'
                  : os.status === 'concluida'
                  ? 'secondary'
                  : 'outline'
              }
            >
              {os.status === 'em_andamento'
                ? 'Em Andamento'
                : os.status === 'concluida'
                ? 'Concluída'
                : 'Pausada'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                Obra
              </h3>
              <p>{os.projectId.name}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Data de Início
              </h3>
              <p>{new Date(os.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <ClipboardList className="w-4 h-4 mr-2" />
              Descrição
            </h3>
            <p>{os.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Número do Projeto
            </h3>
            <p>{os.projectNumber}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Hash className="w-4 h-4 mr-2" />
                Quantidade
              </h3>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  placeholder="Progresso"
                  className="w-24"
                />
                <span>/</span>
                <p>{os.quantity || 0}</p>
                <Button
                  onClick={handleUpdateProgress}
                  className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
                >
                  Atualizar
                </Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Weight className="w-4 h-4 mr-2" />
                Peso (t)
              </h3>
              <p>{os.weight}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Responsável
            </h3>
            <p>{os.assignedUser?.name || 'Não atribuído'}</p>
          </div>

          {os.notes && (
            <div>
              <h3 className="font-semibold mb-2">Observações</h3>
              <p>{os.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
