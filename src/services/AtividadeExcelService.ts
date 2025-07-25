import * as XLSX from 'xlsx';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { AtividadeFiltros } from '@/hooks/useAtividadeData';
import { ExcelConfig } from '@/components/atividade/ExcelConfigDialog';
import { calcularKPI, calcularProgresso, formatarKPI, formatarProgresso, formatarTempoTotal, obterCodigoSequencial } from '@/utils/atividadeCalculos';

interface ColumnConfig {
  key: string;
  label: string;
  width: number;
  getValue: (atividade: AtividadeStatus, index: number) => any;
}

export class AtividadeExcelService {
  private static getColumnConfigs(): Record<string, ColumnConfig> {
    return {
      item: {
        key: 'Item',
        label: 'Item',
        width: 8,
        getValue: (_, index) => obterCodigoSequencial(index),
      },
      description: {
        key: 'Descrição',
        label: 'Descrição',
        width: 40,
        getValue: (atividade) => atividade.description,
      },
      macroTask: {
        key: 'Tarefa Macro',
        label: 'Tarefa Macro',
        width: 25,
        getValue: (atividade) => typeof atividade.macroTask === 'string' 
          ? atividade.macroTask 
          : atividade.macroTask?.name || '-',
      },
      process: {
        key: 'Processo',
        label: 'Processo',
        width: 20,
        getValue: (atividade) => typeof atividade.process === 'string' 
          ? atividade.process 
          : atividade.process?.name || '-',
      },
      status: {
        key: 'Status',
        label: 'Status',
        width: 15,
        getValue: (atividade) => atividade.status,
      },
      project: {
        key: 'Obra/Projeto',
        label: 'Obra/Projeto',
        width: 30,
        getValue: (atividade) => atividade.project?.name || '-',
      },
      serviceOrder: {
        key: 'OS',
        label: 'OS',
        width: 10,
        getValue: (atividade) => atividade.serviceOrder?.serviceOrderNumber || 'N/A',
      },
      estimatedTime: {
        key: 'Tempo Estimado',
        label: 'Tempo Estimado',
        width: 15,
        getValue: (atividade) => atividade.estimatedTime || '-',
      },
      totalTime: {
        key: 'Tempo Total',
        label: 'Tempo Total',
        width: 15,
        getValue: (atividade) => formatarTempoTotal(atividade),
      },
      kpi: {
        key: 'KPI (%)',
        label: 'KPI (%)',
        width: 12,
        getValue: (atividade) => formatarKPI(calcularKPI(atividade)),
      },
      progress: {
        key: 'Progresso (%)',
        label: 'Progresso (%)',
        width: 15,
        getValue: (atividade) => formatarProgresso(calcularProgresso(atividade)),
      },
      quantityTotal: {
        key: 'Quantidade Total',
        label: 'Quantidade Total',
        width: 15,
        getValue: (atividade) => atividade.quantity || 0,
      },
      quantityCompleted: {
        key: 'Quantidade Concluída',
        label: 'Quantidade Concluída',
        width: 18,
        getValue: (atividade) => atividade.completedQuantity || 0,
      },
      team: {
        key: 'Equipe',
        label: 'Equipe',
        width: 30,
        getValue: (atividade) => atividade.collaborators?.map(c => c.name).join(', ') || '-',
      },
      startDate: {
        key: 'Data Início',
        label: 'Data Início',
        width: 12,
        getValue: (atividade) => atividade.startDate ? new Date(atividade.startDate).toLocaleDateString('pt-BR') : '-',
      },
      endDate: {
        key: 'Data Fim',
        label: 'Data Fim',
        width: 12,
        getValue: (atividade) => atividade.endDate ? new Date(atividade.endDate).toLocaleDateString('pt-BR') : '-',
      },
      createdAt: {
        key: 'Data Criação',
        label: 'Data Criação',
        width: 12,
        getValue: (atividade) => new Date(atividade.createdAt).toLocaleDateString('pt-BR'),
      },
      observations: {
        key: 'Observações',
        label: 'Observações',
        width: 30,
        getValue: (atividade) => atividade.observation || '-',
      },
      client: {
        key: 'Cliente',
        label: 'Cliente',
        width: 25,
        getValue: (atividade) => atividade.project?.client || '-',
      },
      address: {
        key: 'Endereço',
        label: 'Endereço',
        width: 35,
        getValue: (atividade) => atividade.project?.address || '-',
      },
    };
  }

