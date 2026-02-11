// Interface para Fornecedores de Serviços de Pintura/Jateamento
export interface FornecedorServicoInterface {
  id?: number;
  nome: string;
  razaoSocial?: string;
  cnpj?: string;
  contato?: string;
  telefone?: string;
  email?: string;

  // Valores de Mão de Obra
  valorJateamentoM2: number; // R$/m² (jateamento)
  valorPinturaM2: number; // R$/m² (pintura)

  observacoes?: string;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// DTO para criação/edição
export interface FornecedorServicoCreateDTO {
  nome: string;
  razaoSocial?: string;
  cnpj?: string;
  contato?: string;
  telefone?: string;
  email?: string;
  valorJateamentoM2: number;
  valorPinturaM2: number;
  observacoes?: string;
  ativo: boolean;
}

export interface FornecedorServicoUpdateDTO extends Partial<FornecedorServicoCreateDTO> {
  id: number;
}

// Filtros para pesquisa
export interface FornecedorServicoFiltros {
  busca?: string;
  ativo?: boolean;
}
