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
  FileDown,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { InspecaoPdfService } from '@/services/InspecaoPdfService';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [maximized, setMaximized] = useState(false);

  if (!inspecao) return null;

  const handleGerarPdf = async () => {
    try {
      setGerandoPdf(true);
      await InspecaoPdfService.downloadPDF(inspecao);
      toast({
        title: 'PDF gerado com sucesso',
        description: 'O relatório foi baixado para seu computador.',
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Não foi possível gerar o relatório. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setGerandoPdf(false);
    }
  };

  const getResultadoBadge = (resultado: string) => {
    switch (resultado) {
      case 'aprovado':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1 print:bg-white print:text-black print:border print:border-black">
            <CheckCircle2 className="w-4 h-4" />
            Aprovado
          </Badge>
        );
      case 'aprovado_com_ressalvas':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1 print:bg-white print:text-black print:border print:border-black">
            <AlertTriangle className="w-4 h-4" />
            Aprovado com Ressalvas
          </Badge>
        );
      case 'reprovado':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1 print:bg-white print:text-black print:border print:border-black">
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
    <>
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          body * {
            visibility: hidden;
          }

          .print-container, .print-container * {
            visibility: visible !important;
          }

          .print-container {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .print-hide {
            display: none !important;
          }

          .print-show {
            display: block !important;
          }

          .print-page-break {
            page-break-after: always;
            break-after: always;
          }

          .print-avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          @page {
            margin: 15mm 15mm 15mm 15mm;
            size: A4 portrait;
          }

          /* Remove shadows and rounded corners for print */
          .print-container * {
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          /* Ensure table borders are visible */
          table, th, td {
            border-color: black !important;
          }

          /* Ensure background colors print */
          .print-gray-bg {
            background-color: #f3f4f6 !important;
          }

          .print-border {
            border: 1px solid #000 !important;
          }

          .print-border-2 {
            border: 2px solid #000 !important;
          }

          /* Hide dialog overlay */
          [role="dialog"] {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
        }
      `}</style>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={maximized ? "max-w-[95vw] max-h-[95vh] overflow-y-auto print:max-w-full print:max-h-full print:overflow-visible print:p-0" : "max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-full print:max-h-full print:overflow-visible print:p-0"}>
          <div className="print-container">
            {/* Print Header - Apenas visível na impressão */}
            <div className="hidden print:block print-show print-avoid-break" style={{ marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '60%', verticalAlign: 'top', padding: '10px', borderBottom: '3px solid black' }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>GML ESTRUTURAS</div>
                      <div style={{ fontSize: '12px' }}>Sistema de Gestão da Qualidade</div>
                    </td>
                    <td style={{ width: '40%', textAlign: 'right', verticalAlign: 'top', padding: '10px', borderBottom: '3px solid black' }}>
                      <div style={{ fontSize: '10px', marginBottom: '3px' }}>Data de Emissão:</div>
                      <div style={{ fontSize: '12px', fontWeight: '600' }}>
                        {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ backgroundColor: '#f3f4f6', padding: '12px', textAlign: 'center', border: '1px solid black', marginBottom: '20px' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                  RELATÓRIO DE INSPEÇÃO DE QUALIDADE
                </div>
                <div style={{ fontSize: '13px' }}>
                  Inspeção #{String(inspecao.codigo).padStart(4, '0')} - {getTipoLabel(inspecao.tipo)}
                </div>
              </div>
            </div>
            <DialogHeader className="print:hidden">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-2">
                    Inspeção #{String(inspecao.codigo).padStart(4, '0')}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getTipoLabel(inspecao.tipo)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setMaximized(!maximized)}
                  >
                    {maximized ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                  {getResultadoBadge(inspecao.resultado)}
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 print:space-y-0">
              {/* Informações Básicas */}
              <div className="print-avoid-break">
                <Card className="print:border-0 print:shadow-none">
                  <CardHeader className="print:p-0 print:pb-2">
                    <CardTitle className="text-base" style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', paddingBottom: '5px', borderBottom: '2px solid black' }}>
                      <span className="hidden print:inline">1. </span>INFORMAÇÕES BÁSICAS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="print:p-0 print:pt-2">
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                      <tbody>
                        <tr className="print:hidden">
                          <td colSpan={2} className="pb-3">
                            <div className="text-sm font-medium text-muted-foreground mb-1">Descrição da Inspeção</div>
                            <p className="text-sm">{inspecao.descricao}</p>
                          </td>
                        </tr>
                        <tr className="hidden print:table-row">
                          <td colSpan={2} style={{ padding: '8px', borderBottom: '1px solid #ddd', backgroundColor: '#f9fafb' }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Descrição da Inspeção</div>
                            <div style={{ fontSize: '12px' }}>{inspecao.descricao}</div>
                          </td>
                        </tr>

                        <tr className="print:hidden">
                          <td className="pb-3 pr-2">
                            <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              Projeto/Obra
                            </div>
                            <p className="text-sm">{inspecao.project?.name || 'Não informado'}</p>
                          </td>
                          <td className="pb-3 pl-2">
                            <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                              <User className="w-4 h-4" />
                              Inspetor Responsável
                            </div>
                            <p className="text-sm">{inspecao.inspetor?.name || 'Não informado'}</p>
                          </td>
                        </tr>
                        <tr className="hidden print:table-row">
                          <td style={{ padding: '8px', borderBottom: '1px solid #ddd', width: '50%' }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Projeto/Obra</div>
                            <div style={{ fontSize: '12px' }}>{inspecao.project?.name || 'Não informado'}</div>
                          </td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #ddd', width: '50%' }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Inspetor Responsável</div>
                            <div style={{ fontSize: '12px' }}>{inspecao.inspetor?.name || 'Não informado'}</div>
                          </td>
                        </tr>

                        {inspecao.serviceOrder && (
                          <>
                            <tr className="print:hidden">
                              <td className="pb-3 pr-2">
                                <div className="text-sm font-medium text-muted-foreground mb-1">Ordem de Serviço</div>
                                <p className="text-sm">{inspecao.serviceOrder.description}</p>
                              </td>
                              <td className="pb-3 pl-2">
                                <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Data da Inspeção
                                </div>
                                <p className="text-sm">{format(new Date(inspecao.dataInspecao), "dd/MM/yyyy", { locale: ptBR })}</p>
                              </td>
                            </tr>
                            <tr className="hidden print:table-row">
                              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Ordem de Serviço</div>
                                <div style={{ fontSize: '12px' }}>{inspecao.serviceOrder.description}</div>
                              </td>
                              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Data da Inspeção</div>
                                <div style={{ fontSize: '12px' }}>{format(new Date(inspecao.dataInspecao), "dd/MM/yyyy", { locale: ptBR })}</div>
                              </td>
                            </tr>
                          </>
                        )}

                        {!inspecao.serviceOrder && (
                          <>
                            <tr className="print:hidden">
                              <td colSpan={2} className="pb-3">
                                <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Data da Inspeção
                                </div>
                                <p className="text-sm">{format(new Date(inspecao.dataInspecao), "dd/MM/yyyy", { locale: ptBR })}</p>
                              </td>
                            </tr>
                            <tr className="hidden print:table-row">
                              <td colSpan={2} style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Data da Inspeção</div>
                                <div style={{ fontSize: '12px' }}>{format(new Date(inspecao.dataInspecao), "dd/MM/yyyy", { locale: ptBR })}</div>
                              </td>
                            </tr>
                          </>
                        )}

                        {inspecao.planoInspecao && (
                          <>
                            <tr className="print:hidden">
                              <td colSpan={2} className="pb-3">
                                <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  Plano de Inspeção Utilizado
                                </div>
                                <p className="text-sm">{inspecao.planoInspecao.nome}</p>
                              </td>
                            </tr>
                            <tr className="hidden print:table-row">
                              <td colSpan={2} style={{ padding: '8px', borderBottom: '1px solid #ddd', backgroundColor: '#f9fafb' }}>
                                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Plano de Inspeção Utilizado</div>
                                <div style={{ fontSize: '12px' }}>{inspecao.planoInspecao.nome}</div>
                              </td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>

              {/* Material Inspecionado */}
              {(inspecao.material || inspecao.lote || inspecao.fornecedor) && (
                <div className="print-avoid-break" style={{ marginTop: '15px' }}>
                  <Card className="print:border-0 print:shadow-none">
                    <CardHeader className="print:p-0 print:pb-2">
                      <CardTitle className="text-base flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', paddingBottom: '5px', borderBottom: '2px solid black' }}>
                        <Package className="w-4 h-4 print:hidden" />
                        <span className="hidden print:inline">2. </span>MATERIAL/ITEM INSPECIONADO
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="print:p-0 print:pt-2">
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                        <tbody>
                          {inspecao.material && inspecao.lote && (
                            <>
                              <tr className="print:hidden">
                                <td className="pb-3 pr-2">
                                  <div className="text-sm font-medium text-muted-foreground mb-1">Material/Item</div>
                                  <p className="text-sm">{inspecao.material}</p>
                                </td>
                                <td className="pb-3 pl-2">
                                  <div className="text-sm font-medium text-muted-foreground mb-1">Lote/Batch</div>
                                  <p className="text-sm">{inspecao.lote}</p>
                                </td>
                              </tr>
                              <tr className="hidden print:table-row">
                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd', width: '50%' }}>
                                  <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Material/Item</div>
                                  <div style={{ fontSize: '12px' }}>{inspecao.material}</div>
                                </td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd', width: '50%' }}>
                                  <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Lote/Batch</div>
                                  <div style={{ fontSize: '12px' }}>{inspecao.lote}</div>
                                </td>
                              </tr>
                            </>
                          )}

                          {inspecao.fornecedor && inspecao.quantidade && (
                            <>
                              <tr className="print:hidden">
                                <td className="pb-3 pr-2">
                                  <div className="text-sm font-medium text-muted-foreground mb-1">Fornecedor</div>
                                  <p className="text-sm">{inspecao.fornecedor}</p>
                                </td>
                                <td className="pb-3 pl-2">
                                  <div className="text-sm font-medium text-muted-foreground mb-1">Quantidade Inspecionada</div>
                                  <p className="text-sm">{inspecao.quantidade} {inspecao.unidade || ''}</p>
                                </td>
                              </tr>
                              <tr className="hidden print:table-row">
                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                                  <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Fornecedor</div>
                                  <div style={{ fontSize: '12px' }}>{inspecao.fornecedor}</div>
                                </td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                                  <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Quantidade Inspecionada</div>
                                  <div style={{ fontSize: '12px' }}>{inspecao.quantidade} {inspecao.unidade || ''}</div>
                                </td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Campos Inspecionados */}
              {inspecao.campos && inspecao.campos.length > 0 && (
                <div className="print-avoid-break" style={{ marginTop: '15px' }}>
                  <Card className="print:border-0 print:shadow-none">
                    <CardHeader className="print:p-0 print:pb-2">
                      <CardTitle className="text-base" style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', paddingBottom: '5px', borderBottom: '2px solid black' }}>
                        <span className="hidden print:inline">3. </span>CAMPOS/CRITÉRIOS INSPECIONADOS
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="print:p-0 print:pt-2">
                      {/* Versão impressão - tabela */}
                      <table className="hidden print:table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', border: '1px solid black' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid black' }}>
                            <th style={{ textAlign: 'left', padding: '8px', borderRight: '1px solid #999', fontSize: '11px', fontWeight: '700', width: '5%' }}>#</th>
                            <th style={{ textAlign: 'left', padding: '8px', borderRight: '1px solid #999', fontSize: '11px', fontWeight: '700', width: '30%' }}>Campo/Critério</th>
                            <th style={{ textAlign: 'left', padding: '8px', borderRight: '1px solid #999', fontSize: '11px', fontWeight: '700', width: '25%' }}>Especificação</th>
                            <th style={{ textAlign: 'left', padding: '8px', borderRight: '1px solid #999', fontSize: '11px', fontWeight: '700', width: '20%' }}>Valor Medido</th>
                            <th style={{ textAlign: 'center', padding: '8px', fontSize: '11px', fontWeight: '700', width: '20%' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inspecao.campos.map((campo, index) => (
                            <tr key={campo.id || index} style={{ borderBottom: '1px solid #ddd' }}>
                              <td style={{ padding: '6px 8px', borderRight: '1px solid #ddd', fontSize: '11px', verticalAlign: 'top' }}>{index + 1}</td>
                              <td style={{ padding: '6px 8px', borderRight: '1px solid #ddd', fontSize: '11px', verticalAlign: 'top' }}>
                                <div style={{ fontWeight: '600', marginBottom: '2px' }}>{campo.nome}</div>
                                {campo.observacao && (
                                  <div style={{ fontSize: '10px', color: '#666', marginTop: '3px' }}>Obs: {campo.observacao}</div>
                                )}
                              </td>
                              <td style={{ padding: '6px 8px', borderRight: '1px solid #ddd', fontSize: '11px', verticalAlign: 'top' }}>
                                {campo.especificacao || '-'}
                                {campo.tolerancia && <div style={{ fontSize: '10px', marginTop: '2px' }}>Tol: {campo.tolerancia}</div>}
                              </td>
                              <td style={{ padding: '6px 8px', borderRight: '1px solid #ddd', fontSize: '11px', fontWeight: '600', verticalAlign: 'top' }}>
                                {campo.valor?.toString() || '-'}
                              </td>
                              <td style={{ padding: '6px 8px', fontSize: '11px', textAlign: 'center', fontWeight: '600', verticalAlign: 'top' }}>
                                {campo.conforme !== undefined ? (
                                  campo.conforme ? '✓ Conforme' : '✗ Não Conforme'
                                ) : (
                                  '-'
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Versão tela - cards */}
                      <div className="print:hidden space-y-3">
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
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Resultado e Ressalvas */}
              <Card
                className={`print:border-2 print:shadow-none print-avoid-break ${
                  inspecao.resultado === 'aprovado'
                    ? 'border-green-200 bg-green-50/50 print:border-green-600'
                    : inspecao.resultado === 'aprovado_com_ressalvas'
                    ? 'border-yellow-200 bg-yellow-50/50 print:border-yellow-600'
                    : 'border-red-200 bg-red-50/50 print:border-red-600'
                }`}
              >
                <CardHeader className="print:pb-2 print:bg-gray-100">
                  <CardTitle className="text-base print:text-lg print:font-bold">
                    4. RESULTADO DA INSPEÇÃO
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 print:space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold print:text-lg">Status:</span>
                    {getResultadoBadge(inspecao.resultado)}
                  </div>

                  {inspecao.ressalvas && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1 print:text-black print:font-semibold">
                        {inspecao.resultado === 'reprovado'
                          ? 'Motivo da Reprovação:'
                          : 'Ressalvas/Observações:'}
                      </div>
                      <p className="text-sm whitespace-pre-wrap print:text-base print:border print:border-gray-300 print:p-3 print:rounded print:bg-gray-50">
                        {inspecao.ressalvas}
                      </p>
                    </div>
                  )}

                  {inspecao.rncGeradaId && (
                    <div className="bg-red-100 dark:bg-red-950/30 p-3 rounded-lg print:border-2 print:border-red-600">
                      <div className="text-sm font-medium text-red-700 dark:text-red-400 print:text-black">
                        ⚠ RNC GERADA AUTOMATICAMENTE
                      </div>
                      <p className="text-xs text-red-600 dark:text-red-500 mt-1 print:text-black">
                        Esta inspeção gerou uma Registro de Não-Conformidade que deve ser tratada.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Imagens */}
              {inspecao.imagens && inspecao.imagens.length > 0 && (
                <Card className="print:border print:border-black print:shadow-none print-page-break">
                  <CardHeader className="print:pb-2">
                    <CardTitle className="text-base print:text-lg print:font-bold">
                      5. REGISTROS FOTOGRÁFICOS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-2 print:gap-3">
                      {inspecao.imagens.map((imagem, index) => (
                        <div key={imagem.id} className="relative group print-avoid-break">
                          <div className="aspect-square overflow-hidden rounded-lg border print:border-black">
                            <img
                              src={imagem.url}
                              alt={imagem.descricao || `Imagem ${index + 1}`}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform print:transform-none"
                            />
                          </div>
                          {imagem.descricao && (
                            <div className="mt-1 text-xs text-center print:text-sm print:border print:border-gray-300 print:p-1">
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
                <Card className="print:border print:border-black print:shadow-none print-avoid-break">
                  <CardHeader className="print:pb-2">
                    <CardTitle className="text-base print:text-lg print:font-bold">
                      6. ASSINATURA DO INSPETOR
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4 bg-white print:border-black">
                      <img
                        src={inspecao.assinaturaInspetor}
                        alt="Assinatura"
                        className="max-h-24 print:max-h-20"
                      />
                      <div className="mt-2 pt-2 border-t print:border-t-black">
                        <p className="text-sm font-medium print:text-base">
                          {inspecao.inspetor?.name}
                        </p>
                        <p className="text-xs text-muted-foreground print:text-black">
                          Inspetor Responsável
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rodapé para impressão */}
              <div className="hidden print:block print-show mt-8 pt-4 border-t-2 border-black text-xs text-center">
                <p>Este documento foi gerado eletronicamente pelo Sistema de Gestão da Qualidade - GML Estruturas</p>
                <p className="mt-1">
                  Documento: INSP-{String(inspecao.codigo).padStart(4, '0')} |
                  Emitido em: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t print-hide">
              <Button
                onClick={handleGerarPdf}
                disabled={gerandoPdf}
                className="gap-2"
              >
                <FileDown className="w-4 h-4" />
                {gerandoPdf ? 'Gerando PDF...' : 'Gerar PDF'}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
