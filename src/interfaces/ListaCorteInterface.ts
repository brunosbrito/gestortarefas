/**
 * Interfaces para o Sistema de Lista de Corte Otimizada
 * Implementa algoritmo FFD (First-Fit Decreasing) + Best-Fit
 */

/**
 * Representa uma peça individual a ser cortada
 */
export interface PecaCorte {
  posicao: string;           // Ex: "189", "CE-17"
  tag: string;               // Tag/identificador da peça
  fase: string;              // Fase do projeto (F1, F2, etc.)
  perfil: string;            // Descrição do perfil (W200X35.9, L51X4.7, etc.)
  comprimento: number;       // Comprimento em mm
  quantidade: number;        // Quantidade de peças idênticas
  material: string;          // Material (A572-50, A36, etc.)
  peso: number;              // Peso unitário em kg
}

/**
 * Representa uma barra com peças otimizadas
 */
export interface BarraCorte {
  numero: number;            // Número sequencial da barra
  tipo: 'Nova' | 'Estoque';  // Origem da barra
  comprimentoTotal: number;  // Comprimento total da barra em mm (6000 ou 12000)
  pecas: {
    peca: PecaCorte;
    ordem: number;           // Ordem de corte dentro da barra
  }[];
  sobra: number;             // Sobra em mm
  aproveitamento: number;    // Aproveitamento em % (0-100)
}

/**
 * Representa uma lista de corte completa otimizada
 */
export interface ListaCorteInterface {
  id: number;
  titulo: string;
  projeto?: string;
  cliente?: string;
  obra?: string;
  geometria: string;         // Ex: 'L 102x102x6,35', 'FR 12.7', 'W200X35.9'
  comprimentoBarra: number;  // 6000 ou 12000 mm

  barras: BarraCorte[];

  // Resumo estatístico
  qtdBarras: number;         // Total de barras necessárias
  qtdPecas: number;          // Total de peças cortadas
  pesoTotal: number;         // Peso total em kg
  pesoAproveitado: number;   // Peso efetivamente usado em kg
  aproveitamentoGeral: number; // Aproveitamento geral em %
  perdaTotal: number;        // Perda total em mm

  createdAt: Date;
  updatedAt?: Date;
}

/**
 * DTO para importação de lista de corte
 */
export interface ListaCorteImportDTO {
  pecas: PecaCorte[];
  projeto?: string;
  cliente?: string;
  obra?: string;
}

/**
 * DTO para criar nova lista de corte
 */
export interface ListaCorteCreateDTO {
  titulo: string;
  projeto?: string;
  cliente?: string;
  obra?: string;
  geometria: string;
  comprimentoBarra: 6000 | 12000;
  pecas: PecaCorte[];
}

/**
 * Filtros para consulta de listas de corte
 */
export interface ListaCorteFiltros {
  projeto?: string;
  cliente?: string;
  geometria?: string;
  dataInicio?: Date;
  dataFim?: Date;
}

/**
 * Configurações de otimização
 */
export interface OtimizacaoConfig {
  comprimentoBarra: 6000 | 12000; // Comprimento da barra em mm
  tolerancia: number;              // Tolerância de perda aceitável em %
  algoritmo: 'FFD' | 'BestFit' | 'FirstFit'; // Algoritmo a usar
}

/**
 * Resultado da otimização
 */
export interface OtimizacaoResultado {
  barras: BarraCorte[];
  estatisticas: {
    qtdBarras: number;
    qtdPecas: number;
    pesoTotal: number;
    aproveitamentoGeral: number;
    perdaTotal: number;
  };
}
