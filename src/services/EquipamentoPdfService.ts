import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Equipamento } from '@/interfaces/QualidadeInterfaces';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PDF_COLORS } from './pdf/constants';

export class EquipamentoPdfService {
  private static getTipoLabel(tipo: string): string {
    const tipos: Record<string, string> = {
      paquimetro: 'Paquímetro',
      micrometro: 'Micrômetro',
      torquimetro: 'Torquímetro',
      manometro: 'Manômetro',
      balanca: 'Balança',
      outro: 'Outro',
    };
    return tipos[tipo] || tipo;
  }

  private static getStatusLabel(status: string): string {
    const statuses: Record<string, string> = {
      em_dia: 'EM DIA',
      proximo_vencimento: 'PRÓXIMO VENCIMENTO',
      vencido: 'VENCIDO',
      reprovado: 'REPROVADO',
    };
    return statuses[status] || status.toUpperCase();
  }

  private static async createHeader(doc: jsPDF, equipamento: Equipamento) {
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('GML ESTRUTURAS', 20, 25);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Sistema de Gestão da Qualidade', 20, 32);

    doc.setFontSize(16);
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('RELATÓRIO DE EQUIPAMENTO E CALIBRAÇÃO', pageWidth / 2, 45, { align: 'center' });

    doc.setDrawColor(PDF_COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(20, 50, pageWidth - 20, 50);
  }

  private static createInfoSection(doc: jsPDF, equipamento: Equipamento, yPosition: number): number {
    let y = yPosition;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('INFORMAÇÕES DO EQUIPAMENTO', 20, y);
    y += 8;

    const infoData = [
      ['Nome', equipamento.nome],
      ['Tipo', this.getTipoLabel(equipamento.tipo)],
      ['Status', this.getStatusLabel(equipamento.status)],
      ['Número de Série', equipamento.numeroSerie || 'N/A'],
      ['Patrimônio', equipamento.patrimonio || 'N/A'],
      ['Fabricante', equipamento.fabricante || 'N/A'],
      ['Modelo', equipamento.modelo || 'N/A'],
      ['Faixa de Medição', equipamento.faixaMedicao || 'N/A'],
      ['Resolução', equipamento.resolucao || 'N/A'],
      ['Setor', equipamento.setor || 'N/A'],
      ['Responsável', equipamento.responsavel?.name || 'N/A'],
      ['Frequência de Calibração', `${equipamento.frequenciaCalibracao} meses`],
    ];

    if (equipamento.observacoes) {
      infoData.push(['Observações', equipamento.observacoes]);
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

  private static createCalibracoesSection(doc: jsPDF, equipamento: Equipamento, yPosition: number): number {
    if (!equipamento.calibracoes || equipamento.calibracoes.length === 0) {
      return yPosition;
    }

    let y = yPosition;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('HISTÓRICO DE CALIBRAÇÕES', 20, y);
    y += 8;

    const calibracoesData = equipamento.calibracoes.map((cal) => [
      format(new Date(cal.dataRealizacao), 'dd/MM/yyyy', { locale: ptBR }),
      format(new Date(cal.proximaCalibracao), 'dd/MM/yyyy', { locale: ptBR }),
      cal.resultado === 'aprovado' ? 'APROVADO' : 'REPROVADO',
      cal.laboratorio || 'N/A',
      cal.certificado || 'N/A',
      cal.observacoes || '',
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Data Realização', 'Próxima Calibração', 'Resultado', 'Laboratório', 'Certificado', 'Observações']],
      body: calibracoesData,
      theme: 'grid',
      headStyles: {
        fillColor: PDF_COLORS.primary,
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30 },
        5: { cellWidth: 'auto' },
      },
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  private static createFooter(doc: jsPDF, equipamento: Equipamento) {
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

  private static async gerarRelatorio(equipamento: Equipamento): Promise<jsPDF> {
    const doc = new jsPDF();

    await this.createHeader(doc, equipamento);

    let yPosition = 60;
    yPosition = this.createInfoSection(doc, equipamento, yPosition);
    yPosition = this.createCalibracoesSection(doc, equipamento, yPosition);

    this.createFooter(doc, equipamento);

    return doc;
  }

  static async downloadPDF(equipamento: Equipamento) {
    try {
      console.log('Iniciando geração do PDF do equipamento', equipamento.nome);
      const doc = await this.gerarRelatorio(equipamento);
      const fileName = `equipamento_${equipamento.numeroSerie || equipamento.nome}_${format(new Date(), 'yyyyMMdd', { locale: ptBR })}.pdf`;

      doc.save(fileName);
      console.log('PDF gerado com sucesso:', fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF do equipamento:', error);
      throw error;
    }
  }
}
