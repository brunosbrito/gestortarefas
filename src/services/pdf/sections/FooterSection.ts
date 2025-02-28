
import { PdfContext, PdfSection } from '../types';
import { NonConformity } from '@/interfaces/RncInterface';

export class FooterSection implements PdfSection {
  async render(ctx: PdfContext, rnc: NonConformity): Promise<number> {
    const { doc, pageWidth, pageHeight, colors } = ctx;
    
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(colors.text);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    return pageHeight;
  }
}
