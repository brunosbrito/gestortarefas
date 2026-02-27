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

  const secoesComDados = secoes.filter((s) => s.rows.length > 0);
  const totalItens = secoesComDados.reduce((sum, s) => sum + s.rows.length, 0);
  const totalGeral = secoesComDados.reduce(
    (sum, s) => sum + s.rows.reduce((ss, r) => ss + r.subtotal, 0),
    0,
  );

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
    const resumoRows: (string | number)[][] = [
      ['Relatório:', tituloAba],
      ['Gerado em:', new Date().toLocaleString('pt-BR')],
      [''],
      ['Seção', 'Itens', 'Custo Direto (R$)'],
      ...secoesComDados.map((s) => [
        s.titulo,
        s.rows.length,
        s.rows.reduce((sum, r) => sum + r.subtotal, 0),
      ]),
      [''],
      ['TOTAL GERAL', totalItens, totalGeral],
    ];
    const wsResumo = XLSX.utils.aoa_to_sheet(resumoRows);
    wsResumo['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo Geral');

    XLSX.writeFile(wb, `${tituloAba.toLowerCase().replace(/\s+/g, '_')}_${dataStr}.xlsx`);
    toast({ title: 'Excel gerado', description: `${secoesComDados.length} seção(ões), ${totalItens} itens` });
    setOpen(false);
  };

  // ---- PDF ----
  const exportarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
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
          0: { cellWidth: 8 },
          1: { cellWidth: 20 },
          2: { cellWidth: 75 },
          3: { cellWidth: 20 },
          4: { cellWidth: 14 },
          5: { cellWidth: 30 },
          6: { cellWidth: 30 },
        },
      });

      const lastY = (doc as any).lastAutoTable.finalY;
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      doc.text(`Subtotal ${secao.titulo}: ${formatCurrency(secaoTotal)}`, 14, lastY + 5);
      currentY = lastY + 13;

      // Nova página se próxima seção não couber
      if (sIdx < secoesComDados.length - 1 && currentY > 175) {
        doc.addPage();
        currentY = 14;
      }
    });

    // Total geral no final
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(`CUSTO DIRETO TOTAL: ${formatCurrency(totalGeral)}`, 14, currentY);

    // Paginação
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const pw = doc.internal.pageSize.getWidth();
      doc.text(`Página ${i} de ${pageCount}`, pw / 2, 205, { align: 'center' });
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
