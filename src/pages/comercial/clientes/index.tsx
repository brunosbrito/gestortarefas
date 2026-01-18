import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Users,
  Filter,
  X,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  Search,
  Building2,
  User as UserIcon,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import ClienteService from '@/services/ClienteService';
import { Cliente } from '@/interfaces/ClienteInterface';
import { useToast } from '@/hooks/use-toast';
import ClienteFormDialog from './components/ClienteFormDialog';
import ClienteDetalhesDialog from './components/ClienteDetalhesDialog';

type SortField = 'razaoSocial' | 'cnpj' | 'cpf' | 'cidade';
type SortOrder = 'asc' | 'desc';

const ClientesPage = () => {
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroTipoPessoa, setFiltroTipoPessoa] = useState<string>('todos');
  const [filtroAtivo, setFiltroAtivo] = useState<string>('todos');
  const [sortField, setSortField] = useState<SortField>('razaoSocial');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(25);

  // Dialogs
  const [dialogForm, setDialogForm] = useState(false);
  const [dialogDetalhes, setDialogDetalhes] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const data = await ClienteService.getAll();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os clientes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNovo = () => {
    setClienteSelecionado(null);
    setModoEdicao(false);
    setDialogForm(true);
  };

  const handleEditar = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setModoEdicao(true);
    setDialogForm(true);
  };

  const handleVerDetalhes = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setDialogDetalhes(true);
  };

  const handleDeletar = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja deletar o cliente "${nome}"?`)) return;

    try {
      await ClienteService.delete(id);
      toast({
        title: 'Sucesso',
        description: 'Cliente deletado com sucesso',
      });
      carregarClientes();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao deletar cliente',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAtivo = async (cliente: Cliente) => {
    try {
      await ClienteService.toggleAtivo(cliente.id);
      toast({
        title: 'Sucesso',
        description: `Cliente ${cliente.ativo ? 'desativado' : 'ativado'} com sucesso`,
      });
      carregarClientes();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status do cliente',
        variant: 'destructive',
      });
    }
  };

  // Filtros
  const clientesFiltrados = clientes.filter((cliente) => {
    const matchBusca =
      cliente.razaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.nomeFantasia?.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.cnpj?.includes(busca) ||
      cliente.cpf?.includes(busca) ||
      cliente.enderecoPrincipal.cidade.toLowerCase().includes(busca.toLowerCase());

    const matchTipo =
      filtroTipoPessoa === 'todos' || cliente.tipoPessoa === filtroTipoPessoa;

    const matchAtivo =
      filtroAtivo === 'todos' ||
      (filtroAtivo === 'ativo' && cliente.ativo) ||
      (filtroAtivo === 'inativo' && !cliente.ativo);

    return matchBusca && matchTipo && matchAtivo;
  });

  // Ordenação
  const clientesOrdenados = [...clientesFiltrados].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'razaoSocial':
        comparison = a.razaoSocial.localeCompare(b.razaoSocial);
        break;
      case 'cnpj':
        comparison = (a.cnpj || '').localeCompare(b.cnpj || '');
        break;
      case 'cpf':
        comparison = (a.cpf || '').localeCompare(b.cpf || '');
        break;
      case 'cidade':
        comparison = a.enderecoPrincipal.cidade.localeCompare(b.enderecoPrincipal.cidade);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Paginação
  const totalPaginas = Math.ceil(clientesOrdenados.length / itensPorPagina);
  const indexInicio = (paginaAtual - 1) * itensPorPagina;
  const indexFim = indexInicio + itensPorPagina;
  const clientesPaginados = clientesOrdenados.slice(indexInicio, indexFim);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const limparFiltros = () => {
    setBusca('');
    setFiltroTipoPessoa('todos');
    setFiltroAtivo('todos');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            Clientes
          </h1>
          <p className="text-muted-foreground mt-1">
            Cadastro completo com integração CNPJ/CPF e CEP
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome, CNPJ, CPF ou cidade..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select value={filtroTipoPessoa} onValueChange={setFiltroTipoPessoa}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="juridica">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Pessoa Jurídica
                    </div>
                  </SelectItem>
                  <SelectItem value="fisica">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Pessoa Física
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filtroAtivo} onValueChange={setFiltroAtivo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={limparFiltros}>
              <X className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          {/* Header da Tabela */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold">Clientes Cadastrados</h3>
                <p className="text-sm text-muted-foreground">
                  Total de {clientesOrdenados.length} registros
                </p>
              </div>
              <Badge variant="outline" className="ml-2">
                {clientesOrdenados.length}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNovo}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Tipo</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('razaoSocial')}
                      className="font-semibold"
                    >
                      Razão Social / Nome
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('cnpj')}
                      className="font-semibold"
                    >
                      CNPJ / CPF
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('cidade')}
                      className="font-semibold"
                    >
                      Cidade / UF
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesPaginados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  clientesPaginados.map((cliente) => (
                    <TableRow key={cliente.id} className="hover:bg-muted/50">
                      <TableCell>
                        {cliente.tipoPessoa === 'juridica' ? (
                          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <UserIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{cliente.razaoSocial}</p>
                          {cliente.nomeFantasia && (
                            <p className="text-sm text-muted-foreground">
                              {cliente.nomeFantasia}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {cliente.cnpj || cliente.cpf}
                      </TableCell>
                      <TableCell>
                        {cliente.enderecoPrincipal.cidade} / {cliente.enderecoPrincipal.uf}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{cliente.telefone}</p>
                          <p className="text-muted-foreground">{cliente.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            cliente.ativo
                              ? 'bg-green-50 text-green-700 border-green-300'
                              : 'bg-red-50 text-red-700 border-red-300'
                          }
                        >
                          {cliente.ativo ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inativo
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleVerDetalhes(cliente)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditar(cliente)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleAtivo(cliente)}
                          >
                            {cliente.ativo ? (
                              <XCircle className="h-4 w-4 text-orange-600" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeletar(cliente.id, cliente.razaoSocial)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {indexInicio + 1}-{Math.min(indexFim, clientesOrdenados.length)} de{' '}
              {clientesOrdenados.length}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Por página:</label>
              <Select
                value={itensPorPagina.toString()}
                onValueChange={(v) => {
                  setItensPorPagina(Number(v));
                  setPaginaAtual(1);
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                  disabled={paginaAtual === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                  disabled={paginaAtual === totalPaginas}
                >
                  Próximo
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ClienteFormDialog
        open={dialogForm}
        onOpenChange={setDialogForm}
        cliente={clienteSelecionado}
        onSaveSuccess={carregarClientes}
      />

      {clienteSelecionado && (
        <ClienteDetalhesDialog
          open={dialogDetalhes}
          onOpenChange={setDialogDetalhes}
          cliente={clienteSelecionado}
          onEdit={handleEditar}
          onDelete={handleDeletar}
        />
      )}
    </div>
  );
};

export default ClientesPage;
