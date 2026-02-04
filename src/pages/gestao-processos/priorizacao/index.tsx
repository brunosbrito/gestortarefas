import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  Download,
  ChevronDown,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Target,
  FileSpreadsheet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PriorizacaoProblema } from '@/interfaces/GestaoProcessosInterfaces';
import PriorizacaoProblemaService from '@/services/gestaoProcessos/PriorizacaoProblemaService';
import { StatusBadge } from '../components/StatusBadge';
import { AprovacaoDialog } from '../components/AprovacaoDialog';
import { RejeicaoDialog } from '../components/RejeicaoDialog';
import { PriorizacaoDialog } from './components/PriorizacaoDialog';
import { useToast } from '@/hooks/use-toast';
import { LayoutGestaoProcessos } from '../LayoutGestaoProcessos';

export default function PriorizacaoList() {
  const { toast } = useToast();
  const [priorizacoes, setPriorizacoes] = useState<PriorizacaoProblema[]>([]);
  const [filteredPriorizacoes, setFilteredPriorizacoes] = useState<PriorizacaoProblema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [classificacaoFilter, setClassificacaoFilter] = useState<string>('todos');

  // Dialogs
  const [priorizacaoDialog, setPriorizacaoDialog] = useState(false);
  const [aprovacaoDialog, setAprovacaoDialog] = useState<{
    open: boolean;
    documento: PriorizacaoProblema | null;
  }>({ open: false, documento: null });
  const [rejeicaoDialog, setRejeicaoDialog] = useState<{
    open: boolean;
    documento: PriorizacaoProblema | null;
  }>({ open: false, documento: null });

  useEffect(() => {
    loadPriorizacoes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [priorizacoes, searchTerm, statusFilter, classificacaoFilter]);

  const loadPriorizacoes = async () => {
    try {
      setIsLoading(true);
      const data = await PriorizacaoProblemaService.getAll();
      setPriorizacoes(data);
    } catch (error) {
      console.error('Erro ao carregar priorizações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as priorizações',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...priorizacoes];

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.titulo.toLowerCase().includes(term) ||
          p.problema.toLowerCase().includes(term) ||
          p.codigo.toLowerCase().includes(term) ||
          p.area.toLowerCase().includes(term)
      );
    }

    // Filtro de status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Filtro de classificação
    if (classificacaoFilter !== 'todos') {
      filtered = filtered.filter((p) => p.resultado.classificacao === classificacaoFilter);
    }

    setFilteredPriorizacoes(filtered);
  };

  const handleSavePriorizacao = async (data: any) => {
    try {
      await PriorizacaoProblemaService.create(data);
      toast({
        title: 'Sucesso',
        description: 'Priorização criada com sucesso',
      });
      loadPriorizacoes();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a priorização',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta priorização?')) return;

    try {
      await PriorizacaoProblemaService.delete(id);
      toast({
        title: 'Sucesso',
        description: 'Priorização excluída com sucesso',
      });
      loadPriorizacoes();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a priorização',
        variant: 'destructive',
      });
    }
  };

  const handleAprovar = async (documentoId: string) => {
    try {
      await PriorizacaoProblemaService.aprovar({
        documentoId,
        aprovadorId: '2', // TODO: Pegar do contexto de autenticação
        aprovadorNome: 'Gestor Mock',
        aprovado: true,
      });
      toast({
        title: 'Sucesso',
        description: 'Priorização aprovada com sucesso',
      });
      loadPriorizacoes();
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar a priorização',
        variant: 'destructive',
      });
    }
  };

  const handleRejeitar = async (documentoId: string, motivoRejeicao: string) => {
    try {
      await PriorizacaoProblemaService.rejeitar({
        documentoId,
        aprovadorId: '2', // TODO: Pegar do contexto de autenticação
        aprovadorNome: 'Gestor Mock',
        aprovado: false,
        motivoRejeicao,
      });
      toast({
        title: 'Sucesso',
        description: 'Priorização rejeitada com sucesso',
      });
      loadPriorizacoes();
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar a priorização',
        variant: 'destructive',
      });
    }
  };

  const handleExportPDF = () => {
    toast({
      title: 'Em desenvolvimento',
      description: 'Exportação em PDF será implementada em breve',
    });
  };

  const handleExportExcel = () => {
    toast({
      title: 'Em desenvolvimento',
      description: 'Exportação em Excel será implementada em breve',
    });
  };

  // KPIs
  const stats = {
    total: priorizacoes.length,
    criticas: priorizacoes.filter((p) => p.resultado.classificacao === 'critica').length,
    altas: priorizacoes.filter((p) => p.resultado.classificacao === 'alta').length,
    aguardandoAprovacao: priorizacoes.filter((p) => p.status === 'aguardando_aprovacao').length,
  };

  const getClassificacaoBadge = (classificacao: string) => {
    const config = {
      critica: { className: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400' },
      alta: { className: 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400' },
      media: { className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400' },
      baixa: { className: 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' },
    };

    const cfg = config[classificacao as keyof typeof config] || config.baixa;

    return (
      <Badge variant="outline" className={cfg.className}>
        {classificacao.charAt(0).toUpperCase() + classificacao.slice(1)}
      </Badge>
    );
  };

  return (
    <LayoutGestaoProcessos>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Priorização de Problemas</h1>
              <p className="text-muted-foreground mt-1">
                Matriz GUT - Gravidade × Urgência × Tendência
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportExcel}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" onClick={handleExportPDF}>
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button onClick={() => setPriorizacaoDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Priorização
              </Button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Total</CardDescription>
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Priorizações cadastradas</div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Críticas</CardDescription>
                  <div className="bg-red-600 p-2 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.criticas}</div>
                <div className="text-xs text-muted-foreground">Ação imediata necessária</div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Alta Prioridade</CardDescription>
                  <div className="bg-orange-600 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{stats.altas}</div>
                <div className="text-xs text-muted-foreground">Requerem atenção urgente</div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Aguardando</CardDescription>
                  <div className="bg-yellow-600 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats.aguardandoAprovacao}</div>
                <div className="text-xs text-muted-foreground">Pendentes de aprovação</div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros Collapsible */}
          <Card>
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-muted/50"
                >
                  <h3 className="text-lg font-semibold">Filtros</h3>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 transition-transform duration-200',
                      filtersOpen && 'rotate-180'
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 md:p-6 pt-0 border-t border-border/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Buscar</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Título, problema, código..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="rascunho">Rascunho</SelectItem>
                          <SelectItem value="aguardando_aprovacao">Aguardando Aprovação</SelectItem>
                          <SelectItem value="aprovado">Aprovado</SelectItem>
                          <SelectItem value="rejeitado">Rejeitado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Classificação GUT</label>
                      <Select value={classificacaoFilter} onValueChange={setClassificacaoFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas</SelectItem>
                          <SelectItem value="critica">Crítica</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Tabela */}
          <Card>
            <CardHeader>
              <CardTitle>
                Listagem ({filteredPriorizacoes.length} {filteredPriorizacoes.length === 1 ? 'item' : 'itens'})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground mt-4">Carregando...</p>
                </div>
              ) : filteredPriorizacoes.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mt-4">Nenhuma priorização encontrada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Título/Problema</TableHead>
                        <TableHead className="text-center">G × U × T</TableHead>
                        <TableHead className="text-center">Pontuação</TableHead>
                        <TableHead>Classificação</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPriorizacoes.map((priorizacao) => (
                        <TableRow key={priorizacao.id}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              #{priorizacao.resultado.ranking}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {priorizacao.codigo}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{priorizacao.titulo}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {priorizacao.problema}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-mono">
                            <div className="flex items-center justify-center gap-1 text-sm">
                              <span>{priorizacao.criterios.gravidade}</span>
                              <span className="text-muted-foreground">×</span>
                              <span>{priorizacao.criterios.urgencia}</span>
                              <span className="text-muted-foreground">×</span>
                              <span>{priorizacao.criterios.tendencia}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-lg font-bold">
                              {priorizacao.resultado.pontuacao}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getClassificacaoBadge(priorizacao.resultado.classificacao)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={priorizacao.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                {priorizacao.status === 'aguardando_aprovacao' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setAprovacaoDialog({ open: true, documento: priorizacao })
                                      }
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Aprovar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setRejeicaoDialog({ open: true, documento: priorizacao })
                                      }
                                    >
                                      <AlertTriangle className="w-4 h-4 mr-2" />
                                      Rejeitar
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Exportar PDF
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(priorizacao.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AprovacaoDialog
        open={aprovacaoDialog.open}
        onOpenChange={(open) => setAprovacaoDialog({ open, documento: null })}
        documento={aprovacaoDialog.documento}
        tipoDocumento="Priorização"
        onConfirm={handleAprovar}
      />

      <RejeicaoDialog
        open={rejeicaoDialog.open}
        onOpenChange={(open) => setRejeicaoDialog({ open, documento: null })}
        documento={rejeicaoDialog.documento}
        tipoDocumento="Priorização"
        onConfirm={handleRejeitar}
      />

      <PriorizacaoDialog
        open={priorizacaoDialog}
        onOpenChange={setPriorizacaoDialog}
        onSave={handleSavePriorizacao}
      />
    </LayoutGestaoProcessos>
  );
}
