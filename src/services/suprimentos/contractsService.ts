import API_URL from '@/config';
import axios from 'axios';
import {
  ContractSuprimentos,
  ContractDetails,
  ContractCreate,
  ValorPrevisto,
} from '@/interfaces/suprimentos/ContractInterface';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';

const URL = `${API_URL}/api/suprimentos/contratos`;
const USE_MOCK = true; // ⚠️ Backend será implementado depois

// Mock data
let mockContracts: ContractSuprimentos[] = [
  {
    id: 1,
    name: 'Contrato de Fornecimento de Aço',
    client: 'Construtora ABC Ltda',
    contractType: 'material',
    value: 500000,
    spent: 125000,
    progress: 25,
    status: 'Em Andamento',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    hasBudgetImport: true,
  },
  {
    id: 2,
    name: 'Contrato de Serviços de Montagem',
    client: 'Indústria XYZ S/A',
    contractType: 'service',
    value: 350000,
    spent: 280000,
    progress: 80,
    status: 'Finalizando',
    startDate: '2024-02-01',
    endDate: '2024-10-30',
    hasBudgetImport: true,
  },
  {
    id: 3,
    name: 'Contrato de Fornecimento de Concreto',
    client: 'Obras & Construções ME',
    contractType: 'material',
    value: 750000,
    spent: 0,
    progress: 0,
    status: 'Em Andamento',
    startDate: '2024-06-01',
    hasBudgetImport: false,
  },
];

let mockIdCounter = 4;

