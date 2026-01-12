import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Trash2,
  BarChart3,
  FileSpreadsheet,
  FileDown,
  Clock,
  TrendingUp,
} from 'lucide-react';
import {
  useReportTemplates,
  useReports,
  useReportStats,
  useGenerateReport,
  useDownloadReport,
  useDeleteReport,
} from '@/hooks/suprimentos/useReports';
import { ReportTemplate } from '@/interfaces/suprimentos/ReportInterface';
import { ConfirmDialog } from '@/components/suprimentos/ConfirmDialog';

const Relatorios = () => {
  const { data: templates, isLoading: loadingTemplates } = useReportTemplates();
  const { data: reports, isLoading: loadingReports } = useReports();
  const { data: stats, isLoading: loadingStats } = useReportStats();

  const generateMutation = useGenerateReport();
  const downloadMutation = useDownloadReport();
  const deleteMutation = useDeleteReport();

  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleGenerateReport = () => {
    if (!selectedTemplate) return;

    generateMutation.mutate(
      {
        templateId: selectedTemplate.id,
        filters: selectedFilters,
        exportFormat,
      },
      {
        onSuccess: () => {
          setShowGenerateDialog(false);
          setSelectedTemplate(null);
          setSelectedFilters({});
        },
      }
    );
  };

  const handleDownload = (reportId: string) => {
    downloadMutation.mutate(reportId);
  };

  const handleDelete = (reportId: string) => {
    setDeleteReportId(reportId);
  };

  const confirmDelete = () => {
    if (deleteReportId) {
      deleteMutation.mutate(deleteReportId, {
        onSuccess: () => {
          setDeleteReportId(null);
        },
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      contract: FileText,
      purchase: FileSpreadsheet,
      financial: BarChart3,
      operational: TrendingUp,
    };
    const Icon = icons[category] || FileText;
    return <Icon className="h-5 w-5" />;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      contract: 'text-blue-500',
      purchase: 'text-green-500',
      financial: 'text-purple-500',
      operational: 'text-orange-500',
    };
    return colors[category] || 'text-gray-500';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      analytical: 'Analítico',
      summary: 'Resumo',
      dashboard: 'Dashboard',
      compliance: 'Conformidade',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      generating: { variant: 'default', label: 'Gerando' },
      completed: { variant: 'outline', label: 'Concluído', className: 'bg-green-50 text-green-700' },
      failed: { variant: 'destructive', label: 'Erro' },
    };
    const config = variants[status] || { variant: 'default', label: status };

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (loadingTemplates || loadingStats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Geração de relatórios customizáveis</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground">
          Geração e gerenciamento de relatórios customizáveis
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Total de Relatórios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalGenerated || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.thisMonth || 0} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Download className="h-4 w-4 text-green-500" />
              Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalDownloads || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Total de downloads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Mais Usado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{stats?.mostUsedTemplate || 'N/A'}</p>
            <p className="text-xs text-muted-foreground mt-1">Template popular</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileDown className="h-4 w-4 text-orange-500" />
              Tamanho Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats?.avgFileSize ? formatBytes(stats.avgFileSize) : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Por relatório</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Templates */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Templates de Relatórios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates?.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div
                    className={`p-2 rounded-lg bg-muted ${getCategoryColor(template.category)}`}
                  >
                    {getCategoryIcon(template.category)}
                  </div>
                  <Badge variant="outline">{getTypeLabel(template.type)}</Badge>
                </div>
                <CardTitle className="mt-4">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Campos:</strong> {template.fields.length} campos
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Filtros:</strong> {template.filters.length} disponíveis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Formato:</strong> {template.formatOptions.pageOrientation}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowGenerateDialog(true);
                  }}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Report History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Histórico de Relatórios</h2>
        <Card>
          <CardContent className="p-0">
            {loadingReports ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Carregando histórico...</p>
              </div>
            ) : reports && reports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4">Nome do Relatório</th>
                      <th className="text-left py-3 px-4">Gerado Por</th>
                      <th className="text-left py-3 px-4">Data</th>
                      <th className="text-center py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Tamanho</th>
                      <th className="text-center py-3 px-4">Downloads</th>
                      <th className="text-center py-3 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{report.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Template:{' '}
                              {templates?.find((t) => t.id === report.templateId)?.name || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{report.generatedBy}</td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {formatDate(report.generatedAt)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">{getStatusBadge(report.status)}</td>
                        <td className="py-3 px-4 text-right text-sm">
                          {report.fileSize ? formatBytes(report.fileSize) : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline">{report.downloadCount}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(report.id)}
                              disabled={
                                report.status !== 'completed' || downloadMutation.isPending
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(report.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  Nenhum relatório gerado ainda. Selecione um template acima para começar.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generate Report Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerar Relatório: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Export Format Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Formato de Exportação</label>
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel (XLSX)
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileDown className="h-4 w-4" />
                      CSV
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filters */}
            {selectedTemplate && selectedTemplate.filters.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="h-4 w-4" />
                  <label className="text-sm font-medium">Filtros</label>
                </div>

                {selectedTemplate.filters.map((filter) => (
                  <div key={filter.field}>
                    <label className="text-sm font-medium mb-2 block">{filter.label}</label>
                    {filter.type === 'select' && filter.options && (
                      <Select
                        onValueChange={(value) =>
                          setSelectedFilters((prev) => ({
                            ...prev,
                            [filter.field]: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {filter.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {filter.type === 'date_range' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          onChange={(e) =>
                            setSelectedFilters((prev) => ({
                              ...prev,
                              [filter.field]: {
                                ...prev[filter.field],
                                start: e.target.value,
                              },
                            }))
                          }
                        />
                        <span className="text-muted-foreground">até</span>
                        <input
                          type="date"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          onChange={(e) =>
                            setSelectedFilters((prev) => ({
                              ...prev,
                              [filter.field]: {
                                ...prev[filter.field],
                                end: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    )}
                    {filter.type === 'number_range' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Mínimo"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          onChange={(e) =>
                            setSelectedFilters((prev) => ({
                              ...prev,
                              [filter.field]: {
                                ...prev[filter.field],
                                min: parseFloat(e.target.value),
                              },
                            }))
                          }
                        />
                        <span className="text-muted-foreground">-</span>
                        <input
                          type="number"
                          placeholder="Máximo"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          onChange={(e) =>
                            setSelectedFilters((prev) => ({
                              ...prev,
                              [filter.field]: {
                                ...prev[filter.field],
                                max: parseFloat(e.target.value),
                              },
                            }))
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Format Options Info */}
            {selectedTemplate && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-2">Opções de Formatação</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    • Orientação: {selectedTemplate.formatOptions.pageOrientation === 'portrait' ? 'Retrato' : 'Paisagem'}
                  </p>
                  <p>
                    • Gráficos:{' '}
                    {selectedTemplate.formatOptions.includeCharts ? 'Incluídos' : 'Não incluídos'}
                  </p>
                  {selectedTemplate.formatOptions.footerText && (
                    <p>• Rodapé: {selectedTemplate.formatOptions.footerText}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerateReport} disabled={generateMutation.isPending}>
              {generateMutation.isPending ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteReportId}
        onOpenChange={(open) => !open && setDeleteReportId(null)}
        onConfirm={confirmDelete}
        title="Excluir Relatório"
        description="Tem certeza que deseja excluir este relatório? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Relatorios;
