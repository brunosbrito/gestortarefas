import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TintaInterface, TipoTinta, TipoTintaLabels } from '@/interfaces/TintaInterface';
import { useToast } from '@/hooks/use-toast';
import TintaService from '@/services/TintaService';

interface FormularioTintaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tinta?: TintaInterface | null;
  onSuccess: (novaTinta?: TintaInterface) => void;
}

const FormularioTinta = ({ open, onOpenChange, tinta, onSuccess }: FormularioTintaProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Campos do formulário
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoTinta>(TipoTinta.PRIMER);
  const [solidosVolume, setSolidosVolume] = useState('');
  const [precoLitro, setPrecoLitro] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Preencher campos ao editar
  useEffect(() => {
    if (tinta) {
      setCodigo(tinta.codigo);
      setDescricao(tinta.descricao);
      setTipo(tinta.tipo);
      setSolidosVolume(String(tinta.solidosVolume));
      setPrecoLitro(String(tinta.precoLitro));
      setFornecedor(tinta.fornecedor);
      setObservacoes(tinta.observacoes || '');
    } else {
      limparCampos();
    }
  }, [tinta, open]);

  const limparCampos = () => {
    setCodigo('');
    setDescricao('');
    setTipo(TipoTinta.PRIMER);
    setSolidosVolume('');
    setPrecoLitro('');
    setFornecedor('');
    setObservacoes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!codigo || !descricao || !solidosVolume || !precoLitro || !fornecedor) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    const sv = parseFloat(solidosVolume);
    const preco = parseFloat(precoLitro);

    if (sv <= 0 || sv > 100) {
      toast({
        title: 'Erro',
        description: 'Sólidos por Volume deve estar entre 0 e 100%',
        variant: 'destructive',
      });
      return;
    }

    if (preco <= 0) {
      toast({
        title: 'Erro',
        description: 'Preço deve ser maior que zero',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const data: TintaInterface = {
        id: tinta?.id || Date.now(), // MOCK: usar timestamp como ID
        codigo,
        descricao,
        tipo,
        solidosVolume: sv,
        precoLitro: preco,
        fornecedor,
        observacoes: observacoes || undefined,
        ativo: true,
      };

      // MOCK: Simular salvamento
      console.log('MOCK: Salvando tinta:', data);

      // Quando backend estiver pronto, descomentar:
      // if (tinta?.id) {
      //   await TintaService.atualizar(tinta.id, data);
      // } else {
      //   await TintaService.criar(data);
      // }

      toast({
        title: 'Sucesso',
        description: `Tinta ${tinta ? 'atualizada' : 'cadastrada'} com sucesso!`,
      });

      onSuccess(data); // Passa a tinta criada/editada de volta
      onOpenChange(false);
      limparCampos();
    } catch (error) {
      console.error('Erro ao salvar tinta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a tinta',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tinta ? 'Editar' : 'Nova'} Tinta</DialogTitle>
          <DialogDescription>
            Preencha os dados da tinta para o catálogo de pintura
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Código *</Label>
              <Input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ex: PRIMER-001"
                required
              />
            </div>

            <div>
              <Label>Tipo *</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoTinta)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TipoTinta.PRIMER}>
                    {TipoTintaLabels[TipoTinta.PRIMER]}
                  </SelectItem>
                  <SelectItem value={TipoTinta.ACABAMENTO}>
                    {TipoTintaLabels[TipoTinta.ACABAMENTO]}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Descrição *</Label>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Primer Epóxi Alto Sólidos - Internacional Interzone 954"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Sólidos por Volume (%) *</Label>
              <Input
                type="number"
                step="0.1"
                value={solidosVolume}
                onChange={(e) => setSolidosVolume(e.target.value)}
                placeholder="Ex: 72"
                required
              />
            </div>

            <div>
              <Label>Preço por Litro (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                value={precoLitro}
                onChange={(e) => setPrecoLitro(e.target.value)}
                placeholder="Ex: 89.50"
                required
              />
            </div>

            <div>
              <Label>Fornecedor *</Label>
              <Input
                value={fornecedor}
                onChange={(e) => setFornecedor(e.target.value)}
                placeholder="Ex: Internacional"
                required
              />
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Secagem rápida, alta aderência"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : tinta ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormularioTinta;
