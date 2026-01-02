import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Target,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Filter,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Obra } from '@/interfaces/ObrasInterface';
import ObrasService from '@/services/ObrasService';
import { useToast } from '@/hooks/use-toast';
import { AnaliseAcaoCorretiva } from '@/interfaces/QualidadeInterfaces';
import AnaliseAcaoCorretivaService from '@/services/AnaliseAcaoCorretivaService';
import { Badge } from '@/components/ui/badge';
import { NovaAnaliseDialog } from './NovaAnaliseDialog';
import { DetalhesAnaliseDialog } from './DetalhesAnaliseDialog';

const AcoesCorretivas = () => {
  const { toast } = useToast();
  const [analises, setAnalises] = useState<AnaliseAcaoCorretiva[]>([]);
  const [projetos, setProjetos] = useState<Obra[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<string>('');
  const [statusFiltro, setStatusFiltro] = useState<string>('todas');
  const [loading, setLoading] = useState(true);
  const [showNovaAnaliseDialog, setShowNovaAnaliseDialog] = useState(false);
  const [showDetalhesDialog, setShowDetalhesDialog] = useState(false);
  const [analiseSelecionada, setAnaliseSelecionada] = useState<AnaliseAcaoCorretiva | null>(null);

  const getAllAnalises = async () => {
    try {
      setLoading(true);
      const data = await AnaliseAcaoCorretivaService.getAll();
      setAnalises(data);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as análises e ações corretivas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getProjetos = async () => {
    try {
      const projetos = await ObrasService.getAllObras();
      setProjetos(projetos);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllAnalises();
    getProjetos();
  }, []);

  const analisesFiltradas = analises.filter((analise) => {
    const filtroProjeto = projetoSelecionado
      ? analise.rnc?.project?.id === projetoSelecionado
      : true;

    let filtroStatus = true;
    if (statusFiltro === 'pendentes') {
      filtroStatus = analise.acoes?.some(a => a.status === 'pendente' || a.status === 'em_andamento');
    } else if (statusFiltro === 'concluidas') {
      filtroStatus = analise.acoes?.every(a => a.status === 'concluida' || a.status === 'verificada');
    } else if (statusFiltro === 'atrasadas') {
      filtroStatus = analise.acoes?.some(a => {
        const prazo = new Date(a.quando);
        return prazo < new Date() && a.status !== 'concluida' && a.status !== 'verificada';
      });
    }

    return filtroProjeto && filtroStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'em_andamento':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'concluida':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'verificada':
        return <CheckCircle2 className="w-4 h-4 text-primary" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pendente: { variant: 'secondary', label: 'Pendente' },
      em_andamento: { variant: 'default', label: 'Em Andamento' },
      concluida: { variant: 'outline', label: 'Concluída' },
      verificada: { variant: 'default', label: 'Verificada' },
    };

    const config = variants[status] || { variant: 'secondary', label: status };

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {config.label}
      </Badge>
    );
  };

  const contarAcoesPorStatus = (analise: AnaliseAcaoCorretiva) => {
    const total = analise.acoes?.length || 0;
    const pendentes = analise.acoes?.filter(a => a.status === 'pendente').length || 0;
    const emAndamento = analise.acoes?.filter(a => a.status === 'em_andamento').length || 0;
    const concluidas = analise.acoes?.filter(a => a.status === 'concluida' || a.status === 'verificada').length || 0;

    return { total, pendentes, emAndamento, concluidas };
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="w-8 h-8 text-primary" />
              Análise e Ações Corretivas
            </h1>
            <p className="text-muted-foreground mt-1">
              Análise de causa raiz e planos de ação
            </p>
          </div>
          <Button onClick={() => setShowNovaAnaliseDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Análise
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Obra</label>
              <Select value={projetoSelecionado} onValueChange={setProjetoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as obras" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as obras</SelectItem>
                  {projetos.map((projeto) => (
                    <SelectItem key={projeto.id} value={projeto.id}>
                      {projeto.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="pendentes">Pendentes/Em Andamento</SelectItem>
                  <SelectItem value="concluidas">Concluídas</SelectItem>
                  <SelectItem value="atrasadas">Atrasadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Análises */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : analisesFiltradas.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma análise encontrada</p>
                <p className="text-sm mt-2">
                  {statusFiltro !== 'todas' || projetoSelecionado
                    ? 'Tente ajustar os filtros'
                    : 'Crie uma nova análise para começar'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analisesFiltradas.map((analise) => {
              const { total, pendentes, emAndamento, concluidas } = contarAcoesPorStatus(analise);
              const progressoPercentual = total > 0 ? (concluidas / total) * 100 : 0;

              return (
                <Card
                  key={analise.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    setAnaliseSelecionada(analise);
                    setShowDetalhesDialog(true);
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base line-clamp-2">
                        RNC #{analise.rnc?.code} - {analise.rnc?.description}
                      </CardTitle>
                      <Badge variant="outline" className="shrink-0">
                        {analise.metodoAnalise === 'cinco_porques' && '5 Porquês'}
                        {analise.metodoAnalise === 'ishikawa' && 'Ishikawa'}
                        {analise.metodoAnalise === 'ambos' && 'Ambos'}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {analise.rnc?.project?.name}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Causa Raiz */}
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Causa Raiz Identificada:
                      </p>
                      <p className="text-sm line-clamp-2">
                        {analise.causaRaizIdentificada}
                      </p>
                    </div>

                    {/* Progresso */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{Math.round(progressoPercentual)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${progressoPercentual}%` }}
                        />
                      </div>
                    </div>

                    {/* Contadores de Ações */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                        <div className="text-lg font-bold text-yellow-600 dark:text-yellow-500">
                          {pendentes}
                        </div>
                        <div className="text-xs text-yellow-600/70 dark:text-yellow-500/70">
                          Pendentes
                        </div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-500">
                          {emAndamento}
                        </div>
                        <div className="text-xs text-blue-600/70 dark:text-blue-500/70">
                          Em Curso
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded">
                        <div className="text-lg font-bold text-green-600 dark:text-green-500">
                          {concluidas}
                        </div>
                        <div className="text-xs text-green-600/70 dark:text-green-500/70">
                          Concluídas
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between items-center border-t pt-4">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(analise.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialog de Nova Análise */}
        <NovaAnaliseDialog
          open={showNovaAnaliseDialog}
          onOpenChange={setShowNovaAnaliseDialog}
          onSuccess={getAllAnalises}
        />

        {/* Dialog de Detalhes */}
        <DetalhesAnaliseDialog
          open={showDetalhesDialog}
          onOpenChange={setShowDetalhesDialog}
          analise={analiseSelecionada}
          onUpdate={getAllAnalises}
        />
      </div>
    </Layout>
  );
};

export default AcoesCorretivas;
