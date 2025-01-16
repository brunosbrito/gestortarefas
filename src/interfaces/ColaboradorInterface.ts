export interface Colaborador {
  id: number;
  name: string;
  cargo: string;
  email: string;
  telefone: string;
  dataAdmissao: string;
  status: 'ativo' | 'inativo';
}

export interface CreateColaborador {
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  dataAdmissao: string;
  status: 'ativo' | 'inativo';
}
