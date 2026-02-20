import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import PropostaService from '@/services/PropostaService';
import ObrasService from '@/services/ObrasService';
import { Obra } from '@/interfaces/ObrasInterface';
import { Building2, Loader2, Link } from 'lucide-react';

interface VincularObraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propostaId: string;
  propostaTitulo: string;
  onSuccess?: () => void;
}

const VincularObraDialog = ({
  open,
  onOpenChange,
  propostaId,
  propostaTitulo,
  onSuccess,
}: VincularObraDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingObras, setIsLoadingObras] = useState(false);
  const [obras, setObras] = useState<Obra[]>([]);
  const [obraIdSelecionada, setObraIdSelecionada] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      carregarObras();
    }
  }, [open]);

  const carregarObras = async () => {
    try {
      setIsLoadingObras(true);
      const data = await ObrasService.getAllObras();
      // Filtrar apenas obras em andamento
      const obrasAtivas = data.filter((obra) => obra.status === 'em_andamento');
      setObras(obrasAtivas);
    } catch (error) {
      console.error('Erro ao carregar obras:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de obras',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingObras(false);
    }
  };

  const handleVincular = async () => {
    if (!obraIdSelecionada) {
      setError('Selecione uma obra');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await PropostaService.update(propostaId, {
        obraId: parseInt(obraIdSelecionada),
      });

      toast({
        title: 'Sucesso',
        description: 'Proposta vinculada à obra com sucesso',
      });

      onOpenChange(false);
      setObraIdSelecionada('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao vincular obra:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao vincular proposta à obra',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setObraIdSelecionada('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-xl">Vincular a Obra</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Vincule a proposta{' '}
            <span className="font-semibold text-foreground">"{propostaTitulo}"</span> a uma obra
            existente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoadingObras ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                <p className="text-sm text-muted-foreground">Carregando obras...</p>
              </div>
            </div>
          ) : obras.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                <strong>Nenhuma obra ativa encontrada.</strong>
                <br />
                Crie uma nova obra antes de vincular esta proposta.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="obra">
                  Selecione a Obra <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={obraIdSelecionada}
                  onValueChange={(value) => {
                    setObraIdSelecionada(value);
                    setError('');
                  }}
                >
                  <SelectTrigger id="obra" className={error ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Escolha uma obra..." />
                  </SelectTrigger>
                  <SelectContent>
                    {obras.map((obra) => (
                      <SelectItem key={obra.id} value={obra.id.toString()}>
                        {obra.codigo} - {obra.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>Dica:</strong> Após vincular, você poderá acessar a proposta direto pela
                  página da obra.
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleVincular}
            disabled={isSubmitting || obras.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vinculando...
              </>
            ) : (
              <>
                <Link className="mr-2 h-4 w-4" />
                Vincular à Obra
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VincularObraDialog;
