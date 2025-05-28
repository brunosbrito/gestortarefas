import { PdfContext, PdfSection } from '../types';
import { NonConformity } from '@/interfaces/RncInterface';

export class ImagesSection implements PdfSection {
  async render(ctx: PdfContext, rnc: NonConformity): Promise<number> {
    if (!rnc.images?.length || !rnc.images.some(img => img.url)) {
      return ctx.yPos;
    }

    const { doc, pageWidth, pageHeight, margin, colors } = ctx;
    let yPos = 20;

    doc.addPage();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colors.primary);
    doc.text('Registros Fotográficos', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    const maxWidth = (pageWidth - (3 * margin)) / 2;
    const maxHeight = 70;
    let currentX = margin;
    let imagesInRow = 0;

    for (const image of rnc.images) {
      if (!image.url) continue;

      try {
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            try {
              doc.addImage(img, 'JPEG', currentX, yPos, maxWidth, maxHeight, undefined, 'MEDIUM');
              imagesInRow++;

              if (imagesInRow === 2) {
                currentX = margin;
                yPos += maxHeight + 10;
                imagesInRow = 0;
              } else {
                currentX = margin * 2 + maxWidth;
              }

              if (yPos + maxHeight > pageHeight - margin) {
                doc.addPage();
                yPos = 20;
                currentX = margin;
                imagesInRow = 0;
              }

              resolve(true);
            } catch (error) {
              console.error('Erro ao adicionar imagem ao PDF:', error);
              reject(error);
            }
          };
          img.onerror = reject;

          // Adiciona a base da URL se necessário
          img.src = image.url.startsWith('http')
            ? image.url
            : `https://api.gmxindustrial.com.br${image.url}`;
        });
      } catch (error) {
        console.error('Erro ao processar imagem:', error);
        continue;
      }
    }

    return yPos;
  }
}
