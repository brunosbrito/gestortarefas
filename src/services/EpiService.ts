import api from '@/lib/axios';
import API_URL from '@/config';
import * as XLSX from 'xlsx';
import {
  EpiCatalogo,
  CreateEpiCatalogo,
  UpdateEpiCatalogo,
  EPI_TEMPLATE_HEADERS,
} from '@/interfaces/EpiInterface';

/**
 * Serviço para gerenciar EPIs / EPCs
 * Integrado com API backend
 */
class EpiServiceClass {
  private readonly baseUrl = `${API_URL}/epis`;

  // ==========================================
  // CRUD - API
  // ==========================================

  async list(): Promise<EpiCatalogo[]> {
    const response = await api.get<any[]>(this.baseUrl);
    return this.mapEpisResponse(response.data);
  }

  async listAtivos(): Promise<EpiCatalogo[]> {
    const response = await api.get<any[]>(`${this.baseUrl}/ativos`);
    return this.mapEpisResponse(response.data);
  }

  async getById(id: string): Promise<EpiCatalogo | null> {
    try {
      const response = await api.get<any>(`${this.baseUrl}/${id}`);
      return this.mapEpiResponse(response.data);
    } catch (error) {
      return null;
    }
  }

  async create(data: CreateEpiCatalogo): Promise<EpiCatalogo> {
    const response = await api.post<any>(this.baseUrl, data);
    return this.mapEpiResponse(response.data);
  }

  async update(data: UpdateEpiCatalogo): Promise<EpiCatalogo> {
    const { id, ...updateData } = data;
    const response = await api.put<any>(`${this.baseUrl}/${id}`, updateData);
    return this.mapEpiResponse(response.data);
  }

  async toggleAtivo(id: string): Promise<void> {
    await api.patch(`${this.baseUrl}/${id}/toggle-ativo`);
  }

  async deletePermanente(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async seed(): Promise<{ message: string; total: number }> {
    const response = await api.post<{ message: string; total: number }>(
      `${this.baseUrl}/seed`
    );
    return response.data;
  }

  /**
   * Reajusta os valores de referência em lote.
   */
  async reajustarPrecos(
    tipo: 'percentual' | 'fixo',
    valor: number,
    escopo: 'todos' | 'ativos'
  ): Promise<number> {
    const response = await api.post<number>(`${this.baseUrl}/reajustar`, {
      tipo,
      valor,
      escopo,
    });
    return response.data;
  }

  // ==========================================
  // HELPERS - MAPEAR RESPOSTA DA API
  // ==========================================

  private mapEpiResponse(epi: any): EpiCatalogo {
    return {
      ...epi,
      valorReferencia: Number(epi.valorReferencia),
      criadoEm: new Date(epi.createdAt || epi.criadoEm),
      atualizadoEm: new Date(epi.updatedAt || epi.atualizadoEm),
    };
  }

  private mapEpisResponse(epis: any[]): EpiCatalogo[] {
    return epis.map((e) => this.mapEpiResponse(e));
  }

  // ==========================================
  // EXPORTAR MODELO (.xlsx)
  // ==========================================

  exportarModelo(epis: EpiCatalogo[] = []): void {
    const wb = XLSX.utils.book_new();

    const linhas: any[] = [
      {
        'Descrição': 'LUVA DE VAQUETA MISTA CANO CURTO',
        'Unidade': 'par',
        'CA': '12345',
        'Fabricante': 'Fabricante Exemplo',
        'Valor Referência (R$)': 7.81,
      },
      ...epis.map((e) => ({
        'Descrição': e.descricao,
        'Unidade': e.unidade,
        'CA': e.ca,
        'Fabricante': e.fabricante || '',
        'Valor Referência (R$)': e.valorReferencia,
      })),
    ];

    const ws = XLSX.utils.json_to_sheet(linhas, { header: [...EPI_TEMPLATE_HEADERS] });

    ws['!cols'] = [
      { wch: 60 },
      { wch: 10 },
      { wch: 12 },
      { wch: 30 },
      { wch: 22 },
    ];

    const wsUnidades = XLSX.utils.aoa_to_sheet([
      ['Unidades válidas'],
      ['un'],
      ['par'],
      ['cx'],
      ['kg'],
      ['rolo'],
      ['kit'],
    ]);

    XLSX.utils.book_append_sheet(wb, ws, 'EPIs');
    XLSX.utils.book_append_sheet(wb, wsUnidades, 'Unidades');

    XLSX.writeFile(wb, 'modelo_epis.xlsx');
  }

  // ==========================================
  // IMPORTAR DE ARQUIVO .xlsx / .csv
  // ==========================================

  async lerArquivo(
    file: File
  ): Promise<{ validos: CreateEpiCatalogo[]; erros: string[] }> {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

    const validos: CreateEpiCatalogo[] = [];
    const erros: string[] = [];

    rows.forEach((row, i) => {
      const linhaN = i + 2;

      const descricao = String(row['Descrição'] || row['Descricao'] || row['descricao'] || '').trim();
      const unidade = String(row['Unidade'] || row['unidade'] || 'un').trim();
      const ca = String(row['CA'] || row['ca'] || '').trim();
      const fabricante = String(row['Fabricante'] || row['fabricante'] || '').trim();
      const valorRaw = row['Valor Referência (R$)'] ?? row['Valor'] ?? row['valor'] ?? 0;
      const valor = typeof valorRaw === 'number' ? valorRaw : parseFloat(String(valorRaw).replace(',', '.')) || 0;

      if (!descricao) {
        erros.push(`Linha ${linhaN}: Descrição obrigatória`);
        return;
      }
      if (valor < 0) {
        erros.push(`Linha ${linhaN}: Valor deve ser ≥ 0`);
        return;
      }

      validos.push({
        descricao,
        unidade: unidade || 'un',
        ca,
        fabricante: fabricante || undefined,
        valorReferencia: valor,
      });
    });

    return { validos, erros };
  }

  async importar(
    dados: CreateEpiCatalogo[],
    modo: 'acrescentar' | 'substituir' = 'acrescentar'
  ): Promise<number> {
    const response = await api.post<number>(`${this.baseUrl}/importar`, {
      dados,
      substituir: modo === 'substituir',
    });
    return response.data;
  }
}

export const EpiService = new EpiServiceClass();
