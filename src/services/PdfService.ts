
import { jsPDF } from 'jspdf';
import { NonConformity } from '@/interfaces/RncInterface';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

class PdfService {
  static async generateRncPdf(rnc: NonConformity) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    let yPos = 10;

    // Função para verificar se precisa de nova página
    const checkPageBreak = (requiredHeight: number) => {
      if (yPos + requiredHeight > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // Função para criar células da tabela com quebra de linha
    const createTableCell = (text: string, x: number, y: number, width: number, height: number, isHeader = false) => {
      doc.rect(x, y, width, height);
      doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
      doc.setFontSize(9);
      
      // Quebra de linha automática
      const lines = doc.splitTextToSize(text, width - 4);
      const lineHeight = 4;
      
      lines.forEach((line: string, index: number) => {
        doc.text(line, x + 2, y + 5 + (index * lineHeight));
      });
    };

    // Cabeçalho com data e número do relatório
    doc.setFontSize(10);
    doc.text(`Relatório ${format(new Date(rnc.dateOccurrence), 'dd/MM/yyyy', { locale: ptBR })} nº 1`, margin, yPos);
    
    // Botão "Revisar Relatório"
    doc.setFillColor(255, 0, 0);
    doc.rect(pageWidth - 50, yPos - 5, 30, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Revisar Relatório', pageWidth - 45, yPos + 2);
    
    // Reset cor do texto
    doc.setTextColor(0);
    yPos += 15;

    // Tabela do cabeçalho com logos
    const headerHeight = 25;
    doc.rect(margin, yPos, pageWidth - 2 * margin, headerHeight);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    doc.line(margin, yPos + headerHeight, pageWidth - margin, yPos + headerHeight);
    
    const logoWidth = (pageWidth - 2 * margin) / 3;
    doc.line(margin + logoWidth, yPos, margin + logoWidth, yPos + headerHeight);
    doc.line(margin + 2 * logoWidth, yPos, margin + 2 * logoWidth, yPos + headerHeight);

    yPos += headerHeight + 10;

    // Título RNC
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RNC - RELATÓRIO NÃO CONFORMIDADE', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Tabela de informações
    const infoTableData = [
      ['Obra', rnc.project?.name || 'KTM ENGENHARIA - VIADUTO METÁLICO - OBRA 101/221 - GOVERNADOR VALADARES'],
      ['Local', rnc.location || 'ESTRADA DE ACESSO LINHA TRONCO LT-RH 47'],
      ['Cliente', rnc.clientName || 'KTM ENGENHARIA'],
    ];

    const rightTableData = [
      ['Relatório nº', '1'],
      ['Data do relatório', format(new Date(rnc.dateOccurrence), 'dd/MM/yyyy', { locale: ptBR })],
      ['Dia da semana', format(new Date(rnc.dateOccurrence), 'EEEE', { locale: ptBR })],
      ['Contrato', rnc.contractNumber || '101-221'],
      ['Prazo contratual', rnc.contractDuration ? `${rnc.contractDuration} dias` : '78 dias'],
      ['Prazo decorrido', rnc.elapsedTime ? `${rnc.elapsedTime} dias` : '50 dias'],
      ['Prazo a vencer', rnc.remainingTime ? `${rnc.remainingTime} dias` : '28 dias'],
    ];

    // Desenhar tabela da esquerda
    const leftTableWidth = (pageWidth - 2 * margin) * 0.7;
    let tableY = yPos;
    infoTableData.forEach((row, index) => {
      const rowHeight = 7;
      createTableCell(row[0], margin, tableY, 30, rowHeight, true);
      createTableCell(row[1], margin + 30, tableY, leftTableWidth - 30, rowHeight);
      tableY += rowHeight;
    });

    // Desenhar tabela da direita
    const rightTableX = margin + leftTableWidth + 5;
    const rightTableWidth = (pageWidth - 2 * margin) * 0.3 - 5;
    tableY = yPos;
    rightTableData.forEach((row, index) => {
      const rowHeight = 7;
      createTableCell(row[0], rightTableX, tableY, rightTableWidth / 2, rowHeight, true);
      createTableCell(row[1], rightTableX + rightTableWidth / 2, tableY, rightTableWidth / 2, rowHeight);
      tableY += rowHeight;
    });

    yPos = tableY + 10;

    // Tabela de horário de trabalho
    checkPageBreak(20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Horário de trabalho', margin, yPos);
    yPos += 5;

    const workHoursData = [
      ['Entrada / Saída', rnc.workSchedule?.entryExit || '-'],
      ['Intervalo', rnc.workSchedule?.interval || '-'],
    ];

    workHoursData.forEach((row, index) => {
      const rowHeight = 7;
      createTableCell(row[0], margin, yPos, 80, rowHeight, true);
      createTableCell(row[1], margin + 80, yPos, 40, rowHeight);
      yPos += rowHeight;
    });

    yPos += 10;

    // Seção de Mão de obra
    if (rnc.workforce && rnc.workforce.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Mão de obra (${rnc.workforce.length})`, margin, yPos);
      yPos += 5;

      // Cabeçalho da tabela de mão de obra
      const workforceHeaders = ['Nome', 'Função', 'Entrada / Saída', 'Intervalo', 'Horas'];
      const workforceColWidths = [60, 50, 40, 30, 30];
      let currentX = margin;

      workforceHeaders.forEach((header, index) => {
        createTableCell(header, currentX, yPos, workforceColWidths[index], 7, true);
        currentX += workforceColWidths[index];
      });

      yPos += 7;

      // Dados da tabela de mão de obra
      rnc.workforce.forEach((worker) => {
        checkPageBreak(7);
        currentX = margin;
        workforceColWidths.forEach((width, index) => {
          let text = '';
          switch (index) {
            case 0:
              text = worker.name;
              break;
            case 1:
              text = 'Não informado';
              break;
            case 2:
              text = '07:30 - 17:30';
              break;
            case 3:
              text = '01:00';
              break;
            case 4:
              text = worker.hours || '09:00';
              break;
          }
          createTableCell(text, currentX, yPos, width, 7);
          currentX += width;
        });
        yPos += 7;
      });

      yPos += 10;
    }

    // Seção de Atividades
    checkPageBreak(20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Atividades (1)', margin, yPos);
    yPos += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const descriptionLines = doc.splitTextToSize(rnc.description, pageWidth - 2 * margin);
    
    descriptionLines.forEach((line: string, index: number) => {
      checkPageBreak(5);
      doc.text(line, margin, yPos);
      yPos += 5;
    });

    yPos += 10;

    // Seção de Ação Corretiva
    if (rnc.correctiveAction) {
      checkPageBreak(20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Ação Corretiva', margin, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const actionLines = doc.splitTextToSize(rnc.correctiveAction, pageWidth - 2 * margin);
      
      actionLines.forEach((line: string, index: number) => {
        checkPageBreak(5);
        doc.text(line, margin, yPos);
        yPos += 5;
      });

      if (rnc.responsibleAction) {
        yPos += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Responsável pela Ação:', margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(rnc.responsibleAction.name, margin + 40, yPos);
        yPos += 5;
      }

      if (rnc.dateConclusion) {
        doc.setFont('helvetica', 'bold');
        doc.text('Data de Conclusão:', margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(format(new Date(rnc.dateConclusion), 'dd/MM/yyyy', { locale: ptBR }), margin + 40, yPos);
        yPos += 5;
      }

      yPos += 10;
    }

    // Seção de Materiais
    if (rnc.materials && rnc.materials.length > 0) {
      checkPageBreak(20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Materiais (${rnc.materials.length})`, margin, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      rnc.materials.forEach((material) => {
        checkPageBreak(5);
        doc.text(`• ${material.material}`, margin, yPos);
        yPos += 5;
      });

      yPos += 10;
    }

    // Seção de Fotos
    if (rnc.images && rnc.images.length > 0) {
      checkPageBreak(20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Fotos (${rnc.images.length})`, margin, yPos);
      yPos += 10;

      for (const image of rnc.images) {
        checkPageBreak(70);

        try {
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
              try {
                doc.addImage(img, 'JPEG', margin, yPos, 80, 60);
                resolve(true);
              } catch (error) {
                console.error('Erro ao adicionar imagem ao PDF:', error);
                reject(error);
              }
            };
            img.onerror = reject;
            img.src = image.url;
          });

          yPos += 65;
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text('Legenda da foto', margin, yPos, { align: 'left' });
          yPos += 15;
        } catch (error) {
          console.error('Erro ao processar imagem:', error);
          continue;
        }
      }
    }

    return doc;
  }
}

export default PdfService;
