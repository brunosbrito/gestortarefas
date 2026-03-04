import { useState } from 'react';
import { FileSpreadsheet, FileText, ChevronDown, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

// Linha genérica de exportação
export interface ExportRowGenerico {
  codigo?: string;
  descricao: string;
  quantidade: number | '';
  qtdPeriodo?: number;
  unidade: string;
  valorUnitario: number | '';
  subtotal: number;
}

interface ColDef {
  key: string;
  label: string;
  checked: boolean;
  conditionalKey?: string; // só aparece se a prop com este nome for true
}

interface ExportarComposicaoButtonProps {
  titulo: string;
  rows: ExportRowGenerico[];
  bdi?: { percentual: number; valor: number };
  mostrarQtdPeriodo?: boolean;
  labelQuantidade?: string;
  labelUnidade?: string;
  disabled?: boolean;
}

const buildColunas = (
  mostrarQtdPeriodo: boolean,
  labelQuantidade: string,
  labelUnidade: string,
): ColDef[] => [
  { key: 'item',         label: '#',                  checked: true },
  { key: 'codigo',       label: 'Código',             checked: true },
  { key: 'descricao',    label: 'Descrição',          checked: true },
  { key: 'quantidade',   label: labelQuantidade,      checked: true },
  { key: 'qtdPeriodo',   label: 'Qtd Período',        checked: mostrarQtdPeriodo },
  { key: 'unidade',      label: labelUnidade,         checked: true },
  { key: 'valorUnitario',label: 'Valor Unit. (R$)',   checked: true },
  { key: 'subtotal',     label: 'Subtotal (R$)',      checked: true },
].filter((c) => c.key !== 'qtdPeriodo' || mostrarQtdPeriodo);

type Formato = 'excel' | 'pdf';

export default function ExportarComposicaoButton({
  titulo,
  rows,
  bdi,
  mostrarQtdPeriodo = false,
  labelQuantidade = 'Qtd',
  labelUnidade = 'Unid.',
  disabled = false,
}: ExportarComposicaoButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formato, setFormato] = useState<Formato>('excel');
  const [colunas, setColunas] = useState<ColDef[]>(() =>
    buildColunas(mostrarQtdPeriodo, labelQuantidade, labelUnidade)
  );

  const abrirDialog = (fmt: Formato) => {
    setFormato(fmt);
    setColunas(buildColunas(mostrarQtdPeriodo, labelQuantidade, labelUnidade));
    setOpen(true);
  };

  const toggleColuna = (key: string) => {
    setColunas((prev) =>
      prev.map((c) => (c.key === key ? { ...c, checked: !c.checked } : c))
    );
  };

  const selecionarTodas = () => setColunas((prev) => prev.map((c) => ({ ...c, checked: true })));
  const desmarcarTodas = () => setColunas((prev) => prev.map((c) => ({ ...c, checked: false })));

  const [orientacao, setOrientacao] = useState<'auto' | 'retrato' | 'paisagem'>('auto');

  const colSelecionadas = colunas.filter((c) => c.checked);
  const podaExportar = colSelecionadas.length > 0 && rows.length > 0;

  // Largura mínima por coluna (mm)
  const MIN_WIDTHS: Record<string, number> = {
    item: 8, codigo: 14, descricao: 52, quantidade: 14,
    qtdPeriodo: 14, unidade: 12, valorUnitario: 26, subtotal: 26,
  };
  const minWidthTotal = colSelecionadas.reduce((s, c) => s + (MIN_WIDTHS[c.key] ?? 16), 0);
  const orientacaoResolvida: 'portrait' | 'landscape' =
    orientacao === 'retrato' ? 'portrait'
    : orientacao === 'paisagem' ? 'landscape'
    : minWidthTotal <= 175 ? 'portrait' : 'landscape';  // auto

  // ---- getCellValue ----
  const getCellValue = (row: ExportRowGenerico, key: string, idx: number): string | number => {
    switch (key) {
      case 'item':          return idx + 1;
      case 'codigo':        return row.codigo || '';
      case 'descricao':     return row.descricao;
      case 'quantidade':    return Number(row.quantidade) || 0;
      case 'qtdPeriodo':    return row.qtdPeriodo ?? 1;
      case 'unidade':       return row.unidade;
      case 'valorUnitario': return Number(row.valorUnitario) || 0;
      case 'subtotal':      return row.subtotal;
      default:              return '';
    }
  };

  // ---- Excel ----
  const exportarExcel = () => {
    const headers = colSelecionadas.map((c) => c.label);
    const dataRows = rows.map((row, idx) =>
      colSelecionadas.map((c) => getCellValue(row, c.key, idx))
    );

    const wb = XLSX.utils.book_new();

    // Aba de dados
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    ws['!cols'] = colSelecionadas.map((c) => ({
      wch: c.key === 'descricao' ? 45 : c.key === 'codigo' ? 16 : 14,
    }));
    XLSX.utils.book_append_sheet(wb, ws, titulo.slice(0, 31));

    // Resumo
    const totalSubtotal = rows.reduce((s, r) => s + r.subtotal, 0);
    const resumo: (string | number)[][] = [
      ['Composição', titulo],
      ['Total de Itens', rows.length],
      ['Custo Direto (R$)', totalSubtotal],
      ...(bdi ? [
        ['BDI (%)', bdi.percentual],
        ['BDI (R$)', bdi.valor],
        ['Total c/ BDI (R$)', totalSubtotal + bdi.valor],
      ] : []),
      ['Gerado em', new Date().toLocaleString('pt-BR')],
    ];
    const wsResumo = XLSX.utils.aoa_to_sheet(resumo);
    wsResumo['!cols'] = [{ wch: 22 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

    XLSX.writeFile(wb, `${titulo.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast({ title: 'Excel gerado', description: `${rows.length} itens exportados` });
    setOpen(false);
  };

  // ---- PDF ----
  const exportarPDF = () => {
    const orient = orientacaoResolvida;
    const doc = new jsPDF({ orientation: orient, unit: 'mm', format: 'a4' });
    // Largura útil: portrait=182mm, landscape=269mm (A4 - 2×14mm margem)
    const pageUsableW = orient === 'portrait' ? 182 : 269;
    const pageH = orient === 'portrait' ? 297 : 210;

    // Cabeçalho
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(titulo, 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Gerado em ${new Date().toLocaleString('pt-BR')}  •  ${rows.length} item(s)`,
      14, 22
    );

    const head = [colSelecionadas.map((c) => c.label)];
    const body = rows.map((row, idx) =>
      colSelecionadas.map((c) => {
        const v = getCellValue(row, c.key, idx);
        if (c.key === 'valorUnitario' || c.key === 'subtotal') return formatCurrency(Number(v));
        return String(v);
      })
    );

    // Larguras dinâmicas — se ajustam à orientação
    const descIdx = colSelecionadas.findIndex((c) => c.key === 'descricao');
    const itemW = 8;
    const descW = orient === 'portrait' ? 55 : 70;
    const fixedW = (descIdx >= 0 ? descW : 0) + (colSelecionadas.some((c) => c.key === 'item') ? itemW : 0);
    const varCols = colSelecionadas.length
      - (descIdx >= 0 ? 1 : 0)
      - (colSelecionadas.some((c) => c.key === 'item') ? 1 : 0);
    const varW = Math.max(18, (pageUsableW - fixedW) / Math.max(varCols, 1));

    const colStyles: Record<number, { cellWidth: number }> = {};
    colSelecionadas.forEach((c, i) => {
      if (c.key === 'descricao') colStyles[i] = { cellWidth: descW };
      else if (c.key === 'item') colStyles[i] = { cellWidth: itemW };
      else colStyles[i] = { cellWidth: varW };
    });

    autoTable(doc, {
      startY: 28,
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
      columnStyles: colStyles,
    });

    // Rodapé com totais — tabela estilizada
    const totalSubtotal = rows.reduce((s, r) => s + r.subtotal, 0);
    const startY = (doc as any).lastAutoTable.finalY + 4;

    const rodapeBody: (string | number)[][] = [
      ['Custo Direto', formatCurrency(totalSubtotal)],
      ...(bdi ? [
        [`+ BDI (${bdi.percentual}%)`, formatCurrency(bdi.valor)],
        ['= Total c/ BDI', formatCurrency(totalSubtotal + bdi.valor)],
      ] : []),
    ];

    autoTable(doc, {
      startY,
      body: rodapeBody,
      theme: 'plain',
      tableWidth: 100,
      margin: { left: 14 },
      styles: { fontSize: 8, cellPadding: { top: 2, bottom: 2, left: 4, right: 4 } },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: 'normal' },
        1: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.row.index === 0) {
          data.cell.styles.fillColor = [243, 244, 246];
          data.cell.styles.textColor = [55, 65, 81];
        }
        if (bdi && data.row.index === 1) {
          data.cell.styles.fillColor = [239, 246, 255];
          data.cell.styles.textColor = [37, 99, 235];
        }
        if (bdi && data.row.index === 2) {
          data.cell.styles.fillColor = [220, 252, 231];
          data.cell.styles.textColor = [22, 101, 52];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 9;
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

    doc.save(`${titulo.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast({ title: 'PDF gerado', description: `${rows.length} itens exportados` });
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
            disabled={disabled || rows.length === 0}
            title="Exportar dados"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => abrirDialog('excel')}>
            <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
            Exportar Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => abrirDialog('pdf')}>
            <FileText className="mr-2 h-4 w-4 text-red-500" />
            Exportar PDF
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
              Exportar {formato === 'excel' ? 'Excel' : 'PDF'} — {titulo}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Resumo */}
            <div className="bg-muted/40 rounded-lg p-3 text-sm space-y-1">
              <p><span className="text-muted-foreground">Itens:</span> <strong>{rows.length}</strong></p>
              <p><span className="text-muted-foreground">Colunas selecionadas:</span> <strong>{colSelecionadas.length}</strong></p>
            </div>

            <Separator />

            {/* Seleção de colunas */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Colunas a incluir</p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={selecionarTodas}>Todas</Button>
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={desmarcarTodas}>Nenhuma</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {colunas.map((col) => (
                  <div key={col.key} className="flex items-center gap-2">
                    <Checkbox
                      id={`col-${col.key}`}
                      checked={col.checked}
                      onCheckedChange={() => toggleColuna(col.key)}
                    />
                    <Label htmlFor={`col-${col.key}`} className="text-sm font-normal cursor-pointer">
                      {col.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

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
              disabled={!podaExportar}
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
