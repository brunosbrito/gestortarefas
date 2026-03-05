/**
 * Serviço de geração de relatórios comerciais
 * Gera PDFs e planilhas Excel a partir dos dados do sistema
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatCurrency } from '@/lib/currency';
import MaterialCatalogoService from './MaterialCatalogoService';
import TintaService from './TintaService';
import ConsumivelService from './ConsumivelService';
import OrcamentoService from './OrcamentoService';
import { MaterialCategoriaLabels } from '@/interfaces/MaterialCatalogoInterface';
import { TipoTintaLabels } from '@/interfaces/TintaInterface';
import { ConsumivelCategoriaLabels } from '@/interfaces/ConsumivelInterface';
import { calcularValoresOrcamento, calcularDRE, recalcularTodasComposicoes } from '@/lib/calculosOrcamento';

const DATA_STR = () => new Date().toISOString().slice(0, 10);
const DATA_HORA = () => new Date().toLocaleString('pt-BR');

// ==========================================
// HEADER PADRÃO GMX PARA PDFs
// ==========================================
function addPdfHeader(doc: jsPDF, titulo: string): number {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('GMX SOLUCOES INDUSTRIAIS', 105, 15, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Fabricacao e Montagem de Estruturas Metalicas', 105, 20, { align: 'center' });

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(10, 24, 200, 24);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(titulo, 10, 32);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text(`Gerado em ${DATA_HORA()}`, 200, 32, { align: 'right' });

  return 38;
}

function addPdfFooter(doc: jsPDF, titulo: string) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`${titulo} | Pagina ${i} de ${pageCount}`, 105, 290, { align: 'center' });
  }
}

class RelatorioComercialService {
  // ==========================================
  // 1. CATÁLOGO DE MATERIAIS
  // ==========================================

  async gerarCatalogoMateriaisPDF(): Promise<void> {
    const materiais = await MaterialCatalogoService.listar({ ativo: true });
    if (materiais.length === 0) throw new Error('Nenhum material cadastrado');

    const doc = new jsPDF({ orientation: 'landscape' });
    let y = addPdfHeader(doc, `CATALOGO DE MATERIAIS (${materiais.length} itens)`);

    const body = materiais.map((m, i) => [
      i + 1,
      m.codigo,
      m.descricao,
      MaterialCategoriaLabels[m.categoria] || m.categoria,
      m.fornecedor || '-',
      m.unidade,
      m.pesoNominal ? `${m.pesoNominal} kg` : '-',
      formatCurrency(Number(m.precoUnitario) || 0),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Codigo', 'Descricao', 'Categoria', 'Fornecedor', 'Unid.', 'Peso Nom.', 'Preco Unit.']],
      body,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 30 },
        2: { cellWidth: 80 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 12 },
        6: { cellWidth: 20 },
        7: { cellWidth: 25, halign: 'right' },
      },
    });

    addPdfFooter(doc, 'Catalogo de Materiais');
    doc.save(`catalogo_materiais_${DATA_STR()}.pdf`);
  }

  async gerarCatalogoMateriaisExcel(): Promise<void> {
    const materiais = await MaterialCatalogoService.listar({ ativo: true });
    if (materiais.length === 0) throw new Error('Nenhum material cadastrado');

    const wb = XLSX.utils.book_new();
    const headers = ['#', 'Codigo', 'Descricao', 'Categoria', 'Fornecedor', 'Unidade', 'Peso Nominal (kg)', 'Preco/kg (R$)', 'Preco Unit. (R$)'];
    const rows = materiais.map((m, i) => [
      i + 1,
      m.codigo,
      m.descricao,
      MaterialCategoriaLabels[m.categoria] || m.categoria,
      m.fornecedor || '',
      m.unidade,
      m.pesoNominal || '',
      m.precoKg || '',
      m.precoUnitario,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [
      { wch: 5 }, { wch: 22 }, { wch: 50 }, { wch: 20 },
      { wch: 20 }, { wch: 8 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Materiais');

    // Resumo por categoria
    const categorias = [...new Set(materiais.map((m) => m.categoria))];
    const resumoRows = categorias.map((cat) => {
      const grupo = materiais.filter((m) => m.categoria === cat);
      return [MaterialCategoriaLabels[cat] || cat, grupo.length];
    });
    const wsResumo = XLSX.utils.aoa_to_sheet([
      ['Relatorio:', 'Catalogo de Materiais'],
      ['Gerado em:', DATA_HORA()],
      ['Total de itens:', materiais.length],
      [''],
      ['Categoria', 'Quantidade'],
      ...resumoRows,
    ]);
    wsResumo['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

    XLSX.writeFile(wb, `catalogo_materiais_${DATA_STR()}.xlsx`);
  }

  async gerarCatalogoMateriaisPDFResumido(): Promise<void> {
    const materiais = await MaterialCatalogoService.listar({ ativo: true });
    if (materiais.length === 0) throw new Error('Nenhum material cadastrado');

    const doc = new jsPDF();
    let y = addPdfHeader(doc, 'CATALOGO DE MATERIAIS - RESUMO');

    // Agrupar por categoria
    const categorias = [...new Set(materiais.map((m) => m.categoria))];

    for (const cat of categorias) {
      const grupo = materiais.filter((m) => m.categoria === cat);
      if (y > 260) { doc.addPage(); y = 20; }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(`${MaterialCategoriaLabels[cat] || cat} (${grupo.length})`, 10, y);
      y += 2;

      const body = grupo.map((m) => [
        m.codigo,
        m.descricao,
        m.unidade,
        formatCurrency(Number(m.precoUnitario) || 0),
      ]);

      autoTable(doc, {
        startY: y,
        head: [['Codigo', 'Descricao', 'Unid.', 'Preco Unit.']],
        body,
        theme: 'grid',
        headStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0], fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 100 },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 30, halign: 'right' },
        },
      });

      y = (doc as any).lastAutoTable.finalY + 6;
    }

    addPdfFooter(doc, 'Catalogo de Materiais - Resumo');
    doc.save(`catalogo_materiais_resumo_${DATA_STR()}.pdf`);
  }

  // ==========================================
  // 2. ESPECIFICAÇÕES DE TINTAS
  // ==========================================

  async gerarEspecificacoesTintasPDF(): Promise<void> {
    const tintas = await TintaService.listar({ ativo: true });
    if (tintas.length === 0) throw new Error('Nenhuma tinta cadastrada');

    const doc = new jsPDF();
    let y = addPdfHeader(doc, `ESPECIFICACOES DE TINTAS (${tintas.length} itens)`);

    const body = tintas.map((t, i) => [
      i + 1,
      t.codigo,
      t.descricao,
      TipoTintaLabels[t.tipo] || t.tipo,
      `${t.solidosVolume}%`,
      formatCurrency(t.precoLitro),
      t.fornecedor || '-',
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Codigo', 'Descricao', 'Tipo', 'Solidos (%)', 'Preco/L', 'Fornecedor']],
      body,
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234], fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 22 },
        2: { cellWidth: 60 },
        3: { cellWidth: 25 },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 22, halign: 'right' },
        6: { cellWidth: 30 },
      },
    });

    addPdfFooter(doc, 'Especificacoes de Tintas');
    doc.save(`especificacoes_tintas_${DATA_STR()}.pdf`);
  }

  async gerarEspecificacoesTintasExcel(): Promise<void> {
    const tintas = await TintaService.listar({ ativo: true });
    if (tintas.length === 0) throw new Error('Nenhuma tinta cadastrada');

    const wb = XLSX.utils.book_new();
    const headers = ['#', 'Codigo', 'Descricao', 'Tipo', 'Solidos Volume (%)', 'Preco/Litro (R$)', 'Fornecedor', 'Observacoes'];
    const rows = tintas.map((t, i) => [
      i + 1, t.codigo, t.descricao,
      TipoTintaLabels[t.tipo] || t.tipo,
      t.solidosVolume, t.precoLitro, t.fornecedor || '', t.observacoes || '',
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [
      { wch: 5 }, { wch: 16 }, { wch: 45 }, { wch: 18 },
      { wch: 18 }, { wch: 16 }, { wch: 20 }, { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Tintas');

    XLSX.writeFile(wb, `especificacoes_tintas_${DATA_STR()}.xlsx`);
  }

  // ==========================================
  // 4. ANÁLISE DE ORÇAMENTOS
  // ==========================================

  async gerarAnaliseOrcamentosExcel(): Promise<void> {
    const orcamentos = await OrcamentoService.getAll();
    if (orcamentos.length === 0) throw new Error('Nenhum orcamento cadastrado');

    const wb = XLSX.utils.book_new();

    // Aba comparativa
    const headers = [
      'Numero', 'Nome', 'Cliente', 'Tipo', 'Status',
      'Custo Direto (R$)', 'BDI Total (R$)', 'Subtotal (R$)',
      'Lucro (R$)', 'Tributos (R$)', 'Total Venda (R$)',
      'BDI Medio (%)', 'Margem Bruta (%)', 'Margem Liquida (%)',
    ];

    const rows = orcamentos.map((orc) => [
      orc.numero,
      orc.nome,
      orc.clienteNome || '',
      orc.tipo === 'servico' ? 'Servico' : 'Produto',
      orc.status || 'rascunho',
      orc.custoDirectoTotal || 0,
      orc.bdiTotal || 0,
      orc.subtotal || 0,
      orc.lucroTotal || 0,
      orc.tributosTotal || 0,
      orc.totalVenda || 0,
      orc.bdiMedio || 0,
      orc.dre?.margemBruta || 0,
      orc.dre?.margemLiquida || 0,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [
      { wch: 14 }, { wch: 35 }, { wch: 25 }, { wch: 10 }, { wch: 12 },
      { wch: 18 }, { wch: 18 }, { wch: 18 },
      { wch: 16 }, { wch: 16 }, { wch: 18 },
      { wch: 14 }, { wch: 16 }, { wch: 16 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Analise Comparativa');

    // Aba de resumo estatístico
    const totalVendaGeral = orcamentos.reduce((s, o) => s + (o.totalVenda || 0), 0);
    const aprovados = orcamentos.filter((o) => o.status === 'aprovado');
    const emAnalise = orcamentos.filter((o) => o.status === 'em_analise');
    const rejeitados = orcamentos.filter((o) => o.status === 'rejeitado');
    const rascunhos = orcamentos.filter((o) => !o.status || o.status === 'rascunho');

    const resumo = [
      ['ANALISE DE ORCAMENTOS'],
      ['Gerado em:', DATA_HORA()],
      [''],
      ['TOTAIS'],
      ['Total de orcamentos:', orcamentos.length],
      ['Valor total (Venda):', totalVendaGeral],
      [''],
      ['POR STATUS'],
      ['Aprovados:', aprovados.length, 'Valor:', aprovados.reduce((s, o) => s + (o.totalVenda || 0), 0)],
      ['Em Analise:', emAnalise.length, 'Valor:', emAnalise.reduce((s, o) => s + (o.totalVenda || 0), 0)],
      ['Rejeitados:', rejeitados.length, 'Valor:', rejeitados.reduce((s, o) => s + (o.totalVenda || 0), 0)],
      ['Rascunho:', rascunhos.length, 'Valor:', rascunhos.reduce((s, o) => s + (o.totalVenda || 0), 0)],
    ];

    const wsResumo = XLSX.utils.aoa_to_sheet(resumo);
    wsResumo['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 10 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

    XLSX.writeFile(wb, `analise_orcamentos_${DATA_STR()}.xlsx`);
  }

  async gerarAnaliseOrcamentosPDF(): Promise<void> {
    const orcamentos = await OrcamentoService.getAll();
    if (orcamentos.length === 0) throw new Error('Nenhum orcamento cadastrado');

    const doc = new jsPDF({ orientation: 'landscape' });
    let y = addPdfHeader(doc, `ANALISE COMPARATIVA DE ORCAMENTOS (${orcamentos.length})`);

    const body = orcamentos.map((orc) => [
      orc.numero,
      orc.nome?.substring(0, 30) || '',
      orc.clienteNome?.substring(0, 20) || '-',
      orc.status === 'aprovado' ? 'Aprovado' : orc.status === 'em_analise' ? 'Analise' : orc.status === 'rejeitado' ? 'Rejeitado' : 'Rascunho',
      formatCurrency(orc.custoDirectoTotal || 0),
      formatCurrency(orc.bdiTotal || 0),
      formatCurrency(orc.lucroTotal || 0),
      formatCurrency(orc.totalVenda || 0),
      `${(orc.dre?.margemLiquida || 0).toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Numero', 'Nome', 'Cliente', 'Status', 'Custo Direto', 'BDI', 'Lucro', 'Total Venda', 'Margem Liq.']],
      body,
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7 },
    });

    addPdfFooter(doc, 'Analise de Orcamentos');
    doc.save(`analise_orcamentos_${DATA_STR()}.pdf`);
  }

  // ==========================================
  // 5. RESUMO FINANCEIRO
  // ==========================================

  async gerarResumoFinanceiroPDF(): Promise<void> {
    const orcamentos = await OrcamentoService.getAll();
    if (orcamentos.length === 0) throw new Error('Nenhum orcamento cadastrado');

    const doc = new jsPDF();
    let y = addPdfHeader(doc, 'RESUMO FINANCEIRO');

    const aprovados = orcamentos.filter((o) => o.status === 'aprovado');
    const emAnalise = orcamentos.filter((o) => o.status === 'em_analise');
    const rejeitados = orcamentos.filter((o) => o.status === 'rejeitado');
    const rascunhos = orcamentos.filter((o) => !o.status || o.status === 'rascunho');

    const totalGeral = orcamentos.reduce((s, o) => s + (o.totalVenda || 0), 0);
    const totalAprovados = aprovados.reduce((s, o) => s + (o.totalVenda || 0), 0);
    const totalEmAnalise = emAnalise.reduce((s, o) => s + (o.totalVenda || 0), 0);
    const totalRejeitados = rejeitados.reduce((s, o) => s + (o.totalVenda || 0), 0);

    // KPIs
    const kpiData = [
      ['Total de Orcamentos', String(orcamentos.length)],
      ['Valor Total (Venda)', formatCurrency(totalGeral)],
      ['', ''],
      ['Aprovados', `${aprovados.length} orcamento(s) - ${formatCurrency(totalAprovados)}`],
      ['Em Analise', `${emAnalise.length} orcamento(s) - ${formatCurrency(totalEmAnalise)}`],
      ['Rejeitados', `${rejeitados.length} orcamento(s) - ${formatCurrency(totalRejeitados)}`],
      ['Rascunho', `${rascunhos.length} orcamento(s)`],
      ['', ''],
      ['Taxa de Conversao', aprovados.length > 0 ? `${((aprovados.length / orcamentos.length) * 100).toFixed(1)}%` : '-'],
    ];

    autoTable(doc, {
      startY: y,
      head: [['INDICADOR', 'VALOR']],
      body: kpiData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], fontSize: 10, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 120 },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Tabela de orçamentos aprovados
    if (aprovados.length > 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('ORCAMENTOS APROVADOS', 10, y);
      y += 4;

      const bodyAprovados = aprovados.map((orc) => [
        orc.numero,
        orc.nome?.substring(0, 35) || '',
        orc.clienteNome || '-',
        formatCurrency(orc.totalVenda || 0),
        `${(orc.dre?.margemLiquida || 0).toFixed(1)}%`,
      ]);

      autoTable(doc, {
        startY: y,
        head: [['Numero', 'Nome', 'Cliente', 'Total Venda', 'Margem']],
        body: bodyAprovados,
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74], fontSize: 9 },
        bodyStyles: { fontSize: 8 },
      });
    }

    addPdfFooter(doc, 'Resumo Financeiro');
    doc.save(`resumo_financeiro_${DATA_STR()}.pdf`);
  }

  async gerarResumoFinanceiroExcel(): Promise<void> {
    const orcamentos = await OrcamentoService.getAll();
    if (orcamentos.length === 0) throw new Error('Nenhum orcamento cadastrado');

    const wb = XLSX.utils.book_new();

    const aprovados = orcamentos.filter((o) => o.status === 'aprovado');
    const emAnalise = orcamentos.filter((o) => o.status === 'em_analise');
    const rejeitados = orcamentos.filter((o) => o.status === 'rejeitado');

    const resumo = [
      ['RESUMO FINANCEIRO'],
      ['Gerado em:', DATA_HORA()],
      [''],
      ['INDICADORES'],
      ['Total de Orcamentos', orcamentos.length],
      ['Valor Total (Venda)', orcamentos.reduce((s, o) => s + (o.totalVenda || 0), 0)],
      [''],
      ['Aprovados', aprovados.length, aprovados.reduce((s, o) => s + (o.totalVenda || 0), 0)],
      ['Em Analise', emAnalise.length, emAnalise.reduce((s, o) => s + (o.totalVenda || 0), 0)],
      ['Rejeitados', rejeitados.length, rejeitados.reduce((s, o) => s + (o.totalVenda || 0), 0)],
      [''],
      ['Taxa Conversao', aprovados.length > 0 ? `${((aprovados.length / orcamentos.length) * 100).toFixed(1)}%` : '-'],
    ];

    const wsResumo = XLSX.utils.aoa_to_sheet(resumo);
    wsResumo['!cols'] = [{ wch: 22 }, { wch: 16 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

    // Aba com todos os orçamentos
    const headers = ['Numero', 'Nome', 'Cliente', 'Status', 'Custo Direto', 'BDI', 'Lucro', 'Tributos', 'Total Venda', 'Margem Liquida (%)'];
    const rows = orcamentos.map((orc) => [
      orc.numero, orc.nome, orc.clienteNome || '',
      orc.status || 'rascunho',
      orc.custoDirectoTotal || 0, orc.bdiTotal || 0, orc.lucroTotal || 0,
      orc.tributosTotal || 0, orc.totalVenda || 0,
      orc.dre?.margemLiquida || 0,
    ]);

    const wsOrc = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    wsOrc['!cols'] = [
      { wch: 14 }, { wch: 35 }, { wch: 25 }, { wch: 12 },
      { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 16 },
    ];
    XLSX.utils.book_append_sheet(wb, wsOrc, 'Orcamentos');

    XLSX.writeFile(wb, `resumo_financeiro_${DATA_STR()}.xlsx`);
  }

  // ==========================================
  // 6. CURVA ABC CONSUMÍVEIS
  // ==========================================

  private calcularCurvaABC(consumiveis: any[]) {
    const preco = (c: any) => Number(c.precoUnitario) || 0;
    const sorted = [...consumiveis].sort((a, b) => preco(b) - preco(a));
    const total = sorted.reduce((s, c) => s + preco(c), 0);

    let acumulado = 0;
    return sorted.map((c) => {
      acumulado += preco(c);
      const pctIndividual = total > 0 ? (preco(c) / total) * 100 : 0;
      const pctAcumulado = total > 0 ? (acumulado / total) * 100 : 0;
      const grupoCalc = pctAcumulado <= 80 ? 'A' : pctAcumulado <= 95 ? 'B' : 'C';
      return { ...c, precoNum: preco(c), pctIndividual, pctAcumulado, grupoCalc, total };
    });
  }

  async gerarCurvaABCExcel(): Promise<void> {
    const consumiveis = await ConsumivelService.getAll({ ativo: true });
    if (consumiveis.length === 0) throw new Error('Nenhum consumivel cadastrado');

    const comABC = this.calcularCurvaABC(consumiveis);
    const total = comABC.length > 0 ? comABC[0].total : 0;

    const wb = XLSX.utils.book_new();

    // Aba detalhada
    const headers = ['#', 'Codigo', 'Descricao', 'Categoria', 'Unidade', 'Preco Unit. (R$)', '% Individual', '% Acumulado', 'Grupo ABC'];
    const rows = comABC.map((c, i) => [
      i + 1, c.codigo, c.descricao,
      ConsumivelCategoriaLabels[c.categoria] || c.categoria,
      c.unidade, c.precoNum,
      Math.round(c.pctIndividual * 100) / 100,
      Math.round(c.pctAcumulado * 100) / 100,
      c.grupoCalc,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [
      { wch: 5 }, { wch: 16 }, { wch: 45 }, { wch: 16 },
      { wch: 8 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Curva ABC');

    // Aba resumo
    const grupoA = comABC.filter((c) => c.grupoCalc === 'A');
    const grupoB = comABC.filter((c) => c.grupoCalc === 'B');
    const grupoC = comABC.filter((c) => c.grupoCalc === 'C');

    const resumo = [
      ['CURVA ABC - CONSUMIVEIS'],
      ['Gerado em:', DATA_HORA()],
      ['Total de itens:', consumiveis.length],
      ['Valor total:', total],
      [''],
      ['Grupo', 'Itens', '% dos Itens', 'Valor (R$)', '% do Valor'],
      ['A (Alta prioridade)', grupoA.length, `${((grupoA.length / comABC.length) * 100).toFixed(1)}%`, grupoA.reduce((s, c) => s + c.precoNum, 0), '~80%'],
      ['B (Media prioridade)', grupoB.length, `${((grupoB.length / comABC.length) * 100).toFixed(1)}%`, grupoB.reduce((s, c) => s + c.precoNum, 0), '~15%'],
      ['C (Baixa prioridade)', grupoC.length, `${((grupoC.length / comABC.length) * 100).toFixed(1)}%`, grupoC.reduce((s, c) => s + c.precoNum, 0), '~5%'],
    ];

    const wsResumo = XLSX.utils.aoa_to_sheet(resumo);
    wsResumo['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo ABC');

    XLSX.writeFile(wb, `curva_abc_consumiveis_${DATA_STR()}.xlsx`);
  }

  async gerarCurvaABCPDF(): Promise<void> {
    const consumiveis = await ConsumivelService.getAll({ ativo: true });
    if (consumiveis.length === 0) throw new Error('Nenhum consumivel cadastrado');

    const comABC = this.calcularCurvaABC(consumiveis);

    const doc = new jsPDF();
    let y = addPdfHeader(doc, `CURVA ABC - CONSUMIVEIS (${consumiveis.length} itens)`);

    // Resumo ABC
    const grupoA = comABC.filter((c) => c.grupoCalc === 'A');
    const grupoB = comABC.filter((c) => c.grupoCalc === 'B');
    const grupoC = comABC.filter((c) => c.grupoCalc === 'C');

    autoTable(doc, {
      startY: y,
      head: [['Grupo', 'Itens', '% Itens', 'Valor', '% Valor']],
      body: [
        ['A - Alta', grupoA.length, `${((grupoA.length / comABC.length) * 100).toFixed(1)}%`, formatCurrency(grupoA.reduce((s, c) => s + c.precoNum, 0)), '~80%'],
        ['B - Media', grupoB.length, `${((grupoB.length / comABC.length) * 100).toFixed(1)}%`, formatCurrency(grupoB.reduce((s, c) => s + c.precoNum, 0)), '~15%'],
        ['C - Baixa', grupoC.length, `${((grupoC.length / comABC.length) * 100).toFixed(1)}%`, formatCurrency(grupoC.reduce((s, c) => s + c.precoNum, 0)), '~5%'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;

    // Lista detalhada
    const body = comABC.map((c, i) => [
      i + 1,
      c.codigo,
      c.descricao?.substring(0, 40),
      formatCurrency(c.precoNum),
      `${c.pctAcumulado.toFixed(1)}%`,
      c.grupoCalc,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Codigo', 'Descricao', 'Preco', '% Acum.', 'ABC']],
      body,
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 5) {
          const grupo = String(data.cell.raw);
          if (grupo === 'A') data.cell.styles.textColor = [220, 38, 38];
          else if (grupo === 'B') data.cell.styles.textColor = [202, 138, 4];
          else data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    addPdfFooter(doc, 'Curva ABC Consumiveis');
    doc.save(`curva_abc_consumiveis_${DATA_STR()}.pdf`);
  }

  // ==========================================
  // RESUMO EXECUTIVO (Todos os dados)
  // ==========================================

  async gerarResumoExecutivo(): Promise<void> {
    const [orcamentos, materiais, tintas, consumiveis] = await Promise.all([
      OrcamentoService.getAll().catch(() => []),
      MaterialCatalogoService.listar({ ativo: true }).catch(() => []),
      TintaService.listar({ ativo: true }).catch(() => []),
      ConsumivelService.getAll({ ativo: true }).catch(() => []),
    ]);

    const doc = new jsPDF();
    let y = addPdfHeader(doc, 'RESUMO EXECUTIVO COMERCIAL');

    // Orçamentos
    const aprovados = orcamentos.filter((o) => o.status === 'aprovado');
    const totalVenda = orcamentos.reduce((s, o) => s + (o.totalVenda || 0), 0);

    autoTable(doc, {
      startY: y,
      head: [['MODULO', 'INDICADOR', 'VALOR']],
      body: [
        ['Orcamentos', 'Total cadastrados', String(orcamentos.length)],
        ['', 'Aprovados', String(aprovados.length)],
        ['', 'Valor total (venda)', formatCurrency(totalVenda)],
        ['', 'Taxa conversao', orcamentos.length > 0 ? `${((aprovados.length / orcamentos.length) * 100).toFixed(1)}%` : '-'],
        ['', '', ''],
        ['Materiais', 'Itens no catalogo', String(materiais.length)],
        ['Tintas', 'Itens cadastrados', String(tintas.length)],
        ['Consumiveis', 'Itens cadastrados', String(consumiveis.length)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' },
        1: { cellWidth: 70 },
        2: { cellWidth: 70, halign: 'right', fontStyle: 'bold' },
      },
    });

    addPdfFooter(doc, 'Resumo Executivo');
    doc.save(`resumo_executivo_${DATA_STR()}.pdf`);
  }
}

export default new RelatorioComercialService();
