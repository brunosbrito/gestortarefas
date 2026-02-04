import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  FileText,
  Target,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Edit,
} from 'lucide-react';
import { MetaSMART } from '@/interfaces/GestaoProcessosInterfaces';
import MetaSMARTService from '@/services/gestaoProcessos/MetaSMARTService';
import { StatusBadge } from '../../components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { LayoutGestaoProcessos } from '../../LayoutGestaoProcessos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function MetaSMARTDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [meta, setMeta] = useState<MetaSMART | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMeta();
  }, [id]);

  const loadMeta = async () => {
    try {
      setIsLoading(true);
      const data = await MetaSMARTService.getById(id!);

      if (!data) {
        toast({
          title: 'Erro',
          description: 'Meta SMART não encontrada',
          variant: 'destructive',
        });
        navigate('/gestao-processos/metas');
        return;
      }

      setMeta(data);
    } catch (error) {
      console.error('Erro ao carregar meta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a meta',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMilestone = async (milestoneId: string, newStatus: string) => {
    if (!meta) return;

    try {
      const dataConclusao =
        newStatus === 'concluida' || newStatus === 'verificada'
          ? new Date().toISOString().split('T')[0]
          : undefined;

      await MetaSMARTService.atualizarMilestone(meta.id, milestoneId, newStatus, dataConclusao);
      toast({
        title: 'Sucesso',
        description: 'Milestone atualizado com sucesso',
      });
      loadMeta();
    } catch (error) {
      console.error('Erro ao atualizar milestone:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o milestone',
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!meta) {
    return null;
  }

  const getCriterioIcon = (criterio: string) => {
    const icons = {
      specific: Target,
      measurable: TrendingUp,
      attainable: CheckCircle2,
      relevant: Target,
      timeBound: Calendar,
    };
    return icons[criterio as keyof typeof icons] || Target;
  };

  const getMilestoneStatusColor = (status: string) => {
    const colors = {
      pendente: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      em_andamento: 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
      concluida: 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400',
      verificada: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
      atrasada: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400',
    };
    return colors[status as keyof typeof colors] || colors.pendente;
  };

  const getMilestoneStatusIcon = (status: string) => {
    const icons = {
      pendente: AlertCircle,
      em_andamento: Clock,
      concluida: CheckCircle2,
      verificada: CheckCircle2,
      atrasada: AlertCircle,
    };
    const Icon = icons[status as keyof typeof icons] || AlertCircle;
    return Icon;
  };

  return (
    <LayoutGestaoProcessos>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{meta.titulo}</h1>
                  <StatusBadge status={meta.status} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {meta.codigo} • Criado em{' '}
                  {format(new Date(meta.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
              {meta.status === 'rascunho' && (
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </div>

          {/* Progresso Geral */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Meta SMART
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">{meta.meta}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{meta.progresso}%</div>
                  <div className="text-sm text-muted-foreground">Progresso</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={meta.progresso} className="h-3" />
            </CardContent>
          </Card>

          {/* Critérios SMART */}
          <Card>
            <CardHeader>
              <CardTitle>Critérios SMART</CardTitle>
              <CardDescription>
                Specific, Measurable, Attainable, Relevant, Time-bound
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {meta.criterios.map((criterio) => {
                const Icon = getCriterioIcon(criterio.criterio);
                return (
                  <div
                    key={criterio.criterio}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all',
                      criterio.atendido
                        ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20'
                        : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={cn(
                            'p-2 rounded-lg',
                            criterio.atendido
                              ? 'bg-green-600 text-white'
                              : 'bg-red-600 text-white'
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg mb-2">
                            {criterio.criterio === 'specific' && 'Específico (Specific)'}
                            {criterio.criterio === 'measurable' && 'Mensurável (Measurable)'}
                            {criterio.criterio === 'attainable' && 'Atingível (Attainable)'}
                            {criterio.criterio === 'relevant' && 'Relevante (Relevant)'}
                            {criterio.criterio === 'timeBound' && 'Temporal (Time-bound)'}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {criterio.descricao}
                          </p>
                          {criterio.evidencia && (
                            <div className="mt-2 p-2 bg-background rounded text-sm">
                              <span className="font-medium">Evidência:</span> {criterio.evidencia}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={criterio.atendido ? 'default' : 'destructive'}
                        className={cn(
                          criterio.atendido
                            ? 'bg-green-600'
                            : 'bg-red-600'
                        )}
                      >
                        {criterio.atendido ? 'Atendido' : 'Não Atendido'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Detalhamento SMART */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Específico */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Específico (What, Who, Where)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">O Quê:</span>
                  <p className="text-sm mt-1">{meta.especifico.oQue}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Quem:</span>
                  <p className="text-sm mt-1">{meta.especifico.quem}</p>
                </div>
                {meta.especifico.onde && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Onde:</span>
                    <p className="text-sm mt-1">{meta.especifico.onde}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mensurável */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mensurável</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Indicador:</span>
                  <p className="text-sm mt-1">{meta.mensuravel.indicador}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Valor Atual:</span>
                    <p className="text-lg font-bold">
                      {meta.mensuravel.valorAtual} {meta.mensuravel.unidadeMedida}
                    </p>
                  </div>
                  <div className="text-2xl text-muted-foreground">→</div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Valor Meta:</span>
                    <p className="text-lg font-bold text-primary">
                      {meta.mensuravel.valorMeta} {meta.mensuravel.unidadeMedida}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Forma de Acompanhamento:
                  </span>
                  <p className="text-sm mt-1">{meta.mensuravel.formaAcompanhamento}</p>
                </div>
              </CardContent>
            </Card>

            {/* Atingível */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Atingível</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Recursos Disponíveis:
                  </span>
                  <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                    {meta.atingivel.recursos.map((recurso, i) => (
                      <li key={i}>{recurso}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Viabilidade:</span>
                  <p className="text-sm mt-1">{meta.atingivel.viabilidade}</p>
                </div>
                {meta.atingivel.limitacoes && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Limitações:</span>
                    <p className="text-sm mt-1">{meta.atingivel.limitacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Relevante */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Relevante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Alinhamento Estratégico:
                  </span>
                  <p className="text-sm mt-1">{meta.relevante.alinhamentoEstrategico}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Benefícios:</span>
                  <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                    {meta.relevante.beneficios.map((beneficio, i) => (
                      <li key={i}>{beneficio}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Impacto:</span>
                  <p className="text-sm mt-1">{meta.relevante.impacto}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Temporal - Milestones */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Marcos Temporais (Milestones)</CardTitle>
                  <CardDescription>
                    Período: {format(new Date(meta.temporal.dataInicio), 'dd/MM/yyyy')} até{' '}
                    {format(new Date(meta.temporal.dataFim), 'dd/MM/yyyy')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {meta.temporal.milestones.map((milestone, index) => {
                  const StatusIcon = getMilestoneStatusIcon(milestone.status);
                  return (
                    <div
                      key={milestone.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium">{milestone.descricao}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Previsão: {format(new Date(milestone.dataPrevisao), 'dd/MM/yyyy')}
                              </div>
                              {milestone.dataConclusao && (
                                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Concluído: {format(new Date(milestone.dataConclusao), 'dd/MM/yyyy')}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Responsável: {milestone.responsavelNome}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={cn(
                                'flex items-center gap-1',
                                getMilestoneStatusColor(milestone.status)
                              )}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {milestone.status === 'pendente' && 'Pendente'}
                              {milestone.status === 'em_andamento' && 'Em Andamento'}
                              {milestone.status === 'concluida' && 'Concluída'}
                              {milestone.status === 'verificada' && 'Verificada'}
                              {milestone.status === 'atrasada' && 'Atrasada'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Revisões */}
          {meta.revisoes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Revisões Periódicas</CardTitle>
                <CardDescription>Histórico de acompanhamento da meta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {meta.revisoes.map((revisao, index) => (
                    <div
                      key={revisao.id}
                      className="relative pl-6 pb-4 border-l-2 border-muted last:pb-0"
                    >
                      <div className="absolute left-0 top-0 w-4 h-4 -ml-[9px] rounded-full bg-primary border-2 border-background" />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            Revisão {meta.revisoes.length - index}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(revisao.data), "dd/MM/yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-sm text-muted-foreground">Revisor:</span>
                            <span className="text-sm ml-2">{revisao.revisorNome}</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Progresso:</span>
                            <span className="text-sm ml-2 font-bold">{revisao.progresso}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">
                            Situação:
                          </span>
                          <p className="text-sm mt-1">{revisao.situacao}</p>
                        </div>
                        {revisao.observacoes && (
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Observações:
                            </span>
                            <p className="text-sm mt-1">{revisao.observacoes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contexto e Vinculação */}
          {(meta.contexto || meta.desdobramentoId) && (
            <Card>
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {meta.contexto && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Contexto:</span>
                    <p className="text-sm mt-1">{meta.contexto}</p>
                  </div>
                )}
                {meta.desdobramentoId && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Vinculado a Desdobramento:
                    </span>
                    <p className="text-sm mt-1">ID: {meta.desdobramentoId}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Vinculação:</span>
                  <p className="text-sm mt-1">
                    {meta.tipoVinculacao === 'obra' && `Obra: ${meta.obraNome}`}
                    {meta.tipoVinculacao === 'setor' && `Setor: ${meta.setorNome}`}
                    {meta.tipoVinculacao === 'independente' && 'Independente'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </LayoutGestaoProcessos>
  );
}