class ContractsService {
  // Get all contracts
  async getAll(): Promise<ApiResponse<{ contracts: ContractSuprimentos[] }>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: { contracts: mockContracts },
        success: true,
        message: 'Contratos carregados com sucesso (MOCK)',
      });
    }
    const response = await axios.get(URL);
    return response.data;
  }

  // Get contract by ID
  async getById(id: number): Promise<ApiResponse<ContractDetails>> {
    if (USE_MOCK) {
      const contract = mockContracts.find((c) => c.id === id);
      if (!contract) {
        throw new Error('Contrato não encontrado');
      }

      // Mock valores previstos
      const mockValoresPrevistos: ValorPrevisto[] = [
        {
          id: 1,
          contract_id: id,
          item: 'Item 1',
          servicos: 'Fornecimento de Material',
          unidade: 'TON',
          qtd_mensal: 10,
          duracao_meses: 12,
          preco_total: contract.value * 0.6,
          observacao: 'Item principal do contrato',
        },
        {
          id: 2,
          contract_id: id,
          item: 'Item 2',
          servicos: 'Serviços de Entrega',
          unidade: 'VIAGEM',
          qtd_mensal: 4,
          duracao_meses: 12,
          preco_total: contract.value * 0.4,
          observacao: 'Serviços complementares',
        },
      ];

      const contractDetails: ContractDetails = {
        ...contract,
        valores_previstos: mockValoresPrevistos,
        budget_items: [],
      };

      return Promise.resolve({
        data: contractDetails,
        success: true,
        message: 'Detalhes do contrato carregados (MOCK)',
      });
    }
    const response = await axios.get(`${URL}/${id}`);
    return response.data;
  }

  // Create new contract
  async create(contractData: ContractCreate, qqpFile: File): Promise<ApiResponse<ContractSuprimentos>> {
    if (USE_MOCK) {
      const newContract: ContractSuprimentos = {
        id: mockIdCounter++,
        name: contractData.name,
        client: contractData.client,
        contractType: contractData.contractType,
        value: 100000, // Mock value - normalmente extraído do arquivo
        spent: 0,
        progress: 0,
        status: 'Em Andamento',
        startDate: contractData.startDate,
        hasBudgetImport: true,
      };
      mockContracts.push(newContract);

      return Promise.resolve({
        data: newContract,
        success: true,
        message: 'Contrato criado com sucesso (MOCK)',
      });
    }

    const formData = new FormData();
    formData.append('name', contractData.name);
    formData.append('client', contractData.client);
    formData.append('contractType', contractData.contractType);
    formData.append('startDate', contractData.startDate);
    if (contractData.description) {
      formData.append('description', contractData.description);
    }
    formData.append('qqp_file', qqpFile);

    const response = await axios.post(URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // Update contract
  async update(id: number, contractData: Partial<ContractSuprimentos>): Promise<ApiResponse<ContractSuprimentos>> {
    if (USE_MOCK) {
      const index = mockContracts.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('Contrato não encontrado');
      }
      mockContracts[index] = { ...mockContracts[index], ...contractData };

      return Promise.resolve({
        data: mockContracts[index],
        success: true,
        message: 'Contrato atualizado com sucesso (MOCK)',
      });
    }
    const response = await axios.put(`${URL}/${id}`, contractData);
    return response.data;
  }

  // Delete contract
  async delete(id: number): Promise<ApiResponse<void>> {
    if (USE_MOCK) {
      const index = mockContracts.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('Contrato não encontrado');
      }
      mockContracts.splice(index, 1);

      return Promise.resolve({
        data: undefined as any,
        success: true,
        message: 'Contrato removido com sucesso (MOCK)',
      });
    }
    const response = await axios.delete(`${URL}/${id}`);
    return response.data;
  }

  // Get contract KPIs
  async getKPIs(): Promise<
    ApiResponse<{
      totalValue: number;
      totalSpent: number;
      avgProgress: number;
      activeContracts: number;
    }>
  > {
    if (USE_MOCK) {
      const activeContracts = mockContracts.filter((c) => c.status === 'Em Andamento').length;
      const totalValue = mockContracts.reduce((sum, c) => sum + c.value, 0);
      const totalSpent = mockContracts.reduce((sum, c) => sum + (c.spent || 0), 0);
      const avgProgress =
        mockContracts.length > 0
          ? mockContracts.reduce((sum, c) => sum + (c.progress || 0), 0) / mockContracts.length
          : 0;

      return Promise.resolve({
        data: {
          totalValue,
          totalSpent,
          avgProgress,
          activeContracts,
        },
        success: true,
        message: 'KPIs calculados (MOCK)',
      });
    }
    const response = await axios.get(`${URL}/kpis`);
    return response.data;
  }

  // Get contract realized value from validated NFs
  async getRealizedValue(
    id: number
  ): Promise<
    ApiResponse<{
      contract_id: number;
      contract_name: string;
      valor_original: number;
      valor_realizado: number;
      percentual_realizado: number;
      saldo_restante: number;
      total_nfs: number;
      nfs_validadas: number;
      nfs_pendentes: number;
      nfs: Array<{
        id: number;
        numero: string;
        nome_fornecedor: string;
        valor_total: number;
        status_processamento: string;
        data_emissao: string;
      }>;
    }>
  > {
    if (USE_MOCK) {
      const contract = mockContracts.find((c) => c.id === id);
      if (!contract) {
        throw new Error('Contrato não encontrado');
      }

      const valor_realizado = contract.spent || 0;
      const percentual_realizado = (valor_realizado / contract.value) * 100;
      const saldo_restante = contract.value - valor_realizado;

      return Promise.resolve({
        data: {
          contract_id: id,
          contract_name: contract.name,
          valor_original: contract.value,
          valor_realizado,
          percentual_realizado,
          saldo_restante,
          total_nfs: 5,
          nfs_validadas: 3,
          nfs_pendentes: 2,
          nfs: [
            {
              id: 1,
              numero: '12345',
              nome_fornecedor: 'Fornecedor A',
              valor_total: 50000,
              status_processamento: 'validado',
              data_emissao: '2024-03-15',
            },
            {
              id: 2,
              numero: '12346',
              nome_fornecedor: 'Fornecedor B',
              valor_total: 75000,
              status_processamento: 'validado',
              data_emissao: '2024-04-20',
            },
          ],
        },
        success: true,
        message: 'Valor realizado calculado (MOCK)',
      });
    }
    const response = await axios.get(`${API_URL}/api/suprimentos/nf/contract/${id}/realized-value`);
    return response.data;
  }

  // Update contract progress
  async updateProgress(id: number, progress: number): Promise<ApiResponse<ContractSuprimentos>> {
    return this.update(id, { progress });
  }
}

export default new ContractsService();
