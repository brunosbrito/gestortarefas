import { Obra } from "@/interfaces/ObrasInterface";

export interface ObraDetalhada extends Obra {
  horasTrabalhadas?: number;
  atividades?: string[];
  historico?: string[];
}