
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';

export const calcularKPI = (atividade: AtividadeStatus): number => {
  const tempoEstimadoStr = atividade.estimatedTime?.toString() || '0';
  const tempoEstimado = parseFloat(tempoEstimadoStr.replace(/[^\d.,]/g, '').replace(',', '.'));
  const tempoTotal = atividade.totalTime || 0;
  
  // Validação para evitar divisão por zero e valores inválidos
  if (!tempoEstimado || tempoEstimado <= 0 || !isFinite(tempoEstimado)) return 0;
  if (!tempoTotal || !isFinite(tempoTotal)) return 0;
  
  const kpi = (tempoTotal / tempoEstimado) * 100;
  return isFinite(kpi) ? Math.min(kpi, 999) : 0; // Limita o valor máximo
};

export const calcularProgresso = (atividade: AtividadeStatus): number => {
  const quantidadeTotal = atividade.quantity || 0;
  const quantidadeConcluida = atividade.completedQuantity || 0;
  
  if (quantidadeTotal === 0) return 0;
  
  return (quantidadeConcluida / quantidadeTotal) * 100;
};

export const formatarKPI = (kpi: number): string => {
  if (!isFinite(kpi)) return '0.0%';
  return `${kpi.toFixed(1)}%`;
};

export const formatarProgresso = (progresso: number): string => {
  if (!isFinite(progresso)) return '0.0%';
  return `${progresso.toFixed(1)}%`;
};

export const formatarTempoTotal = (tempoTotal: number): string => {
  if (!tempoTotal || !isFinite(tempoTotal)) return '0h00m';
  
  const horas = Math.floor(tempoTotal);
  const minutos = Math.round((tempoTotal - horas) * 60);
  
  return `${horas}h${minutos.toString().padStart(2, '0')}m`;
};

export const getKPIColor = (kpi: number): string => {
  if (kpi <= 100) return 'text-green-600 bg-green-50 border-green-200';
  if (kpi <= 120) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

export const getProgressoColor = (progresso: number): string => {
  if (progresso >= 100) return 'bg-green-500';
  if (progresso >= 75) return 'bg-blue-500';
  if (progresso >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const obterCodigoSequencial = (index: number): string => {
  return (index + 1).toString().padStart(3, '0');
};
