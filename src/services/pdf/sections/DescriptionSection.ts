
import { PdfContext, PdfSection } from '../types';
import { NonConformity } from '@/interfaces/RncInterface';

export class DescriptionSection implements PdfSection {
  async render(ctx: PdfContext, rnc: NonConformity): Promise<number> {
    const { doc, pageWidth, margin, colors } = ctx;
    let yPos = ctx.yPos;

    doc.setFillColor(colors.lightBg);
    doc.setDrawColor(colors.border);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 40, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.primary);
    yPos += 7;
    doc.text('Descrição:', margin + 2, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.text);
    yPos += 7;
    const descriptionLines = doc.splitTextToSize(rnc.description, pageWidth - (2 * margin) - 4);
    doc.text(descriptionLines, margin + 2, yPos);

    return yPos + 45;
  }
}
