// Analytics and KPI Types
export interface Analytics {
  roi: number;
  averageQuoteTime: number;
  activeSuppliers: number;
  accumulatedSavings: number;
  costEvolution: Array<{ month: string; value: number }>;
  supplierPerformance: Array<{ name: string; score: number }>;
  insights: {
    positive: string[];
    attention: string[];
  };
  recommendations: Array<{ title: string; description: string }>;
}

export interface KPI {
  title: string;
  value: number | string;
  format: 'currency' | 'percentage' | 'number';
  trend?: 'up' | 'down';
  trendValue?: string;
}

export interface Activity {
  id: number;
  type: 'purchase' | 'contract' | 'report' | 'nf';
  description: string;
  date: string;
  status: string;
  value?: number;
}

export interface Goal {
  id: number;
  contractName: string;
  targetReduction: number;
  currentReduction: number;
  achievedSavings: number;
  status: 'progress' | 'achieved' | 'exceeded';
  achievement: number;
}

export interface Account {
  id: number;
  contractName: string;
  totalValue: number;
  spent: number;
  balance: number;
  executionPercentage: number;
  status: 'Normal' | 'Atenção' | 'Crítico';
  lastUpdate: string;
}
