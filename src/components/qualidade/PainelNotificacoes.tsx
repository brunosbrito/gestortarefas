import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  BellOff,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  FileText,
  Trash2,
  Settings as SettingsIcon,
  X,
} from 'lucide-react';
import NotificacaoQualidadeService, {
  NotificacaoQualidade,
  AlertaResumo,
} from '@/services/NotificacaoQualidadeService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export const PainelNotificacoes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState<NotificacaoQualidade[]>([]);
  const [resumo, setResumo] = useState<AlertaResumo | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadResumo();
    const interval = setInterval(loadResumo, 60000); // Atualizar a cada minuto
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      loadNotificacoes();
    }
  }, [open]);

  const loadResumo = async () => {
    try {
      const data = await NotificacaoQualidadeService.getResumo();
      setResumo(data);
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    }
  };

  const loadNotificacoes = async () => {
    try {
      setLoading(true);
      const data = await NotificacaoQualidadeService.getAll({
        limit: 20,
      });
      setNotificacoes(data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarComoLida = async (id: string) => {
    try {
      await NotificacaoQualidadeService.marcarComoLida(id);
      await loadNotificacoes();
      await loadResumo();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar a notificação como lida.',
        variant: 'destructive',
      });
    }
  };

  const handleMarcarTodasLidas = async () => {
    try {
      await NotificacaoQualidadeService.marcarTodasComoLidas();
      await loadNotificacoes();
      await loadResumo();
      toast({
        title: 'Sucesso',
        description: 'Todas as notificações foram marcadas como lidas.',
      });
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar todas as notificações.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNotificacao = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await NotificacaoQualidadeService.delete(id);
      await loadNotificacoes();
      await loadResumo();
      toast({
        title: 'Sucesso',
        description: 'Notificação removida.',
      });
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a notificação.',
        variant: 'destructive',
      });
    }
  };

  const handleClickNotificacao = async (notificacao: NotificacaoQualidade) => {
    if (!notificacao.lida) {
      await handleMarcarComoLida(notificacao.id);
    }

    if (notificacao.referenciaUrl) {
      navigate(notificacao.referenciaUrl);
      setOpen(false);
    }
  };

  const getPrioridadeIcon = (prioridade: string) => {
    const icons = {
      baixa: <Bell className="w-4 h-4 text-blue-600" />,
      media: <Clock className="w-4 h-4 text-yellow-600" />,
      alta: <AlertTriangle className="w-4 h-4 text-orange-600" />,
      urgente: <AlertCircle className="w-4 h-4 text-red-600" />,
    };
    return icons[prioridade as keyof typeof icons] || icons.baixa;
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const variants = {
      baixa: 'bg-blue-50 text-blue-700 border-blue-200',
      media: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      alta: 'bg-orange-50 text-orange-700 border-orange-200',
      urgente: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
      <Badge
        variant="outline"
        className={variants[prioridade as keyof typeof variants] || variants.baixa}
      >
        {prioridade.toUpperCase()}
      </Badge>
    );
  };

  const getTipoIcon = (tipo: string) => {
    const icons = {
      calibracao: '⚙️',
      rnc: '⚠️',
      certificado: '📜',
      acao_corretiva: '✓',
      inspecao: '🔍',
    };
    return icons[tipo as keyof typeof icons] || '📌';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {resumo && resumo.naoLidas > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {resumo.naoLidas > 9 ? '9+' : resumo.naoLidas}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Notificações</CardTitle>
                <CardDescription>
                  {resumo
                    ? `${resumo.naoLidas} não lida${resumo.naoLidas !== 1 ? 's' : ''} de ${resumo.total}`
                    : 'Carregando...'}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {resumo && resumo.naoLidas > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarcarTodasLidas}
                    className="text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Marcar todas
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BellOff className="w-12 h-12 text-muted-foreground opacity-50 mb-3" />
                <p className="text-sm font-medium text-foreground">
                  Nenhuma notificação
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Você está em dia com tudo!
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {notificacoes.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-accent cursor-pointer transition-colors ${
                        !notif.lida ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => handleClickNotificacao(notif)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5">{getTipoIcon(notif.tipo)}</span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              {getPrioridadeIcon(notif.prioridade)}
                              <p className="text-sm font-medium truncate">
                                {notif.titulo}
                              </p>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 flex-shrink-0"
                              onClick={(e) => handleDeleteNotificacao(notif.id, e)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>

                          <p className="text-xs text-muted-foreground mb-2">
                            {notif.descricao}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(notif.dataGeracao), 'dd/MM/yyyy HH:mm', {
                                locale: ptBR,
                              })}
                            </span>

                            {getPrioridadeBadge(notif.prioridade)}
                          </div>

                          {notif.metadata && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {notif.metadata.diasVencimento !== undefined && (
                                <span>
                                  Vence em {notif.metadata.diasVencimento} dia
                                  {notif.metadata.diasVencimento !== 1 ? 's' : ''}
                                </span>
                              )}
                              {notif.metadata.nomeEquipamento && (
                                <span> • {notif.metadata.nomeEquipamento}</span>
                              )}
                              {notif.metadata.obraNome && (
                                <span> • {notif.metadata.obraNome}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
