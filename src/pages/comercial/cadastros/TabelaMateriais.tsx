import { useState, useEffect } from 'react';
import {
  Package,
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
import MaterialFormDialog from '@/components/comercial/cadastros/materiais/MaterialFormDialog';
import PopularMateriaisButton from '@/components/comercial/cadastros/materiais/PopularMateriaisButton';
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
import MaterialCatalogoService from '@/services/MaterialCatalogoService';
import {
  MaterialCatalogoInterface,
  MaterialCategoria,
  MaterialCategoriaLabels,
  MaterialCategoriaGrupos,
} from '@/interfaces/MaterialCatalogoInterface';
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

const TabelaMateriais = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [materiais, setMateriais] = useState<MaterialCatalogoInterface[]>([]);
  const [materiaisFiltrados, setMateriaisFiltrados] = useState<MaterialCatalogoInterface[]>([]);
  const [materialSelecionado, setMaterialSelecionado] = useState<MaterialCatalogoInterface | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [materialParaDeletar, setMaterialParaDeletar] = useState<MaterialCatalogoInterface | null>(null);
  const [materialParaVisualizar, setMaterialParaVisualizar] = useState<MaterialCatalogoInterface | null>(null);

  // Filtros
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  const [fornecedorFiltro, setFornecedorFiltro] = useState<string>('todos');

  // Ordenação
  type SortField = 'codigo' | 'descricao' | 'categoria' | 'fornecedor' | 'precoKg' | 'precoTotal' | 'area' | 'peso';
  type SortDirection = 'asc' | 'desc' | null;
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Paginação
  const [itensPorPagina, setItensPorPagina] = useState<number>(25);
  const [paginaAtual, setPaginaAtual] = useState<number>(1);

  useEffect(() => {
    carregarMateriais();
  }, []);

  useEffect(() => {
    aplicarFiltros();
    setPaginaAtual(1); // Volta para primeira página ao alterar filtros
  }, [busca, categoriaFiltro, fornecedorFiltro, materiais, sortField, sortDirection]);

  // Calcular itens da página atual
  const totalPaginas = Math.ceil(materiaisFiltrados.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const materiaisPaginados = materiaisFiltrados.slice(indiceInicial, indiceFinal);

  // Resetar para página 1 ao mudar itens por página
  useEffect(() => {
    setPaginaAtual(1);
  }, [itensPorPagina]);

  const carregarMateriais = async () => {
    try {
      setLoading(true);
      const data = await MaterialCatalogoService.listar({ ativo: true });
      setMateriais(data);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os materiais',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...materiais];

    // Filtro de busca
    if (busca) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (m) =>
          m.codigo.toLowerCase().includes(buscaLower) ||
          m.descricao.toLowerCase().includes(buscaLower)
      );
    }

    // Filtro de categoria
    if (categoriaFiltro !== 'todos') {
      resultado = resultado.filter((m) => m.categoria === categoriaFiltro);
    }

    // Filtro de fornecedor
    if (fornecedorFiltro !== 'todos') {
      resultado = resultado.filter((m) => m.fornecedor === fornecedorFiltro);
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
            aValue = MaterialCategoriaLabels[a.categoria].toLowerCase();
            bValue = MaterialCategoriaLabels[b.categoria].toLowerCase();
            break;
          case 'fornecedor':
            aValue = a.fornecedor.toLowerCase();
            bValue = b.fornecedor.toLowerCase();
            break;
          case 'precoKg':
            aValue = a.precoKg || 0;
            bValue = b.precoKg || 0;
            break;
          case 'precoTotal':
            aValue = a.precoUnitario || 0;
            bValue = b.precoUnitario || 0;
            break;
          case 'area':
            aValue = a.areaM2PorMetroLinear || 0;
            bValue = b.areaM2PorMetroLinear || 0;
            break;
          case 'peso':
            aValue = a.pesoNominal || 0;
            bValue = b.pesoNominal || 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setMateriaisFiltrados(resultado);
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
    if (!materialParaDeletar?.id) return;

    try {
      await MaterialCatalogoService.excluir(materialParaDeletar.id);
      toast({
        title: 'Sucesso',
        description: 'Material deletado com sucesso',
      });
      carregarMateriais();
    } catch (error) {
      console.error('Erro ao deletar material:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar o material',
        variant: 'destructive',
      });
    } finally {
      setMaterialParaDeletar(null);
    }
  };

  const handleVisualizar = (material: MaterialCatalogoInterface) => {
    setMaterialParaVisualizar(material);
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

  const getCategoriaGrupo = (categoria: MaterialCategoria): string => {
    for (const [grupo, categorias] of Object.entries(MaterialCategoriaGrupos)) {
      if (categorias.includes(categoria)) {
        return grupo;
      }
    }
    return 'outro';
  };

  const getCategoriaColor = (categoria: MaterialCategoria): string => {
    const grupo = getCategoriaGrupo(categoria);
    switch (grupo) {
      case 'perfis':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'barras':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'tubos':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'chapas':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'telhas':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'parafusos':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const fornecedores = ['Gerdau', 'Açotel', 'Ciser'];

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
                <Package className="h-6 w-6 text-blue-600" />
                <CardTitle>Catálogo de Materiais</CardTitle>
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
                {/* Botão temporário: Limpar localStorage */}
                {materiais.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      localStorage.removeItem('materiais-catalogo-local');
                      window.location.reload();
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Todos
                  </Button>
                )}
                {/* Botão temporário sempre visível para repopular com IDs corretos */}
                <PopularMateriaisButton onComplete={carregarMateriais} />
                <Button onClick={() => { setMaterialSelecionado(null); setDialogAberto(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Material
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
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
                    {Object.entries(MaterialCategoria).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {MaterialCategoriaLabels[value]}
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
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setBusca('');
                    setCategoriaFiltro('todos');
                    setFornecedorFiltro('todos');
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
                      onClick={() => handleSort('precoKg')}
                    >
                      <div className="flex items-center justify-center">
                        R$/kg
                        {getSortIcon('precoKg')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="border-r cursor-pointer hover:bg-muted/50 text-xs"
                      onClick={() => handleSort('precoTotal')}
                    >
                      <div className="flex items-center justify-center">
                        R$/Total
                        {getSortIcon('precoTotal')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="border-r cursor-pointer hover:bg-muted/50 text-xs"
                      onClick={() => handleSort('peso')}
                    >
                      <div className="flex items-center justify-center">
                        Peso
                        {getSortIcon('peso')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="border-r cursor-pointer hover:bg-muted/50 text-xs"
                      onClick={() => handleSort('area')}
                    >
                      <div className="flex items-center justify-center">
                        Área
                        {getSortIcon('area')}
                      </div>
                    </TableHead>
                    <TableHead className="text-xs text-center w-28">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materiaisFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        Nenhum material encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    materiaisPaginados.map((material, index) => (
                      <TableRow key={material.id} className="hover:bg-muted/30">
                        <TableCell className="border-r text-center text-muted-foreground font-mono text-xs py-2">
                          {indiceInicial + index + 1}
                        </TableCell>
                        <TableCell className="border-r font-medium font-mono text-xs py-2">
                          {material.codigo}
                        </TableCell>
                        <TableCell className="border-r max-w-[350px] truncate text-xs py-2">
                          {material.descricao}
                        </TableCell>
                        <TableCell className="border-r py-2">
                          <Badge className={`${getCategoriaColor(material.categoria)} text-xs px-1.5 py-0`}>
                            {MaterialCategoriaLabels[material.categoria]}
                          </Badge>
                        </TableCell>
                        <TableCell className="border-r text-xs py-2">{material.fornecedor}</TableCell>
                        <TableCell className="border-r text-right font-medium text-xs py-2">
                          {material.precoKg ? formatCurrency(material.precoKg) : '-'}
                        </TableCell>
                        <TableCell className="border-r text-right font-medium text-xs py-2">
                          {formatCurrency(material.precoUnitario)}
                        </TableCell>
                        <TableCell className="border-r text-right font-mono text-xs py-2">
                          {material.pesoNominal ? material.pesoNominal.toFixed(2) : '-'}
                        </TableCell>
                        <TableCell className="border-r text-right font-mono text-green-600 font-medium text-xs py-2">
                          {material.areaM2PorMetroLinear
                            ? material.areaM2PorMetroLinear.toFixed(2)
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVisualizar(material)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setMaterialSelecionado(material); setDialogAberto(true); }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setMaterialParaDeletar(material)}
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
                  Mostrando {materiaisFiltrados.length === 0 ? 0 : indiceInicial + 1} a{' '}
                  {Math.min(indiceFinal, materiaisFiltrados.length)} de {materiaisFiltrados.length} materiais
                  {materiaisFiltrados.length !== materiais.length && (
                    <span className="text-xs"> (filtrados de {materiais.length} totais)</span>
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
        <AlertDialog open={!!materialParaDeletar} onOpenChange={() => setMaterialParaDeletar(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o material <strong>{materialParaDeletar?.codigo}</strong>?
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
        <Dialog open={!!materialParaVisualizar} onOpenChange={() => setMaterialParaVisualizar(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Material</DialogTitle>
              <DialogDescription>Informações completas do material</DialogDescription>
            </DialogHeader>
            {materialParaVisualizar && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Código</Label>
                    <p className="font-medium">{materialParaVisualizar.codigo}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Categoria</Label>
                    <p className="font-medium">
                      {MaterialCategoriaLabels[materialParaVisualizar.categoria]}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fornecedor</Label>
                    <p className="font-medium">{materialParaVisualizar.fornecedor}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Preço Unitário</Label>
                    <p className="font-medium">{formatCurrency(materialParaVisualizar.precoUnitario)}</p>
                  </div>
                  {materialParaVisualizar.precoKg && (
                    <div>
                      <Label className="text-muted-foreground">Preço por KG</Label>
                      <p className="font-medium">{formatCurrency(materialParaVisualizar.precoKg)}</p>
                    </div>
                  )}
                  {materialParaVisualizar.pesoNominal && (
                    <div>
                      <Label className="text-muted-foreground">Peso Nominal</Label>
                      <p className="font-medium">{materialParaVisualizar.pesoNominal} kg/{materialParaVisualizar.unidade}</p>
                    </div>
                  )}
                  {materialParaVisualizar.perimetroM != null && (
                    <div>
                      <Label className="text-muted-foreground">Perímetro (Pintura)</Label>
                      <p className="font-medium">{materialParaVisualizar.perimetroM.toFixed(3)} m</p>
                    </div>
                  )}
                  {materialParaVisualizar.areaM2PorMetroLinear != null && (
                    <div>
                      <Label className="text-muted-foreground">Área para Pintura</Label>
                      <p className="font-medium text-lg text-green-600">
                        {materialParaVisualizar.areaM2PorMetroLinear.toFixed(4)} m²/m
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="font-medium">{materialParaVisualizar.descricao}</p>
                </div>
                {materialParaVisualizar.observacoes && (
                  <div>
                    <Label className="text-muted-foreground">Observações</Label>
                    <p className="text-sm">{materialParaVisualizar.observacoes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Formulário (Add/Edit) */}
        <MaterialFormDialog
          open={dialogAberto}
          onOpenChange={setDialogAberto}
          material={materialSelecionado}
          onSalvar={() => { setDialogAberto(false); carregarMateriais(); }}
        />
      </div>
    </Layout>
  );
};

export default TabelaMateriais;
