import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Proposta } from '@/interfaces/PropostaInterface';
import { formatCurrency } from '@/lib/currency';

class PropostaPdfService {
  async generatePDF(proposta: Proposta): Promise<void> {
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

    yPosition += 7;
    doc.text(`Vendedor: ${proposta.vendedor.nome}`, 105, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setDrawColor(0, 0, 0);
    doc.line(10, yPosition, 200, yPosition);
    yPosition += 5;

    // Número da Proposta e Data
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`ORÇAMENTO Nº ${proposta.numero}`, 10, yPosition);
    const dataEmissao = new Date(proposta.dataEmissao).toLocaleDateString('pt-BR');
    doc.text(dataEmissao, 200, yPosition, { align: 'right' });

    yPosition += 10;

    // Dados do Cliente
    doc.setFontSize(11);
    doc.text(`À ${proposta.cliente.razaoSocial}`, 10, yPosition);
    yPosition += 5;
    if (proposta.cliente.contatoAtencao) {
      doc.setFont('helvetica', 'normal');
      doc.text(`${proposta.cliente.contatoAtencao}`, 10, yPosition);
      yPosition += 5;
    }

    yPosition += 5;
    doc.line(10, yPosition, 200, yPosition);
    yPosition += 5;

    // Título da Proposta
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`PROPOSTA TÉCNICA/COMERCIAL: ${proposta.numero}`, 10, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Prezados Senhores,', 10, yPosition);
    yPosition += 5;
    doc.text(`Segue proposta para ${proposta.titulo}`, 10, yPosition);
    yPosition += 10;

    // Validade e Previsão
    doc.setFont('helvetica', 'bold');
    const dataValidade = new Date(proposta.dataValidade).toLocaleDateString('pt-BR');
    doc.text(`VALIDADE: ${dataValidade}`, 10, yPosition);
    doc.text(`PREVISÃO ENTREGA: ${proposta.previsaoEntrega}`, 120, yPosition);
    yPosition += 10;

    // Tabela de Dados do Cliente
    autoTable(doc, {
      startY: yPosition,
      head: [['DADOS DO CLIENTE']],
      body: [
        ['Razão Social:', proposta.cliente.razaoSocial],
        ['CNPJ:', proposta.cliente.cnpj],
        ['Endereço:', `${proposta.cliente.endereco}, ${proposta.cliente.bairro || ''}`],
        ['Cidade/UF:', `${proposta.cliente.cidade}/${proposta.cliente.uf}`],
        ['CEP:', proposta.cliente.cep],
        ['Telefone:', proposta.cliente.telefone],
        ['Email:', proposta.cliente.email],
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], fontSize: 11 },
      styles: { fontSize: 9 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Tabela de Itens/Serviços
    const itensData = proposta.itens.map(item => [
      item.item.toString(),
      item.nome,
      item.quantidade.toString(),
      item.unidade || '-',
      formatCurrency(item.valorUnitario),
      formatCurrency(item.subtotal),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['ITEM', 'NOME', 'QTD', 'UNIDADE', 'VR. UNIT.', 'SUBTOTAL']],
      body: itensData,
      foot: [[{ content: 'TOTAL:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, formatCurrency(proposta.valorTotal)]],
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      footStyles: { fillColor: [37, 99, 235] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Dados do Pagamento
    autoTable(doc, {
      startY: yPosition,
      head: [['DADOS DO PAGAMENTO']],
      body: [
        ['Valor:', formatCurrency(proposta.pagamento.valor)],
        ['Forma de Pagamento:', proposta.pagamento.formaPagamento],
        ...(proposta.pagamento.vencimento ? [['Vencimento:', new Date(proposta.pagamento.vencimento).toLocaleDateString('pt-BR')]] : []),
        ...(proposta.pagamento.observacao ? [['Observação:', proposta.pagamento.observacao]] : []),
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Observações
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVAÇÕES', 10, yPosition);
    yPosition += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const observacoes = [
      `01. IMPOSTOS: ${proposta.observacoes.impostosInclusos ? 'Inclusos' : 'Não inclusos'}`,
      ...(proposta.observacoes.faturamentoMateriais ? [`02. FATURAMENTO MATERIAIS: ${proposta.observacoes.faturamentoMateriais}`] : []),
      ...(proposta.observacoes.faturamentoServicos ? [`03. FATURAMENTO SERVIÇOS: ${proposta.observacoes.faturamentoServicos}`] : []),
      `04. TRANSPORTE EQUIPAMENTO: ${proposta.observacoes.transporteEquipamento === 'cliente' ? 'Por conta do cliente' : 'Por conta da GMX'}`,
      `05. HOSPEDAGEM E ALIMENTAÇÃO: ${proposta.observacoes.hospedagemAlimentacao === 'cliente' ? 'Por conta do cliente' : 'Por conta da GMX'}`,
    ];

    if (proposta.observacoes.condicoesGerais && proposta.observacoes.condicoesGerais.length > 0) {
      observacoes.push('06. CONDIÇÕES GERAIS DE FORNECIMENTO:');
      proposta.observacoes.condicoesGerais.forEach(condicao => {
        observacoes.push(`    ${condicao.codigo}. ${condicao.descricao}`);
      });
    }

    if (proposta.observacoes.itensForaEscopo && proposta.observacoes.itensForaEscopo.length > 0) {
      observacoes.push('07. ITENS FORA DO ESCOPO:');
      proposta.observacoes.itensForaEscopo.forEach(item => {
        observacoes.push(`    - ${item}`);
      });
    }

    observacoes.forEach(obs => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      const lines = doc.splitTextToSize(obs, 190);
      doc.text(lines, 10, yPosition);
      yPosition += lines.length * 5;
    });

    // Assinatura
    yPosition += 10;
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.text('Estando as partes de acordo com as condições acima estabelecidas, assinam o presente instrumento:', 10, yPosition);
    yPosition += 20;
    doc.text('_________________________________________', 10, yPosition);
    yPosition += 5;
    doc.text('Assinatura do Cliente', 10, yPosition);

    // Salvar PDF
    doc.save(`Proposta_${proposta.numero}.pdf`);
  }
}

export default new PropostaPdfService();
