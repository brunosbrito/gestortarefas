import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Certificado } from '@/interfaces/QualidadeInterfaces';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  FileCheck,
  Building,
  Package,
  Calendar,
  User,
  Mail,
  Download,
  ExternalLink,
  Check,
  X,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface DetalhesCertificadoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificado: Certificado | null;
}

export const DetalhesCertificadoDialog = ({
  open,
  onOpenChange,
  certificado,
}: DetalhesCertificadoDialogProps) => {
  if (!certificado) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 gap-1">
            <Clock className="w-4 h-4" />
            Pendente
          </Badge>
        );
      case 'recebido':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1">
            <Download className="w-4 h-4" />
            Recebido
          </Badge>
        );
      case 'em_analise':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1">
            <AlertTriangle className="w-4 h-4" />
            Em Análise
          </Badge>
        );
      case 'aprovado':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
            <Check className="w-4 h-4" />
            Aprovado
          </Badge>
        );
      case 'reprovado':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1">
            <X className="w-4 h-4" />
            Reprovado
          </Badge>
        );
      case 'enviado':
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 gap-1">
            <Mail className="w-4 h-4" />
            Enviado
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleDownload = () => {
    window.open(certificado.arquivoUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                {certificado.tipoCertificado}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Nº {certificado.numeroCertificado}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(certificado.status)}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações do Certificado</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Tipo de Certificado
                </div>
                <p className="text-sm">{certificado.tipoCertificado}</p>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Número do Certificado
                </div>
                <p className="text-sm">{certificado.numeroCertificado}</p>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Fornecedor
                </div>
                <p className="text-sm">{certificado.fornecedor}</p>
              </div>

              {certificado.laboratorio && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Laboratório
                  </div>
                  <p className="text-sm">{certificado.laboratorio}</p>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  Projeto
                </div>
                <p className="text-sm">{certificado.project?.name || 'Não informado'}</p>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Arquivo
                </div>
                <p className="text-sm flex items-center gap-1">
                  <FileCheck className="w-4 h-4" />
                  {certificado.nomeArquivo}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Material/Lote */}
          {(certificado.material || certificado.lote) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Material/Lote
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificado.material && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Material/Item
                    </div>
                    <p className="text-sm">{certificado.material}</p>
                  </div>
                )}

                {certificado.lote && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Lote
                    </div>
                    <p className="text-sm">{certificado.lote}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Datas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Datas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Data de Emissão
                </div>
                <p className="text-sm">
                  {format(new Date(certificado.dataEmissao), 'dd/MM/yyyy', {
                    locale: ptBR,
                  })}
                </p>
              </div>

              {certificado.dataValidade && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Data de Validade
                  </div>
                  <p className="text-sm">
                    {format(new Date(certificado.dataValidade), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Upload em
                </div>
                <p className="text-sm">
                  {format(new Date(certificado.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>

              {certificado.dataAnalise && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Analisado em
                  </div>
                  <p className="text-sm">
                    {format(new Date(certificado.dataAnalise), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status e Análise */}
          <Card
            className={
              certificado.status === 'aprovado'
                ? 'border-green-200 bg-green-50/50'
                : certificado.status === 'reprovado'
                ? 'border-red-200 bg-red-50/50'
                : ''
            }
          >
            <CardHeader>
              <CardTitle className="text-base">Status e Análise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>{getStatusBadge(certificado.status)}</div>

              {certificado.analisadoPor && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Analisado por
                  </div>
                  <p className="text-sm">{certificado.analisadoPor.name}</p>
                </div>
              )}

              {certificado.motivoReprovacao && (
                <div className="bg-red-100 dark:bg-red-950/30 p-3 rounded-lg">
                  <div className="text-sm font-medium text-red-700 dark:text-red-400">
                    Motivo da Reprovação
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                    {certificado.motivoReprovacao}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Envios */}
          {certificado.envios && certificado.envios.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Histórico de Envios ({certificado.envios.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {certificado.envios.map((envio) => (
                  <div
                    key={envio.id}
                    className="border-l-4 border-l-purple-500 pl-4 py-2 bg-muted/50 rounded-r"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1">
                          {envio.assunto}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>
                            <span className="font-medium">Para:</span>{' '}
                            {envio.destinatarios.join(', ')}
                          </div>
                          <div>
                            <span className="font-medium">Enviado por:</span>{' '}
                            {envio.enviadoPor.name}
                          </div>
                          <div>
                            <span className="font-medium">Data:</span>{' '}
                            {format(new Date(envio.dataEnvio), "dd/MM/yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
