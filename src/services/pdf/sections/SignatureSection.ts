
import { PdfContext, PdfSection } from '../types';
import { NonConformity } from '@/interfaces/RncInterface';

export class SignatureSection implements PdfSection {
  async render(ctx: PdfContext, rnc: NonConformity): Promise<number> {
    const { doc, pageWidth, pageHeight, margin, colors } = ctx;
    let yPos = pageHeight - 40;

    doc.setDrawColor(colors.border);
    doc.setLineWidth(0.5);
    
    // Linha para assinatura do responsável
    doc.line(margin, yPos, pageWidth/2 - 10, yPos);
    doc.setFontSize(10);
    doc.setTextColor(colors.text);
    doc.text('Assinatura do Responsável', margin, yPos + 5);
    
    // Linha para assinatura do líder
    doc.line(pageWidth/2 + 10, yPos, pageWidth - margin, yPos);
    doc.text('Assinatura do Líder', pageWidth/2 + 10, yPos + 5);

    return yPos;
  }
}
