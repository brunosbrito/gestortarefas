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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus } from 'lucide-react';
import { ItemComposicao } from '@/interfaces/OrcamentoInterface';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

const UNIDADES_COMUNS = ['h', 'hh', 'un', 'kg', 'm', 'm²', 'm³', 'l', 'vb', 'cx', 'pç', 'mês'];
const TIPOS_ITEM: { value: ItemComposicao['tipoItem']; label: string }[] = [
  { value: 'mao_obra', label: 'Mão de Obra' },
  { value: 'ferramenta', label: 'Ferramenta' },
  { value: 'consumivel', label: 'Consumível' },
  { value: 'outros', label: 'Outros' },
];

interface AddItemGenericoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: Omit<ItemComposicao, 'id' | 'composicaoId' | 'ordem'>) => Promise<void>;
  tipoComposicao: string;
  tipoItemPadrao?: ItemComposicao['tipoItem'];
}

export default function AddItemGenericoDialog({
  open,
  onOpenChange,
  onAdd,
  tipoComposicao,
  tipoItemPadrao = 'outros',
}: AddItemGenericoDialogProps) {
  const { toast } = useToast();
  const [salvando, setSalvando] = useState(false);

  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [unidade, setUnidade] = useState('un');
  const [valorUnitario, setValorUnitario] = useState('');
  const [tipoItem, setTipoItem] = useState<ItemComposicao['tipoItem']>(tipoItemPadrao);
  const [cargo, setCargo] = useState('');
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    if (!open) return;
    const qtd = parseFloat(quantidade) || 0;
    const valor = parseFloat(valorUnitario) || 0;
    setSubtotal(qtd * valor);
  }, [quantidade, valorUnitario, open]);

  const handleClose = () => {
    setDescricao('');
    setQuantidade('1');
    setUnidade('un');
    setValorUnitario('');
    setTipoItem(tipoItemPadrao);
    setCargo('');
    setSubtotal(0);
    setSalvando(false);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!descricao.trim()) {
      toast({ title: 'Atenção', description: 'Descrição é obrigatória', variant: 'destructive' });
      return;
    }

    const qtd = parseFloat(quantidade);
    if (isNaN(qtd) || qtd <= 0) {
      toast({ title: 'Atenção', description: 'Quantidade inválida', variant: 'destructive' });
      return;
    }

    const valor = parseFloat(valorUnitario);
    if (isNaN(valor) || valor < 0) {
      toast({ title: 'Atenção', description: 'Valor unitário inválido', variant: 'destructive' });
      return;
    }

    if (!unidade) {
      toast({ title: 'Atenção', description: 'Selecione uma unidade', variant: 'destructive' });
      return;
    }

    try {
      setSalvando(true);
      const novoItem: Omit<ItemComposicao, 'id' | 'composicaoId' | 'ordem'> = {
        descricao: descricao.trim(),
        quantidade: qtd,
        unidade,
        valorUnitario: valor,
        subtotal: qtd * valor,
        percentual: 0,
        tipoItem,
        ...(cargo.trim() ? { cargo: cargo.trim() } : {}),
      };

      await onAdd(novoItem);
      handleClose();
    } catch {
      toast({ title: 'Erro', description: 'Erro ao adicionar item', variant: 'destructive' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Adicionar Item — {tipoComposicao}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do novo item para esta composição
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Soldador, Martelo, Disco de corte..."
              disabled={salvando}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo do Item *</Label>
              <Select
                value={tipoItem}
                onValueChange={(v) => setTipoItem(v as ItemComposicao['tipoItem'])}
                disabled={salvando}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_ITEM.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Unidade *</Label>
              <Select value={unidade} onValueChange={setUnidade} disabled={salvando}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES_COMUNS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {tipoItem === 'mao_obra' && (
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Input
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ex: Soldador, Ajudante, Montador..."
                disabled={salvando}
              />
            </div>
          )}

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
                disabled={salvando}
              />
            </div>

            <div className="space-y-2">
              <Label>Valor Unitário *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={valorUnitario}
                onChange={(e) => setValorUnitario(e.target.value)}
                placeholder="0.00"
                disabled={salvando}
              />
            </div>
          </div>

          <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subtotal calculado:</span>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(subtotal)}</span>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={salvando}>
            <Plus className="mr-2 h-4 w-4" />
            {salvando ? 'Adicionando...' : 'Adicionar Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
