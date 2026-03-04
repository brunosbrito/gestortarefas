import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FornecedorServicoInterface,
  CategoriaFornecedor,
  CategoriaFornecedorLabels,
} from '@/interfaces/FornecedorServicoInterface';
import { useToast } from '@/hooks/use-toast';

interface FormularioFornecedorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedor?: FornecedorServicoInterface | null;
  onSuccess: (novoFornecedor?: FornecedorServicoInterface) => void;
}

const TODAS_CATEGORIAS = Object.keys(CategoriaFornecedorLabels) as CategoriaFornecedor[];

const formatarTelefone = (valor: string): string => {
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 2) return nums.length ? `(${nums}` : '';
  if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
};

const FormularioFornecedor = ({ open, onOpenChange, fornecedor, onSuccess }: FormularioFornecedorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [categorias, setCategorias] = useState<CategoriaFornecedor[]>([]);
  const [valorJateamento, setValorJateamento] = useState('');
  const [valorPintura, setValorPintura] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const temJateamentoPintura = categorias.includes('jateamento_pintura');

  useEffect(() => {
    if (fornecedor) {
      setNome(fornecedor.nome);
      setContato(fornecedor.contato || '');
      setTelefone(fornecedor.telefone || '');
      setEmail(fornecedor.email || '');
      setCategorias(fornecedor.categorias || []);
      setValorJateamento(fornecedor.valorJateamentoM2 > 0 ? String(fornecedor.valorJateamentoM2) : '');
      setValorPintura(fornecedor.valorPinturaM2 > 0 ? String(fornecedor.valorPinturaM2) : '');
      setObservacoes(fornecedor.observacoes || '');
    } else {
      limparCampos();
    }
  }, [fornecedor, open]);

  const limparCampos = () => {
    setNome('');
    setContato('');
    setTelefone('');
    setEmail('');
    setCategorias([]);
    setValorJateamento('');
    setValorPintura('');
    setObservacoes('');
  };

  const toggleCategoria = (cat: CategoriaFornecedor) => {
    setCategorias((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast({ title: 'Erro', description: 'Informe o nome do fornecedor', variant: 'destructive' });
      return;
    }

    if (categorias.length === 0) {
      toast({ title: 'Erro', description: 'Selecione ao menos uma categoria', variant: 'destructive' });
      return;
    }

    if (temJateamentoPintura) {
      const valJat = parseFloat(valorJateamento);
      const valPint = parseFloat(valorPintura);
      if (!valorJateamento || valJat <= 0 || !valorPintura || valPint <= 0) {
        toast({
          title: 'Erro',
          description: 'Para Jateamento/Pintura, informe os valores de R$/m²',
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      setLoading(true);

      const data: FornecedorServicoInterface = {
        id: fornecedor?.id || Date.now(),
        nome: nome.trim(),
        contato: contato || undefined,
        telefone: telefone || undefined,
        email: email || undefined,
        categorias,
        valorJateamentoM2: temJateamentoPintura ? parseFloat(valorJateamento) || 0 : 0,
        valorPinturaM2: temJateamentoPintura ? parseFloat(valorPintura) || 0 : 0,
        observacoes: observacoes || undefined,
        ativo: true,
      };

      // MOCK: Salvar no localStorage
      const locais = JSON.parse(localStorage.getItem('fornecedores_locais') || '[]') as FornecedorServicoInterface[];
      const idx = locais.findIndex((f) => f.id === data.id);
      if (idx >= 0) {
        locais[idx] = data;
      } else {
        locais.push(data);
      }
      localStorage.setItem('fornecedores_locais', JSON.stringify(locais));

      // Quando backend estiver pronto, descomentar:
      // if (fornecedor?.id) {
      //   await FornecedorServicoService.atualizar(fornecedor.id, data);
      // } else {
      //   await FornecedorServicoService.criar(data);
      // }

      toast({
        title: 'Sucesso',
        description: `Fornecedor ${fornecedor ? 'atualizado' : 'cadastrado'} com sucesso!`,
      });

      onSuccess(data);
      onOpenChange(false);
      limparCampos();
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      toast({ title: 'Erro', description: 'Não foi possível salvar o fornecedor', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{fornecedor ? 'Editar' : 'Novo'} Fornecedor de Serviço</DialogTitle>
          <DialogDescription>
            Preencha os dados do fornecedor terceirizado
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome do Fornecedor *</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Metalúrgica Precisão SP LTDA"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contato</Label>
              <Input
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                placeholder="Ex: João Silva"
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                value={telefone}
                onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                placeholder="(XX) XXXXX-XXXX"
                maxLength={15}
              />
            </div>
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: contato@empresa.com.br"
            />
          </div>

          {/* Categorias */}
          <div className="p-4 border rounded-lg space-y-2">
            <Label>Categorias de Serviço *</Label>
            <p className="text-xs text-muted-foreground mb-2">Selecione todas as categorias que este fornecedor atende</p>
            <div className="grid grid-cols-2 gap-2">
              {TODAS_CATEGORIAS.map((cat) => (
                <div key={cat} className="flex items-center gap-2">
                  <Checkbox
                    id={`cat-${cat}`}
                    checked={categorias.includes(cat)}
                    onCheckedChange={() => toggleCategoria(cat)}
                  />
                  <label
                    htmlFor={`cat-${cat}`}
                    className="text-sm cursor-pointer select-none"
                  >
                    {CategoriaFornecedorLabels[cat]}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Valores de Jateamento/Pintura — apenas quando categoria selecionada */}
          {temJateamentoPintura && (
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-blue-50/30 dark:bg-blue-950/20">
              <div>
                <Label>Valor Jateamento (R$/m²) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={valorJateamento}
                  onChange={(e) => setValorJateamento(e.target.value)}
                  placeholder="Ex: 35.00"
                />
              </div>
              <div>
                <Label>Valor Pintura (R$/m²) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={valorPintura}
                  onChange={(e) => setValorPintura(e.target.value)}
                  placeholder="Ex: 42.00"
                />
              </div>
            </div>
          )}

          <div>
            <Label>Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Prazo médio 5 dias úteis, especialidade, região de atendimento..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : fornecedor ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormularioFornecedor;
