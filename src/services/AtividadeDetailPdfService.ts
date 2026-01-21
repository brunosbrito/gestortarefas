import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PDF_COLORS, ACTIVITY_PDF_DEFAULTS } from './pdf/constants';

class AtividadeDetailPdfService {
  private static doc: jsPDF;
  private static pageWidth: number;
  private static pageHeight: number;
  private static margin: number;
  private static yPos: number;

  static async generatePdf(atividade: AtividadeStatus) {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = ACTIVITY_PDF_DEFAULTS.margin;
    this.yPos = this.margin;

    // Draw header
    this.drawHeader(atividade);

    // Draw description section
    this.drawDescriptionSection(atividade);

    // Draw project info table
    this.drawProjectInfoSection(atividade);

    // Draw classification section
    this.drawClassificationSection(atividade);

    // Draw progress section (if applicable)
    if (typeof atividade.quantity === 'number' && atividade.quantity > 0) {
      this.drawProgressSection(atividade);
    }

    // Draw times section
    this.drawTimesSection(atividade);

    // Draw dates section
    this.drawDatesSection(atividade);

    // Draw team section
    if (atividade.collaborators && atividade.collaborators.length > 0) {
      this.drawTeamSection(atividade);
    }

    // Draw created by section
    this.drawCreatedBySection(atividade);

    // Draw observation section (if applicable)
    if (atividade.observation) {
      this.drawObservationSection(atividade);
    }

    // Draw images section (if applicable)
    if (atividade.images && atividade.images.length > 0) {
      await this.drawImagesSection(atividade);
    }

    // Add footer to all pages
    this.addFooterToAllPages();

    // Download
    const fileName = `atividade_${atividade.cod_sequencial}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    this.doc.save(fileName);

    return this.doc;
  }

  private static drawHeader(atividade: AtividadeStatus) {
    const headerHeight = 30;

    // Background cinza claro
    this.doc.setFillColor(224, 224, 224); // #E0E0E0
    this.doc.rect(0, 0, this.pageWidth, headerHeight, 'F');

    // Border
    this.doc.setDrawColor(176, 176, 176); // #B0B0B0
    this.doc.setLineWidth(0.5);
    this.doc.rect(0, 0, this.pageWidth, headerHeight, 'S');

    // Left side: Company name
    this.doc.setFontSize(13);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 51, 102); // #003366
    this.doc.text('GMX INDUSTRIAL', this.margin, 10);

    // Center: Title and status
    this.doc.setFontSize(ACTIVITY_PDF_DEFAULTS.fontSize.title);
    this.doc.text(`ATIVIDADE #${atividade.cod_sequencial}`, this.pageWidth / 2, 10, { align: 'center' });

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);
    this.doc.text(`Status: ${atividade.status}`, this.pageWidth / 2, 17, { align: 'center' });

    // Right side: Document info
    this.doc.setFontSize(9);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(`Doc: AT-${atividade.cod_sequencial}`, this.pageWidth - this.margin, 10, { align: 'right' });
    this.doc.text(`${format(new Date(), "dd/MM/yyyy", { locale: ptBR })}`, this.pageWidth - this.margin, 16, { align: 'right' });

    // Orange separator line
    this.doc.setDrawColor(255, 127, 14); // #FF7F0E
    this.doc.setLineWidth(1.2);
    this.doc.line(this.margin, headerHeight - 4, this.pageWidth - this.margin, headerHeight - 4);

