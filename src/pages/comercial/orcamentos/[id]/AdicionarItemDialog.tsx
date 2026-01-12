import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import ItemComposicaoService from '@/services/ItemComposicaoService';
import { CreateItemComposicao, ItemComposicao } from '@/interfaces/OrcamentoInterface';
import { Loader2, Package, Wrench, HardHat } from 'lucide-react';

interface AdicionarItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  composicaoId: string;
  onSuccess?: () => void;
  itemParaEditar?: ItemComposicao;
}

const TIPOS_ITEM = [
  { value: 'material', label: 'Material', icon: Package },
  { value: 'mao_obra', label: 'Mão de Obra', icon: HardHat },
  { value: 'ferramenta', label: 'Ferramenta', icon: Wrench },
  { value: 'consumivel', label: 'Consumível', icon: Package },
  { value: 'outros', label: 'Outros', icon: Package },
];

const UNIDADES = [
  'kg', 'h', 'un', 'm', 'm²', 'm³', 'ton', 'pc', 'cj', 'l'
];

const TIPOS_CALCULO = [
  { value: 'kg', label: 'KG (Peso)' },
  { value: 'hh', label: 'HH (Hora-Homem)' },
  { value: 'un', label: 'Unidade' },
  { value: 'm', label: 'Metro Linear' },
  { value: 'm2', label: 'Metro Quadrado' },
];

