import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnaliseAcaoCorretiva } from '@/interfaces/QualidadeInterfaces';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PDF_COLORS } from './pdf/constants';

export class AnaliseAcaoCorretivaPdfService {
  private static getMetodoLabel(metodo: string): string {
    const metodos: Record<string, string> = {
      cinco_porques: '5 Porquês',
      ishikawa: 'Diagrama de Ishikawa (6M)',
      ambos: '5 Porquês + Ishikawa',
    };
    return metodos[metodo] || metodo;
  }

  private static getStatusLabel(status: string): string {
    const statuses: Record<string, string> = {
      pendente: 'PENDENTE',
      em_andamento: 'EM ANDAMENTO',
      concluida: 'CONCLUÍDA',
      verificada: 'VERIFICADA',
      cancelada: 'CANCELADA',
    };
    return statuses[status] || status.toUpperCase();
  }

  private static async createHeader(doc: jsPDF, analise: AnaliseAcaoCorretiva) {
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('GML ESTRUTURAS', 20, 25);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Sistema de Gestão da Qualidade', 20, 32);

    doc.setFontSize(16);
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('ANÁLISE E AÇÕES CORRETIVAS', pageWidth / 2, 45, { align: 'center' });

    doc.setDrawColor(PDF_COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(20, 50, pageWidth - 20, 50);
  }

  private static createRNCSection(doc: jsPDF, analise: AnaliseAcaoCorretiva, yPosition: number): number {
    let y = yPosition;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('RNC RELACIONADA', 20, y);
    y += 8;

    const rncData = [
      ['Código RNC', `#${analise.rnc?.code}`],
      ['Descrição', analise.rnc?.description || ''],
      ['Obra', analise.rnc?.project?.name || 'N/A'],
      ['Data Ocorrência', analise.rnc?.dateOccurrence ? format(new Date(analise.rnc.dateOccurrence), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'],
      ['Origem', analise.rnc?.origin || 'N/A'],
    ];

    autoTable(doc, {
      startY: y,
      head: [['Campo', 'Valor']],
      body: rncData,
      theme: 'grid',
      headStyles: {
        fillColor: PDF_COLORS.primary,
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' },
      },
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  private static createAnaliseSection(doc: jsPDF, analise: AnaliseAcaoCorretiva, yPosition: number): number {
    let y = yPosition;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('ANÁLISE DE CAUSA RAIZ', 20, y);
    y += 8;

    const analiseData = [
      ['Método Utilizado', this.getMetodoLabel(analise.metodoAnalise)],
      ['Causa Raiz Identificada', analise.causaRaizIdentificada || 'N/A'],
    ];

    autoTable(doc, {
      startY: y,
      head: [['Campo', 'Valor']],
      body: analiseData,
      theme: 'grid',
      headStyles: {
        fillColor: PDF_COLORS.primary,
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 'auto' },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // 5 Porquês
    if ((analise.metodoAnalise === 'cinco_porques' || analise.metodoAnalise === 'ambos') && analise.cincoPorques) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(PDF_COLORS.primary);
      doc.text('5 Porquês:', 20, y);
      y += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      const pageWidth = doc.internal.pageSize.getWidth();
      const maxWidth = pageWidth - 40;

      analise.cincoPorques.forEach((porq, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const text = `Por quê ${index + 1}: ${porq}`;
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          doc.text(line, 25, y);
          y += 5;
        });
        y += 2;
      });

      y += 5;
    }

    // Ishikawa
    if ((analise.metodoAnalise === 'ishikawa' || analise.metodoAnalise === 'ambos') && analise.ishikawa) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(PDF_COLORS.primary);
      doc.text('Diagrama de Ishikawa (6M):', 20, y);
      y += 6;

      const ishikawaData = [
        ['Método', analise.ishikawa.metodo || 'N/A'],
        ['Máquina', analise.ishikawa.maquina || 'N/A'],
        ['Material', analise.ishikawa.material || 'N/A'],
        ['Mão de Obra', analise.ishikawa.maoDeObra || 'N/A'],
        ['Medição', analise.ishikawa.medicao || 'N/A'],
        ['Meio Ambiente', analise.ishikawa.meioAmbiente || 'N/A'],
      ];

      autoTable(doc, {
        startY: y,
        head: [['Categoria', 'Descrição']],
        body: ishikawaData,
        theme: 'grid',
        headStyles: {
          fillColor: [100, 100, 100],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 9,
          cellPadding: 2,
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 'auto' },
        },
      });

      y = (doc as any).lastAutoTable.finalY + 10;
    }

    return y;
  }

  private static createAcoesSection(doc: jsPDF, analise: AnaliseAcaoCorretiva, yPosition: number): number {
    if (!analise.acoes || analise.acoes.length === 0) {
      return yPosition;
    }

    let y = yPosition;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('PLANO DE AÇÕES CORRETIVAS', 20, y);
    y += 8;

    const acoesData = analise.acoes.map((acao) => [
      acao.oque || '',
      acao.porque || '',
      acao.quando ? format(new Date(acao.quando), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A',
      acao.onde || '',
      acao.quem || '',
      acao.como || '',
      this.getStatusLabel(acao.status),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['O quê', 'Por quê', 'Quando', 'Onde', 'Quem', 'Como', 'Status']],
      body: acoesData,
      theme: 'grid',
      headStyles: {
        fillColor: PDF_COLORS.primary,
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 },
        5: { cellWidth: 30 },
        6: { cellWidth: 20 },
      },
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  private static createFooter(doc: jsPDF, analise: AnaliseAcaoCorretiva) {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageCount = (doc as any).internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      doc.setDrawColor(PDF_COLORS.primary);
      doc.setLineWidth(0.5);
      doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Relatório gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
        20,
        pageHeight - 15
      );
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, pageHeight - 15, { align: 'right' });
    }
  }

  private static async gerarRelatorio(analise: AnaliseAcaoCorretiva): Promise<jsPDF> {
    const doc = new jsPDF();

    await this.createHeader(doc, analise);

    let yPosition = 60;
    yPosition = this.createRNCSection(doc, analise, yPosition);
    yPosition = this.createAnaliseSection(doc, analise, yPosition);
    yPosition = this.createAcoesSection(doc, analise, yPosition);

    this.createFooter(doc, analise);

    return doc;
  }

  static async downloadPDF(analise: AnaliseAcaoCorretiva) {
    try {
      console.log('Iniciando geração do PDF da análise', analise.id);
      const doc = await this.gerarRelatorio(analise);
      const fileName = `analise_acoes_RNC${analise.rnc?.code}_${format(new Date(), 'yyyyMMdd', { locale: ptBR })}.pdf`;

      doc.save(fileName);
      console.log('PDF gerado com sucesso:', fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF da análise:', error);
      throw error;
    }
  }
}
