import { useState, useEffect } from 'react';
import { Save, X as XIcon, Box } from 'lucide-react';
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
import ConsumivelService from '@/services/ConsumivelService';
import {
  ConsumivelInterface,
  ConsumivelCategoria,
  ConsumivelCategoriaLabels,
  GrupoABC,
  GrupoABCLabels,
  ConsumivelCreateDTO,
  ConsumivelUpdateDTO,
} from '@/interfaces/ConsumivelInterface';

interface ConsumivelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consumivel: ConsumivelInterface | null;
  onSalvar: () => void;
}

const ConsumivelFormDialog = ({
  open,
  onOpenChange,
  consumivel,
  onSalvar,
}: ConsumivelFormDialogProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Campos do formulário
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<ConsumivelCategoria>(ConsumivelCategoria.LIXAS);
  const [unidade, setUnidade] = useState('un');
  const [precoUnitario, setPrecoUnitario] = useState('');
  const [fornecedor, setFornecedor] = useState('Diversos');
  const [grupoABC, setGrupoABC] = useState<GrupoABC | ''>('');
  const [observacoes, setObservacoes] = useState('');

  const fornecedores = ['Diversos', 'Nacional', 'Importado'];
  const unidades = ['un', 'kg', 'cx', 'pc', 'm', 'L'];

  useEffect(() => {
    if (open) {
      if (consumivel) {
        // Edição: preencher campos
        setCodigo(consumivel.codigo || '');
        setDescricao(consumivel.descricao || '');
        setCategoria(consumivel.categoria);
        setUnidade(consumivel.unidade || 'un');
        setPrecoUnitario(consumivel.precoUnitario?.toString() || '');
        setFornecedor(consumivel.fornecedor || 'Diversos');
        setGrupoABC(consumivel.grupoABC || '');
        setObservacoes(consumivel.observacoes || '');
      } else {
        // Novo: limpar campos
        resetForm();
      }
    }
  }, [open, consumivel]);

  const resetForm = () => {
    setCodigo('');
    setDescricao('');
    setCategoria(ConsumivelCategoria.LIXAS);
    setUnidade('un');
    setPrecoUnitario('');
    setFornecedor('Diversos');
    setGrupoABC('');
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

      const data: ConsumivelCreateDTO = {
        codigo: codigo.trim(),
        descricao: descricao.trim(),
        categoria,
        unidade: unidade.trim(),
        precoUnitario: parseFloat(precoUnitario),
        fornecedor: fornecedor.trim(),
        grupoABC: grupoABC || undefined,
        observacoes: observacoes.trim() || undefined,
        ativo: true,
      };

      if (consumivel?.id) {
        // Atualização
        const updateData: ConsumivelUpdateDTO = {
          id: consumivel.id,
          ...data,
        };
        await ConsumivelService.update(updateData);
        toast({
          title: 'Sucesso',
          description: 'Consumível atualizado com sucesso',
        });
      } else {
        // Criação
        await ConsumivelService.create(data);
        toast({
          title: 'Sucesso',
          description: 'Consumível criado com sucesso',
        });
      }

      onSalvar();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao salvar consumível:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Não foi possível salvar o consumível',
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
            <Box className="h-5 w-5 text-blue-600" />
            {consumivel ? 'Editar Consumível' : 'Novo Consumível'}
          </DialogTitle>
          <DialogDescription>
            {consumivel ? 'Edite as informações do consumível' : 'Preencha as informações do novo consumível'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Linha 1: Código e Categoria */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo">
                Código <span className="text-red-500">*</span>
              </Label>
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ex: LIXA-80, DISCO-4.1/2"
              />
            </div>
            <div>
              <Label htmlFor="categoria">
                Categoria <span className="text-red-500">*</span>
              </Label>
              <Select value={categoria} onValueChange={(value) => setCategoria(value as ConsumivelCategoria)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ConsumivelCategoria).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {ConsumivelCategoriaLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linha 2: Descrição */}
          <div>
            <Label htmlFor="descricao">
              Descrição <span className="text-red-500">*</span>
            </Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição completa do consumível"
            />
          </div>

          {/* Linha 3: Unidade, Preço e Grupo ABC */}
          <div className="grid grid-cols-3 gap-4">
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
            <div>
              <Label htmlFor="grupoABC">Grupo ABC (Curva ABC)</Label>
              <Select value={grupoABC} onValueChange={(value) => setGrupoABC(value as GrupoABC | '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {Object.entries(GrupoABC).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {GrupoABCLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linha 4: Fornecedor */}
          <div>
            <Label htmlFor="fornecedor">
              Fornecedor <span className="text-red-500">*</span>
            </Label>
            <Select value={fornecedor} onValueChange={setFornecedor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fornecedores.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Linha 5: Observações */}
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais sobre o consumível"
              rows={3}
            />
          </div>

          {/* Info sobre Curva ABC */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Sobre a Curva ABC:
            </p>
            <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-xs">
              <li>• <strong>Grupo A:</strong> 80% do valor (alta prioridade)</li>
              <li>• <strong>Grupo B:</strong> 15% do valor (média prioridade)</li>
              <li>• <strong>Grupo C:</strong> 5% do valor (baixa prioridade)</li>
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

export default ConsumivelFormDialog;
