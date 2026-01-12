import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateContract } from "@/hooks/suprimentos/useContracts";
import type { ContractType } from "@/interfaces/suprimentos/ContractInterface";
import { Plus, Upload, FileSpreadsheet, X } from "lucide-react";

export const CreateContractModal = () => {
  const [open, setOpen] = useState(false);
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
        setOpen(false);
        setFormData({ name: "", client: "", description: "", startDate: "", contractType: "" });
        setSelectedFile(null);
        setFileError(null);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Contrato
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Contrato</DialogTitle>
          <DialogDescription>
            Preencha as informações do novo contrato de suprimentos
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Contrato *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ex: Reforma Britador - Mina Vale do Rio Doce"
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

          {/* Contract Type Selection */}
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

          {/* Upload Arquivo QQP_Cliente (Obrigatório) */}
          <Card className={fileError ? "border-destructive" : ""}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Arquivo QQP_Cliente *
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qqp-file">Planilha Excel com sheet "QQP_Cliente"</Label>
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
              </div>
            </CardContent>
          </Card>

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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createContract.isPending || !selectedFile}>
              {createContract.isPending ? "Criando..." : "Criar Contrato"}
            </Button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
};
