export interface TarefaMacro {
  id: number;
  nome: string;
  descricao: string;
  prazoEstimado: number;
  status: "ativa" | "inativa";
}

export interface CreateTarefaMacro {
  nome: string;
  descricao: string;
  prazoEstimado: number;
  status: "ativa" | "inativa";
}