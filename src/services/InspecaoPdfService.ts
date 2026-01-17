import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Inspecao } from '@/interfaces/QualidadeInterfaces';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PDF_COLORS } from './pdf/constants';

export class InspecaoPdfService {
  private static getTipoLabel(tipo: string): string {
    const tipos: Record<string, string> = {
      recebimento: 'Recebimento de Material',
      em_processo: 'Em Processo (Fabricação)',
      final: 'Produto Final',
      auditoria: 'Auditoria Interna',
    };
    return tipos[tipo] || tipo;
  }

  private static getResultadoLabel(resultado: string): string {
    const resultados: Record<string, string> = {
      aprovado: 'APROVADO',
      aprovado_com_ressalvas: 'APROVADO COM RESSALVAS',
      reprovado: 'REPROVADO',
    };
    return resultados[resultado] || resultado;
  }

  private static async createHeader(doc: jsPDF, inspecao: Inspecao) {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Tentar carregar e adicionar logo GMX
    let logoAdded = false;
    try {
      // A logo deve estar em /public/logo-gmx.png
      // Dimensões recomendadas: 200x60px (proporção 3.33:1)
      const logoPath = '/logo-gmx.png';
      const img = new Image();
      img.src = logoPath;

      // Aguardar carregamento da imagem
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            // Adicionar logo no canto superior esquerdo
            // Tamanho: 40mm de largura x 12mm de altura
            doc.addImage(img, 'PNG', 20, 15, 40, 12);
            logoAdded = true;
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = () => reject(new Error('Logo não encontrada'));

        // Timeout de 2 segundos
        setTimeout(() => reject(new Error('Timeout ao carregar logo')), 2000);
      });
    } catch (error) {
      console.log('Logo não disponível, usando layout sem logo');
      logoAdded = false;
    }

    // Ajustar layout conforme disponibilidade da logo
    if (logoAdded) {
      // Com logo: texto à direita
      doc.setFontSize(18);
      doc.setTextColor(PDF_COLORS.primary);
      doc.text('GML ESTRUTURAS', 65, 20);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Sistema de Gestão da Qualidade', 65, 27);
    } else {
      // Sem logo: layout padrão
      doc.setFontSize(18);
      doc.setTextColor(PDF_COLORS.primary);
      doc.text('GML ESTRUTURAS', 20, 25);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Sistema de Gestão da Qualidade', 20, 32);
    }

    // Data de geração
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Gerado em: ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })} às ${format(new Date(), 'HH:mm:ss', { locale: ptBR })}`,
      20,
      42
    );

    // Linha decorativa após cabeçalho
    doc.setDrawColor(PDF_COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(20, 46, pageWidth - 20, 46);

    // Título do relatório
    let yPosition = 56;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE INSPEÇÃO DE QUALIDADE', 20, yPosition);

    yPosition += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Inspeção #${String(inspecao.codigo).padStart(4, '0')} - ${this.getTipoLabel(inspecao.tipo)}`, 20, yPosition);

    return yPosition + 10;
  }

  private static createInfoSection(doc: jsPDF, inspecao: Inspecao, startY: number) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('1. INFORMAÇÕES BÁSICAS', 20, startY);

    const infoData: any[][] = [
      ['Descrição', inspecao.descricao || '-'],
      ['Projeto/Obra', inspecao.project?.name || 'Não informado'],
      ['Inspetor Responsável', inspecao.inspetor?.name || 'Não informado'],
      ['Data da Inspeção', format(new Date(inspecao.dataInspecao), 'dd/MM/yyyy', { locale: ptBR })],
    ];

    if (inspecao.serviceOrder) {
      infoData.push(['Ordem de Serviço', inspecao.serviceOrder.description]);
    }

    if (inspecao.planoInspecao) {
      infoData.push(['Plano de Inspeção', inspecao.planoInspecao.nome]);
    }

    autoTable(doc, {
      startY: startY + 5,
      head: [],
      body: infoData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: {
          cellWidth: 50,
          fontStyle: 'bold',
          fillColor: [240, 240, 240],
        },
        1: {
          cellWidth: 140,
        },
      },
      margin: { left: 20, right: 20 },
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  private static createMaterialSection(doc: jsPDF, inspecao: Inspecao, startY: number) {
    if (!inspecao.material && !inspecao.lote && !inspecao.fornecedor) {
      return startY;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('2. MATERIAL/ITEM INSPECIONADO', 20, startY);

    const materialData: any[][] = [];

    if (inspecao.material) {
      materialData.push(['Material/Item', inspecao.material]);
    }
    if (inspecao.lote) {
      materialData.push(['Lote/Batch', inspecao.lote]);
    }
    if (inspecao.fornecedor) {
      materialData.push(['Fornecedor', inspecao.fornecedor]);
    }
    if (inspecao.quantidade) {
      materialData.push(['Quantidade', `${inspecao.quantidade} ${inspecao.unidade || ''}`]);
    }

    autoTable(doc, {
      startY: startY + 5,
      head: [],
      body: materialData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: {
          cellWidth: 50,
          fontStyle: 'bold',
          fillColor: [240, 240, 240],
        },
        1: {
          cellWidth: 140,
        },
      },
      margin: { left: 20, right: 20 },
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  private static createCamposSection(doc: jsPDF, inspecao: Inspecao, startY: number) {
    if (!inspecao.campos || inspecao.campos.length === 0) {
      return startY;
    }

    // Verificar se precisa de nova página
    const pageHeight = doc.internal.pageSize.getHeight();
    if (startY + 50 > pageHeight - 20) {
      doc.addPage();
      startY = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('3. CAMPOS/CRITÉRIOS INSPECIONADOS', 20, startY);

    const camposData = inspecao.campos.map((campo, index) => {
      const nome = campo.nome + (campo.observacao ? `\nObs: ${campo.observacao}` : '');
      const especificacao = campo.especificacao || '-';
      const especFull = campo.tolerancia
        ? `${especificacao}\nTol: ${campo.tolerancia}`
        : especificacao;
      const valor = campo.valor?.toString() || '-';
      const status = campo.conforme !== undefined
        ? (campo.conforme ? '✓ Conforme' : '✗ Não Conforme')
        : '-';

      return [
        (index + 1).toString(),
        nome,
        especFull,
        valor,
        status,
      ];
    });

    autoTable(doc, {
      startY: startY + 5,
      head: [['#', 'Campo/Critério', 'Especificação', 'Valor Medido', 'Status']],
      body: camposData,
      theme: 'grid',
      headStyles: {
        fillColor: PDF_COLORS.secondary,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: {
          cellWidth: 10,
          halign: 'center',
        },
        1: {
          cellWidth: 50,
        },
        2: {
          cellWidth: 45,
        },
        3: {
          cellWidth: 35,
          halign: 'center',
          fontStyle: 'bold',
        },
        4: {
          cellWidth: 30,
          halign: 'center',
          fontStyle: 'bold',
        },
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      margin: { left: 20, right: 20 },
      pageBreak: 'auto',
      showHead: 'everyPage',
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  private static createResultadoSection(doc: jsPDF, inspecao: Inspecao, startY: number) {
    // Verificar se precisa de nova página
    const pageHeight = doc.internal.pageSize.getHeight();
    if (startY + 40 > pageHeight - 20) {
      doc.addPage();
      startY = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_COLORS.primary);
    doc.text('4. RESULTADO DA INSPEÇÃO', 20, startY);

    // Box do resultado com cor baseada no status
    let borderColor: [number, number, number] = [0, 128, 0]; // verde
    let fillColor: [number, number, number] = [240, 255, 240]; // verde claro

    if (inspecao.resultado === 'aprovado_com_ressalvas') {
      borderColor = [255, 193, 7]; // amarelo
      fillColor = [255, 248, 225]; // amarelo claro
    } else if (inspecao.resultado === 'reprovado') {
      borderColor = [220, 53, 69]; // vermelho
      fillColor = [255, 240, 240]; // vermelho claro
    }

    // Desenhar box
    doc.setDrawColor(...borderColor);
    doc.setFillColor(...fillColor);
    doc.setLineWidth(0.5);
    const boxHeight = inspecao.ressalvas ? 50 : 20;
    doc.rect(20, startY + 5, 170, boxHeight, 'FD');

    // Status
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Status:', 25, startY + 13);

    doc.setFontSize(12);
    doc.setTextColor(...borderColor);
    doc.text(this.getResultadoLabel(inspecao.resultado), 45, startY + 13);

    // Ressalvas/Observações
    if (inspecao.ressalvas) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      const ressalvaTitle = inspecao.resultado === 'reprovado'
        ? 'Motivo da Reprovação:'
        : 'Ressalvas/Observações:';
      doc.text(ressalvaTitle, 25, startY + 22);

      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(inspecao.ressalvas, 160);
      doc.text(splitText, 25, startY + 28);
    }

    // RNC gerada
    if (inspecao.rncGeradaId) {
      const rncY = startY + boxHeight + 10;
      doc.setDrawColor(220, 53, 69);
      doc.setFillColor(255, 240, 240);
      doc.setLineWidth(0.5);
      doc.rect(20, rncY, 170, 15, 'FD');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 53, 69);
      doc.text('⚠ RNC GERADA AUTOMATICAMENTE', 25, rncY + 7);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Esta inspeção gerou um Registro de Não-Conformidade que deve ser tratado.', 25, rncY + 12);

      return rncY + 20;
    }

    return startY + boxHeight + 15;
  }

  private static createFooter(doc: jsPDF, inspecao: Inspecao) {
    const pageCount = doc.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Linha decorativa antes do rodapé
      doc.setDrawColor(PDF_COLORS.primary);
      doc.setLineWidth(0.5);
      doc.line(20, pageHeight - 22, pageWidth - 20, pageHeight - 22);

      // Texto do rodapé
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        'Este documento foi gerado eletronicamente pelo Sistema de Gestão da Qualidade - GML Estruturas',
        pageWidth / 2,
        pageHeight - 16,
        { align: 'center' }
      );

      doc.text(
        `Documento: INSP-${String(inspecao.codigo).padStart(4, '0')} | Emitido em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
        pageWidth / 2,
        pageHeight - 12,
        { align: 'center' }
      );

      // Numeração de página
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    }
  }

  static async gerarRelatorio(inspecao: Inspecao): Promise<jsPDF> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Cabeçalho
    let yPos = await this.createHeader(doc, inspecao);

    // Seção de informações básicas
    yPos = this.createInfoSection(doc, inspecao, yPos);

    // Seção de material
    yPos = this.createMaterialSection(doc, inspecao, yPos);

    // Seção de campos inspecionados
    yPos = this.createCamposSection(doc, inspecao, yPos);

    // Seção de resultado
    yPos = this.createResultadoSection(doc, inspecao, yPos);

    // Assinatura (se houver)
    if (inspecao.assinaturaInspetor) {
      const pageHeight = doc.internal.pageSize.getHeight();
      if (yPos + 40 > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(PDF_COLORS.primary);
      doc.text('5. ASSINATURA DO INSPETOR', 20, yPos);

      // Adicionar imagem da assinatura
      try {
        const img = new Image();
        img.src = inspecao.assinaturaInspetor;
        await new Promise((resolve) => {
          img.onload = () => {
            doc.addImage(img, 'PNG', 20, yPos + 5, 60, 20);
            resolve(true);
          };
          img.onerror = () => resolve(false);
        });

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('_'.repeat(50), 20, yPos + 30);
        doc.text(inspecao.inspetor?.name || '', 20, yPos + 35);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Inspetor Responsável', 20, yPos + 39);
      } catch (error) {
        console.error('Erro ao adicionar assinatura:', error);
      }
    }

    // Rodapé em todas as páginas
    this.createFooter(doc, inspecao);

    return doc;
  }

  static async downloadPDF(inspecao: Inspecao) {
    try {
      console.log('Iniciando geração do PDF da inspeção', inspecao.codigo);
      const doc = await this.gerarRelatorio(inspecao);
      const fileName = `inspecao_${String(inspecao.codigo).padStart(4, '0')}_${format(new Date(), 'yyyyMMdd', { locale: ptBR })}.pdf`;

      doc.save(fileName);
      console.log('PDF gerado com sucesso');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Erro na geração do PDF: ' + (error as Error).message);
    }
  }
}
