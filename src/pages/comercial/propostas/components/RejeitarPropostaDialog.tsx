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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import PropostaService from '@/services/PropostaService';
import { XCircle, Loader2 } from 'lucide-react';

interface RejeitarPropostaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propostaId: string;
  propostaTitulo: string;
  onSuccess?: () => void;
}

const RejeitarPropostaDialog = ({
  open,
  onOpenChange,
  propostaId,
  propostaTitulo,
  onSuccess,
}: RejeitarPropostaDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [error, setError] = useState('');

  const handleRejeitar = async () => {
    if (!motivoRejeicao.trim()) {
      setError('O motivo da rejeição é obrigatório');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await PropostaService.updateStatus(propostaId, {
        status: 'rejeitada',
        motivoRejeicao: motivoRejeicao.trim(),
      });

      toast({
        title: 'Sucesso',
        description: 'Proposta rejeitada',
      });

      onOpenChange(false);
      setMotivoRejeicao('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao rejeitar proposta:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao rejeitar proposta',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMotivoRejeicao('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Rejeitar Proposta</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Você está rejeitando a proposta:{' '}
            <span className="font-semibold text-foreground">"{propostaTitulo}"</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="motivoRejeicao">
              Motivo da Rejeição <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="motivoRejeicao"
              placeholder="Descreva o motivo da rejeição..."
              value={motivoRejeicao}
              onChange={(e) => {
                setMotivoRejeicao(e.target.value);
                setError('');
              }}
              rows={4}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-900">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita. O motivo da rejeição será
              registrado no histórico da proposta.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleRejeitar}
            disabled={isSubmitting}
            variant="destructive"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rejeitando...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Rejeitar Proposta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejeitarPropostaDialog;
