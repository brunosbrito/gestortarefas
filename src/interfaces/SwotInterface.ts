export interface SwotData {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  lastUpdated: Date;
}

export interface SwotItem {
  title: string;
  description: string;
  metric: number;
  metricLabel: string;
}

export interface SwotMetrics {
  totalActivities: number;
  completedActivities: number;
  delayedActivities: number;
  ongoingProjects: number;
  totalRNC: number;
  teamProductivity: number;
  projectsOnTime: number;
  averageCompletionTime: number;
}