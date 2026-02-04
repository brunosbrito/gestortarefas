import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  Eye,
  ChevronDown,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MetaSMART } from '@/interfaces/GestaoProcessosInterfaces';
import MetaSMARTService from '@/services/gestaoProcessos/MetaSMARTService';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { LayoutGestaoProcessos } from '../LayoutGestaoProcessos';
import MetaSMARTDialog from './components/MetaSMARTDialog';

export default function MetasList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [metas, setMetas] = useState<MetaSMART[]>([]);
  const [filteredMetas, setFilteredMetas] = useState<MetaSMART[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  useEffect(() => {
    loadMetas();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [metas, searchTerm, statusFilter]);

  const loadMetas = async () => {
    try {
      setIsLoading(true);
      const data = await MetaSMARTService.getAll();
      setMetas(data);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as metas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...metas];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.titulo.toLowerCase().includes(term) ||
          m.meta.toLowerCase().includes(term) ||
          m.codigo.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    setFilteredMetas(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return;

    try {
      await MetaSMARTService.delete(id);
      toast({
        title: 'Sucesso',
        description: 'Meta excluída com sucesso',
      });
      loadMetas();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a meta',
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
    total: metas.length,
    emAndamento: metas.filter((m) => m.progresso > 0 && m.progresso < 100).length,
    atingidas: metas.filter((m) => m.progresso === 100).length,
    atrasadas: metas.filter((m) => {
      const dataFim = new Date(m.temporal.dataFim);
      return dataFim < new Date() && m.progresso < 100;
    }).length,
  };

  return (
    <LayoutGestaoProcessos>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Metas SMART</h1>
              <p className="text-muted-foreground mt-1">
                Specific, Measurable, Attainable, Relevant, Time-bound
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
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Meta SMART
              </Button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Metas SMART</div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Em Andamento</span>
                  <div className="bg-orange-600 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{stats.emAndamento}</div>
                <div className="text-xs text-muted-foreground">Execução</div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Atingidas</span>
                  <div className="bg-green-600 p-2 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.atingidas}</div>
                <div className="text-xs text-muted-foreground">100% completas</div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Atrasadas</span>
                  <div className="bg-red-600 p-2 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.atrasadas}</div>
                <div className="text-xs text-muted-foreground">Fora do prazo</div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Buscar</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Título, meta, código..."
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
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Tabela */}
          <Card>
            <CardHeader>
              <CardTitle>
                Listagem ({filteredMetas.length} {filteredMetas.length === 1 ? 'item' : 'itens'})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground mt-4">Carregando...</p>
                </div>
              ) : filteredMetas.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mt-4">Nenhuma meta encontrada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Título/Meta</TableHead>
                        <TableHead className="text-center">Progresso</TableHead>
                        <TableHead>Indicador</TableHead>
                        <TableHead>Prazo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMetas.map((meta) => (
                        <TableRow key={meta.id}>
                          <TableCell className="font-mono text-sm">
                            {meta.codigo}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{meta.titulo}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {meta.meta}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="w-full max-w-[120px] mx-auto space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Meta</span>
                                <span className="font-medium">{meta.progresso}%</span>
                              </div>
                              <Progress value={meta.progresso} className="h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{meta.mensuravel.indicador}</div>
                              <div className="text-muted-foreground">
                                {meta.mensuravel.valorAtual} → {meta.mensuravel.valorMeta}{' '}
                                {meta.mensuravel.unidadeMedida}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(meta.temporal.dataFim), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={meta.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/gestao-processos/metas/${meta.id}`)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(meta.id)}
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

      {/* Dialog para criar nova meta */}
      <MetaSMARTDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadMetas}
      />
    </LayoutGestaoProcessos>
  );
}
