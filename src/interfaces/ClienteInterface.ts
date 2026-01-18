// ============================================
// CLIENTE - Cadastro Completo
// ============================================

export interface Cliente {
  id: string;

  // Dados Principais
  razaoSocial: string;                // OBRIGATÓRIO
  nomeFantasia?: string;
  tipoPessoa: 'juridica' | 'fisica';  // CNPJ ou CPF

  // Documentos
  cnpj?: string;                      // Se juridica
  cpf?: string;                       // Se fisica
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;

  // Endereço Principal (Sede)
  enderecoPrincipal: EnderecoCliente;

  // Endereços Secundários (Obra, Filial, etc.)
  enderecosSecundarios: EnderecoCliente[];

  // Contato
  telefone: string;                   // OBRIGATÓRIO
  telefoneSecundario?: string;
  email: string;                      // OBRIGATÓRIO
  emailSecundario?: string;
  website?: string;

  // Contato Principal
  contatoPrincipal?: {
    nome: string;
    cargo?: string;
    telefone?: string;
    email?: string;
  };

  // Dados Comerciais
  segmento?: string;                  // "Construção Civil", "Mineração", etc.
  porte?: 'MEI' | 'ME' | 'EPP' | 'Medio' | 'Grande';

  // Status
  ativo: boolean;

  // Observações
  observacoes?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: number;
}

export interface EnderecoCliente {
  id: string;
  clienteId: string;
  tipo: 'sede' | 'obra' | 'filial' | 'cobranca' | 'entrega' | 'outro';
  descricao?: string;                 // Ex: "Obra Mina XYZ", "Filial SP"

  // Dados do Endereço
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  pais: string;                       // Padrão: "Brasil"

  // Principal (apenas 1 endereço pode ser principal)
  principal: boolean;

  ordem: number;
}

// DTOs para criação/atualização
export interface CreateCliente {
  razaoSocial: string;
  nomeFantasia?: string;
  tipoPessoa: 'juridica' | 'fisica';
  cnpj?: string;
  cpf?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;

  // Endereço Principal (obrigatório)
  enderecoPrincipal: Omit<EnderecoCliente, 'id' | 'clienteId' | 'ordem'>;

  // Contato
  telefone: string;
  telefoneSecundario?: string;
  email: string;
  emailSecundario?: string;
  website?: string;

  contatoPrincipal?: Cliente['contatoPrincipal'];
  segmento?: string;
  porte?: Cliente['porte'];
  observacoes?: string;
}

export interface UpdateCliente extends Partial<CreateCliente> {
  id: string;
  ativo?: boolean;
}

export interface CreateEnderecoCliente {
  clienteId: string;
  tipo: EnderecoCliente['tipo'];
  descricao?: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  pais?: string;
  principal?: boolean;
}

export interface UpdateEnderecoCliente extends Partial<CreateEnderecoCliente> {
  id: string;
}

// Response da API de CNPJ (ReceitaWS)
export interface CNPJResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  data_situacao: string;
  situacao: string;
  tipo: string;
  porte: string;
  natureza_juridica: string;
  capital_social: string;

  // Endereço
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;

  // Contato
  email: string;
  telefone: string;

  // Atividades
  atividade_principal: Array<{
    code: string;
    text: string;
  }>;
  atividades_secundarias: Array<{
    code: string;
    text: string;
  }>;

  // QSA (Quadro de Sócios e Administradores)
  qsa?: Array<{
    nome: string;
    qual: string;
  }>;
}

// Response da API de CEP (ViaCEP)
export interface CEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;          // cidade
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;              // true se CEP não encontrado
}

// Filtros
export interface FiltrosCliente {
  busca?: string;              // Busca em razaoSocial, nomeFantasia, CNPJ/CPF
  tipoPessoa?: 'juridica' | 'fisica';
  segmento?: string;
  uf?: string;
  ativo?: boolean;
}
