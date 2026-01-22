import { useState, useEffect } from 'react';
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
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  ChevronDown,
  GitBranch,
  Target,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DesdobramentoProblema } from '@/interfaces/GestaoProcessosInterfaces';
import DesdobramentoProblemaService from '@/services/gestaoProcessos/DesdobramentoProblemaService';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { LayoutGestaoProcessos } from '../LayoutGestaoProcessos';

export default function DesdobramentoList() {
  const { toast } = useToast();
  const [desdobramentos, setDesdobramentos] = useState<DesdobramentoProblema[]>([]);
  const [filteredDesdobramentos, setFilteredDesdobramentos] = useState<DesdobramentoProblema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  useEffect(() => {
    loadDesdobramentos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [desdobramentos, searchTerm, statusFilter]);

  const loadDesdobramentos = async () => {
    try {
      setIsLoading(true);
      const data = await DesdobramentoProblemaService.getAll();
      setDesdobramentos(data);
    } catch (error) {
      console.error('Erro ao carregar desdobramentos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os desdobramentos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...desdobramentos];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.titulo.toLowerCase().includes(term) ||
          d.problema.toLowerCase().includes(term) ||
          d.codigo.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    setFilteredDesdobramentos(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este desdobramento?')) return;

    try {
      await DesdobramentoProblemaService.delete(id);
      toast({
        title: 'Sucesso',
        description: 'Desdobramento excluído com sucesso',
      });
      loadDesdobramentos();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o desdobramento',
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
    total: desdobramentos.length,
    comCausaRaiz: desdobramentos.filter((d) => d.causaRaiz).length,
    aprovados: desdobramentos.filter((d) => d.status === 'aprovado').length,
    totalCausas: desdobramentos.reduce((sum, d) => sum + d.causas.length, 0),
  };

  return (
    <LayoutGestaoProcessos>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Desdobramento de Problemas</h1>
              <p className="text-muted-foreground mt-1">
                Análise de causas e efeitos
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
                Novo Desdobramento
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
                    <GitBranch className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Desdobramentos</div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Causa Raiz</span>
                  <div className="bg-green-600 p-2 rounded-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.comCausaRaiz}</div>
                <div className="text-xs text-muted-foreground">Identificadas</div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Aprovados</span>
                  <div className="bg-emerald-600 p-2 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">{stats.aprovados}</div>
                <div className="text-xs text-muted-foreground">Análises completas</div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Causas</span>
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats.totalCausas}</div>
                <div className="text-xs text-muted-foreground">Total identificadas</div>
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
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Tabela */}
          <Card>
            <CardHeader>
              <CardTitle>
                Listagem ({filteredDesdobramentos.length} {filteredDesdobramentos.length === 1 ? 'item' : 'itens'})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground mt-4">Carregando...</p>
                </div>
              ) : filteredDesdobramentos.length === 0 ? (
                <div className="text-center py-12">
                  <GitBranch className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mt-4">Nenhum desdobramento encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Título/Problema</TableHead>
                        <TableHead className="text-center">Causas</TableHead>
                        <TableHead className="text-center">Efeitos</TableHead>
                        <TableHead>Causa Raiz</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDesdobramentos.map((desdobramento) => (
                        <TableRow key={desdobramento.id}>
                          <TableCell className="font-mono text-sm">
                            {desdobramento.codigo}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{desdobramento.titulo}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {desdobramento.problema}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{desdobramento.causas.length}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{desdobramento.efeitos.length}</Badge>
                          </TableCell>
                          <TableCell>
                            {desdobramento.causaRaiz ? (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400">
                                Identificada
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Não identificada</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={desdobramento.status} />
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
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(desdobramento.id)}
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
