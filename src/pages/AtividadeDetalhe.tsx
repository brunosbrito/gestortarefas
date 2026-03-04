import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  Clock,
  Users,
  Play,
  Pause,
  CheckCircle2,
  Upload,
  RefreshCw,
  Building2,
  FileText,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getActivityById } from '@/services/ActivityService';
import { getStoredToken } from '@/services/AuthService';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { AtualizarStatusDialog } from '@/components/atividades/AtualizarStatusDialog';
import { AtualizarProgressoDialog } from '@/components/atividades/AtualizarProgressoDialog';
import { TrocarEquipeDialog } from '@/components/atividades/TrocarEquipeDialog';
import { UploadImageDialog } from '@/components/atividades/UploadImageDialog';
import { useToast } from '@/hooks/use-toast';

const AtividadeDetalhe = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [atividade, setAtividade] = useState<AtividadeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [novoStatus, setNovoStatus] = useState('');
  const [progressoDialogOpen, setProgressoDialogOpen] = useState(false);
  const [equipeDialogOpen, setEquipeDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      // Salvar URL atual para redirecionar depois do login
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/');
      return;
    }

    fetchAtividade();
  }, [activityId, navigate]);

  const fetchAtividade = async () => {
    if (!activityId) return;

    try {
      setLoading(true);
      const data = await getActivityById(Number(activityId));
      setAtividade(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar atividade:', err);
      setError('Não foi possível carregar a atividade.');
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar a atividade.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planejadas':
        return 'bg-blue-500';
      case 'Em execução':
        return 'bg-green-500';
      case 'Paralizadas':
        return 'bg-yellow-500';
      case 'Concluídas':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch {
      return '-';
    }
  };

  const formatTime = (hours: number) => {
    if (!hours || hours <= 0) return '00:00';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const calculateElapsedTime = () => {
    if (!atividade) return 0;
    let total = atividade.totalTime || 0;
    if (atividade.status === 'Em execução' && atividade.startDate) {
      const startDateTime = new Date(atividade.startDate);
      const now = new Date();
      const elapsedHours =
        (now.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
      total += elapsedHours;
    }
    return total;
  };

  const calculateProgress = () => {
    if (!atividade || !atividade.quantity) return 0;
    return Math.min(
      Math.round((atividade.completedQuantity / atividade.quantity) * 100),
      100
    );
  };

  const getMacroTaskName = () => {
    if (!atividade?.macroTask) return '-';
    if (typeof atividade.macroTask === 'string') return atividade.macroTask;
    return atividade.macroTask.name;
  };

  const getProcessName = () => {
    if (!atividade?.process) return '-';
    if (typeof atividade.process === 'string') return atividade.process;
    return atividade.process.name;
  };

  const handleStatusChange = (newStatus: string) => {
    setNovoStatus(newStatus);
    setStatusDialogOpen(true);
  };

  const getAvailableStatusActions = () => {
    if (!atividade) return [];

    switch (atividade.status) {
      case 'Planejadas':
        return [{ status: 'Em execução', label: 'Iniciar', icon: Play }];
      case 'Em execução':
        return [
          { status: 'Paralizadas', label: 'Paralizar', icon: Pause },
          { status: 'Concluídas', label: 'Concluir', icon: CheckCircle2 },
        ];
      case 'Paralizadas':
        return [
          { status: 'Em execução', label: 'Retomar', icon: Play },
          { status: 'Concluídas', label: 'Concluir', icon: CheckCircle2 },
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Carregando atividade...
          </p>
        </div>
      </div>
    );
  }

  if (error || !atividade) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">
              {error || 'Atividade não encontrada'}
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = calculateProgress();
  const elapsedTime = calculateElapsedTime();
  const statusActions = getAvailableStatusActions();

  return (
    <div className="min-h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003366] to-[#004d99] text-white p-4 md:p-6">
          <div className="w-full">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 mb-3"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold">
                  Atividade #{atividade.cod_sequencial}
                </h1>
                <p className="text-white/80 text-sm md:text-base mt-1 line-clamp-2">
                  {atividade.description}
                </p>
              </div>
              <Badge className={`${getStatusColor(atividade.status)} text-white shrink-0 self-start sm:self-center`}>
                {atividade.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Grid responsivo: 1 coluna mobile, 2 colunas tablet, 3 colunas desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Projeto e OS */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Projeto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground shrink-0">Nome:</span>
                  <span className="font-medium text-right truncate">{atividade.project.name}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground shrink-0">Cliente:</span>
                  <span className="text-right truncate">{atividade.project.client || '-'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground shrink-0">OS:</span>
                  <span className="font-medium">
                    N° {atividade.serviceOrder.serviceOrderNumber}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Classificação */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Classificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground shrink-0">Tarefa Macro:</span>
                  <span className="text-right truncate">{getMacroTaskName()}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground shrink-0">Processo:</span>
                  <span className="text-right truncate">{getProcessName()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tempos */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tempos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground shrink-0">Tempo Previsto:</span>
                  <span className="font-medium">{atividade.estimatedTime || '-'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground shrink-0">Tempo Trabalhado:</span>
                  <span
                    className={`font-medium ${
                      atividade.status === 'Em execução' ? 'text-green-600' : ''
                    }`}
                  >
                    {formatTime(elapsedTime)}
                    {atividade.status === 'Em execução' && ' (em andamento)'}
                  </span>
                </div>
                {atividade.startDate && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground shrink-0">Início:</span>
                    <span>{formatDate(atividade.startDate)}</span>
                  </div>
                )}
                {atividade.endDate && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground shrink-0">Conclusão:</span>
                    <span>{formatDate(atividade.endDate)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progresso - ocupa 2 colunas em desktop */}
            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Progresso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {atividade.completedQuantity || 0} / {atividade.quantity} un
                  </span>
                  <span className="font-bold text-lg">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setProgressoDialogOpen(true)}
                  disabled={atividade.status === 'Concluídas'}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Progresso
                </Button>
              </CardContent>
            </Card>

            {/* Equipe */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Equipe ({atividade.collaborators?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {atividade.collaborators && atividade.collaborators.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {atividade.collaborators.map((colaborador) => (
                      <div
                        key={colaborador.id}
                        className="flex items-center justify-between text-sm bg-muted/50 rounded-md p-2"
                      >
                        <span className="font-medium truncate">{colaborador.name}</span>
                        <span className="text-muted-foreground text-xs shrink-0 ml-2">
                          {colaborador.funcao || colaborador.role || '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum colaborador atribuído
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setEquipeDialogOpen(true)}
                  disabled={atividade.status === 'Concluídas'}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Trocar Equipe
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Ações de Status e Upload */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Ações de Status */}
            {statusActions.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ações de Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {statusActions.map((action) => (
                      <Button
                        key={action.status}
                        variant={
                          action.status === 'Concluídas' ? 'default' : 'outline'
                        }
                        className={
                          action.status === 'Concluídas'
                            ? 'bg-[#FF7F0E] hover:bg-[#FF7F0E]/90'
                            : ''
                        }
                        onClick={() => handleStatusChange(action.status)}
                      >
                        <action.icon className="h-4 w-4 mr-2" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload de Fotos */}
            <Card className={statusActions.length === 0 ? 'md:col-span-2' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Fotos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload de Fotos
                </Button>

                {/* Imagens existentes */}
                {atividade.images && atividade.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-3">
                    {atividade.images.map((image) => (
                      <div key={image.id} className="aspect-square relative">
                        <img
                          src={
                            image.imagePath.startsWith('http')
                              ? image.imagePath
                              : `https://api.gmxindustrial.com.br${image.imagePath}`
                          }
                          alt={image.description || 'Imagem da atividade'}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialogs */}
        <AtualizarStatusDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          atividade={{
            id: String(atividade.id),
            collaborators: atividade.collaborators,
          }}
          novoStatus={novoStatus}
          onSuccess={fetchAtividade}
        />

        <AtualizarProgressoDialog
          open={progressoDialogOpen}
          onOpenChange={setProgressoDialogOpen}
          atividade={{
            id: atividade.id,
            quantity: atividade.quantity,
            completedQuantity: atividade.completedQuantity,
          }}
          onSuccess={fetchAtividade}
        />

        <TrocarEquipeDialog
          open={equipeDialogOpen}
          onOpenChange={setEquipeDialogOpen}
          atividadeId={atividade.id}
          currentCollaborators={atividade.collaborators || []}
          onSuccess={fetchAtividade}
        />

        <UploadImageDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          atividadeId={atividade.id}
          onSuccess={fetchAtividade}
        />
      </div>
  );
};

export default AtividadeDetalhe;
