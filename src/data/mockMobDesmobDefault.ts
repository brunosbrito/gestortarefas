// Template padrão de Mobilização/Desmobilização — valores de referência da empresa
// Usado pelo botão "Carregar Template" nas abas Mob/Desmob do orçamento
// Os mesmos itens são aplicados tanto para Mobilização quanto para Desmobilização

export interface TemplateMobDesmobItem {
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
}

export const templateMobDesmob: TemplateMobDesmobItem[] = [
  { descricao: 'Veículo Passageiro apoio Operacional',  quantidade: 1, unidade: 'Mês',  valorUnitario: 4000.00 },
  { descricao: 'Veículo/Transporte Pessoal',            quantidade: 1, unidade: 'Mês',  valorUnitario: 3000.00 },
  { descricao: 'Container Almox. Escritório (Locação)', quantidade: 1, unidade: 'VB',   valorUnitario: 1200.00 },
  { descricao: 'Transporte Container(s) 1x',            quantidade: 1, unidade: 'VB',   valorUnitario: 1200.00 },
  { descricao: 'Transporte Máquinas e Equipamentos',    quantidade: 1, unidade: 'UNID', valorUnitario: 2000.00 },
  { descricao: 'Transporte Materiais (GML x Pintura)',  quantidade: 1, unidade: 'UNID', valorUnitario: 2000.00 },
  { descricao: 'Transporte Materiais (Pintura X Obra)', quantidade: 1, unidade: 'UNID', valorUnitario: 2800.00 },
  { descricao: 'Hospedagem - Equipe mobilização',       quantidade: 9, unidade: 'UNID', valorUnitario:  110.00 },
  { descricao: 'Alimentação Equipe mobilização',        quantidade: 9, unidade: 'UNID', valorUnitario:   59.00 },
];
