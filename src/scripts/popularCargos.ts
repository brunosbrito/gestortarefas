/**
 * Script para popular cargos iniciais no sistema
 * Execute no console do navegador após abrir a aplicação
 */

import { CargoService } from '@/services/CargoService';
import { CreateCargo } from '@/interfaces/CargoInterface';

const cargosIniciais: CreateCargo[] = [
  {
    nome: 'Ajudante Geral',
    categoria: 'ambos',
    tipoContrato: 'mensalista',
    salarioBase: 1650.0,
    temPericulosidade: false,
    grauInsalubridade: 'nenhum',
    horasMes: 184,
    custos: {
      alimentacao: {
        cafeManha: 8.0,
        almoco: 18.0,
        janta: 0,
        cestaBasica: 0,
      },
      transporte: 12.0,
      uniforme: 5.0,
      despesasAdmissionais: 3.0,
      assistenciaMedica: 15.0,
      epiEpc: 8.0,
      outros: 0,
    },
    observacoes: 'Auxiliar em atividades gerais de fabricação e montagem',
  },
  {
    nome: 'Caldeireiro',
    categoria: 'fabricacao',
    tipoContrato: 'mensalista',
    salarioBase: 2800.0,
    temPericulosidade: false,
    grauInsalubridade: 'medio',
    horasMes: 184,
    custos: {
      alimentacao: {
        cafeManha: 8.0,
        almoco: 18.0,
        janta: 0,
        cestaBasica: 0,
      },
      transporte: 12.0,
      uniforme: 8.0,
      despesasAdmissionais: 3.0,
      assistenciaMedica: 20.0,
      epiEpc: 15.0,
      outros: 0,
    },
    observacoes: 'Profissional de caldeiraria industrial',
  },
  {
    nome: 'Carpinteiro',
    categoria: 'fabricacao',
    tipoContrato: 'mensalista',
    salarioBase: 2200.0,
    temPericulosidade: false,
    grauInsalubridade: 'minimo',
    horasMes: 184,
    custos: {
      alimentacao: {
        cafeManha: 8.0,
        almoco: 18.0,
        janta: 0,
        cestaBasica: 0,
      },
      transporte: 12.0,
      uniforme: 6.0,
      despesasAdmissionais: 3.0,
      assistenciaMedica: 18.0,
      epiEpc: 10.0,
      outros: 0,
    },
    observacoes: 'Execução de trabalhos em madeira',
  },
  {
    nome: 'Eletricista Industrial',
    categoria: 'ambos',
    tipoContrato: 'mensalista',
    salarioBase: 3200.0,
    temPericulosidade: true,
    grauInsalubridade: 'nenhum',
    horasMes: 184,
    custos: {
      alimentacao: {
        cafeManha: 8.0,
        almoco: 18.0,
        janta: 0,
        cestaBasica: 0,
      },
      transporte: 12.0,
      uniforme: 8.0,
      despesasAdmissionais: 3.0,
      assistenciaMedica: 22.0,
      epiEpc: 20.0,
      outros: 0,
    },
    observacoes: 'Instalações elétricas industriais - periculosidade devido trabalho com eletricidade',
  },
  {
    nome: 'Encarregado de Produção',
    categoria: 'fabricacao',
    tipoContrato: 'mensalista',
    salarioBase: 4500.0,
    temPericulosidade: false,
    grauInsalubridade: 'nenhum',
    horasMes: 184,
    custos: {
      alimentacao: {
        cafeManha: 10.0,
        almoco: 22.0,
        janta: 0,
        cestaBasica: 80.0,
      },
      transporte: 15.0,
      uniforme: 10.0,
      despesasAdmissionais: 3.0,
      assistenciaMedica: 30.0,
      epiEpc: 12.0,
      outros: 0,
    },
    observacoes: 'Supervisão e coordenação da produção',
  },
  {
    nome: 'Ferramenteiro',
    categoria: 'fabricacao',
    tipoContrato: 'mensalista',
    salarioBase: 3800.0,
    temPericulosidade: false,
    grauInsalubridade: 'minimo',
    horasMes: 184,
    custos: {
      alimentacao: {
        cafeManha: 8.0,
        almoco: 18.0,
        janta: 0,
        cestaBasica: 0,
      },
      transporte: 12.0,
      uniforme: 8.0,
      despesasAdmissionais: 3.0,
      assistenciaMedica: 22.0,
      epiEpc: 15.0,
      outros: 0,
    },
    observacoes: 'Confecção e manutenção de ferramentas e matrizes',
  },
  {
    nome: 'Montador Industrial',
    categoria: 'montagem',
    tipoContrato: 'mensalista',
    salarioBase: 2400.0,
    temPericulosidade: false,
    grauInsalubridade: 'nenhum',
    horasMes: 184,
    custos: {
      alimentacao: {
        cafeManha: 8.0,
        almoco: 18.0,
        janta: 0,
        cestaBasica: 0,
      },
      transporte: 12.0,
      uniforme: 7.0,
      despesasAdmissionais: 3.0,
      assistenciaMedica: 18.0,
      epiEpc: 12.0,
      outros: 0,
    },
    observacoes: 'Montagem de estruturas e equipamentos no campo',
  },
  {
    nome: 'Operador de Ponte Rolante',
    categoria: 'fabricacao',
    tipoContrato: 'mensalista',
    salarioBase: 2600.0,
    temPericulosidade: false,
    grauInsalubridade: 'nenhum',
    horasMes: 184,
    custos: {
      alimentacao: {
        cafeManha: 8.0,
        almoco: 18.0,
        janta: 0,
        cestaBasica: 0,
      },
      transporte: 12.0,
      uniforme: 6.0,
      despesasAdmissionais: 3.0,
      assistenciaMedica: 18.0,
      epiEpc: 10.0,
      outros: 0,
    },
    observacoes: 'Operação de equipamentos de movimentação de cargas',
  },
  {
    nome: 'Pintor Industrial',
    categoria: 'fabricacao',
    tipoContrato: 'mensalista',
    salarioBase: 2100.0,
    temPericulosidade: false,
    grauInsalubridade: 'medio',
    horasMes: 184,
    custos: {
      alimentacao: {
        cafeManha: 8.0,
        almoco: 18.0,
        janta: 0,
        cestaBasica: 0,
      },
      transporte: 12.0,
      uniforme: 7.0,
      despesasAdmissionais: 3.0,
      assistenciaMedica: 18.0,
      epiEpc: 18.0,
      outros: 0,
    },
    observacoes: 'Preparação e pintura de superfícies metálicas',
  },
  {
    nome: 'Serralheiro',
    categoria: 'fabricacao',
    tipoContrato: 'mensalista',
    salarioBase: 2500.0,
    temPericulosidade: false,
    grauInsalubridade: 'minimo',
    horasMes: 184,
    custos: {
      alimentacao: {
        cafeManha: 8.0,
        almoco: 18.0,
        janta: 0,
        cestaBasica: 0,
      },
      transporte: 12.0,
      uniforme: 7.0,
      despesasAdmissionais: 3.0,
      assistenciaMedica: 18.0,
      epiEpc: 12.0,
      outros: 0,
    },
    observacoes: 'Confecção e instalação de esquadrias e estruturas metálicas',
  },
  {
    nome: 'Soldador',
    categoria: 'ambos',
    tipoContrato: 'mensalista',
    salarioBase: 3000.0,
    temPericulosidade: false,
    grauInsalubridade: 'medio',
    horasMes: 184,
    custos: {
      alimentacao: {
        cafeManha: 8.0,
        almoco: 18.0,
        janta: 0,
        cestaBasica: 0,
      },
      transporte: 12.0,
      uniforme: 8.0,
      despesasAdmissionais: 3.0,
      assistenciaMedica: 20.0,
      epiEpc: 20.0,
      outros: 0,
    },
    observacoes: 'Soldagem de estruturas metálicas - diversos processos',
  },
  {
    nome: 'Torneiro Mecânico',
    categoria: 'fabricacao',
    tipoContrato: 'mensalista',
    salarioBase: 3500.0,
    temPericulosidade: false,
    grauInsalubridade: 'minimo',
    horasMes: 184,
    custos: {
      alimentacao: {
        cafeManha: 8.0,
        almoco: 18.0,
        janta: 0,
        cestaBasica: 0,
      },
      transporte: 12.0,
      uniforme: 7.0,
      despesasAdmissionais: 3.0,
      assistenciaMedica: 20.0,
      epiEpc: 12.0,
      outros: 0,
    },
    observacoes: 'Operação de torno mecânico e usinagem de peças',
  },
];

/**
 * Função para popular os cargos
 */
export async function popularCargosIniciais() {
  console.log('🚀 Iniciando população de cargos...');

  try {
    // Limpar cargos existentes (opcional - comente se quiser manter os existentes)
    // localStorage.removeItem('gestortarefas_mock_cargos');

    let criados = 0;
    let erros = 0;

    for (const cargo of cargosIniciais) {
      try {
        await CargoService.create(cargo);
        criados++;
        console.log(`✅ Cargo criado: ${cargo.nome}`);
      } catch (error) {
        erros++;
        console.error(`❌ Erro ao criar cargo ${cargo.nome}:`, error);
      }
    }

    console.log(`\n✨ População concluída!`);
    console.log(`   ✅ Criados: ${criados}`);
    console.log(`   ❌ Erros: ${erros}`);
    console.log(`   📊 Total: ${cargosIniciais.length}`);

    // Recarregar a página para ver os dados
    console.log('\n🔄 Recarregando página em 2 segundos...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);

  } catch (error) {
    console.error('❌ Erro ao popular cargos:', error);
  }
}

// Exportar também como default para facilitar uso
export default popularCargosIniciais;

// Para executar no console:
// import popularCargosIniciais from './src/scripts/popularCargos';
// popularCargosIniciais();
