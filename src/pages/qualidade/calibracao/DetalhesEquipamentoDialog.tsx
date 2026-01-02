import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Equipamento } from '@/interfaces/QualidadeInterfaces';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Gauge,
  Settings,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Download,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface DetalhesEquipamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipamento: Equipamento | null;
}

export const DetalhesEquipamentoDialog = ({
  open,
  onOpenChange,
  equipamento,
}: DetalhesEquipamentoDialogProps) => {
  if (!equipamento) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'em_dia':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
            <CheckCircle className="w-4 h-4" />
            Em Dia
          </Badge>
        );
      case 'proximo_vencimento':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1">
            <Clock className="w-4 h-4" />
            Próximo Vencimento
          </Badge>
        );
      case 'vencido':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1">
            <AlertCircle className="w-4 h-4" />
            Vencido
          </Badge>
        );
      case 'reprovado':
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 gap-1">
            <XCircle className="w-4 h-4" />
            Reprovado
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      paquimetro: 'Paquímetro',
      micrometro: 'Micrômetro',
      torquimetro: 'Torquímetro',
      manometro: 'Manômetro',
      balanca: 'Balança',
      outro: 'Outro',
    };
    return tipos[tipo] || tipo;
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                {equipamento.nome}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {getTipoLabel(equipamento.tipo)}
              </p>
            </div>
            {getStatusBadge(equipamento.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Informações do Equipamento
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Nome
                </div>
                <p className="text-sm">{equipamento.nome}</p>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Tipo
                </div>
                <p className="text-sm">{getTipoLabel(equipamento.tipo)}</p>
              </div>

              {equipamento.numeroSerie && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Número de Série
                  </div>
                  <p className="text-sm">{equipamento.numeroSerie}</p>
                </div>
              )}

              {equipamento.patrimonio && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Patrimônio
                  </div>
                  <p className="text-sm">{equipamento.patrimonio}</p>
                </div>
              )}

              {equipamento.setor && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Setor/Localização
                  </div>
                  <p className="text-sm">{equipamento.setor}</p>
                </div>
              )}

              {equipamento.responsavel && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Responsável
                  </div>
                  <p className="text-sm">{equipamento.responsavel.name}</p>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Frequência de Calibração
                </div>
                <p className="text-sm">{equipamento.frequenciaCalibracao} meses</p>
              </div>

              {equipamento.laboratorioCalibrador && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Laboratório Calibrador
                  </div>
                  <p className="text-sm">{equipamento.laboratorioCalibrador}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status de Calibração */}
          <Card
            className={
              equipamento.status === 'vencido'
                ? 'border-red-200 bg-red-50/50'
                : equipamento.status === 'proximo_vencimento'
                ? 'border-yellow-200 bg-yellow-50/50'
                : equipamento.status === 'em_dia'
                ? 'border-green-200 bg-green-50/50'
                : ''
            }
          >
            <CardHeader>
              <CardTitle className="text-base">Status de Calibração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>{getStatusBadge(equipamento.status)}</div>

              {equipamento.calibracoes && equipamento.calibracoes.length > 0 && (
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Última Calibração
                    </div>
                    <p className="text-sm">
                      {format(
                        new Date(equipamento.calibracoes[0].dataCalibracao),
                        'dd/MM/yyyy',
                        { locale: ptBR }
                      )}
                    </p>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Próxima Calibração
                    </div>
                    <p className="text-sm">
                      {format(
                        new Date(equipamento.calibracoes[0].proximaCalibracao),
                        'dd/MM/yyyy',
                        { locale: ptBR }
                      )}
                    </p>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Resultado
                    </div>
                    <Badge
                      className={
                        equipamento.calibracoes[0].resultado === 'aprovado'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }
                    >
                      {equipamento.calibracoes[0].resultado === 'aprovado'
                        ? 'Aprovado'
                        : 'Reprovado'}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Calibrações */}
          {equipamento.calibracoes && equipamento.calibracoes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Histórico de Calibrações ({equipamento.calibracoes.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {equipamento.calibracoes.map((calibracao) => (
                  <div
                    key={calibracao.id}
                    className="border-l-4 border-l-blue-500 pl-4 py-2 bg-muted/50 rounded-r"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              calibracao.resultado === 'aprovado' ? 'default' : 'destructive'
                            }
                          >
                            {calibracao.resultado === 'aprovado' ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {calibracao.resultado === 'aprovado' ? 'Aprovado' : 'Reprovado'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Certificado {calibracao.numeroCertificado}
                          </span>
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>
                            <span className="font-medium">Laboratório:</span>{' '}
                            {calibracao.laboratorio}
                          </div>
                          <div>
                            <span className="font-medium">Data da Calibração:</span>{' '}
                            {format(new Date(calibracao.dataCalibracao), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </div>
                          <div>
                            <span className="font-medium">Próxima Calibração:</span>{' '}
                            {format(new Date(calibracao.proximaCalibracao), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </div>
                          <div>
                            <span className="font-medium">Upload por:</span>{' '}
                            {calibracao.uploadPor.name}
                          </div>
                          {calibracao.observacoes && (
                            <div>
                              <span className="font-medium">Observações:</span>{' '}
                              {calibracao.observacoes}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(calibracao.certificadoUrl)}
                        className="gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Certificado
                      </Button>
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
