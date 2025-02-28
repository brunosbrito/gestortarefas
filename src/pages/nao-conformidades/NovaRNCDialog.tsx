
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { NovaRNCForm } from './NovaRNCForm';
import { CreateWorkforce, NonConformity } from '@/interfaces/RncInterface';
import RncService from '@/services/NonConformityService';

interface NovaRNCDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rncParaEditar?: NonConformity | null;
}

export function NovaRNCDialog({ open, onOpenChange, rncParaEditar }: NovaRNCDialogProps) {
  const { toast } = useToast();

  const handleSuccess = async (data: any) => {
    try {
      if (rncParaEditar) {
        await RncService.updateRnc(rncParaEditar.id, data);
        toast({
          title: 'RNC atualizada com sucesso',
          description: 'As informações básicas foram atualizadas. Você pode adicionar mais detalhes depois.',
        });
      } else {
        await RncService.createRnc(data);
        toast({
          title: 'RNC criada com sucesso',
          description: 'RNC criada. Você pode adicionar mão de obra, materiais, imagens e ação corretiva posteriormente.',
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar RNC:', error);
      toast({
        variant: "destructive",
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar a RNC. Tente novamente.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {rncParaEditar ? 'Editar RNC' : 'Nova RNC'}
          </DialogTitle>
        </DialogHeader>

        <NovaRNCForm
          onNext={handleSuccess}
          initialData={rncParaEditar}
        />
      </DialogContent>
    </Dialog>
  );
}
