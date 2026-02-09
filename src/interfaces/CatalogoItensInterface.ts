// ============================================
// CATÁLOGO DE ITENS CONSUMÍVEIS
// ============================================

export interface ItemCatalogo {
  id: string;
  descricao: string;                    // Nome completo do item (ex: "ELETRODO MGM 6013 FS")
  subcategoria: 'abrasivos' | 'solda' | 'marcador' | 'gases';
  unidade: string;                      // "kg", "un", "m", "l", etc.
  pesoUnitario?: number;                // Peso em kg (opcional)
  valorUnitario: number;                // Preço padrão
  ordem: number;                        // Para ordenação alfabética
  ativo: boolean;
}

export interface CreateItemCatalogo {
  descricao: string;
  subcategoria: 'abrasivos' | 'solda' | 'marcador' | 'gases';
  unidade: string;
  pesoUnitario?: number;
  valorUnitario: number;
}

export interface UpdateItemCatalogo extends Partial<CreateItemCatalogo> {
  id: string;
  ativo?: boolean;
}
