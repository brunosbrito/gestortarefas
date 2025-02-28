
import { PdfContext, PdfSection } from '../types';
import { NonConformity } from '@/interfaces/RncInterface';

export class HeaderSection implements PdfSection {
  async render(ctx: PdfContext, rnc: NonConformity): Promise<number> {
    const { doc, pageWidth, margin, colors } = ctx;
    let yPos = 20;

    // Adicionar cabeçalho com bordas e cor de fundo
    doc.setFillColor(colors.lightBg);
    doc.setDrawColor(colors.border);
    doc.setLineWidth(0.5);
    doc.rect(margin, 10, pageWidth - 2 * margin, 25, 'FD');

    // Título do documento
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(colors.primary);
    doc.text('REGISTRO DE NÃO CONFORMIDADE', pageWidth / 2, 25, { align: 'center' });
    
    // Linha separadora
    doc.setDrawColor(colors.secondary);
    doc.setLineWidth(1);
    doc.line(margin, yPos + 10, pageWidth - margin, yPos + 10);
    
    return yPos + 25;
  }
}
