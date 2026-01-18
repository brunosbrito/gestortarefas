import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Certificado } from '@/interfaces/QualidadeInterfaces';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PDF_COLORS } from './pdf/constants';

export class CertificadoPdfService {
  private static getStatusLabel(status: string): string {
    const statuses: Record<string, string> = {
      pendente: 'PENDENTE',
      recebido: 'RECEBIDO',
      em_analise: 'EM ANÁLISE',
      aprovado: 'APROVADO',
      reprovado: 'REPROVADO',
      enviado: 'ENVIADO',
    };
    return statuses[status] || status.toUpperCase();
  }

  private static async createHeader(doc: jsPDF, certificado: Certificado) {
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('GML ESTRUTURAS', 20, 25);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Sistema de Gestão da Qualidade', 20, 32);

    doc.setFontSize(16);
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('CERTIFICADO DE QUALIDADE', pageWidth / 2, 45, { align: 'center' });

    doc.setDrawColor(PDF_COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(20, 50, pageWidth - 20, 50);
  }

  private static createInfoSection(doc: jsPDF, certificado: Certificado, yPosition: number): number {
    let y = yPosition;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('INFORMAÇÕES DO CERTIFICADO', 20, y);
    y += 8;

    const infoData = [
      ['Número do Certificado', certificado.numeroCertificado],
      ['Tipo', certificado.tipoCertificado],
      ['Fornecedor', certificado.fornecedor],
      ['Status', this.getStatusLabel(certificado.status)],
      ['Data de Emissão', format(new Date(certificado.dataEmissao), 'dd/MM/yyyy', { locale: ptBR })],
      ['Validade', certificado.dataValidade ? format(new Date(certificado.dataValidade), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'],
      ['Obra', certificado.project?.name || 'N/A'],
    ];

    if (certificado.material) {
      infoData.push(['Material', certificado.material]);
    }

    if (certificado.lote) {
      infoData.push(['Lote', certificado.lote]);
    }

    if (certificado.norma) {
      infoData.push(['Norma', certificado.norma]);
    }

    autoTable(doc, {
      startY: y,
      head: [['Campo', 'Valor']],
      body: infoData,
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

    return (doc as any).lastAutoTable.finalY + 10;
  }

  private static createObservacoes(doc: jsPDF, certificado: Certificado, yPosition: number): number {
    if (!certificado.observacoes) return yPosition;

    let y = yPosition;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('OBSERVAÇÕES', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - 40;
    const lines = doc.splitTextToSize(certificado.observacoes, maxWidth);

    lines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 6;
    });

    return y + 10;
  }

  private static createFooter(doc: jsPDF, certificado: Certificado) {
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
        `Certificado gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
        20,
        pageHeight - 15
      );
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, pageHeight - 15, { align: 'right' });
    }
  }

  private static async gerarRelatorio(certificado: Certificado): Promise<jsPDF> {
    const doc = new jsPDF();

    await this.createHeader(doc, certificado);

    let yPosition = 60;
    yPosition = this.createInfoSection(doc, certificado, yPosition);
    yPosition = this.createObservacoes(doc, certificado, yPosition);

    this.createFooter(doc, certificado);

    return doc;
  }

  static async downloadPDF(certificado: Certificado) {
    try {
      console.log('Iniciando geração do PDF do certificado', certificado.numeroCertificado);
      const doc = await this.gerarRelatorio(certificado);
      const fileName = `certificado_${certificado.numeroCertificado}_${format(new Date(), 'yyyyMMdd', { locale: ptBR })}.pdf`;

      doc.save(fileName);
      console.log('PDF gerado com sucesso:', fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF do certificado:', error);
      throw error;
    }
  }
}
