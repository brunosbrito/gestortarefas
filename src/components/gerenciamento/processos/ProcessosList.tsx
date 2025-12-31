import { Processo } from '@/interfaces/ProcessoInterface';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Workflow } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SortableTableHeader, useTableSort } from '@/components/tables/SortableTableHeader';
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
import { cn } from '@/lib/utils';

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

  // Sorting
  const { sortedData, sortKey, sortDirection, handleSort } = useTableSort(listProcessos, 'name', 'asc');

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
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar processos',
        description: 'Não foi possível carregar os processos.',
      });
    }
  };

  useEffect(() => {
    getProcessos();
  }, [reload]);

  return (
    <>
      <Card className="overflow-hidden border border-border/50 shadow-elevation-2">
        {/* Header modernizado */}
        <div className="p-4 md:p-6 border-b-2 border-border/50 bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Workflow className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Processos</h3>
                <p className="text-xs text-muted-foreground">
                  Total de {listProcessos.length} {listProcessos.length === 1 ? 'processo' : 'processos'}
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/30 ml-2 font-semibold tabular-nums"
              >
                {listProcessos.length}
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabela */}
        {listProcessos.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-2">
                  <TableHead className="w-20 text-center font-semibold text-foreground border-r border-border/30">Item</TableHead>
                  <SortableTableHeader
                    label="Nome"
                    sortKey="name"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    className="border-r border-border/30"
                  />
                  <TableHead className="text-right font-semibold text-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((processo, index) => (
                  <TableRow
                    key={processo.id}
                    className={cn(
                      "transition-all duration-200 border-b",
                      index % 2 === 0 ? "bg-background" : "bg-muted/20",
                      "hover:bg-accent/50 hover:shadow-sm"
                    )}
                  >
                    <TableCell className="text-center font-mono text-sm font-bold py-4 border-r border-border/30">
                      {String(index + 1).padStart(3, '0')}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground py-4 border-r border-border/30">{processo.name}</TableCell>
                    <TableCell className="text-right py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(processo)}
                          className="hover:bg-accent"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(processo)}
                          className="hover:bg-destructive/10 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 gap-4">
            <div className="p-4 rounded-full bg-muted/50">
              <Workflow className="w-12 h-12 text-muted-foreground opacity-50" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-foreground">
                Nenhum processo encontrado
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                Não há processos cadastrados no sistema
              </p>
            </div>
          </div>
        )}
      </Card>

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
              onClick={() => handleDelete(selectedProcesso!.id)}
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
