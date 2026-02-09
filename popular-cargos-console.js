/**
 * SCRIPT PARA POPULAR CARGOS NO NAVEGADOR
 *
 * Como usar:
 * 1. Abra http://localhost:8082/comercial/configuracao/cargos
 * 2. Abra o Console do navegador (F12)
 * 3. Copie e cole todo este código
 * 4. Pressione Enter
 * 5. A página será recarregada automaticamente com os dados
 */

(async function popularCargos() {
  console.log('🚀 Iniciando população de cargos...');

  // Dados dos cargos em ordem alfabética
  const cargosIniciais = [
    {
      nome: 'Ajudante Geral',
      categoria: 'ambos',
      tipoContrato: 'mensalista',
      salarioBase: 1650.0,
      temPericulosidade: false,
      grauInsalubridade: 'nenhum',
      horasMes: 184,
      custos: {
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
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
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
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
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
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
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
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
        alimentacao: { cafeManha: 10.0, almoco: 22.0, janta: 0, cestaBasica: 80.0 },
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
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
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
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
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
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
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
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
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
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
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
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
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
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
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

  // Função para calcular valores (replica a lógica do CargoService)
  async function calcularCargo(data) {
    const config = JSON.parse(localStorage.getItem('gestortarefas_mock_config_salarial') || '{"salarioMinimoReferencia":1612,"percentualEncargos":0.587}');

    // Periculosidade
    const valorPericulosidade = data.temPericulosidade ? data.salarioBase * 0.30 : 0;

    // Insalubridade
    let valorInsalubridade = 0;
    switch (data.grauInsalubridade) {
      case 'minimo': valorInsalubridade = config.salarioMinimoReferencia * 0.10; break;
      case 'medio': valorInsalubridade = config.salarioMinimoReferencia * 0.20; break;
      case 'maximo': valorInsalubridade = config.salarioMinimoReferencia * 0.40; break;
    }

    // Total Salário
    const totalSalario = data.salarioBase + valorPericulosidade + valorInsalubridade;

    // Encargos
    const valorEncargos = totalSalario * config.percentualEncargos;

    // Custos Diversos
    const totalCustosDiversos =
      data.custos.alimentacao.cafeManha +
      data.custos.alimentacao.almoco +
      data.custos.alimentacao.janta +
      data.custos.alimentacao.cestaBasica +
      data.custos.transporte +
      data.custos.uniforme +
      data.custos.despesasAdmissionais +
      data.custos.assistenciaMedica +
      data.custos.epiEpc +
      data.custos.outros;

    // Total MO
    const totalCustosMO = totalSalario + valorEncargos + totalCustosDiversos;

    // Custo HH
    const custoHH = data.horasMes > 0 ? Math.round((totalCustosMO / data.horasMes) * 100) / 100 : 0;

    return {
      id: `cargo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      valorPericulosidade,
      valorInsalubridade,
      totalSalario,
      valorEncargos,
      totalCustosDiversos,
      totalCustosMO,
      custoHH,
      ativo: true,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
  }

  try {
    // Criar os cargos
    const cargos = [];
    for (const cargo of cargosIniciais) {
      const cargoCalculado = await calcularCargo(cargo);
      cargos.push(cargoCalculado);
      console.log(`✅ Cargo preparado: ${cargo.nome} - Custo HH: R$ ${cargoCalculado.custoHH.toFixed(2)}/h`);
    }

    // Salvar no localStorage
    localStorage.setItem('gestortarefas_mock_cargos', JSON.stringify(cargos));

    console.log(`\n✨ População concluída com sucesso!`);
    console.log(`   📊 Total de cargos criados: ${cargos.length}`);
    console.log(`   📋 Cargos em ordem alfabética`);
    console.log('\n🔄 Recarregando página em 2 segundos...');

    setTimeout(() => {
      window.location.reload();
    }, 2000);

  } catch (error) {
    console.error('❌ Erro ao popular cargos:', error);
  }
})();
