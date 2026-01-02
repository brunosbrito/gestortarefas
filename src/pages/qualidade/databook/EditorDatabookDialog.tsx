import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Databook } from '@/interfaces/QualidadeInterfaces';
import DatabookService from '@/services/DatabookService';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Download,
  Send,
  Plus,
  Trash2,
  Eye,
  Edit,
  Upload,
  ArrowUp,
  ArrowDown,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface EditorDatabookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  databook: Databook;
  onSuccess: () => void;
}

export const EditorDatabookDialog = ({
  open,
  onOpenChange,
  databook,
  onSuccess,
}: EditorDatabookDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [databookAtual, setDatabookAtual] = useState<Databook>(databook);
  const [gerandoPDF, setGerandoPDF] = useState(false);

  useEffect(() => {
    if (open) {
      // Recarregar dados atualizados do databook
      loadDatabook();
    }
  }, [open, databook.id]);

  const loadDatabook = async () => {
    try {
      const data = await DatabookService.getById(databook.id);
      setDatabookAtual(data);
    } catch (error) {
      console.error('Erro ao carregar databook:', error);
    }
  };

  const handleToggleDocumento = async (
    secaoId: string,
    documentoId: string,
    incluir: boolean
  ) => {
    try {
      const updated = await DatabookService.toggleDocumento(
        databookAtual.id,
        secaoId,
        documentoId,
        incluir
      );
      setDatabookAtual(updated);

      toast({
        title: 'Sucesso',
        description: `Documento ${incluir ? 'incluído' : 'excluído'} do databook.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o documento.',
        variant: 'destructive',
      });
    }
  };

  const handleGerarPDF = async () => {
    try {
      setGerandoPDF(true);
      const result = await DatabookService.gerarPDF(databookAtual.id, {
        incluirAssinatura: false,
        carimboRevisao: true,
      });

      toast({
        title: 'Sucesso',
        description: 'PDF gerado com sucesso!',
      });

      // Recarregar databook para obter URL do PDF
      await loadDatabook();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o PDF.',
        variant: 'destructive',
      });
    } finally {
      setGerandoPDF(false);
    }
  };

  const handleIncrementarRevisao = async () => {
    try {
      const updated = await DatabookService.incrementarRevisao(
        databookAtual.id,
        'Incremento de revisão'
      );
      setDatabookAtual(updated);

      toast({
        title: 'Sucesso',
        description: `Revisão incrementada para Rev. ${updated.revisao}`,
      });

      onSuccess();
    } catch (error) {
      console.error('Erro ao incrementar revisão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível incrementar a revisão.',
        variant: 'destructive',
      });
    }
  };

  const handleAlterarStatus = async (
    status: 'rascunho' | 'em_revisao' | 'aprovado' | 'enviado'
  ) => {
    try {
      const updated = await DatabookService.alterarStatus(databookAtual.id, status);
      setDatabookAtual(updated);

      toast({
        title: 'Sucesso',
        description: 'Status atualizado com sucesso.',
      });

      onSuccess();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await DatabookService.downloadPDF(databookAtual.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Databook_${databookAtual.project?.name}_Rev${databookAtual.revisao}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Sucesso',
        description: 'Download do PDF iniciado.',
      });
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível baixar o PDF.',
        variant: 'destructive',
      });
    }
  };

  const getTotalDocumentos = () => {
    return databookAtual.secoes?.reduce((acc, secao) => acc + secao.documentos.length, 0) || 0;
  };

  const getDocumentosIncluidos = () => {
    return (
      databookAtual.secoes?.reduce(
        (acc, secao) => acc + secao.documentos.filter((d) => d.incluir).length,
        0
      ) || 0
    );
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      rascunho: <FileText className="w-4 h-4 text-gray-600" />,
      em_revisao: <Clock className="w-4 h-4 text-yellow-600" />,
      aprovado: <CheckCircle2 className="w-4 h-4 text-green-600" />,
      enviado: <Send className="w-4 h-4 text-blue-600" />,
    };
    return icons[status as keyof typeof icons] || null;
  };

  const getTipoDocIcon = (tipo: string) => {
    const icons = {
      certificado: '📜',
      inspecao: '✓',
      rnc: '⚠️',
      calibracao: '⚙️',
      foto: '📷',
      externo: '📎',
    };
    return icons[tipo as keyof typeof icons] || '📄';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{databookAtual.titulo}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">Rev. {databookAtual.revisao}</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  {getStatusIcon(databookAtual.status)}
                  {databookAtual.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {getDocumentosIncluidos()} / {getTotalDocumentos()} documentos
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleIncrementarRevisao}
                disabled={loading}
              >
                <Plus className="w-4 h-4 mr-1" />
                Nova Revisão
              </Button>

              {databookAtual.pdfUrl ? (
                <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                  <Download className="w-4 h-4 mr-1" />
                  Baixar PDF
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleGerarPDF}
                  disabled={gerandoPDF}
                >
                  {gerandoPDF ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-1" />
                      Gerar PDF
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
          {/* Coluna esquerda: Estrutura do Databook */}
          <div className="col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Estrutura do Documento</h3>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-1" />
                Adicionar Documento
              </Button>
            </div>

            <ScrollArea className="flex-1 border rounded-lg p-4">
              <Accordion type="multiple" className="space-y-2">
                {databookAtual.secoes?.map((secao, secaoIdx) => (
                  <AccordionItem
                    key={secao.id}
                    value={secao.id}
                    className="border rounded-lg px-3"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <Badge variant="secondary" className="text-xs">
                          {secaoIdx + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{secao.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {secao.documentos.filter((d) => d.incluir).length} /{' '}
                            {secao.documentos.length} documentos
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 mt-2">
                        {secao.documentos.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Nenhum documento nesta seção
                          </p>
                        ) : (
                          secao.documentos.map((doc) => (
                            <div
                              key={doc.id}
                              className={`flex items-center justify-between p-2 rounded border ${
                                doc.incluir ? 'bg-green-50/50' : 'bg-gray-50/50'
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <Checkbox
                                  checked={doc.incluir}
                                  onCheckedChange={(checked) =>
                                    handleToggleDocumento(
                                      secao.id,
                                      doc.id,
                                      checked as boolean
                                    )
                                  }
                                />
                                <span className="text-lg">{getTipoDocIcon(doc.tipo)}</span>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{doc.titulo}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {doc.tipo.toUpperCase()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </div>

          {/* Coluna direita: Ações e Preview */}
          <div className="flex flex-col gap-4">
            {/* Card de Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Alterar Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => handleAlterarStatus('rascunho')}
                  disabled={databookAtual.status === 'rascunho'}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Rascunho
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => handleAlterarStatus('em_revisao')}
                  disabled={databookAtual.status === 'em_revisao'}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Em Revisão
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => handleAlterarStatus('aprovado')}
                  disabled={databookAtual.status === 'aprovado'}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Aprovado
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => handleAlterarStatus('enviado')}
                  disabled={databookAtual.status === 'enviado'}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviado
                </Button>
              </CardContent>
            </Card>

            {/* Card de Informações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-medium">{databookAtual.cliente}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Revisão Atual</p>
                  <p className="font-medium">Rev. {databookAtual.revisao}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total de Seções</p>
                  <p className="font-medium">{databookAtual.secoes?.length || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Documentos Incluídos</p>
                  <p className="font-medium">
                    {getDocumentosIncluidos()} / {getTotalDocumentos()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Avisos */}
            {getDocumentosIncluidos() === 0 && (
              <Card className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Atenção</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Nenhum documento está marcado para inclusão. Marque os documentos
                        desejados antes de gerar o PDF.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
