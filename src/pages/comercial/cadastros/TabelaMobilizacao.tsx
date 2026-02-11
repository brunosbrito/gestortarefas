import { useState, useEffect } from 'react';
import {
  Truck,
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
import MobilizacaoFormDialog from '@/components/comercial/cadastros/mobilizacao/MobilizacaoFormDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import MobilizacaoService from '@/services/MobilizacaoService';
import {
  ItemMobilizacaoInterface,
  TipoMobilizacao,
  TipoMobilizacaoLabels,
  CategoriaMobilizacao,
  CategoriaMobilizacaoLabels,
} from '@/interfaces/MobilizacaoInterface';
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

const TabelaMobilizacao = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [itens, setItens] = useState<ItemMobilizacaoInterface[]>([]);
  const [itensFiltrados, setItensFiltrados] = useState<ItemMobilizacaoInterface[]>([]);
  const [itemSelecionado, setItemSelecionado] = useState<ItemMobilizacaoInterface | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [itemParaDeletar, setItemParaDeletar] = useState<ItemMobilizacaoInterface | null>(null);
  const [itemParaVisualizar, setItemParaVisualizar] = useState<ItemMobilizacaoInterface | null>(null);

  // Aba ativa
  const [tipoAtivo, setTipoAtivo] = useState<TipoMobilizacao>(TipoMobilizacao.MOBILIZACAO);

  // Filtros
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');

  // Ordenação
  type SortField = 'codigo' | 'descricao' | 'categoria' | 'precoUnitario';
  type SortDirection = 'asc' | 'desc' | null;
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Paginação
  const [itensPorPagina, setItensPorPagina] = useState<number>(25);
  const [paginaAtual, setPaginaAtual] = useState<number>(1);

  useEffect(() => {
    carregarItens();
  }, []);

  useEffect(() => {
    aplicarFiltros();
    setPaginaAtual(1); // Volta para primeira página ao alterar filtros
  }, [busca, categoriaFiltro, itens, sortField, sortDirection, tipoAtivo]);

  // Calcular itens da página atual
  const totalPaginas = Math.ceil(itensFiltrados.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const itensPaginados = itensFiltrados.slice(indiceInicial, indiceFinal);

  // Resetar para página 1 ao mudar itens por página
  useEffect(() => {
    setPaginaAtual(1);
  }, [itensPorPagina]);

  const carregarItens = async () => {
    try {
      setLoading(true);
      const data = await MobilizacaoService.getAll({ ativo: true });
      setItens(data);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os itens',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...itens];

    // Filtrar por tipo (aba ativa)
    resultado = resultado.filter((item) => item.tipo === tipoAtivo);

    // Filtro de busca
    if (busca) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (item) =>
          item.codigo.toLowerCase().includes(buscaLower) ||
          item.descricao.toLowerCase().includes(buscaLower)
      );
    }

    // Filtro de categoria
    if (categoriaFiltro !== 'todos') {
      resultado = resultado.filter((item) => item.categoria === categoriaFiltro);
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
            aValue = CategoriaMobilizacaoLabels[a.categoria].toLowerCase();
            bValue = CategoriaMobilizacaoLabels[b.categoria].toLowerCase();
            break;
          case 'precoUnitario':
            aValue = a.precoUnitario || 0;
            bValue = b.precoUnitario || 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setItensFiltrados(resultado);
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
    if (!itemParaDeletar?.id) return;

    try {
      await MobilizacaoService.delete(itemParaDeletar.id);
      toast({
        title: 'Sucesso',
        description: 'Item deletado com sucesso',
      });
      carregarItens();
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar o item',
        variant: 'destructive',
      });
    } finally {
      setItemParaDeletar(null);
    }
  };

  const handleVisualizar = (item: ItemMobilizacaoInterface) => {
    setItemParaVisualizar(item);
  };

  const handleNovo = () => {
    setItemSelecionado(null);
    setDialogAberto(true);
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

  const getCategoriaColor = (categoria: CategoriaMobilizacao): string => {
    switch (categoria) {
      case CategoriaMobilizacao.TRANSPORTE:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case CategoriaMobilizacao.MONTAGEM_CANTEIRO:
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case CategoriaMobilizacao.EQUIPAMENTOS:
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case CategoriaMobilizacao.OUTROS:
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

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
                <Truck className="h-6 w-6 text-blue-600" />
                <CardTitle>Mobilização / Desmobilização</CardTitle>
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
                <Button onClick={handleNovo}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Item
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {/* Abas */}
            <Tabs value={tipoAtivo} onValueChange={(value) => setTipoAtivo(value as TipoMobilizacao)}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value={TipoMobilizacao.MOBILIZACAO}>
                  Mobilização
                </TabsTrigger>
                <TabsTrigger value={TipoMobilizacao.DESMOBILIZACAO}>
                  Desmobilização
                </TabsTrigger>
              </TabsList>

              {/* Conteúdo compartilhado entre as abas */}
              <TabsContent value={tipoAtivo} className="space-y-4">
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                        {Object.entries(CategoriaMobilizacao).map(([key, value]) => (
                          <SelectItem key={value} value={value}>
                            {CategoriaMobilizacaoLabels[value]}
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
                        <TableHead className="text-xs text-center w-28">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itensFiltrados.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Nenhum item encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        itensPaginados.map((item, index) => (
                          <TableRow key={item.id} className="hover:bg-muted/30">
                            <TableCell className="border-r text-center text-muted-foreground font-mono text-xs py-2">
                              {indiceInicial + index + 1}
                            </TableCell>
                            <TableCell className="border-r font-medium font-mono text-xs py-2">
                              {item.codigo}
                            </TableCell>
                            <TableCell className="border-r max-w-[350px] truncate text-xs py-2">
                              {item.descricao}
                            </TableCell>
                            <TableCell className="border-r py-2">
                              <Badge className={`${getCategoriaColor(item.categoria)} text-xs px-1.5 py-0`}>
                                {CategoriaMobilizacaoLabels[item.categoria]}
                              </Badge>
                            </TableCell>
                            <TableCell className="border-r text-center text-xs py-2">
                              {item.unidade}
                            </TableCell>
                            <TableCell className="border-r text-right font-medium text-xs py-2">
                              {formatCurrency(item.precoUnitario)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleVisualizar(item)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setItemSelecionado(item);
                                    setDialogAberto(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setItemParaDeletar(item)}
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
                      Mostrando {itensFiltrados.length === 0 ? 0 : indiceInicial + 1} a{' '}
                      {Math.min(indiceFinal, itensFiltrados.length)} de {itensFiltrados.length} itens
                      {itensFiltrados.length !== itens.filter((i) => i.tipo === tipoAtivo).length && (
                        <span className="text-xs">
                          {' '}
                          (filtrados de {itens.filter((i) => i.tipo === tipoAtivo).length} totais)
                        </span>
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={!!itemParaDeletar} onOpenChange={() => setItemParaDeletar(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o item <strong>{itemParaDeletar?.codigo}</strong>?
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
        <Dialog open={!!itemParaVisualizar} onOpenChange={() => setItemParaVisualizar(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Item</DialogTitle>
              <DialogDescription>Informações completas do item</DialogDescription>
            </DialogHeader>
            {itemParaVisualizar && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Tipo</Label>
                    <p className="font-medium">{TipoMobilizacaoLabels[itemParaVisualizar.tipo]}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Código</Label>
                    <p className="font-medium">{itemParaVisualizar.codigo}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Categoria</Label>
                    <p className="font-medium">
                      {CategoriaMobilizacaoLabels[itemParaVisualizar.categoria]}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Unidade</Label>
                    <p className="font-medium">{itemParaVisualizar.unidade}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Preço Unitário</Label>
                    <p className="font-medium">{formatCurrency(itemParaVisualizar.precoUnitario)}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="font-medium">{itemParaVisualizar.descricao}</p>
                </div>
                {itemParaVisualizar.observacoes && (
                  <div>
                    <Label className="text-muted-foreground">Observações</Label>
                    <p className="text-sm">{itemParaVisualizar.observacoes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Formulário (Add/Edit) */}
        <MobilizacaoFormDialog
          open={dialogAberto}
          onOpenChange={setDialogAberto}
          item={itemSelecionado}
          tipoInicial={tipoAtivo}
          onSalvar={() => { setDialogAberto(false); carregarItens(); }}
        />
      </div>
    </Layout>
  );
};

export default TabelaMobilizacao;
