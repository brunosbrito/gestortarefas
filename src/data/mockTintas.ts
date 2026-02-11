import { TintaInterface, TipoTinta } from '@/interfaces/TintaInterface';
import { FornecedorServicoInterface } from '@/interfaces/FornecedorServicoInterface';

// MOCK DATA - Tintas
export const mockTintas: TintaInterface[] = [
  // PRIMERS
  {
    id: 1,
    codigo: 'PRIMER-001',
    descricao: 'Primer Epóxi Alto Sólidos - Internacional Interzone 954',
    tipo: TipoTinta.PRIMER,
    solidosVolume: 72, // %
    precoLitro: 89.50,
    fornecedor: 'Internacional',
    observacoes: 'Secagem rápida, alta aderência',
    ativo: true,
  },
  {
    id: 2,
    codigo: 'PRIMER-002',
    descricao: 'Primer Epóxi Fosfato de Zinco - Sherwin Williams Macropoxy 646',
    tipo: TipoTinta.PRIMER,
    solidosVolume: 68,
    precoLitro: 95.00,
    fornecedor: 'Sherwin Williams',
    observacoes: 'Excelente proteção anticorrosiva',
    ativo: true,
  },
  {
    id: 3,
    codigo: 'PRIMER-003',
    descricao: 'Primer Epóxi - PPG Sigmacover 456',
    tipo: TipoTinta.PRIMER,
    solidosVolume: 70,
    precoLitro: 92.00,
    fornecedor: 'PPG',
    observacoes: 'Uso geral, boa relação custo-benefício',
    ativo: true,
  },

  // ACABAMENTOS
  {
    id: 4,
    codigo: 'ACAB-001',
    descricao: 'Tinta Poliuretano Alifático - Internacional Interthane 990',
    tipo: TipoTinta.ACABAMENTO,
    solidosVolume: 65,
    precoLitro: 125.00,
    fornecedor: 'Internacional',
    observacoes: 'Alta resistência a intempéries, brilho',
    ativo: true,
  },
  {
    id: 5,
    codigo: 'ACAB-002',
    descricao: 'Tinta Epóxi Alto Sólidos - Sherwin Williams Macropoxy 646 Fast Cure',
    tipo: TipoTinta.ACABAMENTO,
    solidosVolume: 62,
    precoLitro: 105.00,
    fornecedor: 'Sherwin Williams',
    observacoes: 'Secagem rápida, boa dureza',
    ativo: true,
  },
  {
    id: 6,
    codigo: 'ACAB-003',
    descricao: 'Tinta Poliuretano - PPG Sigmadur 520',
    tipo: TipoTinta.ACABAMENTO,
    solidosVolume: 60,
    precoLitro: 115.00,
    fornecedor: 'PPG',
    observacoes: 'Acabamento premium, durabilidade',
    ativo: true,
  },
  {
    id: 7,
    codigo: 'ACAB-004',
    descricao: 'Tinta Epóxi - Coral Industrial Epoxi 300',
    tipo: TipoTinta.ACABAMENTO,
    solidosVolume: 58,
    precoLitro: 88.00,
    fornecedor: 'Coral',
    observacoes: 'Econômica, uso interno',
    ativo: true,
  },
];

// MOCK DATA - Fornecedores de Serviço
export const mockFornecedores: FornecedorServicoInterface[] = [
  {
    id: 1,
    nome: 'Jateamento & Pintura São Paulo LTDA',
    valorJateamentoM2: 35.00,
    valorPinturaM2: 42.00,
    contato: 'João Silva',
    telefone: '(11) 98765-4321',
    email: 'contato@jateamentosp.com.br',
    observacoes: 'Prazo médio 5 dias úteis',
    ativo: true,
  },
  {
    id: 2,
    nome: 'Acabamentos Industriais BH',
    valorJateamentoM2: 32.00,
    valorPinturaM2: 38.00,
    contato: 'Maria Santos',
    telefone: '(31) 99876-5432',
    email: 'maria@acabamentosbh.com.br',
    observacoes: 'Especializado em estruturas pesadas',
    ativo: true,
  },
  {
    id: 3,
    nome: 'Pintura Express RJ',
    valorJateamentoM2: 38.00,
    valorPinturaM2: 45.00,
    contato: 'Carlos Mendes',
    telefone: '(21) 97654-3210',
    email: 'carlos@pinturaexpressrj.com.br',
    observacoes: 'Atendimento expresso, menor prazo',
    ativo: true,
  },
];
