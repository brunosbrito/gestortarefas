import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Package, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MaterialCatalogoService from '@/services/MaterialCatalogoService';
import { MaterialCatalogoInterface } from '@/interfaces/MaterialCatalogoInterface';
import { ItemComposicao } from '@/interfaces/OrcamentoInterface';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  materialId: z.string().min(1, 'Selecione um material'),
  quantidade: z.string().min(1, 'Quantidade é obrigatória'),
});

type FormData = z.infer<typeof formSchema>;

interface AddMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: Omit<ItemComposicao, 'id' | 'composicaoId' | 'ordem'>) => void;
  composicaoId: string;
}

export default function AddMaterialDialog({
  open,
  onOpenChange,
  onAdd,
  composicaoId,
}: AddMaterialDialogProps) {
  const { toast } = useToast();
  const [materiais, setMateriais] = useState<MaterialCatalogoInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [materialSelecionado, setMaterialSelecionado] = useState<MaterialCatalogoInterface | null>(null);
  const [quantidade, setQuantidade] = useState<string>('1');
  const [subtotal, setSubtotal] = useState<number>(0);

  useEffect(() => {
    if (open) {
      carregarMateriais();
    }
  }, [open]);

  useEffect(() => {
    if (materialSelecionado && quantidade) {
      const qtd = parseFloat(quantidade) || 0;
      setSubtotal(materialSelecionado.precoUnitario * qtd);
    } else {
      setSubtotal(0);
    }
  }, [materialSelecionado, quantidade]);

  const carregarMateriais = async () => {
    try {
      setLoading(true);
      const data = await MaterialCatalogoService.getAll();
      const ativos = data.filter((m) => m.ativo);
      setMateriais(ativos);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os materiais',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialChange = (materialId: string) => {
    const material = materiais.find((m) => m.id.toString() === materialId);
    setMaterialSelecionado(material || null);
  };

  const handleSubmit = () => {
    if (!materialSelecionado) {
      toast({
        title: 'Atenção',
        description: 'Selecione um material',
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

    const pesoTotal = materialSelecionado.pesoPorUnidade
      ? materialSelecionado.pesoPorUnidade * qtd
      : undefined;

    const novoItem: Omit<ItemComposicao, 'id' | 'composicaoId' | 'ordem'> = {
      codigo: materialSelecionado.codigo,
      descricao: materialSelecionado.nome,
      quantidade: qtd,
      unidade: materialSelecionado.unidade,
      peso: pesoTotal,
      material: materialSelecionado.material,
      especificacao: materialSelecionado.especificacao,
      valorUnitario: materialSelecionado.precoUnitario,
      subtotal: subtotal,
      percentual: 0, // Será calculado no backend
      tipoItem: 'material',
      tipoCalculo: materialSelecionado.tipoCalculo,
    };

    onAdd(novoItem);
    handleClose();
  };

  const handleClose = () => {
    setMaterialSelecionado(null);
    setQuantidade('1');
    setSubtotal(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Adicionar Material
          </DialogTitle>
          <DialogDescription>
            Selecione um material do catálogo e informe a quantidade
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Seleção de Material */}
          <div className="space-y-2">
            <Label>Material *</Label>
            <Select
              value={materialSelecionado?.id.toString() || ''}
              onValueChange={handleMaterialChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? 'Carregando...' : 'Selecione um material'} />
              </SelectTrigger>
              <SelectContent>
                {materiais.map((material) => (
                  <SelectItem key={material.id} value={material.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {material.codigo}
                      </span>
                      <span>-</span>
                      <span>{material.nome}</span>
                      {material.especificacao && (
                        <span className="text-xs text-muted-foreground">
                          ({material.especificacao})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Informações do Material Selecionado */}
          {materialSelecionado && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Categoria:</span>
                      <Badge variant="outline" className="ml-2">
                        {materialSelecionado.categoria}
                      </Badge>
                    </div>
                    {materialSelecionado.material && (
                      <div>
                        <span className="text-xs text-muted-foreground">Material:</span>
                        <span className="ml-2 text-sm font-medium">
                          {materialSelecionado.material}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Unidade:</span>
                      <span className="ml-2 text-sm font-bold">{materialSelecionado.unidade}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Preço Unit.:</span>
                      <span className="ml-2 text-sm font-bold text-blue-600">
                        {formatCurrency(materialSelecionado.precoUnitario)}
                      </span>
                    </div>
                    {materialSelecionado.pesoPorUnidade && (
                      <div>
                        <span className="text-xs text-muted-foreground">Peso/un.:</span>
                        <span className="ml-2 text-sm font-bold">
                          {materialSelecionado.pesoPorUnidade.toFixed(3)} kg
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

          {/* Preview do Peso Total */}
          {materialSelecionado?.pesoPorUnidade && quantidade && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Peso Total:</span>
                <span className="font-bold text-blue-600">
                  {(materialSelecionado.pesoPorUnidade * parseFloat(quantidade)).toFixed(2)} kg
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!materialSelecionado || !quantidade}>
            <Package className="mr-2 h-4 w-4" />
            Adicionar Material
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
