import API_URL from '@/config';
import {
  Orcamento,
  CreateOrcamento,
  UpdateOrcamento,
} from '@/interfaces/OrcamentoInterface';
import axios from 'axios';
import {
  calcularValoresOrcamento,
  calcularDRE,
  calcularBDIComposicao,
  calcularMargemLucroComposicao,
  calcularSubtotalComposicao,
} from '@/lib/calculosOrcamento';

// Helper para recalcular valores de um orçamento mock
const recalcularOrcamento = (orcamento: Orcamento): Orcamento => {
  // 1. Calcular custo direto, BDI detalhado e margem de lucro de cada composição
  const composicoesAtualizadas = orcamento.composicoes.map(comp => {
    const custoDirecto = comp.itens.reduce((sum, item) => sum + item.subtotal, 0);

    // Calcular BDI detalhado
    const bdiDetalhado = calcularBDIComposicao(custoDirecto, {
      despesasAdministrativas: comp.bdi.despesasAdministrativas.percentual,
      despesasComerciais: comp.bdi.despesasComerciais.percentual,
      despesasFinanceiras: comp.bdi.despesasFinanceiras.percentual,
      impostosIndiretos: comp.bdi.impostosIndiretos.percentual,
    });

    // Calcular margem de lucro
    const margemLucroValor = calcularMargemLucroComposicao(custoDirecto, comp.margemLucro.percentual);

    // Calcular subtotal (custo direto + BDI + margem lucro)
    const subtotal = calcularSubtotalComposicao(custoDirecto, bdiDetalhado.valorTotal, margemLucroValor);

    return {
      ...comp,
      custoDirecto,
      bdi: bdiDetalhado,
      margemLucro: {
        percentual: comp.margemLucro.percentual,
        valor: margemLucroValor,
      },
      subtotal,
      percentualDoTotal: 0, // Será calculado depois
    };
  });

  // 2. Calcular totais do orçamento
  const custoDirectoTotal = composicoesAtualizadas.reduce((sum, comp) => sum + comp.custoDirecto, 0);

  // 3. Calcular percentual de cada composição
  const composicoesComPercentual = composicoesAtualizadas.map(comp => ({
    ...comp,
    percentualDoTotal: custoDirectoTotal > 0 ? (comp.custoDirecto / custoDirectoTotal) * 100 : 0,
  }));

  // 4. Montar orçamento temporário para cálculos
  const orcamentoTemp = {
    ...orcamento,
    composicoes: composicoesComPercentual,
  };

  // 5. Calcular valores totais e DRE
  const valores = calcularValoresOrcamento(orcamentoTemp);
  const dre = calcularDRE(orcamentoTemp);

  return {
    ...orcamentoTemp,
    ...valores,
    dre,
  };
};

const URL = `${API_URL}/api/orcamentos`;

// MOCK DATA - Remover quando backend estiver pronto
const USE_MOCK = true; // Alterar para false quando backend estiver funcionando

