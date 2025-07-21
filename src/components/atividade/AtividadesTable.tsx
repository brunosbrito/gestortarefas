import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Clock, Users, Building2, FileText, FileSpreadsheet, Download } from 'lucide-react';
import { useAtividadeData } from '@/hooks/useAtividadeData';
import { AtividadeFiltrosComponent } from './AtividadeFiltros';
import { AtividadePdfService } from '@/services/AtividadePdfService';
import { AtividadeExcelService } from '@/services/AtividadeExcelService';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { useToast } from '@/hooks/use-toast';
import { PdfConfigDialog } from './PdfConfigDialog';
import { ExcelConfigDialog, ExcelConfig } from './ExcelConfigDialog';
import { AtividadePdfAdvancedService } from '@/services/AtividadePdfAdvancedService';
import { calcularKPI, calcularProgresso, formatarKPI, formatarProgresso, formatarTempoTotal, getKPIColor, getProgressoColor, obterCodigoSequencial } from '@/utils/atividadeCalculos';
import { Progress } from '@/components/ui/progress';

export const AtividadesTable = () => {
  const { 
    atividadesFiltradas, 
    filtros,
    isLoadingAtividades,
    tarefasMacro,
    processos,
    colaboradores,
    obras,
    totalAtividades,
    handleFiltroChange,
    limparFiltros
  } = useAtividadeData();

  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [isExporting, setIsExporting] = useState(false);

  // Calcular dados da paginação
  const totalPages = Math.ceil(totalAtividades / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = atividadesFiltradas.slice(startIndex, endIndex);

  // Reset página quando atividades mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [atividadesFiltradas]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    return timeString;
  };

  const formatTeam = (collaborators?: any[]) => {
    if (!collaborators || collaborators.length === 0) return '-';
    if (collaborators.length === 1) return collaborators[0].name || collaborators[0];
    return `${collaborators[0].name || collaborators[0]} +${collaborators.length - 1}`;
  };

  const getTeamTooltip = (collaborators?: any[]) => {
    if (!collaborators || collaborators.length === 0) return 'Sem equipe definida';
    return collaborators.map(c => c.name || c).join(', ');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Planejadas': { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Planejadas' },
      'Em execução': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Em Execução' },
      'Concluídas': { color: 'bg-green-100 text-green-800 border-green-300', label: 'Concluídas' },
      'Paralizadas': { color: 'bg-red-100 text-red-800 border-red-300', label: 'Paralizadas' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Planejadas'];
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleExportPDFAdvanced = async (config: any) => {
    setIsExporting(true);
    try {
      await AtividadePdfAdvancedService.downloadPDF(atividadesFiltradas, filtros, config);
      toast({
        title: "PDF Gerado",
        description: "O relatório em PDF foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o relatório em PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async (config: ExcelConfig) => {
    setIsExporting(true);
    try {
      await AtividadeExcelService.downloadExcel(atividadesFiltradas, filtros, config);
      toast({
        title: "Excel Gerado",
        description: "O relatório em Excel foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar Excel",
        description: "Ocorreu um erro ao gerar o relatório em Excel.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoadingAtividades) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7F0E]"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <AtividadeFiltrosComponent
        filtros={filtros}
        onFiltroChange={handleFiltroChange}
        onLimparFiltros={limparFiltros}
        tarefasMacro={tarefasMacro}
        processos={processos}
        colaboradores={colaboradores}
        obras={obras}
        isLoading={isLoadingAtividades}
      />

      {/* Tabela */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-[#FF7F0E]" />
            <h3 className="text-lg font-semibold">Atividades</h3>
            <Badge variant="outline" className="ml-3 bg-purple-100 text-purple-800 border-purple-300">
              Total: {totalAtividades}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {/* Botões de exportação */}
            <div className="flex items-center gap-2">
              <PdfConfigDialog
                atividades={atividadesFiltradas}
                filtros={filtros}
                onExport={handleExportPDFAdvanced}
                isExporting={isExporting}
              />
              <ExcelConfigDialog
                atividades={atividadesFiltradas}
                filtros={filtros}
                onExport={handleExportExcel}
                isExporting={isExporting}
              />
            </div>

            {totalAtividades > 0 && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  Mostrando {startIndex + 1}-{Math.min(endIndex, totalAtividades)} de {totalAtividades} resultados
                </span>
                <div className="flex items-center gap-2">
                  <span>Por página:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {atividadesFiltradas && atividadesFiltradas.length > 0 ? (
          <div className="space-y-4">
            <div className="rounded-md border">
              <TooltipProvider>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">Item</TableHead>
                      <TableHead className="w-[200px]">Descrição</TableHead>
                      <TableHead className="w-[120px]">Tarefa Macro</TableHead>
                      <TableHead className="w-[100px]">Processo</TableHead>
                      <TableHead className="w-[100px] text-center">Status</TableHead>
                      <TableHead className="w-16 text-center">OS</TableHead>
                      <TableHead className="w-[150px]">Obra/Projeto</TableHead>
                      <TableHead className="w-20 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4" />
                          T. Est.
                        </div>
                      </TableHead>
                      <TableHead className="w-20 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4" />
                          T. Total
                        </div>
                      </TableHead>
                      <TableHead className="w-16 text-center">KPI</TableHead>
                      <TableHead className="w-20 text-center">Qtd.</TableHead>
                      <TableHead className="w-20 text-center">Progresso</TableHead>
                      <TableHead className="w-24 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-4 h-4" />
                          Equipe
                        </div>
                      </TableHead>
                      <TableHead className="w-28 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Início
                        </div>
                      </TableHead>
                      <TableHead className="w-28 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Criação
                        </div>
                      </TableHead>
                      <TableHead className="w-[150px]">Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((atividade: AtividadeStatus, index: number) => {
                      const globalIndex = startIndex + index;
                      const kpi = calcularKPI(atividade);
                      const progresso = calcularProgresso(atividade);
                      
                      return (
                        <TableRow key={atividade.id}>
                          <TableCell className="text-center font-mono text-sm">
                            {obterCodigoSequencial(globalIndex)}
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="truncate font-medium">
                                  {atividade.description}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{atividade.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="max-w-[120px]">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="truncate">
                                  {typeof atividade.macroTask === 'string' 
                                    ? atividade.macroTask 
                                    : atividade.macroTask?.name || '-'}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{typeof atividade.macroTask === 'string' 
                                  ? atividade.macroTask 
                                  : atividade.macroTask?.name || '-'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="max-w-[100px]">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="truncate">
                                  {typeof atividade.process === 'string' 
                                    ? atividade.process 
                                    : atividade.process?.name || '-'}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{typeof atividade.process === 'string' 
                                  ? atividade.process 
                                  : atividade.process?.name || '-'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(atividade.status)}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {atividade.serviceOrder?.serviceOrderNumber || 'N/A'}
                          </TableCell>
                          <TableCell className="max-w-[150px]">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="truncate flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-gray-500" />
                                  {atividade.project?.name || 'N/A'}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{atividade.project?.name || 'N/A'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {formatTime(atividade.estimatedTime)}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {formatarTempoTotal(atividade.totalTime)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={`text-xs ${getKPIColor(kpi)}`}>
                              {formatarKPI(kpi)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            <div className="flex flex-col items-center">
                              <span className="font-medium">
                                {atividade.completedQuantity || 0}
                              </span>
                              <span className="text-gray-400 text-xs">
                                /{atividade.quantity || 0}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="space-y-1">
                              <div className="text-xs font-medium">
                                {formatarProgresso(progresso)}
                              </div>
                              <Progress 
                                value={Math.min(progresso, 100)} 
                                className="h-2 w-16"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1 text-sm">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {formatTeam(atividade.collaborators)}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{getTeamTooltip(atividade.collaborators)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {formatDate(atividade.startDate)}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {formatDate(atividade.createdAt)}
                          </TableCell>
                          <TableCell className="max-w-[150px]">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="truncate text-sm text-gray-600">
                                  {atividade.observation || '-'}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{atividade.observation || 'Sem observações'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TooltipProvider>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNumber)}
                            isActive={currentPage === pageNumber}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-md">
            <Calendar className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500 text-lg font-medium">Nenhuma atividade encontrada</p>
            <p className="text-gray-400 text-sm">Tente ajustar os filtros para ver mais resultados</p>
          </div>
        )}
      </Card>
    </div>
  );
};
