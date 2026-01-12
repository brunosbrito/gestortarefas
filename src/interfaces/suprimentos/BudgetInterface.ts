// Budget Realization types
export interface BudgetRealization {
  budgetItemId: string;
  predictedValue: number;
  realizedValue: number;
  predictedQuantity?: number;
  realizedQuantity?: number;
  variance: number;
  variancePercent: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'over_budget';
  linkedNFs: {
    nfId: number;
    nfItemId: number;
    value: number;
    quantity: number;
    date: string;
  }[];
}

export interface ContractExecution {
  contractId: number;
  totalPredictedValue: number;
  totalRealizedValue: number;
  physicalProgress: number;
  financialProgress: number;
  items: BudgetRealization[];
  lastUpdate: string;
  alerts: ExecutionAlert[];
}

export interface ExecutionAlert {
  id: string;
  type: 'budget_exceeded' | 'variance_high' | 'progress_delayed' | 'missing_nf';
  severity: 'low' | 'medium' | 'high';
  message: string;
  budgetItemId?: string;
  suggestedAction?: string;
}

export interface NFToBudgetSuggestion {
  nfItemId: number;
  budgetItemId: string;
  confidenceScore: number; // 0-100
  reason: string;
  similarityFactors: {
    description: number;
    category: number;
    value: number;
  };
}

export interface BudgetLinkingResult {
  success: boolean;
  linkedItems: {
    nfItemId: number;
    budgetItemId: string;
  }[];
  warnings: string[];
  errors: string[];
}
