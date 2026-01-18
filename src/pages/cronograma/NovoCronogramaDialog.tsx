/**
 * Dialog para Criar/Editar Cronograma
 * Sistema: Gestor Master - GMX Soluções Industriais
 * Módulo: Cronogramas
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { NovoCronogramaForm } from './NovoCronogramaForm';
import { Cronograma } from '@/interfaces/CronogramaInterfaces';
import CronogramaService from '@/services/CronogramaService';

interface NovoCronogramaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cronogramaParaEditar?: Cronograma | null;
  onSaveSuccess?: () => void;
}

export function NovoCronogramaDialog({
  open,
  onOpenChange,
  cronogramaParaEditar,
  onSaveSuccess,
}: NovoCronogramaDialogProps) {
  const { toast } = useToast();

  const handleSuccess = async (data: any) => {
    try {
      if (cronogramaParaEditar) {
        // Editar cronograma existente
        await CronogramaService.update(cronogramaParaEditar.id, data);
        toast({
          title: 'Cronograma atualizado',
          description: 'As informações do cronograma foram atualizadas com sucesso.',
        });
      } else {
        // Criar novo cronograma
        const novoCronograma = await CronogramaService.create(data);
        toast({
          title: 'Cronograma criado',
          description: `Cronograma "${novoCronograma.nome}" criado com sucesso. Agora você pode adicionar tarefas.`,
        });
      }

      onSaveSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar cronograma:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar o cronograma. Tente novamente.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {cronogramaParaEditar ? 'Editar Cronograma' : 'Novo Cronograma'}
          </DialogTitle>
        </DialogHeader>

        <NovoCronogramaForm
          onSubmit={handleSuccess}
          initialData={cronogramaParaEditar}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