  static async gerarRelatorioExcel(atividades: AtividadeStatus[], filtros: AtividadeFiltros, config: ExcelConfig) {
    const allColumns = this.getColumnConfigs();
    const selectedColumns = Object.entries(config.columns)
      .filter(([_, selected]) => selected)
      .map(([key]) => allColumns[key])
      .filter(Boolean);

    // Preparar dados para a planilha com as colunas selecionadas
    const dadosFormatados = atividades.map((atividade, index) => {
      const row: Record<string, any> = {};
      selectedColumns.forEach(column => {
        row[column.key] = column.getValue(atividade, index);
      });
      return row;
    });

    // Criar workbook
    const workbook = XLSX.utils.book_new();

    // Aba principal com dados
    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);

    // Ajustar largura das colunas dinamicamente
    const columnWidths = selectedColumns.map(column => ({ wch: column.width }));
    worksheet['!cols'] = columnWidths;

    // Adicionar estilo ao cabeçalho (linha 1)
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          fill: { fgColor: { rgb: "FF7F0E" } },
          font: { bold: true, color: { rgb: "FFFFFF" } },
          alignment: { horizontal: "center" }
        };
      }
    }

    // Aplicar formatação condicional para KPI e Progresso se estiverem selecionados
    const kpiColumnIndex = selectedColumns.findIndex(col => col.key === 'KPI (%)');
    const progressColumnIndex = selectedColumns.findIndex(col => col.key === 'Progresso (%)');

    for (let row = 1; row <= dadosFormatados.length; row++) {
      // Coluna KPI
      if (kpiColumnIndex >= 0) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: kpiColumnIndex });
        const kpiCell = worksheet[cellAddress];
        if (kpiCell && kpiCell.v) {
          const kpiValue = parseFloat(kpiCell.v as string);
          let fillColor = "00FF00"; // Verde
          if (kpiValue > 120) fillColor = "FF0000"; // Vermelho
          else if (kpiValue > 100) fillColor = "FFFF00"; // Amarelo
          
          kpiCell.s = {
            fill: { fgColor: { rgb: fillColor } },
            alignment: { horizontal: "center" }
          };
        }
      }

      // Coluna Progresso
      if (progressColumnIndex >= 0) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: progressColumnIndex });
        const progressCell = worksheet[cellAddress];
        if (progressCell && progressCell.v) {
          const progressValue = parseFloat(progressCell.v as string);
          let fillColor = "FF0000"; // Vermelho
          if (progressValue >= 100) fillColor = "00FF00"; // Verde
          else if (progressValue >= 75) fillColor = "0000FF"; // Azul
          else if (progressValue >= 50) fillColor = "FFFF00"; // Amarelo
          
          progressCell.s = {
            fill: { fgColor: { rgb: fillColor } },
            alignment: { horizontal: "center" }
          };
        }
      }
    }

    // Adicionar aba de dados
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Atividades');

    // Criar aba de resumo com KPIs
    const totalAtividades = atividades.length;
    const kpiMedio = atividades.length > 0 
      ? atividades.reduce((sum, a) => sum + calcularKPI(a), 0) / atividades.length 
      : 0;
    const progressoMedio = atividades.length > 0 
      ? atividades.reduce((sum, a) => sum + calcularProgresso(a), 0) / atividades.length 
      : 0;

    const resumo = [
      { 'Informação': 'Total de Atividades', 'Valor': totalAtividades },
      { 'Informação': 'Colunas Selecionadas', 'Valor': selectedColumns.length },
      { 'Informação': 'Data de Geração', 'Valor': new Date().toLocaleDateString('pt-BR') },
      { 'Informação': '', 'Valor': '' }, // Linha em branco
      { 'Informação': 'STATUS', 'Valor': 'QUANTIDADE' },
      { 'Informação': 'Planejadas', 'Valor': atividades.filter(a => a.status === 'Planejadas').length },
      { 'Informação': 'Em Execução', 'Valor': atividades.filter(a => a.status === 'Em execução').length },
      { 'Informação': 'Concluídas', 'Valor': atividades.filter(a => a.status === 'Concluídas').length },
      { 'Informação': 'Paralizadas', 'Valor': atividades.filter(a => a.status === 'Paralizadas').length },
      { 'Informação': '', 'Valor': '' }, // Linha em branco
      { 'Informação': 'KPI Médio (%)', 'Valor': kpiMedio.toFixed(1) },
      { 'Informação': 'Progresso Médio (%)', 'Valor': progressoMedio.toFixed(1) }
    ];

    // Adicionar informações dos filtros
    if (filtros.status) {
      resumo.push({ 'Informação': 'Filtro Status', 'Valor': filtros.status });
    }
    if (filtros.obraId) {
      resumo.push({ 'Informação': 'Filtro Obra', 'Valor': 'Aplicado' });
    }
    if (filtros.dataInicio || filtros.dataFim) {
      resumo.push({ 
        'Informação': 'Período Filtrado', 
        'Valor': `${filtros.dataInicio || 'Início'} até ${filtros.dataFim || 'Fim'}` 
      });
    }

    const worksheetResumo = XLSX.utils.json_to_sheet(resumo);
    worksheetResumo['!cols'] = [{ wch: 25 }, { wch: 30 }];
    
    XLSX.utils.book_append_sheet(workbook, worksheetResumo, 'Resumo');

    // Criar aba de análise por obra se houver dados
    if (atividades.length > 0) {
      const obraAnalise = this.criarAnalisePorObra(atividades);
      const worksheetObra = XLSX.utils.json_to_sheet(obraAnalise);
      worksheetObra['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, worksheetObra, 'Análise por Obra');
    }

    return workbook;
  }

  private static criarAnalisePorObra(atividades: AtividadeStatus[]) {
    const obraStats = atividades.reduce((acc, atividade) => {
      const obraNome = atividade.project?.name || 'Sem Obra';
      
      if (!acc[obraNome]) {
        acc[obraNome] = {
          total: 0,
          concluidas: 0,
          emExecucao: 0,
          planejadas: 0,
          paralizadas: 0,
          kpiTotal: 0,
          progressoTotal: 0
        };
      }

      acc[obraNome].total++;
      acc[obraNome].kpiTotal += calcularKPI(atividade);
      acc[obraNome].progressoTotal += calcularProgresso(atividade);

      switch (atividade.status) {
        case 'Concluídas':
          acc[obraNome].concluidas++;
          break;
        case 'Em execução':
          acc[obraNome].emExecucao++;
          break;
        case 'Planejadas':
          acc[obraNome].planejadas++;
          break;
        case 'Paralizadas':
          acc[obraNome].paralizadas++;
          break;
      }

      return acc;
    }, {} as Record<string, any>);

    return Object.entries(obraStats).map(([obra, stats]) => ({
      'Obra/Projeto': obra,
      'Total': stats.total,
      'Concluídas': stats.concluidas,
      'Em Execução': stats.emExecucao,
      'KPI Médio (%)': (stats.kpiTotal / stats.total).toFixed(1),
      'Progresso Médio (%)': (stats.progressoTotal / stats.total).toFixed(1)
    }));
  }

  static async downloadExcel(atividades: AtividadeStatus[], filtros: AtividadeFiltros, config: ExcelConfig) {
    const workbook = await this.gerarRelatorioExcel(atividades, filtros, config);
    const fileName = `relatorio_atividades_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
  }
}
