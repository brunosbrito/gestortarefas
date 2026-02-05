import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MoreHorizontal,
  Edit2,
  MoveHorizontal,
  Upload,
  Eye,
  Trash2,
  BarChart3,
} from 'lucide-react';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { NovaAtividadeForm } from './NovaAtividadeForm';
import { MoverAtividadeDialog } from './MoverAtividadeDialog';
import { AtividadeUploadDialog } from './AtividadeUploadDialog';
import { AtualizarProgressoDialog } from './AtualizarProgressoDialog';
import { AtividadeImageCarousel } from './AtividadeImageCarousel';
import { AtividadeInfoBasica } from './AtividadeInfoBasica';
import { AtividadeEquipe } from './AtividadeEquipe';
import { AtividadeHistoricoList } from './AtividadeHistoricoList';
import { Separator } from '@/components/ui/separator';
import AtividadeDetailPdfService from '@/services/AtividadeDetailPdfService';
import { FileDown, Loader2 } from 'lucide-react';
import { uploadActivityImage } from '@/services/ActivityImageService';
import { deleteActivity } from '@/services/ActivityService';
import { useToast } from '@/hooks/use-toast';
import { TarefaMacro } from '@/interfaces/TarefaMacroInterface';
import { Processo } from '@/interfaces/ProcessoInterface';

