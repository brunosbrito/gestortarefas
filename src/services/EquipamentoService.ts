import API_URL from '@/config';
import { Equipamento, Calibracao } from '@/interfaces/QualidadeInterfaces';
import axios from 'axios';

// Mock data storage
const mockEquipamentos: Equipamento[] = [];
let nextId = 1;

class EquipamentoService {
  private baseURL = `${API_URL}/api/equipamentos`;
  // TODO: Alterar para false quando backend estiver pronto
  private useMock = true;

  // CRUD Equipamentos
  async create(data: Partial<Equipamento>): Promise<Equipamento> {
    if (this.useMock) {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));

      const novoEquipamento: Equipamento = {
        id: String(nextId++),
        ...data,
        ativo: data.ativo !== undefined ? data.ativo : true,
        calibracoes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Equipamento;

      mockEquipamentos.push(novoEquipamento);
      console.log('✅ Mock: Equipamento criado com sucesso', novoEquipamento);
      return novoEquipamento;
    }

    try {
      const response = await axios.post(this.baseURL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar equipamento:', error);
      throw error;
    }
  }

  async getAll(apenasAtivos?: boolean): Promise<Equipamento[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const equipamentos = apenasAtivos
        ? mockEquipamentos.filter(e => e.ativo)
        : mockEquipamentos;
      console.log('✅ Mock: Retornando equipamentos', equipamentos);
      return equipamentos;
    }

    try {
      const url = apenasAtivos ? `${this.baseURL}?ativo=true` : this.baseURL;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar equipamentos:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Equipamento> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const equipamento = mockEquipamentos.find(e => e.id === id);
      if (!equipamento) throw new Error('Equipamento não encontrado');
      console.log('✅ Mock: Retornando equipamento por ID', equipamento);
      return equipamento;
    }

    try {
      const response = await axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar equipamento:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<Equipamento>): Promise<Equipamento> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockEquipamentos.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Equipamento não encontrado');

      mockEquipamentos[index] = {
        ...mockEquipamentos[index],
        ...data,
        updatedAt: new Date().toISOString(),
      } as Equipamento;

