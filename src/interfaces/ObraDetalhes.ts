
export interface ObraDetalhes {
  id: number;
  nome: string;
  status: "em_andamento" | "finalizado" | "interrompido";
  dataInicio: string;
  dataFim?: string;
  horasTrabalhadas: number;
  atividades: string[];
  historico: string[];
}
