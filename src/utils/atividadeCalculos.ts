
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';

export const calcularKPI = (atividade: AtividadeStatus): number => {
  const tempoEstimado = parseFloat(atividade.estimatedTime?.replace(/[^\d.,]/g, '').replace(',', '.') || '0');
  const tempoTotal = atividade.totalTime || 0;
  
  if (tempoEstimado === 0) return 0;
  
  return (tempoTotal / tempoEstimado) * 100;
};

export const calcularProgresso = (atividade: AtividadeStatus): number => {
  const quantidadeTotal = atividade.quantity || 0;
  const quantidadeConcluida = atividade.completedQuantity || 0;
  
  if (quantidadeTotal === 0) return 0;
  
  return (quantidadeConcluida / quantidadeTotal) * 100;
};

export const formatarKPI = (kpi: number): string => {
  return `${kpi.toFixed(1)}%`;
};

export const formatarProgresso = (progresso: number): string => {
  return `${progresso.toFixed(1)}%`;
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
