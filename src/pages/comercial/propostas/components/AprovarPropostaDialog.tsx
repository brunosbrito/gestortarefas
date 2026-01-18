import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PropostaService from '@/services/PropostaService';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface AprovarPropostaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propostaId: string;
  propostaTitulo: string;
  onSuccess?: () => void;
}

const AprovarPropostaDialog = ({
  open,
  onOpenChange,
  propostaId,
  propostaTitulo,
  onSuccess,
}: AprovarPropostaDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAprovar = async () => {
    try {
      setIsSubmitting(true);
      await PropostaService.updateStatus(propostaId, {
        status: 'aprovada',
      });

      toast({
        title: 'Sucesso',
        description: 'Proposta aprovada com sucesso',
      });

      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao aprovar proposta:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao aprovar proposta',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl">Aprovar Proposta</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Tem certeza que deseja aprovar a proposta:{' '}
            <span className="font-semibold text-foreground">"{propostaTitulo}"</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
          <p className="text-sm text-blue-900">
            <strong>Atenção:</strong> Após aprovação, você poderá vincular esta proposta a uma obra
            existente ou criar uma nova obra a partir dela.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleAprovar}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aprovando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Aprovar Proposta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AprovarPropostaDialog;
