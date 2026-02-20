/**
 * Serviço de Importação de Lista de Corte
 * Suporta formatos: Excel (.xlsx, .xls), JSON (.json), CSV (.csv)
 */

import * as XLSX from 'xlsx';
import { PecaCorte, ListaCorteImportDTO } from '@/interfaces/ListaCorteInterface';

class ListaCorteImportService {
  /**
   * Importa lista de corte de arquivo Excel
   */
  async importarExcel(file: File): Promise<ListaCorteImportDTO> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);

    // Ler primeira aba
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    // Validar colunas obrigatórias
    const header = rows[0] as string[];
    this.validarColunas(header);

    // Parsear linhas
    const pecas: PecaCorte[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const peca: PecaCorte = {
        posicao: String(row[0] || ''),
        tag: String(row[1] || ''),
        fase: String(row[2] || ''),
        perfil: String(row[3] || ''),
        comprimento: Number(row[4]) || 0,
        quantidade: Number(row[5]) || 1,
        material: String(row[6] || ''),
        peso: Number(row[7]) || 0,
      };

      // Só adiciona se tiver comprimento e quantidade válidos
      if (peca.comprimento > 0 && peca.quantidade > 0) {
        pecas.push(peca);
      }
    }

    if (pecas.length === 0) {
      throw new Error('Nenhuma peça válida encontrada no arquivo');
    }

    return {
      pecas,
      projeto: this.extrairMetadado(workbook, 'projeto'),
      cliente: this.extrairMetadado(workbook, 'cliente'),
      obra: this.extrairMetadado(workbook, 'obra'),
    };
  }

  /**
   * Importa lista de corte de arquivo JSON
   */
  async importarJSON(file: File): Promise<ListaCorteImportDTO> {
    const text = await file.text();
    const data = JSON.parse(text);

    // Validar estrutura
    if (!data.pecas || !Array.isArray(data.pecas)) {
      throw new Error('JSON inválido: campo "pecas" é obrigatório e deve ser um array');
    }

    // Validar cada peça
    const pecasValidas: PecaCorte[] = [];
    for (const peca of data.pecas) {
      if (this.validarPeca(peca)) {
        pecasValidas.push({
          posicao: String(peca.posicao || ''),
          tag: String(peca.tag || ''),
          fase: String(peca.fase || ''),
          perfil: String(peca.perfil || ''),
          comprimento: Number(peca.comprimento),
          quantidade: Number(peca.quantidade),
          material: String(peca.material || ''),
          peso: Number(peca.peso || 0),
        });
      }
    }

    if (pecasValidas.length === 0) {
      throw new Error('Nenhuma peça válida encontrada no JSON');
    }

    return {
      pecas: pecasValidas,
      projeto: data.projeto,
      cliente: data.cliente,
      obra: data.obra,
    };
  }

  /**
   * Importa lista de corte de arquivo CSV
   */
  async importarCSV(file: File): Promise<ListaCorteImportDTO> {
    const text = await file.text();
    const lines = text.split('\n');

    if (lines.length < 2) {
      throw new Error('Arquivo CSV vazio ou inválido');
    }

    // Primeira linha = header
    const header = lines[0].split(',').map((h) => h.trim());
    this.validarColunas(header);

    const pecas: PecaCorte[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map((v) => v.trim());
      if (values.length < 8) continue;

      const peca: PecaCorte = {
        posicao: values[0] || '',
        tag: values[1] || '',
        fase: values[2] || '',
        perfil: values[3] || '',
        comprimento: Number(values[4]) || 0,
        quantidade: Number(values[5]) || 1,
        material: values[6] || '',
        peso: Number(values[7]) || 0,
      };

      if (peca.comprimento > 0 && peca.quantidade > 0) {
        pecas.push(peca);
      }
    }

    if (pecas.length === 0) {
      throw new Error('Nenhuma peça válida encontrada no CSV');
    }

    return { pecas };
  }

  /**
   * Valida se todas as colunas obrigatórias estão presentes
   */
  private validarColunas(header: string[]): void {
    const obrigatorias = [
      'posição',
      'tag',
      'fase',
      'perfil',
      'comprimento',
      'quantidade',
      'material',
      'peso',
    ];

    const headerLower = header.map((h) => h.toLowerCase());
    const missing = obrigatorias.filter(
      (col) =>
        !headerLower.some(
          (h) =>
            h.includes(col) ||
            (col === 'perfil' && h.includes('descrição'))
        )
    );

    if (missing.length > 0) {
      throw new Error(
        `Colunas obrigatórias faltando: ${missing.join(', ')}`
      );
    }
  }

  /**
   * Valida se uma peça tem os campos obrigatórios
   */
  private validarPeca(peca: any): boolean {
    return (
      peca &&
      typeof peca.comprimento === 'number' &&
      peca.comprimento > 0 &&
      typeof peca.quantidade === 'number' &&
      peca.quantidade > 0
    );
  }

  /**
   * Tenta extrair metadados do arquivo Excel
   */
  private extrairMetadado(
    workbook: XLSX.WorkBook,
    campo: string
  ): string | undefined {
    try {
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      // Procurar nas primeiras linhas por padrões como "Projeto:", "Cliente:", etc.
      for (let i = 0; i < 10; i++) {
        const cellA = firstSheet[`A${i}`];
        const cellB = firstSheet[`B${i}`];

        if (
          cellA &&
          cellA.v &&
          String(cellA.v).toLowerCase().includes(campo.toLowerCase())
        ) {
          return cellB ? String(cellB.v) : undefined;
        }
      }
    } catch {
      // Ignorar erros de extração
    }
    return undefined;
  }

  /**
   * Gera arquivo Excel de template para download
   */
  gerarTemplate(): Blob {
    const template = [
      [
        'Posição',
        'Tag',
        'Fase',
        'Descrição Perfil',
        'Comprimento (mm)',
        'Quantidade',
        'Material',
        'Peso (kg)',
      ],
      ['189', 'CE-17', 'F1', 'W200X35.9', '10186', '1', 'A572-50', '365.7'],
      ['190', 'CE-17', 'F1', 'L51X4.7', '2500', '4', 'A36', '47.0'],
      ['191', 'CE-18', 'F1', 'W200X35.9', '8250', '2', 'A572-50', '296.4'],
      ['192', 'CE-18', 'F2', 'L76X6.4', '3000', '8', 'A36', '172.8'],
      ['', '', '', '', '', '', '', ''],
      ['Projeto:', 'Galpão Industrial ABC', '', '', '', '', '', ''],
      ['Cliente:', 'Empresa XYZ Ltda', '', '', '', '', '', ''],
      ['Obra:', 'Galpão 5000m² - Fase 1', '', '', '', '', '', ''],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(template);

    // Definir largura das colunas
    worksheet['!cols'] = [
      { wch: 10 }, // Posição
      { wch: 12 }, // Tag
      { wch: 8 },  // Fase
      { wch: 20 }, // Perfil
      { wch: 18 }, // Comprimento
      { wch: 12 }, // Quantidade
      { wch: 12 }, // Material
      { wch: 12 }, // Peso
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Peças');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    return new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  /**
   * Gera arquivo JSON de template para download
   */
  gerarTemplateJSON(): Blob {
    const template = {
      projeto: 'Galpão Industrial ABC',
      cliente: 'Empresa XYZ Ltda',
      obra: 'Galpão 5000m² - Fase 1',
      pecas: [
        {
          posicao: '189',
          tag: 'CE-17',
          fase: 'F1',
          perfil: 'W200X35.9',
          comprimento: 10186,
          quantidade: 1,
          material: 'A572-50',
          peso: 365.7,
        },
        {
          posicao: '190',
          tag: 'CE-17',
          fase: 'F1',
          perfil: 'L51X4.7',
          comprimento: 2500,
          quantidade: 4,
          material: 'A36',
          peso: 47.0,
        },
      ],
    };

    const json = JSON.stringify(template, null, 2);
    return new Blob([json], { type: 'application/json' });
  }
}

export default new ListaCorteImportService();
