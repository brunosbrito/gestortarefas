
import jsPDF from 'jspdf';
import { NonConformity } from '@/interfaces/RncInterface';
import { PdfContext } from './pdf/types';
import { PDF_COLORS } from './pdf/constants';
import { HeaderSection } from './pdf/sections/HeaderSection';
import { InfoSection } from './pdf/sections/InfoSection';
import { DescriptionSection } from './pdf/sections/DescriptionSection';
import { ImagesSection } from './pdf/sections/ImagesSection';
import { SignatureSection } from './pdf/sections/SignatureSection';
import { FooterSection } from './pdf/sections/FooterSection';

class PdfService {
  static async generateRncPdf(rnc: NonConformity) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const context: PdfContext = {
      doc,
      pageWidth: doc.internal.pageSize.getWidth(),
      pageHeight: doc.internal.pageSize.getHeight(),
      margin: 20,
      colors: PDF_COLORS,
      yPos: 20
    };

    const sections = [
      new HeaderSection(),
      new InfoSection(),
      new DescriptionSection(),
      new ImagesSection(),
      new SignatureSection(),
      new FooterSection()
    ];

    for (const section of sections) {
      context.yPos = await section.render(context, rnc);
    }

    return doc;
  }
}

export default PdfService;
