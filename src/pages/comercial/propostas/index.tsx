import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
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
import { Plus, FileText, Filter, X, Eye, Download, Copy, Trash2, ArrowUpDown, ChevronRight, ArrowLeft } from 'lucide-react';
import PropostaService from '@/services/PropostaService';
import { Proposta } from '@/interfaces/PropostaInterface';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';
import NovaPropostaDialog from './NovaPropostaDialog';
import DetalhesPropostaDialog from './DetalhesPropostaDialog';
import StatusBadge from './components/StatusBadge';

type SortField = 'numero' | 'titulo' | 'cliente' | 'valorTotal' | 'dataEmissao';
type SortOrder = 'asc' | 'desc';

const PropostasListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [sortField, setSortField] = useState<SortField>('numero');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(25);

  // Dialogs
  const [dialogNova, setDialogNova] = useState(false);
  const [dialogDetalhes, setDialogDetalhes] = useState(false);
  const [propostaSelecionada, setPropostaSelecionada] = useState<Proposta | null>(null);

  useEffect(() => {
    carregarPropostas();
  }, []);

  const carregarPropostas = async () => {
    try {
      setLoading(true);
      const data = await PropostaService.getAll();
      setPropostas(data);
    } catch (error) {
      console.error('Erro ao carregar propostas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as propostas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClonar = async (id: string) => {
    try {
      await PropostaService.clonar(id);
      toast({
        title: 'Sucesso',
        description: 'Proposta clonada com sucesso',
      });
      carregarPropostas();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao clonar proposta',
        variant: 'destructive',
      });
    }
  };

  const handleDeletar = async (id: string, titulo: string) => {
    if (!confirm(`Tem certeza que deseja deletar a proposta "${titulo}"?`)) return;

    try {
      await PropostaService.delete(id);
      toast({
        title: 'Sucesso',
        description: 'Proposta deletada com sucesso',
      });
      carregarPropostas();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao deletar proposta',
        variant: 'destructive',
      });
    }
  };

  const handleExportarPDF = async (id: string, numero: string) => {
    try {
      const blob = await PropostaService.exportarPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Proposta_${numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Sucesso',
        description: 'PDF exportado com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao exportar PDF',
        variant: 'destructive',
      });
    }
  };

  const handleVerDetalhes = (proposta: Proposta) => {
    setPropostaSelecionada(proposta);
    setDialogDetalhes(true);
  };

  // Filtros
  const propostasFiltradas = propostas.filter(prop => {
    const matchBusca =
      prop.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      prop.numero.toLowerCase().includes(busca.toLowerCase()) ||
      prop.cliente.razaoSocial.toLowerCase().includes(busca.toLowerCase());

    const matchStatus = filtroStatus === 'todos' || prop.status === filtroStatus;

    return matchBusca && matchStatus;
  });

  // Ordenação
  const propostasOrdenadas = [...propostasFiltradas].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'numero':
        comparison = a.numero.localeCompare(b.numero);
        break;
      case 'titulo':
        comparison = a.titulo.localeCompare(b.titulo);
        break;
      case 'cliente':
        comparison = a.cliente.razaoSocial.localeCompare(b.cliente.razaoSocial);
        break;
      case 'valorTotal':
        comparison = a.valorTotal - b.valorTotal;
        break;
      case 'dataEmissao':
        comparison = new Date(a.dataEmissao).getTime() - new Date(b.dataEmissao).getTime();
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Paginação
  const totalPaginas = Math.ceil(propostasOrdenadas.length / itensPorPagina);
  const indexInicio = (paginaAtual - 1) * itensPorPagina;
  const indexFim = indexInicio + itensPorPagina;
  const propostasPaginadas = propostasOrdenadas.slice(indexInicio, indexFim);

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
    setFiltroStatus('todos');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando propostas...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
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
              Propostas Comerciais
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestão de propostas profissionais formato GMX
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <Input
                placeholder="Título, número ou cliente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
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
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="rejeitada">Rejeitada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
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
                <h3 className="font-semibold">Propostas</h3>
                <p className="text-sm text-muted-foreground">
                  Total de {propostasOrdenadas.length} registros
                </p>
              </div>
              <Badge variant="outline" className="ml-2">
                {propostasOrdenadas.length}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogNova(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Proposta
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
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('titulo')}
                      className="font-semibold"
                    >
                      Título
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('cliente')}
                      className="font-semibold"
                    >
                      Cliente
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('valorTotal')}
                      className="font-semibold"
                    >
                      Valor Total
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('dataEmissao')}
                      className="font-semibold"
                    >
                      Data Emissão
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {propostasPaginadas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Nenhuma proposta encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  propostasPaginadas.map((prop) => {
                    return (
                      <TableRow key={prop.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleVerDetalhes(prop)}>
                        <TableCell className="font-medium">{prop.numero}</TableCell>
                        <TableCell>{prop.titulo}</TableCell>
                        <TableCell>{prop.cliente.razaoSocial}</TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={prop.status} />
                        </TableCell>
                        <TableCell className="text-right font-semibold text-blue-600 dark:text-blue-400">
                          {formatCurrency(prop.valorTotal, prop.moeda)}
                        </TableCell>
                        <TableCell className="text-center">
                          {new Date(prop.dataEmissao).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleVerDetalhes(prop)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleExportarPDF(prop.id, prop.numero)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleClonar(prop.id)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeletar(prop.id, prop.titulo)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
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
              {indexInicio + 1}-{Math.min(indexFim, propostasOrdenadas.length)} de {propostasOrdenadas.length}
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

      {/* Dialogs */}
      <NovaPropostaDialog
        open={dialogNova}
        onOpenChange={setDialogNova}
        onSaveSuccess={carregarPropostas}
      />

      {propostaSelecionada && (
        <DetalhesPropostaDialog
          open={dialogDetalhes}
          onOpenChange={setDialogDetalhes}
          proposta={propostaSelecionada}
          onUpdate={carregarPropostas}
          onDelete={handleDeletar}
          onExportPDF={handleExportarPDF}
        />
      )}
      </div>
    </Layout>
  );
};

export default PropostasListPage;
