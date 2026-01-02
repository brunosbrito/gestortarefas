// ============================================
// INTERFACES DO MÓDULO QUALIDADE
// ============================================

import { Colaborador } from './ColaboradorInterface';
import { NonConformity } from './RncInterface';
import { Project } from './ObrasInterface';
import { ServiceOrder } from './ServiceOrderInterface';

// ============================================
// ANÁLISE E AÇÕES CORRETIVAS
// ============================================

export interface AnaliseAcaoCorretiva {
  id: string;
  rncId: string;
  rnc?: NonConformity;

  // Análise de Causa Raiz
  metodoAnalise: 'cinco_porques' | 'ishikawa' | 'ambos';
  cincoPorques?: CincoPorques;
  ishikawa?: DiagramaIshikawa;
  causaRaizIdentificada: string;

  // Plano de Ação
  acoes: AcaoCorretiva[];

  createdAt: string;
  updatedAt: string;
  createdBy?: Colaborador;
}

export interface CincoPorques {
  problema: string;
  porque1: string;
  porque2?: string;
  porque3?: string;
  porque4?: string;
  porque5?: string;
  causaRaiz: string;
}

export interface DiagramaIshikawa {
  problema: string;
  categorias: {
    metodo: string[];
    maquina: string[];
    maoDeObra: string[];
    material: string[];
    meioAmbiente: string[];
    medida: string[];
  };
  causaRaiz: string;
}

export interface AcaoCorretiva {
  id: string;
  analiseId: string;

  // 5W2H
  oQue: string;              // What
  porque: string;            // Why
  quem: Colaborador;         // Who
  quemId: string;
  quando: string;            // When (prazo)
  onde?: string;             // Where
  como: string;              // How
  quantoCusta?: number;      // How much

  status: 'pendente' | 'em_andamento' | 'concluida' | 'verificada';
  dataConclusao?: string;
  eficaz?: boolean;          // Validação pós-implementação
  observacoes?: string;

  createdAt: string;
  updatedAt: string;
}

// ============================================
// INSPEÇÕES
// ============================================

export interface Inspecao {
  id: string;
  codigo: number;            // Sequencial

  // Vinculação
  projectId: string;
  project?: Project;
  serviceOrderId?: string;
  serviceOrder?: ServiceOrder;
  planoInspecaoId?: string;
  planoInspecao?: PlanoInspecao;

  // Tipo e dados básicos
  tipo: 'recebimento' | 'em_processo' | 'final' | 'auditoria';
  descricao: string;
  dataInspecao: string;
  inspetor: Colaborador;
  inspetorId: string;

  // Material/Lote inspecionado
  material?: string;
  lote?: string;
  fornecedor?: string;
  quantidade?: number;
  unidade?: string;

  // Campos dinâmicos (baseados no PlanoInspecao)
  campos: CampoInspecao[];

  // Resultado
  resultado: 'aprovado' | 'aprovado_com_ressalvas' | 'reprovado';
  ressalvas?: string;
  rncGeradaId?: string;      // Se reprovado, gera RNC

  // Evidências
  imagens: InspecaoImage[];

  // Assinatura
  assinaturaInspetor?: string; // Base64 da assinatura

  createdAt: string;
  updatedAt: string;
}

export interface CampoInspecao {
  id: string;
  nome: string;
  tipo: 'texto' | 'numero' | 'checkbox' | 'radio' | 'select' | 'medicao';
  valor: any;
  especificacao?: string;     // Valor esperado
  tolerancia?: string;        // Tolerância aceita
  conforme?: boolean;         // Atende especificação?
  observacao?: string;
}

export interface InspecaoImage {
  id: string;
  inspecaoId: string;
  url: string;
  descricao?: string;
  ordem: number;
}

// ============================================
// PLANOS DE INSPEÇÃO
// ============================================

export interface PlanoInspecao {
  id: string;
  nome: string;
  descricao?: string;
  versao: number;            // Controle de revisão

  // Aplicabilidade
  tipo: 'recebimento' | 'em_processo' | 'final' | 'auditoria';
  produto?: string;          // Aplicável a qual produto/categoria
  processo?: string;         // Aplicável a qual processo

  // Campos do formulário
  campos: CampoPlanoInspecao[];

  // Frequência
  frequencia?: string;       // Ex: "Cada lote", "Semanal", "A cada 100 peças"

  // Status
  ativo: boolean;

  createdAt: string;
  updatedAt: string;
  revisadoPor?: Colaborador;
  revisadoPorId?: string;
  dataRevisao?: string;
}

export interface CampoPlanoInspecao {
  id: string;
  nome: string;
  tipo: 'texto' | 'numero' | 'checkbox' | 'radio' | 'select' | 'medicao';
  obrigatorio: boolean;
  opcoes?: string[];         // Para radio/select
  especificacao?: string;    // Norma/valor esperado
  tolerancia?: string;       // Faixa aceita
  metodoMedicao?: string;    // Como medir
  ordem: number;
}

// ============================================
// CERTIFICADOS QUALIDADE
// ============================================

export interface Certificado {
  id: string;

  // Identificação
  tipoCertificado: string;   // Ex: "Certificado de Aço", "Laudo de Ensaio", etc.
  numeroCertificado: string;

  // Origem (terceiros)
  fornecedor: string;
  laboratorio?: string;

  // Vinculação
  projectId: string;
  project?: Project;
  material?: string;
  lote?: string;

  // Arquivo
  arquivoUrl: string;
  nomeArquivo: string;
  tipoArquivo: string;       // PDF, JPG, PNG

