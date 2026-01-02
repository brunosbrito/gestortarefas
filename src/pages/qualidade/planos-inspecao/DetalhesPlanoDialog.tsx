import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanoInspecao } from '@/interfaces/QualidadeInterfaces';
import { FileText, Package, Power, PowerOff } from 'lucide-react';

interface DetalhesPlanoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plano: PlanoInspecao | null;
}

export const DetalhesPlanoDialog = ({
  open,
  onOpenChange,
  plano,
}: DetalhesPlanoDialogProps) => {
  if (!plano) return null;

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      recebimento: 'Recebimento de Material',
      em_processo: 'Em Processo (Fabricação)',
      final: 'Produto Final',
      auditoria: 'Auditoria Interna',
    };
    return tipos[tipo] || tipo;
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'recebimento':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'em_processo':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-100';
      case 'final':
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'auditoria':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-100';
      default:
        return '';
    }
  };

  const getTipoFieldLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      texto: 'Texto',
      numero: 'Número',
      medicao: 'Medição',
      checkbox: 'Checkbox',
      radio: 'Radio',
      select: 'Select',
    };
    return tipos[tipo] || tipo;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                {plano.nome}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {getTipoLabel(plano.tipo)} - Versão {plano.versao}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getTipoBadgeColor(plano.tipo)}>
                {getTipoLabel(plano.tipo)}
              </Badge>
              {plano.ativo ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
                  <Power className="w-3 h-3" />
                  Ativo
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <PowerOff className="w-3 h-3" />
                  Inativo
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plano.descricao && (
                <div className="md:col-span-2">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Descrição
                  </div>
                  <p className="text-sm">{plano.descricao}</p>
                </div>
              )}

              {plano.produto && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    Produto/Categoria
                  </div>
                  <p className="text-sm">{plano.produto}</p>
                </div>
              )}

              {plano.processo && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Processo
                  </div>
                  <p className="text-sm">{plano.processo}</p>
                </div>
              )}

              {plano.frequencia && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Frequência de Inspeção
                  </div>
                  <p className="text-sm">{plano.frequencia}</p>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Status
                </div>
                <p className="text-sm">
                  {plano.ativo ? 'Ativo' : 'Inativo'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Campos de Inspeção */}
          {plano.campos && plano.campos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Campos de Inspeção ({plano.campos.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {plano.campos.map((campo, index) => (
                  <div
                    key={campo.id || index}
                    className="border-l-4 border-l-primary pl-4 py-3 bg-muted/50 rounded-r"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">
                            {index + 1}. {campo.nome}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getTipoFieldLabel(campo.tipo)}
                          </Badge>
                          {campo.obrigatorio && (
                            <Badge variant="secondary" className="text-xs">
                              Obrigatório
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                          {campo.especificacao && (
                            <div>
                              <span className="font-medium">Especificação:</span>{' '}
                              {campo.especificacao}
                            </div>
                          )}

                          {campo.tolerancia && (
                            <div>
                              <span className="font-medium">Tolerância:</span>{' '}
                              {campo.tolerancia}
                            </div>
                          )}

                          {campo.metodoMedicao && (
                            <div>
                              <span className="font-medium">Método:</span>{' '}
                              {campo.metodoMedicao}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Histórico de Revisões */}
          {plano.revisadoPor && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Última Revisão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p>
                    <span className="font-medium">Revisado por:</span>{' '}
                    {plano.revisadoPor.name}
                  </p>
                  {plano.dataRevisao && (
                    <p>
                      <span className="font-medium">Data:</span>{' '}
                      {new Date(plano.dataRevisao).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
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
