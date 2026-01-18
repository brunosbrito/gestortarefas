/**
 * Visualização Gantt do Cronograma
 * Sistema: Gestor Master - GMX Soluções Industriais
 * Módulo: Cronogramas
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  ArrowLeft,
  RefreshCw,
  Download,
  AlertCircle,
  Plus,
  FileDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import CronogramaService from '@/services/CronogramaService';
import TarefaCronogramaService from '@/services/TarefaCronogramaService';
import type { Cronograma, TarefaCronograma, DashboardCronograma } from '@/interfaces/CronogramaInterfaces';
import GanttChart from './GanttChart';
import { NovaTarefaDialog } from '../tarefas/NovaTarefaDialog';
import { ImportarAtividadesDialog } from '../configuracoes/ImportarAtividadesDialog';

type ViewMode = 'Day' | 'Week' | 'Month';

export default function GanttView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [cronograma, setCronograma] = useState<Cronograma | null>(null);
  const [tarefas, setTarefas] = useState<TarefaCronograma[]>([]);
  const [dashboard, setDashboard] = useState<DashboardCronograma | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('Week');
  const [novaTarefaOpen, setNovaTarefaOpen] = useState(false);
  const [importarOpen, setImportarOpen] = useState(false);
  const [tarefaParaEditar, setTarefaParaEditar] = useState<TarefaCronograma | null>(null);

  const loadCronograma = useCallback(async () => {
    if (!id) return;

    try {
      const data = await CronogramaService.getById(id);
      setCronograma(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar cronograma',
        variant: 'destructive',
      });
    }
  }, [id, toast]);

  const loadTarefas = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await TarefaCronogramaService.getAll(id);
      setTarefas(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar tarefas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  const loadDashboard = useCallback(async () => {
    if (!id) return;

    try {
      const data = await CronogramaService.getDashboard(id);
      setDashboard(data);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadCronograma();
      loadTarefas();
      loadDashboard();
    }
  }, [id, loadCronograma, loadTarefas, loadDashboard]);

  const handleSincronizar = async () => {
    if (!id) return;

    setSyncing(true);
    try {
      const result = await TarefaCronogramaService.sincronizarProgresso(id);

      toast({
        title: 'Sucesso',
        description: `${result.sincronizadas} tarefas sincronizadas com sucesso`,
      });

      // Recarregar dados
      await loadTarefas();
      await loadDashboard();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Erro ao sincronizar progresso',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleExportPDF = async () => {
    if (!id) return;

    try {
      const blob = await CronogramaService.exportarPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cronograma-${cronograma?.nome || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Sucesso',
        description: 'PDF exportado com sucesso',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar PDF',
        variant: 'destructive',
      });
    }
  };

  const handleTaskClick = (tarefa: TarefaCronograma) => {
    setTarefaParaEditar(tarefa);
    setNovaTarefaOpen(true);
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await TarefaCronogramaService.delete(taskId);
      toast({
        title: 'Tarefa deletada',
        description: 'A tarefa foi removida com sucesso.',
      });
      await loadTarefas();
      await loadDashboard();
    } catch (error: any) {
      console.error('Erro ao deletar tarefa:', error);

      // Extrair mensagem específica do backend
      let errorMessage = 'Erro ao deletar tarefa';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Mensagens amigáveis para erros comuns
      if (errorMessage.includes('dependenc')) {
        errorMessage = 'Esta tarefa não pode ser deletada pois outras tarefas dependem dela.';
      } else if (errorMessage.includes('subtarefa') || errorMessage.includes('filha')) {
        errorMessage = 'Esta tarefa possui subtarefas. Delete as subtarefas primeiro.';
      } else if (errorMessage.includes('Network Error') || errorMessage.includes('ERR_CONNECTION')) {
        errorMessage = 'Erro de conexão com o servidor.';
      }

      toast({
        title: 'Erro ao deletar',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planejamento: 'bg-gray-100 text-gray-700',
      ativo: 'bg-blue-100 text-blue-700',
      pausado: 'bg-yellow-100 text-yellow-700',
      concluido: 'bg-green-100 text-green-700',
      cancelado: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || colors.planejamento;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      planejamento: 'Planejamento',
      ativo: 'Ativo',
      pausado: 'Pausado',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading || !cronograma) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Carregando cronograma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/cronograma')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="w-8 h-8" />
              {cronograma.nome}
            </h1>
            <Badge className={getStatusColor(cronograma.status)}>
              {getStatusLabel(cronograma.status)}
            </Badge>
          </div>
          {cronograma.descricao && (
            <p className="text-muted-foreground mt-1">{cronograma.descricao}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            Obra: <span className="font-medium">{cronograma.project?.name || 'N/A'}</span>
            {' • '}
            {new Date(cronograma.dataInicio).toLocaleDateString('pt-BR')} até{' '}
            {new Date(cronograma.dataFim).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Barra de Ações */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setImportarOpen(true)}
        >
          <FileDown className="w-4 h-4 mr-2" />
          Importar Atividades
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setNovaTarefaOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSincronizar}
          disabled={syncing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          Sincronizar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPDF}
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* KPIs */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Tarefas</CardDescription>
              <CardTitle className="text-3xl">{dashboard.totalTarefas}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Concluídas</CardDescription>
              <CardTitle className="text-3xl text-green-600 dark:text-green-400">
                {dashboard.tarefasConcluidas}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Em Andamento</CardDescription>
              <CardTitle className="text-3xl text-blue-600 dark:text-blue-400">
                {dashboard.tarefasEmAndamento}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Atrasadas</CardDescription>
              <CardTitle className="text-3xl text-red-600 dark:text-red-400">
                {dashboard.tarefasAtrasadas}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Bloqueadas</CardDescription>
              <CardTitle className="text-3xl text-orange-600 dark:text-orange-400">
                {dashboard.tarefasBloqueadas}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Alertas Críticos */}
      {dashboard && dashboard.alertas && dashboard.alertas.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-orange-900 dark:text-orange-100">
                Alertas ({dashboard.alertas.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboard.alertas.slice(0, 3).map((alerta) => (
                <div key={alerta.id} className="text-sm">
                  <span className="font-medium text-orange-900 dark:text-orange-100">
                    {alerta.titulo}
                  </span>
                  {' - '}
                  <span className="text-orange-700 dark:text-orange-300">
                    {alerta.descricao}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Gantt */}
      {tarefas.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                Nenhuma tarefa cadastrada
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Importe atividades ou crie tarefas manualmente para visualizar o cronograma
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setImportarOpen(true)}>
                  <FileDown className="w-4 h-4 mr-2" />
                  Importar Atividades
                </Button>
                <Button onClick={() => setNovaTarefaOpen(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Tarefa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <GanttChart
          tarefas={tarefas}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onTaskClick={handleTaskClick}
          onAddTask={() => {
            setTarefaParaEditar(null);
            setNovaTarefaOpen(true);
          }}
          onTaskDelete={handleTaskDelete}
          onReload={() => {
            loadTarefas();
            loadDashboard();
          }}
        />
      )}

      {/* Dialogs */}
      {id && (
        <>
          <NovaTarefaDialog
            open={novaTarefaOpen}
            onOpenChange={(open) => {
              setNovaTarefaOpen(open);
              if (!open) setTarefaParaEditar(null);
            }}
            cronogramaId={id}
            tarefaParaEditar={tarefaParaEditar}
            onSaveSuccess={() => {
              loadTarefas();
              loadDashboard();
              setTarefaParaEditar(null);
            }}
          />

          <ImportarAtividadesDialog
            open={importarOpen}
            onOpenChange={setImportarOpen}
            cronogramaId={id}
            projectId={cronograma?.projectId || ''}
            onImportSuccess={() => {
              loadTarefas();
              loadDashboard();
            }}
          />
        </>
      )}
    </div>
  );
}
