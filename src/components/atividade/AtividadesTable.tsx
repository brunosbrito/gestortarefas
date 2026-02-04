import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { useAtividadeData } from '@/hooks/useAtividadeData';
import { AtividadeFiltrosComponent } from './AtividadeFiltros';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { useToast } from '@/hooks/use-toast';
import { PdfConfigDialog } from './PdfConfigDialog';
import { ExcelConfigDialog, ExcelConfig } from './ExcelConfigDialog';
import { AtividadePdfAdvancedService } from '@/services/AtividadePdfAdvancedService';
import { AtividadeExcelService } from '@/services/AtividadeExcelService';
import { useNavigate } from 'react-router-dom';
import { AtividadesTableRow } from './AtividadesTableRow';
import { AtividadeCardMobile } from './AtividadeCard.Mobile';
import { cn } from '@/lib/utils';
import { staggerContainer } from '@/lib/animations';
import { SortableTableHeader, useTableSort } from '@/components/tables/SortableTableHeader';
import { calcularKPI, calcularProgresso } from '@/utils/atividadeCalculos';

export const AtividadesTable = () => {
  const navigate = useNavigate();

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
    limparFiltros,
  } = useAtividadeData();

  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [isExporting, setIsExporting] = useState(false);

  // Adicionar campos calculados para permitir ordenação
  const atividadesComCalculos = useMemo(() => {
    return atividadesFiltradas.map(atividade => ({
      ...atividade,
      _kpi: calcularKPI(atividade),
      _progresso: calcularProgresso(atividade),
    }));
  }, [atividadesFiltradas]);

  // Sorting - aplicado aos dados filtrados com cálculos
  const { sortedData, sortKey, sortDirection, handleSort } = useTableSort(atividadesComCalculos, 'id', 'asc');

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedData.slice(startIndex, endIndex);

  // Reset página quando atividades mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [sortedData]);

  // useCallback para evitar recriação de funções em cada render
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  }, []);

  const handleRowClick = useCallback((atividade: AtividadeStatus) => {
    navigate(`/obras/${atividade.project.id}/os/${atividade.serviceOrder.id}/atividades`);
  }, [navigate]);

  const formatTime = useCallback((timeString?: string) => {
    if (!timeString) return '-';
    return timeString;
  }, []);

  const formatTeam = useCallback((collaborators?: any[]) => {
    if (!collaborators || collaborators.length === 0) return '-';
    if (collaborators.length === 1)
      return collaborators[0].name || collaborators[0];
    return `${collaborators[0].name || collaborators[0]} +${
      collaborators.length - 1
    }`;
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  }, []);

  const handleExportPDFAdvanced = async (config: any) => {
    setIsExporting(true);
    try {
      await AtividadePdfAdvancedService.downloadPDF(
        atividadesFiltradas,
        filtros,
        config
      );
      toast({
        title: 'PDF Gerado',
        description: 'O relatório em PDF foi baixado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Ocorreu um erro ao gerar o relatório em PDF.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async (config: ExcelConfig) => {
    setIsExporting(true);
    try {
      await AtividadeExcelService.downloadExcel(
        atividadesFiltradas,
        filtros,
        config
      );
      toast({
        title: 'Excel Gerado',
        description: 'O relatório em Excel foi baixado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao gerar Excel',
        description: 'Ocorreu um erro ao gerar o relatório em Excel.',
        variant: 'destructive',
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
      <Card className="overflow-hidden border border-border/50 shadow-elevation-2">
        {/* Header modernizado */}
        <div className="p-4 md:p-6 border-b-2 border-border/50 bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Atividades</h3>
                <p className="text-xs text-muted-foreground">
                  Total de {totalAtividades} {totalAtividades === 1 ? 'registro' : 'registros'}
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/30 ml-2 font-semibold tabular-nums"
              >
                {totalAtividades}
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
                <div className="flex items-center gap-3 text-sm text-muted-foreground border-l pl-3">
                  <span className="hidden md:inline">
                    {startIndex + 1}-{Math.min(endIndex, totalAtividades)} de {totalAtividades}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Por página:</span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={handleItemsPerPageChange}
                    >
                      <SelectTrigger className="w-20 h-10">
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
        </div>

        {atividadesFiltradas && atividadesFiltradas.length > 0 ? (
          <div className="space-y-4">
            {/* Desktop view - Tabela */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-2">
                    <SortableTableHeader
                      label="Item"
                      sortKey="id"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                      className="w-16 border-r border-border/30"
                      align="center"
                    />
                    <SortableTableHeader
                      label="Descrição"
                      sortKey="description"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                      className="w-[250px] border-r border-border/30"
                    />
                    <SortableTableHeader
                      label="Status"
                      sortKey="status"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                      className="w-[140px] border-r border-border/30"
                      align="center"
                    />
                    <SortableTableHeader
                      label="Tarefa Macro"
                      sortKey="macroTask.name"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                      className="w-[150px] border-r border-border/30"
                    />
                    <SortableTableHeader
                      label="Tempo Total"
                      sortKey="totalTime"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                      className="w-[120px] border-r border-border/30"
                      align="center"
                    />
                    <SortableTableHeader
                      label="Progresso"
                      sortKey="_progresso"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                      className="w-[120px] border-r border-border/30"
                      align="center"
                    />
                    <SortableTableHeader
                      label="KPI"
                      sortKey="_kpi"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                      className="w-[100px] border-r border-border/30"
                      align="center"
                    />
                    <TableHead className="w-[180px] border-r border-border/30 text-center font-semibold text-foreground">
                      Vínculo Orçamento
                    </TableHead>
                    <TableHead className="w-16 text-center font-semibold text-foreground"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((atividade: AtividadeStatus, index: number) => {
                    const globalIndex = startIndex + index;
                    return (
                      <AtividadesTableRow
                        key={atividade.id}
                        atividade={atividade}
                        globalIndex={globalIndex}
                        onRowClick={handleRowClick}
                        formatDate={formatDate}
                        formatTime={formatTime}
                        formatTeam={formatTeam}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile view - Cards */}
            <motion.div
              className="md:hidden p-4 space-y-4"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {currentItems.map((atividade: AtividadeStatus, index: number) => {
                const globalIndex = startIndex + index;
                return (
                  <AtividadeCardMobile
                    key={atividade.id}
                    atividade={atividade}
                    globalIndex={globalIndex}
                    onCardClick={handleRowClick}
                    formatTeam={formatTeam}
                  />
                );
              })}
            </motion.div>

            {/* Paginação modernizada */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center p-4 border-t border-border/50 bg-muted/20">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={cn(
                          "transition-all",
                          currentPage === 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer hover:bg-accent'
                        )}
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
                            className={cn(
                              "cursor-pointer transition-all",
                              currentPage === pageNumber
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                                : "hover:bg-accent"
                            )}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(Math.min(totalPages, currentPage + 1))
                        }
                        className={cn(
                          "transition-all",
                          currentPage === totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer hover:bg-accent'
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 gap-4">
            <div className="p-4 rounded-full bg-muted/50">
              <Calendar className="w-12 h-12 text-muted-foreground opacity-50" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-foreground">
                Nenhuma atividade encontrada
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                Tente ajustar os filtros para ver mais resultados ou crie uma nova atividade
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
