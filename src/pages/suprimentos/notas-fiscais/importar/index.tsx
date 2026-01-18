import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Upload,
  FileText,
  X,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useImportNFXML, useProcessFolder } from "@/hooks/suprimentos/useNF";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Folder } from "lucide-react";

const ImportarNF = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderError, setFolderError] = useState<string | null>(null);
  const importMutation = useImportNFXML();
  const processFolderMutation = useProcessFolder();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFileError(null);

    if (files.length === 0) {
      setSelectedFiles([]);
      return;
    }

    // Validar se são arquivos XML
    const invalidFiles = files.filter(file => !file.name.toLowerCase().endsWith('.xml'));

    if (invalidFiles.length > 0) {
      setFileError(`${invalidFiles.length} arquivo(s) inválido(s). Apenas arquivos XML são aceitos.`);
      return;
    }

    setSelectedFiles(files);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (selectedFiles.length === 0) {
      setFileError('Selecione pelo menos um arquivo XML');
      return;
    }

    // Importar arquivos sequencialmente
    let successCount = 0;
    let errorCount = 0;

    for (const file of selectedFiles) {
      try {
        await importMutation.mutateAsync(file);
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    if (errorCount === 0) {
      navigate('/suprimentos/notas-fiscais');
    }
  };

  const handleProcessFolder = async () => {
    if (!folderName.trim()) {
      setFolderError('Digite o nome da pasta');
      return;
    }

    setFolderError(null);

    try {
      await processFolderMutation.mutateAsync(folderName);
      setFolderName("");
      // Não navegar automaticamente, pois o processamento é assíncrono via n8n
    } catch (error) {
      // Error já é tratado pelo hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/suprimentos/notas-fiscais')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Importar Notas Fiscais</h1>
          <p className="text-muted-foreground">
            Importe arquivos XML de notas fiscais eletrônicas (NF-e)
          </p>
        </div>
      </div>

      <Tabs defaultValue="individual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="individual">
            <Upload className="h-4 w-4 mr-2" />
            Upload Individual
          </TabsTrigger>
          <TabsTrigger value="batch">
            <Folder className="h-4 w-4 mr-2" />
            Processamento em Lote (N8N)
          </TabsTrigger>
        </TabsList>

        {/* Upload Individual Tab */}
        <TabsContent value="individual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
            <CardHeader>
              <CardTitle>Upload de Arquivos XML</CardTitle>
              <CardDescription>
                Selecione um ou mais arquivos XML de NF-e para importar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div className="space-y-4">
                <Label htmlFor="xml-files">Arquivos XML *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <Input
                    id="xml-files"
                    type="file"
                    accept=".xml"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('xml-files')?.click()}
                  >
                    Selecionar Arquivos XML
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Você pode selecionar múltiplos arquivos
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos aceitos: .xml (NFe)
                  </p>
                </div>

                {fileError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{fileError}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Arquivos Selecionados ({selectedFiles.length})</Label>
                  <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3">
                        <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          disabled={importMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/suprimentos/notas-fiscais')}
                  disabled={importMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={selectedFiles.length === 0 || importMutation.isPending}
                >
                  {importMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Como Importar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  1
                </div>
                <div>
                  <p className="font-medium">Selecione os arquivos XML</p>
                  <p className="text-muted-foreground">
                    Você pode selecionar múltiplos arquivos de uma vez
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  2
                </div>
                <div>
                  <p className="font-medium">Clique em Importar</p>
                  <p className="text-muted-foreground">
                    Os arquivos serão processados automaticamente
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  3
                </div>
                <div>
                  <p className="font-medium">Aguarde o processamento</p>
                  <p className="text-muted-foreground">
                    As NFs ficarão com status "Pendente" até serem validadas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <p className="font-medium mb-2">Importante</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Apenas arquivos XML de NF-e são aceitos</li>
                <li>O processamento pode levar alguns segundos</li>
                <li>NFs duplicadas serão identificadas automaticamente</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </div>
        </TabsContent>

        {/* Batch Processing Tab */}
        <TabsContent value="batch" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Processamento em Lote via N8N</CardTitle>
                  <CardDescription>
                    Processe uma pasta inteira de XMLs via webhook N8N
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <p className="font-medium mb-2">⚠️ Backend Necessário</p>
                      <p>Esta funcionalidade requer integração com N8N no backend. Atualmente usando dados mockados para demonstração.</p>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <Label htmlFor="folder-name">Nome da Pasta *</Label>
                    <Input
                      id="folder-name"
                      value={folderName}
                      onChange={(e) => {
                        setFolderName(e.target.value);
                        setFolderError(null);
                      }}
                      placeholder="Ex: NFsMaio2024 ou ContratosVale/Semana1"
                      disabled={processFolderMutation.isPending}
                    />
                    <p className="text-sm text-muted-foreground">
                      Digite o nome da pasta no OneDrive/servidor onde estão os XMLs
                    </p>

                    {folderError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{folderError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/suprimentos/notas-fiscais')}
                      disabled={processFolderMutation.isPending}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleProcessFolder}
                      disabled={!folderName.trim() || processFolderMutation.isPending}
                    >
                      {processFolderMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Folder className="h-4 w-4 mr-2" />
                          Processar Pasta
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Como Funciona</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Digite o nome da pasta</p>
                      <p className="text-muted-foreground">
                        Pasta onde os XMLs de NF-e estão armazenados
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      2
                    </div>
                    <div>
                      <p className="font-medium">N8N processa em background</p>
                      <p className="text-muted-foreground">
                        Webhook N8N lê todos XMLs da pasta automaticamente
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      3
                    </div>
                    <div>
                      <p className="font-medium">NFs aparecem na lista</p>
                      <p className="text-muted-foreground">
                        Após processamento, as NFs ficam disponíveis para validação
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <p className="font-medium mb-2">Vantagens do N8N</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Processa centenas de XMLs automaticamente</li>
                    <li>Execução em background (não trava a interface)</li>
                    <li>Ideal para importações em lote periódicas</li>
                    <li>Integração com OneDrive/SharePoint</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImportarNF;
