import { Processo } from '@/interfaces/ProcessoInterface';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EditProcessoForm } from './EditProcessoForm';
import ProcessService from '@/services/ProcessService';

interface ProcessosListProps {
  reload?: boolean;
}

export function ProcessosList({ reload }: ProcessosListProps) {
  const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [listProcessos, setListProcessos] = useState<Processo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeleteClick = (processo: Processo) => {
    setSelectedProcesso(processo);
    setIsDeleteDialogOpen(true);
  };

  const handleEditClick = (processo: Processo) => {
    setSelectedProcesso(processo);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!id) return;

    try {
      await ProcessService.delete(id);
      getProcessos();

      toast({
        title: 'Processo excluído',
        description: 'O processo foi excluído com sucesso.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir processo',
        description: 'Não foi possível excluir o processo. Tente novamente.',
      });
      console.error('Erro ao excluir o processo:', error);
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedProcesso(null);
    }
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedProcesso(null);
    getProcessos();
  };

  const getProcessos = async () => {
    try {
      const response = await ProcessService.getAll();
      setListProcessos(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar os processos:', err);
      setError(
        'Não foi possível carregar os processos. Tente novamente mais tarde.'
      );
    }
  };

  useEffect(() => {
    getProcessos();
  }, [reload]);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listProcessos.map((processo) => (
              <TableRow key={processo.id}>
                <TableCell>{processo.name}</TableCell>
                <TableCell className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditClick(processo)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteClick(processo)}
                  >
                    <Trash2 className="h-4 w-4" color="red" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o processo "
              {selectedProcesso?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(selectedProcesso.id)}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Processo</DialogTitle>
          </DialogHeader>
          {selectedProcesso && (
            <EditProcessoForm
              processo={selectedProcesso}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
