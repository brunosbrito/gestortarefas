import { useState } from 'react';
import { FileSpreadsheet, FileText, ChevronDown, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';
import { ExportRowGenerico } from './ExportarComposicaoButton';

// Seção de exportação: título + linhas (cada seção tem estrutura independente)
export interface SecaoExportavel {
  titulo: string;
  rows: ExportRowGenerico[];
  bdi?: { percentual: number; valor: number };
  labelQuantidade?: string;
  labelUnidade?: string;
}

interface ExportarAbaCompletaButtonProps {
  tituloAba: string;
  secoes: SecaoExportavel[];
  disabled?: boolean;
}

type Formato = 'excel' | 'pdf';

const KEYS_ORDEM = ['item', 'codigo', 'descricao', 'quantidade', 'unidade', 'valorUnitario', 'subtotal'] as const;

function getCellValue(row: ExportRowGenerico, key: string, idx: number): string | number {
  switch (key) {
    case 'item':          return idx + 1;
    case 'codigo':        return row.codigo || '';
    case 'descricao':     return row.descricao;
    case 'quantidade':    return Number(row.quantidade) || 0;
    case 'unidade':       return row.unidade;
    case 'valorUnitario': return Number(row.valorUnitario) || 0;
    case 'subtotal':      return row.subtotal;
    default:              return '';
  }
}

export default function ExportarAbaCompletaButton({
  tituloAba,
  secoes,
  disabled = false,
}: ExportarAbaCompletaButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formato, setFormato] = useState<Formato>('excel');
  const [orientacao, setOrientacao] = useState<'auto' | 'retrato' | 'paisagem'>('auto');

  const secoesComDados = secoes.filter((s) => s.rows.length > 0);
  const totalItens = secoesComDados.reduce((sum, s) => sum + s.rows.length, 0);
  const totalGeral = secoesComDados.reduce(
    (sum, s) => sum + s.rows.reduce((ss, r) => ss + r.subtotal, 0),
    0,
  );
  const totalBDI = secoesComDados.reduce((sum, s) => sum + (s.bdi?.valor ?? 0), 0);
  const totalComBDI = totalGeral + totalBDI;

  // Auto: portrait se totalItens ≤ 25 (portrait tem mais altura → mais linhas por pág)
  const orientacaoResolvida: 'portrait' | 'landscape' =
    orientacao === 'retrato' ? 'portrait'
    : orientacao === 'paisagem' ? 'landscape'
    : totalItens <= 25 ? 'portrait' : 'landscape';

  const abrirDialog = (fmt: Formato) => {
    setFormato(fmt);
    setOpen(true);
  };

  // ---- Excel ----
  const exportarExcel = () => {
    const wb = XLSX.utils.book_new();
    const dataStr = new Date().toISOString().slice(0, 10);

    // Uma aba por seção
    secoesComDados.forEach((secao) => {
      const labelQtd = secao.labelQuantidade ?? 'Qtd';
      const labelUnid = secao.labelUnidade ?? 'Unid.';
      const headers = ['#', 'Código', 'Descrição', labelQtd, labelUnid, 'Valor Unit. (R$)', 'Subtotal (R$)'];
      const dataRows = secao.rows.map((row, idx) =>
        KEYS_ORDEM.map((key) => getCellValue(row, key, idx))
      );
      const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
      ws['!cols'] = [
        { wch: 5 },   // #
        { wch: 16 },  // Código
        { wch: 45 },  // Descrição
        { wch: 12 },  // Qtd
        { wch: 10 },  // Unid
        { wch: 18 },  // Valor Unit
        { wch: 18 },  // Subtotal
      ];
      XLSX.utils.book_append_sheet(wb, ws, secao.titulo.slice(0, 31));
    });

    // Aba Resumo Geral
    const hasBDI = secoesComDados.some((s) => s.bdi);
    const resumoRows: (string | number)[][] = [
      ['Relatório:', tituloAba],
      ['Gerado em:', new Date().toLocaleString('pt-BR')],
      [''],
      hasBDI
        ? ['Seção', 'Itens', 'Custo Direto (R$)', 'BDI%', 'BDI (R$)', 'Total c/ BDI (R$)']
        : ['Seção', 'Itens', 'Custo Direto (R$)'],
      ...secoesComDados.map((s) => {
        const custoDir = s.rows.reduce((sum, r) => sum + r.subtotal, 0);
        return hasBDI
          ? [s.titulo, s.rows.length, custoDir, s.bdi?.percentual ?? 0, s.bdi?.valor ?? 0, custoDir + (s.bdi?.valor ?? 0)]
          : [s.titulo, s.rows.length, custoDir];
      }),
      [''],
      hasBDI
        ? ['TOTAL GERAL', totalItens, totalGeral, '', totalBDI, totalComBDI]
        : ['TOTAL GERAL', totalItens, totalGeral],
    ];
    const wsResumo = XLSX.utils.aoa_to_sheet(resumoRows);
    wsResumo['!cols'] = hasBDI
      ? [{ wch: 30 }, { wch: 12 }, { wch: 22 }, { wch: 10 }, { wch: 18 }, { wch: 22 }]
      : [{ wch: 30 }, { wch: 12 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo Geral');

    XLSX.writeFile(wb, `${tituloAba.toLowerCase().replace(/\s+/g, '_')}_${dataStr}.xlsx`);
    toast({ title: 'Excel gerado', description: `${secoesComDados.length} seção(ões), ${totalItens} itens` });
    setOpen(false);
  };

  // ---- PDF ----
  const exportarPDF = () => {
    const orient = orientacaoResolvida;
    const doc = new jsPDF({ orientation: orient, unit: 'mm', format: 'a4' });
    const pageH = orient === 'portrait' ? 297 : 210;
    // Widths das 7 colunas fixas — compactadas para portrait
    const colWidths = orient === 'portrait'
      ? { item: 6, codigo: 16, descricao: 62, qtd: 18, unid: 12, valUnit: 28, subtotal: 28 }
      : { item: 8, codigo: 20, descricao: 75, qtd: 20, unid: 14, valUnit: 30, subtotal: 30 };
    let currentY = 14;

    // Título geral
    doc.setFontSize(15);
    doc.setTextColor(30, 30, 30);
    doc.text(tituloAba, 14, currentY);
    currentY += 7;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Gerado em ${new Date().toLocaleString('pt-BR')}  •  ${totalItens} item(s)  •  Total: ${formatCurrency(totalGeral)}`,
      14, currentY,
    );
    currentY += 9;

    secoesComDados.forEach((secao, sIdx) => {
      const labelQtd = secao.labelQuantidade ?? 'Qtd';
      const labelUnid = secao.labelUnidade ?? 'Unid.';
      const secaoTotal = secao.rows.reduce((sum, r) => sum + r.subtotal, 0);

      // Cabeçalho da seção
      doc.setFontSize(11);
      doc.setTextColor(37, 99, 235);
      doc.text(`${sIdx + 1}. ${secao.titulo}`, 14, currentY);
      currentY += 5;

      const head = [['#', 'Código', 'Descrição', labelQtd, labelUnid, 'Valor Unit. (R$)', 'Subtotal (R$)']];
      const body = secao.rows.map((row, idx) => [
        String(idx + 1),
        row.codigo || '',
        row.descricao,
        String(Number(row.quantidade) || 0),
        row.unidade,
        formatCurrency(Number(row.valorUnitario) || 0),
        formatCurrency(row.subtotal),
      ]);

      autoTable(doc, {
        startY: currentY,
        head,
        body,
        theme: 'grid',
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: { fontSize: 7, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: colWidths.item },
          1: { cellWidth: colWidths.codigo },
          2: { cellWidth: colWidths.descricao },
          3: { cellWidth: colWidths.qtd },
          4: { cellWidth: colWidths.unid },
          5: { cellWidth: colWidths.valUnit },
          6: { cellWidth: colWidths.subtotal },
        },
      });

      // Rodapé da seção — tabela estilizada
      const secaoStartY = (doc as any).lastAutoTable.finalY + 4;
      const secaoRodapeBody: (string | number)[][] = [
        [`Custo Direto ${secao.titulo}`, formatCurrency(secaoTotal)],
        ...(secao.bdi ? [
          [`+ BDI (${secao.bdi.percentual}%)`, formatCurrency(secao.bdi.valor)],
          ['= Total c/ BDI', formatCurrency(secaoTotal + secao.bdi.valor)],
        ] : []),
      ];
      autoTable(doc, {
        startY: secaoStartY,
        body: secaoRodapeBody,
        theme: 'plain',
        tableWidth: 120,
        margin: { left: 14 },
        styles: { fontSize: 8, cellPadding: { top: 2, bottom: 2, left: 4, right: 4 } },
        columnStyles: {
          0: { cellWidth: 75, fontStyle: 'normal' },
          1: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
        },
        didParseCell: (data) => {
          if (data.row.index === 0) {
            data.cell.styles.fillColor = [243, 244, 246];
            data.cell.styles.textColor = [55, 65, 81];
          }
          if (secao.bdi && data.row.index === 1) {
            data.cell.styles.fillColor = [239, 246, 255];
            data.cell.styles.textColor = [37, 99, 235];
          }
          if (secao.bdi && data.row.index === 2) {
            data.cell.styles.fillColor = [220, 252, 231];
            data.cell.styles.textColor = [22, 101, 52];
            data.cell.styles.fontStyle = 'bold';
          }
        },
      });
      currentY = (doc as any).lastAutoTable.finalY + 8;

      // Nova página se próxima seção não couber
      if (sIdx < secoesComDados.length - 1 && currentY > 175) {
        doc.addPage();
        currentY = 14;
      }
    });

    // Totais globais — tabela estilizada
    const globalRodapeBody: (string | number)[][] = [
      ['CUSTO DIRETO TOTAL', formatCurrency(totalGeral)],
      ...(totalBDI > 0 ? [
        ['+ BDI TOTAL', formatCurrency(totalBDI)],
        ['= TOTAL c/ BDI', formatCurrency(totalComBDI)],
      ] : []),
    ];
    autoTable(doc, {
      startY: currentY,
      body: globalRodapeBody,
      theme: 'plain',
      tableWidth: 130,
      margin: { left: 14 },
      styles: { fontSize: 9, cellPadding: { top: 3, bottom: 3, left: 5, right: 5 } },
      columnStyles: {
        0: { cellWidth: 85, fontStyle: 'bold' },
        1: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.row.index === 0) {
          data.cell.styles.fillColor = [229, 231, 235];
          data.cell.styles.textColor = [31, 41, 55];
          data.cell.styles.fontSize = 9;
        }
        if (totalBDI > 0 && data.row.index === 1) {
          data.cell.styles.fillColor = [219, 234, 254];
          data.cell.styles.textColor = [29, 78, 216];
          data.cell.styles.fontSize = 9;
        }
        if (totalBDI > 0 && data.row.index === 2) {
          data.cell.styles.fillColor = [187, 247, 208];
          data.cell.styles.textColor = [20, 83, 45];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 10;
        }
      },
    });

    // Paginação
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const pw = doc.internal.pageSize.getWidth();
      doc.text(`Página ${i} de ${pageCount}`, pw / 2, pageH - 8, { align: 'center' });
    }

    doc.save(`${tituloAba.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast({ title: 'PDF gerado', description: `${secoesComDados.length} seção(ões), ${totalItens} itens` });
    setOpen(false);
  };

  const handleExportar = () => {
    if (formato === 'excel') exportarExcel();
    else exportarPDF();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            disabled={disabled || totalItens === 0}
            title="Exportar aba completa (todas as seções)"
            className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Aba
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => abrirDialog('excel')}>
            <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
            Exportar Excel (aba completa)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => abrirDialog('pdf')}>
            <FileText className="mr-2 h-4 w-4 text-red-500" />
            Exportar PDF (aba completa)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {formato === 'excel'
                ? <FileSpreadsheet className="h-5 w-5 text-green-600" />
                : <FileText className="h-5 w-5 text-red-500" />}
              Exportar {formato === 'excel' ? 'Excel' : 'PDF'} — {tituloAba}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-muted/40 rounded-lg p-3 text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Seções com dados:</span>{' '}
                <strong>{secoesComDados.length}</strong>
              </p>
              <p>
                <span className="text-muted-foreground">Total de itens:</span>{' '}
                <strong>{totalItens}</strong>
              </p>
              <p>
                <span className="text-muted-foreground">Custo direto total:</span>{' '}
                <strong>{formatCurrency(totalGeral)}</strong>
              </p>
              {totalBDI > 0 && (
                <p>
                  <span className="text-muted-foreground">Total c/ BDI:</span>{' '}
                  <strong className="text-green-600">{formatCurrency(totalComBDI)}</strong>
                </p>
              )}
            </div>

            <Separator />

            <div className="border rounded-lg divide-y text-sm">
              {secoesComDados.map((s) => {
                const secTotal = s.rows.reduce((sum, r) => sum + r.subtotal, 0);
                return (
                  <div key={s.titulo} className="flex items-center justify-between px-3 py-2">
                    <span className="font-medium">{s.titulo}</span>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>{s.rows.length} item(s)</span>
                      <span className="font-medium text-foreground">{formatCurrency(secTotal)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground">
              {formato === 'excel'
                ? `Excel: ${secoesComDados.length} aba(s) de dados + aba "Resumo Geral"`
                : 'PDF: documento único com seções separadas por blocos'}
            </p>

            {/* Orientação — somente PDF */}
            {formato === 'pdf' && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Orientação</p>
                  <div className="flex gap-2">
                    {(['auto', 'retrato', 'paisagem'] as const).map((opt) => (
                      <Button
                        key={opt}
                        size="sm"
                        variant={orientacao === opt ? 'default' : 'outline'}
                        onClick={() => setOrientacao(opt)}
                        className="text-xs flex-1"
                      >
                        {opt === 'auto'
                          ? `Automático (${orientacaoResolvida === 'portrait' ? '↕ Retrato' : '↔ Paisagem'})`
                          : opt === 'retrato' ? '↕ Retrato' : '↔ Paisagem'}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleExportar}
              disabled={totalItens === 0}
              className={formato === 'excel' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              <Download className="mr-2 h-4 w-4" />
              Gerar {formato === 'excel' ? 'Excel' : 'PDF'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
