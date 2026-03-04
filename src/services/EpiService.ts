import * as XLSX from 'xlsx';
import {
  EpiCatalogo,
  CreateEpiCatalogo,
  UpdateEpiCatalogo,
  EPI_TEMPLATE_HEADERS,
} from '@/interfaces/EpiInterface';

const STORAGE_KEY = 'gestortarefas_mock_epis';

class EpiServiceClass {
  // ==========================================
  // CRUD
  // ==========================================

  async list(): Promise<EpiCatalogo[]> {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const items = JSON.parse(stored);
    return items.map((e: any) => ({
      ...e,
      criadoEm: new Date(e.criadoEm),
      atualizadoEm: new Date(e.atualizadoEm),
    }));
  }

  async listAtivos(): Promise<EpiCatalogo[]> {
    const all = await this.list();
    return all.filter((e) => e.ativo);
  }

  async getById(id: string): Promise<EpiCatalogo | null> {
    const all = await this.list();
    return all.find((e) => e.id === id) || null;
  }

  async create(data: CreateEpiCatalogo): Promise<EpiCatalogo> {
    const all = await this.list();
    const novo: EpiCatalogo = {
      id: `epi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      descricao: data.descricao.trim(),
      nomeResumido: data.nomeResumido?.trim() || undefined,
      unidade: data.unidade,
      ca: data.ca.trim(),
      fabricante: data.fabricante?.trim() || undefined,
      valorReferencia: data.valorReferencia,
      ativo: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };
    all.push(novo);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return novo;
  }

  async update(data: UpdateEpiCatalogo): Promise<EpiCatalogo> {
    const all = await this.list();
    const idx = all.findIndex((e) => e.id === data.id);
    if (idx === -1) throw new Error('EPI não encontrado');
    const updated: EpiCatalogo = {
      ...all[idx],
      descricao: data.descricao?.trim() ?? all[idx].descricao,
      nomeResumido: data.nomeResumido !== undefined
        ? (data.nomeResumido.trim() || undefined)
        : all[idx].nomeResumido,
      unidade: data.unidade ?? all[idx].unidade,
      ca: data.ca?.trim() ?? all[idx].ca,
      fabricante: data.fabricante?.trim() ?? all[idx].fabricante,
      valorReferencia: data.valorReferencia ?? all[idx].valorReferencia,
      atualizadoEm: new Date(),
    };
    all[idx] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return updated;
  }

  async toggleAtivo(id: string): Promise<void> {
    const all = await this.list();
    const idx = all.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('EPI não encontrado');
    all[idx].ativo = !all[idx].ativo;
    all[idx].atualizadoEm = new Date();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  async deletePermanente(id: string): Promise<void> {
    const all = await this.list();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all.filter((e) => e.id !== id)));
  }

  /**
   * Reajusta os valores de referência em lote.
   * tipo 'percentual': aplica índice percentual (ex: 10 = +10%, -5 = -5%)
   * tipo 'fixo': soma/subtrai valor fixo (ex: 5.00 = +R$5,00)
   * escopo: 'todos' ou 'ativos'
   * Retorna o número de itens atualizados.
   */
  async reajustarPrecos(
    tipo: 'percentual' | 'fixo',
    valor: number,
    escopo: 'todos' | 'ativos'
  ): Promise<number> {
    const all = await this.list();
    let count = 0;
    const updated = all.map((e) => {
      if (escopo === 'ativos' && !e.ativo) return e;
      const novoValor =
        tipo === 'percentual'
          ? e.valorReferencia * (1 + valor / 100)
          : e.valorReferencia + valor;
      count++;
      return {
        ...e,
        valorReferencia: Math.max(0, Math.round(novoValor * 100) / 100),
        atualizadoEm: new Date(),
      };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return count;
  }

  // ==========================================
  // EXPORTAR MODELO (.xlsx)
  // ==========================================

  /**
   * Baixa uma planilha modelo vazia para preenchimento de EPIs.
   * Se passar EPIs existentes, a planilha virá pré-preenchida.
   */
  exportarModelo(epis: EpiCatalogo[] = []): void {
    const wb = XLSX.utils.book_new();

    // Linha de exemplo (comentada) + dados existentes
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

    // Largura das colunas
    ws['!cols'] = [
      { wch: 60 }, // Descrição
      { wch: 10 }, // Unidade
      { wch: 12 }, // CA
      { wch: 30 }, // Fabricante
      { wch: 22 }, // Valor
    ];

    // Aba de unidades válidas como referência
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

  /**
   * Lê um File (.xlsx ou .csv) e retorna uma lista de EPIs para pré-visualização.
   * Não persiste — o componente decide o que fazer com os dados.
   */
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
      const linhaN = i + 2; // +2 porque linha 1 = cabeçalho

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

  /**
   * Persiste uma lista de EPIs importados.
   * Modo 'substituir': apaga todos existentes antes.
   * Modo 'acrescentar': adiciona aos existentes (padrão).
   */
  async importar(
    dados: CreateEpiCatalogo[],
    modo: 'acrescentar' | 'substituir' = 'acrescentar'
  ): Promise<number> {
    if (modo === 'substituir') {
      localStorage.removeItem(STORAGE_KEY);
    }
    for (const d of dados) {
      await this.create(d);
    }
    return dados.length;
  }
}

export const EpiService = new EpiServiceClass();
