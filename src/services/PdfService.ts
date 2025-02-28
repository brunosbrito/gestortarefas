import { jsPDF } from 'jspdf';
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
    const addText = (
      text: string,
      y: number,
      fontSize = 12,
      align: 'left' | 'center' = 'left'
    ) => {
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
    yPos = addText(
      `Data da Ocorrência: ${format(
        new Date(rnc.dateOccurrence),
        'dd/MM/yyyy',
        { locale: ptBR }
      )}`,
      yPos
    );
    yPos = addText(`Projeto: ''`, yPos);
    yPos = addText(`Ordem de Serviço: ${rnc.serviceOrder.description}`, yPos);
    yPos = addText(`Responsável: ${rnc.responsibleRNC}`, yPos);
    yPos = addText(`Identificado por: ${rnc.responsibleIdentification}`, yPos);
    yPos += 5;

    // Descrição
    yPos = addText('Descrição:', yPos);
    const descriptionLines = doc.splitTextToSize(
      rnc.description,
      pageWidth - 2 * margin
    );
    doc.text(descriptionLines, margin, yPos);
    yPos += descriptionLines.length * lineHeight + 10;

    // Mão de obra
    if (rnc.workforce && rnc.workforce.length > 0) {
      yPos = addText('Mão de Obra:', yPos);
      rnc.workforce.forEach((worker) => {
        yPos = addText(`- ${worker.name}`, yPos);
      });
      yPos += 5;
    }

    // Materiais
    if (rnc.materials && rnc.materials.length > 0) {
      yPos = addText('Materiais:', yPos);
      rnc.materials.forEach((material) => {
        yPos = addText(`- ${material.name}`, yPos);
      });
      yPos += 5;
    }

    // Verifica se há imagens antes de tentar adicioná-las
    if (
      rnc.images &&
      rnc.images.length > 0 &&
      rnc.images.some((img) => img.url)
    ) {
      try {
        // Adiciona uma nova página para as imagens
        doc.addPage();
        yPos = 20;

        yPos = addText('Imagens:', yPos, 14, 'center');
        yPos += 10;

        // Define o tamanho máximo para cada imagem
        const maxWidth = pageWidth - 2 * margin;
        const maxHeight = 80;

        // Carrega e adiciona cada imagem
        for (let i = 0; i < rnc.images.length; i++) {
          const image = rnc.images[i];

          // Verifica se a imagem tem URL
          if (!image.url) continue;

          console.log('Tentando adicionar imagem:', image.url);

          try {
            // Adiciona a imagem
            await new Promise((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = 'Anonymous';
              img.onload = () => {
                try {
                  doc.addImage(
                    img,
                    'JPEG',
                    margin,
                    yPos,
                    maxWidth,
                    maxHeight,
                    undefined,
                    'MEDIUM'
                  );
                  yPos += maxHeight + 10;

                  // Se não houver espaço suficiente para a próxima imagem, adiciona uma nova página
                  if (
                    yPos + maxHeight >
                    doc.internal.pageSize.getHeight() - margin
                  ) {
                    doc.addPage();
                    yPos = 20;
                  }
                  resolve(true);
                } catch (error) {
                  console.error('Erro ao adicionar imagem ao PDF:', error);
                  reject(error);
                }
              };
              img.onerror = (error) => {
                console.error('Erro ao carregar imagem:', error);
                reject(error);
              };
              img.src = image.url;
            });
          } catch (error) {
            console.error(`Erro ao processar imagem ${i + 1}:`, error);
            continue;
          }
        }
      } catch (error) {
        console.error('Erro ao processar seção de imagens:', error);
      }

      // Retorna para a última página para as assinaturas
      doc.addPage();
      yPos = doc.internal.pageSize.getHeight() - 60;
    } else {
      // Se não houver imagens, ajusta a posição para as assinaturas
      yPos = Math.min(yPos, doc.internal.pageSize.getHeight() - 60);
    }

    // Assinaturas
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);

    // Linha para assinatura do responsável
    doc.line(margin, yPos, pageWidth / 2 - 10, yPos);
    yPos += 5;
    doc.setFontSize(10);
    doc.text('Assinatura do Responsável', margin, yPos);

    // Linha para assinatura do líder
    doc.line(pageWidth / 2 + 10, yPos - 5, pageWidth - margin, yPos - 5);
    doc.text('Assinatura do Líder', pageWidth / 2 + 10, yPos);

    return doc;
  }
}

export default PdfService;
