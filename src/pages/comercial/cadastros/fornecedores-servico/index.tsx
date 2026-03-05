import { useState, useEffect } from 'react';
import { Factory, Plus, Edit, Trash2, RefreshCw, Eye, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import FornecedorService from '@/services/FornecedorServicoService';
import {
  FornecedorInterface,
  TipoFornecedor,
  TipoFornecedorLabels,
  TipoFornecedorColors,
  getNomeFornecedor,
} from '@/interfaces/FornecedorServicoInterface';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import FormularioFornecedor from '@/components/gerenciamento/fornecedores/FormularioFornecedor';

const TabelaFornecedoresServico = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [fornecedores, setFornecedores] = useState<FornecedorInterface[]>([]);
  const [fornecedoresFiltrados, setFornecedoresFiltrados] = useState<FornecedorInterface[]>([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<FornecedorInterface | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [fornecedorParaDeletar, setFornecedorParaDeletar] = useState<FornecedorInterface | null>(null);
  const [fornecedorParaVisualizar, setFornecedorParaVisualizar] = useState<FornecedorInterface | null>(null);

  // Filtros
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');

  useEffect(() => {
    carregarFornecedores();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [busca, tipoFiltro, fornecedores]);

  const carregarFornecedores = async () => {
    try {
      setLoading(true);
      const data = await FornecedorService.listar();
      setFornecedores(data);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os fornecedores',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarFornecedor = () => {
    carregarFornecedores();
  };

  const aplicarFiltros = () => {
    let resultado = [...fornecedores];

    if (busca) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (f) =>
          getNomeFornecedor(f).toLowerCase().includes(buscaLower) ||
          f.razaoSocial.toLowerCase().includes(buscaLower) ||
          (f.cnpj && f.cnpj.includes(busca)) ||
          (f.contatoNome && f.contatoNome.toLowerCase().includes(buscaLower)) ||
          (f.email && f.email.toLowerCase().includes(buscaLower))
      );
    }

    if (tipoFiltro !== 'todos') {
      resultado = resultado.filter((f) => f.tipo === tipoFiltro);
    }

    setFornecedoresFiltrados(resultado);
  };

  const handleDeletar = async () => {
    if (!fornecedorParaDeletar?.id) return;

    try {
      await FornecedorService.excluir(fornecedorParaDeletar.id);

      toast({
        title: 'Sucesso',
        description: 'Fornecedor deletado com sucesso',
      });
      carregarFornecedores();
    } catch (error) {
      console.error('Erro ao deletar fornecedor:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar o fornecedor',
        variant: 'destructive',
      });
    } finally {
      setFornecedorParaDeletar(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Factory className="h-6 w-6 text-blue-600" />
                <CardTitle>Fornecedores</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { setFornecedorSelecionado(null); setDialogAberto(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Fornecedor
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome, CNPJ, contato ou email..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {(Object.keys(TipoFornecedorLabels) as TipoFornecedor[]).map((t) => (
                      <SelectItem key={t} value={t}>{TipoFornecedorLabels[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={() => { setBusca(''); setTipoFiltro('todos'); }}>
                  Limpar Filtros
                </Button>
              </div>
            </div>

            {/* Tabela */}
            <div className="border rounded-lg">
              <TableComponent>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fornecedoresFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum fornecedor encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    fornecedoresFiltrados.map((fornecedor) => (
                      <TableRow key={fornecedor.id}>
                        <TableCell className="font-medium">
                          <div>
                            <span>{getNomeFornecedor(fornecedor)}</span>
                            {fornecedor.nomeFantasia && fornecedor.nomeFantasia !== fornecedor.razaoSocial && (
                              <p className="text-xs text-muted-foreground">{fornecedor.razaoSocial}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${TipoFornecedorColors[fornecedor.tipo]}`}>
                            {TipoFornecedorLabels[fornecedor.tipo]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{fornecedor.cnpj || '-'}</TableCell>
                        <TableCell>{fornecedor.contatoNome || '-'}</TableCell>
                        <TableCell>{fornecedor.telefone || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setFornecedorParaVisualizar(fornecedor)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setFornecedorSelecionado(fornecedor); setDialogAberto(true); }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setFornecedorParaDeletar(fornecedor)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableComponent>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Mostrando {fornecedoresFiltrados.length} de {fornecedores.length} fornecedores
            </div>
          </CardContent>
        </Card>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={!!fornecedorParaDeletar} onOpenChange={() => setFornecedorParaDeletar(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o fornecedor <strong>{fornecedorParaDeletar ? getNomeFornecedor(fornecedorParaDeletar) : ''}</strong>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletar} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de Visualização */}
        <Dialog open={!!fornecedorParaVisualizar} onOpenChange={() => setFornecedorParaVisualizar(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Fornecedor</DialogTitle>
              <DialogDescription>Informações completas do fornecedor</DialogDescription>
            </DialogHeader>
            {fornecedorParaVisualizar && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nome Fantasia</Label>
                    <p className="font-medium">{fornecedorParaVisualizar.nomeFantasia || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Razão Social</Label>
                    <p className="font-medium">{fornecedorParaVisualizar.razaoSocial}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">CNPJ</Label>
                    <p className="font-medium">{fornecedorParaVisualizar.cnpj}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Tipo</Label>
                    <Badge className={`text-xs ${TipoFornecedorColors[fornecedorParaVisualizar.tipo]}`}>
                      {TipoFornecedorLabels[fornecedorParaVisualizar.tipo]}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Telefone</Label>
                    <p className="font-medium">{fornecedorParaVisualizar.telefone || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{fornecedorParaVisualizar.email || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Contato</Label>
                    <p className="font-medium">{fornecedorParaVisualizar.contatoNome || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Tel. Contato</Label>
                    <p className="font-medium">{fornecedorParaVisualizar.contatoTelefone || '-'}</p>
                  </div>
                </div>
                {(fornecedorParaVisualizar.endereco || fornecedorParaVisualizar.cidade) && (
                  <div>
                    <Label className="text-muted-foreground">Endereço</Label>
                    <p className="font-medium">
                      {[fornecedorParaVisualizar.endereco, fornecedorParaVisualizar.cidade, fornecedorParaVisualizar.uf]
                        .filter(Boolean)
                        .join(', ')}
                      {fornecedorParaVisualizar.cep && ` - CEP: ${fornecedorParaVisualizar.cep}`}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Condição de Pagamento</Label>
                    <p className="font-medium">{fornecedorParaVisualizar.condicaoPagamento || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Prazo de Entrega</Label>
                    <p className="font-medium">{fornecedorParaVisualizar.prazoEntregaDias ?? 30} dias</p>
                  </div>
                </div>
                {fornecedorParaVisualizar.observacoes && (
                  <div>
                    <Label className="text-muted-foreground">Observações</Label>
                    <p className="text-sm">{fornecedorParaVisualizar.observacoes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Formulário de Cadastro/Edição */}
        <FormularioFornecedor
          open={dialogAberto}
          onOpenChange={setDialogAberto}
          fornecedor={fornecedorSelecionado}
          onSuccess={handleSalvarFornecedor}
        />
    </div>
  );
};

export default TabelaFornecedoresServico;
