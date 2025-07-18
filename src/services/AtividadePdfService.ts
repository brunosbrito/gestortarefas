
import jsPDF from 'jspdf';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';

export class AtividadePdfService {
  static async gerarRelatorioPDF(atividades: AtividadeStatus[], filtros: any) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 30;

    // Cabeçalho
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Atividades', margin, yPosition);
    
    yPosition += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
    
    yPosition += 10;
    doc.text(`Total de atividades: ${atividades.length}`, margin, yPosition);

    // Filtros aplicados
    yPosition += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Filtros Aplicados:', margin, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');

    if (filtros.status) {
      doc.text(`Status: ${filtros.status}`, margin, yPosition);
      yPosition += 6;
    }
    if (filtros.dataInicio || filtros.dataFim) {
      const periodo = `${filtros.dataInicio || 'Início'} até ${filtros.dataFim || 'Fim'}`;
      doc.text(`Período: ${periodo}`, margin, yPosition);
      yPosition += 6;
    }

    yPosition += 10;

    // Cabeçalho da tabela
    const tableHeaders = ['Descrição', 'Tarefa Macro', 'Processo', 'Status', 'Obra', 'Data Início'];
    const colWidths = [60, 35, 35, 25, 40, 25];
    let xPosition = margin;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    
    tableHeaders.forEach((header, index) => {
      doc.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });

    yPosition += 8;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // Dados da tabela
    doc.setFont('helvetica', 'normal');
    
    atividades.forEach((atividade, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 30;
      }

      xPosition = margin;
      
      const rowData = [
        this.truncateText(atividade.description, 30),
        this.truncateText(typeof atividade.macroTask === 'string' ? atividade.macroTask : atividade.macroTask?.name || '-', 20),
        this.truncateText(typeof atividade.process === 'string' ? atividade.process : atividade.process?.name || '-', 20),
        atividade.status,
        this.truncateText(atividade.project?.name || '-', 25),
        new Date(atividade.startDate).toLocaleDateString('pt-BR')
      ];

      rowData.forEach((data, colIndex) => {
        doc.text(data, xPosition, yPosition);
        xPosition += colWidths[colIndex];
      });

      yPosition += 6;
    });

    // Rodapé
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - 40, 285);
    }

    return doc;
  }

  private static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  static async downloadPDF(atividades: AtividadeStatus[], filtros: any) {
    const doc = await this.gerarRelatorioPDF(atividades, filtros);
    const fileName = `relatorio_atividades_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
}
