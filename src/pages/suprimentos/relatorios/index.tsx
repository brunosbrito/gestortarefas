import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Eye,
  CalendarClock,
  Mail,
  Play,
  Pause,
  X,
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

interface ScheduledReport {
  id: string;
  name: string;
  templateId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 for Sunday-Saturday
  dayOfMonth?: number; // 1-31
  time: string; // HH:MM format
  recipients: string[];
  filters: Record<string, any>;
  exportFormat: 'pdf' | 'excel' | 'csv';
  active: boolean;
  createdAt: Date;
  lastRun?: Date;
  nextRun?: Date;
}

const SCHEDULES_STORAGE_KEY = 'suprimentos-report-schedules';

const Relatorios = () => {
  const { data: templates, isLoading: loadingTemplates } = useReportTemplates();
  const { data: reports, isLoading: loadingReports } = useReports();
  const { data: stats, isLoading: loadingStats } = useReportStats();

  const generateMutation = useGenerateReport();
  const downloadMutation = useDownloadReport();
  const deleteMutation = useDeleteReport();

  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);

  // Scheduling state
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledReport | null>(null);
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState<number>(1);
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState<number>(1);
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleRecipients, setScheduleRecipients] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState('');

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

  // Load scheduled reports from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SCHEDULES_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const schedules: ScheduledReport[] = parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          lastRun: s.lastRun ? new Date(s.lastRun) : undefined,
          nextRun: s.nextRun ? new Date(s.nextRun) : undefined,
        }));
        setScheduledReports(schedules);
      } catch (error) {
        console.error('Error loading scheduled reports:', error);
      }
    }
  }, []);

  // Save scheduled reports to localStorage
  const saveScheduledReports = (schedules: ScheduledReport[]) => {
    setScheduledReports(schedules);
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
  };

  // Calculate next run date
  const calculateNextRun = (
    frequency: 'daily' | 'weekly' | 'monthly',
    time: string,
    dayOfWeek?: number,
    dayOfMonth?: number
  ): Date => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    if (frequency === 'daily') {
      // If time has passed today, schedule for tomorrow
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
    } else if (frequency === 'weekly' && dayOfWeek !== undefined) {
      // Calculate next occurrence of the specified day
      const currentDay = now.getDay();
      let daysUntilNext = dayOfWeek - currentDay;
      if (daysUntilNext < 0 || (daysUntilNext === 0 && nextRun <= now)) {
        daysUntilNext += 7;
      }
      nextRun.setDate(nextRun.getDate() + daysUntilNext);
    } else if (frequency === 'monthly' && dayOfMonth !== undefined) {
      // Schedule for the specified day of month
      nextRun.setDate(dayOfMonth);
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
    }

    return nextRun;
  };

  // Open schedule dialog
  const handleSchedule = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setShowScheduleDialog(true);
    setEditingSchedule(null);
    setScheduleName(`${template.name} - Agendado`);
    setScheduleFrequency('daily');
    setScheduleDayOfWeek(1);
    setScheduleDayOfMonth(1);
    setScheduleTime('09:00');
    setScheduleRecipients([]);
    setNewRecipient('');
  };

  // Save schedule
  const handleSaveSchedule = () => {
    if (!selectedTemplate || !scheduleName.trim() || scheduleRecipients.length === 0) {
      return;
    }

    const nextRun = calculateNextRun(
      scheduleFrequency,
      scheduleTime,
      scheduleDayOfWeek,
      scheduleDayOfMonth
    );

    if (editingSchedule) {
      // Update existing schedule
      const updated = scheduledReports.map((s) =>
        s.id === editingSchedule.id
          ? {
              ...s,
              name: scheduleName,
              frequency: scheduleFrequency,
              dayOfWeek: scheduleDayOfWeek,
              dayOfMonth: scheduleDayOfMonth,
              time: scheduleTime,
              recipients: scheduleRecipients,
              filters: selectedFilters,
              exportFormat,
              nextRun,
            }
          : s
      );
      saveScheduledReports(updated);
    } else {
      // Create new schedule
      const newSchedule: ScheduledReport = {
        id: Date.now().toString(),
        name: scheduleName,
        templateId: selectedTemplate.id,
        frequency: scheduleFrequency,
        dayOfWeek: scheduleDayOfWeek,
        dayOfMonth: scheduleDayOfMonth,
        time: scheduleTime,
        recipients: scheduleRecipients,
        filters: selectedFilters,
        exportFormat,
        active: true,
        createdAt: new Date(),
        nextRun,
      };
      saveScheduledReports([newSchedule, ...scheduledReports]);
    }

    setShowScheduleDialog(false);
    setSelectedTemplate(null);
    setEditingSchedule(null);
  };

  // Toggle schedule active/inactive
  const toggleScheduleActive = (scheduleId: string) => {
    const updated = scheduledReports.map((s) =>
      s.id === scheduleId ? { ...s, active: !s.active } : s
    );
    saveScheduledReports(updated);
  };

  // Delete schedule
  const deleteSchedule = (scheduleId: string) => {
    const updated = scheduledReports.filter((s) => s.id !== scheduleId);
    saveScheduledReports(updated);
  };

  // Add recipient
  const handleAddRecipient = () => {
    const email = newRecipient.trim();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (!scheduleRecipients.includes(email)) {
        setScheduleRecipients([...scheduleRecipients, email]);
      }
      setNewRecipient('');
    }
  };

  // Remove recipient
  const handleRemoveRecipient = (email: string) => {
    setScheduleRecipients(scheduleRecipients.filter((r) => r !== email));
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

  const handlePreview = () => {
    setShowPreviewDialog(true);
  };

  const getMockPreviewData = () => {
    if (!selectedTemplate) return null;

    // Generate mock data based on template category and type
    const mockData: any = {
      title: selectedTemplate.name,
      generatedAt: new Date().toLocaleString('pt-BR'),
      filters: selectedFilters,
      format: exportFormat,
      category: selectedTemplate.category,
    };

    // Mock table data based on category
    if (selectedTemplate.category === 'contract') {
      mockData.tableData = [
        { contrato: 'Contrato 001', fornecedor: 'Fornecedor A', valor: 'R$ 150.000', status: 'Em Andamento' },
        { contrato: 'Contrato 002', fornecedor: 'Fornecedor B', valor: 'R$ 320.000', status: 'Concluído' },
        { contrato: 'Contrato 003', fornecedor: 'Fornecedor C', valor: 'R$ 85.000', status: 'Em Andamento' },
      ];
    } else if (selectedTemplate.category === 'purchase') {
      mockData.tableData = [
        { pedido: 'PO-001', fornecedor: 'Fornecedor X', item: 'Material A', valor: 'R$ 12.500' },
        { pedido: 'PO-002', fornecedor: 'Fornecedor Y', item: 'Material B', valor: 'R$ 8.300' },
        { pedido: 'PO-003', fornecedor: 'Fornecedor Z', item: 'Material C', valor: 'R$ 15.700' },
      ];
    } else if (selectedTemplate.category === 'financial') {
      mockData.tableData = [
        { categoria: 'Material', previsto: 'R$ 100.000', realizado: 'R$ 95.000', variacao: '-5%' },
        { categoria: 'Mão de Obra', previsto: 'R$ 200.000', realizado: 'R$ 215.000', variacao: '+7.5%' },
        { categoria: 'Equipamento', previsto: 'R$ 50.000', realizado: 'R$ 48.000', variacao: '-4%' },
      ];
    } else {
      mockData.tableData = [
        { indicador: 'Métrica A', valor: '85%', meta: '80%', status: 'Acima da Meta' },
        { indicador: 'Métrica B', valor: '92%', meta: '90%', status: 'Acima da Meta' },
        { indicador: 'Métrica C', valor: '75%', meta: '85%', status: 'Abaixo da Meta' },
      ];
    }

    return mockData;
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

  const getFrequencyLabel = (frequency: 'daily' | 'weekly' | 'monthly') => {
    const labels = {
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
    };
    return labels[frequency];
  };

  const getDayOfWeekLabel = (day: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[day];
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
          Geração, agendamento e gerenciamento de relatórios customizáveis
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

      {/* Main Tabs */}
      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="generate">Gerar Relatórios</TabsTrigger>
          <TabsTrigger value="scheduled">
            Agendamentos
            {scheduledReports.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {scheduledReports.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Generate Reports Tab */}
        <TabsContent value="generate" className="space-y-6">
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
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowGenerateDialog(true);
                        }}
                        className="w-full"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Gerar Agora
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSchedule(template)}
                        className="w-full"
                      >
                        <CalendarClock className="h-4 w-4 mr-2" />
                        Agendar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Relatórios Agendados</h2>
            </div>

            {scheduledReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CalendarClock className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-2">
                    Nenhum relatório agendado ainda
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Clique em "Agendar" em qualquer template para criar um agendamento
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {scheduledReports.map((schedule) => {
                  const template = templates?.find((t) => t.id === schedule.templateId);
                  return (
                    <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{schedule.name}</h3>
                              <Badge variant={schedule.active ? 'default' : 'secondary'}>
                                {schedule.active ? 'Ativo' : 'Pausado'}
                              </Badge>
                              <Badge variant="outline">{getFrequencyLabel(schedule.frequency)}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Template: {template?.name || 'N/A'}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground mb-1">Horário</p>
                                <p className="font-medium flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {schedule.time}
                                </p>
                              </div>

                              {schedule.frequency === 'weekly' && schedule.dayOfWeek !== undefined && (
                                <div>
                                  <p className="text-muted-foreground mb-1">Dia da Semana</p>
                                  <p className="font-medium">{getDayOfWeekLabel(schedule.dayOfWeek)}</p>
                                </div>
                              )}

                              {schedule.frequency === 'monthly' && schedule.dayOfMonth !== undefined && (
                                <div>
                                  <p className="text-muted-foreground mb-1">Dia do Mês</p>
                                  <p className="font-medium">Dia {schedule.dayOfMonth}</p>
                                </div>
                              )}

                              <div>
                                <p className="text-muted-foreground mb-1">Formato</p>
                                <p className="font-medium uppercase">{schedule.exportFormat}</p>
                              </div>

                              {schedule.nextRun && (
                                <div>
                                  <p className="text-muted-foreground mb-1">Próxima Execução</p>
                                  <p className="font-medium">
                                    {new Date(schedule.nextRun).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="mt-3">
                              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                Destinatários ({schedule.recipients.length}):
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {schedule.recipients.map((email) => (
                                  <Badge key={email} variant="outline" className="text-xs">
                                    {email}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleScheduleActive(schedule.id)}
                            >
                              {schedule.active ? (
                                <>
                                  <Pause className="h-4 w-4 mr-1" />
                                  Pausar
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-1" />
                                  Ativar
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteSchedule(schedule.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
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
        </TabsContent>
      </Tabs>

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

          <DialogFooter className="flex-row justify-between">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Visualizar Preview
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGenerateReport} disabled={generateMutation.isPending}>
                {generateMutation.isPending ? 'Gerando...' : 'Gerar Relatório'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview do Relatório
            </DialogTitle>
            <DialogDescription>
              Visualização prévia baseada nos filtros e configurações selecionadas
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (() => {
            const previewData = getMockPreviewData();
            if (!previewData) return null;

            return (
              <div className="space-y-6 py-4">
                {/* Report Header */}
                <div className="border-b pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{previewData.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Gerado em: {previewData.generatedAt}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {previewData.format.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Applied Filters Summary */}
                  {Object.keys(selectedFilters).length > 0 && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-2">Filtros Aplicados:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedFilters).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Report Content Preview */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    {getCategoryIcon(previewData.category)}
                    Dados do Relatório (Preview com dados mockados)
                  </h3>

                  {/* Mock Data Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            {previewData.tableData.length > 0 &&
                              Object.keys(previewData.tableData[0]).map((header) => (
                                <th key={header} className="text-left py-3 px-4 font-medium capitalize">
                                  {header}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.tableData.map((row: any, idx: number) => (
                            <tr key={idx} className="border-t hover:bg-muted/30">
                              {Object.values(row).map((value: any, colIdx: number) => (
                                <td key={colIdx} className="py-3 px-4">
                                  {String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Info Note */}
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Nota:</strong> Este é um preview com dados de exemplo. O relatório real será gerado com os dados atuais do sistema quando você clicar em "Gerar Relatório".
                    </p>
                  </div>
                </div>

                {/* Format Options Preview */}
                {selectedTemplate.formatOptions.includeCharts && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Gráficos (serão incluídos)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-muted/50 rounded-lg text-center">
                        <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Gráfico de Barras</p>
                      </div>
                      <div className="p-6 bg-muted/50 rounded-lg text-center">
                        <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Gráfico de Tendências</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Fechar Preview
            </Button>
            <Button
              onClick={() => {
                setShowPreviewDialog(false);
                handleGenerateReport();
              }}
              disabled={generateMutation.isPending}
            >
              <FileText className="h-4 w-4 mr-2" />
              Gerar Relatório Completo
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

      {/* Schedule Report Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Agendar Relatório: {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Configure a frequência e destinatários para geração automática deste relatório
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Schedule Name */}
            <div className="space-y-2">
              <Label htmlFor="schedule-name">Nome do Agendamento *</Label>
              <Input
                id="schedule-name"
                placeholder="Ex: Relatório Mensal de Contratos"
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
              />
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label>Frequência *</Label>
              <Select
                value={scheduleFrequency}
                onValueChange={(value: any) => setScheduleFrequency(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Diário
                    </div>
                  </SelectItem>
                  <SelectItem value="weekly">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Semanal
                    </div>
                  </SelectItem>
                  <SelectItem value="monthly">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4" />
                      Mensal
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Day of Week (for weekly) */}
            {scheduleFrequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Dia da Semana</Label>
                <Select
                  value={scheduleDayOfWeek.toString()}
                  onValueChange={(value) => setScheduleDayOfWeek(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Domingo</SelectItem>
                    <SelectItem value="1">Segunda-feira</SelectItem>
                    <SelectItem value="2">Terça-feira</SelectItem>
                    <SelectItem value="3">Quarta-feira</SelectItem>
                    <SelectItem value="4">Quinta-feira</SelectItem>
                    <SelectItem value="5">Sexta-feira</SelectItem>
                    <SelectItem value="6">Sábado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Day of Month (for monthly) */}
            {scheduleFrequency === 'monthly' && (
              <div className="space-y-2">
                <Label>Dia do Mês</Label>
                <Select
                  value={scheduleDayOfMonth.toString()}
                  onValueChange={(value) => setScheduleDayOfMonth(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        Dia {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Time */}
            <div className="space-y-2">
              <Label htmlFor="schedule-time">Horário *</Label>
              <Input
                id="schedule-time"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>

            {/* Export Format */}
            <div className="space-y-2">
              <Label>Formato de Exportação</Label>
              <Select
                value={exportFormat}
                onValueChange={(value: any) => setExportFormat(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel (XLSX)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recipients */}
            <div className="space-y-2">
              <Label>Destinatários (E-mail) *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="email@exemplo.com"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRecipient();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddRecipient} variant="outline">
                  Adicionar
                </Button>
              </div>

              {scheduleRecipients.length > 0 && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    Destinatários ({scheduleRecipients.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {scheduleRecipients.map((email) => (
                      <Badge key={email} variant="secondary" className="text-xs">
                        {email}
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipient(email)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Info Note */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Nota:</strong> Esta é uma configuração de agendamento mockada para demonstração da interface.
                A geração automática de relatórios requer configuração do backend com serviço de agendamento (cron jobs).
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveSchedule}
              disabled={!scheduleName.trim() || scheduleRecipients.length === 0}
            >
              <CalendarClock className="h-4 w-4 mr-2" />
              Salvar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Relatorios;
