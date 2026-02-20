/**
 * SCRIPT PARA POPULAR CARGOS CONFORME LISTA DO PRINT
 *
 * Como usar:
 * 1. Abra http://localhost:8082/comercial/configuracao/cargos
 * 2. Abra o Console do navegador (F12)
 * 3. Copie e cole todo este código
 * 4. Pressione Enter
 * 5. A página será recarregada automaticamente com os dados
 *
 * NOTA: Este script vai SUBSTITUIR todos os cargos existentes pela lista nova
 */

(async function popularCargosLista() {
  console.log('🚀 Iniciando população de cargos da lista...');

  // Dados dos cargos conforme print - MÃO DE OBRA - FABRICAÇÃO
  const cargosLista = [
    {
      nome: 'AJUD_GERAL',
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
      observacoes: '5.5 - Auxiliar geral em atividades de fabricação',
    },
    {
      nome: 'CALDEIREIRO',
      categoria: 'fabricacao',
      tipoContrato: 'mensalista',
      salarioBase: 3200.0,
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
      observacoes: '5.3 - Profissional de caldeiraria industrial',
    },
    {
      nome: 'ELETRICISTA',
      categoria: 'ambos',
      tipoContrato: 'mensalista',
      salarioBase: 3500.0,
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
      observacoes: '5.8 - Eletricista industrial com periculosidade',
    },
    {
      nome: 'LIDER EQUIPE',
      categoria: 'fabricacao',
      tipoContrato: 'mensalista',
      salarioBase: 4200.0,
      temPericulosidade: false,
      grauInsalubridade: 'nenhum',
      horasMes: 184,
      custos: {
        alimentacao: { cafeManha: 10.0, almoco: 22.0, janta: 0, cestaBasica: 0 },
        transporte: 15.0,
        uniforme: 8.0,
        despesasAdmissionais: 3.0,
        assistenciaMedica: 25.0,
        epiEpc: 12.0,
        outros: 0,
      },
      observacoes: '5.2 - Líder de equipe de produção',
    },
    {
      nome: 'MEC.MANUTENÇÃO',
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
        assistenciaMedica: 20.0,
        epiEpc: 15.0,
        outros: 0,
      },
      observacoes: '5.4 - Mecânico de manutenção industrial',
    },
    {
      nome: 'MEC.MONTADOR',
      categoria: 'montagem',
      tipoContrato: 'mensalista',
      salarioBase: 2800.0,
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
      observacoes: '5.11 - Mecânico montador industrial',
    },
    {
      nome: 'MOTORISTA',
      categoria: 'ambos',
      tipoContrato: 'mensalista',
      salarioBase: 2400.0,
      temPericulosidade: false,
      grauInsalubridade: 'nenhum',
      horasMes: 184,
      custos: {
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
        transporte: 0, // Motorista não recebe vale transporte
        uniforme: 6.0,
        despesasAdmissionais: 3.0,
        assistenciaMedica: 18.0,
        epiEpc: 5.0,
        outros: 0,
      },
      observacoes: '5.7 - Motorista de veículos da empresa',
    },
    {
      nome: 'PCP',
      categoria: 'fabricacao',
      tipoContrato: 'mensalista',
      salarioBase: 3600.0,
      temPericulosidade: false,
      grauInsalubridade: 'nenhum',
      horasMes: 184,
      custos: {
        alimentacao: { cafeManha: 10.0, almoco: 20.0, janta: 0, cestaBasica: 0 },
        transporte: 12.0,
        uniforme: 6.0,
        despesasAdmissionais: 3.0,
        assistenciaMedica: 22.0,
        epiEpc: 5.0,
        outros: 0,
      },
      observacoes: '5.6 - Planejamento e Controle de Produção',
    },
    {
      nome: 'PEDREIRO',
      categoria: 'montagem',
      tipoContrato: 'mensalista',
      salarioBase: 2600.0,
      temPericulosidade: false,
      grauInsalubridade: 'minimo',
      horasMes: 184,
      custos: {
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
        transporte: 12.0,
        uniforme: 7.0,
        despesasAdmissionais: 3.0,
        assistenciaMedica: 18.0,
        epiEpc: 10.0,
        outros: 0,
      },
      observacoes: '5.9 - Pedreiro para obras e montagens',
    },
    {
      nome: 'SUPERVISOR OBRA',
      categoria: 'montagem',
      tipoContrato: 'mensalista',
      salarioBase: 5500.0,
      temPericulosidade: false,
      grauInsalubridade: 'nenhum',
      horasMes: 184,
      custos: {
        alimentacao: { cafeManha: 12.0, almoco: 25.0, janta: 0, cestaBasica: 100.0 },
        transporte: 20.0,
        uniforme: 10.0,
        despesasAdmissionais: 3.0,
        assistenciaMedica: 35.0,
        epiEpc: 15.0,
        outros: 0,
      },
      observacoes: '5.1 - Supervisor de obras e montagens',
    },
    {
      nome: 'TEC. SEGURANÇA',
      categoria: 'ambos',
      tipoContrato: 'mensalista',
      salarioBase: 3200.0,
      temPericulosidade: false,
      grauInsalubridade: 'nenhum',
      horasMes: 184,
      custos: {
        alimentacao: { cafeManha: 8.0, almoco: 20.0, janta: 0, cestaBasica: 0 },
        transporte: 12.0,
        uniforme: 7.0,
        despesasAdmissionais: 3.0,
        assistenciaMedica: 20.0,
        epiEpc: 10.0,
        outros: 0,
      },
      observacoes: '5.10 - Técnico de segurança do trabalho',
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
    for (const cargo of cargosLista) {
      const cargoCalculado = await calcularCargo(cargo);
      cargos.push(cargoCalculado);
      console.log(`✅ ${cargo.observacoes?.split(' - ')[0] || ''} ${cargo.nome} - Custo HH: R$ ${cargoCalculado.custoHH.toFixed(2)}/h`);
    }

    // SUBSTITUIR todos os cargos no localStorage
    localStorage.setItem('gestortarefas_mock_cargos', JSON.stringify(cargos));

    console.log(`\n✨ População concluída com sucesso!`);
    console.log(`   📊 Total de cargos criados: ${cargos.length}`);
    console.log(`   📋 Cargos conforme lista do print (5.1 a 5.11)`);
    console.log(`   ⚠️  Cargos anteriores foram substituídos`);
    console.log('\n🔄 Recarregando página em 2 segundos...');

    setTimeout(() => {
      window.location.reload();
    }, 2000);

  } catch (error) {
    console.error('❌ Erro ao popular cargos:', error);
  }
})();
