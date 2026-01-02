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
import { Inspecao } from '@/interfaces/QualidadeInterfaces';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  User,
  FileText,
  Package,
  Building,
} from 'lucide-react';

interface DetalhesInspecaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspecao: Inspecao | null;
}

export const DetalhesInspecaoDialog = ({
  open,
  onOpenChange,
  inspecao,
}: DetalhesInspecaoDialogProps) => {
  if (!inspecao) return null;

  const getResultadoBadge = (resultado: string) => {
    switch (resultado) {
      case 'aprovado':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Aprovado
          </Badge>
        );
      case 'aprovado_com_ressalvas':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1">
            <AlertTriangle className="w-4 h-4" />
            Aprovado com Ressalvas
          </Badge>
        );
      case 'reprovado':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1">
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
      recebimento: 'Recebimento de Material',
      em_processo: 'Em Processo (Fabricação)',
      final: 'Produto Final',
      auditoria: 'Auditoria Interna',
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
                Inspeção #{String(inspecao.codigo).padStart(4, '0')}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {getTipoLabel(inspecao.tipo)}
              </p>
            </div>
            {getResultadoBadge(inspecao.resultado)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Descrição
                </div>
                <p className="text-sm">{inspecao.descricao}</p>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  Projeto
                </div>
                <p className="text-sm">{inspecao.project?.name || 'Não informado'}</p>
              </div>

              {inspecao.serviceOrder && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Ordem de Serviço
                  </div>
                  <p className="text-sm">{inspecao.serviceOrder.description}</p>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Inspetor
                </div>
                <p className="text-sm">{inspecao.inspetor?.name || 'Não informado'}</p>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Data da Inspeção
                </div>
                <p className="text-sm">
                  {format(new Date(inspecao.dataInspecao), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>

              {inspecao.planoInspecao && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    Plano de Inspeção
                  </div>
                  <p className="text-sm">{inspecao.planoInspecao.nome}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Material Inspecionado */}
          {(inspecao.material || inspecao.lote || inspecao.fornecedor) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Material Inspecionado
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inspecao.material && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Material/Item
                    </div>
                    <p className="text-sm">{inspecao.material}</p>
                  </div>
                )}

                {inspecao.lote && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Lote
                    </div>
                    <p className="text-sm">{inspecao.lote}</p>
                  </div>
                )}

                {inspecao.fornecedor && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Fornecedor
                    </div>
                    <p className="text-sm">{inspecao.fornecedor}</p>
                  </div>
                )}

                {inspecao.quantidade && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Quantidade
                    </div>
                    <p className="text-sm">
                      {inspecao.quantidade} {inspecao.unidade || ''}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Campos Inspecionados */}
          {inspecao.campos && inspecao.campos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Campos Inspecionados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {inspecao.campos.map((campo, index) => (
                  <div
                    key={campo.id || index}
                    className="border-l-4 border-l-primary pl-4 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">{campo.nome}</div>
                        {campo.especificacao && (
                          <div className="text-xs text-muted-foreground mb-1">
                            Especificação: {campo.especificacao}
                            {campo.tolerancia && ` | Tolerância: ${campo.tolerancia}`}
                          </div>
                        )}
                        <div className="text-sm">
                          <span className="font-medium">Valor: </span>
                          {campo.valor?.toString() || '-'}
                        </div>
                        {campo.observacao && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Obs: {campo.observacao}
                          </div>
                        )}
                      </div>
                      {campo.conforme !== undefined && (
                        <Badge
                          variant={campo.conforme ? 'default' : 'destructive'}
                          className="shrink-0"
                        >
                          {campo.conforme ? 'Conforme' : 'Não Conforme'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Resultado e Ressalvas */}
          <Card
            className={
              inspecao.resultado === 'aprovado'
                ? 'border-green-200 bg-green-50/50'
                : inspecao.resultado === 'aprovado_com_ressalvas'
                ? 'border-yellow-200 bg-yellow-50/50'
                : 'border-red-200 bg-red-50/50'
            }
          >
            <CardHeader>
              <CardTitle className="text-base">Resultado da Inspeção</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>{getResultadoBadge(inspecao.resultado)}</div>

              {inspecao.ressalvas && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    {inspecao.resultado === 'reprovado'
                      ? 'Motivo da Reprovação'
                      : 'Ressalvas'}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{inspecao.ressalvas}</p>
                </div>
              )}

              {inspecao.rncGeradaId && (
                <div className="bg-red-100 dark:bg-red-950/30 p-3 rounded-lg">
                  <div className="text-sm font-medium text-red-700 dark:text-red-400">
                    RNC Gerada Automaticamente
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                    Esta inspeção gerou uma Não-Conformidade que deve ser tratada.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Imagens */}
          {inspecao.imagens && inspecao.imagens.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Registros Fotográficos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {inspecao.imagens.map((imagem, index) => (
                    <div key={imagem.id} className="relative group">
                      <div className="aspect-square overflow-hidden rounded-lg border">
                        <img
                          src={imagem.url}
                          alt={imagem.descricao || `Imagem ${index + 1}`}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                        />
                      </div>
                      {imagem.descricao && (
                        <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-2 rounded">
                          {imagem.descricao}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assinatura */}
          {inspecao.assinaturaInspetor && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assinatura do Inspetor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-white">
                  <img
                    src={inspecao.assinaturaInspetor}
                    alt="Assinatura"
                    className="max-h-24"
                  />
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
