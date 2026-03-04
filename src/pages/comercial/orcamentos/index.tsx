import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, FileText, Filter, X, Eye, Copy, Trash2, ArrowUpDown, ChevronRight, Wrench, Package, ArrowLeft } from 'lucide-react';
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
import OrcamentoService from '@/services/OrcamentoService';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import { formatCurrency, formatPercentage } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';
import { containsNormalized } from '@/lib/normalizeText';

type SortField = 'numero' | 'nome' | 'totalVenda' | 'margemLiquida' | 'bdiMedio';
type SortOrder = 'asc' | 'desc';

const OrcamentosListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroViabilidade, setFiltroViabilidade] = useState<string>('todos');
  const [deletarItem, setDeletarItem] = useState<{ id: string; nome: string } | null>(null);
  const [sortField, setSortField] = useState<SortField>('numero');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(25);

  useEffect(() => {
    carregarOrcamentos();
  }, []);

  const carregarOrcamentos = async () => {
    try {
      setLoading(true);
      const data = await OrcamentoService.getAll();
      setOrcamentos(data);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os orçamentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClonar = async (id: string) => {
    try {
      const clonado = await OrcamentoService.clonar(id);
      toast({
        title: 'Sucesso',
        description: 'Orçamento clonado com sucesso',
      });
      carregarOrcamentos();
      navigate(`/comercial/orcamentos/${clonado.id}`);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao clonar orçamento',
        variant: 'destructive',
      });
    }
  };

  const handleDeletar = (id: string, nome: string) => {
    setDeletarItem({ id, nome });
  };

  const handleConfirmarDeletar = async () => {
    if (!deletarItem) return;
    try {
      await OrcamentoService.delete(deletarItem.id);
      toast({ title: 'Sucesso', description: 'Orçamento deletado com sucesso' });
      carregarOrcamentos();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao deletar orçamento', variant: 'destructive' });
    } finally {
      setDeletarItem(null);
    }
  };

  const getStatusViabilidade = (dre: Orcamento['dre']) => {
    if (dre.lucroLiquido < 0) {
      return { label: 'Prejuízo', color: 'bg-red-100 text-red-700 border-red-300' };
    }
    if (dre.margemLiquida < 5) {
      return { label: 'Margem Baixa', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
    }
    if (dre.margemLiquida < 15) {
      return { label: 'Aceitável', color: 'bg-blue-100 text-blue-700 border-blue-300' };
    }
    return { label: 'Bom', color: 'bg-green-100 text-green-700 border-green-300' };
  };

  // Filtros
  const orcamentosFiltrados = orcamentos.filter(orc => {
    const matchBusca =
      containsNormalized(orc.nome, busca) ||
      containsNormalized(orc.numero, busca) ||
      containsNormalized(orc.clienteNome || '', busca);

    const matchTipo =
      filtroTipo === 'todos' ||
      (filtroTipo === 'servico' && orc.tipo === 'servico') ||
      (filtroTipo === 'produto' && orc.tipo === 'produto');

    const matchStatus =
      filtroStatus === 'todos' ||
      (orc.status || 'rascunho') === filtroStatus;

    const dre = orc.dre ?? { lucroLiquido: 0, margemLiquida: 0, receitaLiquida: 0, lucroBruto: 0, margemBruta: 0 };
    const matchViabilidade =
      filtroViabilidade === 'todos' ||
      (filtroViabilidade === 'prejuizo' && dre.lucroLiquido < 0) ||
      (filtroViabilidade === 'margem_baixa' && dre.margemLiquida > 0 && dre.margemLiquida < 5) ||
      (filtroViabilidade === 'aceitavel' && dre.margemLiquida >= 5 && dre.margemLiquida < 15) ||
      (filtroViabilidade === 'bom' && dre.margemLiquida >= 15);

    return matchBusca && matchTipo && matchStatus && matchViabilidade;
  });

  // Ordenação
  const orcamentosOrdenados = [...orcamentosFiltrados].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'numero':
        comparison = a.numero.localeCompare(b.numero);
        break;
      case 'nome':
        comparison = a.nome.localeCompare(b.nome);
        break;
      case 'totalVenda':
        comparison = a.totalVenda - b.totalVenda;
        break;
      case 'margemLiquida':
        comparison = a.dre.margemLiquida - b.dre.margemLiquida;
        break;
      case 'bdiMedio':
        comparison = a.bdiMedio - b.bdiMedio;
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Paginação
  const totalPaginas = Math.ceil(orcamentosOrdenados.length / itensPorPagina);
  const indexInicio = (paginaAtual - 1) * itensPorPagina;
  const indexFim = indexInicio + itensPorPagina;
  const orcamentosPaginados = orcamentosOrdenados.slice(indexInicio, indexFim);

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
    setFiltroTipo('todos');
    setFiltroStatus('todos');
    setFiltroViabilidade('todos');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 min-h-screen pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/comercial')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              Orçamentos (QQP)
            </h1>
            <p className="text-muted-foreground mt-1">
              Sistema de composição de custos e formação de preços
            </p>
          </div>
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
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <Input
                placeholder="Nome, número ou cliente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="servico">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Serviço
                    </div>
                  </SelectItem>
                  <SelectItem value="produto">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Produto
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Viabilidade</label>
              <Select value={filtroViabilidade} onValueChange={setFiltroViabilidade}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="bom">Bom (≥15%)</SelectItem>
                  <SelectItem value="aceitavel">Aceitável (5-15%)</SelectItem>
                  <SelectItem value="margem_baixa">Margem Baixa (&lt;5%)</SelectItem>
                  <SelectItem value="prejuizo">Prejuízo</SelectItem>
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
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold">Orçamentos</h3>
                <p className="text-sm text-muted-foreground">
                  Total de {orcamentosOrdenados.length} registros
                </p>
              </div>
              <Badge variant="outline" className="ml-2">
                {orcamentosOrdenados.length}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/comercial/orcamentos/novo')}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Orçamento
              </Button>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('numero')}
                      className="font-semibold"
                    >
                      Número
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px]">Tipo</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('nome')}
                      className="font-semibold"
                    >
                      Nome / Cliente
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center w-[110px]">Status</TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('totalVenda')}
                      className="font-semibold"
                    >
                      Total Venda
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('bdiMedio')}
                      className="font-semibold"
                    >
                      BDI Médio
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('margemLiquida')}
                      className="font-semibold"
                    >
                      Margem Líquida
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">Viabilidade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orcamentosPaginados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      Nenhum orçamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  orcamentosPaginados.map((orc) => {
                    const dreOrc = orc.dre ?? { lucroLiquido: 0, margemLiquida: 0, receitaLiquida: 0, lucroBruto: 0, margemBruta: 0 };
                    const status = getStatusViabilidade(dreOrc);
                    return (
                      <TableRow key={orc.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{orc.numero}</TableCell>
                        <TableCell>
                          <Badge className={`${
                            orc.tipo === 'servico'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : 'bg-green-50 text-green-700 border-green-300'
                          } flex items-center gap-1.5 w-fit`}>
                            {orc.tipo === 'servico' ? (
                              <Wrench className="h-3 w-3" />
                            ) : (
                              <Package className="h-3 w-3" />
                            )}
                            {orc.tipo === 'servico' ? 'Serviço' : 'Produto'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{orc.nome}</p>
                            {orc.clienteNome && (
                              <p className="text-xs text-muted-foreground">{orc.clienteNome}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusWorkflowBadge status={orc.status || 'rascunho'} />
                        </TableCell>
                        <TableCell className="text-right font-semibold text-blue-600 dark:text-blue-400">
                          {formatCurrency(orc.totalVenda)}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatPercentage(orc.bdiMedio)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={dreOrc.margemLiquida < 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                            {formatPercentage(dreOrc.margemLiquida)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={status.color}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/comercial/orcamentos/${orc.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleClonar(orc.id)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeletar(orc.id, orc.nome)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/comercial/orcamentos/${orc.id}`)}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {indexInicio + 1}-{Math.min(indexFim, orcamentosOrdenados.length)} de {orcamentosOrdenados.length}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Por página:</label>
              <Select value={itensPorPagina.toString()} onValueChange={(v) => {
                setItensPorPagina(Number(v));
                setPaginaAtual(1);
              }}>
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
      </div>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={!!deletarItem} onOpenChange={(open) => { if (!open) setDeletarItem(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o orçamento <strong>"{deletarItem?.nome}"</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarDeletar} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const STATUS_WORKFLOW: Record<string, { label: string; color: string }> = {
  rascunho: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  em_analise: { label: 'Em Análise', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  aprovado: { label: 'Aprovado', color: 'bg-green-100 text-green-700 border-green-300' },
  rejeitado: { label: 'Rejeitado', color: 'bg-red-100 text-red-700 border-red-300' },
};

function StatusWorkflowBadge({ status }: { status: string }) {
  const cfg = STATUS_WORKFLOW[status] ?? STATUS_WORKFLOW.rascunho;
  return <Badge className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>;
}

export default OrcamentosListPage;