    this.yPos = headerHeight + 4;
  }

  private static drawSectionTitle(title: string) {
    this.checkPageBreak(12);

    this.yPos += 2; // Espaço antes do título

    this.doc.setFontSize(ACTIVITY_PDF_DEFAULTS.fontSize.sectionHeader);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 51, 102); // #003366
    this.doc.text(title, this.margin, this.yPos);

    // Linha separadora
    this.doc.setDrawColor(0, 51, 102);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, this.yPos + 1, this.pageWidth - this.margin, this.yPos + 1);

    this.doc.setTextColor(0, 0, 0);
    this.yPos += 5;
  }

  private static drawDescriptionSection(atividade: AtividadeStatus) {
    this.drawSectionTitle('DESCRIÇÃO');

    const contentWidth = this.pageWidth - 2 * this.margin;
    const padding = 5;

    this.doc.setDrawColor(176, 176, 176);
    this.doc.setLineWidth(0.3);

    this.doc.setFontSize(ACTIVITY_PDF_DEFAULTS.fontSize.body + 1);
    this.doc.setFont('helvetica', 'normal');
    const descLines = this.doc.splitTextToSize(atividade.description, contentWidth - (padding * 2));
    const lineHeight = 5;
    const boxHeight = descLines.length * lineHeight + (padding * 2);

    this.checkPageBreak(boxHeight + 3);

    this.doc.rect(this.margin, this.yPos, contentWidth, boxHeight, 'S');

    let textY = this.yPos + padding + 1;
    descLines.forEach((line: string) => {
      this.doc.text(line, this.margin + padding, textY);
      textY += lineHeight;
    });

    this.yPos += boxHeight + ACTIVITY_PDF_DEFAULTS.sectionSpacing;
  }

  private static drawProjectInfoSection(atividade: AtividadeStatus) {
    const tableData = [
      ['Projeto/Obra', atividade.project.name || 'N/A', 'Cliente', atividade.project.client || 'N/A'],
      ['Endereço', atividade.project.address || 'N/A', 'Status', atividade.project.status || 'N/A'],
      ['Ordem de Serviço', `OS N° ${atividade.serviceOrder.serviceOrderNumber}`, '', ''],
    ];

    const contentWidth = this.pageWidth - 2 * this.margin;
    const labelWidth = ACTIVITY_PDF_DEFAULTS.tableStyle.labelWidth;
    const valueWidth = (contentWidth - 2 * labelWidth) / 2;

    autoTable(this.doc, {
      startY: this.yPos,
      body: tableData,
      theme: 'grid',
      margin: { left: this.margin, right: this.margin },
      tableWidth: contentWidth,
      styles: {
        fontSize: ACTIVITY_PDF_DEFAULTS.fontSize.body,
        cellPadding: ACTIVITY_PDF_DEFAULTS.tableStyle.cellPadding,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: labelWidth, fillColor: [240, 240, 240] },
        1: { cellWidth: valueWidth },
        2: { fontStyle: 'bold', cellWidth: labelWidth, fillColor: [240, 240, 240] },
        3: { cellWidth: valueWidth },
      },
    });

    this.yPos = (this.doc as any).lastAutoTable.finalY + ACTIVITY_PDF_DEFAULTS.sectionSpacing;
  }

  private static drawClassificationSection(atividade: AtividadeStatus) {
    const getMacroTaskName = () => {
      if (!atividade.macroTask) return 'N/A';
      if (typeof atividade.macroTask === 'string') return atividade.macroTask;
      return atividade.macroTask.name;
    };

    const getProcessName = () => {
      if (!atividade.process) return 'N/A';
      if (typeof atividade.process === 'string') return atividade.process;
      return atividade.process.name;
    };

    const contentWidth = this.pageWidth - 2 * this.margin;
    const labelWidth = ACTIVITY_PDF_DEFAULTS.tableStyle.labelWidth;
    const valueWidth = (contentWidth - 2 * labelWidth) / 2;

    autoTable(this.doc, {
      startY: this.yPos,
      body: [['Tarefa Macro', getMacroTaskName(), 'Processo', getProcessName()]],
      theme: 'grid',
      margin: { left: this.margin, right: this.margin },
      tableWidth: contentWidth,
      styles: {
        fontSize: ACTIVITY_PDF_DEFAULTS.fontSize.body,
        cellPadding: ACTIVITY_PDF_DEFAULTS.tableStyle.cellPadding,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: labelWidth, fillColor: [240, 240, 240] },
        1: { cellWidth: valueWidth },
        2: { fontStyle: 'bold', cellWidth: labelWidth, fillColor: [240, 240, 240] },
        3: { cellWidth: valueWidth },
      },
    });

    this.yPos = (this.doc as any).lastAutoTable.finalY + ACTIVITY_PDF_DEFAULTS.sectionSpacing;
  }

  private static drawProgressSection(atividade: AtividadeStatus) {
    const calculateProgress = () => {
      if (!atividade.quantity || !atividade.completedQuantity) return 0;
      const progress = (atividade.completedQuantity / atividade.quantity) * 100;
      return Math.min(Math.max(progress, 0), 100);
    };

    const progress = calculateProgress();
    const contentWidth = this.pageWidth - 2 * this.margin;
    const labelWidth = ACTIVITY_PDF_DEFAULTS.tableStyle.labelWidth;

    autoTable(this.doc, {
      startY: this.yPos,
      body: [['Progresso', `${progress.toFixed(0)}%  (${atividade.completedQuantity || 0}/${atividade.quantity} un)`]],
      theme: 'grid',
      margin: { left: this.margin, right: this.margin },
      tableWidth: contentWidth,
      styles: {
        fontSize: ACTIVITY_PDF_DEFAULTS.fontSize.body,
        cellPadding: ACTIVITY_PDF_DEFAULTS.tableStyle.cellPadding,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: labelWidth, fillColor: [240, 240, 240] },
        1: { cellWidth: contentWidth - labelWidth },
      },
    });

    this.yPos = (this.doc as any).lastAutoTable.finalY + ACTIVITY_PDF_DEFAULTS.sectionSpacing;
  }

  private static drawTimesSection(atividade: AtividadeStatus) {
    const formatEstimatedTime = (estimatedTime: string) => {
      if (!estimatedTime) return '00:00';
      const hoursMatch = estimatedTime.match(/(\d+)\s*h/);
      const minutesMatch = estimatedTime.match(/(\d+)\s*min/);
      const hours = hoursMatch ? hoursMatch[1] : '0';
      const minutes = minutesMatch ? minutesMatch[1] : '0';
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    };

    const formatTotalTime = (totalTime: number) => {
      if (!totalTime || totalTime <= 0) return '00:00';
      const hours = Math.floor(totalTime);
      const minutes = Math.round((totalTime - hours) * 60);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    const calculateCurrentWorkedTime = () => {
      let total = atividade.totalTime || 0;
      if (atividade.status === 'Em execução' && atividade.startDate) {
        const startDateTime = new Date(atividade.startDate);
        const now = new Date();
        const elapsedHours = (now.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
        total += elapsedHours;
      }
      return total;
    };

    const getTimePerUnit = () => {
      if (!atividade.timePerUnit) return 'N/A';
      return `${atividade.timePerUnit} ${atividade.unidadeTempo === 'minutos' ? 'min' : 'h'}`;
    };

    const isInProgress = atividade.status === 'Em execução';
    const workedTimeText = formatTotalTime(calculateCurrentWorkedTime()) + (isInProgress ? ' (em andamento)' : '');

    const contentWidth = this.pageWidth - 2 * this.margin;
    const labelWidth = ACTIVITY_PDF_DEFAULTS.tableStyle.labelWidth;
    // 3 labels + 3 values = contentWidth
    // labelWidth * 3 + value1 + value2 + value3 = contentWidth
    const totalLabelWidth = labelWidth * 3;
    const remainingWidth = contentWidth - totalLabelWidth;
    const value1Width = remainingWidth * 0.25;  // Tempo Previsto value
    const value2Width = remainingWidth * 0.45;  // Tempo Trabalhado value (maior para caber texto)
    const value3Width = remainingWidth * 0.30;  // Tempo/Unidade value

    autoTable(this.doc, {
      startY: this.yPos,
      body: [
        ['Tempo Previsto', formatEstimatedTime(atividade.estimatedTime), 'Tempo Trabalhado', workedTimeText, 'Tempo/Unidade', getTimePerUnit()],
      ],
      theme: 'grid',
      margin: { left: this.margin, right: this.margin },
      tableWidth: contentWidth,
      styles: {
        fontSize: ACTIVITY_PDF_DEFAULTS.fontSize.body,
        cellPadding: ACTIVITY_PDF_DEFAULTS.tableStyle.cellPadding,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: labelWidth, fillColor: [240, 240, 240] },
        1: { cellWidth: value1Width },
        2: { fontStyle: 'bold', cellWidth: labelWidth, fillColor: [240, 240, 240] },
        3: { cellWidth: value2Width },
        4: { fontStyle: 'bold', cellWidth: labelWidth, fillColor: [240, 240, 240] },
        5: { cellWidth: value3Width },
      },
    });

    this.yPos = (this.doc as any).lastAutoTable.finalY + ACTIVITY_PDF_DEFAULTS.sectionSpacing;
  }

  private static drawDatesSection(atividade: AtividadeStatus) {
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return 'N/A';
      try {
        return format(parseISO(dateStr), 'dd/MM/yyyy HH:mm', { locale: ptBR });
      } catch {
        return 'N/A';
      }
    };

    const row1 = ['Criação', formatDate(atividade.createdAt), 'Início', formatDate(atividade.startDate)];
    const row2Data: string[] = [];

    if (atividade.pauseDate) {
      row2Data.push('Paralisação', formatDate(atividade.pauseDate));
    }
    if (atividade.endDate) {
      row2Data.push('Conclusão', formatDate(atividade.endDate));
    }

    // Preencher com vazio se necessário
    while (row2Data.length < 4) {
      row2Data.push('', '');
    }

    const tableData = [row1];
    if (atividade.pauseDate || atividade.endDate) {
      tableData.push(row2Data);
    }

    const contentWidth = this.pageWidth - 2 * this.margin;
    const labelWidth = ACTIVITY_PDF_DEFAULTS.tableStyle.labelWidth;
    const valueWidth = (contentWidth - 2 * labelWidth) / 2;

    autoTable(this.doc, {
      startY: this.yPos,
      body: tableData,
      theme: 'grid',
      margin: { left: this.margin, right: this.margin },
      tableWidth: contentWidth,
      styles: {
        fontSize: ACTIVITY_PDF_DEFAULTS.fontSize.body,
        cellPadding: ACTIVITY_PDF_DEFAULTS.tableStyle.cellPadding,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: labelWidth, fillColor: [240, 240, 240] },
        1: { cellWidth: valueWidth },
        2: { fontStyle: 'bold', cellWidth: labelWidth, fillColor: [240, 240, 240] },
        3: { cellWidth: valueWidth },
      },
    });

    this.yPos = (this.doc as any).lastAutoTable.finalY + ACTIVITY_PDF_DEFAULTS.sectionSpacing;
  }

  private static drawTeamSection(atividade: AtividadeStatus) {
    const collaboratorsList = atividade.collaborators!.map((colaborador) => {
      const funcao = colaborador.funcao || colaborador.role || '';
      return funcao ? `${colaborador.name} (${funcao})` : colaborador.name;
    }).join(', ');

    const contentWidth = this.pageWidth - 2 * this.margin;
    const labelWidth = ACTIVITY_PDF_DEFAULTS.tableStyle.labelWidth;

    autoTable(this.doc, {
      startY: this.yPos,
      body: [['Equipe', collaboratorsList]],
      theme: 'grid',
      margin: { left: this.margin, right: this.margin },
      tableWidth: contentWidth,
      styles: {
        fontSize: ACTIVITY_PDF_DEFAULTS.fontSize.body,
        cellPadding: ACTIVITY_PDF_DEFAULTS.tableStyle.cellPadding,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: labelWidth, fillColor: [240, 240, 240] },
        1: { cellWidth: contentWidth - labelWidth },
      },
    });

    this.yPos = (this.doc as any).lastAutoTable.finalY + ACTIVITY_PDF_DEFAULTS.sectionSpacing;
  }

  private static drawCreatedBySection(atividade: AtividadeStatus) {
    const contentWidth = this.pageWidth - 2 * this.margin;
    const labelWidth = ACTIVITY_PDF_DEFAULTS.tableStyle.labelWidth;

    autoTable(this.doc, {
      startY: this.yPos,
      body: [['Criado por', atividade.createdBy.username]],
      theme: 'grid',
      margin: { left: this.margin, right: this.margin },
      tableWidth: contentWidth,
      styles: {
        fontSize: ACTIVITY_PDF_DEFAULTS.fontSize.body,
        cellPadding: ACTIVITY_PDF_DEFAULTS.tableStyle.cellPadding,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: labelWidth, fillColor: [240, 240, 240] },
        1: { cellWidth: contentWidth - labelWidth },
      },
    });

    this.yPos = (this.doc as any).lastAutoTable.finalY + ACTIVITY_PDF_DEFAULTS.sectionSpacing;
  }

  private static drawObservationSection(atividade: AtividadeStatus) {
    this.drawSectionTitle('OBSERVAÇÕES');

    const contentWidth = this.pageWidth - 2 * this.margin;
    const padding = 5;

    this.doc.setFontSize(ACTIVITY_PDF_DEFAULTS.fontSize.body + 1);
    this.doc.setFont('helvetica', 'normal');
    const obsLines = this.doc.splitTextToSize(atividade.observation!, contentWidth - (padding * 2));
    const lineHeight = 5;
    const boxHeight = obsLines.length * lineHeight + (padding * 2);

    this.checkPageBreak(boxHeight + 3);

    // Yellow background box
    this.doc.setFillColor(254, 249, 195); // #FEF9C3
    this.doc.setDrawColor(176, 176, 176);
    this.doc.setLineWidth(0.3);
    this.doc.rect(this.margin, this.yPos, contentWidth, boxHeight, 'FD');

    let textY = this.yPos + padding + 1;
    this.doc.setTextColor(0, 0, 0);
    obsLines.forEach((line: string) => {
      this.doc.text(line, this.margin + padding, textY);
      textY += lineHeight;
    });

    this.yPos += boxHeight + ACTIVITY_PDF_DEFAULTS.sectionSpacing;
  }

  private static async drawImagesSection(atividade: AtividadeStatus) {
    const imageCount = atividade.images!.length;
    const { maxWidth, maxHeight, imagesPerRow, spacing } = ACTIVITY_PDF_DEFAULTS.imageLayout;
    const contentWidth = this.pageWidth - 2 * this.margin;
    const imageWidth = (contentWidth - spacing * (imagesPerRow - 1)) / imagesPerRow;

    // Check if we need a new page for images
    if (this.yPos + maxHeight + 15 > this.pageHeight - 15) {
      this.doc.addPage();
      this.yPos = this.margin;
    }

    this.drawSectionTitle(`FOTOS (${imageCount})`);

    let currentX = this.margin;
    let imagesInRow = 0;

    for (const image of atividade.images!) {
      try {
        const imageUrl = image.imagePath.startsWith('http')
          ? image.imagePath
          : `https://api.gmxindustrial.com.br${image.imagePath}`;

        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            try {
              let width = img.width;
              let height = img.height;
              const targetWidth = Math.min(maxWidth, imageWidth - 2);
              const targetHeight = maxHeight;

              if (width > targetWidth) {
                height = (height * targetWidth) / width;
                width = targetWidth;
              }
              if (height > targetHeight) {
                width = (width * targetHeight) / height;
                height = targetHeight;
              }

              // Check if we need a new row
              if (imagesInRow >= imagesPerRow) {
                imagesInRow = 0;
                currentX = this.margin;
                this.yPos += maxHeight + 8;
              }

              // Check page break
              if (this.yPos + maxHeight + 10 > this.pageHeight - 15) {
                this.doc.addPage();
                this.yPos = this.margin;
                currentX = this.margin;
                imagesInRow = 0;
              }

              // Draw image border
              this.doc.setDrawColor(200, 200, 200);
              this.doc.setLineWidth(0.2);
              this.doc.rect(currentX, this.yPos, width, height, 'S');

              // Add image
              this.doc.addImage(img, 'JPEG', currentX, this.yPos, width, height);

              // Add description below image
              if (image.description) {
                this.doc.setFontSize(ACTIVITY_PDF_DEFAULTS.fontSize.small - 1);
                this.doc.setFont('helvetica', 'italic');
                this.doc.setTextColor(100, 100, 100);
                const descLines = this.doc.splitTextToSize(image.description, width);
                this.doc.text(descLines[0] || '', currentX, this.yPos + height + 3);
                this.doc.setTextColor(0, 0, 0);
              }

              currentX += imageWidth + spacing;
              imagesInRow++;
              resolve();
            } catch (error) {
              console.error('Erro ao adicionar imagem ao PDF:', error);
              resolve();
            }
          };
          img.onerror = () => {
            console.error('Erro ao carregar imagem:', imageUrl);
            resolve();
          };
          img.src = imageUrl;
        });
      } catch (error) {
        console.error('Erro ao processar imagem:', error);
        continue;
      }
    }

    if (imagesInRow > 0) {
      this.yPos += maxHeight + 8;
    }
  }

  private static addFooterToAllPages() {
    const totalPages = this.doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);

      // Footer text
      this.doc.setFontSize(ACTIVITY_PDF_DEFAULTS.fontSize.small);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(150, 150, 150);

      this.doc.text(
        'GMX Industrial',
        this.margin,
        this.pageHeight - 5
      );

      this.doc.text(
        `${i}/${totalPages}`,
        this.pageWidth - this.margin,
        this.pageHeight - 5,
        { align: 'right' }
      );
    }
  }

  private static checkPageBreak(requiredHeight: number): boolean {
    if (this.yPos + requiredHeight > this.pageHeight - 12) {
      this.doc.addPage();
      this.yPos = this.margin;
      return true;
    }
    return false;
  }
}

export default AtividadeDetailPdfService;
