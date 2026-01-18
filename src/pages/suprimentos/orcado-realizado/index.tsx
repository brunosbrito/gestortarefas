import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { useBudgetByContract } from '@/hooks/suprimentos/useBudget';
import { useContracts } from '@/hooks/suprimentos/useContracts';

const OrcadoRealizado = () => {
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);

  const { data: contractsData, isLoading: contractsLoading } = useContracts();
  const { data: budgetData, isLoading: budgetLoading } = useBudgetByContract(
    selectedContractId || 0
  );

  const contracts = contractsData?.data?.contracts || [];
  const execution = budgetData?.data;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Concluído
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Em Progresso
          </Badge>
        );
      case 'over_budget':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Acima do Orçado
          </Badge>
        );
      case 'not_started':
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Não Iniciado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orçado vs Realizado</h1>
        <p className="text-muted-foreground">
          Acompanhamento de execução orçamentária por contrato
        </p>
      </div>

      {/* Seletor de Contrato */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione um Contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedContractId?.toString() || ''}
            onValueChange={(value) => setSelectedContractId(Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um contrato para visualizar" />
            </SelectTrigger>
            <SelectContent>
              {contractsLoading ? (
                <SelectItem value="loading" disabled>
                  Carregando contratos...
                </SelectItem>
              ) : (
                contracts.map((contract: any) => (
                  <SelectItem key={contract.id} value={contract.id.toString()}>
                    {contract.name} - {contract.client}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Conteúdo quando contrato é selecionado */}
      {selectedContractId && !budgetLoading && execution && (
        <>
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Valor Previsto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(execution.totalPredictedValue)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Valor Realizado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(execution.totalRealizedValue)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Progresso Físico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{execution.physicalProgress}%</p>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full bg-green-600"
                    style={{ width: `${execution.physicalProgress}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Progresso Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-purple-600">
                  {execution.financialProgress.toFixed(2)}%
                </p>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full bg-purple-600"
                    style={{ width: `${Math.min(execution.financialProgress, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas */}
          {execution.alerts && execution.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Alertas ({execution.alerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {execution.alerts.map((alert) => (
                  <Alert key={alert.id} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                    <div className="flex gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <AlertTitle>{alert.message}</AlertTitle>
                        {alert.suggestedAction && (
                          <AlertDescription className="mt-2">
                            <strong>Ação sugerida:</strong> {alert.suggestedAction}
                          </AlertDescription>
                        )}
                      </div>
                    </div>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Itens de Orçamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Itens de Orçamento ({execution.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {execution.items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum item de orçamento encontrado</p>
                  <Button variant="outline" className="mt-4">
                    Importar Orçamento
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {execution.items.map((item) => (
                    <div key={item.budgetItemId} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">Item {item.budgetItemId}</h4>
                            {getStatusBadge(item.status)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Previsto</p>
                              <p className="font-medium">{formatCurrency(item.predictedValue)}</p>
                              {item.predictedQuantity && (
                                <p className="text-xs text-muted-foreground">
                                  Qtd: {item.predictedQuantity}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-muted-foreground">Realizado</p>
                              <p className="font-medium text-blue-600">
                                {formatCurrency(item.realizedValue)}
                              </p>
                              {item.realizedQuantity !== undefined && (
                                <p className="text-xs text-muted-foreground">
                                  Qtd: {item.realizedQuantity}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-muted-foreground">Variação</p>
                              <div className="flex items-center gap-1">
                                {item.variance > 0 ? (
                                  <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-500" />
                                )}
                                <p className={`font-medium ${item.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(Math.abs(item.variance))}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {item.variancePercent > 0 ? '+' : ''}
                                {item.variancePercent.toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">NFs Vinculadas</p>
                              <p className="font-medium">{item.linkedNFs.length}</p>
                              {item.linkedNFs.length > 0 && (
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                  Ver detalhes
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progresso do item */}
                      {item.status !== 'not_started' && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progresso</span>
                            <span>
                              {((item.realizedValue / item.predictedValue) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                item.status === 'over_budget'
                                  ? 'bg-red-500'
                                  : item.status === 'completed'
                                  ? 'bg-green-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{
                                width: `${Math.min((item.realizedValue / item.predictedValue) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Estado vazio quando nenhum contrato selecionado */}
      {!selectedContractId && (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Selecione um Contrato</h3>
            <p className="text-muted-foreground">
              Escolha um contrato acima para visualizar a execução orçamentária
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {selectedContractId && budgetLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados de execução...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrcadoRealizado;
