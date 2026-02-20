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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import PropostaService from '@/services/PropostaService';
import OrcamentoService from '@/services/OrcamentoService';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import { formatCurrency, formatPercentage } from '@/lib/currency';
import { Calculator, Loader2, Link } from 'lucide-react';

interface VincularOrcamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propostaId: string;
  propostaTitulo: string;
  onSuccess?: () => void;
}

const VincularOrcamentoDialog = ({
  open,
  onOpenChange,
  propostaId,
  propostaTitulo,
  onSuccess,
}: VincularOrcamentoDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOrcamentos, setIsLoadingOrcamentos] = useState(false);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [orcamentoIdSelecionado, setOrcamentoIdSelecionado] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      carregarOrcamentos();
    }
  }, [open]);

  const carregarOrcamentos = async () => {
    try {
      setIsLoadingOrcamentos(true);
      const data = await OrcamentoService.getAll();
      setOrcamentos(data);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de orçamentos',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingOrcamentos(false);
    }
  };

  const getStatusViabilidade = (dre: Orcamento['dre']) => {
    if (dre.lucroLiquido < 0) {
      return { label: 'Prejuízo', color: 'bg-red-100 text-red-700' };
    }
    if (dre.margemLiquida < 5) {
      return { label: 'Margem Baixa', color: 'bg-yellow-100 text-yellow-700' };
    }
    if (dre.margemLiquida < 15) {
      return { label: 'Aceitável', color: 'bg-blue-100 text-blue-700' };
    }
    return { label: 'Bom', color: 'bg-green-100 text-green-700' };
  };

  const orcamentoSelecionado = orcamentos.find((orc) => orc.id === orcamentoIdSelecionado);

  const handleVincular = async () => {
    if (!orcamentoIdSelecionado) {
      setError('Selecione um orçamento');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await PropostaService.vincularOrcamento(propostaId, orcamentoIdSelecionado);

      toast({
        title: 'Sucesso',
        description: 'Orçamento vinculado à proposta com sucesso',
      });

      onOpenChange(false);
      setOrcamentoIdSelecionado('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao vincular orçamento:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao vincular orçamento à proposta',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOrcamentoIdSelecionado('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-xl">Vincular Orçamento (QQP)</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Vincule um orçamento detalhado à proposta{' '}
            <span className="font-semibold text-foreground">"{propostaTitulo}"</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoadingOrcamentos ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                <p className="text-sm text-muted-foreground">Carregando orçamentos...</p>
              </div>
            </div>
          ) : orcamentos.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                <strong>Nenhum orçamento encontrado.</strong>
                <br />
                Crie um novo orçamento (QQP) antes de vincular a esta proposta.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="orcamento">
                  Selecione o Orçamento <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={orcamentoIdSelecionado}
                  onValueChange={(value) => {
                    setOrcamentoIdSelecionado(value);
                    setError('');
                  }}
                >
                  <SelectTrigger id="orcamento" className={error ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Escolha um orçamento..." />
                  </SelectTrigger>
                  <SelectContent>
                    {orcamentos.map((orc) => {
                      const status = getStatusViabilidade(orc.dre);
                      return (
                        <SelectItem key={orc.id} value={orc.id}>
                          <div className="flex items-center gap-2">
                            <span>
                              {orc.numero} - {orc.nome}
                            </span>
                            <Badge className={`${status.color} text-xs`}>{status.label}</Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              {/* Preview do Orçamento Selecionado */}
              {orcamentoSelecionado && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold text-blue-900">Resumo do Orçamento:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Venda:</span>
                      <p className="font-semibold text-blue-700">
                        {formatCurrency(orcamentoSelecionado.totalVenda)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Margem Líquida:</span>
                      <p
                        className={`font-semibold ${
                          orcamentoSelecionado.dre.margemLiquida < 0
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      >
                        {formatPercentage(orcamentoSelecionado.dre.margemLiquida)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">BDI Médio:</span>
                      <p className="font-semibold text-purple-700">
                        {formatPercentage(orcamentoSelecionado.bdiMedio)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Composições:</span>
                      <p className="font-semibold">
                        {orcamentoSelecionado.composicoes.length}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-900">
                  <strong>Benefício:</strong> O orçamento detalhado será incluído automaticamente
                  na exportação PDF da proposta.
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
            disabled={isSubmitting || orcamentos.length === 0}
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
                Vincular Orçamento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VincularOrcamentoDialog;
