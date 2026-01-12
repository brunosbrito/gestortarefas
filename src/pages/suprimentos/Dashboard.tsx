import { useNavigate } from 'react-router-dom';
import { MetricCard } from "./components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  FileText,
  Building2,
  Receipt
} from "lucide-react";
import { useContracts, useContractKPIs } from "@/hooks/suprimentos/useContracts";
import { useNFStats } from "@/hooks/suprimentos/useNF";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: contractsData, isLoading: contractsLoading } = useContracts();
  const { data: contractKPIsData, isLoading: kpisLoading } = useContractKPIs();
  const { data: nfStatsData, isLoading: nfStatsLoading, error: nfStatsError } = useNFStats();

  const contracts = contractsData?.data?.contracts || [];
  const totalValue = contractKPIsData?.data?.totalValue || 0;
  const totalSpent = contractKPIsData?.data?.totalSpent || 0;
  const avgProgress = contractKPIsData?.data?.avgProgress || 0;

  const kpis = [
    {
      title: "Contratos Ativos",
      value: contracts.length,
      format: "number" as const,
      trend: "neutral" as const,
      icon: <Building2 className="h-5 w-5 text-primary" />
    },
    {
      title: "Valor Total dos Contratos",
      value: totalValue,
      format: "currency" as const,
      trend: "neutral" as const,
      icon: <DollarSign className="h-5 w-5 text-success" />
    },
    {
      title: "Total Realizado",
      value: totalSpent,
      format: "currency" as const,
      trend: "up" as const,
      icon: <TrendingUp className="h-5 w-5 text-warning" />
    },
    {
      title: "Total de NFs",
      value: nfStatsData?.data?.total_nfs || 0,
      trend: "neutral" as const,
      icon: <Receipt className="h-5 w-5 text-accent" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Executivo</h1>
          <p className="text-muted-foreground">
            Visão geral dos indicadores de custos e performance
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/suprimentos/relatorios')}
          >
            <FileText className="h-4 w-4" />
            Gerar Relatório
          </Button>
          <Button
            variant="default"
            onClick={() => navigate('/suprimentos/analytics')}
          >
            <TrendingUp className="h-4 w-4" />
            Ver Analytics
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-gradient-card border-0 shadow-card-hover">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-8 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          kpis.map((kpi, index) => (
            <MetricCard
              key={index}
              title={kpi.title}
              value={kpi.value}
              format={kpi.format}
              trend={kpi.trend}
              trendValue={kpi.trendValue}
              icon={kpi.icon}
            />
          ))
        )}
      </div>

      {/* Notas Fiscais Stats */}
      {nfStatsData?.data && !nfStatsError && (
        <Card className="bg-gradient-card border-0 shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Resumo das Notas Fiscais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{nfStatsData.data.total_nfs}</p>
                <p className="text-sm text-muted-foreground">Total de NFs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{nfStatsData.data.validated}</p>
                <p className="text-sm text-muted-foreground">Validadas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{nfStatsData.data.pending_validation}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(nfStatsData.data.total_value)}
                </p>
                <p className="text-sm text-muted-foreground">Valor Total</p>
              </div>
            </div>

            {nfStatsData.data.total_nfs > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Taxa de Validação</span>
                  <span>{((nfStatsData.data.validated / nfStatsData.data.total_nfs) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(nfStatsData.data.validated / nfStatsData.data.total_nfs) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contratos Ativos */}
      <Card className="bg-gradient-card border-0 shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Contratos Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contractsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-muted/30 rounded-lg animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-2 bg-muted rounded mb-2"></div>
                  <div className="flex justify-between">
                    <div className="h-3 w-20 bg-muted rounded"></div>
                    <div className="h-3 w-20 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract, index) => {
                const contractValue = typeof contract.value === 'number' ? contract.value : 0;
                const contractSpent = typeof contract.spent === 'number' ? contract.spent : 0;
                const contractProgress = typeof contract.progress === 'number' ? Math.min(contract.progress, 100) : 0;
                const contractName = contract.name || 'Nome não disponível';

                return (
                  <div key={contract.id || index} className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/suprimentos/contratos')}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-foreground">{contractName}</h4>
                        <p className="text-xs text-muted-foreground">{contract.client || 'Cliente não informado'}</p>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">{contractProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${contractProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Orçado: R$ {contractValue.toLocaleString('pt-BR')}</span>
                      <span className="text-foreground font-medium">Gasto: R$ {contractSpent.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                );
              })}
              {contracts.length === 0 && !contractsLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum contrato ativo encontrado</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/suprimentos/contratos')}
                  >
                    Criar Primeiro Contrato
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
