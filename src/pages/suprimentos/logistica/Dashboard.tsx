// Dashboard de Logística - Visão Executiva
import { useMemo } from 'react';
import { useVehicles } from '@/hooks/suprimentos/logistica/useVehicles';
import { useChecklistsSaida } from '@/hooks/suprimentos/logistica/useChecklistsSaida';
import { useManutencoes } from '@/hooks/suprimentos/logistica/useManutencoes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Car,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  MapPin,
  TrendingUp,
  Clock,
  DollarSign,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function LogisticaDashboard() {
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useVehicles();
  const { data: checklistsSaida = [], isLoading: isLoadingChecklists } = useChecklistsSaida();
  const { data: manutencoes = [], isLoading: isLoadingManutencoes } = useManutencoes();

  const isLoading = isLoadingVehicles || isLoadingChecklists || isLoadingManutencoes;

  // KPIs principais
  const kpis = useMemo(() => {
    const viagensAbertas = checklistsSaida.filter((c) => !c.viagem_finalizada);
    const manutencoesAgendadas = manutencoes.filter((m) => m.status === 'agendada');
    const manutencoesEmAndamento = manutencoes.filter((m) => m.status === 'em_andamento');
    const custosTotaisMes = manutencoes
      .filter((m) => {
        if (!m.data_conclusao) return false;
        const dataManutencao = new Date(m.data_conclusao);
        const mesAtual = new Date().getMonth();
        return dataManutencao.getMonth() === mesAtual;
      })
      .reduce((sum, m) => sum + m.custo_total, 0);

    return {
      totalVeiculos: vehicles.length,
      veiculosPorTipo: {
        carro: vehicles.filter((v) => v.tipo === 'carro').length,
        empilhadeira: vehicles.filter((v) => v.tipo === 'empilhadeira').length,
        caminhao: vehicles.filter((v) => v.tipo === 'caminhao').length,
      },
      viagensAbertas: viagensAbertas.length,
      manutencoesAgendadas: manutencoesAgendadas.length,
      manutencoesEmAndamento: manutencoesEmAndamento.length,
      custosTotaisMes,
    };
  }, [vehicles, checklistsSaida, manutencoes]);

  // Veículos com alertas
  const veiculosComAlerta = useMemo(() => {
    const hoje = new Date();
    return vehicles
      .filter((v) => {
        if (!v.crlv_validade) return false;
        const diasParaVencer = differenceInDays(new Date(v.crlv_validade), hoje);
        return diasParaVencer <= 30 && diasParaVencer >= 0;
      })
      .map((v) => ({
        ...v,
        diasParaVencer: differenceInDays(new Date(v.crlv_validade), hoje),
      }));
  }, [vehicles]);

  // Viagens abertas recentes
  const viagensAbertas = useMemo(() => {
    return checklistsSaida
      .filter((c) => !c.viagem_finalizada)
      .sort((a, b) => new Date(b.data_hora_saida).getTime() - new Date(a.data_hora_saida).getTime())
      .slice(0, 5);
  }, [checklistsSaida]);

  // Manutenções próximas
  const manutencoesProximas = useMemo(() => {
    return manutencoes
      .filter((m) => m.status === 'agendada' || m.status === 'em_andamento')
      .sort((a, b) => {
        const dateA = new Date(a.data_agendada || a.data_inicio || '');
        const dateB = new Date(b.data_agendada || b.data_inicio || '');
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  }, [manutencoes]);

  // Dados para gráfico de tipos de veículos
  const veiculosPorTipoData = [
    { name: 'Carros', value: kpis.veiculosPorTipo.carro, color: '#3b82f6' },
    { name: 'Empilhadeiras', value: kpis.veiculosPorTipo.empilhadeira, color: '#f59e0b' },
    { name: 'Caminhões', value: kpis.veiculosPorTipo.caminhao, color: '#10b981' },
  ];

  // Dados para gráfico de custos por mês (últimos 6 meses)
  const custosPorMesData = useMemo(() => {
    const meses = [];
    for (let i = 5; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const mes = data.toLocaleString('pt-BR', { month: 'short' });
      const mesNum = data.getMonth();

      const custosMes = manutencoes
        .filter((m) => {
          if (!m.data_conclusao) return false;
          const dataManutencao = new Date(m.data_conclusao);
          return dataManutencao.getMonth() === mesNum;
        })
        .reduce((sum, m) => sum + m.custo_total, 0);

      meses.push({
        mes: mes.charAt(0).toUpperCase() + mes.slice(1),
        custo: custosMes,
      });
    }
    return meses;
  }, [manutencoes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Logística</h1>
        <p className="text-muted-foreground">Visão geral da frota e operações</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Veículos</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalVeiculos}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {kpis.veiculosPorTipo.carro} carros
              </Badge>
              <Badge variant="outline" className="text-xs">
                {kpis.veiculosPorTipo.empilhadeira} empil.
              </Badge>
              <Badge variant="outline" className="text-xs">
                {kpis.veiculosPorTipo.caminhao} cam.
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viagens em Andamento</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.viagensAbertas}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Veículos atualmente em viagem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manutenções Pendentes</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.manutencoesAgendadas + kpis.manutencoesEmAndamento}
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {kpis.manutencoesAgendadas} agendadas
              </Badge>
              <Badge variant="default" className="text-xs">
                {kpis.manutencoesEmAndamento} em andamento
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custos do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.custosTotaisMes.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Manutenções realizadas este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Custos */}
        <Card>
          <CardHeader>
            <CardTitle>Custos de Manutenção</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={custosPorMesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    value.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })
                  }
                />
                <Bar dataKey="custo" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Veículos por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Frota por Tipo</CardTitle>
            <CardDescription>Distribuição de veículos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={veiculosPorTipoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {veiculosPorTipoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Widgets de Informações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas de Veículos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Alertas de Veículos
            </CardTitle>
            <CardDescription>
              {veiculosComAlerta.length} veículo(s) com CRLV vencendo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {veiculosComAlerta.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Todos os veículos estão regulares
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {veiculosComAlerta.slice(0, 3).map((veiculo) => (
                  <div
                    key={veiculo.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{veiculo.placa}</p>
                      <p className="text-sm text-muted-foreground">
                        CRLV vence em {veiculo.diasParaVencer} dias
                      </p>
                    </div>
                    <Badge variant="destructive">Urgente</Badge>
                  </div>
                ))}
                {veiculosComAlerta.length > 3 && (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/suprimentos/logistica/veiculos">
                      Ver todos ({veiculosComAlerta.length})
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Viagens Abertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Viagens em Andamento
            </CardTitle>
            <CardDescription>{viagensAbertas.length} viagem(ns) ativa(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {viagensAbertas.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Nenhuma viagem em andamento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {viagensAbertas.map((viagem) => (
                  <div
                    key={viagem.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{viagem.veiculo_placa}</p>
                      <p className="text-sm text-muted-foreground">
                        {viagem.motorista_nome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Saída: {format(new Date(viagem.data_hora_saida), 'dd/MM HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                    <Badge variant="default">Em viagem</Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/suprimentos/logistica/checklists-saida">Ver todas</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manutenções Próximas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Manutenções Próximas
            </CardTitle>
            <CardDescription>{manutencoesProximas.length} manutenção(ões)</CardDescription>
          </CardHeader>
          <CardContent>
            {manutencoesProximas.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Nenhuma manutenção pendente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {manutencoesProximas.map((manutencao) => (
                  <div
                    key={manutencao.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{manutencao.veiculo_placa}</p>
                      <p className="text-sm text-muted-foreground">
                        {manutencao.tipo_manutencao_nome}
                      </p>
                      {manutencao.data_agendada && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(manutencao.data_agendada), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        manutencao.status === 'em_andamento' ? 'default' : 'outline'
                      }
                    >
                      {manutencao.status === 'em_andamento' ? 'Em andamento' : 'Agendada'}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/suprimentos/logistica/manutencoes">Ver todas</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20" asChild>
              <Link to="/suprimentos/logistica/checklists-saida">
                <div className="flex flex-col items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span className="text-sm">Novo Check-list Saída</span>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-20" asChild>
              <Link to="/suprimentos/logistica/checklists-retorno">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm">Finalizar Viagem</span>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-20" asChild>
              <Link to="/suprimentos/logistica/manutencoes">
                <div className="flex flex-col items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  <span className="text-sm">Nova Manutenção</span>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-20" asChild>
              <Link to="/suprimentos/logistica/veiculos">
                <div className="flex flex-col items-center gap-2">
                  <Car className="h-5 w-5" />
                  <span className="text-sm">Gerenciar Veículos</span>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
