import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  FileText,
  X,
  ExternalLink,
} from "lucide-react";
import { useContractRealizedValue } from "@/hooks/suprimentos/useContracts";
import { useNFs } from "@/hooks/suprimentos/useNF";
import { useNavigate } from "react-router-dom";

interface ContractDetailsModalProps {
  contract: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContractDetailsModal = ({ contract, open, onOpenChange }: ContractDetailsModalProps) => {
  const navigate = useNavigate();
  const { data: realizedData, isLoading: loadingRealized } = useContractRealizedValue(contract?.id || 0);
  const { data: nfsData, isLoading: loadingNFs } = useNFs(contract?.id);

  if (!contract) return null;

  const realized = realizedData?.data;
  const nfs = nfsData?.data?.nfs || [];
  const isOverBudget = realized && realized.valor_realizado > realized.valor_original;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Em Andamento': 'bg-primary/10 text-primary',
      'Concluído': 'bg-success/10 text-success',
      'Pausado': 'bg-warning/10 text-warning',
      'Finalizando': 'bg-blue-500/10 text-blue-500',
    };
    return colors[status] || 'bg-muted/10 text-muted-foreground';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-3">
                <Building2 className="h-6 w-6" />
                {contract.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {contract.client || 'Cliente não informado'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(contract.status)}>{contract.status}</Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  onOpenChange(false);
                  navigate(`/suprimentos/contratos/${contract.id}`);
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="budget">Orçamento</TabsTrigger>
            <TabsTrigger value="nfs">Notas Fiscais ({nfs.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Contract Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações do Contrato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      Data de Início
                    </div>
                    <p className="font-medium">{formatDate(contract.startDate)}</p>
                  </div>
                  {contract.endDate && (
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        Data de Término
                      </div>
                      <p className="font-medium">{formatDate(contract.endDate)}</p>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4" />
                      Valor Contratado
                    </div>
                    <p className="font-medium text-lg">{formatCurrency(contract.value)}</p>
                  </div>
                  {contract.type && (
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <FileText className="h-4 w-4" />
                        Tipo
                      </div>
                      <p className="font-medium">{contract.type}</p>
                    </div>
                  )}
                </div>

                {contract.description && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Descrição</p>
                    <p className="text-sm">{contract.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRealized ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : realized ? (
                  <div className="space-y-4">
                    {/* Progress Bars */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Valor Previsto</span>
                        <span className="font-medium">{formatCurrency(realized.valor_original)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: '100%' }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Realizado</span>
                        <span className={`font-medium ${isOverBudget ? 'text-destructive' : ''}`}>
                          {formatCurrency(realized.valor_realizado)} ({realized.percentual_realizado.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${isOverBudget ? 'bg-destructive' : 'bg-gradient-primary'}`}
                          style={{ width: `${Math.min(realized.percentual_realizado, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Saldo Restante</p>
                        <p className={`font-bold ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
                          {formatCurrency(realized.saldo_restante)}
                        </p>
                      </div>
                      <div className="text-center border-x">
                        <p className="text-xs text-muted-foreground mb-1">NFs Validadas</p>
                        <p className="font-bold">{realized.nfs_validadas} / {realized.total_nfs}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Status Financeiro</p>
                        <div className="flex items-center justify-center gap-1">
                          {isOverBudget ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-destructive" />
                              <span className="text-sm font-bold text-destructive">Acima</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-4 w-4 text-success" />
                              <span className="text-sm font-bold text-success">Dentro</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Dados financeiros não disponíveis
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Itens de Orçamento</CardTitle>
              </CardHeader>
              <CardContent>
                {contract.budgetItems && contract.budgetItems.length > 0 ? (
                  <div className="space-y-2">
                    {contract.budgetItems.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantidade: {item.quantity} {item.unit}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(item.totalValue)}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(item.unitPrice)} / {item.unit}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Nenhum item de orçamento cadastrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* NFs Tab */}
          <TabsContent value="nfs" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Notas Fiscais Vinculadas</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    navigate('/suprimentos/notas-fiscais', { state: { contractId: contract.id } });
                  }}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Ver Todas as NFs
                </Button>
              </CardHeader>
              <CardContent>
                {loadingNFs ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : nfs.length > 0 ? (
                  <div className="space-y-3">
                    {nfs.slice(0, 5).map((nf: any) => (
                      <div key={nf.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">NF {nf.numero}</p>
                              <Badge variant="outline" className="text-xs">
                                {nf.status_processamento}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {nf.nome_fornecedor} • {formatDate(nf.data_emissao)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(nf.valor_total)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {nfs.length > 5 && (
                      <p className="text-xs text-center text-muted-foreground pt-2">
                        + {nfs.length - 5} nota(s) fiscal(is) adicional(is)
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Nenhuma nota fiscal vinculada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
