import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShoppingCart,
  FileText,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Loader2,
  Filter,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  usePurchaseRequests,
  usePurchases,
  usePurchaseStats,
  useSelectQuotation,
} from '@/hooks/suprimentos/usePurchases';
import { PurchaseRequest, Quotation } from '@/interfaces/suprimentos/PurchaseInterface';
import { ConfirmDialog } from '@/components/suprimentos/ConfirmDialog';
import { CreatePurchaseModal } from './components/CreatePurchaseModal';

const Compras = () => {
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [selectingQuotation, setSelectingQuotation] = useState<{
    requestId: number;
    quotationId: number;
  } | null>(null);

  // Filter state
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    urgency: '',
    requestedBy: '',
    purchaseStatus: '',
    supplier: '',
  });

  const { data: allRequests, isLoading: loadingRequests } = usePurchaseRequests();
  const { data: allPurchases, isLoading: loadingPurchases } = usePurchases();
  const { data: stats, isLoading: loadingStats } = usePurchaseStats();
  const selectQuotation = useSelectQuotation();

  // Apply filters to requests
  const requests = useMemo(() => {
    if (!allRequests) return [];
    let filtered = [...allRequests];

    if (filters.status && filters.status !== 'todos') {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    if (filters.urgency && filters.urgency !== 'todos') {
      filtered = filtered.filter(r => r.urgency === filters.urgency);
    }

    if (filters.requestedBy.trim()) {
      const search = filters.requestedBy.toLowerCase();
      filtered = filtered.filter(r =>
        r.requestedBy.toLowerCase().includes(search) ||
        r.contractName.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [allRequests, filters]);

  // Apply filters to purchases
  const purchases = useMemo(() => {
    if (!allPurchases) return [];
    let filtered = [...allPurchases];

    if (filters.purchaseStatus && filters.purchaseStatus !== 'todos') {
      filtered = filtered.filter(p => p.status === filters.purchaseStatus);
    }

    if (filters.supplier.trim()) {
      const search = filters.supplier.toLowerCase();
      filtered = filtered.filter(p =>
        p.supplier.toLowerCase().includes(search) ||
        p.contract.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [allPurchases, filters]);

  const handleClearFilters = () => {
    setFilters({
      status: '',
      urgency: '',
      requestedBy: '',
      purchaseStatus: '',
      supplier: '',
    });
  };

  const hasActiveFilters =
    filters.status ||
    filters.urgency ||
    filters.requestedBy ||
    filters.purchaseStatus ||
    filters.supplier;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: PurchaseRequest['status']) => {
    const variants = {
      draft: { variant: 'outline' as const, label: 'Rascunho', icon: FileText },
      submitted: { variant: 'secondary' as const, label: 'Enviado', icon: Clock },
      approved: { variant: 'default' as const, label: 'Aprovado', icon: CheckCircle, className: 'bg-green-500' },
      in_quotation: { variant: 'secondary' as const, label: 'Em Cotação', icon: TrendingUp },
      completed: { variant: 'default' as const, label: 'Concluído', icon: CheckCircle, className: 'bg-green-500' },
      rejected: { variant: 'destructive' as const, label: 'Rejeitado', icon: XCircle },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: PurchaseRequest['urgency']) => {
    const variants = {
      low: { variant: 'outline' as const, label: 'Baixa' },
      medium: { variant: 'secondary' as const, label: 'Média' },
      high: { variant: 'default' as const, label: 'Alta', className: 'bg-orange-500' },
      critical: { variant: 'destructive' as const, label: 'Crítica' },
    };

    const config = variants[urgency];
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getQuotationStatusBadge = (status: Quotation['status']) => {
    const variants = {
      pending: { variant: 'outline' as const, label: 'Pendente' },
      submitted: { variant: 'secondary' as const, label: 'Enviada' },
      selected: { variant: 'default' as const, label: 'Selecionada', className: 'bg-green-500' },
      rejected: { variant: 'destructive' as const, label: 'Rejeitada' },
    };

    const config = variants[status];
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const handleSelectQuotation = (request: PurchaseRequest, quotationId: number) => {
    setSelectingQuotation({ requestId: request.id, quotationId });
  };

  const confirmSelectQuotation = () => {
    if (selectingQuotation) {
      selectQuotation.mutate(
        {
          purchaseRequestId: selectingQuotation.requestId,
          quotationId: selectingQuotation.quotationId,
          reviewedBy: 'Usuario Atual', // TODO: Get from auth context
        },
        {
          onSuccess: () => {
            setSelectingQuotation(null);
          },
        }
      );
    }
  };

  const getBestQuotation = (quotations: Quotation[]) => {
    const submitted = quotations.filter(q => q.status === 'submitted');
    if (submitted.length === 0) return null;
    return submitted.reduce((best, current) =>
      current.totalValue < best.totalValue ? current : best
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Compras</h1>
        <p className="text-muted-foreground">
          Gestão de requisições, pedidos e cotações
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loadingStats ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-28" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Requisições</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats?.totalRequests || 0}</p>
                <p className="text-xs text-muted-foreground">Todas as solicitações</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-600">{stats?.pendingRequests || 0}</p>
                <p className="text-xs text-muted-foreground">Aguardando ação</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Finalizados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{stats?.totalOrders || 0}</p>
                <p className="text-xs text-muted-foreground">Purchase orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats?.totalValue || 0)}</p>
                <p className="text-xs text-muted-foreground">Em pedidos</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="requisicoes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requisicoes">
            <FileText className="h-4 w-4 mr-2" />
            Requisições
          </TabsTrigger>
          <TabsTrigger value="pedidos">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Pedidos
          </TabsTrigger>
        </TabsList>

        {/* Requisições Tab */}
        <TabsContent value="requisicoes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Requisições de Compra</h3>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowFilterDialog(true)}>
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
                {hasActiveFilters && (
                  <span className="ml-2 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                    {Object.values(filters).filter(v => v).length}
                  </span>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Requisição
              </Button>
            </div>
          </div>

          {selectedRequest ? (
            // Detalhes da Requisição com Cotações
            <div className="space-y-4">
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                ← Voltar
              </Button>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Requisição #{selectedRequest.id}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedRequest.contractName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(selectedRequest.status)}
                      {getUrgencyBadge(selectedRequest.urgency)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Solicitante</p>
                      <p className="font-medium">{selectedRequest.requestedBy}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Departamento</p>
                      <p className="font-medium">{selectedRequest.department}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Data de Entrega</p>
                      <p className="font-medium">{formatDate(selectedRequest.requiredDeliveryDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valor Estimado</p>
                      <p className="font-medium text-blue-600">
                        {formatCurrency(selectedRequest.totalEstimatedValue)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Justificativa</p>
                    <p className="text-sm mt-1">{selectedRequest.justification}</p>
                  </div>

                  {/* Itens da Requisição */}
                  <div>
                    <h4 className="font-semibold mb-3">Itens Solicitados ({selectedRequest.items.length})</h4>
                    <div className="space-y-2">
                      {selectedRequest.items.map((item) => (
                        <div key={item.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{item.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} {item.unit} • {item.specifications}
                              </p>
                            </div>
                            <p className="font-medium">{formatCurrency(item.estimatedTotalPrice)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cotações */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">
                        Cotações Recebidas ({selectedRequest.quotations.length})
                      </h4>
                      {selectedRequest.quotations.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Melhor preço: {formatCurrency(getBestQuotation(selectedRequest.quotations)?.totalValue || 0)}
                        </p>
                      )}
                    </div>

                    {selectedRequest.quotations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma cotação recebida ainda</p>
                        <Button variant="outline" className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Cotação
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedRequest.quotations.map((quotation) => {
                          const isBest = getBestQuotation(selectedRequest.quotations)?.id === quotation.id;
                          return (
                            <Card key={quotation.id} className={isBest ? 'border-green-500' : ''}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-semibold">{quotation.supplierName}</h5>
                                      {isBest && <Badge variant="outline" className="bg-green-50">Melhor Preço</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Válida até: {formatDate(quotation.validUntil)}
                                    </p>
                                  </div>
                                  {getQuotationStatusBadge(quotation.status)}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-3">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Valor Total</p>
                                    <p className="text-lg font-bold text-blue-600">
                                      {formatCurrency(quotation.totalValue)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Economia</p>
                                    <p className={`text-lg font-bold ${
                                      selectedRequest.totalEstimatedValue - quotation.totalValue > 0
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}>
                                      {formatCurrency(selectedRequest.totalEstimatedValue - quotation.totalValue)}
                                    </p>
                                  </div>
                                </div>

                                {quotation.notes && (
                                  <p className="text-sm text-muted-foreground mb-3">
                                    Obs: {quotation.notes}
                                  </p>
                                )}

                                {quotation.status === 'submitted' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleSelectQuotation(selectedRequest, quotation.id)}
                                    disabled={selectQuotation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Selecionar Esta Cotação
                                  </Button>
                                )}

                                {quotation.status === 'selected' && quotation.reviewedBy && (
                                  <p className="text-sm text-muted-foreground">
                                    Selecionada por {quotation.reviewedBy} em {formatDate(quotation.reviewedAt!)}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Lista de Requisições
            <div className="space-y-3">
              {loadingRequests ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-5 w-20" />
                              <Skeleton className="h-5 w-16" />
                            </div>
                            <Skeleton className="h-4 w-48" />
                            <div className="grid grid-cols-4 gap-4">
                              <div className="space-y-1">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                              <div className="space-y-1">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-4 w-12" />
                              </div>
                              <div className="space-y-1">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-4 w-20" />
                              </div>
                              <div className="space-y-1">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-4 w-12" />
                              </div>
                            </div>
                          </div>
                          <Skeleton className="h-9 w-28" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : requests && requests.length > 0 ? (
                requests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">Requisição #{request.id}</h4>
                            {getStatusBadge(request.status)}
                            {getUrgencyBadge(request.urgency)}
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">{request.contractName}</p>

                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Solicitante</p>
                              <p className="font-medium">{request.requestedBy}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Itens</p>
                              <p className="font-medium">{request.items.length}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Valor Estimado</p>
                              <p className="font-medium">{formatCurrency(request.totalEstimatedValue)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Cotações</p>
                              <p className="font-medium">{request.quotations.length}</p>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma Requisição</h3>
                    <p className="text-muted-foreground mb-4">
                      Crie sua primeira requisição de compra
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Requisição
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Pedidos Tab */}
        <TabsContent value="pedidos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Pedidos de Compra (PO)</h3>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowFilterDialog(true)}>
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
                {hasActiveFilters && (
                  <span className="ml-2 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                    {Object.values(filters).filter(v => v).length}
                  </span>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
              <CreatePurchaseModal />
            </div>
          </div>

          {loadingPurchases ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <Skeleton className="h-4 w-64" />
                        <div className="grid grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-4 w-28" />
                          </div>
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                      </div>
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : purchases && purchases.length > 0 ? (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <Card key={purchase.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{purchase.orderNumber}</h4>
                          <Badge>{purchase.status}</Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">{purchase.item}</p>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Fornecedor</p>
                            <p className="font-medium">{purchase.supplier}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Contrato</p>
                            <p className="font-medium">{purchase.contract}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Valor</p>
                            <p className="font-medium text-blue-600">{formatCurrency(purchase.value)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Data</p>
                            <p className="font-medium">{formatDate(purchase.date)}</p>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhum Pedido</h3>
                <p className="text-muted-foreground mb-4">
                  Purchase orders aparecerão aqui após seleção de cotações
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Quotation Selection Confirmation Dialog */}
      <ConfirmDialog
        open={!!selectingQuotation}
        onOpenChange={(open) => !open && setSelectingQuotation(null)}
        onConfirm={confirmSelectQuotation}
        title="Selecionar Cotação"
        description="Tem certeza que deseja selecionar esta cotação? Esta ação marcará as outras cotações como rejeitadas e criará um pedido de compra automaticamente."
        confirmText="Selecionar Cotação"
        cancelText="Cancelar"
        loading={selectQuotation.isPending}
      />

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filtrar Compras</DialogTitle>
            <DialogDescription>
              Configure os filtros para requisições e pedidos de compra
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="font-semibold text-sm text-muted-foreground">Requisições</div>

            {/* Status Filter (Requisições) */}
            <div className="space-y-2">
              <Label htmlFor="filter-status">Status da Requisição</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="filter-status">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="submitted">Enviado</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="in_quotation">Em Cotação</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Urgency Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-urgency">Urgência</Label>
              <Select
                value={filters.urgency}
                onValueChange={(value) => setFilters(prev => ({ ...prev, urgency: value }))}
              >
                <SelectTrigger id="filter-urgency">
                  <SelectValue placeholder="Todas as urgências" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as urgências</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Requested By Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-requestedBy">Solicitante ou Contrato</Label>
              <Input
                id="filter-requestedBy"
                placeholder="Buscar por solicitante ou contrato..."
                value={filters.requestedBy}
                onChange={(e) => setFilters(prev => ({ ...prev, requestedBy: e.target.value }))}
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="font-semibold text-sm text-muted-foreground mb-4">Pedidos</div>

              {/* Purchase Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="filter-purchase-status">Status do Pedido</Label>
                <Select
                  value={filters.purchaseStatus}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, purchaseStatus: value }))}
                >
                  <SelectTrigger id="filter-purchase-status">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                    <SelectItem value="Enviado">Enviado</SelectItem>
                    <SelectItem value="Recebido">Recebido</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Supplier Filter */}
              <div className="space-y-2">
                <Label htmlFor="filter-supplier">Fornecedor ou Contrato</Label>
                <Input
                  id="filter-supplier"
                  placeholder="Buscar por fornecedor ou contrato..."
                  value={filters.supplier}
                  onChange={(e) => setFilters(prev => ({ ...prev, supplier: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClearFilters}>
              Limpar Tudo
            </Button>
            <Button onClick={() => setShowFilterDialog(false)}>
              Aplicar Filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Compras;
