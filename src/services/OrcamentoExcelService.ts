import * as XLSX from 'xlsx';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import { formatCurrency, formatPercentage } from '@/lib/currency';

class OrcamentoExcelService {
  async generateExcel(orcamento: Orcamento): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // ABA 1: Resumo Geral
    this.createResumoSheet(workbook, orcamento);

    // ABA 2: Composições
    this.createComposicoesSheet(workbook, orcamento);

    // ABA 3: DRE
    this.createDRESheet(workbook, orcamento);

    // ABA 4: Itens Detalhados
    this.createItensSheet(workbook, orcamento);

    // Salvar arquivo
    const fileName = `Orcamento_${orcamento.numero}_${orcamento.nome.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  private createResumoSheet(workbook: XLSX.WorkBook, orcamento: Orcamento) {
    const data = [
      ['ORÇAMENTO - RESUMO GERAL'],
      [''],
      ['Número:', orcamento.numero],
      ['Nome:', orcamento.nome],
      ['Tipo:', orcamento.tipo === 'servico' ? 'Serviço' : 'Produto'],
      [''],
      ['INFORMAÇÕES DO PROJETO'],
      ['Cliente:', orcamento.clienteNome || '-'],
      ['Código do Projeto:', orcamento.codigoProjeto || '-'],
      ['Área Total (m²):', orcamento.areaTotalM2 || '-'],
      ['Metros Lineares:', orcamento.metrosLineares || '-'],
      ['Peso Total (KG):', orcamento.pesoTotalProjeto || '-'],
      [''],
      ['VALORES FINANCEIROS'],
      ['Total de Venda:', formatCurrency(orcamento.totalVenda)],
      ['Subtotal:', formatCurrency(orcamento.valores.subtotal)],
      ['Custos Diretos:', formatCurrency(orcamento.valores.custoDirectoTotal)],
      ['BDI Total:', formatCurrency(orcamento.valores.bdiTotal)],
      ['Tributos Total:', formatCurrency(orcamento.valores.tributosTotal)],
      [''],
      ['MARGENS E INDICADORES'],
      ['Margem Bruta:', formatPercentage(orcamento.dre.margemBruta)],
      ['Margem Líquida:', formatPercentage(orcamento.dre.margemLiquida)],
      ['BDI Médio:', formatPercentage(orcamento.bdiMedio)],
      ['Custo por m²:', orcamento.custoPorM2 ? formatCurrency(orcamento.custoPorM2) : '-'],
      ['Custo por KG:', orcamento.custoPorKG ? formatCurrency(orcamento.custoPorKG) : '-'],
      [''],
      ['TRIBUTOS'],
      ['ISS:', orcamento.tributos.temISS ? 'Sim' : 'Não'],
      ['Alíquota ISS:', formatPercentage(orcamento.tributos.aliquotaISS)],
      ['Alíquota Simples Nacional:', formatPercentage(orcamento.tributos.aliquotaSimples)],
      [''],
      ['Data de Criação:', new Date(orcamento.createdAt).toLocaleDateString('pt-BR')],
      ['Última Atualização:', new Date(orcamento.updatedAt).toLocaleDateString('pt-BR')],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Estilização de largura das colunas
    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 25 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumo');
  }

  private createComposicoesSheet(workbook: XLSX.WorkBook, orcamento: Orcamento) {
    const data: any[][] = [
      ['COMPOSIÇÕES DE CUSTOS'],
      [''],
      ['ID', 'Nome', 'BDI (%)', 'Custo Direto (R$)', 'BDI (R$)', 'Total com BDI (R$)', 'Qtd Itens'],
    ];

    if (orcamento.composicoes && orcamento.composicoes.length > 0) {
      orcamento.composicoes.forEach((comp) => {
        data.push([
          comp.id,
          comp.nome,
          comp.bdiPercentual,
          comp.custoDirecto,
          comp.bdi,
          comp.totalComBDI,
          comp.items?.length || 0,
        ]);
      });

      // Linha de totais
      data.push([]);
      data.push([
        '',
        'TOTAL',
        '',
        orcamento.valores.custoDirectoTotal,
        orcamento.valores.bdiTotal,
        orcamento.valores.subtotal,
        '',
      ]);
    } else {
      data.push(['Nenhuma composição cadastrada']);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Largura das colunas
    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 40 },
      { wch: 12 },
      { wch: 18 },
      { wch: 15 },
      { wch: 20 },
      { wch: 12 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Composições');
  }

  private createDRESheet(workbook: XLSX.WorkBook, orcamento: Orcamento) {
    const valorISS = orcamento.tributos.temISS
      ? orcamento.valores.subtotal * (orcamento.tributos.aliquotaISS / 100)
      : 0;
    const valorSimples = orcamento.valores.subtotal * (orcamento.tributos.aliquotaSimples / 100);

    const data: any[][] = [
      ['DRE - DEMONSTRATIVO DE RESULTADO'],
      [''],
      ['Classificação', 'Valor (R$)', 'AV%'],
      [''],
      ['Valor total dos produtos/serviços', orcamento.valores.subtotal, '100,00%'],
      [''],
      ['(-) Tributos a recolher', orcamento.valores.tributosTotal, formatPercentage((orcamento.valores.tributosTotal / orcamento.totalVenda) * 100)],
    ];

    if (orcamento.tributos.temISS) {
      data.push([`    ISS (${formatPercentage(orcamento.tributos.aliquotaISS)})`, valorISS, formatPercentage((valorISS / orcamento.totalVenda) * 100)]);
    }
    data.push([`    Simples Nacional (${formatPercentage(orcamento.tributos.aliquotaSimples)})`, valorSimples, formatPercentage((valorSimples / orcamento.totalVenda) * 100)]);

    data.push(
      [''],
      ['(=) Receita líquida', orcamento.dre.receitaLiquida, formatPercentage((orcamento.dre.receitaLiquida / orcamento.totalVenda) * 100)],
      [''],
      ['(-) Custos diretos de produção', orcamento.valores.custoDirectoTotal, formatPercentage((orcamento.valores.custoDirectoTotal / orcamento.totalVenda) * 100)],
    );

    // Breakdown de custos por composição
    if (orcamento.composicoes && orcamento.composicoes.length > 0) {
      orcamento.composicoes.forEach((comp) => {
        const percentual = orcamento.valores.custoDirectoTotal > 0
          ? (comp.custoDirecto / orcamento.valores.custoDirectoTotal) * 100
          : 0;
        data.push([`    ${comp.nome}`, comp.custoDirecto, formatPercentage(percentual)]);
      });
    }

    data.push(
      [''],
      ['(=) Lucro bruto', orcamento.dre.lucroBruto, formatPercentage(orcamento.dre.margemBruta)],
      [''],
      ['(-) Despesas administrativas (BDI)', orcamento.valores.bdiTotal, formatPercentage((orcamento.valores.bdiTotal / orcamento.totalVenda) * 100)],
    );

    // Breakdown de BDI por composição
    if (orcamento.composicoes && orcamento.composicoes.length > 0) {
      orcamento.composicoes.forEach((comp) => {
        const percentual = orcamento.valores.bdiTotal > 0
          ? (comp.bdi / orcamento.valores.bdiTotal) * 100
          : 0;
        data.push([`    BDI ${comp.nome} (${formatPercentage(comp.bdiPercentual)})`, comp.bdi, formatPercentage(percentual)]);
      });
    }

    data.push(
      [''],
      ['(=) LUCRO LÍQUIDO', orcamento.dre.lucroLiquido, formatPercentage(orcamento.dre.margemLiquida)]
    );

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Largura das colunas
    worksheet['!cols'] = [
      { wch: 50 },
      { wch: 20 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'DRE');
  }

  private createItensSheet(workbook: XLSX.WorkBook, orcamento: Orcamento) {
    const data: any[][] = [
      ['ITENS DETALHADOS'],
      [''],
      ['Composição', 'Código', 'Descrição', 'Tipo', 'Quantidade', 'Unidade', 'Peso (KG)', 'Valor Unit. (R$)', 'Valor Total (R$)', 'Cargo', 'Material'],
    ];

    if (orcamento.composicoes && orcamento.composicoes.length > 0) {
      orcamento.composicoes.forEach((comp) => {
        if (comp.items && comp.items.length > 0) {
          comp.items.forEach((item) => {
            data.push([
              comp.nome,
              item.codigo || '-',
              item.descricao,
              item.tipoItem,
              item.quantidade,
              item.unidade,
              item.peso || '-',
              item.valorUnitario,
              item.valorTotal,
              item.cargo || '-',
              item.material || '-',
            ]);
          });
        }
      });
    } else {
      data.push(['Nenhum item cadastrado']);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Largura das colunas
    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 50 },
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
      { wch: 25 },
      { wch: 25 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Itens');
  }
}

export default new OrcamentoExcelService();
