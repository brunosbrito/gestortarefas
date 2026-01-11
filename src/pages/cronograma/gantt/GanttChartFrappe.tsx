/**
 * Componente Gráfico de Gantt - VERSÃO MS PROJECT-LIKE COM COLUNAS CONFIGURÁVEIS
 * Sistema: Gestor Master - GMX Soluções Industriais
 * Módulo: Cronogramas
 *
 * Interface estilo Microsoft Project:
 * - Tabela de dados à esquerda (colunas configuráveis pelo usuário)
 * - Timeline de barras à direita (sincronizado)
 * - Scroll vertical sincronizado
 * - Seletor de colunas (botão Adicionar Coluna)
 * - Persistência de preferências no localStorage
 */

import { useEffect, useRef, useState } from 'react';
import Gantt from 'frappe-gantt';
import type { TarefaCronograma } from '@/interfaces/CronogramaInterfaces';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { ZoomIn, ZoomOut, CalendarDays, Columns, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface GanttChartProps {
  tarefas: TarefaCronograma[];
  viewMode: 'Day' | 'Week' | 'Month';
  onTaskClick?: (tarefa: TarefaCronograma) => void;
  onViewModeChange?: (mode: 'Day' | 'Week' | 'Month') => void;
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

// Definição de colunas disponíveis
interface ColumnDefinition {
  id: string;
  label: string;
  width: number;
  render: (tarefa: TarefaCronograma, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

const STORAGE_KEY = 'gantt-visible-columns';

export default function GanttChart({
  tarefas,
  viewMode,
  onTaskClick,
  onViewModeChange,
}: GanttChartProps) {
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const ganttInstanceRef = useRef<Gantt | null>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const ganttScrollRef = useRef<HTMLDivElement>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<{
    containerWidth: number;
    containerHeight: number;
    hasInstance: boolean;
    hasSvg: boolean;
    svgWidth: number;
    svgHeight: number;
    barCount: number;
    rectCount: number;
  } | null>(null);

  // Calcular duração em dias
  const calculateDuration = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Formatar data para dd/MM/yyyy
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Obter cor de status
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      planejada: '#9ca3af',
      em_andamento: '#3b82f6',
      concluida: '#10b981',
      atrasada: '#ef4444',
      bloqueada: '#f97316',
      cancelada: '#6b7280',
    };
    return colors[status] || colors.planejada;
  };

  // Labels de status
  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      planejada: 'Planejada',
      em_andamento: 'Em Andamento',
      atrasada: 'Atrasada',
      concluida: 'Concluída',
      cancelada: 'Cancelada',
      bloqueada: 'Bloqueada',
    };
    return labels[status] || status;
  };

  // Definir todas as colunas disponíveis (FASE 1)
  const availableColumns: ColumnDefinition[] = [
    {
      id: 'numero',
      label: 'Nº',
      width: 50,
      align: 'center',
      render: (_, index) => <span>{index + 1}</span>,
    },
    {
      id: 'id',
      label: 'ID',
      width: 80,
      align: 'center',
      render: (tarefa) => (
        <span className="font-mono text-xs">{tarefa.id.substring(0, 8)}</span>
      ),
    },
    {
      id: 'eap',
      label: 'EAP',
      width: 100,
      align: 'center',
      render: (tarefa) => <span className="font-mono text-xs">{tarefa.eap || '-'}</span>,
    },
    {
      id: 'nome',
      label: 'Nome da Tarefa',
      width: 250,
      render: (tarefa) => (
        <div className="ms-task-name-content">
          <div
            className="ms-status-dot"
            style={{ background: getStatusColor(tarefa.status) }}
          />
          {tarefa.isMilestone && <span className="ms-task-icon">📍</span>}
          <span style={{ fontWeight: tarefa.isMilestone ? 600 : 400 }}>
            {tarefa.nome}
          </span>
        </div>
      ),
    },
    {
      id: 'tipo',
      label: 'Tipo',
      width: 120,
      align: 'center',
      render: (tarefa) => (
        <span className="text-xs">{tarefa.tipo || 'Fabricação'}</span>
      ),
    },
    {
      id: 'duracao',
      label: 'Duração',
      width: 80,
      align: 'center',
      render: (tarefa) => (
        <span>
          {calculateDuration(tarefa.dataInicioPlanejada, tarefa.dataFimPlanejada)} dias
        </span>
      ),
    },
    {
      id: 'inicio',
      label: 'Início',
      width: 100,
      align: 'center',
      render: (tarefa) => <span>{formatDate(tarefa.dataInicioPlanejada)}</span>,
    },
    {
      id: 'termino',
      label: 'Término',
      width: 100,
      align: 'center',
      render: (tarefa) => <span>{formatDate(tarefa.dataFimPlanejada)}</span>,
    },
    {
      id: 'progresso',
      label: 'Progresso',
      width: 120,
      render: (tarefa) => (
        <div className="ms-progress-cell">
          <div className="ms-progress-bar-mini">
            <div
              className="ms-progress-fill-mini"
              style={{ width: `${tarefa.progresso}%` }}
            />
          </div>
          <span className="ms-progress-text">{tarefa.progresso}%</span>
        </div>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      width: 120,
      align: 'center',
      render: (tarefa) => (
        <span className="text-xs px-2 py-1 rounded" style={{
          backgroundColor: `${getStatusColor(tarefa.status)}20`,
          color: getStatusColor(tarefa.status),
          border: `1px solid ${getStatusColor(tarefa.status)}`,
        }}>
          {getStatusLabel(tarefa.status)}
        </span>
      ),
    },
    {
      id: 'predecessoras',
      label: 'Predecessoras',
      width: 120,
      align: 'center',
      render: (tarefa) => (
        <span className="text-xs">
          {tarefa.dependencias?.map(d => d.tarefaAnteriorId.substring(0, 6)).join(', ') || '-'}
        </span>
      ),
    },
    {
      id: 'responsavel',
      label: 'Responsável',
      width: 150,
      render: (tarefa) => (
        <span className="text-xs">{tarefa.responsavel?.name || 'Não atribuído'}</span>
      ),
    },
    {
      id: 'equipe',
      label: 'Equipe',
      width: 120,
      align: 'center',
      render: (tarefa) => (
        <span className="text-xs">{tarefa.equipe || '-'}</span>
      ),
    },
    {
      id: 'prioridade',
      label: 'Prioridade',
      width: 100,
      align: 'center',
      render: (tarefa) => {
        const prioridadeColors: Record<string, string> = {
          baixa: '#10b981',
          media: '#f59e0b',
          alta: '#ef4444',
          critica: '#dc2626',
        };
        const prioridadeLabels: Record<string, string> = {
          baixa: 'Baixa',
          media: 'Média',
          alta: 'Alta',
          critica: 'Crítica',
        };
        const color = prioridadeColors[tarefa.prioridade] || '#9ca3af';
        return (
          <span className="text-xs px-2 py-1 rounded" style={{
            backgroundColor: `${color}20`,
            color: color,
            border: `1px solid ${color}`,
          }}>
            {prioridadeLabels[tarefa.prioridade] || tarefa.prioridade}
          </span>
        );
      },
    },
    {
      id: 'notas',
      label: 'Notas',
      width: 200,
      render: (tarefa) => (
        <span className="text-xs truncate" title={tarefa.descricao || ''}>
          {tarefa.descricao || '-'}
        </span>
      ),
    },
  ];

  // Carregar colunas visíveis do localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setVisibleColumnIds(JSON.parse(stored));
    } else {
      // Colunas padrão iniciais
      setVisibleColumnIds(['numero', 'nome', 'duracao', 'inicio', 'termino', 'progresso', 'responsavel']);
    }
  }, []);

  // Salvar colunas visíveis no localStorage
  const saveVisibleColumns = (columnIds: string[]) => {
    setVisibleColumnIds(columnIds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columnIds));
  };

  // Toggle coluna
  const toggleColumn = (columnId: string) => {
    if (visibleColumnIds.includes(columnId)) {
      // Garantir que pelo menos 2 colunas permaneçam (numero e nome)
      if (visibleColumnIds.length > 2) {
        saveVisibleColumns(visibleColumnIds.filter(id => id !== columnId));
      }
    } else {
      saveVisibleColumns([...visibleColumnIds, columnId]);
    }
  };

  // Reordenar colunas via drag-and-drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(visibleColumnIds);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    saveVisibleColumns(items);
  };

  // Reordenar colunas via drag-and-drop nos cabeçalhos
  const handleHeaderDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(visibleColumnIds);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    saveVisibleColumns(items);
  };

  // Obter colunas visíveis ordenadas
  const visibleColumns = visibleColumnIds
    .map(id => availableColumns.find(col => col.id === id))
    .filter(col => col !== undefined) as ColumnDefinition[];

  // Calcular largura total da tabela
  const totalTableWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);

  // Sincronizar scroll entre tabela e gantt
  const syncScroll = (source: 'table' | 'gantt') => {
    if (!tableScrollRef.current || !ganttScrollRef.current) return;

    if (source === 'table') {
      ganttScrollRef.current.scrollTop = tableScrollRef.current.scrollTop;
    } else {
      tableScrollRef.current.scrollTop = ganttScrollRef.current.scrollTop;
    }
  };

  // Transformar tarefas para o formato frappe-gantt
  const transformToGanttTasks = (): GanttTask[] => {
    return tarefas.map((tarefa) => {
      let customClass = '';
      switch (tarefa.status) {
        case 'planejada':
          customClass = 'bar-planned';
          break;
        case 'em_andamento':
          customClass = 'bar-progress';
          break;
        case 'concluida':
          customClass = 'bar-complete';
          break;
        case 'atrasada':
          customClass = 'bar-delayed';
          break;
        case 'bloqueada':
          customClass = 'bar-blocked';
          break;
        case 'cancelada':
          customClass = 'bar-cancelled';
          break;
        default:
          customClass = 'bar-planned';
      }

      if (tarefa.isMilestone) {
        customClass = 'bar-milestone';
      }

      const dependencies =
        tarefa.dependencias?.map((dep) => dep.tarefaAnteriorId).join(', ') || '';

      return {
        id: tarefa.id,
        name: '',
        start: tarefa.dataInicioPlanejada,
        end: tarefa.dataFimPlanejada,
        progress: tarefa.progresso,
        dependencies: dependencies || undefined,
        custom_class: customClass,
      };
    });
  };

  useEffect(() => {
    if (!ganttContainerRef.current || tarefas.length === 0) {
      console.log('[Gantt Debug] Container ou tarefas não disponíveis', {
        hasContainer: !!ganttContainerRef.current,
        tarefasCount: tarefas.length
      });
      return;
    }

    // Pequeno delay para garantir que o DOM está pronto
    const timer = setTimeout(() => {
      if (!ganttContainerRef.current) return;

      // Limpar instância anterior
      if (ganttInstanceRef.current) {
        ganttContainerRef.current.innerHTML = '';
        ganttInstanceRef.current = null;
      }

      const ganttTasks = transformToGanttTasks();
      console.log('[Gantt Debug] Tarefas transformadas:', ganttTasks);
      console.log('[Gantt Debug] Primeira tarefa detalhada:', {
        id: ganttTasks[0]?.id,
        name: ganttTasks[0]?.name,
        start: ganttTasks[0]?.start,
        end: ganttTasks[0]?.end,
        progress: ganttTasks[0]?.progress,
        custom_class: ganttTasks[0]?.custom_class,
      });

      try {
        console.log('[Gantt Debug] Criando instância Gantt...', {
          container: ganttContainerRef.current,
          width: ganttContainerRef.current.offsetWidth,
          height: ganttContainerRef.current.offsetHeight,
          tasksCount: ganttTasks.length
        });

        const ganttInstance = new Gantt(ganttContainerRef.current, ganttTasks, {
          view_mode: viewMode,
          language: 'pt-BR',
          bar_height: 40,
          bar_corner_radius: 3,
          arrow_curve: 5,
          padding: 20,
          date_format: 'DD/MM/YYYY',
          popup_trigger: 'click',
          on_click: (task: GanttTask) => {
            const tarefa = tarefas.find((t) => t.id === task.id);
            if (tarefa && onTaskClick) {
              onTaskClick(tarefa);
            }
          },
          custom_popup_html: (task: GanttTask) => {
            const tarefa = tarefas.find((t) => t.id === task.id);
            if (!tarefa) return '';

            const duracao = calculateDuration(
              tarefa.dataInicioPlanejada,
              tarefa.dataFimPlanejada
            );

            return `
              <div class="gantt-popup-msproject">
                <div class="popup-header">
                  <strong>${tarefa.nome}</strong>
                  ${tarefa.isMilestone ? '<span class="ms-milestone-badge">📍 Marco</span>' : ''}
                </div>
                ${tarefa.descricao ? `<div class="popup-desc">${tarefa.descricao}</div>` : ''}
                <div class="popup-info">
                  <div class="info-row"><span>Status:</span> <strong>${getStatusLabel(tarefa.status)}</strong></div>
                  <div class="info-row"><span>Progresso:</span> <strong>${tarefa.progresso}%</strong></div>
                  <div class="info-row"><span>Início:</span> ${formatDate(tarefa.dataInicioPlanejada)}</div>
                  <div class="info-row"><span>Término:</span> ${formatDate(tarefa.dataFimPlanejada)}</div>
                  <div class="info-row"><span>Duração:</span> ${duracao} dias</div>
                  ${tarefa.responsavel ? `<div class="info-row"><span>Responsável:</span> ${tarefa.responsavel.name}</div>` : ''}
                </div>
              </div>
            `;
          },
        });

        ganttInstanceRef.current = ganttInstance;
        console.log('[Gantt Debug] Instância Gantt criada com sucesso', ganttInstance);

        // APLICAR ESTILOS IMEDIATAMENTE (sem delay)
        const immediateBars = ganttContainerRef.current.querySelectorAll('.bar-wrapper');
        console.log('[Gantt Debug] Aplicando estilos IMEDIATAMENTE em', immediateBars.length, 'barras');
        immediateBars.forEach((barWrapper, index) => {
          const barElement = barWrapper.querySelector('.bar') as SVGRectElement;
          if (barElement) {
            const wrapperClass = (barWrapper as any).className?.baseVal || '';
            let fillColor = '#3b82f6';
            let strokeColor = '#1e40af';

            if (wrapperClass.includes('bar-progress')) {
              fillColor = '#60a5fa';
              strokeColor = '#2563eb';
            } else if (wrapperClass.includes('bar-complete')) {
              fillColor = '#34d399';
              strokeColor = '#059669';
            } else if (wrapperClass.includes('bar-planned')) {
              fillColor = '#d1d5db';
              strokeColor = '#9ca3af';
            }

            barElement.setAttribute('fill', fillColor);
            barElement.setAttribute('stroke', strokeColor);
            barElement.setAttribute('stroke-width', '2');
            barElement.style.opacity = '1';
            barElement.style.visibility = 'visible';

            console.log(`[Gantt Debug] Barra ${index + 1} estilo aplicado IMEDIATAMENTE:`, {
              fill: fillColor,
              actualFill: barElement.getAttribute('fill'),
            });
          }
        });

        // Atualizar informações de debug após criar o Gantt
        setTimeout(() => {
          if (ganttContainerRef.current) {
            const svg = ganttContainerRef.current.querySelector('svg');
            const bars = ganttContainerRef.current.querySelectorAll('.bar-wrapper');
            const rects = ganttContainerRef.current.querySelectorAll('rect');

            console.log('[Gantt Debug] Elementos encontrados:', {
              bars: bars.length,
              rects: rects.length,
              firstBar: bars[0],
              firstRect: rects[0],
            });

            // 🔍 DIAGNÓSTICO PROFUNDO DO SVG
            if (svg) {
              console.log('🔍 ═══════════════════════════════════════════════');
              console.log('🔍 DIAGNÓSTICO SVG COMPLETO:');
              console.log('🔍 ═══════════════════════════════════════════════');
              console.log('  viewBox:', svg.getAttribute('viewBox'));
              console.log('  width:', svg.getAttribute('width'));
              console.log('  height:', svg.getAttribute('height'));
              console.log('  clientWidth:', svg.clientWidth);
              console.log('  clientHeight:', svg.clientHeight);

              // Verificar todos os grupos (g) e sua ordem
              const allGroups = svg.querySelectorAll('g');
              console.log('  Total de grupos <g>:', allGroups.length);
              console.log('  Ordem dos grupos:');
              allGroups.forEach((group, idx) => {
                const className = (group as any).className?.baseVal || group.getAttribute('class') || 'sem-classe';
                const transform = group.getAttribute('transform');
                const children = group.children.length;
                console.log(`    [${idx}] classe: "${className}", transform: "${transform}", filhos: ${children}`);
              });

              // Verificar se há clip-path ou mask
              const clipPaths = svg.querySelectorAll('clipPath');
              const masks = svg.querySelectorAll('mask');
              console.log('  ClipPaths:', clipPaths.length);
              console.log('  Masks:', masks.length);

              // Verificar grupo específico das barras
              const barGroup = svg.querySelector('g.bars');
              if (barGroup) {
                console.log('  ✅ Grupo de barras (g.bars) encontrado');
                console.log('    Transform:', barGroup.getAttribute('transform'));
                console.log('    Filhos:', barGroup.children.length);
              } else {
                console.log('  ⚠️ Grupo de barras (g.bars) NÃO encontrado');
              }

              console.log('🔍 ═══════════════════════════════════════════════');
            }

            // Inspecionar estilo da primeira barra
            if (bars[0]) {
              const firstBarElement = bars[0] as SVGGElement;
              const barRect = firstBarElement.querySelector('.bar') as SVGRectElement;
              const transform = firstBarElement.getAttribute('transform');
              const barFill = barRect?.getAttribute('fill');
              const barWidth = barRect?.getAttribute('width');
              const barHeight = barRect?.getAttribute('height');
              const barX = barRect?.getAttribute('x');
              const barY = barRect?.getAttribute('y');

              const classValue = (firstBarElement as any).className?.baseVal || firstBarElement.getAttribute('class') || '';

              console.log('═══════════════════════════════════════════════');
              console.log('[Gantt Debug] PRIMEIRA BARRA DETALHES:');
              console.log('  Transform:', transform);
              console.log('  Classes:', classValue);
              console.log('  Fill:', barFill);
              console.log('  Width:', barWidth);
              console.log('  Height:', barHeight);
              console.log('  X:', barX);
              console.log('  Y:', barY);
              console.log('  Opacity:', barRect?.style.opacity || 'none');
              console.log('═══════════════════════════════════════════════');
            }

            // FORÇAR ESTILOS DIRETAMENTE NOS ELEMENTOS SVG
            console.log('[Gantt Debug] Forçando estilos inline nas barras...');
            bars.forEach((barWrapper) => {
              const barElement = barWrapper.querySelector('.bar') as SVGRectElement;
              if (barElement) {
                // Obter classe do wrapper para determinar cor
                const wrapperClass = (barWrapper as any).className?.baseVal || barWrapper.getAttribute('class') || '';
                let fillColor = '#3b82f6'; // azul padrão
                let strokeColor = '#1e40af';

                if (wrapperClass.includes('bar-progress')) {
                  fillColor = '#60a5fa';
                  strokeColor = '#2563eb';
                } else if (wrapperClass.includes('bar-complete')) {
                  fillColor = '#34d399';
                  strokeColor = '#059669';
                } else if (wrapperClass.includes('bar-planned')) {
                  fillColor = '#d1d5db';
                  strokeColor = '#9ca3af';
                }

                // Aplicar estilos diretamente
                barElement.setAttribute('fill', fillColor);
                barElement.setAttribute('stroke', strokeColor);
                barElement.setAttribute('stroke-width', '2');
                barElement.style.opacity = '1';
                barElement.style.visibility = 'visible';
                console.log('[Gantt Debug] Estilo aplicado:', {
                  fill: fillColor,
                  stroke: strokeColor,
                  class: wrapperClass,
                });
              }
            });

            // 🎯 SOLUÇÃO: REORGANIZAR ORDEM DOS GRUPOS SVG
            if (svg) {
              console.log('🎯 ═══════════════════════════════════════════════');
              console.log('🎯 REORGANIZANDO CAMADAS DO SVG');
              console.log('🎯 ═══════════════════════════════════════════════');

              // PASSO 1: Mover grid para o INÍCIO (fundo)
              const gridGroup = svg.querySelector('g.grid');
              if (gridGroup) {
                console.log('🎯 Movendo GRID para o INÍCIO (fundo)...');
                svg.insertBefore(gridGroup, svg.firstChild);
              }

              // PASSO 2: Mover todos os bar-wrapper para o FINAL (frente)
              console.log('🎯 Movendo BARRAS para o FINAL (frente)...');
              bars.forEach((barWrapper, idx) => {
                svg.appendChild(barWrapper); // Move cada bar-wrapper para o final
                console.log(`  → Barra ${idx + 1} movida para frente`);
              });

              // PASSO 3: Definir viewBox explicitamente
              const svgWidth = svg.clientWidth || 3920;
              const svgHeight = svg.clientHeight || 400;
              svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
              console.log(`🎯 ViewBox definido: 0 0 ${svgWidth} ${svgHeight}`);

              // PASSO 4: Garantir que grid tenha opacity menor (fundo)
              if (gridGroup) {
                const gridRects = gridGroup.querySelectorAll('rect');
                gridRects.forEach(rect => {
                  const currentFill = rect.getAttribute('fill');
                  if (currentFill && currentFill !== 'none') {
                    rect.style.opacity = '0.3'; // Grid mais transparente
                  }
                });
                console.log(`🎯 Grid background definido com opacity: 0.3`);
              }

              console.log('🎯 Forçando repaint do SVG...');
              // Forçar repaint
              svg.style.display = 'none';
              (svg as any).offsetHeight; // Trigger reflow
              svg.style.display = '';

              console.log('🎯 ═══════════════════════════════════════════════');
              console.log('🎯 REORGANIZAÇÃO CONCLUÍDA! Barras devem estar VISÍVEIS agora!');
              console.log('🎯 ═══════════════════════════════════════════════');
            }

            setDebugInfo({
              containerWidth: ganttContainerRef.current.offsetWidth,
              containerHeight: ganttContainerRef.current.offsetHeight,
              hasInstance: !!ganttInstanceRef.current,
              hasSvg: !!svg,
              svgWidth: svg?.clientWidth || 0,
              svgHeight: svg?.clientHeight || 0,
              barCount: bars.length,
              rectCount: rects.length,
            });
          }
        }, 200);
      } catch (error) {
        console.error('[Gantt Debug] Erro ao inicializar Gantt:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (ganttContainerRef.current) {
        ganttContainerRef.current.innerHTML = '';
      }
      ganttInstanceRef.current = null;
    };
  }, [tarefas, viewMode, onTaskClick]);

  const handleZoomIn = () => {
    if (viewMode === 'Month') onViewModeChange?.('Week');
    else if (viewMode === 'Week') onViewModeChange?.('Day');
  };

  const handleZoomOut = () => {
    if (viewMode === 'Day') onViewModeChange?.('Week');
    else if (viewMode === 'Week') onViewModeChange?.('Month');
  };

  return (
    <div className="gantt-msproject-container">
      <style>
        {`
          /* Container principal */
          .gantt-msproject-container {
            display: flex;
            flex-direction: column;
            height: calc(100vh - 280px);
            min-height: 500px;
            background: #ffffff;
            border: 1px solid #d4d4d4;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }

          /* Toolbar */
          .ms-toolbar {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: #f3f4f6;
            border-bottom: 1px solid #d4d4d4;
            flex-wrap: wrap;
          }

          .ms-toolbar-section {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .ms-toolbar-divider {
            width: 1px;
            height: 20px;
            background: #d4d4d4;
            margin: 0 4px;
          }

          /* Split container */
          .ms-split-container {
            display: flex;
            flex: 1;
            overflow: hidden;
            background: #ffffff;
          }

          /* Tabela de dados */
          .ms-data-table {
            width: ${totalTableWidth}px;
            min-width: 400px;
            max-width: 70%;
            border-right: 2px solid #d4d4d4;
            display: flex;
            flex-direction: column;
            background: #ffffff;
          }

          .ms-table-header {
            display: flex;
            background: #f8f9fa;
            border-bottom: 2px solid #d4d4d4;
            font-size: 12px;
            font-weight: 600;
            color: #1f2937;
          }

          .ms-table-header > div {
            padding: 8px 6px;
            border-right: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: background-color 0.2s;
          }

          .ms-table-header > div:active {
            cursor: grabbing !important;
          }

          .ms-table-body {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
          }

          .ms-table-row {
            display: flex;
            border-bottom: 1px solid #e5e7eb;
            cursor: pointer;
            transition: background-color 0.1s;
          }

          .ms-table-row:hover {
            background-color: #f0f9ff;
          }

          .ms-table-row > div {
            padding: 6px;
            border-right: 1px solid #e5e7eb;
            font-size: 13px;
            display: flex;
            align-items: center;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .ms-task-name-content {
            display: flex;
            align-items: center;
            gap: 4px;
            width: 100%;
          }

          .ms-task-icon {
            flex-shrink: 0;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .ms-status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
          }

          .ms-progress-cell {
            display: flex;
            align-items: center;
            gap: 6px;
            width: 100%;
          }

          .ms-progress-bar-mini {
            flex: 1;
            height: 14px;
            background: #e5e7eb;
            border-radius: 2px;
            overflow: hidden;
            border: 1px solid #d1d5db;
          }

          .ms-progress-fill-mini {
            height: 100%;
            background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
            transition: width 0.3s;
          }

          .ms-progress-text {
            font-size: 11px;
            font-weight: 500;
            color: #6b7280;
            min-width: 32px;
            text-align: right;
          }

          /* Timeline */
          .ms-timeline-container {
            flex: 1;
            overflow: auto;
            background: #f9fafb;
            min-width: 600px;
            padding: 10px;
            position: relative;
          }

          .ms-timeline-container > div {
            min-height: 100%;
            width: max-content;
          }

          .gantt-wrapper {
            width: 100%;
            height: 100%;
            min-height: 500px;
            min-width: 800px;
            position: relative;
            overflow: visible !important;
          }

          /* Frappe-Gantt styles */
          .gantt-container {
            position: relative;
            font-size: 12px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            width: 100% !important;
            height: auto !important;
            min-height: 400px;
            overflow: visible !important;
          }

          .gantt-container svg {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: 400px;
            overflow: visible !important;
          }

          .gantt-container .grid-background {
            fill: #ffffff;
          }

          .gantt-container .grid-header {
            fill: #f8f9fa;
            stroke: #d4d4d4;
            stroke-width: 1;
          }

          .gantt-container .grid-row {
            fill: #ffffff;
          }

          .gantt-container .grid-row:nth-child(even) {
            fill: #fafafa;
          }

          .gantt-container .row-line {
            stroke: #e5e7eb;
            stroke-width: 1;
          }

          .gantt-container .tick {
            stroke: #e5e7eb;
            stroke-width: 0.5;
          }

          .gantt-container .tick.thick {
            stroke: #d4d4d4;
            stroke-width: 1;
          }

          .gantt-container .today-highlight {
            fill: #fef3c7;
            opacity: 0.4;
          }

          .gantt-container .upper-text,
          .gantt-container .lower-text {
            font-size: 11px;
            fill: #374151;
            font-weight: 500;
            writing-mode: horizontal-tb !important;
            text-orientation: mixed !important;
          }

          .gantt-container .upper-text {
            font-weight: 600;
          }

          .gantt-container text {
            writing-mode: horizontal-tb !important;
            text-orientation: mixed !important;
          }

          .gantt-container .bar {
            stroke: #1f2937 !important;
            stroke-width: 2 !important;
            rx: 3;
            ry: 3;
            opacity: 1 !important;
            visibility: visible !important;
            display: block !important;
          }

          .gantt-container .bar-wrapper {
            cursor: pointer;
            opacity: 1 !important;
            visibility: visible !important;
            display: block !important;
          }

          .gantt-container .bar-wrapper:hover .bar {
            filter: brightness(1.1);
          }

          .gantt-container .bar-progress {
            opacity: 0.7 !important;
            visibility: visible !important;
          }

          .gantt-container .bar-label {
            display: none;
          }

          /* Garantir que todos os elementos do Gantt sejam visíveis */
          .gantt-container .bar-group,
          .gantt-container .bar-wrapper,
          .gantt-container .bar,
          .gantt-container .bar-progress,
          .gantt-container rect {
            opacity: 1 !important;
            visibility: visible !important;
          }

          .gantt-container .arrow {
            fill: none;
            stroke: #6b7280;
            stroke-width: 1.4;
          }

          /* Cores por status - FORÇANDO VISUALIZAÇÃO */
          .bar-planned .bar,
          .bar-planned rect.bar {
            fill: #d1d5db !important;
            stroke: #9ca3af !important;
            opacity: 1 !important;
          }

          .bar-progress .bar,
          .bar-progress rect.bar {
            fill: #60a5fa !important;
            stroke: #2563eb !important;
            opacity: 1 !important;
          }

          .bar-complete .bar,
          .bar-complete rect.bar {
            fill: #34d399 !important;
            stroke: #059669 !important;
            opacity: 1 !important;
          }

          .bar-delayed .bar,
          .bar-delayed rect.bar {
            fill: #f87171 !important;
            stroke: #dc2626 !important;
            opacity: 1 !important;
          }

          .bar-blocked .bar,
          .bar-blocked rect.bar {
            fill: #fb923c !important;
            stroke: #ea580c !important;
            opacity: 1 !important;
          }

          .bar-cancelled .bar,
          .bar-cancelled rect.bar {
            fill: #9ca3af !important;
            stroke: #6b7280 !important;
            opacity: 0.5 !important;
          }

          .bar-milestone .bar,
          .bar-milestone rect.bar {
            fill: #a78bfa !important;
            stroke: #7c3aed !important;
            stroke-width: 2 !important;
            opacity: 1 !important;
          }

          /* FALLBACK AGRESSIVO: Forçar cor em TODAS as barras */
          .gantt-container g.bar-wrapper rect.bar,
          .gantt-container rect.bar,
          .gantt-container g rect[class*="bar"],
          svg.gantt rect.bar,
          svg.gantt g.bar-wrapper rect {
            fill: #3b82f6 !important;
            stroke: #1e40af !important;
            stroke-width: 2 !important;
            opacity: 1 !important;
            visibility: visible !important;
          }

          /* Sobrescrever atributo fill="null" ou fill="none" */
          .gantt-container rect[fill="null"],
          .gantt-container rect[fill="none"],
          .gantt-container rect[fill=""] {
            fill: #3b82f6 !important;
          }

          /* Popup */
          .gantt-container .popup-wrapper {
            position: absolute;
            background: #ffffff;
            border: 1px solid #d4d4d4;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 0;
            min-width: 280px;
            max-width: 350px;
            z-index: 1000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }

          .gantt-popup-msproject {
            padding: 0;
          }

          .popup-header {
            padding: 10px 12px;
            background: #f8f9fa;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
            font-weight: 600;
            color: #1f2937;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .ms-milestone-badge {
            background: #ede9fe;
            color: #7c3aed;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 11px;
            border: 1px solid #a78bfa;
          }

          .popup-desc {
            padding: 8px 12px;
            font-size: 12px;
            color: #6b7280;
            border-bottom: 1px solid #f3f4f6;
          }

          .popup-info {
            padding: 8px 12px;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-size: 12px;
            color: #374151;
          }

          .info-row span:first-child {
            color: #6b7280;
          }

          .gantt-container .popup-wrapper .pointer {
            border-top-color: #ffffff;
          }

          /* Legenda */
          .ms-legend {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            padding: 10px 12px;
            background: #f8f9fa;
            border-top: 1px solid #d4d4d4;
            font-size: 12px;
          }

          .ms-legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .ms-legend-color {
            width: 16px;
            height: 12px;
            border: 1px solid #6b7280;
            border-radius: 2px;
          }

          /* Scrollbar */
          .ms-table-body::-webkit-scrollbar,
          .ms-timeline-container::-webkit-scrollbar {
            width: 12px;
            height: 12px;
          }

          .ms-table-body::-webkit-scrollbar-track,
          .ms-timeline-container::-webkit-scrollbar-track {
            background: #f3f4f6;
          }

          .ms-table-body::-webkit-scrollbar-thumb,
          .ms-timeline-container::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 6px;
            border: 2px solid #f3f4f6;
          }

          .ms-table-body::-webkit-scrollbar-thumb:hover,
          .ms-timeline-container::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }

          /* Responsividade */
          @media (max-width: 1024px) {
            .ms-data-table {
              min-width: 350px;
            }
          }

          @media (max-width: 768px) {
            .ms-data-table {
              display: none;
            }

            .gantt-container .bar-label {
              display: block;
              font-size: 11px;
            }
          }
        `}
      </style>

      {/* Toolbar */}
      <div className="ms-toolbar">
        <div className="ms-toolbar-section">
          <CalendarDays className="w-4 h-4 text-gray-600" />
          <Select value={viewMode} onValueChange={(v) => onViewModeChange?.(v as any)}>
            <SelectTrigger className="w-[110px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Day">Dia</SelectItem>
              <SelectItem value="Week">Semana</SelectItem>
              <SelectItem value="Month">Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ms-toolbar-divider" />

        <div className="ms-toolbar-section">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={viewMode === 'Day'}
            className="h-8 px-2"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={viewMode === 'Month'}
            className="h-8 px-2"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>

        <div className="ms-toolbar-divider" />

        <Sheet open={columnSheetOpen} onOpenChange={setColumnSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Columns className="w-4 h-4 mr-2" />
              Colunas ({visibleColumnIds.length})
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col">
            <SheetHeader>
              <SheetTitle>Configurar Colunas</SheetTitle>
              <SheetDescription>
                Selecione e arraste as colunas para reordenar. Alterações são aplicadas em tempo real.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto mt-6 space-y-4 pr-2">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Colunas Disponíveis</h4>
                <p className="text-xs text-muted-foreground">
                  Marque as colunas que deseja exibir. Nº e Nome são obrigatórias.
                </p>
              </div>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="columns">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {visibleColumnIds.map((columnId, index) => {
                        const column = availableColumns.find(col => col.id === columnId);
                        if (!column) return null;

                        return (
                          <Draggable key={column.id} draggableId={column.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex items-center gap-3 p-3 border rounded transition-colors ${
                                  snapshot.isDragging ? 'bg-blue-50 border-blue-300 shadow-lg' : 'bg-white hover:bg-gray-50'
                                }`}
                              >
                                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                </div>
                                <Checkbox
                                  checked={true}
                                  onCheckedChange={() => toggleColumn(column.id)}
                                  disabled={column.id === 'numero' || column.id === 'nome'}
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{column.label}</div>
                                  <div className="text-xs text-gray-500">
                                    {column.width}px
                                    {(column.id === 'numero' || column.id === 'nome') && ' • Obrigatória'}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {/* Colunas não selecionadas */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Colunas Ocultas</h4>
                <div className="space-y-2">
                  {availableColumns
                    .filter(col => !visibleColumnIds.includes(col.id))
                    .map((column) => (
                      <div
                        key={column.id}
                        className="flex items-center gap-3 p-3 border rounded bg-gray-50"
                      >
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => toggleColumn(column.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-600">{column.label}</div>
                          <div className="text-xs text-gray-500">{column.width}px</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="ms-toolbar-divider" />

        <div className="ms-toolbar-section">
          <span className="text-xs text-gray-600">
            {tarefas.length} {tarefas.length === 1 ? 'tarefa' : 'tarefas'}
          </span>
        </div>

        <div style={{ flex: 1 }} />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLegend(!showLegend)}
          className="h-8 text-xs"
        >
          {showLegend ? 'Ocultar' : 'Mostrar'} Legenda
        </Button>
      </div>

      {/* Split Container */}
      <div className="ms-split-container">
        {/* Tabela de Dados */}
        <div className="ms-data-table">
          {/* Header com Drag-and-Drop */}
          <DragDropContext onDragEnd={handleHeaderDragEnd}>
            <Droppable droppableId="table-headers" direction="horizontal">
              {(provided) => (
                <div
                  className="ms-table-header"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {visibleColumns.map((column, index) => (
                    <Draggable key={column.id} draggableId={`header-${column.id}`} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            width: `${column.width}px`,
                            justifyContent: column.align || 'left',
                            cursor: 'grab',
                            backgroundColor: snapshot.isDragging ? '#e0f2fe' : 'transparent',
                            ...provided.draggableProps.style,
                          }}
                          className={snapshot.isDragging ? 'shadow-lg' : ''}
                        >
                          <GripVertical className="w-3 h-3 mr-1 text-gray-400" />
                          {column.label}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Body */}
          <div
            className="ms-table-body"
            ref={tableScrollRef}
            onScroll={() => syncScroll('table')}
          >
            {tarefas.map((tarefa, index) => (
              <div
                key={tarefa.id}
                className="ms-table-row"
                onClick={() => onTaskClick?.(tarefa)}
              >
                {visibleColumns.map((column) => (
                  <div
                    key={column.id}
                    style={{
                      width: `${column.width}px`,
                      justifyContent: column.align || 'left',
                    }}
                  >
                    {column.render(tarefa, index)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div
          className="ms-timeline-container"
          ref={ganttScrollRef}
          onScroll={() => syncScroll('gantt')}
        >
          <div ref={ganttContainerRef} className="gantt-wrapper"></div>

          {/* Debug Overlay */}
          {debugInfo && (
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(0, 0, 0, 0.85)',
              color: 'white',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontFamily: 'monospace',
              zIndex: 9999,
              minWidth: '250px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#fbbf24' }}>
                🔍 DIAGNÓSTICO GANTT
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Container Width:</span>
                <span style={{ color: debugInfo.containerWidth > 0 ? '#10b981' : '#ef4444' }}>
                  {debugInfo.containerWidth}px
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Container Height:</span>
                <span style={{ color: debugInfo.containerHeight > 0 ? '#10b981' : '#ef4444' }}>
                  {debugInfo.containerHeight}px
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Instância Gantt:</span>
                <span style={{ color: debugInfo.hasInstance ? '#10b981' : '#ef4444' }}>
                  {debugInfo.hasInstance ? '✓ Criada' : '✗ Não criada'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>SVG no DOM:</span>
                <span style={{ color: debugInfo.hasSvg ? '#10b981' : '#ef4444' }}>
                  {debugInfo.hasSvg ? '✓ Sim' : '✗ Não'}
                </span>
              </div>
              {debugInfo.hasSvg && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>SVG Width:</span>
                    <span style={{ color: debugInfo.svgWidth > 0 ? '#10b981' : '#ef4444' }}>
                      {debugInfo.svgWidth}px
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>SVG Height:</span>
                    <span style={{ color: debugInfo.svgHeight > 0 ? '#10b981' : '#ef4444' }}>
                      {debugInfo.svgHeight}px
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Barras (.bar-wrapper):</span>
                    <span style={{ color: debugInfo.barCount > 0 ? '#10b981' : '#ef4444' }}>
                      {debugInfo.barCount}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Retângulos (rect):</span>
                    <span style={{ color: debugInfo.rectCount > 0 ? '#10b981' : '#ef4444' }}>
                      {debugInfo.rectCount}
                    </span>
                  </div>
                </>
              )}
              <div style={{
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255,255,255,0.2)',
                fontSize: '10px',
                color: '#9ca3af'
              }}>
                {debugInfo.containerWidth === 0 || debugInfo.containerHeight === 0
                  ? '⚠️ Container sem dimensões'
                  : !debugInfo.hasSvg
                  ? '⚠️ SVG não foi criado'
                  : debugInfo.svgWidth === 0 || debugInfo.svgHeight === 0
                  ? '⚠️ SVG sem dimensões'
                  : debugInfo.barCount === 0
                  ? '⚠️ Nenhuma barra renderizada'
                  : debugInfo.rectCount === 0
                  ? '⚠️ Nenhum retângulo no SVG'
                  : '✓ Tudo OK - deveria estar visível'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legenda */}
      {showLegend && (
        <div className="ms-legend">
          <div className="ms-legend-item">
            <div className="ms-legend-color" style={{ background: '#d1d5db' }} />
            <span>Planejada</span>
          </div>
          <div className="ms-legend-item">
            <div className="ms-legend-color" style={{ background: '#60a5fa' }} />
            <span>Em Andamento</span>
          </div>
          <div className="ms-legend-item">
            <div className="ms-legend-color" style={{ background: '#34d399' }} />
            <span>Concluída</span>
          </div>
          <div className="ms-legend-item">
            <div className="ms-legend-color" style={{ background: '#f87171' }} />
            <span>Atrasada</span>
          </div>
          <div className="ms-legend-item">
            <div className="ms-legend-color" style={{ background: '#fb923c' }} />
            <span>Bloqueada</span>
          </div>
          <div className="ms-legend-item">
            <div className="ms-legend-color" style={{ background: '#a78bfa' }} />
            <span>📍 Marco</span>
          </div>
        </div>
      )}
    </div>
  );
}
