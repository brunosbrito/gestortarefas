import api from '@/lib/axios';
import API_URL from '@/config';
import type {
  MaterialCatalogoInterface,
  MaterialCatalogoCreateDTO,
  MaterialCatalogoUpdateDTO,
  MaterialCatalogoFiltros,
} from '@/interfaces/MaterialCatalogoInterface';

class MaterialCatalogoService {
  private baseURL = `${API_URL}/materiais-catalogo`;
  private STORAGE_KEY = 'materiais-catalogo-local';
  private useLocalStorage = false; // Será ativado se API não estiver disponível

  // Helper: Carregar do localStorage
  private getFromStorage(): MaterialCatalogoInterface[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Helper: Salvar no localStorage
  private saveToStorage(materiais: MaterialCatalogoInterface[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(materiais));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }

  // Listar todos os materiais (com filtros opcionais)
  async listar(filtros?: MaterialCatalogoFiltros): Promise<MaterialCatalogoInterface[]> {
    // Se localStorage está ativado, usar local
    if (this.useLocalStorage) {
      console.log('📦 Usando localStorage (backend indisponível)');
      let materiais = this.getFromStorage();

      // Aplicar filtros
      if (filtros?.ativo !== undefined) {
        materiais = materiais.filter((m) => m.ativo === filtros.ativo);
      }
      if (filtros?.categoria) {
        materiais = materiais.filter((m) => m.categoria === filtros.categoria);
      }
      if (filtros?.fornecedor) {
        materiais = materiais.filter((m) => m.fornecedor === filtros.fornecedor);
      }
      if (filtros?.busca) {
        const busca = filtros.busca.toLowerCase();
        materiais = materiais.filter(
          (m) =>
            m.codigo.toLowerCase().includes(busca) ||
            m.descricao.toLowerCase().includes(busca)
        );
      }

      return materiais;
    }

    try {
      const params = new URLSearchParams();

      if (filtros?.busca) params.append('busca', filtros.busca);
      if (filtros?.categoria) params.append('categoria', filtros.categoria);
      if (filtros?.fornecedor) params.append('fornecedor', filtros.fornecedor);
      if (filtros?.ativo !== undefined) params.append('ativo', String(filtros.ativo));

      const response = await api.get<MaterialCatalogoInterface[]>(
        `${this.baseURL}${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error: any) {
      // Se API não disponível (404), ativar localStorage
      if (error.response?.status === 404) {
        console.warn('⚠️  API não disponível, usando localStorage');
        this.useLocalStorage = true;
        return this.listar(filtros); // Retry com localStorage
      }
      console.error('Erro ao listar materiais:', error);
      throw error;
    }
  }

  // Buscar material por ID
  async buscarPorId(id: number): Promise<MaterialCatalogoInterface> {
    // Se localStorage está ativado, usar local
    if (this.useLocalStorage) {
      const materiais = this.getFromStorage();
      const material = materiais.find((m) => m.id === id);
      if (!material) throw new Error(`Material ${id} não encontrado`);
      return material;
    }

    try {
      const response = await api.get<MaterialCatalogoInterface>(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        this.useLocalStorage = true;
        return this.buscarPorId(id);
      }
      console.error(`Erro ao buscar material ${id}:`, error);
      throw error;
    }
  }

  // Criar novo material
  async criar(data: MaterialCatalogoCreateDTO): Promise<MaterialCatalogoInterface> {
    // Se localStorage está ativado, usar local
    if (this.useLocalStorage) {
      const materiais = this.getFromStorage();

      // Gerar ID único: pegar o maior ID existente e incrementar
      const maiorId = materiais.length > 0
        ? Math.max(...materiais.map(m => m.id || 0))
        : 0;
      const novoId = maiorId + 1;

      const novoMaterial: MaterialCatalogoInterface = {
        ...data,
        id: novoId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      materiais.push(novoMaterial);
      this.saveToStorage(materiais);
      console.log(`✓ Material ${novoMaterial.codigo} salvo no localStorage (ID: ${novoId})`);
      return novoMaterial;
    }

    try {
      const response = await api.post<MaterialCatalogoInterface>(this.baseURL, data);
      return response.data;
    } catch (error: any) {
      // Se API não disponível (404), ativar localStorage
      if (error.response?.status === 404) {
        console.warn('⚠️  API não disponível, usando localStorage');
        this.useLocalStorage = true;
        return this.criar(data); // Retry com localStorage
      }
      console.error('Erro ao criar material:', error);
      throw error;
    }
  }

  // Atualizar material existente
  async atualizar(id: number, data: MaterialCatalogoUpdateDTO): Promise<MaterialCatalogoInterface> {
    // Se localStorage está ativado, usar local
    if (this.useLocalStorage) {
      const materiais = this.getFromStorage();
      const index = materiais.findIndex((m) => m.id === id);
      if (index === -1) throw new Error(`Material ${id} não encontrado`);

      materiais[index] = {
        ...materiais[index],
        ...data,
        updatedAt: new Date(),
      };
      this.saveToStorage(materiais);
      return materiais[index];
    }

    try {
      const response = await api.put<MaterialCatalogoInterface>(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        this.useLocalStorage = true;
        return this.atualizar(id, data);
      }
      console.error(`Erro ao atualizar material ${id}:`, error);
      throw error;
    }
  }

  // Excluir material
  async excluir(id: number): Promise<void> {
    // Se localStorage está ativado, usar local
    if (this.useLocalStorage) {
      const materiais = this.getFromStorage();
      const filtered = materiais.filter((m) => m.id !== id);
      this.saveToStorage(filtered);
      return;
    }

    try {
      await api.delete(`${this.baseURL}/${id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        this.useLocalStorage = true;
        return this.excluir(id);
      }
      console.error(`Erro ao excluir material ${id}:`, error);
      throw error;
    }
  }

  // Popular materiais iniciais (Gerdau, Açotel, Ciser)
  async popularMateriais(materiais: MaterialCatalogoCreateDTO[]): Promise<{ sucesso: number; erro: number }> {
    console.log(`🔄 Populando ${materiais.length} materiais...`);

    let sucesso = 0;
    let erro = 0;

    for (let i = 0; i < materiais.length; i++) {
      const material = materiais[i];
      try {
        console.log(`[${i + 1}/${materiais.length}] Criando ${material.codigo}...`);
        await this.criar(material);
        console.log(`   ✓ ${material.codigo} criado`);
        sucesso++;
      } catch (err: any) {
        console.error(`   ✗ Erro ao criar ${material.codigo}:`, err.response?.data || err.message);
        erro++;
      }
    }

    console.log(`\n✅ Finalizado: ${sucesso} sucessos, ${erro} erros`);
    return { sucesso, erro };
  }

  // Buscar materiais por categoria
  async buscarPorCategoria(categoria: string): Promise<MaterialCatalogoInterface[]> {
    try {
      const response = await api.get<MaterialCatalogoInterface[]>(
        `${this.baseURL}/categoria/${categoria}`
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar materiais da categoria ${categoria}:`, error);
      throw error;
    }
  }

  // Buscar materiais por fornecedor
  async buscarPorFornecedor(fornecedor: string): Promise<MaterialCatalogoInterface[]> {
    try {
      const response = await api.get<MaterialCatalogoInterface[]>(
        `${this.baseURL}/fornecedor/${fornecedor}`
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar materiais do fornecedor ${fornecedor}:`, error);
      throw error;
    }
  }

  // Calcular preço de chapa customizada
  calcularPrecoChapa(params: {
    larguraMm: number;
    comprimentoMm: number;
    espessuraMm: number;
    pesoM2: number;
    precoKg: number;
  }): { areM2: number; pesoTotal: number; precoTotal: number } {
    const { larguraMm, comprimentoMm, espessuraMm, pesoM2, precoKg } = params;

    // Calcular área em m²
    const areaM2 = (larguraMm / 1000) * (comprimentoMm / 1000);

    // Calcular peso total (kg)
    const pesoTotal = areaM2 * pesoM2;

    // Calcular preço total
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
