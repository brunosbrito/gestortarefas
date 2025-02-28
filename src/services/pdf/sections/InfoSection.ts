
import { PdfContext, PdfSection } from '../types';
import { NonConformity } from '@/interfaces/RncInterface';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export class InfoSection implements PdfSection {
  async render(ctx: PdfContext, rnc: NonConformity): Promise<number> {
    const { doc, pageWidth, margin, colors } = ctx;
    let yPos = ctx.yPos;

    const colWidth = (pageWidth - (3 * margin)) / 2;
    const startLeftCol = margin;
    const startRightCol = margin + colWidth + margin;
    
    // Coluna da esquerda
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colors.primary);
    doc.text('Informações da RNC:', startLeftCol, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(colors.text);
    yPos += 7;
    doc.text(`RNC #${rnc.id}`, startLeftCol, yPos);
    yPos += 7;
    doc.text(`Data: ${format(new Date(rnc.dateOccurrence), 'dd/MM/yyyy', { locale: ptBR })}`, startLeftCol, yPos);
    yPos += 7;
    doc.text(`Projeto: ${rnc.project.name}`, startLeftCol, yPos);

    // Coluna da direita
    let rightColY = yPos - 14;
    doc.text(`Ordem de Serviço: ${rnc.serviceOrder.description}`, startRightCol, rightColY);
    rightColY += 7;
    doc.text(`Responsável: ${rnc.responsibleRNC.name}`, startRightCol, rightColY);
    rightColY += 7;
    doc.text(`Identificado por: ${rnc.responsibleIdentification}`, startRightCol, rightColY);

    return yPos + 20;
  }
}
