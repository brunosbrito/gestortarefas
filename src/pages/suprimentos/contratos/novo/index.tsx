import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCreateContract } from "@/hooks/suprimentos/useContracts";
import { ArrowLeft, Upload, FileSpreadsheet, X } from "lucide-react";
import type { ContractType } from "@/interfaces/suprimentos/ContractInterface";

const NovoContrato = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    description: "",
    startDate: "",
    contractType: "" as ContractType | ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const createContract = useCreateContract();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setFileError('Arquivo QQP_Cliente é obrigatório');
      return;
    }

    if (!formData.contractType) {
      setFileError('Por favor, selecione o tipo de contrato');
      return;
    }

    createContract.mutate({
      contractData: {
        name: formData.name,
        client: formData.client,
        startDate: formData.startDate,
        contractType: formData.contractType as ContractType,
        description: formData.description,
      },
      qqpFile: selectedFile
    }, {
      onSuccess: () => {
        navigate('/suprimentos/contratos');
      }
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validar se é arquivo Excel
    const validExtensions = ['.xlsx', '.xls', '.xlsm'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      setFileError('Arquivo deve ser Excel (.xlsx, .xls ou .xlsm)');
      return;
    }

    setSelectedFile(file);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Criar Novo Contrato</h1>
          <p className="text-muted-foreground">
            Preencha as informações do contrato de suprimentos
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
                placeholder="Ex: Construtora ABC Ltda"
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
              <p className="text-xs text-muted-foreground">
                Valor total será extraído automaticamente do arquivo QQP_Cliente
              </p>
            </div>

            <Card className={fileError ? "border-destructive" : ""}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Arquivo QQP_Cliente *
                </CardTitle>
                <CardDescription>
                  Planilha Excel com orçamento previsto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <Input
                    id="qqp-file"
                    type="file"
                    accept=".xlsx,.xls,.xlsm"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('qqp-file')?.click()}
                  >
                    Selecionar Arquivo Excel
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Formatos aceitos: .xlsx, .xls, .xlsm
                  </p>
                </div>
                {selectedFile && (
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded">
                    <FileSpreadsheet className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium flex-1">{selectedFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {fileError && (
                  <p className="text-sm text-destructive">{fileError}</p>
                )}
              </CardContent>
            </Card>

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

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/suprimentos/contratos')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createContract.isPending || !selectedFile}
              >
                {createContract.isPending ? "Criando..." : "Criar Contrato"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NovoContrato;
