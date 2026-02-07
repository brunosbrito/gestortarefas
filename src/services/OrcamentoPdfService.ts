/**
 * Serviço de geração de PDF para Orçamentos
 * Layout profissional GMX com composições, itens, totalizadores e DRE
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Orcamento } from '@/interfaces/OrcamentoInterface';

class OrcamentoPdfService {
  /**
   * Gera PDF do orçamento com layout profissional
   */
  async generatePDF(orcamento: Orcamento): Promise<void> {
    const doc = new jsPDF();
    let yPosition = 20;

    // ==========================================
    // CABEÇALHO - GMX
    // ==========================================
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // Azul GMX
    doc.text('GMX SOLUÇÕES INDUSTRIAIS', 105, yPosition, { align: 'center' });

    yPosition += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Fabricação e Montagem de Estruturas Metálicas', 105, yPosition, { align: 'center' });

    yPosition += 4;
    doc.text('CNPJ: XX.XXX.XXX/XXXX-XX | Telefone | Email', 105, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(10, yPosition, 200, yPosition);
    yPosition += 8;

    // ==========================================
    // TÍTULO E DADOS DO ORÇAMENTO
    // ==========================================
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`ORÇAMENTO ${orcamento.numero}`, 10, yPosition);

    const dataEmissao = new Date(orcamento.createdAt).toLocaleDateString('pt-BR');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(dataEmissao, 200, yPosition, { align: 'right' });

    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(orcamento.nome, 10, yPosition);

    yPosition += 10;

    // ==========================================
    // DADOS DO PROJETO (CALDEIRARIA)
    // ==========================================
    const dadosProjeto: string[][] = [];

    if (orcamento.clienteNome) {
      dadosProjeto.push(['Cliente:', orcamento.clienteNome]);
    }
    if (orcamento.codigoProjeto) {
      dadosProjeto.push(['Código Projeto:', orcamento.codigoProjeto]);
    }
    dadosProjeto.push(['Tipo:', orcamento.tipo === 'servico' ? 'Serviço' : 'Produto']);

    // Dados técnicos
    if (orcamento.pesoTotalProjeto) {
      dadosProjeto.push(['Peso Total:', `${orcamento.pesoTotalProjeto.toLocaleString('pt-BR')} kg`]);
    }
    if (orcamento.areaTotalM2) {
      dadosProjeto.push(['Área Total:', `${orcamento.areaTotalM2.toLocaleString('pt-BR')} m²`]);
    }
    if (orcamento.metrosLineares) {
      dadosProjeto.push(['Metros Lineares:', `${orcamento.metrosLineares.toLocaleString('pt-BR')} m`]);
    }

    if (dadosProjeto.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['DADOS DO PROJETO']],
        body: dadosProjeto,
        theme: 'grid',
        headStyles: {
          fillColor: [37, 99, 235],
          fontSize: 11,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 9,
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 'auto' },
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // ==========================================
    // COMPOSIÇÕES E ITENS
    // ==========================================
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPOSIÇÃO DE CUSTOS', 10, yPosition);
    yPosition += 8;

    // Renderiza cada composição
    for (let i = 0; i < orcamento.composicoes.length; i++) {
      const comp = orcamento.composicoes[i];

      // Verifica se precisa de nova página
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Header da composição
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(`${i + 1}. ${comp.nome.toUpperCase()}`, 10, yPosition);
      yPosition += 2;

      // Tabela de itens da composição
      const itensData = comp.itens.map((item) => [
        item.codigo || '-',
        item.descricao,
        `${item.quantidade.toLocaleString('pt-BR')} ${item.unidade}`,
        this.formatCurrency(item.valorUnitario),
        this.formatCurrency(item.subtotal),
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Código', 'Descrição', 'Quantidade', 'V. Unit.', 'Subtotal']],
        body: itensData,
        theme: 'striped',
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [0, 0, 0],
          fontSize: 9,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 80 },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 25, halign: 'right' },
          4: { cellWidth: 25, halign: 'right' },
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 2;

      // Subtotais da composição
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`Custo Direto:`, 140, yPosition);
      doc.text(this.formatCurrency(comp.custoDirecto), 200, yPosition, { align: 'right' });
      yPosition += 4;

      doc.text(`BDI (${comp.bdi.percentual.toFixed(2)}%):`, 140, yPosition);
      doc.text(this.formatCurrency(comp.bdi.valor), 200, yPosition, { align: 'right' });
      yPosition += 4;

      doc.setTextColor(37, 99, 235);
      doc.text(`Subtotal:`, 140, yPosition);
      doc.text(this.formatCurrency(comp.subtotal), 200, yPosition, { align: 'right' });

      yPosition += 8;
    }

    // ==========================================
    // TOTALIZADORES
    // ==========================================
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(10, yPosition, 200, yPosition);
    yPosition += 8;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TOTALIZADORES', 10, yPosition);
    yPosition += 8;

    const totalizadoresData = [
      ['Custo Direto Total', this.formatCurrency(orcamento.custoDirectoTotal)],
      ['BDI Total', this.formatCurrency(orcamento.bdiTotal)],
      ['Subtotal', this.formatCurrency(orcamento.subtotal)],
      ['', ''],
      ['Tributos:', ''],
      [
        `  ISS (${orcamento.tributos.temISS ? orcamento.tributos.aliquotaISS : 0}%)`,
        this.formatCurrency(
          orcamento.tributos.temISS
            ? orcamento.subtotal * (orcamento.tributos.aliquotaISS / 100)
            : 0
        ),
      ],
      [
        `  Simples Nacional (${orcamento.tributos.aliquotaSimples}%)`,
        this.formatCurrency(orcamento.subtotal * (orcamento.tributos.aliquotaSimples / 100)),
      ],
      ['Tributos Total', this.formatCurrency(orcamento.tributosTotal)],
    ];

    autoTable(doc, {
      startY: yPosition,
      body: totalizadoresData,
      theme: 'plain',
      bodyStyles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 140, fontStyle: 'bold' },
        1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 5;

    // TOTAL DE VENDA (destaque)
    doc.setFillColor(37, 99, 235);
    doc.rect(10, yPosition, 190, 10, 'F');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL DE VENDA', 15, yPosition + 7);
    doc.text(this.formatCurrency(orcamento.totalVenda), 195, yPosition + 7, { align: 'right' });

    yPosition += 15;

    // ==========================================
    // INDICADORES
    // ==========================================
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INDICADORES', 10, yPosition);
    yPosition += 6;

    const indicadoresData: string[][] = [];

    indicadoresData.push(['BDI Médio:', `${orcamento.bdiMedio.toFixed(2)}%`]);

    if (orcamento.custoPorM2) {
      indicadoresData.push(['Custo por m²:', this.formatCurrency(orcamento.custoPorM2) + ' / m²']);
    }

    if (orcamento.pesoTotalProjeto) {
      const custoPorKg = orcamento.totalVenda / orcamento.pesoTotalProjeto;
      indicadoresData.push(['Custo por kg:', this.formatCurrency(custoPorKg) + ' / kg']);
    }

    autoTable(doc, {
      startY: yPosition,
      body: indicadoresData,
      theme: 'plain',
      bodyStyles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 150, halign: 'left' },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // ==========================================
    // DRE
    // ==========================================
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DRE - DEMONSTRATIVO DE RESULTADO', 10, yPosition);
    yPosition += 6;

    const dreData = [
      ['Receita Líquida', this.formatCurrency(orcamento.dre.receitaLiquida)],
      ['  (-) Custos Diretos', this.formatCurrency(orcamento.custoDirectoTotal)],
      ['Lucro Bruto', this.formatCurrency(orcamento.dre.lucroBruto)],
      ['Margem Bruta', `${orcamento.dre.margemBruta.toFixed(2)}%`],
      ['', ''],
      ['  (-) BDI', this.formatCurrency(orcamento.bdiTotal)],
      ['Lucro Líquido', this.formatCurrency(orcamento.dre.lucroLiquido)],
      ['Margem Líquida', `${orcamento.dre.margemLiquida.toFixed(2)}%`],
    ];

    autoTable(doc, {
      startY: yPosition,
      body: dreData,
      theme: 'plain',
      bodyStyles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 140, fontStyle: 'bold' },
        1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // ==========================================
    // ALERTAS (se houver)
    // ==========================================
    if (orcamento.dre.margemLiquida < 0) {
      doc.setFillColor(239, 68, 68);
      doc.rect(10, yPosition, 190, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('⚠️ ALERTA: Orçamento com PREJUÍZO', 15, yPosition + 5.5);
      yPosition += 10;
    } else if (orcamento.dre.margemLiquida < 5) {
      doc.setFillColor(251, 191, 36);
      doc.rect(10, yPosition, 190, 8, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('⚠️ ALERTA: Margem Muito Baixa (<5%)', 15, yPosition + 5.5);
      yPosition += 10;
    }

    // ==========================================
    // RODAPÉ
    // ==========================================
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Orçamento ${orcamento.numero} | Página ${i} de ${pageCount}`,
        105,
        290,
        { align: 'center' }
      );
      doc.text(
        `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
        105,
        295,
        { align: 'center' }
      );
    }

    // Salvar PDF
    const nomeArquivo = `Orcamento_${orcamento.numero.replace(/\|/g, '_')}_${orcamento.nome.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    doc.save(nomeArquivo);
  }

  /**
   * Formata valor para moeda brasileira
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}

export default new OrcamentoPdfService();
