
import jsPDF from 'jspdf';
import { NonConformity } from '@/interfaces/RncInterface';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

class PdfService {
  static async generateRncPdf(rnc: NonConformity) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;
    const lineHeight = 7;
    const margin = 20;

    // Função helper para adicionar texto
    const addText = (text: string, y: number, fontSize = 12, align: 'left' | 'center' = 'left') => {
      doc.setFontSize(fontSize);
      if (align === 'center') {
        doc.text(text, pageWidth / 2, y, { align: 'center' });
      } else {
        doc.text(text, margin, y);
      }
      return y + lineHeight;
    };

    // Título
    yPos = addText('REGISTRO DE NÃO CONFORMIDADE', yPos, 16, 'center');
    yPos += 5;

    // Informações básicas
    doc.setFontSize(12);
    yPos = addText(`RNC #${rnc.id}`, yPos);
    yPos = addText(`Data da Ocorrência: ${format(new Date(rnc.dateOccurrence), 'dd/MM/yyyy', { locale: ptBR })}`, yPos);
    yPos = addText(`Projeto: ${rnc.project.name}`, yPos);
    yPos = addText(`Ordem de Serviço: ${rnc.serviceOrder.description}`, yPos);
    yPos = addText(`Responsável: ${rnc.responsibleRNC.name}`, yPos);
    yPos = addText(`Identificado por: ${rnc.responsibleIdentification}`, yPos);
    yPos += 5;

    // Descrição
    yPos = addText('Descrição:', yPos);
    const descriptionLines = doc.splitTextToSize(rnc.description, pageWidth - 2 * margin);
    doc.text(descriptionLines, margin, yPos);
    yPos += descriptionLines.length * lineHeight + 10;

    // Mão de obra
    if (rnc.workforce && rnc.workforce.length > 0) {
      yPos = addText('Mão de Obra:', yPos);
      rnc.workforce.forEach(worker => {
        yPos = addText(`- ${worker.name}`, yPos);
      });
      yPos += 5;
    }

    // Materiais
    if (rnc.materials && rnc.materials.length > 0) {
      yPos = addText('Materiais:', yPos);
      rnc.materials.forEach(material => {
        yPos = addText(`- ${material.name}`, yPos);
      });
      yPos += 5;
    }

    // Assinaturas
    yPos = doc.internal.pageSize.getHeight() - 60;
    
    // Linha para assinatura do responsável
    doc.line(margin, yPos, pageWidth/2 - 10, yPos);
    yPos += 5;
    doc.setFontSize(10);
    doc.text('Assinatura do Responsável', margin, yPos);
    
    // Linha para assinatura do líder
    doc.line(pageWidth/2 + 10, yPos - 5, pageWidth - margin, yPos - 5);
    doc.text('Assinatura do Líder', pageWidth/2 + 10, yPos);

    return doc;
  }
}

export default PdfService;
