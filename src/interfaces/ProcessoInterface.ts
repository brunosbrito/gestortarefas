export interface Processo {
  id: number;
  nome: string;
  descricao: string;
  etapas: string[];
  status: "ativo" | "inativo";
}

export interface CreateProcesso {
  nome: string;
  descricao: string;
  etapas: string[];
  status: "ativo" | "inativo";
}