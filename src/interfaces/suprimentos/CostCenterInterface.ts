// Cost Center and Classification Types
export interface CostCenter {
  id: string;
  name: string;
  description: string;
  category: 'material' | 'labor' | 'equipment' | 'service' | 'overhead';
  keywords: string[];
  color?: string;
  active: boolean;
  parentId?: string; // For hierarchical cost centers
  budget?: {
    allocated: number;
    consumed: number;
    remaining: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassificationRule {
  id: string;
  name: string;
  costCenterId: string;
  conditions: Array<{
    field: 'description' | 'supplier' | 'value' | 'ncm' | 'quantity';
    operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'regex';
    value: string | number;
    caseSensitive?: boolean;
  }>;
  priority: number; // Higher number = higher priority
  active: boolean;
  hitCount?: number; // Number of times rule has been applied
  successRate?: number; // Success rate of manual validation
  createdAt: string;
  updatedAt: string;
}

export interface ClassificationSuggestion {
  costCenterId: string;
  costCenterName: string;
  confidence: number;
  reasons: Array<{
    rule?: string;
    keyword?: string;
    similarity?: number;
    description: string;
  }>;
  manualOverride?: boolean;
}

export interface ClassificationResult {
  itemId: number;
  itemDescription: string;
  suggestedCostCenter?: string;
  suggestions: ClassificationSuggestion[];
  autoClassified: boolean;
  confidence: number;
  appliedRuleId?: string;
  manuallyVerified?: boolean;
  timestamp: string;
}

export interface ClassificationStats {
  totalItems: number;
  classified: number;
  needsReview: number;
  accuracyScore?: number;
  topCostCenters: Array<{
    costCenterId: string;
    name: string;
    itemCount: number;
    totalValue: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    date: string;
    itemsClassified: number;
    accuracyScore?: number;
  }>;
  rulePerformance: Array<{
    ruleId: string;
    ruleName: string;
    hitCount: number;
    successRate: number;
  }>;
}
