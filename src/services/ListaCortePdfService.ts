/**
 * Serviço de Geração de PDF para Lista de Corte
 * Formato GMX Soluções Industriais com bordas completas
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ListaCorteInterface } from '@/interfaces/ListaCorteInterface';

class ListaCortePdfService {
  /**
   * Gera PDF da lista de corte no formato GMX
   */
  gerarPDF(lista: ListaCorteInterface): Blob {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Header principal
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Lista de Corte - Lista ${lista.id} - ${lista.geometria}`,
      148.5,
      15,
      { align: 'center' }
    );

    // Informações do cabeçalho
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Projeto: ${lista.projeto || '-'}`, 20, 25);
    doc.text(`Data: ${new Date(lista.createdAt).toLocaleDateString('pt-BR')}`, 230, 25);
    doc.text(`Cliente: ${lista.cliente || '-'}`, 20, 30);
    doc.text('Página: 1', 230, 30);
    doc.text(`Obra: ${lista.obra || '-'}`, 20, 35);

    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(20, 38, 277, 38);

    // Seção: Informações da Lista
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Informações da Lista', 20, 45);

    autoTable(doc, {
      startY: 48,
      head: [
        [
          'Qtd Barras:',
          lista.qtdBarras.toString(),
          'Peças Cortadas:',
          '0 (0.0%)',
        ],
      ],
      body: [
        [
          'Qtd Peças:',
          lista.qtdPecas.toString(),
          'Qtd. Barras Estoque GMX:',
          '',
        ],
        [
          'Peso Total:',
          `${lista.pesoTotal.toFixed(2)}kg`,
          'Qtd. Barras Compradas:',
          '',
        ],
        [
          'Peso Cortado:',
          '0.00kg',
          'Total Barras:',
          lista.qtdBarras.toString(),
        ],
      ],
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 40 },
        2: { fontStyle: 'bold', cellWidth: 65 },
        3: { cellWidth: 40 },
      },
    });

    // Seção: Tabela Geral de Peças
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Tabela Geral de Peças', 20, (doc as any).lastAutoTable.finalY + 10);

    // Preparar dados da tabela
    const rows: any[] = [];
    lista.barras.forEach((barra) => {
      barra.pecas.forEach(({ peca }, idx) => {
        rows.push([
          barra.numero,
          barra.tipo,
          peca.tag,
          peca.fase,
          peca.posicao,
          peca.quantidade,
          `${peca.comprimento}mm`,
          `${peca.peso.toFixed(2)}kg`,
          idx === barra.pecas.length - 1
            ? `${(barra.sobra / 1000).toFixed(2)}m`
            : '',
          '', // Status
          '', // QC
          '', // Obs
        ]);
      });
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 13,
      head: [
        [
          'Barra',
          'Tipo',
          'TAG',
          'Fase',
          'Pos',
          'Qtd',
          'Comp',
          'Peso',
          'Sobra',
          'Status',
          'QC',
          'Obs',
        ],
      ],
      body: rows,
      headStyles: {
        fillColor: [59, 130, 246], // Azul
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
      },
      theme: 'grid', // ← BORDAS COMPLETAS
      styles: {
        fontSize: 7,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'center', cellWidth: 18 },
        2: { halign: 'left', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 15 },
        4: { halign: 'center', cellWidth: 15 },
        5: { halign: 'right', cellWidth: 12 },
        6: { halign: 'right', cellWidth: 20 },
        7: { halign: 'right', cellWidth: 18 },
        8: { halign: 'right', cellWidth: 18 },
        9: { halign: 'center', cellWidth: 18 },
        10: { halign: 'center', cellWidth: 15 },
        11: { halign: 'left', cellWidth: 25 },
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Resumo estatístico
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    doc.setTextColor(59, 130, 246); // Azul
    doc.text(`Total de Barras: ${lista.qtdBarras}`, 20, finalY);

    doc.setTextColor(34, 197, 94); // Verde
    doc.text(
      `Aproveitamento: ${lista.aproveitamentoGeral.toFixed(1)}%`,
      80,
      finalY
    );

    doc.setTextColor(234, 88, 12); // Laranja
    doc.text(
      `Perda Total: ${(lista.perdaTotal / 1000).toFixed(2)}m`,
      160,
      finalY
    );

    doc.setTextColor(0, 0, 0); // Reset cor

    // Rodapé GMX
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');

      // Linha separadora
      doc.setLineWidth(0.3);
      doc.line(20, 195, 277, 195);

      // Campos de assinatura
      doc.text('Operador: _________________', 20, 202);
      doc.text('Turno: _______', 100, 202);
      doc.text('QA: _________________', 160, 202);

      // Copyright
      doc.setFont('helvetica', 'italic');
      doc.text('© GMX Soluções Industriais', 148.5, 207, {
        align: 'center',
      });
    }

    return doc.output('blob');
  }

  /**
   * Gera PDF resumido (apenas estatísticas)
   */
  gerarPDFResumido(lista: ListaCorteInterface): Blob {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Resumo - Lista de Corte #${lista.id}`, 105, 20, {
      align: 'center',
    });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
      105,
      28,
      { align: 'center' }
    );

    // Linha separadora
    doc.line(20, 32, 190, 32);

    // Cards de resumo
    autoTable(doc, {
      startY: 40,
      head: [['Métrica', 'Valor']],
      body: [
        ['Geometria', lista.geometria],
        ['Projeto', lista.projeto || '-'],
        ['Cliente', lista.cliente || '-'],
        ['Obra', lista.obra || '-'],
        ['Comprimento da Barra', `${lista.comprimentoBarra}mm`],
        ['Total de Barras', lista.qtdBarras.toString()],
        ['Total de Peças', lista.qtdPecas.toString()],
        ['Peso Total', `${lista.pesoTotal.toFixed(2)} kg`],
        [
          'Aproveitamento Geral',
          `${lista.aproveitamentoGeral.toFixed(1)}%`,
        ],
        ['Perda Total', `${(lista.perdaTotal / 1000).toFixed(2)} m`],
      ],
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      theme: 'grid',
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 80 },
      },
    });

    // Rodapé
    doc.setFontSize(8);
    doc.text('© GMX Soluções Industriais', 105, 285, { align: 'center' });

    return doc.output('blob');
  }
}

export default new ListaCortePdfService();
