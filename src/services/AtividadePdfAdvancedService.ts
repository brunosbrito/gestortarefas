import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { AtividadeFiltros } from '@/hooks/useAtividadeData';
import { PdfConfig } from '@/components/atividade/PdfConfigDialog';
import { calcularKPI, calcularProgresso, formatarKPI, formatarProgresso, formatarTempoTotal, obterCodigoSequencial } from '@/utils/atividadeCalculos';

export class AtividadePdfAdvancedService {
  private static getColumnData(atividade: AtividadeStatus, index: number, column: string): string {
    switch (column) {
      case 'item':
        return obterCodigoSequencial(index);
      case 'description':
        return atividade.description || '-';
      case 'macroTask':
        return typeof atividade.macroTask === 'string' 
          ? atividade.macroTask 
          : atividade.macroTask?.name || '-';
      case 'process':
        return typeof atividade.process === 'string' 
          ? atividade.process 
          : atividade.process?.name || '-';
      case 'status':
        return atividade.status || '-';
      case 'project':
        return atividade.project?.name || '-';
      case 'estimatedTime':
        return atividade.estimatedTime || '-';
      case 'totalTime':
        return formatarTempoTotal(atividade.totalTime);
      case 'kpi':
        return formatarKPI(calcularKPI(atividade));
      case 'progress':
        return formatarProgresso(calcularProgresso(atividade));
      case 'quantity':
        const total = atividade.quantity || 0;
        const concluida = atividade.completedQuantity || 0;
        return `${concluida}/${total}`;
      case 'team':
        return atividade.collaborators?.map(c => c.name).join(', ') || '-';
      case 'startDate':
        return atividade.startDate ? new Date(atividade.startDate).toLocaleDateString('pt-BR') : '-';
      case 'createdAt':
        return new Date(atividade.createdAt).toLocaleDateString('pt-BR');
      case 'observations':
        return atividade.observation || '-';
      default:
        return '-';
    }
  }

  private static calculateDynamicWidths(selectedColumns: string[], orientation: 'portrait' | 'landscape'): { [key: string]: number } {
    const availableWidth = orientation === 'landscape' ? 257 : 170; // largura disponível em mm
    const totalColumns = selectedColumns.length;
    
    // Definir prioridades e larguras mínimas/máximas para cada tipo de coluna
    const columnConfig: { [key: string]: { priority: 'small' | 'medium' | 'large'; min: number; max: number } } = {
      item: { priority: 'small', min: 12, max: 15 },
      kpi: { priority: 'small', min: 12, max: 15 },
      progress: { priority: 'small', min: 15, max: 18 },
      quantity: { priority: 'small', min: 15, max: 20 },
      estimatedTime: { priority: 'small', min: 12, max: 15 },
      totalTime: { priority: 'small', min: 12, max: 15 },
      startDate: { priority: 'small', min: 15, max: 18 },
      createdAt: { priority: 'small', min: 15, max: 18 },
      status: { priority: 'medium', min: 15, max: 25 },
      process: { priority: 'medium', min: 18, max: 30 },
      macroTask: { priority: 'medium', min: 20, max: 35 },
      project: { priority: 'medium', min: 20, max: 40 },
      team: { priority: 'medium', min: 20, max: 35 },
      description: { priority: 'large', min: 25, max: 60 },
      observations: { priority: 'large', min: 25, max: 50 }
    };

    // Calcular larguras dinamicamente
    const widths: { [key: string]: number } = {};
    let usedWidth = 0;

    // Primeiro passo: alocar larguras mínimas para colunas pequenas
    const smallColumns = selectedColumns.filter(col => columnConfig[col]?.priority === 'small');
    smallColumns.forEach(col => {
      const config = columnConfig[col];
      if (config) {
        widths[col] = Math.min(config.max, Math.max(config.min, availableWidth / totalColumns));
        usedWidth += widths[col];
      }
    });

    // Segundo passo: alocar larguras para colunas médias
    const mediumColumns = selectedColumns.filter(col => columnConfig[col]?.priority === 'medium');
    const remainingWidth1 = availableWidth - usedWidth;
    const mediumWidth = remainingWidth1 / (mediumColumns.length + selectedColumns.filter(col => columnConfig[col]?.priority === 'large').length * 1.5);
    
    mediumColumns.forEach(col => {
      const config = columnConfig[col];
      if (config) {
        widths[col] = Math.min(config.max, Math.max(config.min, mediumWidth));
        usedWidth += widths[col];
      }
    });

    // Terceiro passo: alocar largura restante para colunas grandes
    const largeColumns = selectedColumns.filter(col => columnConfig[col]?.priority === 'large');
    const remainingWidth2 = availableWidth - usedWidth;
    const largeWidth = remainingWidth2 / largeColumns.length;
    
    largeColumns.forEach(col => {
      const config = columnConfig[col];
      if (config) {
        widths[col] = Math.min(config.max, Math.max(config.min, largeWidth));
      }
    });

    return widths;
  }

