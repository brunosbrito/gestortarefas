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
import { XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { DocumentoBaseGP } from '@/interfaces/GestaoProcessosInterfaces';
import { StatusBadge } from './StatusBadge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RejeicaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documento: DocumentoBaseGP | null;
  tipoDocumento: string; // "Priorização", "PDCA", etc.
  onConfirm: (documentoId: string, motivoRejeicao: string) => Promise<void>;
}

/**
 * Dialog para rejeição de documentos
 * Exige um motivo obrigatório para a rejeição
 */
export const RejeicaoDialog = ({
  open,
  onOpenChange,
  documento,
  tipoDocumento,
  onConfirm,
}: RejeicaoDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!documento) return;

    // Validação
    if (!motivoRejeicao.trim()) {
      setError('O motivo da rejeição é obrigatório');
      return;
    }

    if (motivoRejeicao.trim().length < 10) {
      setError('O motivo deve ter pelo menos 10 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onConfirm(documento.id, motivoRejeicao.trim());
      onOpenChange(false);
      setMotivoRejeicao('');
    } catch (error) {
      console.error('Erro ao rejeitar documento:', error);
      setError('Erro ao rejeitar documento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setMotivoRejeicao('');
      setError('');
    }
    onOpenChange(newOpen);
  };

  if (!documento) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            Rejeitar {tipoDocumento}
          </DialogTitle>
          <DialogDescription>
            Informe o motivo da rejeição para que o criador possa fazer as correções necessárias
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Informações do Documento */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Código</p>
              <p className="text-sm font-semibold">{documento.codigo}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status Atual</p>
              <StatusBadge status={documento.status} />
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Título</p>
              <p className="text-sm font-semibold">{documento.titulo}</p>
            </div>
          </div>

          {/* Criador */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Criado por</p>
              <p className="text-sm font-semibold">{documento.criadoPorNome}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Criação</p>
              <p className="text-sm">
                {format(new Date(documento.createdAt), "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>

          {/* Motivo da Rejeição */}
          <div className="space-y-2">
            <Label htmlFor="motivo" className="text-base font-semibold">
              Motivo da Rejeição <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="motivo"
              placeholder="Descreva detalhadamente o motivo da rejeição e as correções necessárias..."
              value={motivoRejeicao}
              onChange={(e) => {
                setMotivoRejeicao(e.target.value);
                setError('');
              }}
              rows={5}
              className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {error}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Mínimo de 10 caracteres. Seja claro e específico sobre o que precisa ser corrigido.
            </p>
          </div>

          {/* Alerta */}
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                Confirmar Rejeição
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                O documento será rejeitado e retornará ao status de rascunho.
                O criador receberá uma notificação com o motivo da rejeição e poderá fazer as
                correções necessárias antes de reenviar para aprovação.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Rejeitando...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Rejeitar Documento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
