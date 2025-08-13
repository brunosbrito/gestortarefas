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
  trend?: 'up' | 'down' | 'stable';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  recommendation?: string;
}

export interface SwotMetrics {
  totalActivities: number;
  completedActivities: number;
  delayedActivities: number;
  paralyzedActivities: number;
  ongoingProjects: number;
  totalRNC: number;
  teamProductivity: number;
  projectsOnTime: number;
  averageCompletionTime: number;
  estimatedVsActualTime: number;
  qualityIndex: number;
  collaboratorEfficiency: number;
  processEfficiency: number;
  riskLevel: number;
}