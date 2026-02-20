import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Proposta, CreateProposta } from '@/interfaces/PropostaInterface';
import PropostaService from '@/services/PropostaService';
import NovaPropostaForm from './NovaPropostaForm';
import { Loader2 } from 'lucide-react';

interface NovaPropostaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propostaParaEditar?: Proposta;
  onSaveSuccess?: () => void;
}

const NovaPropostaDialog = ({
  open,
  onOpenChange,
  propostaParaEditar,
  onSaveSuccess,
}: NovaPropostaDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateProposta) => {
    try {
      setIsSubmitting(true);

      if (propostaParaEditar) {
        // Modo edição
        await PropostaService.update(propostaParaEditar.id, data);
        toast({
          title: 'Sucesso',
          description: 'Proposta atualizada com sucesso',
        });
      } else {
        // Modo criação
        await PropostaService.create(data);
        toast({
          title: 'Sucesso',
          description: 'Proposta criada com sucesso',
        });
      }

      onOpenChange(false);
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao salvar proposta:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao salvar proposta',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {propostaParaEditar ? 'Editar Proposta' : 'Nova Proposta Comercial'}
          </DialogTitle>
          <DialogDescription>
            {propostaParaEditar
              ? 'Atualize as informações da proposta comercial'
              : 'Preencha os dados para criar uma nova proposta comercial no formato GMX'}
          </DialogDescription>
        </DialogHeader>

        {isSubmitting ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-sm text-muted-foreground">
                {propostaParaEditar ? 'Atualizando proposta...' : 'Criando proposta...'}
              </p>
            </div>
          </div>
        ) : (
          <NovaPropostaForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={propostaParaEditar}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NovaPropostaDialog;
