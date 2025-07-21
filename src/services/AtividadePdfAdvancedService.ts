
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { AtividadeFiltros } from '@/hooks/useAtividadeData';
import { PdfConfig } from '@/components/atividade/PdfConfigDialog';
import { calcularKPI, calcularProgresso, formatarKPI, formatarProgresso, obterCodigoSequencial } from '@/utils/atividadeCalculos';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

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
        return atividade.totalTime ? `${atividade.totalTime}h` : '-';
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

  private static getColumnHeaders(config: PdfConfig): { key: string; header: string; width?: number }[] {
    const headers: { key: string; header: string; width?: number }[] = [];
    const columnMapping = {
      item: { header: 'Item', width: 15 },
      description: { header: 'Descrição', width: 40 },
      macroTask: { header: 'Tarefa Macro', width: 25 },
      process: { header: 'Processo', width: 20 },
      status: { header: 'Status', width: 18 },
      project: { header: 'Obra/Projeto', width: 30 },
      estimatedTime: { header: 'T. Est.', width: 15 },
      totalTime: { header: 'T. Total', width: 15 },
      kpi: { header: 'KPI', width: 12 },
      progress: { header: 'Progresso', width: 15 },
      quantity: { header: 'Qtd.', width: 15 },
      team: { header: 'Equipe', width: 25 },
      startDate: { header: 'Início', width: 15 },
      createdAt: { header: 'Criação', width: 15 },
      observations: { header: 'Observações', width: 35 }
    };

    Object.entries(config.columns).forEach(([column, selected]) => {
      if (selected && columnMapping[column as keyof typeof columnMapping]) {
        const mapping = columnMapping[column as keyof typeof columnMapping];
        headers.push({
          key: column,
          header: mapping.header,
          width: mapping.width
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
    const data = atividades.map((atividade, index) => {
      const row: any = {};
      columns.forEach(col => {
        row[col.key] = this.getColumnData(atividade, index, col.key);
      });
      return row;
    });

    // Configurações da tabela
    const pageWidth = config.orientation === 'landscape' ? 297 : 210;
    const availableWidth = pageWidth - 40; // margens de 20mm de cada lado

    // Gerar tabela
    doc.autoTable({
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
            cellWidth: col.width || 'auto',
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
    const doc = await this.gerarRelatorioAvancado(atividades, filtros, config);
    const fileName = `relatorio_atividades_${new Date().toISOString().split('T')[0]}.pdf`;
    
    doc.save(fileName);
  }
}
