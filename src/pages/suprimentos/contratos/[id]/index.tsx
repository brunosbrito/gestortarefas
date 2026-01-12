import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Calendar,
  Package,
  Wrench,
  FileSpreadsheet,
  Loader2
} from "lucide-react";
import { useContract } from "@/hooks/suprimentos/useContracts";

const DetalhesContrato = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contractData, isLoading, error } = useContract(Number(id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando contrato...</p>
        </div>
      </div>
    );
  }

  if (error || !contractData?.data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
          <h2 className="text-2xl font-bold">Contrato não encontrado</h2>
          <Button onClick={() => navigate('/suprimentos/contratos')}>
            Voltar para Contratos
          </Button>
        </div>
      </div>
    );
  }

  const contract = contractData.data;
  const contractValue = typeof contract.value === 'number' ? contract.value : 0;
  const contractSpent = typeof contract.spent === 'number' ? contract.spent : 0;
  const contractProgress = typeof contract.progress === 'number' ? Math.min(Math.max(contract.progress, 0), 100) : 0;
  const remaining = contractValue - contractSpent;
  const financialProgress = contractValue > 0 ? (contractSpent / contractValue) * 100 : 0;

  const getContractTypeLabel = (type: string) => {
    return type === "material" ? "Material/Produto" : "Serviço";
  };

  const getContractTypeIcon = (type: string) => {
    return type === "material" ? Package : Wrench;
  };

  const TypeIcon = getContractTypeIcon(contract.contractType || "material");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/suprimentos/contratos')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            {contract.name}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground">
              Cliente: {contract.client}
            </p>
            <span className="text-muted-foreground">•</span>
            <p className="text-muted-foreground">
              Início: {new Date(contract.startDate).toLocaleDateString('pt-BR')}
            </p>
            {contract.contractType && (
              <>
                <span className="text-muted-foreground">•</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <TypeIcon className="h-3 w-3" />
                  {getContractTypeLabel(contract.contractType)}
                </Badge>
              </>
            )}
          </div>
        </div>
        <Badge
          variant={
            contract.status === "Em Andamento"
              ? "default"
              : contract.status === "Concluído"
              ? "secondary"
              : "outline"
          }
        >
          {contract.status}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="budget">Orçamento</TabsTrigger>
          <TabsTrigger value="nfs">Notas Fiscais</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Valor Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {contractValue.toLocaleString("pt-BR")}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Realizado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  R$ {contractSpent.toLocaleString("pt-BR")}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  R$ {remaining.toLocaleString("pt-BR")}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Physical Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Progresso Físico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">
                    {contractProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-primary transition-all duration-300"
                    style={{ width: `${contractProgress}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Progresso Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">
                    {financialProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${Math.min(financialProgress, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {contract.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {contract.description}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <Card>
            <CardContent className="text-center py-12">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {contract.hasBudgetImport
                  ? "Orçamento importado - visualização detalhada em desenvolvimento"
                  : "Nenhum orçamento foi importado para este contrato"}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nfs" className="space-y-6">
          <Card>
            <CardContent className="text-center py-12">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Visualização de Notas Fiscais em desenvolvimento
              </p>
              <Button onClick={() => navigate('/suprimentos/notas-fiscais', { state: { contractId: contract.id } })}>
                Ver Todas as NFs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={() => navigate('/suprimentos/notas-fiscais', { state: { contractId: contract.id } })}
        >
          Ver Notas Fiscais
        </Button>
        <Button
          variant="default"
          onClick={() => navigate(`/suprimentos/contratos/${contract.id}/editar`)}
        >
          Editar Contrato
        </Button>
      </div>
    </div>
  );
};

export default DetalhesContrato;
