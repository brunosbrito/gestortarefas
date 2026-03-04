import * as pdfjsLib from 'pdfjs-dist';

// CDN worker — usar unpkg (espelha npm exatamente, funciona com qualquer versão)
// ⚠ NÃO usar new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url) com Vite+SWC
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

class PdfImportService {
  async extractText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pageText = textContent.items.map((item: any) => ('str' in item ? item.str : '')).join(' ');
      pages.push(`=== PÁGINA ${i} ===\n${pageText}`);
    }

    return pages.join('\n\n');
  }

  hasTextLayer(text: string): boolean {
    return text.trim().length > 100;
  }

  async getPageCount(file: File): Promise<number> {
    if (!file.size) throw new Error('Arquivo PDF vazio ou corrompido.');
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages;
  }

  // Renderiza uma página a partir de um pdf document já aberto (evita reabrir o arquivo)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async renderPageFromDoc(pdf: any, pageNum: number, scale: number): Promise<string> {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d')!;
    await page.render({ canvasContext: context, viewport }).promise;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    // Liberar recursos do canvas para não acumular memória
    canvas.width = 0;
    canvas.height = 0;
    return dataUrl.replace('data:image/jpeg;base64,', '');
  }

  async renderPageToBase64(file: File, pageNum: number, scale = 2.0): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    return this.renderPageFromDoc(pdf, pageNum, scale);
  }

  async renderMultiplePagesToBase64(file: File, pageNums: number[]): Promise<string[]> {
    const uniquePageNums = [...new Set(pageNums)];
    const results: string[] = [];

    // Abrir o PDF UMA ÚNICA VEZ — reutilizar em todas as páginas e tentativas de escala
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    for (const pageNum of uniquePageNums) {
      // Guarda de tamanho: reduzir scale se base64 > 3MB — reutiliza pdf já aberto
      let base64 = await this.renderPageFromDoc(pdf, pageNum, 2.0);
      if (base64.length > 3_000_000) {
        base64 = await this.renderPageFromDoc(pdf, pageNum, 1.5);
      }
      if (base64.length > 3_000_000) {
        base64 = await this.renderPageFromDoc(pdf, pageNum, 1.0);
      }
      results.push(base64);
    }

    // Limite total: ~15MB
    let total = results.reduce((sum, b64) => sum + b64.length, 0);
    while (total > 15_000_000 && results.length > 1) {
      const removed = results.pop()!;
      total -= removed.length;
    }

    return results;
  }
}

export const pdfImportService = new PdfImportService();
