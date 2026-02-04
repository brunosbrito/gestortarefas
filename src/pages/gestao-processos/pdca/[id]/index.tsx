import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  FileText,
  Target,
  PlayCircle,
  CheckCircle2,
  RotateCw,
  Repeat,
  AlertCircle,
} from 'lucide-react';
import { PDCA } from '@/interfaces/GestaoProcessosInterfaces';
import PDCAService from '@/services/gestaoProcessos/PDCAService';
import { StatusBadge } from '../../components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { LayoutGestaoProcessos } from '../../LayoutGestaoProcessos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function PDCADetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pdca, setPDCA] = useState<PDCA | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('plan');

  useEffect(() => {
    loadPDCA();
  }, [id]);

  const loadPDCA = async () => {
    try {
      setIsLoading(true);
      const data = await PDCAService.getById(id!);

      if (!data) {
        toast({
          title: 'Erro',
          description: 'Ciclo PDCA não encontrado',
          variant: 'destructive',
        });
        navigate('/gestao-processos/pdca');
        return;
      }

      setPDCA(data);
      setActiveTab(data.faseAtual || 'plan');
    } catch (error) {
      console.error('Erro ao carregar PDCA:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o ciclo PDCA',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    toast({
      title: 'Em desenvolvimento',
      description: 'Exportação em PDF será implementada em breve',
    });
  };

  const handleNovoCiclo = async () => {
    if (!pdca) return;

    try {
      const novoCiclo = await PDCAService.iniciarNovoCiclo(pdca.id);
      toast({
        title: 'Sucesso',
        description: `Novo ciclo ${novoCiclo.numeroCiclo} criado com sucesso`,
      });
      navigate(`/gestao-processos/pdca/${novoCiclo.id}`);
    } catch (error) {
      console.error('Erro ao criar novo ciclo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar novo ciclo',
        variant: 'destructive',
      });
    }
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

  if (!pdca) {
    return null;
  }

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
                  <h1 className="text-2xl font-bold">{pdca.titulo}</h1>
                  <StatusBadge status={pdca.status} />
                  {pdca.cicloAnteriorId && (
                    <Badge variant="outline" className="gap-1">
                      <Repeat className="w-3 h-3" />
                      Ciclo {pdca.numeroCiclo}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {pdca.codigo} • Criado em{' '}
                  {format(new Date(pdca.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
              {pdca.statusPDCA === 'concluido' && pdca.act?.novoCicloNecessario && (
                <Button onClick={handleNovoCiclo}>
                  <Repeat className="w-4 h-4 mr-2" />
                  Iniciar Novo Ciclo
                </Button>
              )}
            </div>
          </div>

          {/* Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCw className="w-5 h-5 text-primary" />
                    Ciclo PDCA - {pdca.objetivo}
                  </CardTitle>
                  <CardDescription className="mt-2">{pdca.descricao}</CardDescription>
                </div>
                <div className="text-right">
                  {getStatusPDCABadge(pdca.statusPDCA)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Vinculação:</span>
                  <p className="text-sm mt-1">
                    {pdca.tipoVinculacao === 'obra' && `Obra: ${pdca.obraNome}`}
                    {pdca.tipoVinculacao === 'setor' && `Setor: ${pdca.setorNome}`}
                    {pdca.tipoVinculacao === 'independente' && 'Independente'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Criado por:</span>
                  <p className="text-sm mt-1">{pdca.criadoPorNome}</p>
                </div>
                {pdca.dataInicioPlanejamento && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Início Planejamento:
                    </span>
                    <p className="text-sm mt-1">
                      {format(new Date(pdca.dataInicioPlanejamento), 'dd/MM/yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline Visual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progresso do Ciclo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between relative">
                {/* Plan */}
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                      pdca.plan
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Target className="w-6 h-6" />
                  </div>
                  <span className="text-xs mt-2 font-medium">Plan</span>
                  <span className="text-xs text-muted-foreground">Planejar</span>
                </div>

                {/* Connector */}
                <div className={cn('h-1 flex-1', pdca.do ? 'bg-blue-600' : 'bg-muted')} />

                {/* Do */}
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                      pdca.do
                        ? 'bg-purple-600 text-white'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <PlayCircle className="w-6 h-6" />
                  </div>
                  <span className="text-xs mt-2 font-medium">Do</span>
                  <span className="text-xs text-muted-foreground">Executar</span>
                </div>

                {/* Connector */}
                <div className={cn('h-1 flex-1', pdca.check ? 'bg-purple-600' : 'bg-muted')} />

                {/* Check */}
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                      pdca.check
                        ? 'bg-orange-600 text-white'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs mt-2 font-medium">Check</span>
                  <span className="text-xs text-muted-foreground">Verificar</span>
                </div>

                {/* Connector */}
                <div className={cn('h-1 flex-1', pdca.act ? 'bg-orange-600' : 'bg-muted')} />

                {/* Act */}
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                      pdca.act
                        ? 'bg-green-600 text-white'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <RotateCw className="w-6 h-6" />
                  </div>
                  <span className="text-xs mt-2 font-medium">Act</span>
                  <span className="text-xs text-muted-foreground">Agir</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs de Fases */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="plan" className="gap-2">
                <Target className="w-4 h-4" />
                Plan
              </TabsTrigger>
              <TabsTrigger value="do" className="gap-2" disabled={!pdca.plan}>
                <PlayCircle className="w-4 h-4" />
                Do
              </TabsTrigger>
              <TabsTrigger value="check" className="gap-2" disabled={!pdca.do}>
                <CheckCircle2 className="w-4 h-4" />
                Check
              </TabsTrigger>
              <TabsTrigger value="act" className="gap-2" disabled={!pdca.check}>
                <RotateCw className="w-4 h-4" />
                Act
              </TabsTrigger>
            </TabsList>

            {/* Plan Tab */}
            <TabsContent value="plan" className="space-y-4">
              {pdca.plan ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Fase Plan (Planejar)</CardTitle>
                    <CardDescription>
                      Identificação do problema e planejamento das ações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Problema Identificado</h4>
                      <p className="text-sm">{pdca.plan.problema}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Meta Esperada</h4>
                        <p className="text-sm">{pdca.plan.metaEsperada}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Indicador</h4>
                        <p className="text-sm">{pdca.plan.indicador}</p>
                        {pdca.plan.valorAtual !== undefined && pdca.plan.valorMeta !== undefined && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Atual: {pdca.plan.valorAtual} → Meta: {pdca.plan.valorMeta}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Causa Raiz</h4>
                      <p className="text-sm">{pdca.plan.causaRaiz}</p>
                      {pdca.plan.analiseMetodo && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Método de análise: {pdca.plan.analiseMetodo}
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Ações Planejadas</h4>
                      <ul className="space-y-2">
                        {pdca.plan.acoes.map((acao, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                            {acao}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Responsáveis</h4>
                        <div className="flex flex-wrap gap-2">
                          {pdca.plan.responsaveis.map((resp, index) => (
                            <Badge key={index} variant="outline">
                              {resp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Prazo</h4>
                        <p className="text-sm">
                          {format(new Date(pdca.plan.prazo), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>

                    {pdca.plan.recursos && (
                      <div>
                        <h4 className="font-semibold mb-2">Recursos</h4>
                        <p className="text-sm">{pdca.plan.recursos}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <p className="text-muted-foreground">Fase Plan ainda não foi preenchida</p>
                    <Button className="mt-4">Preencher Fase Plan</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Do Tab */}
            <TabsContent value="do" className="space-y-4">
              {pdca.do ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Fase Do (Executar)</CardTitle>
                    <CardDescription>Execução das ações planejadas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Data Início</h4>
                        <p className="text-sm">
                          {format(new Date(pdca.do.dataInicio), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      {pdca.do.dataFim && (
                        <div>
                          <h4 className="font-semibold mb-2">Data Fim</h4>
                          <p className="text-sm">
                            {format(new Date(pdca.do.dataFim), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold mb-2">Status Execução</h4>
                        <Badge
                          variant={
                            pdca.do.statusExecucao === 'concluida' ? 'default' : 'secondary'
                          }
                        >
                          {pdca.do.statusExecucao === 'pendente' && 'Pendente'}
                          {pdca.do.statusExecucao === 'em_andamento' && 'Em Andamento'}
                          {pdca.do.statusExecucao === 'concluida' && 'Concluída'}
                          {pdca.do.statusExecucao === 'verificada' && 'Verificada'}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Ações Realizadas</h4>
                      <ul className="space-y-2">
                        {pdca.do.acoesRealizadas.map((acao, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                            {acao}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {pdca.do.evidencias && pdca.do.evidencias.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Evidências</h4>
                        <div className="flex flex-wrap gap-2">
                          {pdca.do.evidencias.map((evidencia, index) => (
                            <Badge key={index} variant="outline">
                              <FileText className="w-3 h-3 mr-1" />
                              {evidencia}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {pdca.do.desvios && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                          Desvios Identificados
                        </h4>
                        <p className="text-sm">{pdca.do.desvios}</p>
                      </div>
                    )}

                    {pdca.do.medidasCorretivas && (
                      <div>
                        <h4 className="font-semibold mb-2">Medidas Corretivas</h4>
                        <p className="text-sm">{pdca.do.medidasCorretivas}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <p className="text-muted-foreground">Fase Do ainda não foi preenchida</p>
                    <Button className="mt-4">Preencher Fase Do</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Check Tab */}
            <TabsContent value="check" className="space-y-4">
              {pdca.check ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Fase Check (Verificar)</CardTitle>
                    <CardDescription>Verificação dos resultados obtidos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Data de Verificação</h4>
                        <p className="text-sm">
                          {format(new Date(pdca.check.dataVerificacao), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Meta Atingida?</h4>
                        <Badge variant={pdca.check.metaAtingida ? 'default' : 'destructive'}>
                          {pdca.check.metaAtingida ? 'Sim' : 'Não'}
                        </Badge>
                        {pdca.check.valorAlcancado !== undefined && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Valor alcançado: {pdca.check.valorAlcancado}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Resultados Obtidos</h4>
                      <p className="text-sm">{pdca.check.resultadosObtidos}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Comparação com a Meta</h4>
                      <p className="text-sm">{pdca.check.comparacaoMeta}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Análise de Eficácia</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={pdca.check.eficaz ? 'default' : 'destructive'}>
                          {pdca.check.eficaz ? 'Eficaz' : 'Não Eficaz'}
                        </Badge>
                      </div>
                      <p className="text-sm">{pdca.check.justificativa}</p>
                    </div>

                    {pdca.check.evidencias && pdca.check.evidencias.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Evidências</h4>
                        <div className="flex flex-wrap gap-2">
                          {pdca.check.evidencias.map((evidencia, index) => (
                            <Badge key={index} variant="outline">
                              <FileText className="w-3 h-3 mr-1" />
                              {evidencia}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <p className="text-muted-foreground">Fase Check ainda não foi preenchida</p>
                    <Button className="mt-4">Preencher Fase Check</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Act Tab */}
            <TabsContent value="act" className="space-y-4">
              {pdca.act ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Fase Act (Agir)</CardTitle>
                    <CardDescription>
                      Ações tomadas com base nos resultados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Tipo de Ação</h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          pdca.act.tipo === 'padronizar' &&
                            'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400',
                          pdca.act.tipo === 'melhorar' &&
                            'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
                          pdca.act.tipo === 'novo_ciclo' &&
                            'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400'
                        )}
                      >
                        {pdca.act.tipo === 'padronizar' && 'Padronizar (Eficaz)'}
                        {pdca.act.tipo === 'melhorar' && 'Melhorar (Parcialmente Eficaz)'}
                        {pdca.act.tipo === 'novo_ciclo' && 'Novo Ciclo (Não Eficaz)'}
                      </Badge>
                    </div>

                    {pdca.act.tipo === 'padronizar' && (
                      <>
                        {pdca.act.documentosPadrao && pdca.act.documentosPadrao.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Documentos Padrão Criados</h4>
                            <ul className="space-y-1">
                              {pdca.act.documentosPadrao.map((doc, index) => (
                                <li key={index} className="text-sm flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-primary" />
                                  {doc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {pdca.act.treinamentosRealizados &&
                          pdca.act.treinamentosRealizados.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Treinamentos Realizados</h4>
                              <ul className="space-y-1">
                                {pdca.act.treinamentosRealizados.map((trein, index) => (
                                  <li key={index} className="text-sm">
                                    • {trein}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                        {pdca.act.procedimentosAtualizados &&
                          pdca.act.procedimentosAtualizados.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Procedimentos Atualizados</h4>
                              <ul className="space-y-1">
                                {pdca.act.procedimentosAtualizados.map((proc, index) => (
                                  <li key={index} className="text-sm">
                                    • {proc}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </>
                    )}

                    {pdca.act.problemasRemanescentes && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                          Problemas Remanescentes
                        </h4>
                        <p className="text-sm">{pdca.act.problemasRemanescentes}</p>
                      </div>
                    )}

                    {pdca.act.novoCicloNecessario && (
                      <div>
                        <Badge variant="outline" className="bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400">
                          <Repeat className="w-3 h-3 mr-1" />
                          Novo ciclo necessário
                        </Badge>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-2">Lições Aprendidas</h4>
                      <p className="text-sm">{pdca.act.licoesAprendidas}</p>
                    </div>

                    {pdca.act.observacoes && (
                      <div>
                        <h4 className="font-semibold mb-2">Observações</h4>
                        <p className="text-sm">{pdca.act.observacoes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <p className="text-muted-foreground">Fase Act ainda não foi preenchida</p>
                    <Button className="mt-4">Preencher Fase Act</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Linking Info */}
          {(pdca.cicloAnteriorId || pdca.proximoCicloId || pdca.desdobramentoId) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Relacionamentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pdca.cicloAnteriorId && (
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm">Ciclo Anterior</span>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => navigate(`/gestao-processos/pdca/${pdca.cicloAnteriorId}`)}
                    >
                      Ver Ciclo {pdca.numeroCiclo - 1}
                    </Button>
                  </div>
                )}
                {pdca.proximoCicloId && (
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm">Próximo Ciclo</span>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => navigate(`/gestao-processos/pdca/${pdca.proximoCicloId}`)}
                    >
                      Ver Ciclo {pdca.numeroCiclo + 1}
                    </Button>
                  </div>
                )}
                {pdca.desdobramentoId && (
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm">Desdobramento Vinculado</span>
                    <Badge variant="outline">ID: {pdca.desdobramentoId}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </LayoutGestaoProcessos>
  );
}
