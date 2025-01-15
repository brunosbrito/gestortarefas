export interface AtividadeStatus {
  id: number;
  description: string;
  os: string;
  obra: string;
  responsavel: string;
  prazo: string;
  tarefaMacro: string;
  processo: string;
  status: "Planejadas" | "Em Execução" | "Concluídas" | "Paralizadas";
}