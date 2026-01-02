import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Target,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { AcaoCorretiva } from '@/interfaces/QualidadeInterfaces';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import ColaboradorService from '@/services/ColaboradorService';

interface PlanoAcaoFormProps {
  value?: AcaoCorretiva[];
  onChange: (acoes: AcaoCorretiva[]) => void;
}

export const PlanoAcaoForm = ({ value, onChange }: PlanoAcaoFormProps) => {
  const [acoes, setAcoes] = useState<Partial<AcaoCorretiva>[]>(value || []);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [expandedAcao, setExpandedAcao] = useState<number | null>(null);

  useEffect(() => {
    loadColaboradores();
  }, []);

  const loadColaboradores = async () => {
    try {
      const data = await ColaboradorService.getAllColaboradores();
      setColaboradores(data);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
    }
  };

  const adicionarAcao = () => {
    const novaAcao: Partial<AcaoCorretiva> = {
      id: `temp-${Date.now()}`,
      oQue: '',
      porque: '',
      quemId: '',
      quando: '',
      onde: '',
      como: '',
      quantoCusta: undefined,
      status: 'pendente',
      observacoes: '',
    };

    const novasAcoes = [...acoes, novaAcao];
    setAcoes(novasAcoes);
    onChange(novasAcoes as AcaoCorretiva[]);
    setExpandedAcao(novasAcoes.length - 1);
  };

  const removerAcao = (index: number) => {
    const novasAcoes = acoes.filter((_, i) => i !== index);
    setAcoes(novasAcoes);
    onChange(novasAcoes as AcaoCorretiva[]);
    if (expandedAcao === index) {
      setExpandedAcao(null);
    }
  };

  const atualizarAcao = (index: number, campo: keyof AcaoCorretiva, valor: any) => {
    const novasAcoes = acoes.map((acao, i) => {
      if (i === index) {
        return { ...acao, [campo]: valor };
      }
      return acao;
    });

    setAcoes(novasAcoes);
    onChange(novasAcoes as AcaoCorretiva[]);
  };

  const getStatusBadge = (status?: string) => {
    const config = {
      pendente: { variant: 'secondary' as const, label: 'Pendente', icon: AlertCircle },
      em_andamento: { variant: 'default' as const, label: 'Em Andamento', icon: Clock },
      concluida: { variant: 'outline' as const, label: 'Concluída', icon: CheckCircle2 },
      verificada: { variant: 'default' as const, label: 'Verificada', icon: CheckCircle2 },
    };

    const { variant, label, icon: Icon } = config[status as keyof typeof config] || config.pendente;

    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const calcularProgressoGeral = () => {
    if (acoes.length === 0) return 0;
    const concluidas = acoes.filter(
      (a) => a.status === 'concluida' || a.status === 'verificada'
    ).length;
    return Math.round((concluidas / acoes.length) * 100);
  };

  const progresso = calcularProgressoGeral();

  return (
    <div className="space-y-6">
      {/* Header com Resumo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Plano de Ação (5W2H)
              </CardTitle>
              <CardDescription className="mt-1">
                Defina as ações corretivas necessárias para eliminar a causa raiz
              </CardDescription>
            </div>
            <Button onClick={adicionarAcao} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Ação
            </Button>
          </div>
        </CardHeader>
        {acoes.length > 0 && (
          <CardContent>
            <div className="space-y-3">
              {/* Estatísticas */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{acoes.length}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {acoes.filter((a) => a.status === 'pendente').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Pendentes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {acoes.filter((a) => a.status === 'em_andamento').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Em Curso</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {acoes.filter((a) => a.status === 'concluida' || a.status === 'verificada').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Concluídas</div>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso Geral</span>
                  <span className="font-medium">{progresso}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progresso}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Lista de Ações */}
      {acoes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma ação corretiva adicionada</p>
              <p className="text-sm mt-2">Clique em "Nova Ação" para começar</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {acoes.map((acao, index) => (
            <Card key={acao.id || index} className="border-l-4 border-l-primary">
              <CardHeader className="cursor-pointer" onClick={() => setExpandedAcao(expandedAcao === index ? null : index)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <CardTitle className="text-base line-clamp-1">
                        {acao.oQue || 'Nova Ação (clique para editar)'}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(acao.status)}
                      {acao.quando && (
                        <Badge variant="outline" className="gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(acao.quando).toLocaleDateString('pt-BR')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removerAcao(index);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              {expandedAcao === index && (
                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* O Quê (What) */}
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-sm font-semibold">O Quê? (What)</Label>
                      <Textarea
                        placeholder="O que deve ser feito?"
                        value={acao.oQue}
                        onChange={(e) => atualizarAcao(index, 'oQue', e.target.value)}
                        rows={2}
                        className="resize-none"
                      />
                    </div>

                    {/* Por Quê (Why) */}
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-sm font-semibold">Por Quê? (Why)</Label>
                      <Textarea
                        placeholder="Por que esta ação é necessária?"
                        value={acao.porque}
                        onChange={(e) => atualizarAcao(index, 'porque', e.target.value)}
                        rows={2}
                        className="resize-none"
                      />
                    </div>

                    {/* Quem (Who) */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Quem? (Who)</Label>
                      <Select
                        value={acao.quemId}
                        onValueChange={(value) => atualizarAcao(index, 'quemId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          {colaboradores.map((colab) => (
                            <SelectItem key={colab.id} value={colab.id}>
                              {colab.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quando (When) */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Quando? (When)</Label>
                      <Input
                        type="date"
                        value={acao.quando}
                        onChange={(e) => atualizarAcao(index, 'quando', e.target.value)}
                      />
                    </div>

                    {/* Onde (Where) */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Onde? (Where)</Label>
                      <Input
                        placeholder="Onde será executada?"
                        value={acao.onde}
                        onChange={(e) => atualizarAcao(index, 'onde', e.target.value)}
                      />
                    </div>

                    {/* Quanto Custa (How Much) */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Quanto Custa? (How Much)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={acao.quantoCusta || ''}
                          onChange={(e) =>
                            atualizarAcao(index, 'quantoCusta', parseFloat(e.target.value) || undefined)
                          }
                          className="pl-9"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* Como (How) */}
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-sm font-semibold">Como? (How)</Label>
                      <Textarea
                        placeholder="Como será executada? Descreva o método/procedimento..."
                        value={acao.como}
                        onChange={(e) => atualizarAcao(index, 'como', e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Status</Label>
                      <Select
                        value={acao.status}
                        onValueChange={(value) => atualizarAcao(index, 'status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                          <SelectItem value="concluida">Concluída</SelectItem>
                          <SelectItem value="verificada">Verificada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Observações */}
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-sm font-semibold">Observações</Label>
                      <Textarea
                        placeholder="Observações adicionais..."
                        value={acao.observacoes}
                        onChange={(e) => atualizarAcao(index, 'observacoes', e.target.value)}
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