const AdicionarItemDialog = ({
  open,
  onOpenChange,
  composicaoId,
  onSuccess,
  itemParaEditar,
}: AdicionarItemDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    codigo: itemParaEditar?.codigo || '',
    descricao: itemParaEditar?.descricao || '',
    tipoItem: itemParaEditar?.tipoItem || 'material',
    tipoCalculo: itemParaEditar?.tipoCalculo || '',
    quantidade: itemParaEditar?.quantidade.toString() || '',
    unidade: itemParaEditar?.unidade || 'kg',
    peso: itemParaEditar?.peso?.toString() || '',
    valorUnitario: itemParaEditar?.valorUnitario.toString() || '',
    material: itemParaEditar?.material || '',
    especificacao: itemParaEditar?.especificacao || '',
    cargo: itemParaEditar?.cargo || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpar erro do campo
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Auto-ajuste de campos baseado no tipoItem
    if (field === 'tipoItem') {
      if (value === 'material') {
        setFormData((prev) => ({
          ...prev,
          tipoCalculo: 'kg',
          unidade: 'kg',
        }));
      } else if (value === 'mao_obra') {
        setFormData((prev) => ({
          ...prev,
          tipoCalculo: 'hh',
          unidade: 'h',
        }));
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.quantidade || parseFloat(formData.quantidade) <= 0) {
      newErrors.quantidade = 'Quantidade deve ser maior que zero';
    }

    if (!formData.unidade) {
      newErrors.unidade = 'Unidade é obrigatória';
    }

    if (!formData.valorUnitario || parseFloat(formData.valorUnitario) <= 0) {
      newErrors.valorUnitario = 'Valor unitário deve ser maior que zero';
    }

    if (formData.tipoItem === 'mao_obra' && !formData.cargo.trim()) {
      newErrors.cargo = 'Cargo é obrigatório para mão de obra';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const data: CreateItemComposicao = {
        composicaoId,
        codigo: formData.codigo || undefined,
        descricao: formData.descricao,
        quantidade: parseFloat(formData.quantidade),
        unidade: formData.unidade,
        peso: formData.peso ? parseFloat(formData.peso) : undefined,
        valorUnitario: parseFloat(formData.valorUnitario),
        tipoItem: formData.tipoItem as CreateItemComposicao['tipoItem'],
        cargo: formData.cargo || undefined,
      };

      if (itemParaEditar) {
        // Atualizar item existente
        await ItemComposicaoService.update({
          id: itemParaEditar.id,
          ...data,
        });

        toast({
          title: 'Sucesso',
          description: 'Item atualizado com sucesso',
        });
      } else {
        // Criar novo item
        await ItemComposicaoService.create(data);

        toast({
          title: 'Sucesso',
          description: 'Item adicionado com sucesso',
        });
      }

      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao salvar item:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao salvar item',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      codigo: '',
      descricao: '',
      tipoItem: 'material',
      tipoCalculo: '',
      quantidade: '',
      unidade: 'kg',
      peso: '',
      valorUnitario: '',
      material: '',
      especificacao: '',
      cargo: '',
    });
    setErrors({});
    onOpenChange(false);
  };

  const isMaoDeObra = formData.tipoItem === 'mao_obra';
  const isMaterial = formData.tipoItem === 'material';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl">
              {itemParaEditar ? 'Editar' : 'Novo'} Item
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {itemParaEditar
              ? 'Edite os dados do item da composição'
              : 'Adicione um novo item à composição de custos'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Tipo de Item */}
            <div className="space-y-2">
              <Label htmlFor="tipoItem">
                Tipo de Item <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tipoItem}
                onValueChange={(value) => handleChange('tipoItem', value)}
              >
                <SelectTrigger id="tipoItem">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_ITEM.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Código e Descrição */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  placeholder="Ex: MAT-001"
                  value={formData.codigo}
                  onChange={(e) => handleChange('codigo', e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="descricao">
                  Descrição <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="descricao"
                  placeholder="Ex: Chapa de aço ASTM A36 3/4"
                  value={formData.descricao}
                  onChange={(e) => handleChange('descricao', e.target.value)}
                  className={errors.descricao ? 'border-red-500' : ''}
                />
                {errors.descricao && <p className="text-sm text-red-500">{errors.descricao}</p>}
              </div>
            </div>

            {/* Campos específicos para MATERIAL */}
            {isMaterial && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material">Material (ASTM)</Label>
                  <Input
                    id="material"
                    placeholder="Ex: ASTM A 36"
                    value={formData.material}
                    onChange={(e) => handleChange('material', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ex: ASTM A 36, ASTM A 572, ASTM A 106
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="especificacao">Especificação</Label>
                  <Input
                    id="especificacao"
                    placeholder="Ex: CALANDRAR CILINDRICO"
                    value={formData.especificacao}
                    onChange={(e) => handleChange('especificacao', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Processos, dimensões, etc.
                  </p>
                </div>
              </div>
            )}

            {/* Campo específico para MÃO DE OBRA */}
            {isMaoDeObra && (
              <div className="space-y-2">
                <Label htmlFor="cargo">
                  Cargo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cargo"
                  placeholder="Ex: Soldador, Ajudante, Pintor"
                  value={formData.cargo}
                  onChange={(e) => handleChange('cargo', e.target.value)}
                  className={errors.cargo ? 'border-red-500' : ''}
                />
                {errors.cargo && <p className="text-sm text-red-500">{errors.cargo}</p>}
                <p className="text-xs text-muted-foreground">
                  Encargos sociais (50.72%) serão aplicados automaticamente
                </p>
              </div>
            )}

            {/* Quantidade, Unidade e Peso */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade">
                  Quantidade <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantidade"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.quantidade}
                  onChange={(e) => handleChange('quantidade', e.target.value)}
                  className={errors.quantidade ? 'border-red-500' : ''}
                />
                {errors.quantidade && <p className="text-sm text-red-500">{errors.quantidade}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidade">
                  Unidade <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.unidade}
                  onValueChange={(value) => handleChange('unidade', value)}
                >
                  <SelectTrigger id="unidade" className={errors.unidade ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES.map((unidade) => (
                      <SelectItem key={unidade} value={unidade}>
                        {unidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unidade && <p className="text-sm text-red-500">{errors.unidade}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="peso">Peso (KG)</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.peso}
                  onChange={(e) => handleChange('peso', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Opcional
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoCalculo">Cálculo</Label>
                <Select
                  value={formData.tipoCalculo}
                  onValueChange={(value) => handleChange('tipoCalculo', value)}
                >
                  <SelectTrigger id="tipoCalculo">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_CALCULO.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Valor Unitário */}
            <div className="space-y-2">
              <Label htmlFor="valorUnitario">
                Valor Unitário (R$) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="valorUnitario"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.valorUnitario}
                onChange={(e) => handleChange('valorUnitario', e.target.value)}
                className={errors.valorUnitario ? 'border-red-500' : ''}
              />
              {errors.valorUnitario && (
                <p className="text-sm text-red-500">{errors.valorUnitario}</p>
              )}
            </div>

            {/* Info calculado */}
            {formData.quantidade && formData.valorUnitario && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-900">Subtotal do Item:</span>
                  <span className="text-xl font-bold text-green-700">
                    R$ {(parseFloat(formData.quantidade) * parseFloat(formData.valorUnitario)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  {itemParaEditar ? 'Salvar Alterações' : 'Adicionar Item'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdicionarItemDialog;
