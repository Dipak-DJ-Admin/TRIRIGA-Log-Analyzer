export interface Anomaly {
  title: string;
  severity: "Critical" | "Warning" | "Info";
  description: string;
}

export interface Recommendation {
  title: string;
  category: "Property Edit" | "DB Query" | "Workflow Adjustment";
  description: string;
  codeSnippet?: string;
}

export interface PlatformMetrics {
  cpuMax: number;
  memoryTrend: "Stable" | "Upward" | "Downward" | "Fluctuating";
  memoryLeakRisk: "Low" | "Medium" | "High";
  cacheMissRatio: number;
  workflowFailureRate: number;
  totalWorkflowsProcessed: number;
  totalWorkflowsFailed: number;
  avgResponseTimeMs: number;
}

export interface CopilotAnalysis {
  status: "Healthy" | "Degraded" | "Critical";
  executiveSummary: string;
  detectedAnomalies: Anomaly[];
  metrics: PlatformMetrics;
  rca: string;
  recommendations: Recommendation[];
  isAI?: boolean;
}

export type AlertFilter = "ALL" | "Critical" | "Warning" | "Info";
export type ActiveTab = "Dashboard" | "LogAnalyzer" | "TRIRIGABestPractices";
