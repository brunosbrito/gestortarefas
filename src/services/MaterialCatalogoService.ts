import api from '@/lib/axios';
import API_URL from '@/config';
import type {
  MaterialCatalogoInterface,
  MaterialCatalogoCreateDTO,
  MaterialCatalogoUpdateDTO,
  MaterialCatalogoFiltros,
} from '@/interfaces/MaterialCatalogoInterface';

/**
 * Serializa dimensoes e propriedades em especificacao JSON para envio à API
 */
function serializarParaAPI(data: MaterialCatalogoCreateDTO): Record<string, any> {
  const { dimensoes, propriedades, ...rest } = data;
  const especificacao: Record<string, any> = {};
  if (dimensoes) especificacao.dimensoes = dimensoes;
  if (propriedades) especificacao.propriedades = propriedades;

  return {
    ...rest,
    especificacao: Object.keys(especificacao).length > 0 ? JSON.stringify(especificacao) : undefined,
  };
}

/**
 * Deserializa especificacao JSON da API de volta para dimensoes/propriedades
 */
function deserializarDaAPI(material: any): MaterialCatalogoInterface {
  let dimensoes: MaterialCatalogoInterface['dimensoes'] = {};
  let propriedades: MaterialCatalogoInterface['propriedades'] = undefined;

  if (material.especificacao) {
    try {
      const parsed = typeof material.especificacao === 'string'
        ? JSON.parse(material.especificacao)
        : material.especificacao;
      if (parsed.dimensoes) dimensoes = parsed.dimensoes;
      if (parsed.propriedades) propriedades = parsed.propriedades;
    } catch {
      // especificacao não é JSON válido, ignorar
    }
  }

  return {
    ...material,
    dimensoes,
    propriedades,
  };
}

class MaterialCatalogoService {
  private baseURL = `${API_URL}/materiais-catalogo`;

  // Listar todos os materiais (com filtros opcionais)
  async listar(filtros?: MaterialCatalogoFiltros): Promise<MaterialCatalogoInterface[]> {
    const params = new URLSearchParams();

    if (filtros?.busca) params.append('busca', filtros.busca);
    if (filtros?.categoria) params.append('categoria', filtros.categoria);
    if (filtros?.fornecedor) params.append('fornecedor', filtros.fornecedor);
    if (filtros?.ativo !== undefined) params.append('ativo', String(filtros.ativo));

    const response = await api.get<any[]>(
      `${this.baseURL}${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data.map(deserializarDaAPI);
  }

  // Buscar material por ID
  async buscarPorId(id: number): Promise<MaterialCatalogoInterface> {
    const response = await api.get<any>(`${this.baseURL}/${id}`);
    return deserializarDaAPI(response.data);
  }

  // Criar novo material
  async criar(data: MaterialCatalogoCreateDTO): Promise<MaterialCatalogoInterface> {
    const payload = serializarParaAPI(data);
    const response = await api.post<any>(this.baseURL, payload);
    return deserializarDaAPI(response.data);
  }

  // Atualizar material existente
  async atualizar(id: number, data: MaterialCatalogoUpdateDTO): Promise<MaterialCatalogoInterface> {
    const { dimensoes, propriedades, ...rest } = data;
    const especificacao: Record<string, any> = {};
    if (dimensoes) especificacao.dimensoes = dimensoes;
    if (propriedades) especificacao.propriedades = propriedades;

    const payload = {
      ...rest,
      ...(Object.keys(especificacao).length > 0
        ? { especificacao: JSON.stringify(especificacao) }
        : {}),
    };

    const response = await api.put<any>(`${this.baseURL}/${id}`, payload);
    return deserializarDaAPI(response.data);
  }

  // Excluir material
  async excluir(id: number): Promise<void> {
    await api.delete(`${this.baseURL}/${id}`);
  }

  // Popular materiais em lote (bulk seed)
  async popularMateriaisBulk(materiais: MaterialCatalogoCreateDTO[]): Promise<{ criados: number; erros: number }> {
    const payload = materiais.map(serializarParaAPI);
    const response = await api.post<{ criados: number; erros: number }>(
      `${this.baseURL}/seed/bulk`,
      payload
    );
    return response.data;
  }

  // Popular materiais individualmente (fallback)
  async popularMateriais(materiais: MaterialCatalogoCreateDTO[]): Promise<{ sucesso: number; erro: number }> {
    let sucesso = 0;
    let erro = 0;

    for (const material of materiais) {
      try {
        await this.criar(material);
        sucesso++;
      } catch {
        erro++;
      }
    }

    return { sucesso, erro };
  }

  // Buscar materiais por categoria
  async buscarPorCategoria(categoria: string): Promise<MaterialCatalogoInterface[]> {
    const response = await api.get<any[]>(`${this.baseURL}/categoria/${categoria}`);
    return response.data.map(deserializarDaAPI);
  }

  // Buscar materiais por fornecedor
  async buscarPorFornecedor(fornecedor: string): Promise<MaterialCatalogoInterface[]> {
    const response = await api.get<any[]>(`${this.baseURL}/fornecedor/${fornecedor}`);
    return response.data.map(deserializarDaAPI);
  }

  // Calcular preço de chapa customizada
  calcularPrecoChapa(params: {
    larguraMm: number;
    comprimentoMm: number;
    espessuraMm: number;
    pesoM2: number;
    precoKg: number;
  }): { areM2: number; pesoTotal: number; precoTotal: number } {
    const { larguraMm, comprimentoMm, pesoM2, precoKg } = params;
    const areaM2 = (larguraMm / 1000) * (comprimentoMm / 1000);
    const pesoTotal = areaM2 * pesoM2;
    const precoTotal = pesoTotal * precoKg;

    return {
      areM2: Math.round(areaM2 * 100) / 100,
      pesoTotal: Math.round(pesoTotal * 100) / 100,
      precoTotal: Math.round(precoTotal * 100) / 100,
    };
  }

  // Calcular preço de telha por comprimento
  calcularPrecoTelha(comprimentoM: number, precoML: number, quantidade: number = 1): {
    precoPorPeca: number;
    precoTotal: number;
  } {
    const precoPorPeca = comprimentoM * precoML;
    const precoTotal = precoPorPeca * quantidade;

    return {
      precoPorPeca: Math.round(precoPorPeca * 100) / 100,
      precoTotal: Math.round(precoTotal * 100) / 100,
    };
  }
}

export default new MaterialCatalogoService();
