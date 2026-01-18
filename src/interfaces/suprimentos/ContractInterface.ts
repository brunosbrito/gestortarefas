// Core entity types - Unified between backend and frontend
export type ContractType = 'material' | 'service';
export type ContractStatus = 'Em Andamento' | 'Finalizando' | 'Concluído' | 'Pausado';

// Valor Previsto interface - dados extraídos do QQP_Cliente
export interface ValorPrevisto {
  id: number;
  contract_id: number;
  item: string;
  servicos: string;
  unidade?: string;
  qtd_mensal?: number;
  duracao_meses?: number;
  preco_total: number;
  observacao?: string;
  created_at?: string;
  updated_at?: string;
}

// Main Contract interface - Renomeado para evitar conflito com Contract de obras
// Compatible with backend ContractResponse
export interface ContractSuprimentos {
  id: number;
  name: string;
  client: string;
  contractType: ContractType;
  value: number;
  spent?: number;
  progress?: number;
  status: ContractStatus;
  startDate: string;
  endDate?: string;
  hasBudgetImport?: boolean;
}

// Contract Details interface - compatible with backend ContractDetailResponse
export interface ContractDetails extends ContractSuprimentos {
  valores_previstos: ValorPrevisto[];
  budget_items?: any[]; // For future use
}

// Contract creation interface - compatible with backend (arquivo Excel obrigatório)
export interface ContractCreate {
  name: string;
  client: string;
  contractType: ContractType;
  startDate: string;
  description?: string;
  // value e predictedBudget agora são extraídos automaticamente do arquivo QQP_Cliente
}

// BudgetItem interface - compatible with backend
export interface BudgetItem {
  id: string;
  description: string;
  category: string;
  costCenter?: string;
  // Material/Produto fields
  quantity?: number;
  unit?: string;
  weight?: number;
  unitValue?: number;
  // Service fields
  hours?: number;
  hourlyRate?: number;
  serviceType?: string;
  totalValue: number;
}

// Resultado da importação QQP_Cliente - compatível com nova API
export interface BudgetImportResult {
  success: boolean;
  imported_items: number;
  errors: string[];
  items_total: number;
  contract_total_value: number;
  valores_previstos: Array<{
    item: string;
    servicos: string;
    unidade?: string;
    qtd_mensal?: number;
    duracao_meses?: number;
    preco_total: number;
    observacao?: string;
  }>;
}
