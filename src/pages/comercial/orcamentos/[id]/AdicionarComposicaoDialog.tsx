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
import { useToast } from '@/hooks/use-toast';
import ComposicaoService from '@/services/ComposicaoService';
import { CreateComposicao, ComposicaoCustos } from '@/interfaces/OrcamentoInterface';
import { Loader2, Package, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AdicionarComposicaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orcamentoId: string;
  onSuccess?: () => void;
  composicaoParaEditar?: ComposicaoCustos;
}

const TIPOS_COMPOSICAO = [
  { value: 'mobilizacao', label: 'Mobilização' },
  { value: 'desmobilizacao', label: 'Desmobilização' },
  { value: 'mo_fabricacao', label: 'MO Fabricação' },
  { value: 'mo_montagem', label: 'MO Montagem' },
  { value: 'jato_pintura', label: 'Jato/Pintura' },
  { value: 'ferramentas', label: 'Ferramentas' },
  { value: 'consumiveis', label: 'Consumíveis' },
  { value: 'materiais', label: 'Materiais' },
];

// BDI Padrão por tipo (valores detalhados)
const BDI_PADRAO: Record<string, {
  despesasAdministrativas: number;
  despesasComerciais: number;
  despesasFinanceiras: number;
  impostosIndiretos: number;
}> = {
  mobilizacao: { despesasAdministrativas: 12, despesasComerciais: 5, despesasFinanceiras: 3, impostosIndiretos: 5 },
  desmobilizacao: { despesasAdministrativas: 12, despesasComerciais: 5, despesasFinanceiras: 3, impostosIndiretos: 5 },
  mo_fabricacao: { despesasAdministrativas: 8, despesasComerciais: 3, despesasFinanceiras: 2, impostosIndiretos: 2 },
  mo_montagem: { despesasAdministrativas: 8, despesasComerciais: 3, despesasFinanceiras: 2, impostosIndiretos: 2 },
  jato_pintura: { despesasAdministrativas: 10, despesasComerciais: 4, despesasFinanceiras: 3, impostosIndiretos: 3 },
  ferramentas: { despesasAdministrativas: 5, despesasComerciais: 2, despesasFinanceiras: 1, impostosIndiretos: 2 },
  consumiveis: { despesasAdministrativas: 10, despesasComerciais: 4, despesasFinanceiras: 3, impostosIndiretos: 3 },
  materiais: { despesasAdministrativas: 12, despesasComerciais: 5, despesasFinanceiras: 3, impostosIndiretos: 5 },
};

const MARGEM_LUCRO_PADRAO = 7; // 7% padrão

