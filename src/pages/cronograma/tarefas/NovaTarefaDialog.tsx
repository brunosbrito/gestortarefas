/**
 * Sheet para Criar/Editar Tarefa do Cronograma
 * Sistema: Gestor Master - GMX Soluções Industriais
 * Módulo: Cronogramas
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { NovaTarefaForm } from './NovaTarefaForm';
import { TarefaCronograma } from '@/interfaces/CronogramaInterfaces';
import TarefaCronogramaService from '@/services/TarefaCronogramaService';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface NovaTarefaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cronogramaId: string;
  tarefaParaEditar?: TarefaCronograma | null;
  onSaveSuccess?: () => void;
}

export function NovaTarefaDialog({
  open,
  onOpenChange,
  cronogramaId,
  tarefaParaEditar,
  onSaveSuccess,
}: NovaTarefaDialogProps) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!tarefaParaEditar) return;

    setIsDeleting(true);
    try {
      await TarefaCronogramaService.delete(tarefaParaEditar.id);
      toast({
        title: 'Tarefa deletada',
        description: `A tarefa "${tarefaParaEditar.nome}" foi removida com sucesso.`,
      });
      setDeleteDialogOpen(false);
      onOpenChange(false);
      onSaveSuccess?.();
    } catch (error: any) {
      console.error('Erro ao deletar tarefa:', error);

      // Extrair mensagem específica do backend
      let errorMessage = 'Ocorreu um erro ao deletar a tarefa. Tente novamente.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Mensagens amigáveis para erros comuns
      if (errorMessage.includes('dependenc')) {
        errorMessage = 'Esta tarefa não pode ser deletada pois outras tarefas dependem dela. Remova as dependências primeiro.';
      } else if (errorMessage.includes('subtarefa') || errorMessage.includes('filha')) {
        errorMessage = 'Esta tarefa não pode ser deletada pois possui subtarefas. Delete as subtarefas primeiro.';
      } else if (errorMessage.includes('Network Error') || errorMessage.includes('ERR_CONNECTION')) {
        errorMessage = 'Erro de conexão com o servidor. Verifique sua conexão e tente novamente.';
      }

      toast({
        variant: 'destructive',
        title: 'Erro ao deletar',
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSuccess = async (data: any) => {
    try {
      if (tarefaParaEditar) {
        // Editar tarefa existente
        await TarefaCronogramaService.update(tarefaParaEditar.id, data);
        toast({
          title: 'Tarefa atualizada',
          description: 'As informações da tarefa foram atualizadas com sucesso.',
        });
      } else {
        // Criar nova tarefa
        const novaTarefa = await TarefaCronogramaService.create({
          ...data,
          cronogramaId,
        });
        toast({
          title: 'Tarefa criada',
          description: `Tarefa "${novaTarefa.nome}" criada com sucesso.`,
        });
      }

      onSaveSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar a tarefa. Tente novamente.',
      });
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>
                {tarefaParaEditar ? 'Editar Tarefa' : 'Nova Tarefa'}
              </SheetTitle>
              {tarefaParaEditar && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="mt-6">
            <NovaTarefaForm
              onSubmit={handleSuccess}
              initialData={tarefaParaEditar}
              cronogramaId={cronogramaId}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar a tarefa "{tarefaParaEditar?.nome}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
