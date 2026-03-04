// Template padrão de ferramentas — valores de referência da empresa
// Usado pelo botão "Carregar Template" na aba Ferramentas do orçamento

export interface TemplateItemFerramentas {
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
}

export const templateFerramentasManuais: TemplateItemFerramentas[] = [
  { descricao: 'Ferramentas Manuais - Kit (Broca, Sargento, Esquadro, etc)', quantidade: 3, unidade: 'Unid.', valorUnitario: 300.00 },
  { descricao: 'Ferramentas Manuais - Kit Caixa Ferramentas',                quantidade: 2, unidade: 'Unid.', valorUnitario: 300.00 },
  { descricao: 'Conjunto Maçarico - Exceto gases',                           quantidade: 1, unidade: 'Unid.', valorUnitario: 320.00 },
  { descricao: 'Catraca Manual - 500 kgs',                                   quantidade: 1, unidade: 'Unid.', valorUnitario: 160.00 },
  { descricao: 'Talha Manual - 3 ton',                                       quantidade: 1, unidade: 'Unid.', valorUnitario: 200.00 },
];

export const templateFerramentasEletricas: TemplateItemFerramentas[] = [
  { descricao: 'Ferramentas Elétricas - Lixadeira 7"',                       quantidade: 3, unidade: 'Mês', valorUnitario: 120.00   },
  { descricao: 'Ferramentas Elétricas - Lixadeira 4"',                       quantidade: 4, unidade: 'Mês', valorUnitario: 90.00    },
  { descricao: 'Máquinas Solda 200A - Locação',                              quantidade: 2, unidade: 'Mês', valorUnitario: 350.00   },
  { descricao: 'Retífica Manual',                                            quantidade: 4, unidade: 'Mês', valorUnitario: 120.00   },
  { descricao: 'Furadeira Industrial',                                       quantidade: 2, unidade: 'Mês', valorUnitario: 200.00   },
  { descricao: 'Extensões 20m com tomadas Steck - QDE - Custo mensal',       quantidade: 5, unidade: 'Mês', valorUnitario: 126.67   },
];