  private static getColumnHeaders(config: PdfConfig): { key: string; header: string }[] {
    const headers: { key: string; header: string }[] = [];
    const columnMapping = {
      item: { header: 'Item' },
      description: { header: 'Descrição' },
      macroTask: { header: 'Tarefa Macro' },
      process: { header: 'Processo' },
      status: { header: 'Status' },
      project: { header: 'Obra/Projeto' },
      estimatedTime: { header: 'T. Est.' },
      totalTime: { header: 'T. Total' },
      kpi: { header: 'KPI' },
      progress: { header: 'Progresso' },
      quantity: { header: 'Qtd.' },
      team: { header: 'Equipe' },
      startDate: { header: 'Início' },
      createdAt: { header: 'Criação' },
      observations: { header: 'Observações' }
    };

    Object.entries(config.columns).forEach(([column, selected]) => {
      if (selected && columnMapping[column as keyof typeof columnMapping]) {
        const mapping = columnMapping[column as keyof typeof columnMapping];
        headers.push({
          key: column,
          header: mapping.header
        });
      }
    });

    return headers;
  }

  private static createHeader(doc: jsPDF, filtros: AtividadeFiltros) {
    // Logo/Título
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102); // #003366
    doc.text('Relatório de Atividades', 20, 25);

    // Data de geração
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, 35);

    // Filtros aplicados
    let yPosition = 45;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    if (Object.values(filtros).some(v => v !== null)) {
      doc.text('Filtros Aplicados:', 20, yPosition);
      yPosition += 8;
      doc.setFontSize(9);
      
      if (filtros.status) {
        doc.text(`• Status: ${filtros.status}`, 25, yPosition);
        yPosition += 6;
      }
      if (filtros.dataInicio || filtros.dataFim) {
        const periodo = `${filtros.dataInicio || 'Início'} até ${filtros.dataFim || 'Fim'}`;
        doc.text(`• Período: ${periodo}`, 25, yPosition);
        yPosition += 6;
      }
    }

    return yPosition + 10;
  }

  private static createSummary(doc: jsPDF, atividades: AtividadeStatus[], startY: number) {
    const totalAtividades = atividades.length;
    const planejadas = atividades.filter(a => a.status === 'Planejadas').length;
    const execucao = atividades.filter(a => a.status === 'Em execução').length;
    const concluidas = atividades.filter(a => a.status === 'Concluídas').length;
    const paralizadas = atividades.filter(a => a.status === 'Paralizadas').length;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const summary = [
      `Total de Atividades: ${totalAtividades}`,
      `Planejadas: ${planejadas}`,
      `Em Execução: ${execucao}`,
      `Concluídas: ${concluidas}`,
      `Paralizadas: ${paralizadas}`
    ];

    summary.forEach((text, index) => {
      doc.text(text, 20 + (index * 60), startY);
    });

    return startY + 15;
  }

  static async gerarRelatorioAvancado(
    atividades: AtividadeStatus[], 
    filtros: AtividadeFiltros,
    config: PdfConfig
  ): Promise<jsPDF> {
    const doc = new jsPDF({
      orientation: config.orientation,
      unit: 'mm',
      format: 'a4'
    });

    // Cabeçalho
    const headerHeight = this.createHeader(doc, filtros);
    
    // Resumo
    const summaryHeight = this.createSummary(doc, atividades, headerHeight);

    // Preparar dados da tabela
    const columns = this.getColumnHeaders(config);
    const selectedColumnKeys = columns.map(col => col.key);
    
    // Calcular larguras dinâmicas
    const dynamicWidths = this.calculateDynamicWidths(selectedColumnKeys, config.orientation);
    
    const data = atividades.map((atividade, index) => {
      const row: any = {};
      columns.forEach(col => {
        row[col.key] = this.getColumnData(atividade, index, col.key);
      });
      return row;
    });

    // Gerar tabela com larguras dinâmicas
    autoTable(doc, {
      startY: summaryHeight,
      head: [columns.map(col => col.header)],
      body: data.map((row: any) => columns.map(col => row[col.key])),
      theme: 'grid',
      headStyles: {
        fillColor: [255, 127, 14], // #FF7F0E
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      columnStyles: {
        ...columns.reduce((acc, col, index) => {
          acc[index] = {
            cellWidth: dynamicWidths[col.key] || 'auto',
            halign: ['item', 'kpi', 'progress', 'quantity'].includes(col.key) ? 'center' : 'left'
          };
          return acc;
        }, {} as any)
      },
      styles: {
        overflow: 'linebreak',
        fontSize: 7
      },
      margin: { left: 20, right: 20 },
      pageBreak: 'auto',
      showHead: 'everyPage'
    });

    // Rodapé
    const pageCount = doc.getNumberOfPages();
    const pageWidth = config.orientation === 'landscape' ? 297 : 210;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        config.orientation === 'landscape' ? 205 : 285,
        { align: 'center' }
      );
    }

    return doc;
  }

  static async downloadPDF(
    atividades: AtividadeStatus[], 
    filtros: AtividadeFiltros,
    config: PdfConfig
  ) {
    try {
      console.log('Iniciando geração do PDF com', atividades.length, 'atividades');
      const doc = await this.gerarRelatorioAvancado(atividades, filtros, config);
      const fileName = `relatorio_atividades_${new Date().toISOString().split('T')[0]}.pdf`;
      
      doc.save(fileName);
      console.log('PDF gerado com sucesso');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Erro na geração do PDF: ' + (error as Error).message);
    }
  }
}
