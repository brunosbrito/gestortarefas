import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Eye,
  ChevronDown,
  RotateCw,
  PlayCircle,
  CheckCircle2,
  Clock,
  Target,
  FileSpreadsheet,
  Repeat,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PDCA } from '@/interfaces/GestaoProcessosInterfaces';
import PDCAService from '@/services/gestaoProcessos/PDCAService';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { LayoutGestaoProcessos } from '../LayoutGestaoProcessos';

export default function PDCAList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pdcas, setPDCAs] = useState<PDCA[]>([]);
  const [filteredPDCAs, setFilteredPDCAs] = useState<PDCA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [faseFilter, setFaseFilter] = useState<string>('todas');

  useEffect(() => {
    loadPDCAs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [pdcas, searchTerm, statusFilter, faseFilter]);

  const loadPDCAs = async () => {
    try {
      setIsLoading(true);
      const data = await PDCAService.getAll();
      setPDCAs(data);
    } catch (error) {
      console.error('Erro ao carregar PDCAs:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os ciclos PDCA',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...pdcas];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.titulo.toLowerCase().includes(term) ||
          p.objetivo.toLowerCase().includes(term) ||
          p.codigo.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    if (faseFilter !== 'todas') {
      filtered = filtered.filter((p) => p.faseAtual === faseFilter);
    }

    setFilteredPDCAs(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este ciclo PDCA?')) return;

    try {
      await PDCAService.delete(id);
      toast({
        title: 'Sucesso',
        description: 'Ciclo PDCA excluído com sucesso',
      });
      loadPDCAs();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o ciclo PDCA',
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

  const getFaseBadge = (fase: string) => {
    const config = {
      plan: {
        icon: Target,
        label: 'Plan',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
      },
      do: {
        icon: PlayCircle,
        label: 'Do',
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400',
      },
      check: {
        icon: CheckCircle2,
        label: 'Check',
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400',
      },
      act: {
        icon: RotateCw,
        label: 'Act',
        className: 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400',
      },
    };

    const cfg = config[fase as keyof typeof config] || config.plan;
    const Icon = cfg.icon;

    return (
      <Badge variant="outline" className={cn('flex items-center gap-1 w-fit', cfg.className)}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </Badge>
    );
  };

  const getStatusPDCABadge = (statusPDCA: string) => {
    const config = {
      planejamento: {
        label: 'Planejamento',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
      },
      em_execucao: {
        label: 'Em Execução',
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400',
      },
      em_verificacao: {
        label: 'Em Verificação',
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400',
      },
      concluido: {
        label: 'Concluído',
        className: 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400',
      },
      cancelado: {
        label: 'Cancelado',
        className: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400',
      },
    };

    const cfg = config[statusPDCA as keyof typeof config] || config.planejamento;

    return (
      <Badge variant="outline" className={cfg.className}>
        {cfg.label}
      </Badge>
    );
  };

  // KPIs
  const stats = {
    total: pdcas.length,
    planejamento: pdcas.filter((p) => p.statusPDCA === 'planejamento').length,
    emExecucao: pdcas.filter((p) => p.statusPDCA === 'em_execucao').length,
    concluidos: pdcas.filter((p) => p.statusPDCA === 'concluido').length,
  };

  return (
    <LayoutGestaoProcessos>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Ciclos PDCA</h1>
              <p className="text-muted-foreground mt-1">
                Plan-Do-Check-Act: Ciclo de Melhoria Contínua
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
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Ciclo PDCA
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
                    <RotateCw className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Ciclos cadastrados</div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Planejamento</CardDescription>
                  <div className="bg-sky-600 p-2 rounded-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-sky-600">{stats.planejamento}</div>
                <div className="text-xs text-muted-foreground">Fase Plan</div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Em Execução</CardDescription>
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <PlayCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats.emExecucao}</div>
                <div className="text-xs text-muted-foreground">Fases Do/Check</div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Concluídos</CardDescription>
                  <div className="bg-green-600 p-2 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.concluidos}</div>
                <div className="text-xs text-muted-foreground">Ciclo completo</div>
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
                          placeholder="Título, objetivo, código..."
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
                      <label className="text-sm font-medium">Fase Atual</label>
                      <Select value={faseFilter} onValueChange={setFaseFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas</SelectItem>
                          <SelectItem value="plan">Plan (Planejar)</SelectItem>
                          <SelectItem value="do">Do (Executar)</SelectItem>
                          <SelectItem value="check">Check (Verificar)</SelectItem>
                          <SelectItem value="act">Act (Agir)</SelectItem>
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
                Listagem ({filteredPDCAs.length} {filteredPDCAs.length === 1 ? 'item' : 'itens'})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground mt-4">Carregando...</p>
                </div>
              ) : filteredPDCAs.length === 0 ? (
                <div className="text-center py-12">
                  <RotateCw className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mt-4">Nenhum ciclo PDCA encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Título/Objetivo</TableHead>
                        <TableHead className="text-center">Ciclo</TableHead>
                        <TableHead className="text-center">Fase Atual</TableHead>
                        <TableHead>Status PDCA</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPDCAs.map((pdca) => (
                        <TableRow key={pdca.id}>
                          <TableCell className="font-mono text-sm">
                            {pdca.codigo}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {pdca.titulo}
                                {pdca.cicloAnteriorId && (
                                  <Badge variant="outline" className="gap-1">
                                    <Repeat className="w-3 h-3" />
                                    Iteração
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {pdca.objetivo}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{pdca.numeroCiclo}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {getFaseBadge(pdca.faseAtual)}
                          </TableCell>
                          <TableCell>
                            {getStatusPDCABadge(pdca.statusPDCA)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={pdca.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/gestao-processos/pdca/${pdca.id}`)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                {pdca.statusPDCA === 'concluido' && pdca.act?.novoCicloNecessario && (
                                  <DropdownMenuItem>
                                    <Repeat className="w-4 h-4 mr-2" />
                                    Iniciar Novo Ciclo
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(pdca.id)}
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
    </LayoutGestaoProcessos>
  );
}
