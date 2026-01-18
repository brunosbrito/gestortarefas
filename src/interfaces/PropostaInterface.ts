import { Orcamento } from './OrcamentoInterface';
import { Obra } from './ObrasInterface';
import { Cliente } from './ClienteInterface';

// ============================================
// PROPOSTA COMERCIAL (Gestão Click / GMX)
// ============================================

export interface Proposta {
  id: string;

  // Número e Identificação (formato: "ORCAMENTO Nº 2025560")
  numero: string;                    // Auto-gerado: AAAA + sequencial
  titulo: string;                    // Descrição do projeto/serviço

  // VINCULAÇÃO COM CLIENTE (Nova estrutura)
  clienteId: string;                 // ID do cliente (tabela separada)
  cliente?: Cliente;                 // Objeto completo (para exibição)

  // Dados do Cliente (DEPRECATED - manter para compatibilidade com código antigo)
  // TODO: Remover após migração completa para clienteId
  clienteData?: {
    razaoSocial: string;             // REQUERIDO
    nomeFantasia?: string;
    cnpj: string;                    // REQUERIDO
    endereco: string;
    bairro?: string;
    cep: string;
    cidade: string;
    uf: string;
    telefone: string;
    email: string;
    contatoAtencao?: string;         // "AC: Srº João Vitor"
  };

  // Vendedor/Responsável (GMX)
  vendedor: {
    nome: string;
    telefone?: string;
    email?: string;
  };

  // Datas e Prazos
  dataEmissao: string;
  dataValidade: string;              // Padrão: 10 dias
  previsaoEntrega: string;           // Data ou "X dias úteis"

  // VINCULAÇÃO COM ORÇAMENTO (QQP)
  orcamentoId?: string;              // ID do orçamento detalhado
  orcamento?: Orcamento;             // Objeto completo (para exibição)

  // ITENS/SERVIÇOS (Tabela simplificada para PDF)
  // Derivados automaticamente do orçamento, ou entrada manual
  itens: ItemProposta[];

  // Valores (derivados do orçamento se vinculado)
  subtotalItens: number;             // Soma dos itens
  valorTotal: number;                // Total geral
  moeda: 'BRL' | 'USD';

  // Pagamento
  pagamento: {
    vencimento?: string;
    valor: number;
    formaPagamento: string;          // "A Combinar", "Boleto", "Pix", etc.
    observacao?: string;
  };

  // Observações Padronizadas (8 seções - modelo GMX)
  observacoes: {
    impostosInclusos: boolean;
    faturamentoMateriais?: string;
    faturamentoServicos?: string;
    beneficiosIsencoes?: string;
    condicoesPagamentoMateriais?: string;
    condicoesPagamentoServicos?: string;
    prazoEntregaDetalhado?: string;
    transporteEquipamento: 'cliente' | 'gmx';
    hospedagemAlimentacao: 'cliente' | 'gmx';
    condicoesGerais: CondicaoGeral[];
    itensForaEscopo: string[];
  };

  // Status Workflow
  status: 'rascunho' | 'em_analise' | 'aprovada' | 'rejeitada' | 'cancelada';
  motivoRejeicao?: string;

  // Integração com Obras (quando aprovada)
  obraId?: number;
  obra?: Obra;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  dataAprovacao?: string;
  dataRejeicao?: string;
  aprovadoPor?: number;
}

// Item de Proposta (simplificado para PDF)
export interface ItemProposta {
  id: string;
  propostaId: string;
  item: number;                      // Número sequencial (1, 2, 3...)
  nome: string;                      // Descrição completa do item/serviço
  tipo: 'produto' | 'servico';
  quantidade: number;
  unidade?: string;                  // "un", "kg", "m²", "h", etc.
  valorUnitario: number;
  subtotal: number;                  // quantidade * valorUnitario
  observacao?: string;
}

// Condição Geral (Template reutilizável)
export interface CondicaoGeral {
  codigo: string;                    // Ex: "7.1", "7.2", etc.
  descricao: string;
  ativo: boolean;
  ordem: number;
}

// DTOs para criação/atualização
export interface CreateProposta {
  titulo: string;
  clienteId: string;                 // Nova estrutura (obrigatório)
  vendedor: Proposta['vendedor'];
  dataValidade: string;
  previsaoEntrega: string;
  orcamentoId?: string;
  itens?: Omit<ItemProposta, 'id' | 'propostaId'>[];
  valorTotal: number;
  moeda?: 'BRL' | 'USD';
  pagamento: Proposta['pagamento'];
  observacoes: Proposta['observacoes'];
}

export interface UpdateProposta extends Partial<CreateProposta> {
  id: string;
}

export interface CreateItemProposta {
  propostaId: string;
  nome: string;
  tipo: 'produto' | 'servico';
  quantidade: number;
  unidade?: string;
  valorUnitario: number;
  observacao?: string;
}

export interface UpdateItemProposta extends Partial<CreateItemProposta> {
  id: string;
}

// Filtros
export interface FiltrosProposta {
  status?: Proposta['status'];
  clienteNome?: string;
  dataInicio?: string;
  dataFim?: string;
  vendedor?: string;
}

// Status update payload
export interface AtualizarStatusProposta {
  propostaId: string;
  novoStatus: Proposta['status'];
  motivoRejeicao?: string;
  aprovadoPor?: number;
}
