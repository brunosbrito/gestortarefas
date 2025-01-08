export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      atualizacao_gestor_tarefas: {
        Row: {
          apk: string | null
          created_at: string
          id: number
          nota_atualizacao: string | null
          versao: string | null
        }
        Insert: {
          apk?: string | null
          created_at?: string
          id?: number
          nota_atualizacao?: string | null
          versao?: string | null
        }
        Update: {
          apk?: string | null
          created_at?: string
          id?: number
          nota_atualizacao?: string | null
          versao?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      employee: {
        Row: {
          cpf: string | null
          created_at: string
          id: number
          name: string | null
          password: string | null
          permission: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          id?: number
          name?: string | null
          password?: string | null
          permission?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string
          id?: number
          name?: string | null
          password?: string | null
          permission?: string | null
        }
        Relationships: []
      }
      hh_trabalhadas: {
        Row: {
          colaborador: string | null
          created_at: string
          hh_trabalhadas: string | null
          id: number
          id_obra: number | null
          id_tarefa: number | null
        }
        Insert: {
          colaborador?: string | null
          created_at?: string
          hh_trabalhadas?: string | null
          id?: number
          id_obra?: number | null
          id_tarefa?: number | null
        }
        Update: {
          colaborador?: string | null
          created_at?: string
          hh_trabalhadas?: string | null
          id?: number
          id_obra?: number | null
          id_tarefa?: number | null
        }
        Relationships: []
      }
      historico_atividades: {
        Row: {
          created_at: string
          id: number
          id_tarefa: number | null
          motivo: string | null
          status: string | null
          usuario: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          id_tarefa?: number | null
          motivo?: string | null
          status?: string | null
          usuario?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          id_tarefa?: number | null
          motivo?: string | null
          status?: string | null
          usuario?: string | null
        }
        Relationships: []
      }
      id_chat: {
        Row: {
          created_at: string
          id: number
          id_chat: string | null
          id_grupo: string | null
          id_item: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          id_chat?: string | null
          id_grupo?: string | null
          id_item?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          id_chat?: string | null
          id_grupo?: string | null
          id_item?: number | null
        }
        Relationships: []
      }
      imagens: {
        Row: {
          created_at: string
          descricao: string | null
          id: number
          id_chat: string | null
          id_tarefa: number | null
          url: string | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: number
          id_chat?: string | null
          id_tarefa?: number | null
          url?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: number
          id_chat?: string | null
          id_tarefa?: number | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imagens_id_tarefa_fkey"
            columns: ["id_tarefa"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
        ]
      }
      imagens_rnc: {
        Row: {
          created_at: string
          id: number
          id_rnc: number | null
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          id_rnc?: number | null
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          id_rnc?: number | null
          url?: string | null
        }
        Relationships: []
      }
      mao_de_obra_rnc: {
        Row: {
          cod_sequencial: number | null
          created_at: string
          id: number
          id_rnc: number | null
          item: number | null
          nome_colaborador: string | null
          qtd: number | null
          total: number | null
          unid: string | null
          valor: number | null
        }
        Insert: {
          cod_sequencial?: number | null
          created_at?: string
          id?: number
          id_rnc?: number | null
          item?: number | null
          nome_colaborador?: string | null
          qtd?: number | null
          total?: number | null
          unid?: string | null
          valor?: number | null
        }
        Update: {
          cod_sequencial?: number | null
          created_at?: string
          id?: number
          id_rnc?: number | null
          item?: number | null
          nome_colaborador?: string | null
          qtd?: number | null
          total?: number | null
          unid?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      Material: {
        Row: {
          cod_sequencial: number | null
          created_at: string
          descricao: string | null
          id: number
          item: string | null
          qtd: number | null
          rnc_id: number | null
          total: number | null
          unid: string | null
          valor: number | null
        }
        Insert: {
          cod_sequencial?: number | null
          created_at?: string
          descricao?: string | null
          id?: number
          item?: string | null
          qtd?: number | null
          rnc_id?: number | null
          total?: number | null
          unid?: string | null
          valor?: number | null
        }
        Update: {
          cod_sequencial?: number | null
          created_at?: string
          descricao?: string | null
          id?: number
          item?: string | null
          qtd?: number | null
          rnc_id?: number | null
          total?: number | null
          unid?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      mensagem: {
        Row: {
          created_at: string
          id: number
          id_grupo: string | null
          id_mensagem: number | null
          id_tarefa: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          id_grupo?: string | null
          id_mensagem?: number | null
          id_tarefa?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          id_grupo?: string | null
          id_mensagem?: number | null
          id_tarefa?: number | null
        }
        Relationships: []
      }
      obras: {
        Row: {
          cliente: string | null
          created_at: string
          endereco: string | null
          id: number
          id_grupo: string | null
          nome: string | null
          obs: string | null
          status: boolean | null
        }
        Insert: {
          cliente?: string | null
          created_at?: string
          endereco?: string | null
          id?: number
          id_grupo?: string | null
          nome?: string | null
          obs?: string | null
          status?: boolean | null
        }
        Update: {
          cliente?: string | null
          created_at?: string
          endereco?: string | null
          id?: number
          id_grupo?: string | null
          nome?: string | null
          obs?: string | null
          status?: boolean | null
        }
        Relationships: []
      }
      ponto_dia: {
        Row: {
          created_at: string
          falta_justificada: string | null
          funcao: string | null
          htt_previsto: string | null
          id: number
          local: string | null
          setor: string | null
          turno: number | null
          usuario: string | null
        }
        Insert: {
          created_at?: string
          falta_justificada?: string | null
          funcao?: string | null
          htt_previsto?: string | null
          id?: number
          local?: string | null
          setor?: string | null
          turno?: number | null
          usuario?: string | null
        }
        Update: {
          created_at?: string
          falta_justificada?: string | null
          funcao?: string | null
          htt_previsto?: string | null
          id?: number
          local?: string | null
          setor?: string | null
          turno?: number | null
          usuario?: string | null
        }
        Relationships: []
      }
      Processos: {
        Row: {
          created_at: string
          id: number
          processo: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          processo?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          processo?: string | null
        }
        Relationships: []
      }
      programacao: {
        Row: {
          atividade: string | null
          codigo_sequencial: number | null
          created_at: string
          data_programacao: string | null
          equipe: string[] | null
          id: number
          id_obra: number | null
          imagem: string | null
          obra: string | null
          obs: string | null
          processo: string | null
          status: string | null
          tarefa_macro: string | null
          tempo_previsto: string | null
          tempo_unidade: number | null
          unidade: number | null
        }
        Insert: {
          atividade?: string | null
          codigo_sequencial?: number | null
          created_at?: string
          data_programacao?: string | null
          equipe?: string[] | null
          id?: number
          id_obra?: number | null
          imagem?: string | null
          obra?: string | null
          obs?: string | null
          processo?: string | null
          status?: string | null
          tarefa_macro?: string | null
          tempo_previsto?: string | null
          tempo_unidade?: number | null
          unidade?: number | null
        }
        Update: {
          atividade?: string | null
          codigo_sequencial?: number | null
          created_at?: string
          data_programacao?: string | null
          equipe?: string[] | null
          id?: number
          id_obra?: number | null
          imagem?: string | null
          obra?: string | null
          obs?: string | null
          processo?: string | null
          status?: string | null
          tarefa_macro?: string | null
          tempo_previsto?: string | null
          tempo_unidade?: number | null
          unidade?: number | null
        }
        Relationships: []
      }
      registro_rnc: {
        Row: {
          acao_corretiva: string | null
          data_ocorrencia: string | null
          data_para_conclusao: string | null
          descricao: string | null
          id: number
          id_grupo: string | null
          id_obra: number | null
          nome_obra: string | null
          os: number | null
          pdf: string | null
          reponsavel_nao_conformidade: string | null
          responsavel_acao: string | null
          resposanvel_indentificacao: string | null
          tarefa_macro: string | null
        }
        Insert: {
          acao_corretiva?: string | null
          data_ocorrencia?: string | null
          data_para_conclusao?: string | null
          descricao?: string | null
          id?: number
          id_grupo?: string | null
          id_obra?: number | null
          nome_obra?: string | null
          os?: number | null
          pdf?: string | null
          reponsavel_nao_conformidade?: string | null
          responsavel_acao?: string | null
          resposanvel_indentificacao?: string | null
          tarefa_macro?: string | null
        }
        Update: {
          acao_corretiva?: string | null
          data_ocorrencia?: string | null
          data_para_conclusao?: string | null
          descricao?: string | null
          id?: number
          id_grupo?: string | null
          id_obra?: number | null
          nome_obra?: string | null
          os?: number | null
          pdf?: string | null
          reponsavel_nao_conformidade?: string | null
          responsavel_acao?: string | null
          resposanvel_indentificacao?: string | null
          tarefa_macro?: string | null
        }
        Relationships: []
      }
      status_tarefa: {
        Row: {
          created_at: string
          id: number
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          status?: string | null
        }
        Relationships: []
      }
      tarefa: {
        Row: {
          area: string | null
          arquivo: string | null
          atividade: string | null
          cod_equipamento: string | null
          cod_sequencial: number | null
          created_at: string
          data_finalizado: string | null
          data_inicio: string | null
          data_primeiro_inicio: string | null
          data_programacao: string | null
          eh_programacao: boolean | null
          equipe: string[]
          hh_trabalhadas: string | null
          id: number
          id_grupo: string | null
          id_obra: number | null
          imagem: string | null
          iniciado: boolean | null
          nome_equipamento: string | null
          obra: string | null
          obs: string | null
          processo: string | null
          status: string | null
          tarefa_macro: string | null
          tempo_atividade: number | null
          tempo_por_atividade: number | null
          tempo_servico_previsto: string | null
          tempo_trabalho: unknown | null
          tipo_tarefa: string | null
          unidade: number | null
          usuario: string | null
        }
        Insert: {
          area?: string | null
          arquivo?: string | null
          atividade?: string | null
          cod_equipamento?: string | null
          cod_sequencial?: number | null
          created_at?: string
          data_finalizado?: string | null
          data_inicio?: string | null
          data_primeiro_inicio?: string | null
          data_programacao?: string | null
          eh_programacao?: boolean | null
          equipe: string[]
          hh_trabalhadas?: string | null
          id?: number
          id_grupo?: string | null
          id_obra?: number | null
          imagem?: string | null
          iniciado?: boolean | null
          nome_equipamento?: string | null
          obra?: string | null
          obs?: string | null
          processo?: string | null
          status?: string | null
          tarefa_macro?: string | null
          tempo_atividade?: number | null
          tempo_por_atividade?: number | null
          tempo_servico_previsto?: string | null
          tempo_trabalho?: unknown | null
          tipo_tarefa?: string | null
          unidade?: number | null
          usuario?: string | null
        }
        Update: {
          area?: string | null
          arquivo?: string | null
          atividade?: string | null
          cod_equipamento?: string | null
          cod_sequencial?: number | null
          created_at?: string
          data_finalizado?: string | null
          data_inicio?: string | null
          data_primeiro_inicio?: string | null
          data_programacao?: string | null
          eh_programacao?: boolean | null
          equipe?: string[]
          hh_trabalhadas?: string | null
          id?: number
          id_grupo?: string | null
          id_obra?: number | null
          imagem?: string | null
          iniciado?: boolean | null
          nome_equipamento?: string | null
          obra?: string | null
          obs?: string | null
          processo?: string | null
          status?: string | null
          tarefa_macro?: string | null
          tempo_atividade?: number | null
          tempo_por_atividade?: number | null
          tempo_servico_previsto?: string | null
          tempo_trabalho?: unknown | null
          tipo_tarefa?: string | null
          unidade?: number | null
          usuario?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tarefa_id_obra_fkey"
            columns: ["id_obra"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefa_predefinida: {
        Row: {
          atividade: string | null
          created_at: string
          id: number
          processo: string | null
          tarefa_macro: string | null
          tempo_por_unidade: number | null
          tempo_servico_previsto: string | null
          unidade: number | null
        }
        Insert: {
          atividade?: string | null
          created_at?: string
          id?: number
          processo?: string | null
          tarefa_macro?: string | null
          tempo_por_unidade?: number | null
          tempo_servico_previsto?: string | null
          unidade?: number | null
        }
        Update: {
          atividade?: string | null
          created_at?: string
          id?: number
          processo?: string | null
          tarefa_macro?: string | null
          tempo_por_unidade?: number | null
          tempo_servico_previsto?: string | null
          unidade?: number | null
        }
        Relationships: []
      }
      tarefas_trello: {
        Row: {
          created_at: string
          data_finalizacao: string | null
          data_incio: string | null
          descricao: string | null
          id: number
          id_card: string | null
          id_trello: string | null
          nome_tarefa: string | null
          status: string | null
          usuario: string | null
        }
        Insert: {
          created_at?: string
          data_finalizacao?: string | null
          data_incio?: string | null
          descricao?: string | null
          id?: number
          id_card?: string | null
          id_trello?: string | null
          nome_tarefa?: string | null
          status?: string | null
          usuario?: string | null
        }
        Update: {
          created_at?: string
          data_finalizacao?: string | null
          data_incio?: string | null
          descricao?: string | null
          id?: number
          id_card?: string | null
          id_trello?: string | null
          nome_tarefa?: string | null
          status?: string | null
          usuario?: string | null
        }
        Relationships: []
      }
      TarefasMacro: {
        Row: {
          created_at: string
          id: number
          tarefa_macro: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          tarefa_macro?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          tarefa_macro?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          cpf: string | null
          created_at: string
          id: number
          name: string | null
          permission: string | null
          state: number | null
          thread_id: string | null
          user_ref: string | null
          whatsapp: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          id?: number
          name?: string | null
          permission?: string | null
          state?: number | null
          thread_id?: string | null
          user_ref?: string | null
          whatsapp?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string
          id?: number
          name?: string | null
          permission?: string | null
          state?: number | null
          thread_id?: string | null
          user_ref?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          created_at: string
          funcao: string | null
          id: number
          nome: string
          setor: string | null
        }
        Insert: {
          created_at?: string
          funcao?: string | null
          id?: number
          nome: string
          setor?: string | null
        }
        Update: {
          created_at?: string
          funcao?: string | null
          id?: number
          nome?: string
          setor?: string | null
        }
        Relationships: []
      }
      usuarios_tarefa: {
        Row: {
          id: number
          id_tarefa: number | null
          id_usuario: number
        }
        Insert: {
          id?: number
          id_tarefa?: number | null
          id_usuario: number
        }
        Update: {
          id?: number
          id_tarefa?: number | null
          id_usuario?: number
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_tarefa_id_tarefa_fkey"
            columns: ["id_tarefa"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_tarefa_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      resumo_colaborador: {
        Row: {
          colaborador: string | null
          qtd_tarefas: number | null
          total_horas: unknown | null
        }
        Relationships: []
      }
      resumo_tarefa_macro: {
        Row: {
          diferenca_tempo: string | null
          kpi_atividades_vs_total: string | null
          kpi_tempo_trabalho_vs_previsto: string | null
          kpi_tempo_trabalho_vs_total: string | null
          qtd_atividades: number | null
          tarefa_macro: string | null
          tempo_previsto_total: string | null
          tempo_trabalho_total: string | null
        }
        Relationships: []
      }
      tabela_resumo_processos: {
        Row: {
          diferenca_tempo: string | null
          kpi_atividades_vs_total: string | null
          kpi_tempo_trabalho_vs_previsto: string | null
          kpi_tempo_trabalho_vs_total: string | null
          processo: string | null
          qtd_atividades: number | null
          tempo_previsto_total: string | null
          tempo_trabalho_total: string | null
        }
        Relationships: []
      }
      tarefa_macro_soma: {
        Row: {
          tarefa_macro: string | null
          tempo_trabalho_total: unknown | null
        }
        Relationships: []
      }
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      calcular_kpis:
        | {
            Args: {
              p_data_inicio: string
              p_data_fim: string
              p_id_obra: number
              p_tarefa_macro: string
            }
            Returns: {
              tarefa_macro: string
              tempo_trabalho_total: string
              tempo_previsto_total: string
              diferenca_tempo: string
              qtd_atividades: number
              kpi_tempo_trabalho_vs_previsto: string
              kpi_tempo_trabalho_vs_total: string
              kpi_atividades_vs_total: string
            }[]
          }
        | {
            Args: {
              p_data_inicio: string
              p_data_fim: string
              p_id_obra: number
              p_tarefa_macro: string
              p_colaborador_nome: string
            }
            Returns: {
              tarefa_macro: string
              tempo_trabalho_total: string
              tempo_previsto_total: string
              diferenca_tempo: string
              qtd_atividades: number
              kpi_tempo_trabalho_vs_previsto: string
              kpi_tempo_trabalho_vs_total: string
              kpi_atividades_vs_total: string
            }[]
          }
        | {
            Args: {
              p_data_inicio: string
              p_data_fim: string
              p_id_obra: number
              t_macro: string
              p_colaborador_nome: string
            }
            Returns: {
              tarefa_macro: string
              tempo_trabalho_total: string
              tempo_previsto_total: string
              diferenca_tempo: string
              qtd_atividades: number
              kpi_tempo_trabalho_vs_previsto: string
              kpi_tempo_trabalho_vs_total: string
              kpi_atividades_vs_total: string
            }[]
          }
      calcular_kpis_tarefa_macro: {
        Args: {
          p_data_inicio: string
          p_data_fim: string
          p_id_obra: number
          p_tarefa_macro: string
          p_colaborador_nome: string
        }
        Returns: {
          tarefa_macro: string
          tempo_trabalho_total: string
          tempo_previsto_total: string
          diferenca_tempo: string
          qtd_atividades: number
          kpi_tempo_trabalho_vs_previsto: string
          kpi_tempo_trabalho_vs_total: string
          kpi_atividades_vs_total: string
        }[]
      }
      get_atividades: {
        Args: {
          p_data_inicio: string
          p_data_fim: string
          p_obra: number
          p_tarefa_macro: string
          p_processo: string
          p_equipe: string
        }
        Returns: {
          tarefa_macro: string
          tempo_trabalho_total: string
          tempo_previsto_total: string
          diferenca_tempo: string
          qtd_atividades: number
          kpi_tempo_trabalho_vs_previsto: string
          kpi_tempo_trabalho_vs_total: string
          kpi_atividades_vs_total: string
        }[]
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      match_documents: {
        Args: {
          query_embedding: string
          match_count?: number
          filter?: Json
        }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      status: "em andamento"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never