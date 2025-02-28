
import jsPDF from 'jspdf';
import { NonConformity } from '@/interfaces/RncInterface';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

class PdfService {
  static async generateRncPdf(rnc: NonConformity) {
    // Criar documento PDF no formato A4
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Definição das cores
    const colors = {
      primary: '#003366',      // Azul escuro
      secondary: '#FF7F0E',    // Laranja
      warning: '#FFD700',      // Amarelo
      border: '#B0B0B0',       // Cinza concreto
      lightBg: '#E0E0E0',      // Cinza claro
      text: '#000000'          // Preto
    };

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = 20;

    // Função helper para adicionar texto
    const addText = (text: string, y: number, fontSize = 12, align: 'left' | 'center' = 'left', color = colors.text) => {
      doc.setFontSize(fontSize);
      doc.setTextColor(color);
      if (align === 'center') {
        doc.text(text, pageWidth / 2, y, { align: 'center' });
      } else {
        doc.text(text, margin, y);
      }
      return y + (fontSize / 3) + 2;
    };

    // Adicionar cabeçalho com bordas e cor de fundo
    doc.setFillColor(colors.lightBg);
    doc.setDrawColor(colors.border);
    doc.setLineWidth(0.5);
    doc.rect(margin, 10, pageWidth - 2 * margin, 25, 'FD'); // 'FD' preenche e desenha a borda

    // Título do documento
    doc.setFont('helvetica', 'bold');
    yPos = addText('REGISTRO DE NÃO CONFORMIDADE', 25, 16, 'center', colors.primary);
    
    // Linha separadora
    doc.setDrawColor(colors.secondary);
    doc.setLineWidth(1);
    doc.line(margin, yPos + 5, pageWidth - margin, yPos + 5);
    yPos += 15;

    // Informações básicas em duas colunas
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

    // Avança o yPos para depois das colunas
    yPos += 20;

    // Seção de Descrição com cor de fundo
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

    yPos += 45;

    // Seção de Mão de Obra e Materiais em colunas
    if ((rnc.workforce && rnc.workforce.length > 0) || (rnc.materials && rnc.materials.length > 0)) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.primary);
      
      if (rnc.workforce && rnc.workforce.length > 0) {
        doc.text('Mão de Obra:', startLeftCol, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.text);
        rnc.workforce.forEach(worker => {
          doc.text(`• ${worker.name}`, startLeftCol + 5, yPos);
          yPos += 6;
        });
      }

      let materialsY = yPos - (rnc.workforce?.length || 0) * 6;
      if (rnc.materials && rnc.materials.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.primary);
        doc.text('Materiais:', startRightCol, materialsY);
        materialsY += 7;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.text);
        rnc.materials.forEach(material => {
          doc.text(`• ${material.name}`, startRightCol + 5, materialsY);
          materialsY += 6;
        });
      }

      yPos = Math.max(yPos, materialsY) + 10;
    }

    // Verifica se há imagens antes de tentar adicioná-las
    if (rnc.images && rnc.images.length > 0 && rnc.images.some(img => img.url)) {
      try {
        doc.addPage();
        yPos = 20;
        
        // Título da seção de imagens
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(colors.primary);
        doc.text('Registros Fotográficos', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // Define o tamanho máximo para cada imagem
        const maxWidth = (pageWidth - (3 * margin)) / 2;
        const maxHeight = 70;

        let currentX = margin;
        let imagesInRow = 0;

        // Carrega e adiciona cada imagem
        for (let i = 0; i < rnc.images.length; i++) {
          const image = rnc.images[i];
          if (!image.url) continue;
          
          try {
            await new Promise((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = 'Anonymous';
              img.onload = () => {
                try {
                  doc.addImage(
                    img,
                    'JPEG',
                    currentX,
                    yPos,
                    maxWidth,
                    maxHeight,
                    undefined,
                    'MEDIUM'
                  );
                  
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
    }

    // Adiciona página final para assinaturas se necessário
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = pageHeight - 60;
    }

    // Seção de assinaturas
    yPos = pageHeight - 40;
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

    // Adiciona rodapé com número da página em todas as páginas
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

    return doc;
  }
}

export default PdfService;
