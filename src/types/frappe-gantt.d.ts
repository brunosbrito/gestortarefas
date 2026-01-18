/**
 * Type definitions for frappe-gantt
 * Sistema: Gestor Master - GMX Soluções Industriais
 */

declare module 'frappe-gantt' {
  export interface GanttTask {
    id: string;
    name: string;
    start: string;
    end: string;
    progress: number;
    dependencies?: string;
    custom_class?: string;
  }

  export interface GanttOptions {
    view_mode?: 'Day' | 'Week' | 'Month' | 'Quarter Day' | 'Half Day';
    language?: string;
    bar_height?: number;
    bar_corner_radius?: number;
    arrow_curve?: number;
    padding?: number;
    date_format?: string;
    popup_trigger?: 'click' | 'hover';
    on_click?: (task: GanttTask) => void;
    on_date_change?: (task: GanttTask, start: Date, end: Date) => void;
    on_progress_change?: (task: GanttTask, progress: number) => void;
    on_view_change?: (mode: string) => void;
    custom_popup_html?: (task: GanttTask) => string;
  }

  export default class Gantt {
    constructor(element: HTMLElement, tasks: GanttTask[], options?: GanttOptions);
    change_view_mode(mode: string): void;
    refresh(tasks: GanttTask[]): void;
  }
}

declare module 'frappe-gantt/dist/frappe-gantt.css' {
  const content: string;
  export default content;
}
