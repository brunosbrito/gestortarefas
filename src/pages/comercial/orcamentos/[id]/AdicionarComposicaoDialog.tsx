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
import { Loader2, Package } from 'lucide-react';

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

const BDI_PADRAO: Record<string, number> = {
  mobilizacao: 25,
  desmobilizacao: 25,
  mo_fabricacao: 15,
  mo_montagem: 15,
  jato_pintura: 20,
  ferramentas: 10,
  consumiveis: 20,
  materiais: 25,
};

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
    bdiPercentual: composicaoParaEditar?.bdi.percentual.toString() || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-fill BDI padrão quando tipo mudar
    if (field === 'tipo' && value && !composicaoParaEditar) {
      const bdiPadrao = BDI_PADRAO[value] || 25;
      setFormData((prev) => ({ ...prev, bdiPercentual: bdiPadrao.toString() }));
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

    if (!formData.bdiPercentual || parseFloat(formData.bdiPercentual) < 0) {
      newErrors.bdiPercentual = 'BDI deve ser um valor positivo';
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
        bdiPercentual: parseFloat(formData.bdiPercentual),
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
      bdiPercentual: '',
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
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

            <div className="space-y-2">
              <Label htmlFor="bdiPercentual">
                BDI (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bdiPercentual"
                type="number"
                step="0.01"
                min="0"
                placeholder="25.00"
                value={formData.bdiPercentual}
                onChange={(e) => handleChange('bdiPercentual', e.target.value)}
                className={errors.bdiPercentual ? 'border-red-500' : ''}
              />
              {errors.bdiPercentual && (
                <p className="text-sm text-red-500">{errors.bdiPercentual}</p>
              )}
              <p className="text-xs text-muted-foreground">
                BDI padrão: Materiais (25%), Ferramentas (10%), MO (15%)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>Dica:</strong> O BDI (Benefícios e Despesas Indiretas) é aplicado
                sobre o custo direto da composição. Você pode ajustá-lo conforme a negociação.
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
              className="bg-blue-600 hover:bg-blue-700"
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