const AdicionarComposicaoDialog = ({
  open,
  onOpenChange,
  orcamentoId,
  onSuccess,
  composicaoParaEditar,
}: AdicionarComposicaoDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nome: composicaoParaEditar?.nome || '',
    tipo: composicaoParaEditar?.tipo || '',
    despesasAdministrativas: composicaoParaEditar?.bdi.despesasAdministrativas.percentual.toString() || '',
    despesasComerciais: composicaoParaEditar?.bdi.despesasComerciais.percentual.toString() || '',
    despesasFinanceiras: composicaoParaEditar?.bdi.despesasFinanceiras.percentual.toString() || '',
    impostosIndiretos: composicaoParaEditar?.bdi.impostosIndiretos.percentual.toString() || '',
    margemLucro: composicaoParaEditar?.margemLucro.percentual.toString() || MARGEM_LUCRO_PADRAO.toString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-fill BDI padrão quando tipo mudar
    if (field === 'tipo' && value && !composicaoParaEditar) {
      const bdiPadrao = BDI_PADRAO[value] || BDI_PADRAO.materiais;
      setFormData((prev) => ({
        ...prev,
        despesasAdministrativas: bdiPadrao.despesasAdministrativas.toString(),
        despesasComerciais: bdiPadrao.despesasComerciais.toString(),
        despesasFinanceiras: bdiPadrao.despesasFinanceiras.toString(),
        impostosIndiretos: bdiPadrao.impostosIndiretos.toString(),
      }));
    }

    // Limpar erro do campo
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome da composição é obrigatório';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Selecione um tipo de composição';
    }

    if (!formData.despesasAdministrativas || parseFloat(formData.despesasAdministrativas) < 0) {
      newErrors.despesasAdministrativas = 'Valor inválido';
    }

    if (!formData.despesasComerciais || parseFloat(formData.despesasComerciais) < 0) {
      newErrors.despesasComerciais = 'Valor inválido';
    }

    if (!formData.despesasFinanceiras || parseFloat(formData.despesasFinanceiras) < 0) {
      newErrors.despesasFinanceiras = 'Valor inválido';
    }

    if (!formData.impostosIndiretos || parseFloat(formData.impostosIndiretos) < 0) {
      newErrors.impostosIndiretos = 'Valor inválido';
    }

    if (!formData.margemLucro || parseFloat(formData.margemLucro) < 0) {
      newErrors.margemLucro = 'Margem de lucro deve ser um valor positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const data: CreateComposicao = {
        orcamentoId,
        nome: formData.nome,
        tipo: formData.tipo as CreateComposicao['tipo'],
        bdi: {
          despesasAdministrativas: { percentual: parseFloat(formData.despesasAdministrativas) },
          despesasComerciais: { percentual: parseFloat(formData.despesasComerciais) },
          despesasFinanceiras: { percentual: parseFloat(formData.despesasFinanceiras) },
          impostosIndiretos: { percentual: parseFloat(formData.impostosIndiretos) },
        },
        margemLucro: {
          percentual: parseFloat(formData.margemLucro),
        },
      };

      if (composicaoParaEditar) {
        // Atualizar composição existente
        await ComposicaoService.update({
          id: composicaoParaEditar.id,
          ...data,
        });

        toast({
          title: 'Sucesso',
          description: 'Composição atualizada com sucesso',
        });
      } else {
        // Criar nova composição
        await ComposicaoService.create(data);

        toast({
          title: 'Sucesso',
          description: 'Composição criada com sucesso',
        });
      }

      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao salvar composição:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao salvar composição',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nome: '',
      tipo: '',
      despesasAdministrativas: '',
      despesasComerciais: '',
      despesasFinanceiras: '',
      impostosIndiretos: '',
      margemLucro: MARGEM_LUCRO_PADRAO.toString(),
    });
    setErrors({});
    onOpenChange(false);
  };

  // Calcular BDI total
  const bdiTotal = (
    parseFloat(formData.despesasAdministrativas || '0') +
    parseFloat(formData.despesasComerciais || '0') +
    parseFloat(formData.despesasFinanceiras || '0') +
    parseFloat(formData.impostosIndiretos || '0')
  ).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-xl">
              {composicaoParaEditar ? 'Editar' : 'Nova'} Composição
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {composicaoParaEditar
              ? 'Edite os dados da composição de custos'
              : 'Adicione uma nova composição de custos ao orçamento'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome da Composição <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nome"
                placeholder="Ex: Mobilização Padrão"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                className={errors.nome ? 'border-red-500' : ''}
              />
              {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">
                Tipo <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => handleChange('tipo', value)}
              >
                <SelectTrigger id="tipo" className={errors.tipo ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_COMPOSICAO.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo && <p className="text-sm text-red-500">{errors.tipo}</p>}
            </div>

            {/* BDI Detalhado */}
            <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100">BDI Detalhado (%)</h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="despesasAdministrativas" className="text-xs">
                      Despesas Administrativas
                    </Label>
                    <Input
                      id="despesasAdministrativas"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="12.00"
                      value={formData.despesasAdministrativas}
                      onChange={(e) => handleChange('despesasAdministrativas', e.target.value)}
                      className={errors.despesasAdministrativas ? 'border-red-500' : ''}
                    />
                    {errors.despesasAdministrativas && (
                      <p className="text-xs text-red-500">{errors.despesasAdministrativas}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="despesasComerciais" className="text-xs">
                      Despesas Comerciais
                    </Label>
                    <Input
                      id="despesasComerciais"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="5.00"
                      value={formData.despesasComerciais}
                      onChange={(e) => handleChange('despesasComerciais', e.target.value)}
                      className={errors.despesasComerciais ? 'border-red-500' : ''}
                    />
                    {errors.despesasComerciais && (
                      <p className="text-xs text-red-500">{errors.despesasComerciais}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="despesasFinanceiras" className="text-xs">
                      Despesas Financeiras
                    </Label>
                    <Input
                      id="despesasFinanceiras"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="3.00"
                      value={formData.despesasFinanceiras}
                      onChange={(e) => handleChange('despesasFinanceiras', e.target.value)}
                      className={errors.despesasFinanceiras ? 'border-red-500' : ''}
                    />
                    {errors.despesasFinanceiras && (
                      <p className="text-xs text-red-500">{errors.despesasFinanceiras}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="impostosIndiretos" className="text-xs">
                      Impostos Indiretos
                    </Label>
                    <Input
                      id="impostosIndiretos"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="5.00"
                      value={formData.impostosIndiretos}
                      onChange={(e) => handleChange('impostosIndiretos', e.target.value)}
                      className={errors.impostosIndiretos ? 'border-red-500' : ''}
                    />
                    {errors.impostosIndiretos && (
                      <p className="text-xs text-red-500">{errors.impostosIndiretos}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-purple-200 dark:border-purple-800">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">BDI Total:</span>
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{bdiTotal}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Margem de Lucro */}
            <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold text-green-900 dark:text-green-100">Margem de Lucro (%)</h4>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="margemLucro">
                    Percentual <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="margemLucro"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="7.00"
                    value={formData.margemLucro}
                    onChange={(e) => handleChange('margemLucro', e.target.value)}
                    className={errors.margemLucro ? 'border-red-500' : ''}
                  />
                  {errors.margemLucro && (
                    <p className="text-sm text-red-500">{errors.margemLucro}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Lucro pretendido após deduzir custos diretos e BDI
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Importante:</strong> BDI (Benefícios e Despesas Indiretas) representa despesas operacionais.
                Margem de Lucro é separada e representa o lucro líquido pretendido.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  {composicaoParaEditar ? 'Salvar Alterações' : 'Criar Composição'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdicionarComposicaoDialog;
