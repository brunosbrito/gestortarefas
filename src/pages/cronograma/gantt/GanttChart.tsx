/**
 * Componente Gráfico de Gantt
 * Sistema: Gestor Master - GMX Soluções Industriais
 * Módulo: Cronogramas
 *
 * Wrapper para frappe-gantt library
 */

import { useEffect, useRef } from 'react';
import Gantt from 'frappe-gantt';
import type { TarefaCronograma } from '@/interfaces/CronogramaInterfaces';
import 'frappe-gantt/dist/frappe-gantt.css';

interface GanttChartProps {
  tarefas: TarefaCronograma[];
  viewMode: 'Day' | 'Week' | 'Month';
  onTaskClick?: (tarefa: TarefaCronograma) => void;
}

interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies?: string;
  custom_class?: string;
}

export default function GanttChart({ tarefas, viewMode, onTaskClick }: GanttChartProps) {
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const ganttInstanceRef = useRef<Gantt | null>(null);

  // Transformar tarefas para o formato esperado pelo frappe-gantt
  const transformToGanttTasks = (): GanttTask[] => {
    return tarefas.map((tarefa) => {
      // Determinar classe CSS baseada no status
      let customClass = '';
      switch (tarefa.status) {
        case 'planejada':
          customClass = 'gantt-task-planejada';
          break;
        case 'em_andamento':
          customClass = 'gantt-task-em-andamento';
          break;
        case 'concluida':
          customClass = 'gantt-task-concluida';
          break;
        case 'atrasada':
          customClass = 'gantt-task-atrasada';
          break;
        case 'bloqueada':
          customClass = 'gantt-task-bloqueada';
          break;
        case 'cancelada':
          customClass = 'gantt-task-cancelada';
          break;
        default:
          customClass = 'gantt-task-planejada';
      }

      // Adicionar classe para milestones
      if (tarefa.isMilestone) {
        customClass += ' gantt-milestone';
      }

      // Montar dependências (formato: "tarefa1, tarefa2")
      const dependencies = tarefa.dependencias
        ?.map((dep) => dep.tarefaAnteriorId)
        .join(', ') || '';

      return {
        id: tarefa.id,
        name: tarefa.nome,
        start: tarefa.dataInicioPlanejada,
        end: tarefa.dataFimPlanejada,
        progress: tarefa.progresso,
        dependencies: dependencies || undefined,
        custom_class: customClass,
      };
    });
  };

  useEffect(() => {
    if (!ganttContainerRef.current || tarefas.length === 0) return;

    // Limpar instância anterior se existir
    if (ganttInstanceRef.current) {
      ganttContainerRef.current.innerHTML = '';
    }

    const ganttTasks = transformToGanttTasks();

    try {
      // Criar nova instância do Gantt
      const ganttInstance = new Gantt(ganttContainerRef.current, ganttTasks, {
        view_mode: viewMode,
        language: 'pt-BR',
        bar_height: 30,
        bar_corner_radius: 3,
        arrow_curve: 5,
        padding: 18,
        date_format: 'DD/MM/YYYY',
        popup_trigger: 'click',
        on_click: (task: GanttTask) => {
          const tarefa = tarefas.find((t) => t.id === task.id);
          if (tarefa && onTaskClick) {
            onTaskClick(tarefa);
          }
        },
        on_date_change: (task: GanttTask, start: Date, end: Date) => {
          // MVP: Read-only - não permitir alteração de datas por drag-and-drop
          // Fase 2: Implementar atualização via TarefaCronogramaService.updateDatas
          console.log('Date change disabled in MVP', task, start, end);
        },
        on_progress_change: (task: GanttTask, progress: number) => {
          // MVP: Read-only - não permitir alteração de progresso por drag
          // Fase 2: Implementar atualização via TarefaCronogramaService.updateProgresso
          console.log('Progress change disabled in MVP', task, progress);
        },
        custom_popup_html: (task: GanttTask) => {
          const tarefa = tarefas.find((t) => t.id === task.id);
          if (!tarefa) return '';

          const statusLabels: Record<string, string> = {
            planejada: 'Planejada',
            em_andamento: 'Em Andamento',
            atrasada: 'Atrasada',
            concluida: 'Concluída',
            cancelada: 'Cancelada',
            bloqueada: 'Bloqueada',
          };

          const prioridadeLabels: Record<string, string> = {
            baixa: 'Baixa',
            media: 'Média',
            alta: 'Alta',
            critica: 'Crítica',
          };

          return `
            <div class="gantt-popup-wrapper">
              <div class="title"><strong>${tarefa.nome}</strong></div>
              <div class="subtitle">${tarefa.descricao || 'Sem descrição'}</div>
              <hr style="margin: 8px 0;">
              <div class="details">
                <div><strong>Status:</strong> ${statusLabels[tarefa.status] || tarefa.status}</div>
                <div><strong>Progresso:</strong> ${tarefa.progresso}%</div>
                <div><strong>Prioridade:</strong> ${prioridadeLabels[tarefa.prioridade] || tarefa.prioridade}</div>
                <div><strong>Início:</strong> ${new Date(tarefa.dataInicioPlanejada).toLocaleDateString('pt-BR')}</div>
                <div><strong>Fim:</strong> ${new Date(tarefa.dataFimPlanejada).toLocaleDateString('pt-BR')}</div>
                ${tarefa.responsavel ? `<div><strong>Responsável:</strong> ${tarefa.responsavel.name}</div>` : ''}
                ${tarefa.isMilestone ? '<div style="color: purple;"><strong>📍 Marco (Milestone)</strong></div>' : ''}
                ${tarefa.motivoBloqueio ? `<div style="color: red;"><strong>🔒 Bloqueio:</strong> ${tarefa.motivoBloqueio}</div>` : ''}
              </div>
            </div>
          `;
        },
      });

      ganttInstanceRef.current = ganttInstance;
    } catch (error) {
      console.error('Erro ao inicializar Gantt:', error);
    }

    // Cleanup ao desmontar
    return () => {
      if (ganttContainerRef.current) {
        ganttContainerRef.current.innerHTML = '';
      }
      ganttInstanceRef.current = null;
    };
  }, [tarefas, viewMode, onTaskClick]);

  return (
    <div className="gantt-wrapper">
      <style>
        {`
          /* Estilos customizados para o Gantt */
          .gantt-wrapper {
            overflow-x: auto;
            overflow-y: auto;
            max-height: 600px;
          }

          /* Cores por status */
          .gantt-task-planejada .bar {
            fill: #9ca3af !important;
          }

          .gantt-task-em-andamento .bar {
            fill: #3b82f6 !important;
          }

          .gantt-task-concluida .bar {
            fill: #16a34a !important;
          }

          .gantt-task-atrasada .bar {
            fill: #dc2626 !important;
          }

          .gantt-task-bloqueada .bar {
            fill: #ea580c !important;
          }

          .gantt-task-cancelada .bar {
            fill: #6b7280 !important;
            opacity: 0.5;
          }

          /* Milestones (marcos) - estilo diamante */
          .gantt-milestone .bar {
            fill: #9333ea !important;
            rx: 0 !important;
            transform: rotate(45deg);
            transform-origin: center;
          }

          /* Popup customizado */
          .gantt-popup-wrapper {
            padding: 12px;
            font-size: 13px;
            line-height: 1.5;
          }

          .gantt-popup-wrapper .title {
            font-size: 14px;
            margin-bottom: 4px;
          }

          .gantt-popup-wrapper .subtitle {
            color: #6b7280;
            font-size: 12px;
            margin-bottom: 8px;
          }

          .gantt-popup-wrapper .details > div {
            margin-bottom: 4px;
          }

          /* Linha de hoje */
          .gantt-container .today-highlight {
            fill: #ef4444;
            opacity: 0.2;
          }

          /* Dependências (setas) */
          .gantt-container .arrow {
            stroke: #6b7280;
            stroke-width: 1.4px;
          }

          /* Grid */
          .gantt-container .grid-row {
            fill: transparent;
          }

          .gantt-container .grid-row:nth-child(even) {
            fill: #f9fafb;
          }

          /* Responsividade */
          @media (max-width: 768px) {
            .gantt-wrapper {
              max-height: 400px;
            }
          }
        `}
      </style>
      <div ref={ganttContainerRef}></div>
    </div>
  );
}