  // Datas
  dataEmissao: string;
  dataValidade?: string;

  // Status
  status: 'pendente' | 'recebido' | 'em_analise' | 'aprovado' | 'reprovado' | 'enviado';

  // Análise interna
  analisadoPor?: Colaborador;
  analisadoPorId?: string;
  dataAnalise?: string;
  motivoReprovacao?: string;

  // Envio ao cliente
  envios: EnvioCertificado[];

  createdAt: string;
  updatedAt: string;
  uploadPor: Colaborador;
  uploadPorId: string;
}

export interface EnvioCertificado {
  id: string;
  certificadoId: string;

  // Email
  destinatarios: string[];   // Lista de emails
  assunto: string;
  mensagem: string;

  // Rastreamento
  dataEnvio: string;
  enviadoPor: Colaborador;
  enviadoPorId: string;

  // Anexos adicionais (se houver)
  certificadosAnexos?: string[]; // IDs de outros certificados enviados juntos
}

// ============================================
// CALIBRAÇÃO
// ============================================

export interface Equipamento {
  id: string;

  // Identificação
  nome: string;
  tipo: 'paquimetro' | 'micrometro' | 'torquimetro' | 'manometro' | 'balanca' | 'outro';
  numeroSerie?: string;
  patrimonio?: string;

  // Localização
  setor?: string;
  obraAtual?: string;
  responsavel?: Colaborador;
  responsavelId?: string;

  // Calibração
  frequenciaCalibracao: number;  // Em meses
  laboratorioCalibrador?: string;

  // Status calculado
  status: 'em_dia' | 'proximo_vencimento' | 'vencido' | 'reprovado';

  // Certificados de calibração
  calibracoes: Calibracao[];

  ativo: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface Calibracao {
  id: string;
  equipamentoId: string;

  // Certificado
  certificadoUrl: string;
  numeroCertificado: string;
  laboratorio: string;

  // Datas
  dataCalibracao: string;
  proximaCalibracao: string;  // Calculado automaticamente

  // Resultado
  resultado: 'aprovado' | 'reprovado';
  observacoes?: string;

  // Rastreamento
  uploadPor: Colaborador;
  uploadPorId: string;
  dataUpload: string;
}

// ============================================
// DASHBOARD QUALIDADE
// ============================================

export interface DashboardQualidade {
  periodo: {
    inicio: string;
    fim: string;
  };
  obraId?: string;

  // Métricas RNC
  rncs: {
    total: number;
    abertas: number;
    resolvidas: number;
    taxaResolucao: number;     // %
    tempoMedioResolucao: number; // dias
  };

  // Métricas Inspeções
  inspecoes: {
    total: number;
    aprovadas: number;
    aprovadasComRessalvas: number;
    reprovadas: number;
    taxaConformidade: number;  // %
  };

  // Métricas Certificados
  certificados: {
    total: number;
    pendentes: number;
    recebidos: number;
    enviados: number;
    proximosPrazo: number;
  };

  // Métricas Calibração
  calibracao: {
    equipamentosTotal: number;
    emDia: number;
    proximoVencimento: number;
    vencidos: number;
  };

  // Ações Corretivas
  acoesCorretivas: {
    total: number;
    abertas: number;
    concluidas: number;
    atrasadas: number;
    taxaEficacia: number;      // %
  };

  // Top causas de NC
  topCausasNC: {
    causa: string;
    quantidade: number;
  }[];

  // Performance por obra
  performancePorObra: {
    obraId: string;
    obraNome: string;
    totalNCs: number;
    certificadosPendentes: number;
  }[];
}

// ============================================
// DATABOOK
// ============================================

export interface Databook {
  id: string;

  // Vinculação
  projectId: string;
  project?: Project;

  // Metadados
  titulo: string;
  cliente: string;
  periodo: {
    inicio: string;
    fim: string;
  };

  // Versionamento
  revisao: number;           // 0, 1, 2, ... Final
  status: 'rascunho' | 'em_revisao' | 'aprovado' | 'enviado';

  // Estrutura do documento
  secoes: SecaoDatabook[];

  // Histórico
  historico: HistoricoDatabook[];

  // Exportação
  pdfUrl?: string;
  dataGeracao?: string;
  geradoPor?: Colaborador;
  geradoPorId?: string;

  // Assinatura
  assinaturaDigital?: string;
  certificadoA1A3?: string;

  createdAt: string;
  updatedAt: string;
}

export interface SecaoDatabook {
  id: string;
  nome: string;
  ordem: number;
  documentos: DocumentoDatabook[];
}

export interface DocumentoDatabook {
  id: string;
  tipo: 'certificado' | 'inspecao' | 'rnc' | 'calibracao' | 'foto' | 'externo';
  referenciaId?: string;     // ID do documento original (se aplicável)
  titulo: string;
  arquivoUrl?: string;
  ordem: number;
  incluir: boolean;          // Usuário pode marcar para não incluir
}

export interface HistoricoDatabook {
  id: string;
  databookId: string;
  revisao: number;
  acao: 'criado' | 'editado' | 'aprovado' | 'enviado';
  descricao: string;
  usuario: Colaborador;
  usuarioId: string;
  data: string;
}

// ============================================
// ASSISTENTE IA QUALIDADE
// ============================================

export interface QualidadeChat {
  id: string;
  userId: string;
  timestamp: Date;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    rncs?: string[];
    inspecoes?: string[];
    certificados?: string[];
  };
}
