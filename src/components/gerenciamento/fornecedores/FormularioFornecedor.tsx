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
import { FornecedorServicoInterface } from '@/interfaces/FornecedorServicoInterface';
import { useToast } from '@/hooks/use-toast';
import FornecedorServicoService from '@/services/FornecedorServicoService';

interface FormularioFornecedorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedor?: FornecedorServicoInterface | null;
  onSuccess: (novoFornecedor?: FornecedorServicoInterface) => void;
}

const FormularioFornecedor = ({ open, onOpenChange, fornecedor, onSuccess }: FormularioFornecedorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [valorJateamento, setValorJateamento] = useState('');
  const [valorPintura, setValorPintura] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Preencher campos ao editar
  useEffect(() => {
    if (fornecedor) {
      setNome(fornecedor.nome);
      setContato(fornecedor.contato || '');
      setTelefone(fornecedor.telefone || '');
      setEmail(fornecedor.email || '');
      setValorJateamento(String(fornecedor.valorJateamentoM2));
      setValorPintura(String(fornecedor.valorPinturaM2));
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
    setValorJateamento('');
    setValorPintura('');
    setObservacoes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!nome || !valorJateamento || !valorPintura) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    const valJat = parseFloat(valorJateamento);
    const valPint = parseFloat(valorPintura);

    if (valJat <= 0 || valPint <= 0) {
      toast({
        title: 'Erro',
        description: 'Valores de jateamento e pintura devem ser maiores que zero',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const data: FornecedorServicoInterface = {
        id: fornecedor?.id || Date.now(), // MOCK: usar timestamp como ID
        nome,
        contato: contato || undefined,
        telefone: telefone || undefined,
        email: email || undefined,
        valorJateamentoM2: valJat,
        valorPinturaM2: valPint,
        observacoes: observacoes || undefined,
        ativo: true,
      };

      // MOCK: Simular salvamento
      console.log('MOCK: Salvando fornecedor:', data);

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

      onSuccess(data); // Passa o fornecedor criado/editado de volta
      onOpenChange(false);
      limparCampos();
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o fornecedor',
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
          <DialogTitle>{fornecedor ? 'Editar' : 'Novo'} Fornecedor de Serviço</DialogTitle>
          <DialogDescription>
            Preencha os dados do fornecedor de jateamento e pintura
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome do Fornecedor *</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Jateamento & Pintura São Paulo LTDA"
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
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Ex: (11) 98765-4321"
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

          <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-blue-50/30 dark:bg-blue-950/20">
            <div>
              <Label>Valor Jateamento (R$/m²) *</Label>
              <Input
                type="number"
                step="0.01"
                value={valorJateamento}
                onChange={(e) => setValorJateamento(e.target.value)}
                placeholder="Ex: 35.00"
                required
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
                required
              />
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Prazo médio 5 dias úteis"
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
              {loading ? 'Salvando...' : fornecedor ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormularioFornecedor;
