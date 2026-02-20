import { useState, useEffect } from 'react';
import {
  Box,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  Download,
  Printer,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ConsumivelFormDialog from '@/components/comercial/cadastros/consumiveis/ConsumivelFormDialog';
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
import ConsumivelService from '@/services/ConsumivelService';
import {
  ConsumivelInterface,
  ConsumivelCategoria,
  ConsumivelCategoriaLabels,
  GrupoABC,
  GrupoABCLabels,
} from '@/interfaces/ConsumivelInterface';
import { formatCurrency } from '@/lib/currency';
import Layout from '@/components/Layout';
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

const TabelaConsumiveis = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [consumiveis, setConsumiveis] = useState<ConsumivelInterface[]>([]);
  const [consumiveisFiltrados, setConsumiveisFiltrados] = useState<ConsumivelInterface[]>([]);
  const [consumivelSelecionado, setConsumivelSelecionado] = useState<ConsumivelInterface | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [consumivelParaDeletar, setConsumivelParaDeletar] = useState<ConsumivelInterface | null>(null);
  const [consumivelParaVisualizar, setConsumivelParaVisualizar] = useState<ConsumivelInterface | null>(null);

  // Filtros
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  const [fornecedorFiltro, setFornecedorFiltro] = useState<string>('todos');
  const [grupoABCFiltro, setGrupoABCFiltro] = useState<string>('todos');

  // Ordenação
  type SortField = 'codigo' | 'descricao' | 'categoria' | 'fornecedor' | 'precoUnitario' | 'grupoABC';
  type SortDirection = 'asc' | 'desc' | null;
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Paginação
  const [itensPorPagina, setItensPorPagina] = useState<number>(25);
  const [paginaAtual, setPaginaAtual] = useState<number>(1);

  useEffect(() => {
    carregarConsumiveis();
  }, []);

  useEffect(() => {
    aplicarFiltros();
    setPaginaAtual(1); // Volta para primeira página ao alterar filtros
  }, [busca, categoriaFiltro, fornecedorFiltro, grupoABCFiltro, consumiveis, sortField, sortDirection]);

  // Calcular itens da página atual
  const totalPaginas = Math.ceil(consumiveisFiltrados.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const consumiveisPaginados = consumiveisFiltrados.slice(indiceInicial, indiceFinal);

  // Resetar para página 1 ao mudar itens por página
  useEffect(() => {
    setPaginaAtual(1);
  }, [itensPorPagina]);

  const carregarConsumiveis = async () => {
    try {
      setLoading(true);
      const data = await ConsumivelService.getAll({ ativo: true });
      setConsumiveis(data);
    } catch (error) {
      console.error('Erro ao carregar consumíveis:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os consumíveis',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...consumiveis];

    // Filtro de busca
    if (busca) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (c) =>
          c.codigo.toLowerCase().includes(buscaLower) ||
          c.descricao.toLowerCase().includes(buscaLower)
      );
    }

    // Filtro de categoria
    if (categoriaFiltro !== 'todos') {
      resultado = resultado.filter((c) => c.categoria === categoriaFiltro);
    }

    // Filtro de fornecedor
    if (fornecedorFiltro !== 'todos') {
      resultado = resultado.filter((c) => c.fornecedor === fornecedorFiltro);
    }

    // Filtro de grupo ABC
    if (grupoABCFiltro !== 'todos') {
      resultado = resultado.filter((c) => c.grupoABC === grupoABCFiltro);
    }

    // Ordenação
    if (sortField && sortDirection) {
      resultado.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case 'codigo':
            aValue = a.codigo.toLowerCase();
            bValue = b.codigo.toLowerCase();
            break;
          case 'descricao':
            aValue = a.descricao.toLowerCase();
            bValue = b.descricao.toLowerCase();
            break;
          case 'categoria':
            aValue = ConsumivelCategoriaLabels[a.categoria].toLowerCase();
            bValue = ConsumivelCategoriaLabels[b.categoria].toLowerCase();
            break;
          case 'fornecedor':
            aValue = a.fornecedor.toLowerCase();
            bValue = b.fornecedor.toLowerCase();
            break;
          case 'precoUnitario':
            aValue = a.precoUnitario || 0;
            bValue = b.precoUnitario || 0;
            break;
          case 'grupoABC':
            aValue = a.grupoABC || 'Z';
            bValue = b.grupoABC || 'Z';
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setConsumiveisFiltrados(resultado);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Ciclo: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-3 w-3 ml-1 text-blue-600" />;
    }
    return <ArrowDown className="h-3 w-3 ml-1 text-blue-600" />;
  };

  const handleDeletar = async () => {
    if (!consumivelParaDeletar?.id) return;

    try {
      await ConsumivelService.delete(consumivelParaDeletar.id);
      toast({
        title: 'Sucesso',
        description: 'Consumível deletado com sucesso',
      });
      carregarConsumiveis();
    } catch (error) {
      console.error('Erro ao deletar consumível:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar o consumível',
        variant: 'destructive',
      });
    } finally {
      setConsumivelParaDeletar(null);
    }
  };

  const handleVisualizar = (consumivel: ConsumivelInterface) => {
    setConsumivelParaVisualizar(consumivel);
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleExportar = () => {
    // TODO: Implementar exportação Excel/PDF
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade de exportação em breve',
    });
  };

  const getCategoriaColor = (categoria: ConsumivelCategoria): string => {
    switch (categoria) {
      case ConsumivelCategoria.LIXAS:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case ConsumivelCategoria.DISCOS:
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case ConsumivelCategoria.ELETRODOS:
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case ConsumivelCategoria.EPI:
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case ConsumivelCategoria.FERRAMENTAS:
        return 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300';
      case ConsumivelCategoria.OUTROS:
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getGrupoABCColor = (grupo?: GrupoABC): string => {
    if (!grupo) return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';

    switch (grupo) {
      case GrupoABC.A:
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case GrupoABC.B:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case GrupoABC.C:
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const fornecedores = ['Diversos', 'Nacional', 'Importado'];

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full px-4 py-4 space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="h-6 w-6 text-blue-600" />
                <CardTitle>Cadastro de Consumíveis</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleImprimir}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportar}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={() => { setConsumivelSelecionado(null); setDialogAberto(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Consumível
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
              <div>
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Código ou descrição..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    {Object.entries(ConsumivelCategoria).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {ConsumivelCategoriaLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fornecedor</Label>
                <Select value={fornecedorFiltro} onValueChange={setFornecedorFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {fornecedores.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Grupo ABC</Label>
                <Select value={grupoABCFiltro} onValueChange={setGrupoABCFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {Object.entries(GrupoABC).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {GrupoABCLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setBusca('');
                    setCategoriaFiltro('todos');
                    setFornecedorFiltro('todos');
                    setGrupoABCFiltro('todos');
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>

            {/* Tabela */}
            <div className="border rounded-lg">
              <TableComponent>
                <TableHeader>
                  <TableRow className="border-b-2">
                    <TableHead className="border-r w-12 text-xs text-center">#</TableHead>
                    <TableHead
                      className="border-r cursor-pointer hover:bg-muted/50 text-xs"
                      onClick={() => handleSort('codigo')}
                    >
                      <div className="flex items-center justify-center">
                        Código
                        {getSortIcon('codigo')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="border-r cursor-pointer hover:bg-muted/50 text-xs"
                      onClick={() => handleSort('descricao')}
                    >
                      <div className="flex items-center justify-center">
                        Descrição
                        {getSortIcon('descricao')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="border-r cursor-pointer hover:bg-muted/50 text-xs"
                      onClick={() => handleSort('categoria')}
                    >
                      <div className="flex items-center justify-center">
                        Categoria
                        {getSortIcon('categoria')}
                      </div>
                    </TableHead>
                    <TableHead className="border-r text-xs text-center">Unidade</TableHead>
                    <TableHead
                      className="border-r cursor-pointer hover:bg-muted/50 text-xs"
                      onClick={() => handleSort('precoUnitario')}
                    >
                      <div className="flex items-center justify-center">
                        Preço Unit.
                        {getSortIcon('precoUnitario')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="border-r cursor-pointer hover:bg-muted/50 text-xs"
                      onClick={() => handleSort('fornecedor')}
                    >
                      <div className="flex items-center justify-center">
                        Fornecedor
                        {getSortIcon('fornecedor')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="border-r cursor-pointer hover:bg-muted/50 text-xs"
                      onClick={() => handleSort('grupoABC')}
                    >
                      <div className="flex items-center justify-center">
                        Grupo ABC
                        {getSortIcon('grupoABC')}
                      </div>
                    </TableHead>
                    <TableHead className="text-xs text-center w-28">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consumiveisFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Nenhum consumível encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    consumiveisPaginados.map((consumivel, index) => (
                      <TableRow key={consumivel.id} className="hover:bg-muted/30">
                        <TableCell className="border-r text-center text-muted-foreground font-mono text-xs py-2">
                          {indiceInicial + index + 1}
                        </TableCell>
                        <TableCell className="border-r font-medium font-mono text-xs py-2">
                          {consumivel.codigo}
                        </TableCell>
                        <TableCell className="border-r max-w-[300px] truncate text-xs py-2">
                          {consumivel.descricao}
                        </TableCell>
                        <TableCell className="border-r py-2">
                          <Badge className={`${getCategoriaColor(consumivel.categoria)} text-xs px-1.5 py-0`}>
                            {ConsumivelCategoriaLabels[consumivel.categoria]}
                          </Badge>
                        </TableCell>
                        <TableCell className="border-r text-center text-xs py-2">
                          {consumivel.unidade}
                        </TableCell>
                        <TableCell className="border-r text-right font-medium text-xs py-2">
                          {formatCurrency(consumivel.precoUnitario)}
                        </TableCell>
                        <TableCell className="border-r text-xs py-2">{consumivel.fornecedor}</TableCell>
                        <TableCell className="border-r text-center py-2">
                          {consumivel.grupoABC ? (
                            <Badge className={`${getGrupoABCColor(consumivel.grupoABC)} text-xs px-1.5 py-0 font-bold`}>
                              {consumivel.grupoABC}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVisualizar(consumivel)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setConsumivelSelecionado(consumivel); setDialogAberto(true); }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConsumivelParaDeletar(consumivel)}
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

            {/* Paginação */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {consumiveisFiltrados.length === 0 ? 0 : indiceInicial + 1} a{' '}
                  {Math.min(indiceFinal, consumiveisFiltrados.length)} de {consumiveisFiltrados.length} consumíveis
                  {consumiveisFiltrados.length !== consumiveis.length && (
                    <span className="text-xs"> (filtrados de {consumiveis.length} totais)</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Itens por página:</Label>
                  <Select
                    value={itensPorPagina.toString()}
                    onValueChange={(value) => setItensPorPagina(Number(value))}
                  >
                    <SelectTrigger className="w-20 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="75">75</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {totalPaginas > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtual((prev) => Math.max(1, prev - 1))}
                    disabled={paginaAtual === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Página {paginaAtual} de {totalPaginas}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtual((prev) => Math.min(totalPaginas, prev + 1))}
                    disabled={paginaAtual === totalPaginas}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={!!consumivelParaDeletar} onOpenChange={() => setConsumivelParaDeletar(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o consumível <strong>{consumivelParaDeletar?.codigo}</strong>?
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
        <Dialog open={!!consumivelParaVisualizar} onOpenChange={() => setConsumivelParaVisualizar(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Consumível</DialogTitle>
              <DialogDescription>Informações completas do consumível</DialogDescription>
            </DialogHeader>
            {consumivelParaVisualizar && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Código</Label>
                    <p className="font-medium">{consumivelParaVisualizar.codigo}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Categoria</Label>
                    <p className="font-medium">
                      {ConsumivelCategoriaLabels[consumivelParaVisualizar.categoria]}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Unidade</Label>
                    <p className="font-medium">{consumivelParaVisualizar.unidade}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Preço Unitário</Label>
                    <p className="font-medium">{formatCurrency(consumivelParaVisualizar.precoUnitario)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fornecedor</Label>
                    <p className="font-medium">{consumivelParaVisualizar.fornecedor}</p>
                  </div>
                  {consumivelParaVisualizar.grupoABC && (
                    <div>
                      <Label className="text-muted-foreground">Grupo ABC (Curva ABC)</Label>
                      <p className="font-medium text-lg">
                        <Badge className={`${getGrupoABCColor(consumivelParaVisualizar.grupoABC)} font-bold`}>
                          {GrupoABCLabels[consumivelParaVisualizar.grupoABC]}
                        </Badge>
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="font-medium">{consumivelParaVisualizar.descricao}</p>
                </div>
                {consumivelParaVisualizar.observacoes && (
                  <div>
                    <Label className="text-muted-foreground">Observações</Label>
                    <p className="text-sm">{consumivelParaVisualizar.observacoes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Formulário (Add/Edit) */}
        <ConsumivelFormDialog
          open={dialogAberto}
          onOpenChange={setDialogAberto}
          consumivel={consumivelSelecionado}
          onSalvar={() => { setDialogAberto(false); carregarConsumiveis(); }}
        />
      </div>
    </Layout>
  );
};

export default TabelaConsumiveis;
