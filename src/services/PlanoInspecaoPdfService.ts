import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PlanoInspecao } from '@/interfaces/QualidadeInterfaces';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PDF_COLORS } from './pdf/constants';

export class PlanoInspecaoPdfService {
  private static getTipoLabel(tipo: string): string {
    const tipos: Record<string, string> = {
      recebimento: 'Recebimento de Material',
      em_processo: 'Em Processo (Fabricação)',
      final: 'Produto Final',
      auditoria: 'Auditoria Interna',
    };
    return tipos[tipo] || tipo;
  }

  private static getCampoTipoLabel(tipo: string): string {
    const tipos: Record<string, string> = {
      texto: 'Texto',
      numero: 'Número',
      checkbox: 'Checkbox',
      radio: 'Radio',
      select: 'Seleção',
      medicao: 'Medição',
    };
    return tipos[tipo] || tipo;
  }

  private static async createHeader(doc: jsPDF, plano: PlanoInspecao) {
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('GML ESTRUTURAS', 20, 25);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Sistema de Gestão da Qualidade', 20, 32);

    doc.setFontSize(16);
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('PLANO DE INSPEÇÃO', pageWidth / 2, 45, { align: 'center' });

    doc.setDrawColor(PDF_COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(20, 50, pageWidth - 20, 50);
  }

  private static createInfoSection(doc: jsPDF, plano: PlanoInspecao, yPosition: number): number {
    let y = yPosition;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('INFORMAÇÕES DO PLANO', 20, y);
    y += 8;

    const infoData = [
      ['Nome', plano.nome],
      ['Versão', `Rev. ${String(plano.versao).padStart(2, '0')}`],
      ['Tipo de Inspeção', this.getTipoLabel(plano.tipo)],
      ['Status', plano.ativo ? 'ATIVO' : 'INATIVO'],
      ['Produto/Categoria', plano.produto || 'N/A'],
      ['Processo', plano.processo || 'N/A'],
      ['Frequência', plano.frequencia || 'N/A'],
      ['Total de Campos', String(plano.campos?.length || 0)],
    ];

    if (plano.descricao) {
      infoData.push(['Descrição', plano.descricao]);
    }

    if (plano.revisadoPor) {
      infoData.push(['Revisado por', plano.revisadoPor.name || '']);
      if (plano.dataRevisao) {
        infoData.push(['Data da Revisão', format(new Date(plano.dataRevisao), 'dd/MM/yyyy', { locale: ptBR })]);
      }
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

  private static createCamposSection(doc: jsPDF, plano: PlanoInspecao, yPosition: number): number {
    if (!plano.campos || plano.campos.length === 0) {
      return yPosition;
    }

    let y = yPosition;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('CAMPOS DE INSPEÇÃO', 20, y);
    y += 8;

    const camposData = plano.campos
      .sort((a, b) => a.ordem - b.ordem)
      .map((campo) => [
        String(campo.ordem),
        campo.nome,
        this.getCampoTipoLabel(campo.tipo),
        campo.obrigatorio ? 'Sim' : 'Não',
        campo.especificacao || '',
        campo.tolerancia || '',
        campo.metodoMedicao || '',
        campo.opcoes ? campo.opcoes.join(', ') : '',
      ]);

    autoTable(doc, {
      startY: y,
      head: [['Ordem', 'Campo', 'Tipo', 'Obrigatório', 'Especificação', 'Tolerância', 'Método Medição', 'Opções']],
      body: camposData,
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
        0: { cellWidth: 15 },
        1: { cellWidth: 35 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 },
        5: { cellWidth: 20 },
        6: { cellWidth: 25 },
        7: { cellWidth: 'auto' },
      },
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  private static createInstrucoesSection(doc: jsPDF, yPosition: number): number {
    let y = yPosition;

    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('INSTRUÇÕES DE USO', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const instrucoes = [
      '1. Preencha todos os campos obrigatórios',
      '2. Verifique as especificações e tolerâncias antes de registrar medições',
      '3. Siga os métodos de medição especificados para cada campo',
      '4. Registre observações sempre que houver desvios ou não conformidades',
      '5. Assine e date o formulário após conclusão da inspeção',
    ];

    instrucoes.forEach((instrucao) => {
      doc.text(instrucao, 25, y);
      y += 6;
    });

    return y + 10;
  }

  private static createFooter(doc: jsPDF, plano: PlanoInspecao) {
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
        `Documento gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
        20,
        pageHeight - 15
      );
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, pageHeight - 15, { align: 'right' });
    }
  }

  private static async gerarRelatorio(plano: PlanoInspecao): Promise<jsPDF> {
    const doc = new jsPDF();

    await this.createHeader(doc, plano);

    let yPosition = 60;
    yPosition = this.createInfoSection(doc, plano, yPosition);
    yPosition = this.createCamposSection(doc, plano, yPosition);
    yPosition = this.createInstrucoesSection(doc, yPosition);

    this.createFooter(doc, plano);

    return doc;
  }

  static async downloadPDF(plano: PlanoInspecao) {
    try {
      console.log('Iniciando geração do PDF do plano de inspeção', plano.nome);
      const doc = await this.gerarRelatorio(plano);
      const fileName = `plano_inspecao_${plano.nome.replace(/\s+/g, '_')}_Rev${String(plano.versao).padStart(2, '0')}_${format(new Date(), 'yyyyMMdd', { locale: ptBR })}.pdf`;

      doc.save(fileName);
      console.log('PDF gerado com sucesso:', fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF do plano de inspeção:', error);
      throw error;
    }
  }
}