      console.log('✅ Mock: Equipamento atualizado com sucesso', mockEquipamentos[index]);
      return mockEquipamentos[index];
    }

    try {
      const response = await axios.put(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockEquipamentos.findIndex(e => e.id === id);
      if (index !== -1) {
        mockEquipamentos.splice(index, 1);
        console.log('✅ Mock: Equipamento deletado com sucesso');
      }
      return;
    }

    try {
      await axios.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error('Erro ao deletar equipamento:', error);
      throw error;
    }
  }

  async toggleAtivo(id: string, ativo: boolean): Promise<Equipamento> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const index = mockEquipamentos.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Equipamento não encontrado');

      mockEquipamentos[index] = {
        ...mockEquipamentos[index],
        ativo,
        updatedAt: new Date().toISOString(),
      };

      console.log('✅ Mock: Status do equipamento alterado', mockEquipamentos[index]);
      return mockEquipamentos[index];
    }

    try {
      const response = await axios.patch(`${this.baseURL}/${id}/ativo`, { ativo });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status do equipamento:', error);
      throw error;
    }
  }

  // Calibrações
  async addCalibracao(equipamentoId: string, data: FormData): Promise<Calibracao> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 700));
      const equipamento = mockEquipamentos.find(e => e.id === equipamentoId);
      if (!equipamento) throw new Error('Equipamento não encontrado');

      const novaCalibracao: Calibracao = {
        id: String(Date.now()),
        equipamentoId,
        dataRealizacao: new Date().toISOString().split('T')[0],
        proximaCalibracao: '', // Será preenchido pelo form
        resultado: 'aprovado',
        certificado: '', // Mock não salva arquivo
        observacoes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!equipamento.calibracoes) {
        equipamento.calibracoes = [];
      }
      equipamento.calibracoes.push(novaCalibracao);

      console.log('✅ Mock: Calibração adicionada com sucesso', novaCalibracao);
      return novaCalibracao;
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/${equipamentoId}/calibracoes`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar calibração:', error);
      throw error;
    }
  }

  async getCalibracoes(equipamentoId: string): Promise<Calibracao[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const equipamento = mockEquipamentos.find(e => e.id === equipamentoId);
      if (!equipamento) throw new Error('Equipamento não encontrado');

      const calibracoes = equipamento.calibracoes || [];
      console.log('✅ Mock: Retornando calibrações', calibracoes);
      return calibracoes;
    }

    try {
      const response = await axios.get(`${this.baseURL}/${equipamentoId}/calibracoes`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar calibrações:', error);
      throw error;
    }
  }

  async deleteCalibracao(equipamentoId: string, calibracaoId: string): Promise<void> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const equipamento = mockEquipamentos.find(e => e.id === equipamentoId);
      if (!equipamento) throw new Error('Equipamento não encontrado');

      if (equipamento.calibracoes) {
        const index = equipamento.calibracoes.findIndex(c => c.id === calibracaoId);
        if (index !== -1) {
          equipamento.calibracoes.splice(index, 1);
          console.log('✅ Mock: Calibração deletada com sucesso');
        }
      }
      return;
    }

    try {
      await axios.delete(`${this.baseURL}/${equipamentoId}/calibracoes/${calibracaoId}`);
    } catch (error) {
      console.error('Erro ao deletar calibração:', error);
      throw error;
    }
  }

  // Queries específicas
  async getByStatus(status: 'em_dia' | 'proximo_vencimento' | 'vencido' | 'reprovado'): Promise<Equipamento[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const hoje = new Date();
      const em30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

      const equipamentos = mockEquipamentos.filter(e => {
        if (!e.calibracoes || e.calibracoes.length === 0) return false;

        const ultimaCalibracao = e.calibracoes[e.calibracoes.length - 1];
        if (!ultimaCalibracao.proximaCalibracao) return false;

        const proximaData = new Date(ultimaCalibracao.proximaCalibracao);

        switch (status) {
          case 'em_dia':
            return proximaData > em30Dias;
          case 'proximo_vencimento':
            return proximaData <= em30Dias && proximaData >= hoje;
          case 'vencido':
            return proximaData < hoje;
          case 'reprovado':
            return ultimaCalibracao.resultado === 'reprovado';
          default:
            return false;
        }
      });

      console.log(`✅ Mock: Retornando equipamentos com status "${status}"`, equipamentos);
      return equipamentos;
    }

    try {
      const response = await axios.get(`${this.baseURL}/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar equipamentos por status:', error);
      throw error;
    }
  }

  async getVencendoEm(dias: number): Promise<Equipamento[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const hoje = new Date();
      const dataLimite = new Date(hoje.getTime() + dias * 24 * 60 * 60 * 1000);

      const equipamentos = mockEquipamentos.filter(e => {
        if (!e.calibracoes || e.calibracoes.length === 0) return false;

        const ultimaCalibracao = e.calibracoes[e.calibracoes.length - 1];
        if (!ultimaCalibracao.proximaCalibracao) return false;

        const proximaData = new Date(ultimaCalibracao.proximaCalibracao);
        return proximaData <= dataLimite && proximaData >= hoje;
      });

      console.log(`✅ Mock: Retornando equipamentos vencendo em ${dias} dias`, equipamentos);
      return equipamentos;
    }

    try {
      const response = await axios.get(`${this.baseURL}/vencimento/${dias}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar equipamentos próximos do vencimento:', error);
      throw error;
    }
  }

  async getByObra(obraId: string): Promise<Equipamento[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const equipamentos = mockEquipamentos.filter(e => e.obraId === obraId);
      console.log('✅ Mock: Retornando equipamentos da obra', equipamentos);
      return equipamentos;
    }

    try {
      const response = await axios.get(`${this.baseURL}/obra/${obraId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar equipamentos da obra:', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    total: number;
    emDia: number;
    proximoVencimento: number;
    vencidos: number;
    reprovados: number;
  }> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const hoje = new Date();
      const em30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

      let emDia = 0;
      let proximoVencimento = 0;
      let vencidos = 0;
      let reprovados = 0;

      mockEquipamentos.forEach(e => {
        if (!e.calibracoes || e.calibracoes.length === 0) return;

        const ultimaCalibracao = e.calibracoes[e.calibracoes.length - 1];

        if (ultimaCalibracao.resultado === 'reprovado') {
          reprovados++;
          return;
        }

        if (!ultimaCalibracao.proximaCalibracao) return;

        const proximaData = new Date(ultimaCalibracao.proximaCalibracao);

        if (proximaData < hoje) {
          vencidos++;
        } else if (proximaData <= em30Dias) {
          proximoVencimento++;
        } else {
          emDia++;
        }
      });

      const stats = {
        total: mockEquipamentos.length,
        emDia,
        proximoVencimento,
        vencidos,
        reprovados,
      };

      console.log('✅ Mock: Retornando estatísticas', stats);
      return stats;
    }

    try {
      const response = await axios.get(`${this.baseURL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
}

export default new EquipamentoService();
