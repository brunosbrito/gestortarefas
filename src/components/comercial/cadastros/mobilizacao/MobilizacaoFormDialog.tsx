import { useState, useEffect } from 'react';
import { Save, X as XIcon, Truck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import MobilizacaoService from '@/services/MobilizacaoService';
import {
  ItemMobilizacaoInterface,
  TipoMobilizacao,
  TipoMobilizacaoLabels,
  CategoriaMobilizacao,
  CategoriaMobilizacaoLabels,
  ItemMobilizacaoCreateDTO,
  ItemMobilizacaoUpdateDTO,
} from '@/interfaces/MobilizacaoInterface';

interface MobilizacaoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemMobilizacaoInterface | null;
  onSalvar: () => void;
  tipoInicial?: TipoMobilizacao; // Para pré-selecionar o tipo ao criar
}

const MobilizacaoFormDialog = ({
  open,
  onOpenChange,
  item,
  onSalvar,
  tipoInicial,
}: MobilizacaoFormDialogProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Campos do formulário
  const [tipo, setTipo] = useState<TipoMobilizacao>(tipoInicial || TipoMobilizacao.MOBILIZACAO);
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<CategoriaMobilizacao>(CategoriaMobilizacao.TRANSPORTE);
  const [unidade, setUnidade] = useState('un');
  const [precoUnitario, setPrecoUnitario] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const unidades = ['un', 'vb', 'km', 'dia', 'h'];

  useEffect(() => {
    if (open) {
      if (item) {
        // Edição: preencher campos
        setTipo(item.tipo);
        setCodigo(item.codigo || '');
        setDescricao(item.descricao || '');
        setCategoria(item.categoria);
        setUnidade(item.unidade || 'un');
        setPrecoUnitario(item.precoUnitario?.toString() || '');
        setObservacoes(item.observacoes || '');
      } else {
        // Novo: limpar campos e usar tipoInicial se fornecido
        resetForm();
        if (tipoInicial) {
          setTipo(tipoInicial);
        }
      }
    }
  }, [open, item, tipoInicial]);

  const resetForm = () => {
    setTipo(tipoInicial || TipoMobilizacao.MOBILIZACAO);
    setCodigo('');
    setDescricao('');
    setCategoria(CategoriaMobilizacao.TRANSPORTE);
    setUnidade('un');
    setPrecoUnitario('');
    setObservacoes('');
  };

  const handleSalvar = async () => {
    // Validações básicas
    if (!codigo.trim()) {
      toast({
        title: 'Erro',
        description: 'Código é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    if (!descricao.trim()) {
      toast({
        title: 'Erro',
        description: 'Descrição é obrigatória',
        variant: 'destructive',
      });
      return;
    }

    if (!precoUnitario || parseFloat(precoUnitario) <= 0) {
      toast({
        title: 'Erro',
        description: 'Preço unitário deve ser maior que zero',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      const data: ItemMobilizacaoCreateDTO = {
        tipo,
        codigo: codigo.trim(),
        descricao: descricao.trim(),
        categoria,
        unidade: unidade.trim(),
        precoUnitario: parseFloat(precoUnitario),
        observacoes: observacoes.trim() || undefined,
        ativo: true,
      };

      if (item?.id) {
        // Atualização
        const updateData: ItemMobilizacaoUpdateDTO = {
          id: item.id,
          ...data,
        };
        await MobilizacaoService.update(updateData);
        toast({
          title: 'Sucesso',
          description: 'Item atualizado com sucesso',
        });
      } else {
        // Criação
        await MobilizacaoService.create(data);
        toast({
          title: 'Sucesso',
          description: 'Item criado com sucesso',
        });
      }

      onSalvar();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao salvar item:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Não foi possível salvar o item',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            {item ? 'Editar Item' : 'Novo Item de Mobilização/Desmobilização'}
          </DialogTitle>
          <DialogDescription>
            {item ? 'Edite as informações do item' : 'Preencha as informações do novo item'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Linha 1: Tipo e Categoria */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">
                Tipo <span className="text-red-500">*</span>
              </Label>
              <Select value={tipo} onValueChange={(value) => setTipo(value as TipoMobilizacao)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TipoMobilizacao).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {TipoMobilizacaoLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="categoria">
                Categoria <span className="text-red-500">*</span>
              </Label>
              <Select value={categoria} onValueChange={(value) => setCategoria(value as CategoriaMobilizacao)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CategoriaMobilizacao).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {CategoriaMobilizacaoLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linha 2: Código */}
          <div>
            <Label htmlFor="codigo">
              Código <span className="text-red-500">*</span>
            </Label>
            <Input
              id="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: MOB-TRANSP-01, DESMOB-EQUIP-02"
            />
          </div>

          {/* Linha 3: Descrição */}
          <div>
            <Label htmlFor="descricao">
              Descrição <span className="text-red-500">*</span>
            </Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição completa do item"
            />
          </div>

          {/* Linha 4: Unidade e Preço */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unidade">
                Unidade <span className="text-red-500">*</span>
              </Label>
              <Select value={unidade} onValueChange={setUnidade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="precoUnitario">
                Preço Unitário (R$) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="precoUnitario"
                type="number"
                step="0.01"
                min="0"
                value={precoUnitario}
                onChange={(e) => setPrecoUnitario(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Linha 5: Observações */}
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais sobre o item"
              rows={3}
            />
          </div>

          {/* Info sobre unidades */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Unidades comuns:
            </p>
            <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-xs">
              <li>• <strong>un:</strong> Unidade (ex: 1 caminhão, 1 equipamento)</li>
              <li>• <strong>vb:</strong> Verba (valor fixo global)</li>
              <li>• <strong>km:</strong> Quilômetros (transporte)</li>
              <li>• <strong>dia:</strong> Diária (aluguel de equipamentos)</li>
              <li>• <strong>h:</strong> Horas (serviços por hora)</li>
            </ul>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleCancelar} disabled={saving}>
            <XIcon className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobilizacaoFormDialog;
