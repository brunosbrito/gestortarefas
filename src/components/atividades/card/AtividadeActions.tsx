
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Edit2, MoveHorizontal, Trash2, Upload, FileEdit } from 'lucide-react';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { NovaAtividadeForm } from '../NovaAtividadeForm';
import { EditarAtividadeConcluidaDialog } from '../EditarAtividadeConcluidaDialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteActivity } from '@/services/ActivityService';

interface AtividadeActionsProps {
  atividade: AtividadeStatus;
  projectId: string;
  serviceOrderId: string;
  isMobile: boolean;
  onMoveClick: () => void;
  onEditSuccess: () => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete?: () => void;
}

export const AtividadeActions = ({
  atividade,
  projectId,
  serviceOrderId,
  isMobile,
  onMoveClick,
  onEditSuccess,
  onFileSelect,
  onDelete,
}: AtividadeActionsProps) => {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditConcluidaDialogOpen, setIsEditConcluidaDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isConcluida = atividade.status === 'Concluídas';

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteActivity(atividade.id);
      toast({
        title: "Atividade excluída",
        description: "A atividade foi excluída com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Erro ao excluir atividade:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir atividade",
        description: "Não foi possível excluir a atividade. Tente novamente.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-1.5 w-full">
      <Button
        variant="outline"
        size="sm"
        onClick={onMoveClick}
        className="flex-1 h-8"
      >
        <MoveHorizontal className="w-3.5 h-3.5" />
      </Button>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm" className="flex-1 h-8">
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Atividade</DialogTitle>
          </DialogHeader>
          <NovaAtividadeForm
            editMode={true}
            atividadeInicial={atividade}
            projectId={Number(projectId)}
            orderServiceId={Number(serviceOrderId)}
            onSuccess={onEditSuccess}
          />
        </DialogContent>
      </Dialog>

      <div className="relative flex-1">
        <input
          type="file"
          accept="image/*"
          onChange={onFileSelect}
          className="hidden"
          id={`upload-image-${atividade.id}`}
        />
        <label htmlFor={`upload-image-${atividade.id}`} className="w-full">
          <Button
            variant="outline"
            size="sm"
            className="w-full cursor-pointer h-8"
            asChild
          >
            <span>
              <Upload className="w-3.5 h-3.5" />
            </span>
          </Button>
        </label>
      </div>

      {/* Botão de editar dados de conclusão (apenas para atividades concluídas) */}
      {isConcluida && (
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8"
          onClick={() => setIsEditConcluidaDialogOpen(true)}
          title="Editar dados de conclusão"
        >
          <FileEdit className="w-3.5 h-3.5" />
        </Button>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm" className="flex-1 h-8">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de edição de atividade concluída */}
      <EditarAtividadeConcluidaDialog
        open={isEditConcluidaDialogOpen}
        onOpenChange={setIsEditConcluidaDialogOpen}
        atividade={atividade}
        onSuccess={() => {
          setIsEditConcluidaDialogOpen(false);
          if (onEditSuccess) onEditSuccess();
        }}
      />
    </div>
  );
};
