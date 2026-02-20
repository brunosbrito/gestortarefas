// Configuração global do sistema salarial
export interface ConfiguracaoSalarial {
  id: string;
  salarioMinimoReferencia: number; // Base para cálculo de insalubridade
  percentualEncargos: number; // Percentual padrão de encargos sociais (ex: 58.7%)
  ultimaAtualizacao: Date;
}

// Graus de insalubridade
export type GrauInsalubridade = 'nenhum' | 'minimo' | 'medio' | 'maximo';

// Tipo de contrato
export type TipoContrato = 'mensalista' | 'horista';

// Categoria do cargo
export type CategoriaCargo = 'fabricacao' | 'montagem' | 'ambos';

// Custos diversos detalhados
export interface CustosDiversos {
  alimentacao: {
    cafeManha: number;
    almoco: number;
    janta: number;
    cestaBasica: number;
  };
  transporte: number;
  uniforme: number;
  despesasAdmissionais: number;
  assistenciaMedica: number;
  epiEpc: number;
  outros: number;
}

// Interface principal do Cargo (Tabela de Composição de Mão de Obra)
export interface Cargo {
  id: string;
  nome: string; // Ex: "SOLDADOR", "CALDEIREIRO"

  // === CAMPOS PREENCHIDOS PELO USUÁRIO ===
  // A) Salário
  salarioBase: number;

  // B) Periculosidade
  temPericulosidade: boolean;

  // C) Insalubridade
  grauInsalubridade: GrauInsalubridade;

  // F) Custos Diversos
  custos: CustosDiversos;

  // G) Horas/Mês
  horasMes: number; // 184h (mensalista) ou 220h (horista)
  tipoContrato: TipoContrato;

  // === CAMPOS CALCULADOS AUTOMATICAMENTE ===
  // B) Valor da Periculosidade (30% do salário base se ativo)
  valorPericulosidade: number;

  // C) Valor da Insalubridade (baseado no salário mínimo)
  valorInsalubridade: number;

  // D) Total do Salário (A + B + C)
  totalSalario: number;

  // E) Encargos Sociais (percentual sobre total do salário)
  valorEncargos: number;

  // F) Total de Custos Diversos (soma de todos os custos)
  totalCustosDiversos: number;

  // H) Total dos custos de mão-de-obra sem BDI (D + E + F)
  totalCustosMO: number;

  // ★ CUSTO HOMEM HORA (HH) ★ - Valor final (H / G)
  custoHH: number;

  // Metadados
  categoria: CategoriaCargo;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;

  // Observações
  observacoes?: string;
}

// DTO para criação de novo cargo
export interface CreateCargo {
  nome: string;
  salarioBase: number;
  temPericulosidade: boolean;
  grauInsalubridade: GrauInsalubridade;
  custos: CustosDiversos;
  horasMes: number;
  tipoContrato: TipoContrato;
  categoria: CategoriaCargo;
  observacoes?: string;
}

// DTO para atualização de cargo
export interface UpdateCargo extends Partial<CreateCargo> {
  id: string;
}

// Item de Mão de Obra usado no orçamento
export interface ItemMaoObra {
  id: string;
  composicaoId: string;
  cargoId: string;
  cargoNome: string;

  // Valores do orçamento
  qtdDiasUteis: number; // Ex: 22 dias
  qtdMO: number; // Ex: 1.0 pessoa
  qtdHH: number; // Calculado: dias × MO × 8.8h
  custoHH: number; // Snapshot do valor do cargo na data de criação
  subtotal: number; // qtdHH × custoHH

  // Metadados
  criadoEm: Date;
  observacoes?: string;
}

// Constantes de cálculo
export const CALCULOS_MO = {
  // Percentuais de insalubridade sobre o salário mínimo
  INSALUBRIDADE: {
    NENHUM: 0,
    MINIMO: 0.10, // 10%
    MEDIO: 0.20, // 20%
    MAXIMO: 0.40, // 40%
  },

  // Percentual de periculosidade sobre o salário base
  PERICULOSIDADE: 0.30, // 30%

  // Percentual de encargos sociais
  ENCARGOS_PADRAO: 0.587, // 58.7%

  // Horas por dia útil
  HORAS_POR_DIA: 8.8, // 8h48min (seg-qui: 8h48, sex: 7h48)

  // Horas padrão por mês
  HORAS_MENSALISTA: 184,
  HORAS_HORISTA: 220,
};
