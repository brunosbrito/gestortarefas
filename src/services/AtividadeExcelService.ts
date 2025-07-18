
import * as XLSX from 'xlsx';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';

export class AtividadeExcelService {
  static async gerarRelatorioExcel(atividades: AtividadeStatus[], filtros: any) {
    // Preparar dados para a planilha
    const dadosFormatados = atividades.map((atividade) => ({
      'Descrição': atividade.description,
      'Tarefa Macro': typeof atividade.macroTask === 'string' 
        ? atividade.macroTask 
        : atividade.macroTask?.name || '-',
      'Processo': typeof atividade.process === 'string' 
        ? atividade.process 
        : atividade.process?.name || '-',
      'Status': atividade.status,
      'OS': atividade.serviceOrder?.serviceOrderNumber || 'N/A',
      'Obra/Projeto': atividade.project?.name || 'N/A',
      'Tempo Estimado': atividade.estimatedTime || '-',
      'Equipe': atividade.collaborators?.map(c => c.name).join(', ') || '-',
      'Data Início': new Date(atividade.startDate).toLocaleDateString('pt-BR'),
      'Data Fim': atividade.endDate ? new Date(atividade.endDate).toLocaleDateString('pt-BR') : '-',
      'Observações': atividade.observation || '-',
      'Quantidade': atividade.quantity || 0,
      'Quantidade Concluída': atividade.completedQuantity || 0,
      'Criado em': new Date(atividade.createdAt).toLocaleDateString('pt-BR'),
      'Cliente': atividade.project?.client || '-',
      'Endereço': atividade.project?.address || '-'
    }));

    // Criar workbook
    const workbook = XLSX.utils.book_new();

    // Aba principal com dados
    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);

    // Ajustar largura das colunas
    const columnWidths = [
      { wch: 40 }, // Descrição
      { wch: 25 }, // Tarefa Macro
      { wch: 20 }, // Processo
      { wch: 15 }, // Status
      { wch: 10 }, // OS
      { wch: 30 }, // Obra/Projeto
      { wch: 15 }, // Tempo Estimado
      { wch: 30 }, // Equipe
      { wch: 12 }, // Data Início
      { wch: 12 }, // Data Fim
      { wch: 30 }, // Observações
      { wch: 12 }, // Quantidade
      { wch: 15 }, // Quantidade Concluída
      { wch: 12 }, // Criado em
      { wch: 25 }, // Cliente
      { wch: 35 }  // Endereço
    ];

    worksheet['!cols'] = columnWidths;

    // Adicionar aba de dados
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Atividades');

    // Criar aba de resumo
    const resumo = [
      { 'Informação': 'Total de Atividades', 'Valor': atividades.length },
      { 'Informação': 'Data de Geração', 'Valor': new Date().toLocaleDateString('pt-BR') },
      { 'Informação': 'Planejadas', 'Valor': atividades.filter(a => a.status === 'Planejadas').length },
      { 'Informação': 'Em Execução', 'Valor': atividades.filter(a => a.status === 'Em execução').length },
      { 'Informação': 'Concluídas', 'Valor': atividades.filter(a => a.status === 'Concluídas').length },
      { 'Informação': 'Paralizadas', 'Valor': atividades.filter(a => a.status === 'Paralizadas').length }
    ];

    if (filtros.status) {
      resumo.push({ 'Informação': 'Filtro Status', 'Valor': filtros.status });
    }
    if (filtros.dataInicio || filtros.dataFim) {
      resumo.push({ 
        'Informação': 'Período Filtrado', 
        'Valor': `${filtros.dataInicio || 'Início'} até ${filtros.dataFim || 'Fim'}` 
      });
    }

    const worksheetResumo = XLSX.utils.json_to_sheet(resumo);
    worksheetResumo['!cols'] = [{ wch: 25 }, { wch: 30 }];
    
    XLSX.utils.book_append_sheet(workbook, worksheetResumo, 'Resumo');

    return workbook;
  }

  static async downloadExcel(atividades: AtividadeStatus[], filtros: any) {
    const workbook = await this.gerarRelatorioExcel(atividades, filtros);
    const fileName = `relatorio_atividades_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
  }
}
