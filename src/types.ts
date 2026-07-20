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
  cpuMax: number | null;
  memoryTrend: "Stable" | "Upward" | "Downward" | "Fluctuating" | "Unknown";
  memoryLeakRisk: "Low" | "Medium" | "High" | "Unknown";
  cacheMissRatio: number | null;
  workflowFailureRate: number | null;
  totalWorkflowsProcessed: number | null;
  totalWorkflowsFailed: number | null;
  avgResponseTimeMs: number | null;
}

export interface SqlExecution {
  sqlText: string;
  executionCount: number;
  totalTimeMs: number;
  avgTimeMs: number;
  maxTimeMs: number;
}

export interface WorkflowExecution {
  workflowName: string;
  module: string;
  objectType: string;
  executionCount: number;
  totalTimeMs: number;
  avgTimeMs: number;
  maxTimeMs: number;
}

export interface WebRequestExecution {
  urlOrAction: string;
  executionCount: number;
  totalTimeMs: number;
  avgTimeMs: number;
  maxTimeMs: number;
}

export interface PerformanceSummaryEntry {
  category: string;
  name: string;
  executionCount: number;
  totalTimeMs: number;
  avgTimeMs: number;
  maxTimeMs: number;
}

export interface PerformanceDetailEntry {
  id: string;
  category: string;
  name: string;
  durationMs: number;
  timestamp: string;
  details?: string;
}

export interface CopilotAnalysis {
  status: "Healthy" | "Degraded" | "Critical";
  executiveSummary: string;
  detectedAnomalies: Anomaly[];
  metrics: PlatformMetrics;
  rca: string;
  recommendations: Recommendation[];
  isAI?: boolean;
  sqlSummary?: SqlExecution[];
  workflowSummary?: WorkflowExecution[];
  webRequestSummary?: WebRequestExecution[];
  performanceSummary?: PerformanceSummaryEntry[];
  performanceDetails?: PerformanceDetailEntry[];
  selectedCategories?: string[];
}

export type AlertFilter = "ALL" | "Critical" | "Warning" | "Info";
export type ActiveTab = "Dashboard" | "LogAnalyzer" | "TRIRIGABestPractices";
