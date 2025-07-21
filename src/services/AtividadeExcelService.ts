
import * as XLSX from 'xlsx';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { AtividadeFiltros } from '@/hooks/useAtividadeData';
import { calcularKPI, calcularProgresso, formatarKPI, formatarProgresso, obterCodigoSequencial } from '@/utils/atividadeCalculos';

export class AtividadeExcelService {
  static async gerarRelatorioExcel(atividades: AtividadeStatus[], filtros: AtividadeFiltros) {
    // Preparar dados para a planilha com as novas colunas
    const dadosFormatados = atividades.map((atividade, index) => ({
      'Item': obterCodigoSequencial(index),
      'Descrição': atividade.description,
      'Tarefa Macro': typeof atividade.macroTask === 'string' 
        ? atividade.macroTask 
        : atividade.macroTask?.name || '-',
      'Processo': typeof atividade.process === 'string' 
        ? atividade.process 
        : atividade.process?.name || '-',
      'Status': atividade.status,
      'Obra/Projeto': atividade.project?.name || '-',
      'OS': atividade.serviceOrder?.serviceOrderNumber || 'N/A',
      'Tempo Estimado': atividade.estimatedTime || '-',
      'Tempo Total (h)': atividade.totalTime || 0,
      'KPI (%)': calcularKPI(atividade).toFixed(1),
      'Progresso (%)': calcularProgresso(atividade).toFixed(1),
      'Quantidade Total': atividade.quantity || 0,
      'Quantidade Concluída': atividade.completedQuantity || 0,
      'Equipe': atividade.collaborators?.map(c => c.name).join(', ') || '-',
      'Data Início': atividade.startDate ? new Date(atividade.startDate).toLocaleDateString('pt-BR') : '-',
      'Data Fim': atividade.endDate ? new Date(atividade.endDate).toLocaleDateString('pt-BR') : '-',
      'Data Criação': new Date(atividade.createdAt).toLocaleDateString('pt-BR'),
      'Observações': atividade.observation || '-',
      'Cliente': atividade.project?.client || '-',
      'Endereço': atividade.project?.address || '-'
    }));

    // Criar workbook
    const workbook = XLSX.utils.book_new();

    // Aba principal com dados
    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);

    // Ajustar largura das colunas
    const columnWidths = [
      { wch: 8 },  // Item
      { wch: 40 }, // Descrição
      { wch: 25 }, // Tarefa Macro
      { wch: 20 }, // Processo
      { wch: 15 }, // Status
      { wch: 30 }, // Obra/Projeto
      { wch: 10 }, // OS
      { wch: 15 }, // Tempo Estimado
      { wch: 15 }, // Tempo Total
      { wch: 12 }, // KPI
      { wch: 15 }, // Progresso
      { wch: 15 }, // Quantidade Total
      { wch: 18 }, // Quantidade Concluída
      { wch: 30 }, // Equipe
      { wch: 12 }, // Data Início
      { wch: 12 }, // Data Fim
      { wch: 12 }, // Data Criação
      { wch: 30 }, // Observações
      { wch: 25 }, // Cliente
      { wch: 35 }  // Endereço
    ];

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

    // Aplicar formatação condicional para KPI e Progresso
    for (let row = 1; row <= dadosFormatados.length; row++) {
      // Coluna KPI (J)
      const kpiCell = worksheet[`J${row + 1}`];
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

      // Coluna Progresso (K)
      const progressCell = worksheet[`K${row + 1}`];
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

    // Criar aba de análise por obra se houver filtro por obra
    if (filtros.obraId || atividades.length > 0) {
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

  static async downloadExcel(atividades: AtividadeStatus[], filtros: AtividadeFiltros) {
    const workbook = await this.gerarRelatorioExcel(atividades, filtros);
    const fileName = `relatorio_atividades_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
  }
}