const mockOrcamentos: Orcamento[] = [
  // ============================================
  // ORÇAMENTO 1: Serviço - Fabricação de Tanque
  // ============================================
  {
    id: 'mock-1',
    numero: 'S-001|2026',
    nome: 'Fabricação de Tanque de Armazenamento 50m³',
    tipo: 'servico',
    clienteNome: 'Petroquímica ABC Ltda',
    codigoProjeto: 'M-15801',
    areaTotalM2: 85.5,
    metrosLineares: 42.0,
    pesoTotalProjeto: 12500,
    tributos: {
      temISS: true,
      aliquotaISS: 3,
      aliquotaSimples: 11.8,
    },
    composicoes: [
      {
        id: 'comp-1-1',
        orcamentoId: 'mock-1',
        nome: 'Mobilização e Desmobilização',
        tipo: 'mobilizacao',
        bdi: {
          despesasAdministrativas: { percentual: 8, valor: 0 },
          despesasComerciais: { percentual: 3, valor: 0 },
          despesasFinanceiras: { percentual: 2, valor: 0 },
          impostosIndiretos: { percentual: 2, valor: 0 },
          percentualTotal: 15,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 1,
        itens: [
          {
            id: 'item-1-1-1',
            composicaoId: 'comp-1-1',
            codigo: 'MOB-001',
            descricao: 'Transporte de Equipamentos',
            quantidade: 2,
            unidade: 'un',
            peso: 3,
            valorUnitario: 2500,
            subtotal: 15000,
            percentual: 0,
            tipoItem: 'mobilizacao_desmobilizacao',
            ordem: 1,
          },
          {
            id: 'item-1-1-2',
            composicaoId: 'comp-1-1',
            codigo: 'MOB-002',
            descricao: 'Montagem de Infraestrutura no Local',
            quantidade: 1,
            unidade: 'un',
            peso: 2,
            valorUnitario: 8500,
            subtotal: 17000,
            percentual: 0,
            tipoItem: 'mobilizacao_desmobilizacao',
            ordem: 2,
          },
        ],
      },
      {
        id: 'comp-1-2',
        orcamentoId: 'mock-1',
        nome: 'Materiais - Chapas e Perfis',
        tipo: 'materiais',
        bdi: {
          despesasAdministrativas: { percentual: 12, valor: 0 },
          despesasComerciais: { percentual: 5, valor: 0 },
          despesasFinanceiras: { percentual: 3, valor: 0 },
          impostosIndiretos: { percentual: 5, valor: 0 },
          percentualTotal: 25,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 2,
        itens: [
          {
            id: 'item-1-2-1',
            composicaoId: 'comp-1-2',
            codigo: 'MAT-CH-001',
            descricao: 'Chapa ASTM A 36 - 3/8" (9,5mm)',
            quantidade: 8500,
            unidade: 'kg',
            peso: 8500,
            material: 'ASTM A 36',
            especificacao: '3/8" (9,5mm)',
            valorUnitario: 8.5,
            subtotal: 72250,
            percentual: 0,
            tipoItem: 'material',
            tipoCalculo: 'kg',
            ordem: 1,
          },
          {
            id: 'item-1-2-2',
            composicaoId: 'comp-1-2',
            codigo: 'MAT-TU-001',
            descricao: 'Tubo ASTM A 53 GR B - SCH 40 Ø6"',
            quantidade: 1200,
            unidade: 'kg',
            peso: 1200,
            material: 'ASTM A 53 GR B',
            especificacao: 'SCH 40 Ø6"',
            valorUnitario: 12.8,
            subtotal: 15360,
            percentual: 0,
            tipoItem: 'material',
            tipoCalculo: 'kg',
            ordem: 2,
          },
          {
            id: 'item-1-2-3',
            composicaoId: 'comp-1-2',
            codigo: 'MAT-PF-001',
            descricao: 'Perfil I ASTM A 572 GR-50 - W150x22,5kg/m',
            quantidade: 650,
            unidade: 'kg',
            peso: 650,
            material: 'ASTM A 572 GR-50',
            especificacao: 'W150x22,5kg/m',
            valorUnitario: 9.2,
            subtotal: 5980,
            percentual: 0,
            tipoItem: 'material',
            tipoCalculo: 'kg',
            ordem: 3,
          },
        ],
      },
      {
        id: 'comp-1-3',
        orcamentoId: 'mock-1',
        nome: 'Mão de Obra - Fabricação',
        tipo: 'mo_fabricacao',
        bdi: {
          despesasAdministrativas: { percentual: 9, valor: 0 },
          despesasComerciais: { percentual: 4, valor: 0 },
          despesasFinanceiras: { percentual: 2, valor: 0 },
          impostosIndiretos: { percentual: 3, valor: 0 },
          percentualTotal: 18,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 3,
        itens: [
          {
            id: 'item-1-3-1',
            composicaoId: 'comp-1-3',
            codigo: 'MO-001',
            descricao: 'Soldador Especializado',
            quantidade: 320,
            unidade: 'HM (Hora Máquina)',
            peso: 1.8,
            valorUnitario: 45,
            subtotal: 25920,
            percentual: 0,
            tipoItem: 'mao_obra',
            tipoCalculo: 'hh',
            cargo: 'Soldador',
            encargos: { percentual: 50.72, valor: 0 },
            ordem: 1,
          },
          {
            id: 'item-1-3-2',
            composicaoId: 'comp-1-3',
            codigo: 'MO-002',
            descricao: 'Caldeireiro',
            quantidade: 280,
            unidade: 'HM (Hora Máquina)',
            peso: 1.6,
            valorUnitario: 38,
            subtotal: 17024,
            percentual: 0,
            tipoItem: 'mao_obra',
            tipoCalculo: 'hh',
            cargo: 'Caldeireiro',
            encargos: { percentual: 50.72, valor: 0 },
            ordem: 2,
          },
          {
            id: 'item-1-3-3',
            composicaoId: 'comp-1-3',
            codigo: 'MO-003',
            descricao: 'Ajudante',
            quantidade: 400,
            unidade: 'HM (Hora Máquina)',
            peso: 1.4,
            valorUnitario: 22,
            subtotal: 12320,
            percentual: 0,
            tipoItem: 'mao_obra',
            tipoCalculo: 'hh',
            cargo: 'Ajudante',
            encargos: { percentual: 50.72, valor: 0 },
            ordem: 3,
          },
        ],
      },
      {
        id: 'comp-1-4',
        orcamentoId: 'mock-1',
        nome: 'Consumíveis e Soldas',
        tipo: 'consumiveis',
        bdi: {
          despesasAdministrativas: { percentual: 10, valor: 0 },
          despesasComerciais: { percentual: 4, valor: 0 },
          despesasFinanceiras: { percentual: 3, valor: 0 },
          impostosIndiretos: { percentual: 3, valor: 0 },
          percentualTotal: 20,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 4,
        itens: [
          {
            id: 'item-1-4-1',
            composicaoId: 'comp-1-4',
            codigo: 'CONS-001',
            descricao: 'Eletrodo E7018 Ø3,25mm',
            quantidade: 180,
            unidade: 'kg',
            peso: 180,
            valorUnitario: 28.5,
            subtotal: 5130,
            percentual: 0,
            tipoItem: 'consumivel',
            ordem: 1,
          },
          {
            id: 'item-1-4-2',
            composicaoId: 'comp-1-4',
            codigo: 'CONS-002',
            descricao: 'Arame Tubular AWS E71T-1',
            quantidade: 95,
            unidade: 'kg',
            peso: 95,
            valorUnitario: 32.8,
            subtotal: 3116,
            percentual: 0,
            tipoItem: 'consumivel',
            ordem: 2,
          },
          {
            id: 'item-1-4-3',
            composicaoId: 'comp-1-4',
            codigo: 'CONS-003',
            descricao: 'Disco de Corte 9"',
            quantidade: 45,
            unidade: 'un',
            valorUnitario: 12.5,
            subtotal: 562.5,
            percentual: 0,
            tipoItem: 'consumivel',
            ordem: 3,
          },
        ],
      },
      {
        id: 'comp-1-5',
        orcamentoId: 'mock-1',
        nome: 'Jateamento e Pintura',
        tipo: 'jato_pintura',
        bdi: {
          despesasAdministrativas: { percentual: 11, valor: 0 },
          despesasComerciais: { percentual: 5, valor: 0 },
          despesasFinanceiras: { percentual: 3, valor: 0 },
          impostosIndiretos: { percentual: 3, valor: 0 },
          percentualTotal: 22,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 5,
        itens: [
          {
            id: 'item-1-5-1',
            composicaoId: 'comp-1-5',
            codigo: 'PINT-001',
            descricao: 'Jateamento Abrasivo SA 2,5',
            quantidade: 85.5,
            unidade: 'm²',
            valorUnitario: 45,
            subtotal: 3847.5,
            percentual: 0,
            tipoItem: 'outros',
            ordem: 1,
          },
          {
            id: 'item-1-5-2',
            composicaoId: 'comp-1-5',
            codigo: 'PINT-002',
            descricao: 'Primer Epóxi 80 micras',
            quantidade: 85.5,
            unidade: 'm²',
            valorUnitario: 38,
            subtotal: 3249,
            percentual: 0,
            tipoItem: 'consumivel',
            ordem: 2,
          },
          {
            id: 'item-1-5-3',
            composicaoId: 'comp-1-5',
            codigo: 'PINT-003',
            descricao: 'Tinta Poliuretano Alifático - Acabamento 60 micras',
            quantidade: 85.5,
            unidade: 'm²',
            valorUnitario: 52,
            subtotal: 4446,
            percentual: 0,
            tipoItem: 'consumivel',
            ordem: 3,
          },
        ],
      },
    ],
    custoDirectoTotal: 0,
    bdiTotal: 0,
    margemLucroTotal: 0,
    subtotal: 0,
    tributosTotal: 0,
    totalVenda: 0,
    dre: {
      receitaLiquida: 0,
      lucroBruto: 0,
      margemBruta: 0,
      lucroOperacional: 0,
      margemOperacional: 0,
      lucroLiquido: 0,
      margemLiquida: 0,
    },
    bdiMedio: 0,
    margemLucroMedia: 0,
    custoPorM2: 0,
    createdAt: '2026-01-15T08:30:00.000Z',
    updatedAt: '2026-01-18T14:25:00.000Z',
    createdBy: 1,
  },
  // ============================================
  // ORÇAMENTO 2: Produto - Estrutura Metálica
  // ============================================
  {
    id: 'mock-2',
    numero: 'P-001|2026',
    nome: 'Estrutura Metálica para Galpão Industrial 600m²',
    tipo: 'produto',
    clienteNome: 'Construtora XYZ S.A.',
    codigoProjeto: 'M-15802',
    areaTotalM2: 600,
    metrosLineares: 180,
    pesoTotalProjeto: 28000,
    tributos: {
      temISS: false,
      aliquotaISS: 3,
      aliquotaSimples: 11.8,
    },
    composicoes: [
      {
        id: 'comp-2-1',
        orcamentoId: 'mock-2',
        nome: 'Materiais - Perfis Estruturais',
        tipo: 'materiais',
        bdi: {
          despesasAdministrativas: { percentual: 13, valor: 0 },
          despesasComerciais: { percentual: 6, valor: 0 },
          despesasFinanceiras: { percentual: 4, valor: 0 },
          impostosIndiretos: { percentual: 5, valor: 0 },
          percentualTotal: 28,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 1,
        itens: [
          {
            id: 'item-2-1-1',
            composicaoId: 'comp-2-1',
            codigo: 'EST-001',
            descricao: 'Perfil I ASTM A 572 GR-50 - W310x38,7kg/m (Colunas)',
            quantidade: 15000,
            unidade: 'kg',
            peso: 15000,
            material: 'ASTM A 572 GR-50',
            especificacao: 'W310x38,7kg/m',
            valorUnitario: 9.8,
            subtotal: 147000,
            percentual: 0,
            tipoItem: 'material',
            tipoCalculo: 'kg',
            ordem: 1,
          },
          {
            id: 'item-2-1-2',
            composicaoId: 'comp-2-1',
            codigo: 'EST-002',
            descricao: 'Perfil I ASTM A 572 GR-50 - W250x28,4kg/m (Vigas)',
            quantidade: 9500,
            unidade: 'kg',
            peso: 9500,
            material: 'ASTM A 572 GR-50',
            especificacao: 'W250x28,4kg/m',
            valorUnitario: 9.5,
            subtotal: 90250,
            percentual: 0,
            tipoItem: 'material',
            tipoCalculo: 'kg',
            ordem: 2,
          },
          {
            id: 'item-2-1-3',
            composicaoId: 'comp-2-1',
            codigo: 'EST-003',
            descricao: 'Terça Perfil U ASTM A 36 - U127x13kg/m',
            quantidade: 2800,
            unidade: 'kg',
            peso: 2800,
            material: 'ASTM A 36',
            especificacao: 'U127x13kg/m',
            valorUnitario: 8.2,
            subtotal: 22960,
            percentual: 0,
            tipoItem: 'material',
            tipoCalculo: 'kg',
            ordem: 3,
          },
          {
            id: 'item-2-1-4',
            composicaoId: 'comp-2-1',
            codigo: 'EST-004',
            descricao: 'Contraventamento Barra Redonda SAE 1020 - Ø5/8"',
            quantidade: 700,
            unidade: 'kg',
            peso: 700,
            material: 'SAE 1020',
            especificacao: 'Ø5/8"',
            valorUnitario: 7.5,
            subtotal: 5250,
            percentual: 0,
            tipoItem: 'material',
            tipoCalculo: 'kg',
            ordem: 4,
          },
        ],
      },
      {
        id: 'comp-2-2',
        orcamentoId: 'mock-2',
        nome: 'Conexões e Fixações',
        tipo: 'materiais',
        bdi: {
          despesasAdministrativas: { percentual: 12, valor: 0 },
          despesasComerciais: { percentual: 5, valor: 0 },
          despesasFinanceiras: { percentual: 3, valor: 0 },
          impostosIndiretos: { percentual: 5, valor: 0 },
          percentualTotal: 25,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 2,
        itens: [
          {
            id: 'item-2-2-1',
            composicaoId: 'comp-2-2',
            codigo: 'FIX-001',
            descricao: 'Parafuso Estrutural ASTM A 325 - M20x80mm',
            quantidade: 850,
            unidade: 'un',
            valorUnitario: 18.5,
            subtotal: 15725,
            percentual: 0,
            tipoItem: 'material',
            ordem: 1,
          },
          {
            id: 'item-2-2-2',
            composicaoId: 'comp-2-2',
            codigo: 'FIX-002',
            descricao: 'Porca Estrutural ASTM A 563 - M20',
            quantidade: 1700,
            unidade: 'un',
            valorUnitario: 4.2,
            subtotal: 7140,
            percentual: 0,
            tipoItem: 'material',
            ordem: 2,
          },
          {
            id: 'item-2-2-3',
            composicaoId: 'comp-2-2',
            codigo: 'FIX-003',
            descricao: 'Arruela Lisa ASTM F 436 - M20',
            quantidade: 1700,
            unidade: 'un',
            valorUnitario: 2.8,
            subtotal: 4760,
            percentual: 0,
            tipoItem: 'material',
            ordem: 3,
          },
          {
            id: 'item-2-2-4',
            composicaoId: 'comp-2-2',
            codigo: 'FIX-004',
            descricao: 'Chumbador Químico M20x400mm',
            quantidade: 48,
            unidade: 'un',
            valorUnitario: 85,
            subtotal: 4080,
            percentual: 0,
            tipoItem: 'material',
            ordem: 4,
          },
        ],
      },
      {
        id: 'comp-2-3',
        orcamentoId: 'mock-2',
        nome: 'Mão de Obra - Montagem',
        tipo: 'mo_montagem',
        bdi: {
          despesasAdministrativas: { percentual: 8, valor: 0 },
          despesasComerciais: { percentual: 3, valor: 0 },
          despesasFinanceiras: { percentual: 2, valor: 0 },
          impostosIndiretos: { percentual: 3, valor: 0 },
          percentualTotal: 16,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 3,
        itens: [
          {
            id: 'item-2-3-1',
            composicaoId: 'comp-2-3',
            codigo: 'MONT-001',
            descricao: 'Montador Estrutural',
            quantidade: 480,
            unidade: 'HM (Hora Máquina)',
            peso: 1.5,
            valorUnitario: 42,
            subtotal: 30240,
            percentual: 0,
            tipoItem: 'mao_obra',
            tipoCalculo: 'hh',
            cargo: 'Montador',
            encargos: { percentual: 50.72, valor: 0 },
            ordem: 1,
          },
          {
            id: 'item-2-3-2',
            composicaoId: 'comp-2-3',
            codigo: 'MONT-002',
            descricao: 'Soldador',
            quantidade: 360,
            unidade: 'HM (Hora Máquina)',
            peso: 1.8,
            valorUnitario: 45,
            subtotal: 29160,
            percentual: 0,
            tipoItem: 'mao_obra',
            tipoCalculo: 'hh',
            cargo: 'Soldador',
            encargos: { percentual: 50.72, valor: 0 },
            ordem: 2,
          },
          {
            id: 'item-2-3-3',
            composicaoId: 'comp-2-3',
            codigo: 'MONT-003',
            descricao: 'Encarregado de Montagem',
            quantidade: 120,
            unidade: 'HM (Hora Máquina)',
            peso: 1.3,
            valorUnitario: 55,
            subtotal: 8580,
            percentual: 0,
            tipoItem: 'mao_obra',
            tipoCalculo: 'hh',
            cargo: 'Encarregado',
            encargos: { percentual: 50.72, valor: 0 },
            ordem: 3,
          },
        ],
      },
      {
        id: 'comp-2-4',
        orcamentoId: 'mock-2',
        nome: 'Ferramentas e Equipamentos',
        tipo: 'ferramentas',
        bdi: {
          despesasAdministrativas: { percentual: 6, valor: 0 },
          despesasComerciais: { percentual: 2, valor: 0 },
          despesasFinanceiras: { percentual: 2, valor: 0 },
          impostosIndiretos: { percentual: 2, valor: 0 },
          percentualTotal: 12,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 4,
        itens: [
          {
            id: 'item-2-4-1',
            composicaoId: 'comp-2-4',
            codigo: 'EQUIP-001',
            descricao: 'Locação Guindaste 30 ton',
            quantidade: 15,
            unidade: 'dia(s)',
            valorUnitario: 1800,
            subtotal: 27000,
            percentual: 0,
            tipoItem: 'ferramenta',
            ordem: 1,
          },
          {
            id: 'item-2-4-2',
            composicaoId: 'comp-2-4',
            codigo: 'EQUIP-002',
            descricao: 'Plataforma Elevatória 12m',
            quantidade: 20,
            unidade: 'dia(s)',
            valorUnitario: 450,
            subtotal: 9000,
            percentual: 0,
            tipoItem: 'ferramenta',
            ordem: 2,
          },
        ],
      },
      {
        id: 'comp-2-5',
        orcamentoId: 'mock-2',
        nome: 'Pintura e Acabamento',
        tipo: 'jato_pintura',
        bdi: {
          despesasAdministrativas: { percentual: 10, valor: 0 },
          despesasComerciais: { percentual: 4, valor: 0 },
          despesasFinanceiras: { percentual: 3, valor: 0 },
          impostosIndiretos: { percentual: 3, valor: 0 },
          percentualTotal: 20,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 5,
        itens: [
          {
            id: 'item-2-5-1',
            composicaoId: 'comp-2-5',
            codigo: 'PINT-011',
            descricao: 'Primer Anticorrosivo Zarcão',
            quantidade: 600,
            unidade: 'm²',
            valorUnitario: 22,
            subtotal: 13200,
            percentual: 0,
            tipoItem: 'consumivel',
            ordem: 1,
          },
          {
            id: 'item-2-5-2',
            composicaoId: 'comp-2-5',
            codigo: 'PINT-012',
            descricao: 'Esmalte Sintético Cinza - 2 demãos',
            quantidade: 600,
            unidade: 'm²',
            valorUnitario: 28,
            subtotal: 16800,
            percentual: 0,
            tipoItem: 'consumivel',
            ordem: 2,
          },
        ],
      },
    ],
    custoDirectoTotal: 0,
    bdiTotal: 0,
    margemLucroTotal: 0,
    subtotal: 0,
    tributosTotal: 0,
    totalVenda: 0,
    dre: {
      receitaLiquida: 0,
      lucroBruto: 0,
      margemBruta: 0,
      lucroOperacional: 0,
      margemOperacional: 0,
      lucroLiquido: 0,
      margemLiquida: 0,
    },
    bdiMedio: 0,
    margemLucroMedia: 0,
    custoPorM2: 0,
    createdAt: '2026-01-10T10:15:00.000Z',
    updatedAt: '2026-01-19T09:40:00.000Z',
    createdBy: 1,
  },
  // ============================================
  // ORÇAMENTO 3: Serviço - Plataforma de Acesso
  // ============================================
  {
    id: 'mock-3',
    numero: 'S-002|2026',
    nome: 'Montagem de Plataforma de Acesso e Passarelas',
    tipo: 'servico',
    clienteNome: 'Indústria Química BRZ',
    codigoProjeto: 'M-15803',
    areaTotalM2: 145,
    metrosLineares: 85,
    pesoTotalProjeto: 6800,
    tributos: {
      temISS: true,
      aliquotaISS: 3,
      aliquotaSimples: 11.8,
    },
    composicoes: [
      {
        id: 'comp-3-1',
        orcamentoId: 'mock-3',
        nome: 'Materiais - Plataforma',
        tipo: 'materiais',
        bdi: {
          despesasAdministrativas: { percentual: 12, valor: 0 },
          despesasComerciais: { percentual: 5, valor: 0 },
          despesasFinanceiras: { percentual: 4, valor: 0 },
          impostosIndiretos: { percentual: 5, valor: 0 },
          percentualTotal: 26,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 1,
        itens: [
          {
            id: 'item-3-1-1',
            composicaoId: 'comp-3-1',
            codigo: 'PLAT-001',
            descricao: 'Chapa Xadrez ASTM A 36 - 1/4" (6,35mm)',
            quantidade: 2200,
            unidade: 'kg',
            peso: 2200,
            material: 'ASTM A 36',
            especificacao: '1/4" (6,35mm)',
            valorUnitario: 10.5,
            subtotal: 23100,
            percentual: 0,
            tipoItem: 'material',
            tipoCalculo: 'kg',
            ordem: 1,
          },
          {
            id: 'item-3-1-2',
            composicaoId: 'comp-3-1',
            codigo: 'PLAT-002',
            descricao: 'Perfil I ASTM A 36 - W200x19,3kg/m (Vigas)',
            quantidade: 1800,
            unidade: 'kg',
            peso: 1800,
            material: 'ASTM A 36',
            especificacao: 'W200x19,3kg/m',
            valorUnitario: 8.8,
            subtotal: 15840,
            percentual: 0,
            tipoItem: 'material',
            tipoCalculo: 'kg',
            ordem: 2,
          },
          {
            id: 'item-3-1-3',
            composicaoId: 'comp-3-1',
            codigo: 'PLAT-003',
            descricao: 'Cantoneira ASTM A 36 - L76x76x6,35mm',
            quantidade: 950,
            unidade: 'kg',
            peso: 950,
            material: 'ASTM A 36',
            especificacao: 'L76x76x6,35mm',
            valorUnitario: 7.8,
            subtotal: 7410,
            percentual: 0,
            tipoItem: 'material',
            tipoCalculo: 'kg',
            ordem: 3,
          },
          {
            id: 'item-3-1-4',
            composicaoId: 'comp-3-1',
            codigo: 'PLAT-004',
            descricao: 'Tubo Estrutural ASTM A 500 - 50x50x3mm (Guarda-corpo)',
            quantidade: 680,
            unidade: 'kg',
            peso: 680,
            material: 'ASTM A 500',
            especificacao: '50x50x3mm',
            valorUnitario: 9.2,
            subtotal: 6256,
            percentual: 0,
            tipoItem: 'material',
            tipoCalculo: 'kg',
            ordem: 4,
          },
        ],
      },
      {
        id: 'comp-3-2',
        orcamentoId: 'mock-3',
        nome: 'Materiais - Escadas e Acessos',
        tipo: 'materiais',
        bdi: {
          despesasAdministrativas: { percentual: 11, valor: 0 },
          despesasComerciais: { percentual: 5, valor: 0 },
          despesasFinanceiras: { percentual: 3, valor: 0 },
          impostosIndiretos: { percentual: 5, valor: 0 },
          percentualTotal: 24,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 2,
        itens: [
          {
            id: 'item-3-2-1',
            composicaoId: 'comp-3-2',
            codigo: 'ESC-001',
            descricao: 'Degrau Metálico 80cm - Chapa Xadrez 3/16"',
            quantidade: 24,
            unidade: 'un',
            valorUnitario: 185,
            subtotal: 4440,
            percentual: 0,
            tipoItem: 'material',
            ordem: 1,
          },
          {
            id: 'item-3-2-2',
            composicaoId: 'comp-3-2',
            codigo: 'ESC-002',
            descricao: 'Montante de Escada - Perfil U76x38',
            quantidade: 420,
            unidade: 'kg',
            peso: 420,
            material: 'ASTM A 36',
            especificacao: 'U76x38',
            valorUnitario: 8.5,
            subtotal: 3570,
            percentual: 0,
            tipoItem: 'material',
            tipoCalculo: 'kg',
            ordem: 2,
          },
        ],
      },
      {
        id: 'comp-3-3',
        orcamentoId: 'mock-3',
        nome: 'Mão de Obra - Montagem',
        tipo: 'mo_montagem',
        bdi: {
          despesasAdministrativas: { percentual: 9, valor: 0 },
          despesasComerciais: { percentual: 3, valor: 0 },
          despesasFinanceiras: { percentual: 2, valor: 0 },
          impostosIndiretos: { percentual: 3, valor: 0 },
          percentualTotal: 17,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 3,
        itens: [
          {
            id: 'item-3-3-1',
            composicaoId: 'comp-3-3',
            codigo: 'MONT-101',
            descricao: 'Montador de Estruturas',
            quantidade: 240,
            unidade: 'HM (Hora Máquina)',
            peso: 1.5,
            valorUnitario: 42,
            subtotal: 15120,
            percentual: 0,
            tipoItem: 'mao_obra',
            tipoCalculo: 'hh',
            cargo: 'Montador',
            encargos: { percentual: 50.72, valor: 0 },
            ordem: 1,
          },
          {
            id: 'item-3-3-2',
            composicaoId: 'comp-3-3',
            codigo: 'MONT-102',
            descricao: 'Soldador',
            quantidade: 160,
            unidade: 'HM (Hora Máquina)',
            peso: 1.8,
            valorUnitario: 45,
            subtotal: 12960,
            percentual: 0,
            tipoItem: 'mao_obra',
            tipoCalculo: 'hh',
            cargo: 'Soldador',
            encargos: { percentual: 50.72, valor: 0 },
            ordem: 2,
          },
          {
            id: 'item-3-3-3',
            composicaoId: 'comp-3-3',
            codigo: 'MONT-103',
            descricao: 'Ajudante de Montagem',
            quantidade: 200,
            unidade: 'HM (Hora Máquina)',
            peso: 1.4,
            valorUnitario: 22,
            subtotal: 6160,
            percentual: 0,
            tipoItem: 'mao_obra',
            tipoCalculo: 'hh',
            cargo: 'Ajudante',
            encargos: { percentual: 50.72, valor: 0 },
            ordem: 3,
          },
        ],
      },
      {
        id: 'comp-3-4',
        orcamentoId: 'mock-3',
        nome: 'Consumíveis',
        tipo: 'consumiveis',
        bdi: {
          despesasAdministrativas: { percentual: 9, valor: 0 },
          despesasComerciais: { percentual: 4, valor: 0 },
          despesasFinanceiras: { percentual: 2, valor: 0 },
          impostosIndiretos: { percentual: 3, valor: 0 },
          percentualTotal: 18,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 4,
        itens: [
          {
            id: 'item-3-4-1',
            composicaoId: 'comp-3-4',
            codigo: 'CONS-101',
            descricao: 'Eletrodo E6013 Ø3,25mm',
            quantidade: 65,
            unidade: 'kg',
            peso: 65,
            valorUnitario: 24.5,
            subtotal: 1592.5,
            percentual: 0,
            tipoItem: 'consumivel',
            ordem: 1,
          },
          {
            id: 'item-3-4-2',
            composicaoId: 'comp-3-4',
            codigo: 'CONS-102',
            descricao: 'Disco de Corte 7"',
            quantidade: 30,
            unidade: 'un',
            valorUnitario: 8.5,
            subtotal: 255,
            percentual: 0,
            tipoItem: 'consumivel',
            ordem: 2,
          },
          {
            id: 'item-3-4-3',
            composicaoId: 'comp-3-4',
            codigo: 'CONS-103',
            descricao: 'Disco de Desbaste 7"',
            quantidade: 25,
            unidade: 'un',
            valorUnitario: 9.2,
            subtotal: 230,
            percentual: 0,
            tipoItem: 'consumivel',
            ordem: 3,
          },
        ],
      },
      {
        id: 'comp-3-5',
        orcamentoId: 'mock-3',
        nome: 'Terceiros - Testes e Inspeção',
        tipo: 'materiais',
        bdi: {
          despesasAdministrativas: { percentual: 5, valor: 0 },
          despesasComerciais: { percentual: 2, valor: 0 },
          despesasFinanceiras: { percentual: 1, valor: 0 },
          impostosIndiretos: { percentual: 2, valor: 0 },
          percentualTotal: 10,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 5,
        itens: [
          {
            id: 'item-3-5-1',
            composicaoId: 'comp-3-5',
            codigo: 'INSP-001',
            descricao: 'Inspeção por Ultrassom (US) em Soldas',
            quantidade: 35,
            unidade: 'un',
            valorUnitario: 120,
            subtotal: 4200,
            percentual: 0,
            tipoItem: 'terceiros',
            ordem: 1,
          },
          {
            id: 'item-3-5-2',
            composicaoId: 'comp-3-5',
            codigo: 'INSP-002',
            descricao: 'Teste de Carga - Plataforma',
            quantidade: 1,
            unidade: 'un',
            valorUnitario: 3500,
            subtotal: 3500,
            percentual: 0,
            tipoItem: 'terceiros',
            ordem: 2,
          },
          {
            id: 'item-3-5-3',
            composicaoId: 'comp-3-5',
            codigo: 'INSP-003',
            descricao: 'Emissão de ART e Laudos Técnicos',
            quantidade: 1,
            unidade: 'un',
            valorUnitario: 1800,
            subtotal: 1800,
            percentual: 0,
            tipoItem: 'terceiros',
            ordem: 3,
          },
        ],
      },
      {
        id: 'comp-3-6',
        orcamentoId: 'mock-3',
        nome: 'Pintura Industrial',
        tipo: 'jato_pintura',
        bdi: {
          despesasAdministrativas: { percentual: 9, valor: 0 },
          despesasComerciais: { percentual: 4, valor: 0 },
          despesasFinanceiras: { percentual: 3, valor: 0 },
          impostosIndiretos: { percentual: 3, valor: 0 },
          percentualTotal: 19,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 6,
        itens: [
          {
            id: 'item-3-6-1',
            composicaoId: 'comp-3-6',
            codigo: 'PINT-021',
            descricao: 'Lixamento Manual e Limpeza',
            quantidade: 145,
            unidade: 'm²',
            valorUnitario: 12,
            subtotal: 1740,
            percentual: 0,
            tipoItem: 'mao_obra',
            ordem: 1,
          },
          {
            id: 'item-3-6-2',
            composicaoId: 'comp-3-6',
            codigo: 'PINT-022',
            descricao: 'Primer Epóxi - 1 demão',
            quantidade: 145,
            unidade: 'm²',
            valorUnitario: 28,
            subtotal: 4060,
            percentual: 0,
            tipoItem: 'consumivel',
            ordem: 2,
          },
          {
            id: 'item-3-6-3',
            composicaoId: 'comp-3-6',
            codigo: 'PINT-023',
            descricao: 'Esmalte Sintético Amarelo Segurança - 2 demãos',
            quantidade: 145,
            unidade: 'm²',
            valorUnitario: 35,
            subtotal: 5075,
            percentual: 0,
            tipoItem: 'consumivel',
            ordem: 3,
          },
        ],
      },
    ],
    custoDirectoTotal: 0,
    bdiTotal: 0,
    margemLucroTotal: 0,
    subtotal: 0,
    tributosTotal: 0,
    totalVenda: 0,
    dre: {
      receitaLiquida: 0,
      lucroBruto: 0,
      margemBruta: 0,
      lucroOperacional: 0,
      margemOperacional: 0,
      lucroLiquido: 0,
      margemLiquida: 0,
    },
    bdiMedio: 0,
    margemLucroMedia: 0,
    custoPorM2: 0,
    createdAt: '2026-01-12T13:20:00.000Z',
    updatedAt: '2026-01-19T11:15:00.000Z',
    createdBy: 1,
  },
  // ============================================
  // ORÇAMENTO 4: Produto - Escada Marinheiro
  // ============================================
  {
    id: 'mock-4',
    numero: 'P-002|2026',
    nome: 'Escada Marinheiro Industrial com Gaiola de Proteção 18m',
    tipo: 'produto',
    clienteNome: 'Mineração Sul Brasil Ltda',
    codigoProjeto: 'M-15804',
    areaTotalM2: 28,
    metrosLineares: 18,
    pesoTotalProjeto: 1850,
    tributos: {
      temISS: false,
      aliquotaISS: 3,
      aliquotaSimples: 11.8,
    },
    composicoes: [
      {
        id: 'comp-4-1',
        orcamentoId: 'mock-4',
        nome: 'Materiais - Estrutura da Escada',
        tipo: 'materiais',
        bdi: {
          despesasAdministrativas: { percentual: 14, valor: 0 },
          despesasComerciais: { percentual: 6, valor: 0 },
          despesasFinanceiras: { percentual: 5, valor: 0 },
          impostosIndiretos: { percentual: 5, valor: 0 },
          percentualTotal: 30,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 1,
        itens: [
          {
            id: 'item-4-1-1',
            composicaoId: 'comp-4-1',
            codigo: 'ESC-101',
            descricao: 'Montante Cantoneira ASTM A 36 - L76x76x9,5mm',
            quantidade: 720,
            unidade: 'kg',
            peso: 720,
            material: 'ASTM A 36',
            especificacao: 'L76x76x9,5mm',
            valorUnitario: 8.5,
            subtotal: 6120,
            percentual: 0,
            tipoItem: 'material',
            tipoCalculo: 'kg',
            ordem: 1,
          },
          {
            id: 'item-4-1-2',
            composicaoId: 'comp-4-1',
            codigo: 'ESC-102',
            descricao: 'Degraus Barra Redonda SAE 1020 - Ø1" (25,4mm)',
            quantidade: 280,
            unidade: 'kg',
            peso: 280,
            material: 'SAE 1020',
            especificacao: 'Ø1" (25,4mm)',
            valorUnitario: 9.8,
            subtotal: 2744,
            percentual: 0,
            tipoItem: 'material',
            tipoCalculo: 'kg',
            ordem: 2,
          },
          {
            id: 'item-4-1-3',
            composicaoId: 'comp-4-1',
            codigo: 'ESC-103',
            descricao: 'Fixação Chapa de Base 200x200x12,5mm ASTM A 36',
            quantidade: 4,
            unidade: 'un',
            valorUnitario: 95,
            subtotal: 380,
            percentual: 0,
            tipoItem: 'material',
            ordem: 3,
          },
        ],
      },
      {
        id: 'comp-4-2',
        orcamentoId: 'mock-4',
        nome: 'Materiais - Gaiola de Proteção',
        tipo: 'materiais',
        bdi: {
          despesasAdministrativas: { percentual: 13, valor: 0 },
          despesasComerciais: { percentual: 6, valor: 0 },
          despesasFinanceiras: { percentual: 4, valor: 0 },
          impostosIndiretos: { percentual: 5, valor: 0 },
          percentualTotal: 28,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 2,
        itens: [
          {
            id: 'item-4-2-1',
            composicaoId: 'comp-4-2',
            codigo: 'GAI-001',
            descricao: 'Tubo Estrutural ASTM A 500 - Ø1.1/2" (38,1mm) SCH 40',
            quantidade: 420,
            unidade: 'kg',
            peso: 420,
            material: 'ASTM A 500',
            especificacao: 'Ø1.1/2" SCH 40',
            valorUnitario: 11.2,
            subtotal: 4704,
            percentual: 0,
            tipoItem: 'material',
            tipoCalculo: 'kg',
            ordem: 1,
          },
          {
            id: 'item-4-2-2',
            composicaoId: 'comp-4-2',
            codigo: 'GAI-002',
            descricao: 'Aro Proteção - Barra Redonda SAE 1020 Ø5/8"',
            quantidade: 180,
            unidade: 'kg',
            peso: 180,
            material: 'SAE 1020',
            especificacao: 'Ø5/8"',
            valorUnitario: 8.9,
            subtotal: 1602,
            percentual: 0,
            tipoItem: 'material',
            tipoCalculo: 'kg',
            ordem: 2,
          },
        ],
      },
      {
        id: 'comp-4-3',
        orcamentoId: 'mock-4',
        nome: 'Materiais - Fixações e Conexões',
        tipo: 'materiais',
        bdi: {
          despesasAdministrativas: { percentual: 11, valor: 0 },
          despesasComerciais: { percentual: 5, valor: 0 },
          despesasFinanceiras: { percentual: 3, valor: 0 },
          impostosIndiretos: { percentual: 3, valor: 0 },
          percentualTotal: 22,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 3,
        itens: [
          {
            id: 'item-4-3-1',
            composicaoId: 'comp-4-3',
            codigo: 'FIX-101',
            descricao: 'Parafuso Olhal M16x150mm ASTM A 307',
            quantidade: 120,
            unidade: 'un',
            valorUnitario: 12.5,
            subtotal: 1500,
            percentual: 0,
            tipoItem: 'material',
            ordem: 1,
          },
          {
            id: 'item-4-3-2',
            composicaoId: 'comp-4-3',
            codigo: 'FIX-102',
            descricao: 'Porca Sextavada M16 ASTM A 563',
            quantidade: 240,
            unidade: 'un',
            valorUnitario: 2.8,
            subtotal: 672,
            percentual: 0,
            tipoItem: 'material',
            ordem: 2,
          },
          {
            id: 'item-4-3-3',
            composicaoId: 'comp-4-3',
            codigo: 'FIX-103',
            descricao: 'Arruela Lisa M16 ASTM F 436',
            quantidade: 240,
            unidade: 'un',
            valorUnitario: 1.5,
            subtotal: 360,
            percentual: 0,
            tipoItem: 'material',
            ordem: 3,
          },
          {
            id: 'item-4-3-4',
            composicaoId: 'comp-4-3',
            codigo: 'FIX-104',
            descricao: 'Chumbador Expansão M16x200mm',
            quantidade: 16,
            unidade: 'un',
            valorUnitario: 45,
            subtotal: 720,
            percentual: 0,
            tipoItem: 'material',
            ordem: 4,
          },
        ],
      },
      {
        id: 'comp-4-4',
        orcamentoId: 'mock-4',
        nome: 'Mão de Obra - Fabricação',
        tipo: 'mo_fabricacao',
        bdi: {
          despesasAdministrativas: { percentual: 8, valor: 0 },
          despesasComerciais: { percentual: 3, valor: 0 },
          despesasFinanceiras: { percentual: 2, valor: 0 },
          impostosIndiretos: { percentual: 3, valor: 0 },
          percentualTotal: 16,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 4,
        itens: [
          {
            id: 'item-4-4-1',
            composicaoId: 'comp-4-4',
            codigo: 'MO-201',
            descricao: 'Caldeireiro',
            quantidade: 80,
            unidade: 'HM (Hora Máquina)',
            peso: 1.6,
            valorUnitario: 38,
            subtotal: 4864,
            percentual: 0,
            tipoItem: 'mao_obra',
            tipoCalculo: 'hh',
            cargo: 'Caldeireiro',
            encargos: { percentual: 50.72, valor: 0 },
            ordem: 1,
          },
          {
            id: 'item-4-4-2',
            composicaoId: 'comp-4-4',
            codigo: 'MO-202',
            descricao: 'Soldador',
            quantidade: 60,
            unidade: 'HM (Hora Máquina)',
            peso: 1.8,
            valorUnitario: 45,
            subtotal: 4860,
            percentual: 0,
            tipoItem: 'mao_obra',
            tipoCalculo: 'hh',
            cargo: 'Soldador',
            encargos: { percentual: 50.72, valor: 0 },
            ordem: 2,
          },
          {
            id: 'item-4-4-3',
            composicaoId: 'comp-4-4',
            codigo: 'MO-203',
            descricao: 'Ajudante',
            quantidade: 70,
            unidade: 'HM (Hora Máquina)',
            peso: 1.4,
            valorUnitario: 22,
            subtotal: 2156,
            percentual: 0,
            tipoItem: 'mao_obra',
            tipoCalculo: 'hh',
            cargo: 'Ajudante',
            encargos: { percentual: 50.72, valor: 0 },
            ordem: 3,
          },
        ],
      },
      {
        id: 'comp-4-5',
        orcamentoId: 'mock-4',
        nome: 'Consumíveis',
        tipo: 'consumiveis',
        bdi: {
          despesasAdministrativas: { percentual: 9, valor: 0 },
          despesasComerciais: { percentual: 4, valor: 0 },
          despesasFinanceiras: { percentual: 2, valor: 0 },
          impostosIndiretos: { percentual: 3, valor: 0 },
          percentualTotal: 18,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 5,
        itens: [
          {
            id: 'item-4-5-1',
            composicaoId: 'comp-4-5',
            codigo: 'CONS-201',
            descricao: 'Eletrodo E6013 Ø2,5mm',
            quantidade: 25,
            unidade: 'kg',
            peso: 25,
            valorUnitario: 24.5,
            subtotal: 612.5,
            percentual: 0,
            tipoItem: 'consumivel',
            ordem: 1,
          },
          {
            id: 'item-4-5-2',
            composicaoId: 'comp-4-5',
            codigo: 'CONS-202',
            descricao: 'Disco de Corte 7"',
            quantidade: 18,
            unidade: 'un',
            valorUnitario: 8.5,
            subtotal: 153,
            percentual: 0,
            tipoItem: 'consumivel',
            ordem: 2,
          },
          {
            id: 'item-4-5-3',
            composicaoId: 'comp-4-5',
            codigo: 'CONS-203',
            descricao: 'Lixa de Ferro Grão 80',
            quantidade: 40,
            unidade: 'un',
            valorUnitario: 3.2,
            subtotal: 128,
            percentual: 0,
            tipoItem: 'consumivel',
            ordem: 3,
          },
        ],
      },
      {
        id: 'comp-4-6',
        orcamentoId: 'mock-4',
        nome: 'Tratamento Superficial',
        tipo: 'jato_pintura',
        bdi: {
          despesasAdministrativas: { percentual: 10, valor: 0 },
          despesasComerciais: { percentual: 4, valor: 0 },
          despesasFinanceiras: { percentual: 3, valor: 0 },
          impostosIndiretos: { percentual: 3, valor: 0 },
          percentualTotal: 20,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 6,
        itens: [
          {
            id: 'item-4-6-1',
            composicaoId: 'comp-4-6',
            codigo: 'TRAT-001',
            descricao: 'Lixamento e Escovamento',
            quantidade: 28,
            unidade: 'm²',
            valorUnitario: 15,
            subtotal: 420,
            percentual: 0,
            tipoItem: 'mao_obra',
            ordem: 1,
          },
          {
            id: 'item-4-6-2',
            composicaoId: 'comp-4-6',
            codigo: 'TRAT-002',
            descricao: 'Primer Wash Primer - 1 demão',
            quantidade: 28,
            unidade: 'm²',
            valorUnitario: 18,
            subtotal: 504,
            percentual: 0,
            tipoItem: 'consumivel',
            ordem: 2,
          },
          {
            id: 'item-4-6-3',
            composicaoId: 'comp-4-6',
            codigo: 'TRAT-003',
            descricao: 'Esmalte Sintético Amarelo - 2 demãos',
            quantidade: 28,
            unidade: 'm²',
            valorUnitario: 32,
            subtotal: 896,
            percentual: 0,
            tipoItem: 'consumivel',
            ordem: 3,
          },
        ],
      },
      {
        id: 'comp-4-7',
        orcamentoId: 'mock-4',
        nome: 'Embalagem e Transporte',
        tipo: 'materiais',
        bdi: {
          despesasAdministrativas: { percentual: 6, valor: 0 },
          despesasComerciais: { percentual: 2, valor: 0 },
          despesasFinanceiras: { percentual: 2, valor: 0 },
          impostosIndiretos: { percentual: 2, valor: 0 },
          percentualTotal: 12,
          valorTotal: 0,
        },
        margemLucro: { percentual: 7, valor: 0 },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: 7,
        itens: [
          {
            id: 'item-4-7-1',
            composicaoId: 'comp-4-7',
            codigo: 'EMB-001',
            descricao: 'Embalagem em Madeira para Transporte',
            quantidade: 1,
            unidade: 'un',
            valorUnitario: 850,
            subtotal: 850,
            percentual: 0,
            tipoItem: 'outros',
            ordem: 1,
          },
          {
            id: 'item-4-7-2',
            composicaoId: 'comp-4-7',
            codigo: 'EMB-002',
            descricao: 'Frete até Cliente (caminhão truck)',
            quantidade: 1,
            unidade: 'un',
            valorUnitario: 2200,
            subtotal: 2200,
            percentual: 0,
            tipoItem: 'outros',
            ordem: 2,
          },
        ],
      },
    ],
    custoDirectoTotal: 0,
    bdiTotal: 0,
    margemLucroTotal: 0,
    subtotal: 0,
    tributosTotal: 0,
    totalVenda: 0,
    dre: {
      receitaLiquida: 0,
      lucroBruto: 0,
      margemBruta: 0,
      lucroOperacional: 0,
      margemOperacional: 0,
      lucroLiquido: 0,
      margemLiquida: 0,
    },
    bdiMedio: 0,
    margemLucroMedia: 0,
    custoPorM2: 0,
    createdAt: '2026-01-14T09:45:00.000Z',
    updatedAt: '2026-01-19T10:30:00.000Z',
    createdBy: 1,
  },
].map(recalcularOrcamento); // Recalcula todos os valores e DRE

let mockIdCounter = 5;
let mockServicoCounter = 2; // Já temos S-001 e S-002
let mockProdutoCounter = 2; // Já temos P-001 e P-002

const generateMockOrcamento = (data: CreateOrcamento): Orcamento => {
  const id = `mock-${mockIdCounter++}`;

  // Gerar número no formato: S-001|2026 (serviço) ou P-001|2026 (produto)
  const ano = new Date().getFullYear();
  let numero: string;

  if (data.tipo === 'servico') {
    mockServicoCounter++;
    numero = `S-${String(mockServicoCounter).padStart(3, '0')}|${ano}`;
  } else {
    mockProdutoCounter++;
    numero = `P-${String(mockProdutoCounter).padStart(3, '0')}|${ano}`;
  }

  const orcamento: Orcamento = {
    id,
    numero,
    nome: data.nome,
    tipo: data.tipo,
    clienteNome: data.clienteNome,
    codigoProjeto: data.codigoProjeto,
    areaTotalM2: data.areaTotalM2,
    metrosLineares: data.metrosLineares,
    pesoTotalProjeto: data.pesoTotalProjeto,
    composicoes: [],
    tributos: data.tributos || {
      temISS: false,
      aliquotaISS: 3,
      aliquotaSimples: 11.8,
    },
    custoDirectoTotal: 0,
    bdiTotal: 0,
    margemLucroTotal: 0,
    subtotal: 0,
    tributosTotal: 0,
    totalVenda: 0,
    dre: {
      receitaLiquida: 0,
      lucroBruto: 0,
      margemBruta: 0,
      lucroOperacional: 0,
      margemOperacional: 0,
      lucroLiquido: 0,
      margemLiquida: 0,
    },
    bdiMedio: 0,
    custoPorM2: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 1,
  };

  return orcamento;
};

class OrcamentoService {
  async create(data: CreateOrcamento): Promise<Orcamento> {
    if (USE_MOCK) {
      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 500));

      const orcamento = generateMockOrcamento(data);
      mockOrcamentos.push(orcamento);
      return orcamento;
    }

    try {
      const response = await axios.post(URL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      throw error;
    }
  }

  async getAll(): Promise<Orcamento[]> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [...mockOrcamentos];
    }

    try {
      const response = await axios.get(URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Orcamento> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const orcamento = mockOrcamentos.find((o) => o.id === id);
      if (!orcamento) {
        throw new Error('Orçamento não encontrado');
      }

      // Recalcular valores antes de retornar
      const valores = calcularValoresOrcamento(orcamento);
      const dre = calcularDRE(orcamento);

      return {
        ...orcamento,
        ...valores,
        dre,
      };
    }

    try {
      const response = await axios.get(`${URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<UpdateOrcamento>): Promise<Orcamento> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const index = mockOrcamentos.findIndex((o) => o.id === id);
      if (index === -1) {
        throw new Error('Orçamento não encontrado');
      }

      mockOrcamentos[index] = {
        ...mockOrcamentos[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      return mockOrcamentos[index];
    }

    try {
      const response = await axios.put(`${URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const index = mockOrcamentos.findIndex((o) => o.id === id);
      if (index !== -1) {
        mockOrcamentos.splice(index, 1);
      }
      return;
    }

    try {
      await axios.delete(`${URL}/${id}`);
    } catch (error) {
      console.error('Erro ao deletar orçamento:', error);
      throw error;
    }
  }

  async clonar(id: string): Promise<Orcamento> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const original = mockOrcamentos.find((o) => o.id === id);
      if (!original) {
        throw new Error('Orçamento não encontrado');
      }

      const clonado = generateMockOrcamento({
        nome: `${original.nome} (Cópia)`,
        clienteNome: original.clienteNome,
        codigoProjeto: original.codigoProjeto,
        areaTotalM2: original.areaTotalM2,
        metrosLineares: original.metrosLineares,
        pesoTotalProjeto: original.pesoTotalProjeto,
        tributos: original.tributos,
      });

      clonado.composicoes = JSON.parse(JSON.stringify(original.composicoes));
      mockOrcamentos.push(clonado);
      return clonado;
    }

    try {
      const response = await axios.post(`${URL}/${id}/clonar`);
      return response.data;
    } catch (error) {
      console.error('Erro ao clonar orçamento:', error);
      throw error;
    }
  }

  async calcular(id: string): Promise<Orcamento> {
    try {
      const response = await axios.get(`${URL}/${id}/calcular`);
      return response.data;
    } catch (error) {
      console.error('Erro ao calcular orçamento:', error);
      throw error;
    }
  }

  async getProximoNumero(): Promise<string> {
    try {
      const response = await axios.get(`${URL}/numero/proximo`);
      return response.data.numero;
    } catch (error) {
      console.error('Erro ao obter próximo número:', error);
      throw error;
    }
  }

  async getByCliente(cnpj: string): Promise<Orcamento[]> {
    try {
      const response = await axios.get(`${URL}/cliente/${cnpj}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar orçamentos do cliente:', error);
      throw error;
    }
  }

  async getAnaliseABC(id: string): Promise<any> {
    try {
      const response = await axios.get(`${URL}/${id}/analise-abc`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar análise ABC:', error);
      throw error;
    }
  }

  async getDRE(id: string): Promise<any> {
    try {
      const response = await axios.get(`${URL}/${id}/dre`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar DRE:', error);
      throw error;
    }
  }
}

export default new OrcamentoService();
