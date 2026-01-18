// NF (Nota Fiscal) related types
export interface NotaFiscal {
  id: number;
  numero: string;
  serie: string;
  chave_acesso?: string;
  cnpj_fornecedor: string;
  nome_fornecedor: string;
  data_emissao?: string;
  data_entrada?: string;
  valor_total: number;
  valor_produtos?: number;
  valor_impostos?: number;
  valor_frete?: number;
  pasta_origem: string;
  subpasta?: string;
  status_processamento: string;
  observacoes?: string;
  contrato_id?: number;
  ordem_compra_id?: number;
  created_at?: string;
  updated_at?: string;
  processed_by_n8n_at?: string;
  tipo_nf?: 'entrada' | 'saida';
  destinatario_cnpj?: string;
  destinatario_nome?: string;
  transportadora_cnpj?: string;
  transportadora_nome?: string;
  peso_total?: number;
  volumes?: number;
  items: NotaFiscalItem[];
}

export interface NotaFiscalItem {
  id: number;
  numero_item: number;
  codigo_produto?: string;
  descricao: string;
  ncm?: string;
  quantidade: number;
  unidade: string;
  valor_unitario: number;
  valor_total: number;
  peso_liquido?: number;
  peso_bruto?: number;
  centro_custo_id?: number;
  centro_custo?: string;
  item_orcamento_id?: number;
  score_classificacao?: number;
  fonte_classificacao?: string;
  status_integracao: string;
  integrado_em?: string;
}

export interface NFImportResult {
  success: boolean;
  notasFiscais: NotaFiscal[];
  errors: string[];
  warnings: string[];
}

// Enhanced NF Import with Classification
export interface EnhancedNFImportResult extends NFImportResult {
  classificationResults?: Array<{
    nfId: number;
    itemsClassified: number;
    needsReview: number;
    suggestions: Array<{
      itemId: number;
      costCenter: string;
      confidence: number;
    }>;
  }>;
  importSettings: {
    autoClassify: boolean;
    contractId?: number;
    costCenterRules?: Array<{
      keyword: string;
      costCenter: string;
    }>;
  };
}

export interface NFStats {
  total_nfs: number;
  validated: number;
  pending_validation: number;
  total_value: number;
}
