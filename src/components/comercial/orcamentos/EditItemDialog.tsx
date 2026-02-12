import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ItemComposicao } from '@/interfaces/OrcamentoInterface';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (item: ItemComposicao) => void;
  item: ItemComposicao | null;
}

export default function EditItemDialog({
  open,
  onOpenChange,
  onUpdate,
  item,
}: EditItemDialogProps) {
  const { toast } = useToast();
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [peso, setPeso] = useState('');
  const [especificacao, setEspecificacao] = useState('');
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    if (item && open) {
      setDescricao(item.descricao);
      setQuantidade(item.quantidade.toString());
      setValorUnitario(item.valorUnitario.toString());
      setPeso(item.peso?.toString() || '');
      setEspecificacao(item.especificacao || '');
    }
  }, [item, open]);

  useEffect(() => {
    const qtd = parseFloat(quantidade) || 0;
    const valor = parseFloat(valorUnitario) || 0;
    setSubtotal(qtd * valor);
  }, [quantidade, valorUnitario]);

  const handleSubmit = () => {
    if (!item) return;

    const qtd = parseFloat(quantidade);
    const valor = parseFloat(valorUnitario);

    if (isNaN(qtd) || qtd <= 0) {
      toast({
        title: 'Atenção',
        description: 'Quantidade inválida',
        variant: 'destructive',
      });
      return;
    }

    if (isNaN(valor) || valor < 0) {
      toast({
        title: 'Atenção',
        description: 'Valor unitário inválido',
        variant: 'destructive',
      });
      return;
    }

    const itemAtualizado: ItemComposicao = {
      ...item,
      descricao: descricao.trim(),
      quantidade: qtd,
      valorUnitario: valor,
      peso: peso ? parseFloat(peso) : undefined,
      especificacao: especificacao.trim() || undefined,
      subtotal: qtd * valor,
    };

    onUpdate(itemAtualizado);
    handleClose();
  };

  const handleClose = () => {
    setDescricao('');
    setQuantidade('');
    setValorUnitario('');
    setPeso('');
    setEspecificacao('');
    setSubtotal(0);
    onOpenChange(false);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            Editar Item
          </DialogTitle>
          <DialogDescription>
            Atualize as informações do item da composição
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Código (somente leitura) */}
          {item.codigo && (
            <div className="space-y-2">
              <Label>Código</Label>
              <Input value={item.codigo} disabled className="font-mono bg-muted" />
            </div>
          )}

          {/* Descrição */}
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição do item"
              rows={2}
            />
          </div>

          {/* Especificação */}
          <div className="space-y-2">
            <Label>Especificação</Label>
            <Input
              value={especificacao}
              onChange={(e) => setEspecificacao(e.target.value)}
              placeholder="Ex: ASTM A36, dimensões, etc."
            />
          </div>

          {/* Quantidade e Unidade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade *</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Unidade</Label>
              <Input value={item.unidade} disabled className="bg-muted" />
            </div>
          </div>

          {/* Peso (opcional) */}
          {item.tipoItem === 'material' && (
            <div className="space-y-2">
              <Label>Peso (kg)</Label>
              <Input
                type="number"
                step="0.001"
                min="0"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="0.000"
              />
            </div>
          )}

          {/* Valor Unitário */}
          <div className="space-y-2">
            <Label>Valor Unitário *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={valorUnitario}
              onChange={(e) => setValorUnitario(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Preview do Subtotal */}
          <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subtotal calculado:</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </AlertDescription>
          </Alert>

          {/* Informações adicionais */}
          {item.cargo && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="text-sm">
                  <span className="text-muted-foreground">Cargo:</span>
                  <span className="ml-2 font-medium">{item.cargo}</span>
                </div>
                {item.encargos && (
                  <div className="text-sm mt-1">
                    <span className="text-muted-foreground">Encargos:</span>
                    <span className="ml-2 font-medium">
                      {item.encargos.percentual}% ({formatCurrency(item.encargos.valor)})
                    </span>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            <Edit className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
