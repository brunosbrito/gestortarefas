import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useContract, useUpdateContract } from "@/hooks/suprimentos/useContracts";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { ContractType } from "@/interfaces/suprimentos/ContractInterface";

const EditarContrato = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contractData, isLoading } = useContract(Number(id));
  const updateContract = useUpdateContract();

  const [formData, setFormData] = useState({
    name: "",
    client: "",
    description: "",
    startDate: "",
    contractType: "" as ContractType | ""
  });

  // Preencher formulário quando dados carregarem
  useEffect(() => {
    if (contractData?.data) {
      const contract = contractData.data;
      setFormData({
        name: contract.name || "",
        client: contract.client || "",
        description: contract.description || "",
        startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : "",
        contractType: contract.contractType || ""
      });
    }
  }, [contractData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.contractType) {
      return;
    }

    updateContract.mutate({
      id: Number(id),
      contract: {
        name: formData.name,
        client: formData.client,
        startDate: formData.startDate,
        contractType: formData.contractType as ContractType,
        description: formData.description,
      }
    }, {
      onSuccess: () => {
        navigate(`/suprimentos/contratos/${id}`);
      }
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Card className="max-w-3xl">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!contractData?.data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Contrato não encontrado</h2>
          <Button onClick={() => navigate('/suprimentos/contratos')}>
            Voltar para Contratos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/suprimentos/contratos/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editar Contrato</h1>
          <p className="text-muted-foreground">
            Atualize as informações do contrato de suprimentos
          </p>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Informações do Contrato</CardTitle>
          <CardDescription>
            Todos os campos marcados com * são obrigatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Contrato *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ex: Fornecimento de Aço - Obra XYZ"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => handleChange("client", e.target.value)}
                placeholder="Ex: Vale S.A."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Contrato *</Label>
              <Select
                value={formData.contractType}
                onValueChange={(value: ContractType) => handleChange("contractType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de contrato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="material">Material/Produto</SelectItem>
                  <SelectItem value="service">Serviço</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Descrição detalhada do contrato..."
                rows={4}
              />
            </div>

            <div className="bg-muted/30 border border-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> O valor total do contrato e orçamento não podem ser editados aqui.
                Para alterar valores, você precisa importar uma nova planilha QQP_Cliente.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/suprimentos/contratos/${id}`)}
                disabled={updateContract.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateContract.isPending}
              >
                {updateContract.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditarContrato;
