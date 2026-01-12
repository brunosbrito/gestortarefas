import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "../components/MetricCard";
import { Building2, TrendingUp, TrendingDown, Receipt, Plus, Filter, X } from "lucide-react";
import { useContracts, useContractKPIs, useContractRealizedValue } from "@/hooks/suprimentos/useContracts";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CreateContractModal } from "./components/CreateContractModal";
import { ContractDetailsModal } from "./components/ContractDetailsModal";
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

interface ContractRealizedValueProps {
  contractId: number;
}

const ContractRealizedValue = ({ contractId }: ContractRealizedValueProps) => {
  const { data: realizedData, isLoading, error } = useContractRealizedValue(contractId);

  if (isLoading) {
    return (
      <div className="text-sm">
        <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
        <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
      </div>
    );
  }

  if (error || !realizedData?.data) {
    return (
      <p className="text-sm text-muted-foreground">
        Valores não disponíveis
      </p>
    );
  }

  const data = realizedData.data;
  const isOverBudget = data.valor_realizado > data.valor_original;

  return (
    <div className="text-sm space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Realizado:</span>
        <span className="font-medium">
          R$ {data.valor_realizado.toLocaleString('pt-BR')}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Saldo:</span>
        <span className={`font-medium ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
          R$ {data.saldo_restante.toLocaleString('pt-BR')}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">% Realizado:</span>
        <div className="flex items-center gap-1">
          {isOverBudget ? (
            <TrendingUp className="h-3 w-3 text-destructive" />
          ) : (
            <TrendingDown className="h-3 w-3 text-success" />
          )}
          <span className={`font-medium ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
            {data.percentual_realizado.toFixed(1)}%
          </span>
        </div>
      </div>
      {data.total_nfs > 0 && (
        <div className="flex items-center justify-between pt-1 border-t">
          <span className="text-xs text-muted-foreground">NFs:</span>
          <span className="text-xs">
            {data.nfs_validadas}/{data.total_nfs} validadas
          </span>
        </div>
      )}
    </div>
  );
};

interface ContractProgressBarProps {
  contractId: number;
}

const ContractProgressBar = ({ contractId }: ContractProgressBarProps) => {
  const { data: realizedData, isLoading } = useContractRealizedValue(contractId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Valor Previsto</span>
            <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="w-full bg-muted rounded-full h-2 animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Realizado</span>
            <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="w-full bg-muted rounded-full h-2 animate-pulse"></div>
        </div>
      </div>
    );
  }

  const data = realizedData?.data;
  const progress = data?.percentual_realizado || 0;
  const isOverBudget = progress > 100;

  return (
    <div className="space-y-4">
      {/* Barra Valor Previsto */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Valor Previsto</span>
          <span className="font-medium text-foreground">
            R$ {data?.valor_original.toLocaleString('pt-BR') || 0}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Barra Total Realizado */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Realizado</span>
          <span className={`font-medium ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
            R$ {data?.valor_realizado.toLocaleString('pt-BR') || 0} ({progress.toFixed(1)}%)
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isOverBudget ? 'bg-destructive' : 'bg-gradient-primary'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {data && (
        <div className="text-xs text-muted-foreground">
          Base: {data.nfs_validadas} de {data.total_nfs} NFs validadas
        </div>
      )}
    </div>
  );
};

const Contratos = () => {
  const navigate = useNavigate();
  const { data: contractsData, isLoading: contractsLoading } = useContracts();
  const { data: kpisData, isLoading: kpisLoading } = useContractKPIs();

  // Filter state
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    client: '',
    startDateFrom: '',
    startDateTo: '',
  });

  // Details modal state
  const [selectedContractForDetails, setSelectedContractForDetails] = useState<any>(null);

  // Safely extract contracts array
  const allContracts = contractsData?.data?.contracts || [];

  // Apply filters
  const contracts = useMemo(() => {
    let filtered = [...allContracts];

    // Filter by status
    if (filters.status && filters.status !== 'todos') {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    // Filter by client (case-insensitive search)
    if (filters.client.trim()) {
      const clientLower = filters.client.toLowerCase();
      filtered = filtered.filter(c =>
        c.client?.toLowerCase().includes(clientLower) ||
        c.name.toLowerCase().includes(clientLower)
      );
    }

    // Filter by start date range
    if (filters.startDateFrom) {
      const fromDate = new Date(filters.startDateFrom);
      filtered = filtered.filter(c => new Date(c.startDate) >= fromDate);
    }

    if (filters.startDateTo) {
      const toDate = new Date(filters.startDateTo);
      filtered = filtered.filter(c => new Date(c.startDate) <= toDate);
    }

    return filtered;
  }, [allContracts, filters]);

  const totalValue = kpisData?.data?.totalValue || 0;
  const totalSpent = kpisData?.data?.totalSpent || 0;
  const avgProgress = kpisData?.data?.avgProgress || 0;

  const handleClearFilters = () => {
    setFilters({
      status: '',
      client: '',
      startDateFrom: '',
      startDateTo: '',
    });
  };

  const hasActiveFilters = filters.status || filters.client || filters.startDateFrom || filters.startDateTo;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Contratos</h1>
          <p className="text-muted-foreground">
            Acompanhe o orçamento e realização de todos os contratos
          </p>
        </div>
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
              Limpar Filtros
            </Button>
          )}
          <CreateContractModal />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpisLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
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
          <>
            <MetricCard
              title="Valor Total dos Contratos"
              value={totalValue}
              format="currency"
              icon={<Building2 className="h-5 w-5 text-primary" />}
            />
            <MetricCard
              title="Total Realizado"
              value={totalSpent}
              format="currency"
              trend="up"
              icon={<Building2 className="h-5 w-5 text-success" />}
            />
            <MetricCard
              title="Progresso Médio"
              value={avgProgress.toFixed(1)}
              format="percentage"
              trend="up"
              trendValue="+5% este mês"
              icon={<Building2 className="h-5 w-5 text-accent" />}
            />
          </>
        )}
      </div>

      {/* Contracts Table */}
      <Card className="bg-gradient-card border-0 shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Contratos Ativos ({contracts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contractsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 bg-muted/30 rounded-lg animate-pulse">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="h-5 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded mb-1 w-2/3"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-muted rounded mb-2 w-24"></div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3 bg-muted rounded w-16"></div>
                      <div className="h-3 bg-muted rounded w-8"></div>
                    </div>
                    <div className="h-2 bg-muted rounded"></div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <div className="h-8 bg-muted rounded w-20"></div>
                    <div className="h-8 bg-muted rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{contract.name}</h3>
                      <p className="text-sm text-muted-foreground">{contract.client || 'Cliente não informado'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Início: {new Date(contract.startDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right min-w-0 flex-shrink-0">
                      <div className="mb-2">
                        <p className="font-medium text-foreground">
                          Orçamento: R$ {contract.value.toLocaleString('pt-BR')}
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          contract.status === 'Em Andamento' ? 'bg-primary/10 text-primary' :
                          contract.status === 'Concluído' ? 'bg-success/10 text-success' :
                          contract.status === 'Pausado' ? 'bg-warning/10 text-warning' :
                          'bg-muted/10 text-muted-foreground'
                        }`}>
                          {contract.status}
                        </span>
                      </div>
                      <ContractRealizedValue contractId={contract.id} />
                    </div>
                  </div>

                  <ContractProgressBar contractId={contract.id} />

                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => setSelectedContractForDetails(contract)}>
                      Ver Detalhes
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate('/suprimentos/notas-fiscais', { state: { contractId: contract.id } })}
                    >
                      <Receipt className="h-4 w-4 mr-1" />
                      Ver NFs
                    </Button>
                  </div>
                </div>
              ))}
              {contracts.length === 0 && !contractsLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum contrato encontrado</p>
                  <div className="mt-4">
                    <CreateContractModal />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filtrar Contratos</DialogTitle>
            <DialogDescription>
              Configure os filtros para refinar a lista de contratos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="filter-status">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Pausado">Pausado</SelectItem>
                  <SelectItem value="Finalizando">Finalizando</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Client/Contract Name Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-client">Cliente ou Nome do Contrato</Label>
              <Input
                id="filter-client"
                placeholder="Buscar por cliente ou nome..."
                value={filters.client}
                onChange={(e) => setFilters(prev => ({ ...prev, client: e.target.value }))}
              />
            </div>

            {/* Start Date Range */}
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="filter-date-from" className="text-xs text-muted-foreground">
                    De
                  </Label>
                  <Input
                    id="filter-date-from"
                    type="date"
                    value={filters.startDateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDateFrom: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="filter-date-to" className="text-xs text-muted-foreground">
                    Até
                  </Label>
                  <Input
                    id="filter-date-to"
                    type="date"
                    value={filters.startDateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDateTo: e.target.value }))}
                  />
                </div>
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

      {/* Contract Details Modal */}
      <ContractDetailsModal
        contract={selectedContractForDetails}
        open={!!selectedContractForDetails}
        onOpenChange={(open) => !open && setSelectedContractForDetails(null)}
      />
    </div>
  );
};

export default Contratos;
