/**
 * Service para gerenciamento de Consumíveis
 * Persistência via localStorage (mock até backend estar disponível)
 */

import * as XLSX from 'xlsx';
import {
  ConsumivelInterface,
  ConsumivelCreateDTO,
  ConsumivelUpdateDTO,
  ConsumivelFiltros,
  ConsumivelCategoria,
  GrupoABC,
} from '@/interfaces/ConsumivelInterface';

const STORAGE_KEY = 'comercial_consumiveis';

const TEMPLATE_HEADERS = [
  'Código',
  'Descrição',
  'Categoria',
  'Unidade',
  'Preço Unitário (R$)',
  'Fornecedor',
  'Grupo ABC',
  'Observações',
] as const;

// ==========================================
// Helpers de persistência
// ==========================================

function lerStorage(): ConsumivelInterface[] {
  try {
    const items: ConsumivelInterface[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // Migração: gases devem usar unidade 'cil'
    let houveMudanca = false;
    const migrados = items.map((item) => {
      if (item.categoria === ConsumivelCategoria.GASES && item.unidade !== 'cil') {
        houveMudanca = true;
        return { ...item, unidade: 'cil' };
      }
      return item;
    });
    if (houveMudanca) salvarStorage(migrados);
    return migrados;
  } catch {
    return [];
  }
}

function salvarStorage(items: ConsumivelInterface[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function proximoId(items: ConsumivelInterface[]): number {
  return items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
}

// ==========================================
// Service
// ==========================================

class ConsumivelService {
  /**
   * Lista todos os consumíveis (com filtros opcionais)
   */
  async getAll(filtros?: ConsumivelFiltros): Promise<ConsumivelInterface[]> {
    let resultado = lerStorage();

    if (filtros?.busca) {
      const b = filtros.busca.toLowerCase();
      resultado = resultado.filter(
        (c) => c.codigo.toLowerCase().includes(b) || c.descricao.toLowerCase().includes(b)
      );
    }
    if (filtros?.categoria) {
      resultado = resultado.filter((c) => c.categoria === filtros.categoria);
    }
    if (filtros?.fornecedor) {
      resultado = resultado.filter((c) => c.fornecedor === filtros.fornecedor);
    }
    if (filtros?.grupoABC) {
      resultado = resultado.filter((c) => c.grupoABC === filtros.grupoABC);
    }
    if (filtros?.ativo !== undefined) {
      resultado = resultado.filter((c) => c.ativo === filtros.ativo);
    }

    return resultado;
  }

  /**
   * Busca consumível por ID
   */
  async getById(id: number): Promise<ConsumivelInterface> {
    const item = lerStorage().find((c) => c.id === id);
    if (!item) throw new Error(`Consumível #${id} não encontrado`);
    return item;
  }

  /**
   * Cria novo consumível
   */
  async create(data: ConsumivelCreateDTO): Promise<ConsumivelInterface> {
    const items = lerStorage();
    const novo: ConsumivelInterface = {
      ...data,
      id: proximoId(items),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    salvarStorage([...items, novo]);
    return novo;
  }

  /**
   * Atualiza consumível existente
   */
  async update(data: ConsumivelUpdateDTO): Promise<ConsumivelInterface> {
    const items = lerStorage();
    const idx = items.findIndex((c) => c.id === data.id);
    if (idx === -1) throw new Error(`Consumível #${data.id} não encontrado`);
    const { id, ...campos } = data;
    const atualizado: ConsumivelInterface = {
      ...items[idx],
      ...campos,
      updatedAt: new Date(),
    };
    items[idx] = atualizado;
    salvarStorage(items);
    return atualizado;
  }

  /**
   * Exclui consumível
   */
  async delete(id: number): Promise<void> {
    salvarStorage(lerStorage().filter((c) => c.id !== id));
  }

  /**
   * Ativa/desativa consumível
   */
  async toggleAtivo(id: number, ativo: boolean): Promise<ConsumivelInterface> {
    return this.update({ id, ativo });
  }

  // ==========================================
  // EXPORTAR MODELO (.xlsx)
  // ==========================================

  exportarModelo(consumiveis: ConsumivelInterface[] = []): void {
    const wb = XLSX.utils.book_new();

    const linhas: any[] = [
      {
        'Código': 'LIXA-80',
        'Descrição': 'LIXA FOLHA GRÃO 80',
        'Categoria': 'lixas',
        'Unidade': 'un',
        'Preço Unitário (R$)': 1.50,
        'Fornecedor': 'Nacional',
        'Grupo ABC': 'C',
        'Observações': '',
      },
      ...consumiveis.map((c) => ({
        'Código': c.codigo,
        'Descrição': c.descricao,
        'Categoria': c.categoria,
        'Unidade': c.unidade,
        'Preço Unitário (R$)': c.precoUnitario,
        'Fornecedor': c.fornecedor,
        'Grupo ABC': c.grupoABC || '',
        'Observações': c.observacoes || '',
      })),
    ];

    const ws = XLSX.utils.json_to_sheet(linhas, { header: [...TEMPLATE_HEADERS] });
    ws['!cols'] = [
      { wch: 16 }, // Código
      { wch: 50 }, // Descrição
      { wch: 14 }, // Categoria
      { wch: 8 },  // Unidade
      { wch: 22 }, // Preço
      { wch: 22 }, // Fornecedor
      { wch: 12 }, // Grupo ABC
      { wch: 40 }, // Observações
    ];

    const wsCategorias = XLSX.utils.aoa_to_sheet([
      ['Categorias válidas'],
      ['lixas'],
      ['discos'],
      ['abrasivos'],
      ['eletrodos'],
      ['solda'],
      ['gases'],
      ['acessorios'],
      ['epi'],
      ['ferramentas'],
      ['outros'],
    ]);

    const wsGrupos = XLSX.utils.aoa_to_sheet([
      ['Grupos ABC válidos'],
      ['A — alta prioridade (80% do valor)'],
      ['B — média prioridade (15% do valor)'],
      ['C — baixa prioridade (5% do valor)'],
    ]);

    XLSX.utils.book_append_sheet(wb, ws, 'Consumíveis');
    XLSX.utils.book_append_sheet(wb, wsCategorias, 'Categorias');
    XLSX.utils.book_append_sheet(wb, wsGrupos, 'GrupoABC');

    XLSX.writeFile(wb, 'modelo_consumiveis.xlsx');
  }

  // ==========================================
  // IMPORTAR DE ARQUIVO .xlsx / .csv
  // ==========================================

  async lerArquivo(
    file: File
  ): Promise<{ validos: ConsumivelCreateDTO[]; erros: string[] }> {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

    const validos: ConsumivelCreateDTO[] = [];
    const erros: string[] = [];
    const categoriasValidas = Object.values(ConsumivelCategoria) as string[];
    const gruposValidos = Object.values(GrupoABC) as string[];

    rows.forEach((row, i) => {
      const linhaN = i + 2;

      const codigo = String(row['Código'] || row['Codigo'] || row['codigo'] || '').trim();
      const descricao = String(row['Descrição'] || row['Descricao'] || row['descricao'] || '').trim();
      const categoria = String(row['Categoria'] || row['categoria'] || '').trim().toLowerCase();
      const unidade = String(row['Unidade'] || row['unidade'] || 'un').trim();
      const precoRaw = row['Preço Unitário (R$)'] ?? row['Preco'] ?? row['preco'] ?? 0;
      const preco = typeof precoRaw === 'number' ? precoRaw : parseFloat(String(precoRaw).replace(',', '.')) || 0;
      const fornecedor = String(row['Fornecedor'] || row['fornecedor'] || '').trim();
      const grupoABC = String(row['Grupo ABC'] || row['grupoABC'] || row['grupo_abc'] || '').trim().toUpperCase();
      const observacoes = String(row['Observações'] || row['Observacoes'] || row['observacoes'] || '').trim();

      if (!codigo) { erros.push(`Linha ${linhaN}: Código obrigatório`); return; }
      if (!descricao) { erros.push(`Linha ${linhaN}: Descrição obrigatória`); return; }
      if (!categoriasValidas.includes(categoria)) {
        erros.push(`Linha ${linhaN}: Categoria "${categoria}" inválida (use: ${categoriasValidas.join(', ')})`);
        return;
      }
      if (preco < 0) { erros.push(`Linha ${linhaN}: Preço deve ser ≥ 0`); return; }
      if (grupoABC && !gruposValidos.includes(grupoABC)) {
        erros.push(`Linha ${linhaN}: Grupo ABC "${grupoABC}" inválido (use A, B ou C)`);
        return;
      }

      validos.push({
        codigo,
        descricao,
        categoria: categoria as ConsumivelCategoria,
        unidade: unidade || 'un',
        precoUnitario: preco,
        fornecedor,
        grupoABC: grupoABC ? (grupoABC as GrupoABC) : undefined,
        observacoes: observacoes || undefined,
        ativo: true,
      });
    });

    return { validos, erros };
  }

  async importar(
    dados: ConsumivelCreateDTO[],
    modo: 'acrescentar' | 'substituir' = 'acrescentar'
  ): Promise<number> {
    if (modo === 'substituir') {
      salvarStorage([]);
    }
    for (const d of dados) {
      await this.create(d);
    }
    return dados.length;
  }

  // ==========================================
  // REAJUSTE DE PREÇOS EM LOTE
  // ==========================================

  async reajustarPrecos(
    tipo: 'percentual' | 'fixo',
    valor: number,
    escopo: 'ativos' | 'todos',
    categoriaFiltro?: string
  ): Promise<number> {
    const filtros: ConsumivelFiltros = {};
    if (escopo === 'ativos') filtros.ativo = true;
    const todos = await this.getAll(filtros);

    const alvos = categoriaFiltro
      ? todos.filter((c) => c.categoria === categoriaFiltro)
      : todos;

    for (const c of alvos) {
      const novoPreco =
        tipo === 'percentual'
          ? c.precoUnitario * (1 + valor / 100)
          : c.precoUnitario + valor;
      await this.update({
        id: c.id,
        precoUnitario: Math.max(0, Math.round(novoPreco * 100) / 100),
      });
    }
    return alvos.length;
  }
}

export default new ConsumivelService();
