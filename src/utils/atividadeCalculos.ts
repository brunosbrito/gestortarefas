import { AtividadeStatus } from '@/interfaces/AtividadeStatus';

export const calcularKPI = (atividade: AtividadeStatus): number => {
  console.log(atividade);
  if (!atividade.estimatedTime) return 0;

  const [hours, minutes] = atividade.estimatedTime
    .split(/[h|min]/)
    .filter(Boolean);
  const totalEstimatedSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60;
  let elapsedTime = atividade.totalTime;
  if (atividade.status === 'Em execução') {
    elapsedTime = calculateElapsedTime(
      atividade.totalTime,
      atividade.startDate
    );
  }

  elapsedTime += elapsedTime * 3600;

  return Math.round((elapsedTime / totalEstimatedSeconds) * 100);
};

export const calcularProgresso = (atividade: AtividadeStatus): number => {
  const quantidadeTotal = atividade.quantity || 0;
  const quantidadeConcluida = atividade.completedQuantity || 0;

  if (quantidadeTotal === 0) return 0;

  return (quantidadeConcluida / quantidadeTotal) * 100;
};

export const formatarKPI = (kpi: number): string => {
  if (!isFinite(kpi)) return '0%';
  return `${Math.round(kpi)}%`;
};

export const formatarProgresso = (progresso: number): string => {
  if (!isFinite(progresso)) return '0%';
  return `${Math.round(progresso)}%`;
};

export const formatarTempoTotal = (atividade: AtividadeStatus): string => {
  if (atividade.status === 'Em execução') {
    const tempoDecorrido = calculateElapsedTime(
      atividade.totalTime,
      atividade.startDate
    );
    return tempoDecorrido.toFixed(2).replace('.', 'h') + 'm';
  }

  if (!atividade.totalTime || !isFinite(atividade.totalTime)) return '0h00m';

  const horas = Math.floor(atividade.totalTime);
  const minutos = Math.round((atividade.totalTime - horas) * 60);

  return `${horas}h${minutos.toString().padStart(2, '0')}m`;
};

export const calculateElapsedTime = (totalTime: number, startDate?: string) => {
  if (!startDate) return totalTime / 3600;

  const startDateTime = new Date(startDate);
  const now = new Date();

  const elapsedSeconds = (now.getTime() - startDateTime.getTime()) / 1000;

  const totalElapsedSeconds = totalTime * 3600 + elapsedSeconds;
  const hours = Math.floor(totalElapsedSeconds / 3600);
  const minutes = Math.floor((totalElapsedSeconds % 3600) / 60);
  return hours + minutes / 60;
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