interface AtividadesOSTableRowProps {
  atividade: AtividadeStatus;
  onMoveAtividade: (atividadeId: number, novoStatus: string) => void;
  onDelete: () => void;
}

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('planejad')) {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  if (statusLower.includes('execução') || statusLower.includes('andamento')) {
    return 'bg-orange-100 text-orange-800 border-orange-200';
  }
  if (statusLower.includes('paraliz') || statusLower.includes('paralis') || statusLower.includes('pausad')) {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  if (statusLower.includes('concluíd') || statusLower.includes('finaliz')) {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
};

const formatTime = (totalTime: number) => {
  if (isNaN(totalTime) || totalTime <= 0) return '00:00';
  const hours = Math.floor(totalTime);
  const minutes = Math.round((totalTime - hours) * 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const formatEstimatedTime = (estimatedTime: string) => {
  if (!estimatedTime) return '00:00';
  const hoursMatch = estimatedTime.match(/(\d+)\s*h/);
  const minutesMatch = estimatedTime.match(/(\d+)\s*min/);
  const hours = hoursMatch ? hoursMatch[1] : '0';
  const minutes = minutesMatch ? minutesMatch[1] : '0';
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

const calculateElapsedTime = (totalTime: number, startDate?: string) => {
  if (!startDate) return totalTime;
  const startDateTime = new Date(startDate);
  const now = new Date();
  const elapsedSeconds = (now.getTime() - startDateTime.getTime()) / 1000;
  const totalElapsedSeconds = totalTime * 3600 + elapsedSeconds;
  const hours = Math.floor(totalElapsedSeconds / 3600);
  const minutes = Math.floor((totalElapsedSeconds % 3600) / 60);
  return hours + minutes / 60;
};

const getMacroTaskName = (macroTask: string | TarefaMacro): string => {
  if (typeof macroTask === 'string') return macroTask;
  return macroTask?.name || '-';
};

const getProcessName = (process: string | Processo): string => {
  if (typeof process === 'string') return process;
  return process?.name || '-';
};

export const AtividadesOSTableRow = ({
  atividade,
  onMoveAtividade,
  onDelete,
}: AtividadesOSTableRowProps) => {
  const { toast } = useToast();
  const { projectId, serviceOrderId } = useParams();

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const elapsedTime =
    atividade.status === 'Em execução'
      ? calculateElapsedTime(atividade.totalTime, atividade.startDate)
      : atividade.totalTime;

  const calculateProgress = () => {
    if (!atividade.quantity || !atividade.completedQuantity) return 0;
    const progress = (atividade.completedQuantity / atividade.quantity) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsUploadDialogOpen(true);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile || isUploading) return;
    const userId = localStorage.getItem('userId');

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('description', imageDescription);
      formData.append('createdById', userId || '');

      await uploadActivityImage(atividade.id, formData);

      toast({
        title: 'Upload realizado com sucesso',
        description: 'A imagem foi enviada e será processada em breve.',
      });

      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setImageDescription('');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no upload',
        description: 'Ocorreu um erro ao fazer o upload da imagem. Tente novamente.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteActivity(atividade.id);
      toast({
        title: 'Atividade excluída',
        description: 'A atividade foi excluída com sucesso.',
      });
      setIsDeleteDialogOpen(false);
      onDelete();
    } catch (error) {
      console.error('Erro ao excluir atividade:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir atividade',
        description: 'Não foi possível excluir a atividade. Tente novamente.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProgressSuccess = () => {
    window.location.reload();
  };

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await AtividadeDetailPdfService.generatePdf(atividade);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const collaboratorsText = atividade.collaborators
    ?.map((c) => c.name)
    .join(', ') || '-';

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="font-medium text-center text-sm">
          #{atividade.cod_sequencial}
        </TableCell>
        <TableCell className="truncate text-sm" title={atividade.description}>
          {atividade.description}
        </TableCell>
        <TableCell className="text-center">
          <Badge className={`${getStatusColor(atividade.status)} border text-xs whitespace-nowrap`}>
            {atividade.status}
          </Badge>
        </TableCell>
        <TableCell className="truncate text-sm" title={getMacroTaskName(atividade.macroTask)}>
          {getMacroTaskName(atividade.macroTask)}
        </TableCell>
        <TableCell className="truncate text-sm" title={getProcessName(atividade.process)}>
          {getProcessName(atividade.process)}
        </TableCell>
        <TableCell className="truncate text-sm" title={collaboratorsText}>
          {collaboratorsText}
        </TableCell>
        <TableCell className="text-center text-sm whitespace-nowrap">{formatDate(atividade.startDate)}</TableCell>
        <TableCell className="text-center text-sm whitespace-nowrap">{formatDate(atividade.endDate)}</TableCell>
        <TableCell className="text-center text-sm whitespace-nowrap">{formatEstimatedTime(atividade.estimatedTime)}</TableCell>
        <TableCell className="text-center text-sm whitespace-nowrap">{formatTime(elapsedTime)}</TableCell>
        <TableCell>
          {atividade.quantity ? (
            <div className="flex items-center gap-1">
              <Progress value={calculateProgress()} className="h-2 flex-1" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {atividade.completedQuantity || 0}/{atividade.quantity}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </TableCell>
        <TableCell className="text-center p-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsDetailsDialogOpen(true)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsMoveDialogOpen(true)}>
                <MoveHorizontal className="mr-2 h-4 w-4" />
                Mover
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label htmlFor={`upload-table-${atividade.id}`} className="flex items-center cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Imagem
                </label>
              </DropdownMenuItem>
              {typeof atividade.quantity === 'number' && (
                <DropdownMenuItem onClick={() => setIsProgressDialogOpen(true)}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Atualizar Progresso
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hidden file input for upload */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`upload-table-${atividade.id}`}
          />
        </TableCell>
      </TableRow>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Atividade</DialogTitle>
          </DialogHeader>
          <NovaAtividadeForm
            editMode={true}
            atividadeInicial={atividade}
            projectId={Number(projectId)}
            orderServiceId={Number(serviceOrderId)}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              onDelete();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <MoverAtividadeDialog
        open={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
        onMove={(novoStatus) => {
          onMoveAtividade(atividade.id, novoStatus);
        }}
      />

      {/* Upload Dialog */}
      <AtividadeUploadDialog
        imageDescription={imageDescription}
        onDescriptionChange={setImageDescription}
        onCancel={() => {
          if (!isUploading) {
            setIsUploadDialogOpen(false);
            setSelectedFile(null);
            setImageDescription('');
          }
        }}
        onUpload={handleImageUpload}
        open={isUploadDialogOpen}
        onOpenChange={(open) => !isUploading && setIsUploadDialogOpen(open)}
        isLoading={isUploading}
      />

      {/* Progress Dialog */}
      {typeof atividade.quantity === 'number' && (
        <AtualizarProgressoDialog
          open={isProgressDialogOpen}
          onOpenChange={setIsProgressDialogOpen}
          atividade={{
            id: atividade.id,
            quantity: atividade.quantity,
            completedQuantity: atividade.completedQuantity || 0,
          }}
          onSuccess={handleProgressSuccess}
        />
      )}

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">
                Detalhes da Atividade
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGeneratePdf}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                {isGeneratingPdf ? 'Gerando...' : 'Exportar PDF'}
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <AtividadeImageCarousel images={atividade.images} />
            <AtividadeInfoBasica atividade={atividade} />
            <Separator className="my-4" />
            <AtividadeEquipe collaborators={atividade.collaborators || []} />
            <Separator className="my-4" />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Histórico de Alterações
              </h3>
              <div className="bg-muted/30 p-4 rounded-lg">
                <AtividadeHistoricoList activityId={atividade.id} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
