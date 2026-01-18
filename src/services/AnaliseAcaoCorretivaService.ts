import API_URL from '@/config';
import { AnaliseAcaoCorretiva, AcaoCorretiva } from '@/interfaces/QualidadeInterfaces';
import axios from 'axios';

const BASE_URL = `${API_URL}/analises-acoes-corretivas`;

// Mock data storage
const mockAnalises: AnaliseAcaoCorretiva[] = [];
let nextId = 1;

class AnaliseAcaoCorretivaService {
  // TODO: Alterar para false quando backend estiver pronto
  private useMock = true;

  // ============================================
  // ANÁLISES
  // ============================================

  async create(data: Partial<AnaliseAcaoCorretiva>) {
    if (this.useMock) {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));

      const novaAnalise: AnaliseAcaoCorretiva = {
        id: String(nextId++),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as AnaliseAcaoCorretiva;

      mockAnalises.push(novaAnalise);
      console.log('✅ Mock: Análise criada com sucesso', novaAnalise);
      return novaAnalise;
    }

    try {
      const response = await axios.post(BASE_URL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar análise e ação corretiva:', error);
      throw error;
    }
  }

  async getAll() {
    if (this.useMock) {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('✅ Mock: Retornando análises', mockAnalises);
      return mockAnalises;
    }

    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar análises e ações corretivas:', error);
      throw error;
    }
  }

  async getById(id: string) {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const analise = mockAnalises.find(a => a.id === id);
      if (!analise) throw new Error('Análise não encontrada');
      console.log('✅ Mock: Retornando análise por ID', analise);
      return analise;
    }

    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar análise e ação corretiva:', error);
      throw error;
    }
  }

  async getByRncId(rncId: string) {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const analises = mockAnalises.filter(a => a.rncId === rncId);
      console.log('✅ Mock: Retornando análises por RNC ID', analises);
      return analises;
    }

    try {
      const response = await axios.get(`${BASE_URL}/rnc/${rncId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar análise por RNC:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<AnaliseAcaoCorretiva>) {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockAnalises.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Análise não encontrada');

      mockAnalises[index] = {
        ...mockAnalises[index],
        ...data,
        updatedAt: new Date().toISOString(),
      } as AnaliseAcaoCorretiva;

      console.log('✅ Mock: Análise atualizada com sucesso', mockAnalises[index]);
      return mockAnalises[index];
    }

    try {
      const response = await axios.put(`${BASE_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar análise e ação corretiva:', error);
      throw error;
    }
  }

  async delete(id: string) {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockAnalises.findIndex(a => a.id === id);
      if (index !== -1) {
        mockAnalises.splice(index, 1);
        console.log('✅ Mock: Análise deletada com sucesso');
      }
      return;
    }

    try {
      const response = await axios.delete(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar análise e ação corretiva:', error);
      throw error;
    }
  }

  // ============================================
  // AÇÕES CORRETIVAS
  // ============================================

  async createAcao(analiseId: string, data: Partial<AcaoCorretiva>) {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const analise = mockAnalises.find(a => a.id === analiseId);
      if (!analise) throw new Error('Análise não encontrada');

      const novaAcao: AcaoCorretiva = {
        id: String(Date.now()),
        ...data,
        status: data.status || 'pendente',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as AcaoCorretiva;

      if (!analise.acoesCorretivas) {
        analise.acoesCorretivas = [];
      }
      analise.acoesCorretivas.push(novaAcao);

      console.log('✅ Mock: Ação corretiva criada com sucesso', novaAcao);
      return novaAcao;
    }

    try {
      const response = await axios.post(`${BASE_URL}/${analiseId}/acoes`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar ação corretiva:', error);
      throw error;
    }
  }

  async updateAcao(analiseId: string, acaoId: string, data: Partial<AcaoCorretiva>) {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const analise = mockAnalises.find(a => a.id === analiseId);
      if (!analise) throw new Error('Análise não encontrada');

      const acaoIndex = analise.acoesCorretivas?.findIndex(ac => ac.id === acaoId) ?? -1;
      if (acaoIndex === -1) throw new Error('Ação corretiva não encontrada');

      if (analise.acoesCorretivas) {
        analise.acoesCorretivas[acaoIndex] = {
          ...analise.acoesCorretivas[acaoIndex],
          ...data,
          updatedAt: new Date().toISOString(),
        };

        console.log('✅ Mock: Ação corretiva atualizada', analise.acoesCorretivas[acaoIndex]);
        return analise.acoesCorretivas[acaoIndex];
      }
    }

    try {
      const response = await axios.put(`${BASE_URL}/${analiseId}/acoes/${acaoId}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar ação corretiva:', error);
      throw error;
    }
  }

  async deleteAcao(analiseId: string, acaoId: string) {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const analise = mockAnalises.find(a => a.id === analiseId);
      if (!analise) throw new Error('Análise não encontrada');

      if (analise.acoesCorretivas) {
        const acaoIndex = analise.acoesCorretivas.findIndex(ac => ac.id === acaoId);
        if (acaoIndex !== -1) {
          analise.acoesCorretivas.splice(acaoIndex, 1);
          console.log('✅ Mock: Ação corretiva deletada com sucesso');
        }
      }
      return;
    }

    try {
      const response = await axios.delete(`${BASE_URL}/${analiseId}/acoes/${acaoId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar ação corretiva:', error);
      throw error;
    }
  }

  async updateStatusAcao(
    analiseId: string,
    acaoId: string,
    status: 'pendente' | 'em_andamento' | 'concluida' | 'verificada'
  ) {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const analise = mockAnalises.find(a => a.id === analiseId);
      if (!analise) throw new Error('Análise não encontrada');

      const acao = analise.acoesCorretivas?.find(ac => ac.id === acaoId);
      if (!acao) throw new Error('Ação corretiva não encontrada');

      acao.status = status;
      acao.updatedAt = new Date().toISOString();

      console.log('✅ Mock: Status da ação atualizado', acao);
      return acao;
    }

    try {
      const response = await axios.patch(`${BASE_URL}/${analiseId}/acoes/${acaoId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status da ação:', error);
      throw error;
    }
  }

  async marcarEficacia(analiseId: string, acaoId: string, eficaz: boolean, observacoes?: string) {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const analise = mockAnalises.find(a => a.id === analiseId);
      if (!analise) throw new Error('Análise não encontrada');

      const acao = analise.acoesCorretivas?.find(ac => ac.id === acaoId);
      if (!acao) throw new Error('Ação corretiva não encontrada');

      acao.eficaz = eficaz;
      if (observacoes) acao.observacoesEficacia = observacoes;
      acao.updatedAt = new Date().toISOString();

      console.log('✅ Mock: Eficácia da ação marcada', acao);
      return acao;
    }

    try {
      const response = await axios.patch(`${BASE_URL}/${analiseId}/acoes/${acaoId}/eficacia`, {
        eficaz,
        observacoes,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar eficácia da ação:', error);
      throw error;
    }
  }

  // ============================================
  // RELATÓRIOS E CONSULTAS
  // ============================================

  async getAcoesAtrasadas() {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const hoje = new Date().toISOString().split('T')[0];

      const acoesAtrasadas: AcaoCorretiva[] = [];
      mockAnalises.forEach(analise => {
        analise.acoesCorretivas?.forEach(acao => {
          if (acao.prazo && acao.prazo < hoje && acao.status !== 'concluida' && acao.status !== 'verificada') {
            acoesAtrasadas.push(acao);
          }
        });
      });

      console.log('✅ Mock: Retornando ações atrasadas', acoesAtrasadas);
      return acoesAtrasadas;
    }

    try {
      const response = await axios.get(`${BASE_URL}/acoes/atrasadas`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ações atrasadas:', error);
      throw error;
    }
  }

  async getAcoesPorStatus(status: string) {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const acoesPorStatus: AcaoCorretiva[] = [];
      mockAnalises.forEach(analise => {
        analise.acoesCorretivas?.forEach(acao => {
          if (acao.status === status) {
            acoesPorStatus.push(acao);
          }
        });
      });

      console.log(`✅ Mock: Retornando ações com status "${status}"`, acoesPorStatus);
      return acoesPorStatus;
    }

    try {
      const response = await axios.get(`${BASE_URL}/acoes/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ações por status:', error);
      throw error;
    }
  }

  async getTaxaEficacia() {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));

      let totalAcoes = 0;
      let acoesEficazes = 0;

      mockAnalises.forEach(analise => {
        analise.acoesCorretivas?.forEach(acao => {
          if (acao.status === 'verificada' && acao.eficaz !== undefined) {
            totalAcoes++;
            if (acao.eficaz) acoesEficazes++;
          }
        });
      });

      const taxaEficacia = totalAcoes > 0 ? (acoesEficazes / totalAcoes) * 100 : 0;

      const resultado = {
        totalAcoes,
        acoesEficazes,
        acoesIneficazes: totalAcoes - acoesEficazes,
        taxaEficacia: Math.round(taxaEficacia * 10) / 10,
      };

      console.log('✅ Mock: Retornando taxa de eficácia', resultado);
      return resultado;
    }

    try {
      const response = await axios.get(`${BASE_URL}/relatorios/taxa-eficacia`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar taxa de eficácia:', error);
      throw error;
    }
  }
}

export default new AnaliseAcaoCorretivaService();
