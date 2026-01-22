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
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { DocumentoBaseGP } from '@/interfaces/GestaoProcessosInterfaces';
import { StatusBadge } from './StatusBadge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AprovacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documento: DocumentoBaseGP | null;
  tipoDocumento: string; // "Priorização", "PDCA", etc.
  onConfirm: (documentoId: string) => Promise<void>;
}

/**
 * Dialog para aprovação de documentos
 * Mostra informações do documento e confirma a aprovação
 */
export const AprovacaoDialog = ({
  open,
  onOpenChange,
  documento,
  tipoDocumento,
  onConfirm,
}: AprovacaoDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!documento) return;

    setIsLoading(true);
    try {
      await onConfirm(documento.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao aprovar documento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!documento) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Aprovar {tipoDocumento}
          </DialogTitle>
          <DialogDescription>
            Revise as informações do documento antes de aprovar
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
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Descrição</p>
              <p className="text-sm">{documento.descricao || 'Sem descrição'}</p>
            </div>
          </div>

          {/* Vinculação */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-2">Vinculação</p>
            <div className="flex items-center gap-2">
              {documento.tipoVinculacao === 'obra' && (
                <div className="text-sm">
                  <span className="font-medium">Obra:</span> {documento.obraNome}
                </div>
              )}
              {documento.tipoVinculacao === 'setor' && (
                <div className="text-sm">
                  <span className="font-medium">Setor:</span> {documento.setorNome}
                </div>
              )}
              {documento.tipoVinculacao === 'independente' && (
                <div className="text-sm">Documento Independente (Geral)</div>
              )}
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
                {format(new Date(documento.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>

          {/* Alerta de Confirmação */}
          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
            <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Confirmar Aprovação
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Ao aprovar, este documento será marcado como aprovado e não poderá mais ser editado.
                Para fazer alterações, será necessário criar uma nova versão.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Aprovando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Aprovar Documento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
