import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  FornecedorInterface,
  TipoFornecedor,
  TipoFornecedorLabels,
} from '@/interfaces/FornecedorServicoInterface';
import FornecedorService from '@/services/FornecedorServicoService';
import { useToast } from '@/hooks/use-toast';

interface FormularioFornecedorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedor?: FornecedorInterface | null;
  onSuccess: (novoFornecedor?: FornecedorInterface) => void;
}

const formatarTelefone = (valor: string): string => {
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 2) return nums.length ? `(${nums}` : '';
  if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
};

const formatarCNPJ = (valor: string): string => {
  const nums = valor.replace(/\D/g, '').slice(0, 14);
  if (nums.length <= 2) return nums;
  if (nums.length <= 5) return `${nums.slice(0, 2)}.${nums.slice(2)}`;
  if (nums.length <= 8) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5)}`;
  if (nums.length <= 12) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8)}`;
  return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12)}`;
};

const FormularioFornecedor = ({ open, onOpenChange, fornecedor, onSuccess }: FormularioFornecedorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [tipo, setTipo] = useState<TipoFornecedor>(TipoFornecedor.SERVICO);
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [contatoNome, setContatoNome] = useState('');
  const [contatoTelefone, setContatoTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [cep, setCep] = useState('');
  const [condicaoPagamento, setCondicaoPagamento] = useState('');
  const [prazoEntregaDias, setPrazoEntregaDias] = useState('30');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (fornecedor) {
      setCnpj(fornecedor.cnpj || '');
      setRazaoSocial(fornecedor.razaoSocial || '');
      setNomeFantasia(fornecedor.nomeFantasia || '');
      setTipo(fornecedor.tipo || TipoFornecedor.SERVICO);
      setTelefone(fornecedor.telefone || '');
      setEmail(fornecedor.email || '');
      setContatoNome(fornecedor.contatoNome || '');
      setContatoTelefone(fornecedor.contatoTelefone || '');
      setEndereco(fornecedor.endereco || '');
      setCidade(fornecedor.cidade || '');
      setUf(fornecedor.uf || '');
      setCep(fornecedor.cep || '');
      setCondicaoPagamento(fornecedor.condicaoPagamento || '');
      setPrazoEntregaDias(String(fornecedor.prazoEntregaDias ?? 30));
      setObservacoes(fornecedor.observacoes || '');
    } else {
      limparCampos();
    }
  }, [fornecedor, open]);

  const limparCampos = () => {
    setCnpj('');
    setRazaoSocial('');
    setNomeFantasia('');
    setTipo(TipoFornecedor.SERVICO);
    setTelefone('');
    setEmail('');
    setContatoNome('');
    setContatoTelefone('');
    setEndereco('');
    setCidade('');
    setUf('');
    setCep('');
    setCondicaoPagamento('');
    setPrazoEntregaDias('30');
    setObservacoes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cnpjLimpo = cnpj.replace(/\D/g, '');

    if (!cnpjLimpo || cnpjLimpo.length < 14) {
      toast({ title: 'Erro', description: 'Informe um CNPJ válido', variant: 'destructive' });
      return;
    }

    if (!razaoSocial.trim()) {
      toast({ title: 'Erro', description: 'Informe a Razão Social', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);

      const data = {
        cnpj: cnpjLimpo,
        razaoSocial: razaoSocial.trim(),
        nomeFantasia: nomeFantasia.trim() || undefined,
        tipo,
        telefone: telefone || undefined,
        email: email || undefined,
        contatoNome: contatoNome || undefined,
        contatoTelefone: contatoTelefone || undefined,
        endereco: endereco || undefined,
        cidade: cidade || undefined,
        uf: uf || undefined,
        cep: cep || undefined,
        condicaoPagamento: condicaoPagamento || undefined,
        prazoEntregaDias: parseInt(prazoEntregaDias) || 30,
        observacoes: observacoes || undefined,
      };

      let resultado: FornecedorInterface;

      if (fornecedor?.id) {
        resultado = await FornecedorService.atualizar(fornecedor.id, data);
      } else {
        resultado = await FornecedorService.criar(data);
      }

      toast({
        title: 'Sucesso',
        description: `Fornecedor ${fornecedor ? 'atualizado' : 'cadastrado'} com sucesso!`,
      });

      onSuccess(resultado);
      onOpenChange(false);
      limparCampos();
    } catch (error: any) {
      console.error('Erro ao salvar fornecedor:', error);
      const msg = error?.response?.data?.message;
      toast({
        title: 'Erro',
        description: Array.isArray(msg) ? msg.join(', ') : msg || 'Não foi possível salvar o fornecedor',
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
          <DialogTitle>{fornecedor ? 'Editar' : 'Novo'} Fornecedor</DialogTitle>
          <DialogDescription>
            Preencha os dados do fornecedor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dados principais */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>CNPJ *</Label>
              <Input
                value={cnpj}
                onChange={(e) => setCnpj(formatarCNPJ(e.target.value))}
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
            </div>
            <div className="col-span-2">
              <Label>Razão Social *</Label>
              <Input
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                placeholder="Ex: Empresa LTDA"
                required
              />
            </div>
            <div>
              <Label>Nome Fantasia</Label>
              <Input
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                placeholder="Ex: Empresa"
              />
            </div>
            <div>
              <Label>Tipo *</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoFornecedor)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TipoFornecedorLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contato */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Telefone</Label>
              <Input
                value={telefone}
                onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                placeholder="(XX) XXXXX-XXXX"
                maxLength={15}
              />
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
            <div>
              <Label>Nome do Contato</Label>
              <Input
                value={contatoNome}
                onChange={(e) => setContatoNome(e.target.value)}
                placeholder="Ex: João Silva"
              />
            </div>
            <div>
              <Label>Telefone do Contato</Label>
              <Input
                value={contatoTelefone}
                onChange={(e) => setContatoTelefone(formatarTelefone(e.target.value))}
                placeholder="(XX) XXXXX-XXXX"
                maxLength={15}
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Endereço</Label>
              <Input
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Ex: Rua das Flores, 123"
              />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Ex: São Paulo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>UF</Label>
                <Input
                  value={uf}
                  onChange={(e) => setUf(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
              <div>
                <Label>CEP</Label>
                <Input
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
            </div>
          </div>

          {/* Comercial */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Condição de Pagamento</Label>
              <Input
                value={condicaoPagamento}
                onChange={(e) => setCondicaoPagamento(e.target.value)}
                placeholder="Ex: 30/60/90 dias"
              />
            </div>
            <div>
              <Label>Prazo de Entrega (dias)</Label>
              <Input
                type="number"
                value={prazoEntregaDias}
                onChange={(e) => setPrazoEntregaDias(e.target.value)}
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Especialidade, região de atendimento..."
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
