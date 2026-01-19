import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import { formatCurrency, formatPercentage } from '@/lib/currency';

class OrcamentoPdfService {
  async generatePDF(orcamento: Orcamento): Promise<void> {
    const doc = new jsPDF();
    let yPosition = 20;

    // Header - Logo e Dados da Empresa
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('GMX SOLUÇÕES INDUSTRIAIS', 105, yPosition, { align: 'center' });

    yPosition += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('CNPJ: XX.XXX.XXX/XXXX-XX | Endereço | Telefone | Email', 105, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setDrawColor(0, 0, 0);
    doc.line(10, yPosition, 200, yPosition);
    yPosition += 5;

    // Número do Orçamento e Data
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`ORÇAMENTO Nº ${orcamento.numero}`, 10, yPosition);
    const dataEmissao = new Date(orcamento.createdAt).toLocaleDateString('pt-BR');
    doc.text(dataEmissao, 200, yPosition, { align: 'right' });

    yPosition += 10;

    // Nome do Orçamento
    doc.setFontSize(12);
    doc.text(orcamento.nome, 10, yPosition);
    yPosition += 7;

    // Cliente (se houver)
    if (orcamento.clienteNome) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Cliente: ${orcamento.clienteNome}`, 10, yPosition);
      yPosition += 5;
    }

    // Código do Projeto (se houver)
    if (orcamento.codigoProjeto) {
      doc.text(`Projeto: ${orcamento.codigoProjeto}`, 10, yPosition);
      yPosition += 5;
    }

    yPosition += 5;
    doc.line(10, yPosition, 200, yPosition);
    yPosition += 10;

    // Resumo Financeiro
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO FINANCEIRO', 10, yPosition);
    yPosition += 7;

    const resumoData = [
      ['Total de Venda', formatCurrency(orcamento.totalVenda)],
      ['Margem Líquida', formatPercentage(orcamento.dre.margemLiquida)],
      ['BDI Médio', formatPercentage(orcamento.bdiMedio)],
    ];

    if (orcamento.custoPorM2) {
      resumoData.push(['Custo por m²', formatCurrency(orcamento.custoPorM2)]);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [['Item', 'Valor']],
      body: resumoData,
      theme: 'grid',
      headStyles: { fillColor: [66, 133, 244], textColor: 255 },
      margin: { left: 10, right: 10 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Composições de Custos
    if (orcamento.composicoes && orcamento.composicoes.length > 0) {
      // Verificar se há espaço suficiente na página
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPOSIÇÕES DE CUSTOS', 10, yPosition);
      yPosition += 7;

      orcamento.composicoes.forEach((comp, index) => {
        // Verificar se precisa de nova página
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${comp.nome}`, 10, yPosition);
        yPosition += 5;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`BDI: ${formatPercentage(comp.bdiPercentual)} | Custo Direto: ${formatCurrency(comp.custoDirecto)}`, 15, yPosition);
        yPosition += 7;

        // Itens da composição
        if (comp.items && comp.items.length > 0) {
          const itemsData = comp.items.map(item => [
            item.codigo || '-',
            item.descricao,
            item.quantidade.toString(),
            item.unidade,
            formatCurrency(item.valorUnitario),
            formatCurrency(item.valorTotal),
          ]);

          autoTable(doc, {
            startY: yPosition,
            head: [['Código', 'Descrição', 'Qtd', 'Un', 'Valor Unit.', 'Total']],
            body: itemsData,
            theme: 'striped',
            headStyles: { fillColor: [100, 100, 100], fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            margin: { left: 15, right: 10 },
            columnStyles: {
              0: { cellWidth: 20 },
              1: { cellWidth: 60 },
              2: { cellWidth: 15 },
              3: { cellWidth: 15 },
              4: { cellWidth: 25 },
              5: { cellWidth: 25 },
            },
          });

          yPosition = (doc as any).lastAutoTable.finalY + 5;
        }

        yPosition += 5;
      });
    }

    // DRE - Nova Página
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DRE - DEMONSTRATIVO DE RESULTADO', 10, yPosition);
    yPosition += 10;

    const dreData = [
      ['Valor total dos produtos/serviços', formatCurrency(orcamento.valores.subtotal), ''],
      ['(-) Tributos a recolher', formatCurrency(orcamento.valores.tributosTotal), ''],
    ];

    // Tributos detalhados
    if (orcamento.tributos.temISS) {
      const valorISS = orcamento.valores.subtotal * (orcamento.tributos.aliquotaISS / 100);
      dreData.push([`    ISS (${formatPercentage(orcamento.tributos.aliquotaISS)})`, formatCurrency(valorISS), '']);
    }
    const valorSimples = orcamento.valores.subtotal * (orcamento.tributos.aliquotaSimples / 100);
    dreData.push([`    Simples Nacional (${formatPercentage(orcamento.tributos.aliquotaSimples)})`, formatCurrency(valorSimples), '']);

    dreData.push(
      ['(=) Receita líquida', formatCurrency(orcamento.dre.receitaLiquida), ''],
      ['(-) Custos diretos de produção', formatCurrency(orcamento.valores.custoDirectoTotal), ''],
      ['(=) Lucro bruto', formatCurrency(orcamento.dre.lucroBruto), formatPercentage(orcamento.dre.margemBruta)],
      ['(-) Despesas administrativas (BDI)', formatCurrency(orcamento.valores.bdiTotal), ''],
      ['(=) LUCRO LÍQUIDO', formatCurrency(orcamento.dre.lucroLiquido), formatPercentage(orcamento.dre.margemLiquida)]
    );

    autoTable(doc, {
      startY: yPosition,
      head: [['Classificação', 'Valor (R$)', 'Margem (%)']],
      body: dreData,
      theme: 'grid',
      headStyles: { fillColor: [66, 133, 244], textColor: 255 },
      margin: { left: 10, right: 10 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 50, halign: 'right' },
        2: { cellWidth: 40, halign: 'right' },
      },
    });

    // Footer em todas as páginas
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Página ${i} de ${pageCount}`,
        105,
        290,
        { align: 'center' }
      );
      doc.text(
        `Orçamento ${orcamento.numero} - Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
        105,
        285,
        { align: 'center' }
      );
    }

    // Salvar o PDF
    doc.save(`Orcamento_${orcamento.numero}_${orcamento.nome.replace(/\s+/g, '_')}.pdf`);
  }
}

export default new OrcamentoPdfService();
