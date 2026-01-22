import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  FileText,
  Save,
  Target,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { PlanoAcao5W2H, Acao5W2H } from '@/interfaces/GestaoProcessosInterfaces';
import PlanoAcao5W2HService from '@/services/gestaoProcessos/PlanoAcao5W2HService';
import ColaboradorService from '@/services/ColaboradorService';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import { Acao5W2HCard } from '../components/Acao5W2HCard';
import { StatusBadge } from '../../components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { LayoutGestaoProcessos } from '../../LayoutGestaoProcessos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PlanoAcaoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [plano, setPlano] = useState<PlanoAcao5W2H | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedAcao, setExpandedAcao] = useState<number | null>(null);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [planoData, colaboradoresData] = await Promise.all([
        PlanoAcao5W2HService.getById(id!),
        ColaboradorService.getAllColaboradores(),
      ]);

      if (!planoData) {
        toast({
          title: 'Erro',
          description: 'Plano de ação não encontrado',
          variant: 'destructive',
        });
        navigate('/gestao-processos/planos-acao');
        return;
      }

      setPlano(planoData);
      setColaboradores(colaboradoresData);
    } catch (error) {
      console.error('Erro ao carregar plano:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o plano de ação',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAcao = (index: number, campo: keyof Acao5W2H, valor: any) => {
    if (!plano) return;

    const acoesAtualizadas = plano.acoes.map((acao, i) => {
      if (i === index) {
        return { ...acao, [campo]: valor };
      }
      return acao;
    });

    setPlano({ ...plano, acoes: acoesAtualizadas });
  };

  const handleAdicionarAcao = () => {
    if (!plano) return;

    const novaAcao: Acao5W2H = {
      id: `temp-${Date.now()}`,
      oQue: '',
      porque: '',
      quemId: '',
      quando: '',
      onde: '',
      como: '',
      status: 'pendente',
    };

    const acoesAtualizadas = [...plano.acoes, novaAcao];
    setPlano({ ...plano, acoes: acoesAtualizadas });
    setExpandedAcao(acoesAtualizadas.length - 1);
  };

  const handleRemoverAcao = (index: number) => {
    if (!plano) return;
    if (!confirm('Tem certeza que deseja remover esta ação?')) return;

    const acoesAtualizadas = plano.acoes.filter((_, i) => i !== index);
    setPlano({ ...plano, acoes: acoesAtualizadas });

    if (expandedAcao === index) {
      setExpandedAcao(null);
    }
  };

  const handleSave = async () => {
    if (!plano) return;

    setIsSaving(true);
    try {
      await PlanoAcao5W2HService.update(plano.id, { acoes: plano.acoes });
      toast({
        title: 'Sucesso',
        description: 'Plano de ação atualizado com sucesso',
      });
      loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as alterações',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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

  if (!plano) {
    return null;
  }

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
                  <h1 className="text-2xl font-bold">{plano.titulo}</h1>
                  <StatusBadge status={plano.status} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {plano.codigo} • Criado em{' '}
                  {format(new Date(plano.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>

          {/* Cards de Informação e Progresso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Progresso Geral */}
            <Card className="md:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Progresso Geral
                    </CardTitle>
                    <CardDescription className="mt-1">{plano.objetivo}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{plano.progressoGeral}%</div>
                    <div className="text-sm text-muted-foreground">
                      {plano.acoesCompletadas} de {plano.acoesTotal} ações concluídas
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={plano.progressoGeral} className="h-3" />

                {/* Estatísticas das ações */}
                <div className="grid grid-cols-4 gap-4 mt-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-600">
                      {plano.acoes.filter((a) => a.status === 'pendente').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Pendentes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {plano.acoes.filter((a) => a.status === 'em_andamento').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Em Andamento</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {plano.acoes.filter((a) => a.status === 'concluida').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Concluídas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {plano.acoes.filter((a) => a.status === 'verificada').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Verificadas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumo Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Custo Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(plano.custoTotal || 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Prazos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Prazo Início
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {plano.prazoInicio
                    ? format(new Date(plano.prazoInicio), 'dd/MM/yyyy')
                    : 'N/A'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Prazo Fim
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {plano.prazoFim ? format(new Date(plano.prazoFim), 'dd/MM/yyyy') : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Ações */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ações 5W2H</CardTitle>
                  <CardDescription>
                    Gerencie as ações individuais do plano (What, Why, Who, When, Where, How, How
                    Much)
                  </CardDescription>
                </div>
                <Button onClick={handleAdicionarAcao}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Ação
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {plano.acoes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma ação adicionada</p>
                  <p className="text-sm mt-2">Clique em "Nova Ação" para começar</p>
                </div>
              ) : (
                plano.acoes.map((acao, index) => (
                  <Acao5W2HCard
                    key={acao.id}
                    acao={acao}
                    index={index}
                    expanded={expandedAcao === index}
                    onToggle={() => setExpandedAcao(expandedAcao === index ? null : index)}
                    onChange={(campo, valor) => handleUpdateAcao(index, campo, valor)}
                    onDelete={() => handleRemoverAcao(index)}
                    readonly={plano.status === 'aprovado'}
                    colaboradores={colaboradores}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutGestaoProcessos>
  );
}
