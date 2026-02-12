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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Paintbrush, AlertCircle, Droplet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TintaService from '@/services/TintaService';
import { TintaInterface } from '@/interfaces/TintaInterface';
import { ItemComposicao } from '@/interfaces/OrcamentoInterface';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

interface AddPinturaItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: Omit<ItemComposicao, 'id' | 'composicaoId' | 'ordem'>) => void;
  composicaoId: string;
  areaTotal?: number; // Área total para cálculo automático
}

export default function AddPinturaItemDialog({
  open,
  onOpenChange,
  onAdd,
  composicaoId,
  areaTotal = 0,
}: AddPinturaItemDialogProps) {
  const { toast } = useToast();
  const [tintas, setTintas] = useState<TintaInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [tintaSelecionada, setTintaSelecionada] = useState<TintaInterface | null>(null);
  const [quantidade, setQuantidade] = useState<string>('');
  const [subtotal, setSubtotal] = useState<number>(0);
  const [litrosNecessarios, setLitrosNecessarios] = useState<number>(0);

  useEffect(() => {
    if (open) {
      carregarTintas();
    }
  }, [open]);

  useEffect(() => {
    if (tintaSelecionada) {
      // Calcular litros necessários baseado na área total e rendimento
      if (areaTotal > 0 && tintaSelecionada.rendimento > 0) {
        const litros = areaTotal / tintaSelecionada.rendimento;
        setLitrosNecessarios(litros);
        setQuantidade(litros.toFixed(2));
      }
    }
  }, [tintaSelecionada, areaTotal]);

  useEffect(() => {
    if (tintaSelecionada && quantidade) {
      const qtd = parseFloat(quantidade) || 0;
      setSubtotal(tintaSelecionada.precoLitro * qtd);
    } else {
      setSubtotal(0);
    }
  }, [tintaSelecionada, quantidade]);

  const carregarTintas = async () => {
    try {
      setLoading(true);
      const data = await TintaService.getAll();
      const ativas = data.filter((t) => t.ativo);
      setTintas(ativas);
    } catch (error) {
      console.error('Erro ao carregar tintas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as tintas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTintaChange = (tintaId: string) => {
    const tinta = tintas.find((t) => t.id.toString() === tintaId);
    setTintaSelecionada(tinta || null);
  };

  const handleSubmit = () => {
    if (!tintaSelecionada) {
      toast({
        title: 'Atenção',
        description: 'Selecione uma tinta',
        variant: 'destructive',
      });
      return;
    }

    const qtd = parseFloat(quantidade);
    if (isNaN(qtd) || qtd <= 0) {
      toast({
        title: 'Atenção',
        description: 'Quantidade inválida',
        variant: 'destructive',
      });
      return;
    }

    const novoItem: Omit<ItemComposicao, 'id' | 'composicaoId' | 'ordem'> = {
      codigo: tintaSelecionada.codigo,
      descricao: `${tintaSelecionada.nome} - ${tintaSelecionada.cor}`,
      quantidade: qtd,
      unidade: 'L',
      valorUnitario: tintaSelecionada.precoLitro,
      subtotal: subtotal,
      percentual: 0, // Será calculado no backend
      tipoItem: 'material',
      tipoCalculo: 'un',
      especificacao: `Rendimento: ${tintaSelecionada.rendimento} m²/L`,
    };

    onAdd(novoItem);
    handleClose();
  };

  const handleClose = () => {
    setTintaSelecionada(null);
    setQuantidade('');
    setSubtotal(0);
    setLitrosNecessarios(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-green-600" />
            Adicionar Item de Pintura
          </DialogTitle>
          <DialogDescription>
            Selecione uma tinta do catálogo. A quantidade será calculada automaticamente baseada na
            área total.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Área Total */}
          {areaTotal > 0 && (
            <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
              <Droplet className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Área total a pintar (calculada dos materiais):
                  </span>
                  <span className="text-lg font-bold text-blue-600">{areaTotal.toFixed(2)} m²</span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Seleção de Tinta */}
          <div className="space-y-2">
            <Label>Tinta *</Label>
            <Select
              value={tintaSelecionada?.id.toString() || ''}
              onValueChange={handleTintaChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? 'Carregando...' : 'Selecione uma tinta'} />
              </SelectTrigger>
              <SelectContent>
                {tintas.map((tinta) => (
                  <SelectItem key={tinta.id} value={tinta.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{tinta.codigo}</span>
                      <span>-</span>
                      <span>{tinta.nome}</span>
                      <Badge
                        variant="outline"
                        className="ml-2"
                        style={{ backgroundColor: tinta.hexColor, color: '#fff' }}
                      >
                        {tinta.cor}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Informações da Tinta Selecionada */}
          {tintaSelecionada && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Tipo:</span>
                      <Badge variant="outline" className="ml-2">
                        {tintaSelecionada.tipo}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Acabamento:</span>
                      <span className="ml-2 text-sm font-medium">
                        {tintaSelecionada.acabamento}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Rendimento:</span>
                      <span className="ml-2 text-sm font-bold text-blue-600">
                        {tintaSelecionada.rendimento} m²/L
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Preço/Litro:</span>
                      <span className="ml-2 text-sm font-bold text-green-600">
                        {formatCurrency(tintaSelecionada.precoLitro)}
                      </span>
                    </div>
                    {areaTotal > 0 && litrosNecessarios > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground">Litros Necessários:</span>
                        <span className="ml-2 text-sm font-bold text-purple-600">
                          {litrosNecessarios.toFixed(2)} L
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Quantidade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade (Litros) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                {areaTotal > 0 && tintaSelecionada
                  ? 'Calculado automaticamente baseado na área'
                  : 'Informe a quantidade em litros'}
              </p>
            </div>

            {/* Subtotal */}
            <div className="space-y-2">
              <Label>Subtotal</Label>
              <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
                <span className="font-bold text-lg text-green-600">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Preview da Cobertura */}
          {tintaSelecionada && quantidade && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cobertura Total:</span>
                <span className="font-bold text-green-600">
                  {(tintaSelecionada.rendimento * parseFloat(quantidade)).toFixed(2)} m²
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!tintaSelecionada || !quantidade}>
            <Paintbrush className="mr-2 h-4 w-4" />
            Adicionar Tinta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
