
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
import { Edit2, MoveHorizontal, Trash2, Upload } from 'lucide-react';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { NovaAtividadeForm } from '../NovaAtividadeForm';
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    <div className="flex justify-between items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={onMoveClick}
      >
        <MoveHorizontal className="w-4 h-4" />
      </Button>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit2 className="w-4 h-4" />
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

      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={onFileSelect}
          className="hidden"
          id={`upload-image-${atividade.id}`}
        />
        <label htmlFor={`upload-image-${atividade.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            asChild
          >
            <span>
              <Upload className="w-4 h-4" />
            </span>
          </Button>
        </label>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
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
    </div>
  );
};
