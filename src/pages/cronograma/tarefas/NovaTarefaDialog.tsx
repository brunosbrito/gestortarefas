/**
 * Dialog para Criar/Editar Tarefa do Cronograma
 * Sistema: Gestor Master - GMX Soluções Industriais
 * Módulo: Cronogramas
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { NovaTarefaForm } from './NovaTarefaForm';
import { TarefaCronograma } from '@/interfaces/CronogramaInterfaces';
import TarefaCronogramaService from '@/services/TarefaCronogramaService';

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tarefaParaEditar ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>

        <NovaTarefaForm
          onSubmit={handleSuccess}
          initialData={tarefaParaEditar}
          cronogramaId={cronogramaId}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
