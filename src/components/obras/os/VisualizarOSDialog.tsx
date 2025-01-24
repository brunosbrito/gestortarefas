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
  Image,
  File,
} from 'lucide-react';
import { ServiceOrder } from '@/interfaces/ServiceOrderInterface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateServiceOrderProgress } from '@/services/ServiceOrderService';
import { AtividadeImageCarousel } from '@/components/atividades/AtividadeImageCarousel';

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
    setProgress(os?.progress);
  }, [os]);

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
      <DialogContent className="max-w-4xl">
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

          {/* Seção de Imagens */}
          {os.images && os.images.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <Image className="w-4 h-4 mr-2" />
                Imagens
              </h3>
              <AtividadeImageCarousel images={os.images} />
            </div>
          )}

          {/* Seção de Arquivos */}
          {os.files && os.files.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <File className="w-4 h-4 mr-2" />
                Arquivos
              </h3>
              <div className="space-y-2">
                {os.files.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {file.name || `Arquivo ${index + 1}`}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              Criado por
            </h3>
            <p>{os.assignedUser?.username || 'Não atribuído'}</p>
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