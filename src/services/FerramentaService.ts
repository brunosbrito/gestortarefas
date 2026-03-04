import api from '@/lib/axios';
import API_URL from '@/config';

export enum TipoFerramenta {
  MANUAL = 'manual',
  ELETRICA = 'eletrica',
  PNEUMATICA = 'pneumatica',
  MEDICAO = 'medicao',
  SOLDAGEM = 'soldagem',
  CORTE = 'corte',
  ELEVACAO = 'elevacao',
}

export const TipoFerramentaLabels: Record<TipoFerramenta, string> = {
  [TipoFerramenta.MANUAL]: 'Manual',
  [TipoFerramenta.ELETRICA]: 'Elétrica',
  [TipoFerramenta.PNEUMATICA]: 'Pneumática',
  [TipoFerramenta.MEDICAO]: 'Medição',
  [TipoFerramenta.SOLDAGEM]: 'Soldagem',
  [TipoFerramenta.CORTE]: 'Corte',
  [TipoFerramenta.ELEVACAO]: 'Elevação',
};

export interface FerramentaInterface {
  id: number;
  codigo: string;
  descricao: string;
  tipo: TipoFerramenta;
  valorAquisicao: number;
  vidaUtilMeses: number;
  custoMensal: number;
  custoDiario: number;
  fabricante?: string;
  modelo?: string;
  potencia?: string;
  observacoes?: string;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FerramentaCreateDTO {
  codigo: string;
  descricao: string;
  tipo: TipoFerramenta;
  valorAquisicao: number;
  vidaUtilMeses?: number;
  fabricante?: string;
  modelo?: string;
  potencia?: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface FerramentaFiltros {
  busca?: string;
  tipo?: TipoFerramenta;
  ativo?: boolean;
}

class FerramentaService {
  private baseURL = `${API_URL}/ferramentas`;

  async listar(filtros?: FerramentaFiltros): Promise<FerramentaInterface[]> {
    try {
      const params = new URLSearchParams();

      if (filtros?.busca) params.append('busca', filtros.busca);
      if (filtros?.tipo) params.append('tipo', filtros.tipo);
      if (filtros?.ativo !== undefined) params.append('ativo', String(filtros.ativo));

      const response = await api.get<FerramentaInterface[]>(
        `${this.baseURL}${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao listar ferramentas:', error);
      throw error;
    }
  }

  async buscarPorId(id: number): Promise<FerramentaInterface> {
    try {
      const response = await api.get<FerramentaInterface>(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar ferramenta ${id}:`, error);
      throw error;
    }
  }

  async buscarPorTipo(tipo: TipoFerramenta): Promise<FerramentaInterface[]> {
    try {
      const response = await api.get<FerramentaInterface[]>(`${this.baseURL}/tipo/${tipo}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar ferramentas do tipo ${tipo}:`, error);
      throw error;
    }
  }

  async criar(data: FerramentaCreateDTO): Promise<FerramentaInterface> {
    try {
      const response = await api.post<FerramentaInterface>(this.baseURL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar ferramenta:', error);
      throw error;
    }
  }

  async atualizar(id: number, data: Partial<FerramentaCreateDTO>): Promise<FerramentaInterface> {
    try {
      const response = await api.put<FerramentaInterface>(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar ferramenta ${id}:`, error);
      throw error;
    }
  }

  async excluir(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error(`Erro ao excluir ferramenta ${id}:`, error);
      throw error;
    }
  }

  async seed(): Promise<{ message: string; total: number }> {
    try {
      const response = await api.post<{ message: string; total: number }>(`${this.baseURL}/seed`);
      return response.data;
    } catch (error) {
      console.error('Erro ao popular ferramentas:', error);
      throw error;
    }
  }
}

export default new FerramentaService();
