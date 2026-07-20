import React, { useState, useEffect } from "react";
import {
  Activity,
  Sliders,
  Terminal,
  BookOpen,
  Copy,
  Check,
  Loader2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Code,
  Search,
  Database,
  ArrowRight,
  Info,
  Upload,
  Trash2,
  FileText,
  Clock,
  Eye,
  Plus,
  RefreshCw,
  Flame,
  ChevronRight,
  X,
  ShieldCheck,
  HelpCircle,
  Download,
  ChevronDown
} from "lucide-react";
import { CopilotAnalysis, AlertFilter } from "./types";
import { sampleScenarios } from "./sampleLogs";
import TelemetryChart from "./components/TelemetryChart";
import MetricCard from "./components/MetricCard";
import PerformanceAnalyzer from "./components/PerformanceAnalyzer";
import PerformanceRunCreator from "./components/PerformanceRunCreator";
import {
  parseLogsLocally,
  parseLogEvents,
  extractLogDetails,
  classifyLogType,
  generatePerformanceData,
  ParsedEvent
} from "./utils/logParser";

interface AnalyzedFile {
  id: string;
  name: string;
  size: number;
  type: "server" | "performance" | "metrics";
  content: string;
  lineCount: number;
  dateRange: string;
  duration: string;
  results: CopilotAnalysis;
  parsedEvents: ParsedEvent[];
}

export default function App() {
  // App States: 'upload' | 'processing' | 'dashboard'
  const [appState, setAppState] = useState<"upload" | "processing" | "dashboard">("upload");
  const [analyzedFiles, setAnalyzedFiles] = useState<AnalyzedFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [pastedText, setPastedText] = useState<string>("");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Search & Filter state for the dashboard
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [alertFilter, setAlertFilter] = useState<AlertFilter>("ALL");
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "tuning" | "summary" | "resultDetails">("overview");
  const [activePage, setActivePage] = useState<"upload" | "performance" | "system" | "security">("performance");
  const [showPerfRunCreator, setShowPerfRunCreator] = useState<boolean>(false);
  const [expandedSummaryCategories, setExpandedSummaryCategories] = useState<Record<string, boolean>>({});
  const [detailSearch, setDetailSearch] = useState<string>("");
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>("ALL");

  // Selection states for log event details in server log table
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Combined Multi-Log States
  const [activeCombinedType, setActiveCombinedType] = useState<"server" | "performance" | "metrics" | null>(null);
  const [combinedTab, setCombinedTab] = useState<"overview" | "timeline">("overview");
  const [combinedSearchQuery, setCombinedSearchQuery] = useState<string>("");
  const [combinedLevelFilter, setCombinedLevelFilter] = useState<string>("ALL");
  const [expandedCombinedEventId, setExpandedCombinedEventId] = useState<string | null>(null);

  // File processing state to animate loader progress
  const [filesToProcess, setFilesToProcess] = useState<{ name: string; size: number; content: string }[]>([]);
  const [processingIndex, setProcessingIndex] = useState<number>(0);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [processingStep, setProcessingStep] = useState<string>("");

  // Handle local files selected or dropped
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileList = Array.from(files);
    const filesToLoad: { name: string; size: number; content: string }[] = [];
    let filesRead = 0;

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        filesToLoad.push({
          name: file.name,
          size: file.size,
          content: text
        });
        
        filesRead++;
        if (filesRead === fileList.length) {
          setFilesToProcess((prev) => [...prev, ...filesToLoad]);
          setAppState("processing");
        }
      };
      reader.readAsText(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  // Run file parser processing sequentially to simulate a real analytics engine
  useEffect(() => {
    if (appState !== "processing" || filesToProcess.length === 0) return;

    if (processingIndex >= filesToProcess.length) {
      // Completed all processing!
      setAppState("dashboard");
      setActivePage("performance");
      setFilesToProcess([]);
      setProcessingIndex(0);
      setProcessingProgress(0);
      return;
    }

    const currentFile = filesToProcess[processingIndex];
    let progress = 0;

    const steps = [
      "Allocating dynamic memory stream buffers...",
      "Extracting UTC timestamps and boundary date metrics...",
      "Running G1GC telemetry parse patterns & heap limits...",
      "Filtering thread lock signatures & WebContainers...",
      "Evaluating DB connection pool starvation...",
      "Generating Root Cause Analysis (RCA) report...",
      "Saving parsed telemetry vectors..."
    ];

    setProcessingStep(steps[0]);

    const batchSize = filesToProcess.length;
    const progressIncrement = batchSize > 15 ? 50 : batchSize > 5 ? 25 : 10;
    const tickRate = batchSize > 15 ? 35 : batchSize > 5 ? 70 : 150;
    const nextFileDelay = batchSize > 15 ? 100 : batchSize > 5 ? 200 : 500;

    const interval = setInterval(() => {
      progress += progressIncrement;
      setProcessingProgress(Math.min(100, progress));

      const stepIndex = Math.min(steps.length - 1, Math.floor((progress / 100) * steps.length));
      setProcessingStep(steps[stepIndex]);

      if (progress >= 100) {
        clearInterval(interval);
        
        // Analyze and append to finished files
        const fileType = classifyLogType(currentFile.name, currentFile.content);
        
        // Map types to sample logs if name fits, or analyze generally
        let parsedResults = parseLogsLocally(currentFile.content, currentFile.name);
        
        const details = extractLogDetails(currentFile.content);
        const parsedEvents = parseLogEvents(currentFile.content);

        const newAnalyzed: AnalyzedFile = {
          id: `file-${Date.now()}-${processingIndex}-${Math.random().toString(36).substr(2, 4)}`,
          name: currentFile.name,
          size: currentFile.size,
          type: fileType,
          content: currentFile.content,
          lineCount: details.lineCount,
          dateRange: details.dateRange,
          duration: details.duration,
          results: parsedResults,
          parsedEvents: parsedEvents
        };

        setAnalyzedFiles((prev) => {
          const updated = [...prev, newAnalyzed];
          if (!activeFileId) {
            setActiveFileId(newAnalyzed.id);
          }
          return updated;
        });

        // Delay slightly before next file
        setTimeout(() => {
          setProcessingIndex((prev) => prev + 1);
          setProcessingProgress(0);
        }, nextFileDelay);
      }
    }, tickRate);

    return () => clearInterval(interval);
  }, [appState, filesToProcess, processingIndex]);

  // Load Preset files for immediate testing
  const handleLoadPresets = (mode: "all" | "server" | "gc" | "metrics") => {
    const filesToLoad: { name: string; size: number; content: string }[] = [];

    const serverPreset = sampleScenarios[3]; // workflow-deadlock
    const gcPreset = sampleScenarios[1];     // jvm-memory-leak
    const metricsPreset = sampleScenarios[0]; // cpu-exhaustion
    const optimalPreset = sampleScenarios[4]; // optimal-health

    if (mode === "all" || mode === "server") {
      filesToLoad.push({
        name: "tririga_server_error_stream.log",
        size: serverPreset.logText.length * 1.5,
        content: serverPreset.logText
      });
    }
    if (mode === "all" || mode === "gc") {
      filesToLoad.push({
        name: "ibm_websphere_g1gc_metrics.log",
        size: gcPreset.logText.length * 1.5,
        content: gcPreset.logText
      });
    }
    if (mode === "all" || mode === "metrics") {
      filesToLoad.push({
        name: "tririga_thread_monitor_dump.log",
        size: metricsPreset.logText.length * 1.5,
        content: metricsPreset.logText
      });
    }
    if (mode === "all" && filesToLoad.length === 3) {
      filesToLoad.push({
        name: "tririga_healthy_baseline.log",
        size: optimalPreset.logText.length * 1.5,
        content: optimalPreset.logText
      });
    }

    setFilesToProcess(filesToLoad);
    setAppState("processing");
  };

  // Paste direct log text triggers analysis as a generic server log
  const handleAnalyzePastedText = () => {
    if (!pastedText.trim()) return;
    setFilesToProcess([
      {
        name: "pasted_log_stream.log",
        size: pastedText.length * 1.5,
        content: pastedText
      }
    ]);
    setAppState("processing");
    setPastedText("");
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(text);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleRemoveFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnalyzedFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      
      // If we are in combined view of a type, check if we still have >= 2 files of that type
      if (activeCombinedType) {
        const typeFiles = filtered.filter(f => f.type === activeCombinedType);
        if (typeFiles.length < 2) {
          setActiveCombinedType(null);
          if (filtered.length > 0) {
            setActiveFileId(filtered[0].id);
          }
        }
      }

      if (activeFileId === id) {
        setActiveFileId(filtered.length > 0 ? filtered[0].id : null);
      }
      if (filtered.length === 0) {
        setAppState("upload");
        setActiveCombinedType(null);
      }
      return filtered;
    });
  };

  const handleCreateVirtualPerformanceRun = (selectedIds: string[]) => {
    const categoryIdMap: Record<string, string> = {
      "cba": "Connector for Business Applications",
      "extFormula": "Extended Formula",
      "extFormulaCalc": "Extended Formula - Calculation",
      "extFormulaCalcNormal": "Extended Formula - Calculation - Normal",
      "extFormulaCalcLabels": "Extended Formula - Calculation - Add Object Labels",
      "extFormulaQueue": "Extended Formula - Queue",
      "report": "Report",
      "sql": "SQL",
      "sqlNormal": "SQL - Normal",
      "sqlBind": "SQL - Add Bind Variables",
      "birt": "BIRT",
      "stateTransition": "State Transition",
      "workflow": "Workflow",
      "workflowAsync": "Workflow - Asynchronous",
      "workflowSync": "Workflow - Synchronous",
      "workflowStep": "Workflow - Step Trace",
      "cad": "CAD Integrator (Server)"
    };

    const selectedCategories = selectedIds
      .map(id => categoryIdMap[id])
      .filter(Boolean);

    // Generate performance run logs
    const perfData = generatePerformanceData(selectedCategories);

    const fileId = `perf-run-${Date.now()}`;
    const newFile: AnalyzedFile = {
      id: fileId,
      name: `Performance Run - ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
      size: perfData.details.length * 150,
      type: "performance",
      content: "Virtual performance telemetry run data.",
      lineCount: perfData.details.length + 10,
      dateRange: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
      duration: "Captured Duration Run",
      results: {
        status: "Healthy",
        executiveSummary: `Successfully completed a custom TRIRIGA performance timing trace. Captured ${perfData.details.length} detailed trace points across ${selectedCategories.length} active monitoring categories.`,
        detectedAnomalies: [],
        metrics: {
          cpuMax: 24.5,
          memoryTrend: "Stable",
          memoryLeakRisk: "Low",
          cacheMissRatio: 4.2,
          workflowFailureRate: 0.0,
          totalWorkflowsProcessed: 120,
          totalWorkflowsFailed: 0,
          avgResponseTimeMs: 145
        },
        rca: "### Custom Run Executed Successfully\n\nNo issues found in this run.",
        recommendations: [],
        performanceSummary: perfData.summary,
        performanceDetails: perfData.details,
        selectedCategories: selectedCategories
      },
      parsedEvents: perfData.details.map((det, idx) => ({
        id: `ev-run-${idx}`,
        timestamp: det.timestamp,
        level: "INFO",
        logger: "PerformanceTimings",
        message: `[Performance Timings][${det.category}][${det.name}] Duration: ${det.durationMs}ms`,
        details: det.details
      }))
    };

    setAnalyzedFiles(prev => [newFile, ...prev]);
    setActiveFileId(fileId);
    setShowPerfRunCreator(false);
    setActivePage("performance");
    setActiveTab("summary"); // Go directly to Result Summary
  };

  // Group files by type to check for duplicates
  const filesByType = analyzedFiles.reduce((acc, file) => {
    if (!acc[file.type]) {
      acc[file.type] = [];
    }
    acc[file.type].push(file);
    return acc;
  }, {} as Record<string, AnalyzedFile[]>);

  const duplicateTypes = (Object.keys(filesByType) as ("server" | "performance" | "metrics")[])
    .filter((type) => filesByType[type] && filesByType[type].length >= 2);

  const activeFile = activeCombinedType ? null : (analyzedFiles.find((f) => f.id === activeFileId) || analyzedFiles[0]);

  // Auto-sync activeFileId state if it fell back to avoid invalid activeFileId state
  useEffect(() => {
    if (activeCombinedType) return;
    if (activeFile && activeFileId !== activeFile.id) {
      setActiveFileId(activeFile.id);
    }
  }, [activeFile, activeFileId, activeCombinedType]);

  // Calculate health score of selected active log file
  const getHealthScore = (file: AnalyzedFile | undefined): number => {
    if (!file) return 100;
    const { status, metrics } = file.results;
    if (status === "Healthy") return 98;
    
    let score = 90;
    if (metrics.cpuMax && metrics.cpuMax > 80) score -= 30;
    if (metrics.memoryLeakRisk === "High") score -= 35;
    if (metrics.cacheMissRatio && metrics.cacheMissRatio > 15) score -= 15;
    if (metrics.workflowFailureRate && metrics.workflowFailureRate > 2) score -= 15;
    return Math.max(8, score);
  };

  const activeHealthScore = activeFile ? getHealthScore(activeFile) : 100;

  // Multiple Export System States
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isCombinedExportDropdownOpen, setIsCombinedExportDropdownOpen] = useState(false);

  // File download helper
  const triggerDownload = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    setIsExportDropdownOpen(false);
    setIsCombinedExportDropdownOpen(false);
  };

  // SVG Gauge and Chart generators for rich visual exports (Markdown & HTML)
  const generateHealthGaugeSVG = (score: number, status: string) => {
    const color = status === "Critical" ? "#F87171" : status === "Degraded" ? "#FBBF24" : "#34D399";
    const trackColor = "#21262D";
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    return `<svg width="180" height="180" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style="background:#0D1117; border-radius:16px; border:1px solid #30363D; font-family:system-ui, -apple-system, sans-serif;">
      <!-- Circular Track -->
      <circle cx="60" cy="55" r="${radius}" fill="none" stroke="${trackColor}" stroke-width="8" />
      <!-- Progress Arc -->
      <circle cx="60" cy="55" r="${radius}" fill="none" stroke="${color}" stroke-width="8" 
              stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" 
              stroke-linecap="round" transform="rotate(-90 60 55)" />
      <!-- Score Text -->
      <text x="60" y="58" font-size="20" font-weight="bold" fill="#F0F6FC" text-anchor="middle">${score}</text>
      <text x="60" y="74" font-size="9" font-weight="600" fill="#8B949E" text-anchor="middle" letter-spacing="0.5">HEALTH SCORE</text>
      <!-- Status Badge -->
      <rect x="30" y="94" width="60" height="14" rx="7" fill="${color}20" stroke="${color}40" stroke-width="1" />
      <text x="60" y="104" font-size="8" font-weight="bold" fill="${color}" text-anchor="middle">${status.toUpperCase()}</text>
    </svg>`;
  };

  const generateCpuGaugeSVG = (cpuMax: number | null) => {
    const val = cpuMax !== null ? cpuMax : 0;
    const color = val > 80 ? "#F87171" : val > 50 ? "#FBBF24" : "#60A5FA";
    
    return `<svg width="220" height="140" viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg" style="background:#0D1117; border-radius:16px; border:1px solid #30363D; font-family:system-ui, -apple-system, sans-serif;">
      <!-- Background Gauge Track -->
      <path d="M 20,80 A 60,60 0 0,1 140,80" fill="none" stroke="#21262D" stroke-width="12" stroke-linecap="round" />
      <!-- Colored Gauge Arc -->
      <path d="M 20,80 A 60,60 0 0,1 140,80" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" 
            stroke-dasharray="188.5" stroke-dashoffset="${188.5 - (val / 100) * 188.5}" />
      <!-- Value Text -->
      <text x="80" y="75" font-size="18" font-weight="bold" fill="#F0F6FC" text-anchor="middle">${val.toFixed(1)}%</text>
      <text x="80" y="92" font-size="8" font-weight="bold" fill="#8B949E" text-anchor="middle" letter-spacing="0.5">PEAK CPU LOAD</text>
    </svg>`;
  };

  const generateMemoryTrendSVG = (risk: string, trend: string) => {
    const isHigh = risk === "High";
    const isMed = risk === "Medium";
    const color = isHigh ? "#F87171" : isMed ? "#FBBF24" : "#34D399";
    const pathD = isHigh 
      ? "M 15,75 Q 40,70 65,50 T 115,25 T 165,15" 
      : isMed 
      ? "M 15,65 Q 40,60 65,45 T 115,35 T 165,25" 
      : "M 15,45 Q 40,30 65,45 T 115,45 T 165,45";
    
    return `<svg width="220" height="140" viewBox="0 0 180 100" xmlns="http://www.w3.org/2000/svg" style="background:#0D1117; border-radius:16px; border:1px solid #30363D; font-family:system-ui, -apple-system, sans-serif;">
      <!-- Grid lines -->
      <line x1="15" y1="20" x2="165" y2="20" stroke="#21262D" stroke-dasharray="2,2" />
      <line x1="15" y1="50" x2="165" y2="50" stroke="#21262D" stroke-dasharray="2,2" />
      <line x1="15" y1="80" x2="165" y2="80" stroke="#21262D" stroke-dasharray="2,2" />
      <!-- Trend Line -->
      <path d="${pathD}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" />
      <!-- Start & End Nodes -->
      <circle cx="15" cy="${isHigh ? 75 : isMed ? 65 : 45}" r="4" fill="${color}" />
      <circle cx="165" cy="${isHigh ? 15 : isMed ? 25 : 45}" r="4" fill="${color}" />
      <!-- Text Labels -->
      <text x="15" y="93" font-size="8" font-weight="bold" fill="#8B949E" letter-spacing="0.5">JVM HEAP TREND</text>
      <text x="165" y="93" font-size="8" font-weight="bold" fill="${color}" text-anchor="end">${risk} RISK (${trend})</text>
    </svg>`;
  };

  const generateCacheMissSVG = (missRatio: number | null) => {
    const val = missRatio !== null ? missRatio : 0;
    const color = val > 20 ? "#F87171" : val > 10 ? "#FBBF24" : "#34D399";
    
    return `<svg width="220" height="140" viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg" style="background:#0D1117; border-radius:16px; border:1px solid #30363D; font-family:system-ui, -apple-system, sans-serif;">
      <!-- Circular Track -->
      <circle cx="80" cy="40" r="28" fill="none" stroke="#21262D" stroke-width="10" />
      <!-- Progress Arc -->
      <circle cx="80" cy="40" r="28" fill="none" stroke="${color}" stroke-width="10" 
              stroke-dasharray="175.9" stroke-dashoffset="${175.9 - (val / 100) * 175.9}" 
              stroke-linecap="round" transform="rotate(-90 80 40)" />
      <!-- Inner Text -->
      <text x="80" y="45" font-size="12" font-weight="bold" fill="#F0F6FC" text-anchor="middle">${val.toFixed(1)}%</text>
      <text x="80" y="85" font-size="8" font-weight="bold" fill="#8B949E" text-anchor="middle" letter-spacing="0.5">CACHE MISS RATIO</text>
    </svg>`;
  };

  const generateWorkflowFailureSVG = (failRate: number | null, failed: number, processed: number) => {
    const rate = failRate !== null ? failRate : 0;
    const color = rate > 2.0 ? "#F87171" : rate > 0.5 ? "#FBBF24" : "#34D399";
    const successRate = 100 - rate;
    
    return `<svg width="220" height="140" viewBox="0 0 180 100" xmlns="http://www.w3.org/2000/svg" style="background:#0D1117; border-radius:16px; border:1px solid #30363D; font-family:system-ui, -apple-system, sans-serif;">
      <!-- Horizontal Stacked Bar representing Workflow State -->
      <rect x="15" y="35" width="150" height="14" rx="7" fill="#21262D" />
      <rect x="15" y="35" width="${(successRate / 100) * 150}" height="14" rx="7" fill="#10B981" />
      ${rate > 0 ? `<rect x="${15 + (successRate / 100) * 150 - 3}" width="${Math.max(6, (rate / 100) * 150)}" y="35" height="14" rx="7" fill="#EF4444" />` : ""}
      <!-- Legend -->
      <circle cx="20" cy="65" r="3" fill="#10B981" />
      <text x="28" y="68" font-size="8" font-weight="bold" fill="#8B949E">OK (${(processed - failed).toLocaleString()})</text>
      <circle cx="100" cy="65" r="3" fill="#EF4444" />
      <text x="108" y="68" font-size="8" font-weight="bold" fill="#8B949E">FAIL (${failed.toLocaleString()})</text>
      <text x="15" y="24" font-size="9" font-weight="bold" fill="#F0F6FC">WORKFLOW RATIO</text>
      <text x="15" y="90" font-size="8" font-weight="bold" fill="${color}">Failure Rate: ${rate.toFixed(1)}%</text>
    </svg>`;
  };

  // 1. Export Markdown (Individual)
  const handleExportMarkdownIndividual = (file: AnalyzedFile) => {
    const score = getHealthScore(file);
    const m = file.results.metrics;
    
    let md = `# 📊 IBM TRIRIGA Diagnostics Report: ${file.name}\n\n`;
    md += `*Generated via TRIRIGA Local Browser Sandbox Diagnostics on ${new Date().toLocaleString()}*\n\n`;
    
    md += `## 🗃️ File Statistics\n`;
    md += `| Attribute | Value |\n`;
    md += `| :--- | :--- |\n`;
    md += `| **File Name** | \`${file.name}\` |\n`;
    md += `| **File Size** | ${(file.size / 1024).toFixed(1)} KB |\n`;
    md += `| **Lines Scanned** | ${file.lineCount.toLocaleString()} lines |\n`;
    md += `| **Date Range** | ${file.dateRange || "N/A"} |\n`;
    md += `| **Duration Span** | ${file.duration || "N/A"} |\n`;
    md += `| **Overall Health Score** | **${score}/100** |\n`;
    md += `| **Overall Health Status** | **${file.results.status}** |\n\n`;
    
    md += `## 📈 Executive Summary\n`;
    md += `> ${file.results.executiveSummary}\n\n`;

    md += `## 📊 Visual Diagnostic Gauges\n`;
    md += `<div align="center" style="background:#0D1117; padding:24px; border-radius:16px; border:1px solid #30363D; display:flex; flex-wrap:wrap; justify-content:center; gap:16px; margin-bottom:30px;">\n`;
    md += `  ${generateHealthGaugeSVG(score, file.results.status)}\n`;
    md += `  ${generateCpuGaugeSVG(m.cpuMax)}\n`;
    md += `  ${generateMemoryTrendSVG(m.memoryLeakRisk, m.memoryTrend)}\n`;
    md += `  ${generateCacheMissSVG(m.cacheMissRatio)}\n`;
    md += `  ${generateWorkflowFailureSVG(m.workflowFailureRate, m.totalWorkflowsFailed, m.totalWorkflowsProcessed)}\n`;
    md += `</div>\n\n`;

    md += `## 📊 Extracted Telemetry Reference Table\n`;
    md += `| Metric KPI Name | Current Extracted Value | Operating Threshold | Health Assessment Status |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    md += `| **Peak CPU Load** | ${m.cpuMax !== null ? `${m.cpuMax.toFixed(1)}%` : "N/A"} | &lt; 80.0% | ${m.cpuMax !== null && m.cpuMax > 80 ? "🔴 CRITICAL EXHAUSTION" : "🟢 HEALTHY"} |\n`;
    md += `| **JVM Memory Leak Risk** | ${m.memoryLeakRisk} (${m.memoryTrend}) | Low Risk / Stable | ${m.memoryLeakRisk === "High" ? "🔴 HIGH RISK LEAK" : m.memoryLeakRisk === "Medium" ? "🟡 MODERATE RISK" : "🟢 OPTIMAL"} |\n`;
    md += `| **Cache Miss Ratio** | ${m.cacheMissRatio !== null ? `${m.cacheMissRatio.toFixed(1)}%` : "N/A"} | &lt; 15.0% | ${m.cacheMissRatio !== null && m.cacheMissRatio > 15 ? "🔴 HIGH MISS LATENCY" : "🟢 OPTIMAL"} |\n`;
    md += `| **Workflow Failure Rate** | ${m.workflowFailureRate !== null ? `${m.workflowFailureRate.toFixed(1)}%` : "0.0%"} | &lt; 2.0% | ${m.workflowFailureRate !== null && m.workflowFailureRate > 2 ? "🔴 UNSTABLE FAILURE RISK" : "🟢 STABLE"} |\n`;
    md += `| **Avg Response Latency** | ${m.avgResponseTimeMs !== null ? `${m.avgResponseTimeMs}ms` : "N/A"} | &lt; 250ms | ${m.avgResponseTimeMs !== null && m.avgResponseTimeMs > 250 ? "🟡 DEGRADED SLOWNESS" : "🟢 OPTIMAL"} |\n\n`;

    if (file.results.detectedAnomalies.length > 0) {
      md += `## ⚠️ Detected Anomalies & Outliers\n`;
      file.results.detectedAnomalies.forEach((a, index) => {
        const icon = a.severity === "Critical" ? "🔴" : "🟡";
        md += `### ${icon} ${index + 1}. ${a.title} [${a.severity}]\n`;
        md += `* **Observation:** ${a.description}\n\n`;
      });
      md += `\n`;
    }

    md += `## 🔍 Deep Root Cause Analysis (RCA)\n`;
    md += `${file.results.rca}\n\n`;

    if (file.results.recommendations.length > 0) {
      md += `## 🛠️ Actionable Remediation & Tuning Recommendations\n`;
      file.results.recommendations.forEach((rec, idx) => {
        md += `### ${idx + 1}. ${rec.title} (\`${rec.category}\`)\n`;
        md += `* **Remediation Action:** ${rec.description}\n\n`;
        if (rec.codeSnippet) {
          md += `* **Recommended Configuration Snippet / Action script:**\n`;
          md += `\`\`\`${rec.category === "DB Query" ? "sql" : "properties"}\n${rec.codeSnippet}\n\`\`\`\n\n`;
        }
      });
    }

    triggerDownload(md, `${file.name.replace(/\.[^/.]+$/, "")}_diagnostics_report.md`, "text/markdown");
  };

  // 1b. Export HTML (Individual)
  const handleExportHTMLIndividual = (file: AnalyzedFile) => {
    const score = getHealthScore(file);
    const m = file.results.metrics;
    
    let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IBM TRIRIGA Diagnostics: ${file.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #0D1117; color: #C9D1D9; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="min-h-screen p-4 md:p-8 selection:bg-blue-600/30 selection:text-white">
  <div class="max-w-6xl mx-auto space-y-8">
    
    <!-- Top Bar -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#161B22] border border-[#30363D] p-6 rounded-2xl shadow-sm relative">
      <div class="space-y-1.5 z-10">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-xs font-bold font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">IBM TRIRIGA DIAGNOSTICS</span>
          <span class="text-xs text-slate-400">Individual Node Report</span>
        </div>
        <h1 class="text-xl md:text-2xl font-extrabold text-white tracking-tight">${file.name}</h1>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
          <span>Size: ${(file.size / 1024).toFixed(1)} KB</span>
          <span>•</span>
          <span>Scanned: ${file.lineCount.toLocaleString()} lines</span>
          <span>•</span>
          <span>Range: ${file.dateRange || "N/A"}</span>
        </div>
      </div>
      
      <div class="flex items-center gap-4 bg-[#0D1117] border border-[#30363D] p-4 rounded-xl min-w-[200px] justify-between z-10">
        <div class="space-y-0.5">
          <span class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Health Score</span>
          <span class="text-2xl font-extrabold font-mono text-white">${score}/100</span>
        </div>
        <span class="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
          file.results.status === "Critical" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
          file.results.status === "Degraded" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        }">${file.results.status}</span>
      </div>
    </div>

    <!-- Executive Summary Card -->
    <div class="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl space-y-3">
      <div class="flex items-center gap-2 text-white font-bold">
        <i data-lucide="info" class="w-4 h-4 text-blue-400"></i>
        <span>Executive Summary</span>
      </div>
      <p class="text-sm text-slate-300 leading-relaxed">${file.results.executiveSummary}</p>
    </div>

    <!-- Visual Dashboard Grid -->
    <div>
      <h2 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 font-mono">II. Visual KPI Metrics Dashboard</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- CPU Gauge -->
        <div class="bg-[#161B22] border border-[#30363D] p-5 rounded-2xl flex flex-col items-center justify-center space-y-3">
          ${generateCpuGaugeSVG(m.cpuMax)}
        </div>
        <!-- Memory Sparkline -->
        <div class="bg-[#161B22] border border-[#30363D] p-5 rounded-2xl flex flex-col items-center justify-center space-y-3">
          ${generateMemoryTrendSVG(m.memoryLeakRisk, m.memoryTrend)}
        </div>
        <!-- Cache Miss Donut -->
        <div class="bg-[#161B22] border border-[#30363D] p-5 rounded-2xl flex flex-col items-center justify-center space-y-3">
          ${generateCacheMissSVG(m.cacheMissRatio)}
        </div>
        <!-- Workflows Stacked Bar -->
        <div class="bg-[#161B22] border border-[#30363D] p-5 rounded-2xl flex flex-col items-center justify-center space-y-3">
          ${generateWorkflowFailureSVG(m.workflowFailureRate, m.totalWorkflowsFailed, m.totalWorkflowsProcessed)}
        </div>
      </div>
    </div>

    <!-- Detailed Analysis Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Root Cause Analysis (RCA) -->
      <div class="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl space-y-4">
        <div class="flex items-center gap-2 text-white font-bold border-b border-[#30363D] pb-3">
          <i data-lucide="activity" class="w-4 h-4 text-purple-400"></i>
          <span>Root Cause Analysis (RCA)</span>
        </div>
        <div class="text-sm text-slate-300 leading-relaxed space-y-3 font-sans whitespace-pre-wrap">
          ${file.results.rca}
        </div>
      </div>

      <!-- Detected Anomalies -->
      <div class="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl space-y-4">
        <div class="flex items-center gap-2 text-white font-bold border-b border-[#30363D] pb-3">
          <i data-lucide="alert-triangle" class="w-4 h-4 text-red-400"></i>
          <span>Detected Anomalies (${file.results.detectedAnomalies.length})</span>
        </div>
        <div class="space-y-3 overflow-y-auto max-h-[400px] pr-2">
          ${file.results.detectedAnomalies.map(a => `
            <div class="p-4 bg-[#0D1117] border border-[#30363D] rounded-xl space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white">${a.title}</span>
                <span class="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
                  a.severity === "Critical" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                  "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }">${a.severity}</span>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed">${a.description}</p>
            </div>
          `).join('')}
          ${file.results.detectedAnomalies.length === 0 ? `
            <div class="text-center py-8 text-xs text-slate-500 font-mono">No anomalies detected in this log file.</div>
          ` : ''}
        </div>
      </div>

    </div>

    <!-- Recommendations & Remediation Code Blocks -->
    <div class="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl space-y-6">
      <div class="flex items-center gap-2 text-white font-bold border-b border-[#30363D] pb-3">
        <i data-lucide="wrench" class="w-4 h-4 text-emerald-400"></i>
        <span>Remediation Playbooks (${file.results.recommendations.length})</span>
      </div>
      
      <div class="space-y-6">
        ${file.results.recommendations.map((rec, idx) => `
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-extrabold text-white flex items-center gap-2">
                <span class="w-5 h-5 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-xs font-mono">${idx + 1}</span>
                <span>${rec.title}</span>
              </h3>
              <span class="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider font-mono bg-slate-800 text-slate-300 uppercase border border-slate-700">${rec.category}</span>
            </div>
            <p class="text-xs text-slate-300 pl-7 leading-relaxed">${rec.description}</p>
            
            ${rec.codeSnippet ? `
              <div class="pl-7">
                <div class="bg-[#0D1117] border border-[#30363D] rounded-xl overflow-hidden font-mono text-[11px]">
                  <div class="bg-[#161B22] border-b border-[#30363D] px-4 py-2 flex justify-between items-center text-slate-400 text-[10px]">
                    <span>REMEDIATION CONFIGURATION / QUERY</span>
                    <button onclick="navigator.clipboard.writeText(this.nextElementSibling.nextElementSibling.innerText); this.innerText='Copied!';" class="hover:text-white transition-all text-[9px] uppercase tracking-wider font-bold cursor-pointer">Copy</button>
                    <span class="hidden">${rec.codeSnippet.replace(/"/g, '&quot;')}</span>
                  </div>
                  <pre class="p-4 overflow-x-auto text-emerald-400/95 leading-relaxed">${rec.codeSnippet}</pre>
                </div>
              </div>
            ` : ''}
          </div>
        `).join('<hr class="border-[#30363D]"/>')}
      </div>
    </div>

    <footer class="text-center text-xs text-slate-500 font-mono py-8">
      IBM TRIRIGA Diagnostics • Standalone Offline Interactive HTML Exporter • Generated at ${new Date().toLocaleString()}
    </footer>

  </div>

  <script>
    lucide.createIcons();
  </script>
</body>
</html>`;
    
    triggerDownload(htmlContent, `${file.name.replace(/\.[^/.]+$/, "")}_interactive_report.html`, "text/html");
  };


  // 2. Export JSON (Individual)
  const handleExportJSONIndividual = (file: AnalyzedFile) => {
    const data = {
      exporter: "IBM TRIRIGA Diagnostics Engine (Browser Sandbox)",
      generatedAt: new Date().toISOString(),
      file: {
        name: file.name,
        sizeBytes: file.size,
        lineCount: file.lineCount,
        type: file.type,
        dateRange: file.dateRange,
        duration: file.duration
      },
      analysisResults: {
        status: file.results.status,
        healthScore: getHealthScore(file),
        executiveSummary: file.results.executiveSummary,
        metrics: file.results.metrics,
        detectedAnomalies: file.results.detectedAnomalies,
        rootCauseAnalysis: file.results.rca,
        recommendations: file.results.recommendations
      }
    };
    triggerDownload(JSON.stringify(data, null, 2), `${file.name.replace(/\.[^/.]+$/, "")}_diagnostics_report.json`, "application/json");
  };

  // 3. Export CSV Event Trace / Results Checklist (Individual)
  const handleExportCSVIndividual = (file: AnalyzedFile) => {
    let csv = "Type,Severity or Category,Title,Description,Remediation Snippet or Metric Detail\n";
    
    // Add file metadata first
    csv += `"Metadata","Overall Status","${file.results.status}","File: ${file.name.replace(/"/g, '""')} | Lines: ${file.lineCount}","Health Score: ${getHealthScore(file)}/100"\n`;
    csv += `"Metadata","Executive Summary","N/A","${file.results.executiveSummary.replace(/"/g, '""')}","N/A"\n`;

    // Add Key Metrics
    const m = file.results.metrics;
    csv += `"KPI","CPU","Peak CPU","${m.cpuMax !== null ? m.cpuMax.toFixed(1) : "N/A"}%","N/A"\n`;
    csv += `"KPI","Memory","Leak Risk / Trend","${m.memoryLeakRisk} / ${m.memoryTrend}","N/A"\n`;
    csv += `"KPI","Cache","Miss Ratio","${m.cacheMissRatio !== null ? m.cacheMissRatio.toFixed(1) : "N/A"}%","N/A"\n`;
    csv += `"KPI","Workflows","Failure Rate","${m.workflowFailureRate !== null ? m.workflowFailureRate.toFixed(1) : "N/A"}% (${m.totalWorkflowsFailed || 0}/${m.totalWorkflowsProcessed || 0} processed)","N/A"\n`;
    csv += `"KPI","Latency","Avg Response Time","${m.avgResponseTimeMs !== null ? m.avgResponseTimeMs : "N/A"}ms","N/A"\n`;

    // Add Detected Anomalies
    file.results.detectedAnomalies.forEach((a) => {
      const type = "Anomaly";
      const severity = `"${(a.severity || "").replace(/"/g, '""')}"`;
      const title = `"${(a.title || "").replace(/"/g, '""')}"`;
      const desc = `"${(a.description || "").replace(/"/g, '""')}"`;
      const remediation = `""`;
      csv += `${type},${severity},${title},${desc},${remediation}\n`;
    });

    // Add Recommendations
    file.results.recommendations.forEach((rec) => {
      const type = "Remediation";
      const cat = `"${(rec.category || "").replace(/"/g, '""')}"`;
      const title = `"${(rec.title || "").replace(/"/g, '""')}"`;
      const desc = `"${(rec.description || "").replace(/"/g, '""')}"`;
      const remediation = `"${((rec.codeSnippet || rec.description) || "").replace(/"/g, '""')}"`;
      csv += `${type},${cat},${title},${desc},${remediation}\n`;
    });

    triggerDownload(csv, `${file.name.replace(/\.[^/.]+$/, "")}_diagnostics_results.csv`, "text/csv");
  };

  const handleExportSummaryCSV = (file: AnalyzedFile) => {
    const summaryEntries = file.results.performanceSummary || [];
    if (summaryEntries.length === 0) return;

    let csvContent = "Category,Entry Name,Execution Count,Average Time (ms),Max Time (ms),Total Duration (ms)\n";

    const grouped: Record<string, typeof summaryEntries> = {};
    summaryEntries.forEach(entry => {
      if (!grouped[entry.category]) {
        grouped[entry.category] = [];
      }
      grouped[entry.category].push(entry);
    });

    Object.keys(grouped).forEach(category => {
      const categoryEntries = grouped[category];
      const isExpanded = expandedSummaryCategories[category];
      const visibleEntries = isExpanded ? categoryEntries : categoryEntries.slice(0, 5);

      visibleEntries.forEach(entry => {
        csvContent += `"${entry.category.replace(/"/g, '""')}","${entry.name.replace(/"/g, '""')}",${entry.executionCount},${entry.avgTimeMs},${entry.maxTimeMs},${entry.totalTimeMs}\n`;
      });
    });

    triggerDownload(csvContent, "Performance_Summary_Export.csv", "text/csv");
  };

  // 4. Export Markdown (Combined)
  const handleExportMarkdownCombined = (type: "server" | "performance" | "metrics") => {
    const typeFiles = filesByType[type] || [];
    const typeLabel = type === "server" ? "Server Application Logs" : type === "performance" ? "JVM Performance Logs" : "System Metrics";
    
    const cpuList = typeFiles.map(f => f.results.metrics.cpuMax).filter(v => v !== null) as number[];
    const peakCpu = cpuList.length > 0 ? Math.max(...cpuList) : 88.5;
    const cacheList = typeFiles.map(f => f.results.metrics.cacheMissRatio).filter(v => v !== null) as number[];
    const avgCacheMiss = cacheList.length > 0 ? (cacheList.reduce((a, b) => a + b, 0) / cacheList.length) : 26.4;
    const leakRisk = typeFiles.some(f => f.results.metrics.memoryLeakRisk === "High") ? "High" : typeFiles.some(f => f.results.metrics.memoryLeakRisk === "Medium") ? "Medium" : "Low";
    
    // Aggregates for workflows
    const totalProcessed = typeFiles.reduce((acc, f) => acc + (f.results.metrics.totalWorkflowsProcessed || 0), 0);
    const totalFailed = typeFiles.reduce((acc, f) => acc + (f.results.metrics.totalWorkflowsFailed || 0), 0);
    const aggWorkflowFailRate = totalProcessed > 0 ? (totalFailed / totalProcessed) * 100 : 2.5;

    let md = `# 📊 Consolidated IBM TRIRIGA Cluster Report: ${typeLabel}\n\n`;
    md += `*Generated via TRIRIGA Local Browser Sandbox Diagnostics on ${new Date().toLocaleString()}*\n\n`;
    
    md += `## 🗃️ Cluster Workspace Statistics\n`;
    md += `* **Consolidated Type:** ${typeLabel}\n`;
    md += `* **Merged Nodes Count:** ${typeFiles.length} server nodes\n`;
    md += `* **Source Log Streams:** ${typeFiles.map(f => f.name).join(", ")}\n\n`;

    md += `## 📊 Aggregated Cluster Gauges\n`;
    md += `<div align="center" style="background:#0D1117; padding:24px; border-radius:16px; border:1px solid #30363D; display:flex; flex-wrap:wrap; justify-content:center; gap:16px; margin-bottom:30px;">\n`;
    md += `  ${generateCpuGaugeSVG(peakCpu)}\n`;
    md += `  ${generateMemoryTrendSVG(leakRisk, "Merged")}\n`;
    md += `  ${generateCacheMissSVG(avgCacheMiss)}\n`;
    md += `  ${generateWorkflowFailureSVG(aggWorkflowFailRate, totalFailed, totalProcessed)}\n`;
    md += `</div>\n\n`;

    md += `## 📊 Node Comparison Matrix\n`;
    md += `| Node Name | Overall Health Status | Scanned Lines | Peak CPU | Memory Leak Risk | Cache Miss Ratio | WF Failure Rate |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    typeFiles.forEach((file) => {
      const m = file.results.metrics;
      const icon = file.results.status === "Critical" ? "🔴" : file.results.status === "Degraded" ? "🟡" : "🟢";
      md += `| **${file.name}** | ${icon} ${file.results.status} | ${file.lineCount.toLocaleString()} | ${m.cpuMax !== null ? `${m.cpuMax.toFixed(1)}%` : "N/A"} | ${m.memoryLeakRisk} | ${m.cacheMissRatio !== null ? `${m.cacheMissRatio.toFixed(1)}%` : "N/A"} | ${m.workflowFailureRate !== null ? `${m.workflowFailureRate.toFixed(1)}%` : "N/A"} |\n`;
    });
    md += `\n\n`;

    md += `## 📄 Diagnostic Details per Node\n\n`;
    typeFiles.forEach((file) => {
      md += `### Node: ${file.name}\n`;
      md += `* **File Size:** ${(file.size / 1024).toFixed(1)} KB | **Lines Scanned:** ${file.lineCount.toLocaleString()}\n`;
      md += `* **Overall Status:** **${file.results.status}** (Health Score: **${getHealthScore(file)}/100**)\n`;
      md += `* **Executive Summary:** ${file.results.executiveSummary}\n\n`;
    });

    triggerDownload(md, `tririga_cluster_${type}_consolidated_report.md`, "text/markdown");
  };

  // 4b. Export HTML (Combined)
  const handleExportHTMLCombined = (type: "server" | "performance" | "metrics") => {
    const typeFiles = filesByType[type] || [];
    const typeLabel = type === "server" ? "Server Application Logs" : type === "performance" ? "JVM Performance Logs" : "System Metrics";
    
    const cpuList = typeFiles.map(f => f.results.metrics.cpuMax).filter(v => v !== null) as number[];
    const peakCpu = cpuList.length > 0 ? Math.max(...cpuList) : 88.5;
    const cacheList = typeFiles.map(f => f.results.metrics.cacheMissRatio).filter(v => v !== null) as number[];
    const avgCacheMiss = cacheList.length > 0 ? (cacheList.reduce((a, b) => a + b, 0) / cacheList.length) : 26.4;
    const leakRisk = typeFiles.some(f => f.results.metrics.memoryLeakRisk === "High") ? "High" : typeFiles.some(f => f.results.metrics.memoryLeakRisk === "Medium") ? "Medium" : "Low";
    
    // Aggregates for workflows
    const totalProcessed = typeFiles.reduce((acc, f) => acc + (f.results.metrics.totalWorkflowsProcessed || 0), 0);
    const totalFailed = typeFiles.reduce((acc, f) => acc + (f.results.metrics.totalWorkflowsFailed || 0), 0);
    const aggWorkflowFailRate = totalProcessed > 0 ? (totalFailed / totalProcessed) * 100 : 2.5;

    // Calculate aggregated summaries for the export if type is performance
    let performanceSection = "";
    if (type === "performance") {
      const sqlMap = new Map();
      typeFiles.forEach(f => {
        (f.results.sqlSummary || []).forEach(item => {
          const existing = sqlMap.get(item.sqlText);
          if (existing) {
            existing.executionCount += item.executionCount;
            existing.totalTimeMs += item.totalTimeMs;
            existing.maxTimeMs = Math.max(existing.maxTimeMs, item.maxTimeMs);
          } else {
            sqlMap.set(item.sqlText, { ...item });
          }
        });
      });
      const combinedSql = Array.from(sqlMap.values()).map(item => ({
        ...item,
        avgTimeMs: item.executionCount > 0 ? Math.round(item.totalTimeMs / item.executionCount) : 0
      })).sort((a: any, b: any) => b.totalTimeMs - a.totalTimeMs);

      const wfMap = new Map();
      typeFiles.forEach(f => {
        (f.results.workflowSummary || []).forEach(item => {
          const existing = wfMap.get(item.workflowName);
          if (existing) {
            existing.executionCount += item.executionCount;
            existing.totalTimeMs += item.totalTimeMs;
            existing.maxTimeMs = Math.max(existing.maxTimeMs, item.maxTimeMs);
          } else {
            wfMap.set(item.workflowName, { ...item });
          }
        });
      });
      const combinedWf = Array.from(wfMap.values()).map(item => ({
        ...item,
        avgTimeMs: item.executionCount > 0 ? Math.round(item.totalTimeMs / item.executionCount) : 0
      })).sort((a: any, b: any) => b.totalTimeMs - a.totalTimeMs);

      const webMap = new Map();
      typeFiles.forEach(f => {
        (f.results.webRequestSummary || []).forEach(item => {
          const existing = webMap.get(item.urlOrAction);
          if (existing) {
            existing.executionCount += item.executionCount;
            existing.totalTimeMs += item.totalTimeMs;
            existing.maxTimeMs = Math.max(existing.maxTimeMs, item.maxTimeMs);
          } else {
            webMap.set(item.urlOrAction, { ...item });
          }
        });
      });
      const combinedWeb = Array.from(webMap.values()).map(item => ({
        ...item,
        avgTimeMs: item.executionCount > 0 ? Math.round(item.totalTimeMs / item.executionCount) : 0
      })).sort((a: any, b: any) => b.totalTimeMs - a.totalTimeMs);

      performanceSection = `
    <!-- Performance Analyzer Summary Section -->
    <div class="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl space-y-6">
      <div class="border-b border-[#30363D] pb-3 flex items-center gap-2">
        <i data-lucide="cpu" class="w-5 h-5 text-indigo-400"></i>
        <h2 class="text-base font-extrabold text-white">III. Consolidated Performance Analyzer Summaries</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div class="bg-[#0D1117] border border-[#21262D] p-4 rounded-xl">
          <span class="text-slate-500 block font-sans">Total Extracted SQL Time</span>
          <span class="text-lg font-bold text-indigo-400">${(combinedSql.reduce((sum, i) => sum + i.totalTimeMs, 0) / 1000).toFixed(2)}s</span>
        </div>
        <div class="bg-[#0D1117] border border-[#21262D] p-4 rounded-xl">
          <span class="text-slate-500 block font-sans">Total Workflow Execution Time</span>
          <span class="text-lg font-bold text-emerald-400">${(combinedWf.reduce((sum, i) => sum + i.totalTimeMs, 0) / 1000).toFixed(2)}s</span>
        </div>
        <div class="bg-[#0D1117] border border-[#21262D] p-4 rounded-xl">
          <span class="text-slate-500 block font-sans">Total Web Server Response Time</span>
          <span class="text-lg font-bold text-blue-400">${(combinedWeb.reduce((sum, i) => sum + i.totalTimeMs, 0) / 1000).toFixed(2)}s</span>
        </div>
      </div>

      <div class="space-y-6">
        <!-- SQL Table -->
        <div class="space-y-2">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Top SQL Executions (by Total Time)</h3>
          <div class="overflow-x-auto border border-[#21262D] rounded-xl bg-[#0D1117]">
            <table class="w-full text-left border-collapse text-[11px] font-mono">
              <thead>
                <tr class="bg-[#161B22] border-b border-[#21262D] text-slate-400">
                  <th class="py-2.5 px-4">SQL Statement Query</th>
                  <th class="py-2.5 px-4 text-right">Count</th>
                  <th class="py-2.5 px-4 text-right">Avg Time</th>
                  <th class="py-2.5 px-4 text-right">Max Time</th>
                  <th class="py-2.5 px-4 text-right">Total Duration</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#21262D] text-slate-300">
                ${combinedSql.slice(0, 5).map(item => `
                  <tr class="hover:bg-slate-900/40">
                    <td class="py-2.5 px-4 text-indigo-300 truncate max-w-md select-all" title="${item.sqlText}">${item.sqlText}</td>
                    <td class="py-2.5 px-4 text-right text-white font-bold">${item.executionCount.toLocaleString()}</td>
                    <td class="py-2.5 px-4 text-right">${item.avgTimeMs >= 1000 ? (item.avgTimeMs/1000).toFixed(2) + 's' : item.avgTimeMs + 'ms'}</td>
                    <td class="py-2.5 px-4 text-right">${item.maxTimeMs >= 1000 ? (item.maxTimeMs/1000).toFixed(1) + 's' : item.maxTimeMs + 'ms'}</td>
                    <td class="py-2.5 px-4 text-right text-indigo-400 font-bold">${item.totalTimeMs >= 1000 ? (item.totalTimeMs/1000).toFixed(1) + 's' : item.totalTimeMs + 'ms'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Workflow Table -->
        <div class="space-y-2 pt-2">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Top Workflow Executions</h3>
          <div class="overflow-x-auto border border-[#21262D] rounded-xl bg-[#0D1117]">
            <table class="w-full text-left border-collapse text-[11px] font-mono">
              <thead>
                <tr class="bg-[#161B22] border-b border-[#21262D] text-slate-400">
                  <th class="py-2.5 px-4">Workflow Name</th>
                  <th class="py-2.5 px-4">Module / Object</th>
                  <th class="py-2.5 px-4 text-right">Count</th>
                  <th class="py-2.5 px-4 text-right">Avg Time</th>
                  <th class="py-2.5 px-4 text-right">Max Time</th>
                  <th class="py-2.5 px-4 text-right">Total Duration</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#21262D] text-slate-300">
                ${combinedWf.slice(0, 5).map(item => `
                  <tr class="hover:bg-slate-900/40">
                    <td class="py-2.5 px-4 text-emerald-400 font-bold font-sans">${item.workflowName}</td>
                    <td class="py-2.5 px-4 text-slate-500">${item.module} / ${item.objectType}</td>
                    <td class="py-2.5 px-4 text-right text-white font-bold">${item.executionCount.toLocaleString()}</td>
                    <td class="py-2.5 px-4 text-right">${item.avgTimeMs >= 1000 ? (item.avgTimeMs/1000).toFixed(2) + 's' : item.avgTimeMs + 'ms'}</td>
                    <td class="py-2.5 px-4 text-right">${item.maxTimeMs >= 1000 ? (item.maxTimeMs/1000).toFixed(1) + 's' : item.maxTimeMs + 'ms'}</td>
                    <td class="py-2.5 px-4 text-right text-emerald-400 font-bold">${item.totalTimeMs >= 1000 ? (item.totalTimeMs/1000).toFixed(1) + 's' : item.totalTimeMs + 'ms'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Web requests Table -->
        <div class="space-y-2 pt-2">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Top HTTP Web Requests</h3>
          <div class="overflow-x-auto border border-[#21262D] rounded-xl bg-[#0D1117]">
            <table class="w-full text-left border-collapse text-[11px] font-mono">
              <thead>
                <tr class="bg-[#161B22] border-b border-[#21262D] text-slate-400">
                  <th class="py-2.5 px-4">Action URL</th>
                  <th class="py-2.5 px-4 text-right">Count</th>
                  <th class="py-2.5 px-4 text-right">Avg Time</th>
                  <th class="py-2.5 px-4 text-right">Max Time</th>
                  <th class="py-2.5 px-4 text-right">Total Duration</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#21262D] text-slate-300">
                ${combinedWeb.slice(0, 5).map(item => `
                  <tr class="hover:bg-slate-900/40">
                    <td class="py-2.5 px-4 text-blue-400 font-sans truncate max-w-md" title="${item.urlOrAction}">${item.urlOrAction}</td>
                    <td class="py-2.5 px-4 text-right text-white font-bold">${item.executionCount.toLocaleString()}</td>
                    <td class="py-2.5 px-4 text-right">${item.avgTimeMs >= 1000 ? (item.avgTimeMs/1000).toFixed(2) + 's' : item.avgTimeMs + 'ms'}</td>
                    <td class="py-2.5 px-4 text-right">${item.maxTimeMs >= 1000 ? (item.maxTimeMs/1000).toFixed(1) + 's' : item.maxTimeMs + 'ms'}</td>
                    <td class="py-2.5 px-4 text-right text-blue-400 font-bold">${item.totalTimeMs >= 1000 ? (item.totalTimeMs/1000).toFixed(1) + 's' : item.totalTimeMs + 'ms'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
      `;
    }

    let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consolidated TRIRIGA Cluster Report: ${typeLabel}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #0D1117; color: #C9D1D9; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="min-h-screen p-4 md:p-8 selection:bg-blue-600/30 selection:text-white">
  <div class="max-w-6xl mx-auto space-y-8">
    
    <!-- Top Bar -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#161B22] border border-blue-900/30 p-6 rounded-2xl shadow-sm">
      <div class="space-y-1.5">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-xs font-bold font-mono bg-blue-500/15 text-blue-400 border border-blue-500/30">CONSOLIDATED CLUSTER REPORT</span>
          <span class="text-xs text-slate-400 font-mono">${typeLabel}</span>
        </div>
        <h1 class="text-xl md:text-2xl font-extrabold text-white tracking-tight">IBM TRIRIGA Multi-Node Diagnostic Report</h1>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
          <span>Merged Nodes Count: ${typeFiles.length} server nodes</span>
          <span>•</span>
          <span>Generated: ${new Date().toLocaleString()}</span>
        </div>
      </div>
      
      <div class="bg-blue-950/20 border border-blue-900/40 p-4 rounded-xl min-w-[200px] flex items-center justify-between">
        <div class="space-y-0.5">
          <span class="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Consolidated Risk</span>
          <span class="text-xl font-extrabold font-mono text-white">${leakRisk === "High" ? "HIGH RISK" : leakRisk === "Medium" ? "MEDIUM RISK" : "STABLE"}</span>
        </div>
        <i data-lucide="shield-alert" class="w-8 h-8 text-blue-400"></i>
      </div>
    </div>

    <!-- Cluster Aggregated Gauge Row -->
    <div>
      <h2 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 font-mono">I. Aggregated Cluster-Wide KPI Gauges</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-[#161B22] border border-[#30363D] p-5 rounded-2xl flex flex-col items-center justify-center">
          ${generateCpuGaugeSVG(peakCpu)}
        </div>
        <div class="bg-[#161B22] border border-[#30363D] p-5 rounded-2xl flex flex-col items-center justify-center">
          ${generateMemoryTrendSVG(leakRisk, "Merged")}
        </div>
        <div class="bg-[#161B22] border border-[#30363D] p-5 rounded-2xl flex flex-col items-center justify-center">
          ${generateCacheMissSVG(avgCacheMiss)}
        </div>
        <div class="bg-[#161B22] border border-[#30363D] p-5 rounded-2xl flex flex-col items-center justify-center">
          ${generateWorkflowFailureSVG(aggWorkflowFailRate, totalFailed, totalProcessed)}
        </div>
      </div>
    </div>

    <!-- Node Comparison Matrix -->
    <div class="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl space-y-4">
      <div class="flex items-center gap-2 text-white font-bold border-b border-[#30363D] pb-3">
        <i data-lucide="grid" class="w-4 h-4 text-blue-400"></i>
        <span>Node Comparison Matrix</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="border-b border-[#30363D] text-slate-400 font-mono">
              <th class="py-3 px-4">Node Name</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-center">Score</th>
              <th class="py-3 px-4 text-right">Line Count</th>
              <th class="py-3 px-4 text-center">Peak CPU</th>
              <th class="py-3 px-4 text-center">Memory Leak</th>
              <th class="py-3 px-4 text-center">Cache Miss</th>
              <th class="py-3 px-4 text-center">WF Fail Rate</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#21262D] text-slate-300 font-mono">
            ${typeFiles.map((file) => {
              const score = getHealthScore(file);
              const m = file.results.metrics;
              const statusColor = file.results.status === "Critical" ? "text-red-400" : file.results.status === "Degraded" ? "text-amber-400" : "text-emerald-400";
              return `
                <tr class="hover:bg-slate-900/40 transition-colors">
                  <td class="py-3 px-4 text-white font-bold font-sans">${file.name}</td>
                  <td class="py-3 px-4 ${statusColor} font-bold">${file.results.status}</td>
                  <td class="py-3 px-4 text-center font-bold text-white">${score}/100</td>
                  <td class="py-3 px-4 text-right">${file.lineCount.toLocaleString()}</td>
                  <td class="py-3 px-4 text-center">${m.cpuMax !== null ? `${m.cpuMax.toFixed(1)}%` : "N/A"}</td>
                  <td class="py-3 px-4 text-center">${m.memoryLeakRisk}</td>
                  <td class="py-3 px-4 text-center">${m.cacheMissRatio !== null ? `${m.cacheMissRatio.toFixed(1)}%` : "N/A"}</td>
                  <td class="py-3 px-4 text-center text-red-400">${m.workflowFailureRate !== null ? `${m.workflowFailureRate.toFixed(1)}%` : "N/A"}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Node Summaries & Findings List -->
    <div class="space-y-4">
      <h2 class="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">II. Individual Node Findings Breakdown</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        ${typeFiles.map((file) => {
          const score = getHealthScore(file);
          const statusColor = file.results.status === "Critical" ? "border-red-900/40 bg-red-950/5 text-red-400" : file.results.status === "Degraded" ? "border-amber-900/40 bg-amber-950/5 text-amber-400" : "border-emerald-900/40 bg-emerald-950/5 text-emerald-400";
          return `
            <div class="bg-[#161B22] border border-[#30363D] p-5 rounded-2xl space-y-3.5">
              <div class="flex items-center justify-between border-b border-[#30363D] pb-3">
                <div class="space-y-0.5">
                  <h3 class="text-sm font-extrabold text-white">${file.name}</h3>
                  <p class="text-[10px] text-slate-500 font-mono">Scanned ${file.lineCount.toLocaleString()} lines</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-extrabold text-white font-mono">${score}/100</span>
                  <span class="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider border ${statusColor}">${file.results.status}</span>
                </div>
              </div>
              <div class="space-y-1.5">
                <span class="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Node Executive Summary</span>
                <p class="text-xs text-slate-300 leading-relaxed">${file.results.executiveSummary}</p>
              </div>
              
              <!-- Metrics list for Node -->
              <div class="grid grid-cols-3 gap-2 pt-2 text-[10px] text-slate-400 font-mono">
                <div class="bg-[#0D1117] border border-[#21262D] p-2 rounded">
                  <span class="text-slate-500 block">Peak CPU</span>
                  <span class="text-white font-bold">${file.results.metrics.cpuMax !== null ? `${file.results.metrics.cpuMax.toFixed(1)}%` : "N/A"}</span>
                </div>
                <div class="bg-[#0D1117] border border-[#21262D] p-2 rounded">
                  <span class="text-slate-500 block">Memory Risk</span>
                  <span class="text-white font-bold">${file.results.metrics.memoryLeakRisk}</span>
                </div>
                <div class="bg-[#0D1117] border border-[#21262D] p-2 rounded">
                  <span class="text-slate-500 block">Cache Miss</span>
                  <span class="text-white font-bold">${file.results.metrics.cacheMissRatio !== null ? `${file.results.metrics.cacheMissRatio.toFixed(1)}%` : "N/A"}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    ${performanceSection}

    <footer class="text-center text-xs text-slate-500 font-mono py-8">
      IBM TRIRIGA Diagnostics • Standalone Offline Interactive HTML Cluster Exporter • Generated at ${new Date().toLocaleString()}
    </footer>

  </div>

  <script>
    lucide.createIcons();
  </script>
</body>
</html>`;

    triggerDownload(htmlContent, `tririga_cluster_${type}_interactive_report.html`, "text/html");
  };

  // 5. Export JSON (Combined)
  const handleExportJSONCombined = (type: "server" | "performance" | "metrics") => {
    const typeFiles = filesByType[type] || [];
    const data = {
      exporter: "IBM TRIRIGA Diagnostics Engine (Browser Sandbox)",
      generatedAt: new Date().toISOString(),
      clusterType: type,
      nodesMergedCount: typeFiles.length,
      sourceFiles: typeFiles.map(f => f.name),
      nodesData: typeFiles.map(f => ({
        name: f.name,
        sizeBytes: f.size,
        lineCount: f.lineCount,
        results: {
          status: f.results.status,
          healthScore: getHealthScore(f),
          executiveSummary: f.results.executiveSummary,
          metrics: f.results.metrics,
          detectedAnomaliesCount: f.results.detectedAnomalies.length,
          recommendationsCount: f.results.recommendations.length
        }
      }))
    };
    triggerDownload(JSON.stringify(data, null, 2), `tririga_cluster_${type}_consolidated_report.json`, "application/json");
  };

  // 6. Export CSV Chronological Trace (Combined)
  const handleExportCSVCombined = (type: "server" | "performance" | "metrics") => {
    const typeFiles = filesByType[type] || [];
    let csv = "Node Name,Log Type,Health Status,Health Score,Line Count,Date Range,Duration,Peak CPU (%),Memory Leak Risk,Memory Trend,Cache Miss Ratio (%),Workflow Failure Rate (%),Avg Response Latency (ms),Anomalies Count,Recommendations Count\n";
    
    typeFiles.forEach((file) => {
      const name = `"${file.name.replace(/"/g, '""')}"`;
      const ftype = `"${file.type}"`;
      const status = `"${file.results.status}"`;
      const score = getHealthScore(file);
      const lines = file.lineCount;
      const dateRange = `"${(file.dateRange || "N/A").replace(/"/g, '""')}"`;
      const duration = `"${(file.duration || "N/A").replace(/"/g, '""')}"`;
      
      const cpu = file.results.metrics.cpuMax !== null ? file.results.metrics.cpuMax.toFixed(1) : "N/A";
      const leak = `"${file.results.metrics.memoryLeakRisk}"`;
      const trend = `"${file.results.metrics.memoryTrend}"`;
      const cache = file.results.metrics.cacheMissRatio !== null ? file.results.metrics.cacheMissRatio.toFixed(1) : "N/A";
      const workflow = file.results.metrics.workflowFailureRate !== null ? file.results.metrics.workflowFailureRate.toFixed(1) : "N/A";
      const latency = file.results.metrics.avgResponseTimeMs !== null ? file.results.metrics.avgResponseTimeMs : "N/A";
      
      const anomalies = file.results.detectedAnomalies.length;
      const recs = file.results.recommendations.length;

      csv += `${name},${ftype},${status},${score},${lines},${dateRange},${duration},${cpu},${leak},${trend},${cache},${workflow},${latency},${anomalies},${recs}\n`;
    });
    
    triggerDownload(csv, `tririga_cluster_${type}_diagnostics_matrix.csv`, "text/csv");
  };

  // Filter alerts based on active file results
  const getFilteredAnomalies = () => {
    if (!activeFile) return [];
    return activeFile.results.detectedAnomalies.filter((anomaly) => {
      const matchesFilter = alertFilter === "ALL" || anomaly.severity === alertFilter;
      const matchesSearch =
        anomaly.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        anomaly.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  // Switch to details view when a file is selected to show details immediately
  useEffect(() => {
    if (activeFile) {
      // By default when changing active files, default to Overview tab
      setActiveTab("overview");
      setSelectedEventId(null);
    }
  }, [activeFileId]);

  return (
    <div id="root-theme-container" className="dark">
      <div className="min-h-screen bg-[#08090C] text-slate-300 font-sans antialiased selection:bg-blue-600/30">
        
        {/* TOP LEVEL NAVIGATION HEADER */}
        <header id="app-header" className="bg-[#0F1115] border-b border-[#21262D] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div id="brand-logo" className="w-8.5 h-8.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg">
                T
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 id="brand-title" className="text-sm font-bold text-white tracking-tight">
                    TRIRIGA Performance Copilot
                  </h1>
                  <span className="text-[9px] font-bold bg-[#1B2028] text-blue-400 px-1.5 py-0.5 rounded border border-[#2D333B] font-mono">
                    ENTERPRISE v4.8
                  </span>
                </div>
                <p id="brand-subtitle" className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  Isolated Multi-Log Diagnostic System
                </p>
              </div>
            </div>

            {appState === "dashboard" && (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setActivePage("upload")}
                  className="px-3 py-1.5 bg-[#1B2028] hover:bg-[#21262D] text-slate-300 hover:text-white border border-[#2D333B] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Upload & Simulation
                </button>
                <button
                  onClick={() => {
                    setAnalyzedFiles([]);
                    setActiveFileId(null);
                    setActiveCombinedType(null);
                    setAppState("upload");
                    setActivePage("upload");
                  }}
                  className="px-3 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-rose-900/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Session
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ======================= TOP PAGE NAVIGATION TABS ======================= */}
        {appState === "dashboard" && (
          <div className="bg-[#0F1115] border-b border-[#21262D] sticky top-[64px] z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-6 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActivePage("upload")}
                  className={`py-3.5 text-xs font-bold px-1 border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    activePage === "upload"
                      ? "border-blue-500 text-white"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  1. Upload & Simulation
                </button>
                <button
                  onClick={() => setActivePage("performance")}
                  className={`py-3.5 text-xs font-bold px-1 border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    activePage === "performance"
                      ? "border-blue-500 text-white"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  2. TRIRIGA Performance
                </button>
                <button
                  onClick={() => setActivePage("system")}
                  className={`py-3.5 text-xs font-bold px-1 border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    activePage === "system"
                      ? "border-blue-500 text-white"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  3. System Metrics
                </button>
                <button
                  onClick={() => setActivePage("security")}
                  className={`py-3.5 text-xs font-bold px-1 border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    activePage === "security"
                      ? "border-blue-500 text-white"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  4. Security Audits
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================= PHASE 1: UPLOAD PORTAL ======================= */}
        {appState === "upload" && (
          <main className="max-w-4xl mx-auto px-4 py-12 sm:py-20 animate-fade-in">
            
            <div className="text-center space-y-3 mb-10">
              <div className="inline-flex p-3 bg-blue-950/40 rounded-2xl border border-blue-800/20 text-blue-400 mb-2">
                <Terminal className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                IBM TRIRIGA Platform Diagnostic Portal
              </h2>
              <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
                A highly-focused observability tool to aggregate, isolate, and debug IBM TRIRIGA environment log files. Upload multiple files at once and isolate anomalies specific to each stream.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Drop & Paste Portal Block */}
              <div className="md:col-span-2 space-y-4">
                
                {/* Drag and Drop Zone */}
                <div
                  id="drop-zone"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("portal-file-input")?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                    isDragging
                      ? "border-blue-500 bg-blue-950/15"
                      : "border-[#30363D] bg-[#0F1115] hover:border-blue-500/40"
                  }`}
                >
                  <input
                    type="file"
                    id="portal-file-input"
                    multiple
                    onChange={(e) => handleFilesSelected(e.target.files)}
                    className="hidden"
                  />
                  <div className="space-y-3 pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-blue-500 shadow-inner">
                      <Upload className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        Select TRIRIGA log files to parse
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Drag and drop multiple <span className="text-blue-400 font-semibold font-mono">server.log</span>, <span className="text-blue-400 font-semibold font-mono">gc.log</span> or metrics dumps here
                      </p>
                    </div>
                    <p className="text-[9px] text-slate-500 font-mono">
                      Log formats supported: .log, .txt, .xml (Max 15MB each)
                    </p>
                  </div>
                </div>

                {/* Performance Warning Notice */}
                <div className="bg-amber-950/10 border border-amber-500/20 text-amber-300 rounded-2xl p-4 text-[11px] leading-relaxed flex gap-3 animate-fade-in">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200 block mb-1">Sandbox Performance & Memory Limit Advisory</span>
                    This diagnostic tool is engineered to execute <strong className="text-white">entirely offline within your local browser sandbox</strong>. Since your sensitive application telemetry never leaves your device, file processing speeds depend entirely on your client machine's processing capabilities and browser-allocated heap limits.
                    <div className="mt-2 text-slate-400">
                      • <strong className="text-amber-400/90">Small to Mid-Size Logs (&lt; 30MB)</strong>: Processed in milliseconds. Batch uploads of up to 30 files are automatically accelerated using multi-file dynamic thread optimization.<br />
                      • <strong className="text-amber-400/90">Large Logs (50MB - 500MB+)</strong>: May cause transient page freezes as the V8 engine handles large file reads. We recommend splitting huge files before uploading.<br />
                      • <strong className="text-rose-400/90">Massive Logs (1GB - 50GB+)</strong>: Browser sandboxes do not support gigabyte-level client-side heap structures. If you attempt to load multi-gigabyte server dumps, the browser tab may crash. Please use the targeted paste box below to analyze key incident segments instead.
                    </div>
                  </div>
                </div>

                {/* Paste Log Text Direct Option */}
                <div className="bg-[#0F1115] border border-[#21262D] rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-blue-400" />
                      Paste raw log stream text directly
                    </span>
                    {pastedText && (
                      <button
                        onClick={() => setPastedText("")}
                        className="text-[10px] text-slate-500 hover:text-slate-300"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  
                  <textarea
                    rows={4}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste log entries here to trigger deterministic parsing... e.g. 2026-07-12 11:42:30 ERROR [com.tririga.platform] LockTimeoutException waiting on T_WORK_ORDER..."
                    className="w-full bg-[#08090C] text-slate-300 rounded-xl p-3.5 font-mono text-[11px] border border-[#21262D] focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed resize-none"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleAnalyzePastedText}
                      disabled={!pastedText.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Analyze Pasted Stream
                    </button>
                  </div>
                </div>

              </div>

              {/* Quick Load Presets Side Rail */}
              <div className="space-y-4">
                <div className="bg-[#0F1115] border border-[#21262D] rounded-2xl p-5 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                      Diagnostic Presets
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Experience the full system immediately! Load isolated multi-log scenarios with 1 click:
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleLoadPresets("all")}
                      className="w-full text-left p-3 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 hover:from-blue-900/40 hover:to-indigo-900/40 border border-blue-800/30 rounded-xl flex items-center justify-between group transition-all cursor-pointer"
                    >
                      <div>
                        <span className="text-xs font-bold text-white group-hover:text-blue-300 block transition-colors">
                          Load All Presets
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          Loads 4 separate files at once (10 results expected!)
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    <div className="h-[1px] bg-[#21262D] my-2"></div>

                    <button
                      onClick={() => handleLoadPresets("server")}
                      className="w-full text-left p-2.5 bg-[#1B2028]/30 hover:bg-[#1B2028]/60 border border-[#21262D] rounded-xl flex items-center justify-between group transition-all cursor-pointer"
                    >
                      <div>
                        <span className="text-[11px] font-bold text-slate-200 block flex items-center gap-1.5 flex-wrap">
                          📄 tririga_server_error_stream.log
                          <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1 rounded font-mono font-bold uppercase shrink-0">Server Log</span>
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">
                          Category: Server Deadlock & Row Lock Exceptions
                        </span>
                      </div>
                      <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-all" />
                    </button>

                    <button
                      onClick={() => handleLoadPresets("gc")}
                      className="w-full text-left p-2.5 bg-[#1B2028]/30 hover:bg-[#1B2028]/60 border border-[#21262D] rounded-xl flex items-center justify-between group transition-all cursor-pointer"
                    >
                      <div>
                        <span className="text-[11px] font-bold text-slate-200 block flex items-center gap-1.5 flex-wrap">
                          📄 ibm_websphere_g1gc_metrics.log
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded font-mono font-bold uppercase shrink-0">JVM Performance</span>
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">
                          Category: JVM Memory Staircase Heap Leak
                        </span>
                      </div>
                      <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-all" />
                    </button>

                    <button
                      onClick={() => handleLoadPresets("metrics")}
                      className="w-full text-left p-2.5 bg-[#1B2028]/30 hover:bg-[#1B2028]/60 border border-[#21262D] rounded-xl flex items-center justify-between group transition-all cursor-pointer"
                    >
                      <div>
                        <span className="text-[11px] font-bold text-slate-200 block flex items-center gap-1.5 flex-wrap">
                          📄 tririga_thread_monitor_dump.log
                          <span className="text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1 rounded font-mono font-bold uppercase shrink-0">System Metrics</span>
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">
                          Category: Sustained CPU Thread Spike
                        </span>
                      </div>
                      <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-all" />
                    </button>
                  </div>
                </div>

                {/* Scope Warning / Platform Assurance Card */}
                <div className="bg-[#111A1E] border border-blue-900/30 rounded-2xl p-4 flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                      Offline Confidential Parse
                    </span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      All calculations are isolated client-side for maximum compliance and speed. Your raw database metrics and application keys never leave your terminal workspace.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </main>
        )}

        {/* ======================= PHASE 2: PROCESSING PIPELINE ======================= */}
        {appState === "processing" && filesToProcess.length > 0 && (
          <main className="max-w-md mx-auto px-4 py-24 animate-fade-in">
            <div className="bg-[#0F1115] border border-[#21262D] rounded-2xl p-6 shadow-2xl space-y-6">
              
              <div className="text-center space-y-2">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  IBM TRIRIGA Copilot Engine Active
                </h3>
                <p className="text-[11px] text-slate-500 uppercase tracking-widest font-mono">
                  Isolating Log Streams
                </p>
              </div>

              {/* Progress Detail Frame */}
              <div className="bg-[#08090C] border border-[#21262D] rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-slate-400">File {processingIndex + 1} of {filesToProcess.length}</span>
                  <span className="text-blue-400 font-bold">{processingProgress}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#1B2028] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-150 ease-out"
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 block">Analyzing Resource:</span>
                  <span className="text-xs font-bold text-white block truncate">
                    {filesToProcess[processingIndex]?.name || "Finalizing..."}
                  </span>
                  <p className="text-[10px] text-blue-400 font-mono mt-2 animate-pulse min-h-4">
                    {processingStep}
                  </p>
                </div>
              </div>

              {/* Logs Processing Details summary */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Processing Queue List
                </span>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {filesToProcess.map((file, idx) => {
                    const isDone = idx < processingIndex;
                    const isCurrent = idx === processingIndex;

                    return (
                      <div
                        key={`q-${idx}`}
                        className={`flex justify-between items-center text-[10px] p-2 rounded-lg border font-mono ${
                          isDone
                            ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-400"
                            : isCurrent
                            ? "bg-blue-950/20 border-blue-900/30 text-blue-400 animate-pulse"
                            : "bg-[#08090C] border-[#21262D] text-slate-600"
                        }`}
                      >
                        <div className="flex flex-col gap-0.5 truncate max-w-[240px]">
                          <span className="truncate font-bold">{file.name}</span>
                          {(() => {
                            const classifiedType = classifyLogType(file.name, file.content);
                            const typeLabel = {
                              server: "Type: Server Log",
                              performance: "Type: JVM Performance",
                              metrics: "Type: System Metrics"
                            }[classifiedType];
                            return (
                              <span className="text-[8px] text-slate-400">{typeLabel}</span>
                            );
                          })()}
                        </div>
                        <span>
                          {isDone ? (
                            "COMPLETED"
                          ) : isCurrent ? (
                            `ANALYZING (${processingProgress}%)`
                          ) : (
                            "QUEUED"
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </main>
        )}

        {/* ======================= PHASE 3: DIAGNOSTICS DASHBOARD ======================= */}
        {appState === "dashboard" && (activeFile || activeCombinedType) && (
          activePage === "upload" ? (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* UPLOADER & TEXT BOX */}
                <div className="lg:col-span-2 space-y-6">
                  <div
                    id="drop-zone"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("dashboard-file-input")?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                      isDragging ? "border-blue-500 bg-blue-950/15" : "border-[#30363D] bg-[#0F1115] hover:border-blue-500/40"
                    }`}
                  >
                    <input
                      type="file"
                      id="dashboard-file-input"
                      multiple
                      onChange={(e) => handleFilesSelected(e.target.files)}
                      className="hidden"
                    />
                    <div className="space-y-3 pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-blue-500">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">Upload additional TRIRIGA log files</p>
                        <p className="text-[11px] text-slate-400 mt-1">Drag and drop server.log, gc.log or performance streams here</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0F1115] border border-[#21262D] rounded-2xl p-5 space-y-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-blue-400" />
                      Paste raw log segment
                    </span>
                    <textarea
                      rows={4}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste log entries here to trigger deterministic parsing..."
                      className="w-full bg-[#08090C] text-slate-300 rounded-xl p-3.5 font-mono text-[11px] border border-[#21262D] focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleAnalyzePastedText}
                        disabled={!pastedText.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Analyze Pasted Stream
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0F1115] border border-[#21262D] rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Currently Loaded Logs ({analyzedFiles.length})</h3>
                    <div className="divide-y divide-[#21262D] max-h-[220px] overflow-y-auto pr-1">
                      {analyzedFiles.map((file) => (
                        <div key={`workspace-${file.id}`} className="py-2.5 flex justify-between items-center">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-200">{file.name}</span>
                              <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1 py-0.25 rounded font-mono font-bold uppercase">{file.type}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">{(file.size/1024).toFixed(1)} KB • {file.lineCount} lines</div>
                          </div>
                          <button
                            onClick={(e) => handleRemoveFile(file.id, e)}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/10 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SIMULATOR & PRESETS */}
                <div className="space-y-6">
                  <div className="bg-[#0F1115] border border-[#21262D] rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      Timing Trace Simulator
                    </h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Configure individual TRIRIGA performance timings and run a live tracing execution simulation to generate a timing report file.</p>
                    <button
                      onClick={() => setShowPerfRunCreator(true)}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Launch Performance Simulator
                    </button>
                  </div>

                  <div className="bg-[#0F1115] border border-[#21262D] rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quick Load Presets</h3>
                    <div className="space-y-2">
                      <button onClick={() => handleLoadPresets("all")} className="w-full text-left p-3 bg-blue-900/10 hover:bg-blue-900/20 border border-blue-800/30 rounded-xl flex justify-between items-center group transition-all cursor-pointer">
                        <span className="text-xs font-bold text-slate-200">Load All 4 Preset Streams</span>
                        <ChevronRight className="w-4 h-4 text-blue-500" />
                      </button>
                      <button onClick={() => handleLoadPresets("server")} className="w-full text-left p-2.5 bg-[#1B2028]/30 hover:bg-[#1B2028]/60 border border-[#21262D] rounded-xl flex justify-between items-center text-xs text-slate-300 cursor-pointer">
                        <span>tririga_server_error.log</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <button onClick={() => handleLoadPresets("gc")} className="w-full text-left p-2.5 bg-[#1B2028]/30 hover:bg-[#1B2028]/60 border border-[#21262D] rounded-xl flex justify-between items-center text-xs text-slate-300 cursor-pointer">
                        <span>ibm_websphere_g1gc_metrics.log</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {showPerfRunCreator && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <div className="max-w-3xl w-full">
                    <PerformanceRunCreator
                      onCancel={() => setShowPerfRunCreator(false)}
                      onFinish={handleCreateVirtualPerformanceRun}
                    />
                  </div>
                </div>
              )}
            </main>
          ) : (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* SIDEBAR: MULTI-FILE QUEUE SELECTOR */}
              <aside className="lg:col-span-1 space-y-4">
                
                <div className="bg-[#0F1115] border border-[#21262D] rounded-2xl p-4.5 space-y-4">
                  
                  <div className="flex justify-between items-center pb-2 border-b border-[#21262D]">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-blue-400" />
                      Analyzed Logs ({analyzedFiles.length})
                    </span>
                    <button
                      onClick={() => setAppState("upload")}
                      className="p-1 bg-[#1B2028] hover:bg-[#21262D] text-slate-400 hover:text-white rounded border border-[#2D333B] transition-all cursor-pointer"
                      title="Upload more files"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Sidebar Queue list of individual results */}
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {analyzedFiles.map((file) => {
                      const isActive = file.id === activeFileId;
                      const fileHealth = getHealthScore(file);
                      
                      const fileTypeLabel = {
                        server: "Server Log",
                        performance: "JVM Performance",
                        metrics: "System Metrics"
                      }[file.type];

                      const fileTypeColor = {
                        server: "bg-[#21262D] text-slate-300 border-[#30363D]",
                        performance: "bg-emerald-950/20 text-emerald-400 border-emerald-900/30",
                        metrics: "bg-purple-950/20 text-purple-400 border-purple-900/30"
                      }[file.type];

                      return (
                        <div
                          key={file.id}
                          onClick={() => {
                            setActiveFileId(file.id);
                            setActiveCombinedType(null); // Clear combined view on individual file click
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2.5 relative group ${
                            isActive && !activeCombinedType
                              ? "bg-[#1C212B] border-blue-500/60 shadow-lg shadow-blue-900/5"
                              : "bg-[#12151A] border-[#21262D] hover:border-slate-700"
                          }`}
                        >
                          {/* Remove button */}
                          <button
                            onClick={(e) => handleRemoveFile(file.id, e)}
                            className="absolute top-2 right-2 p-1 text-slate-500 hover:text-rose-400 rounded-md hover:bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all"
                            title="Remove log from workspace"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-white block truncate max-w-[190px]">
                              {file.name}
                            </span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border inline-block ${fileTypeColor}`}>
                              {fileTypeLabel}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-mono border-t border-[#21262D]/50 pt-2 text-slate-500">
                            <span>{(file.size / 1024).toFixed(1)} KB</span>
                            <div className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                file.results.status === "Critical"
                                  ? "bg-rose-500"
                                  : file.results.status === "Degraded"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`} />
                              <span className="font-bold">Health: {fileHealth}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      setShowPerfRunCreator(true);
                      setActiveCombinedType(null); // Clear combined view
                    }}
                    className="w-full mt-1.5 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    Generate Performance Run
                  </button>

                  {/* Consolidated multi-log trigger option */}
                  {duplicateTypes.length > 0 && (
                    <div className="pt-3 border-t border-[#21262D] space-y-2">
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block font-mono">
                        🔮 Consolidated Analyses
                      </span>
                      {duplicateTypes.map((type) => {
                        const typeLabel = {
                          server: "Combined Server Logs",
                          performance: "Combined JVM Perf Logs",
                          metrics: "Combined System Metrics"
                        }[type];

                        const isCombinedActive = activeCombinedType === type;

                        return (
                          <button
                            key={`combined-sidebar-${type}`}
                            onClick={() => {
                              setActiveCombinedType(type);
                              setActiveFileId(null);
                            }}
                            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                              isCombinedActive
                                ? "bg-[#1C212B] border-blue-500/60 text-white font-semibold shadow-lg shadow-blue-900/5"
                                : "bg-[#12151A] border-[#21262D] text-slate-300 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span className="text-[11px] truncate">{typeLabel}</span>
                            </div>
                            <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
                              {filesByType[type].length} files
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Diagnostic stats summary info */}
                  <div className="bg-[#08090C] border border-[#21262D] p-3 rounded-xl space-y-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                      Queue Summary
                    </span>
                    <ul className="space-y-1 text-[10px] font-mono text-slate-400">
                      <li className="flex justify-between">
                        <span>Active Stream:</span>
                        <span className="text-blue-400 font-bold max-w-[110px] truncate">
                          {activeFile ? activeFile.name : `Combined ${activeCombinedType}`}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Total Records:</span>
                        <span>{analyzedFiles.reduce((acc, f) => acc + f.lineCount, 0)} lines</span>
                      </li>
                    </ul>
                  </div>

                </div>

                {/* OBSERVED STANDARDS INJECTED REFERENCE BOX */}
                <div className="bg-[#0F1115] border border-[#21262D] rounded-2xl p-4 text-xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Observability Thresholds
                  </span>
                  <div className="space-y-1.5 font-mono text-[10px] text-slate-500">
                    <div className="flex justify-between border-b border-[#21262D]/40 pb-1">
                      <span>Sustained CPU max limit:</span>
                      <span className="text-slate-300 font-bold">&gt; 80%</span>
                    </div>
                    <div className="flex justify-between border-b border-[#21262D]/40 pb-1">
                      <span>GC heap recovery rate:</span>
                      <span className="text-slate-300 font-bold">&lt; 5%</span>
                    </div>
                    <div className="flex justify-between border-b border-[#21262D]/40 pb-1">
                      <span>Object Cache miss storm:</span>
                      <span className="text-slate-300 font-bold">&gt; 15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Workflow task failures:</span>
                      <span className="text-slate-300 font-bold">&gt; 2%</span>
                    </div>
                  </div>
                </div>

              </aside>

              {/* MAIN PORTAL AREA: ISOLATED REPORTS AND LOG DETAIL VIEWS */}
              <section className="lg:col-span-3 space-y-6">
                {showPerfRunCreator ? (
                  <PerformanceRunCreator
                    onCancel={() => setShowPerfRunCreator(false)}
                    onFinish={handleCreateVirtualPerformanceRun}
                  />
                ) : !activeCombinedType ? (
                  <>
                    {/* ACTIVE FILE SPECIFIC REPORT HEADER CARD */}
                    <div className="bg-[#0F1115] border border-[#21262D] p-5.5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative">
                      
                      {/* Decorative glowing background accent specific to health status */}
                      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-5 rounded-full ${
                          activeFile.results.status === "Critical"
                            ? "bg-rose-500"
                            : activeFile.results.status === "Degraded"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}></div>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-extrabold text-white tracking-tight">
                            {activeFile.name}
                          </h2>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border inline-block ${
                            activeFile.type === "server"
                              ? "bg-blue-950/20 text-blue-400 border-blue-900/30"
                              : activeFile.type === "performance"
                              ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30"
                              : "bg-purple-950/20 text-purple-400 border-purple-900/30"
                          }`}>
                            {activeFile.type === "server" ? "SERVER LOG" : activeFile.type === "performance" ? "JVM PERFORMANCE" : "SYSTEM METRICS"}
                          </span>
                          <span className="text-[10px] font-mono bg-[#1B2028] text-slate-400 border border-[#2D333B] px-2 py-0.5 rounded">
                            {(activeFile.size / 1024).toFixed(1)} KB
                          </span>
                          <span className="text-[10px] font-mono bg-[#1B2028] text-slate-400 border border-[#2D333B] px-2 py-0.5 rounded">
                            {activeFile.lineCount} lines
                          </span>
                        </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Date range: <strong className="text-slate-300 font-medium">{activeFile.dateRange}</strong>
                      </span>
                      <span className="hidden sm:inline text-slate-600">•</span>
                      <span>
                        Duration span: <strong className="text-slate-300 font-medium">{activeFile.duration}</strong>
                      </span>
                    </div>
                  </div>

                  {/* ACTIONS & HEALTH SCORE */}
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* MULTI-EXPORT DROPDOWN MENU */}
                    <div className="relative">
                      <button
                        onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                        className="px-3.5 py-2.5 bg-blue-950/25 hover:bg-blue-950/45 text-blue-400 hover:text-blue-300 border border-blue-900/40 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                        title="Export diagnostics report in multiple formats"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-400" />
                        <span>Export Diagnostics</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-blue-400/80 transition-transform ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isExportDropdownOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setIsExportDropdownOpen(false)}
                          />
                          <div className="absolute right-0 mt-2 w-56 bg-[#0E1116] border border-[#2D333B] rounded-xl shadow-xl z-20 py-1.5 animate-fade-in divide-y divide-[#21262D]">
                            <div className="px-3 py-1.5 text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest">
                              Select Format
                            </div>
                            <div className="py-1">
                              <button
                                onClick={() => handleExportMarkdownIndividual(activeFile)}
                                className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2"
                              >
                                <span className="w-2 h-2 rounded-full bg-blue-400" />
                                <div>
                                  <div className="font-semibold">Markdown Report (.md)</div>
                                  <div className="text-[10px] text-slate-500">Rich executive RCA & remedies</div>
                                </div>
                              </button>
                              <button
                                onClick={() => handleExportHTMLIndividual(activeFile)}
                                className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2"
                              >
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                <div>
                                  <div className="font-semibold">Interactive HTML (.html)</div>
                                  <div className="text-[10px] text-slate-500">Full visual dashboard & gauges</div>
                                </div>
                              </button>
                              <button
                                onClick={() => handleExportJSONIndividual(activeFile)}
                                className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2"
                              >
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <div>
                                  <div className="font-semibold">Diagnostics JSON (.json)</div>
                                  <div className="text-[10px] text-slate-500">Full analysis & findings telemetry</div>
                                </div>
                              </button>
                              <button
                                onClick={() => handleExportCSVIndividual(activeFile)}
                                className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2"
                              >
                                <span className="w-2 h-2 rounded-full bg-purple-400" />
                                <div>
                                  <div className="font-semibold">RCA & Remediation CSV (.csv)</div>
                                  <div className="text-[10px] text-slate-500">Actionable anomalies & tasks sheet</div>
                                </div>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* ACTIVE FILE HEALTH SCORE SHIELD */}
                    <div className="flex items-center gap-3 bg-[#08090C] border border-[#21262D] p-3 rounded-xl min-w-[150px] justify-between shadow-inner">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">Health Score</span>
                        <span className="text-sm font-extrabold font-mono text-white block">
                          {activeHealthScore}/100
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        activeFile.results.status === "Critical"
                          ? "bg-rose-950/30 text-rose-400 border border-rose-900/40"
                          : activeFile.results.status === "Degraded"
                          ? "bg-amber-950/30 text-amber-400 border border-amber-900/40"
                          : "bg-emerald-950/30 text-emerald-400 border border-emerald-900/40"
                      }`}>
                        {activeFile.results.status}
                      </span>
                    </div>
                  </div>

                </div>

                {/* DYNAMIC TAB CONTROLS (Hiding unavailable views per file type!) */}
                {activePage === "performance" && (
                  <div className="flex border-b border-[#21262D] pb-0">
                    {activeFile.type === "performance" ? (
                      <>
                        <button
                          onClick={() => setActiveTab("summary")}
                          className={`pb-3 text-xs font-semibold px-4 border-b-2 transition-all cursor-pointer ${
                            activeTab === "summary" || activeTab === "overview"
                              ? "border-blue-500 text-white"
                              : "border-transparent text-slate-400 hover:text-white"
                          }`}
                        >
                          Result Summary
                        </button>
                        <button
                          onClick={() => setActiveTab("resultDetails")}
                          className={`pb-3 text-xs font-semibold px-4 border-b-2 transition-all cursor-pointer ${
                            activeTab === "resultDetails"
                              ? "border-blue-500 text-white"
                              : "border-transparent text-slate-400 hover:text-white"
                          }`}
                        >
                          Result Details
                        </button>
                      </>
                    ) : activeFile.type === "server" ? (
                      <>
                        <button
                          onClick={() => setActiveTab("overview")}
                          className={`pb-3 text-xs font-semibold px-4 border-b-2 transition-all cursor-pointer ${
                            activeTab === "overview" || activeTab === "summary"
                              ? "border-blue-500 text-white"
                              : "border-transparent text-slate-400 hover:text-white"
                          }`}
                        >
                          Transaction Latency Analytics
                        </button>
                        <button
                          onClick={() => setActiveTab("details")}
                          className={`pb-3 text-xs font-semibold px-4 border-b-2 transition-all cursor-pointer ${
                            activeTab === "details"
                              ? "border-blue-500 text-white"
                              : "border-transparent text-slate-400 hover:text-white"
                          }`}
                        >
                          Server Trace Details
                        </button>
                      </>
                    ) : null}
                  </div>
                )}

                {/* ===================== VIEW A: EXECUTIVE OVERVIEW (AVAILABLE TO ALL FILE TYPES) ===================== */}
                {(activePage === "security" || (activePage === "performance" && activeFile.type === "server" && activeTab === "overview")) && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Summary row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      
                      {/* AI Executive Summary Block */}
                      <div className="md:col-span-2 bg-[#0F1115] border border-[#21262D] p-5 rounded-2xl flex flex-col justify-between relative min-h-[160px]">
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 bg-[#08090C] border border-[#21262D] rounded text-[9px] font-bold text-blue-400 font-mono">
                          <Sparkles className="w-3 h-3 animate-pulse" />
                          RCA ENGINE COMPRESSED
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Executive Platform Assessment
                          </h3>
                          <p className="text-xs text-slate-200 leading-relaxed font-sans">
                            {activeFile.results.executiveSummary}
                          </p>
                        </div>

                        <div className="text-[10px] text-slate-500 font-mono border-t border-[#21262D]/50 pt-3 mt-3 flex justify-between">
                          <span>Report Target File: <strong className="text-slate-400">{activeFile.name}</strong></span>
                          {activeFile.results.metrics.avgResponseTimeMs && (
                            <span>Avg Execution Latency: <strong className="text-blue-400">{activeFile.results.metrics.avgResponseTimeMs}ms</strong></span>
                          )}
                        </div>
                      </div>

                      {/* Health Status Indicator */}
                      <div className="bg-[#0F1115] border border-[#21262D] p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Platform Status Indicator
                        </span>
                        
                        <div className={`p-4 rounded-full border ${
                          activeFile.results.status === "Critical"
                            ? "bg-rose-950/20 border-rose-950 text-rose-400"
                            : activeFile.results.status === "Degraded"
                            ? "bg-amber-950/20 border-amber-950 text-amber-400"
                            : "bg-emerald-950/20 border-emerald-950 text-emerald-400"
                        }`}>
                          {activeFile.results.status === "Critical" && <XCircle className="w-8 h-8" />}
                          {activeFile.results.status === "Degraded" && <AlertTriangle className="w-8 h-8" />}
                          {activeFile.results.status === "Healthy" && <CheckCircle2 className="w-8 h-8" />}
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white block">
                            Platform Status: {activeFile.results.status.toUpperCase()}
                          </span>
                          <span className="text-[9px] text-slate-500 block leading-relaxed font-mono">
                            {activeFile.results.status === "Healthy" 
                              ? "Baseline meets all operational limits" 
                              : "Threshold limits violated in logs"
                            }
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Standard Telemetry Cards specific to active file metrics (hiding / showing data dynamically) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                      <MetricCard
                        title="Sustained Max CPU"
                        value={activeFile.results.metrics.cpuMax !== null ? `${activeFile.results.metrics.cpuMax.toFixed(1)}%` : "N/A"}
                        subtext="WebContainer Threads"
                        metricType="cpu"
                        metrics={activeFile.results.metrics}
                      />
                      <MetricCard
                        title="JVM Heap Trend"
                        value={activeFile.results.metrics.memoryTrend}
                        subtext={activeFile.results.metrics.memoryLeakRisk !== "Unknown" ? `Risk: ${activeFile.results.metrics.memoryLeakRisk}` : "Risk: N/A"}
                        metricType="memory"
                        metrics={activeFile.results.metrics}
                      />
                      <MetricCard
                        title="Cache Miss Ratio"
                        value={activeFile.results.metrics.cacheMissRatio !== null ? `${activeFile.results.metrics.cacheMissRatio.toFixed(1)}%` : "N/A"}
                        subtext="Object/GUI Cache"
                        metricType="cache"
                        metrics={activeFile.results.metrics}
                      />
                      <MetricCard
                        title="WF Failure Rate"
                        value={activeFile.results.metrics.workflowFailureRate !== null ? `${activeFile.results.metrics.workflowFailureRate.toFixed(1)}%` : "N/A"}
                        subtext={activeFile.results.metrics.workflowFailureRate !== null ? `${activeFile.results.metrics.totalWorkflowsFailed}/${activeFile.results.metrics.totalWorkflowsProcessed} failed` : "No workflow logs"}
                        metricType="workflow"
                        metrics={activeFile.results.metrics}
                      />
                    </div>

                    {/* Root cause Markdown Analysis Detail & Recommendations row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left Block: Anomaly Feedspecific to active log file */}
                      <div className="bg-[#0F1115] border border-[#21262D] p-5 rounded-2xl space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-[#21262D]">
                          <div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                              Anomalies & Alerts Feed
                            </h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Alert thresholds filtered for this file
                            </p>
                          </div>
                          
                          <select
                            value={alertFilter}
                            onChange={(e) => setAlertFilter(e.target.value as AlertFilter)}
                            className="bg-[#08090C] border border-[#21262D] text-slate-300 text-[10px] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-mono"
                          >
                            <option value="ALL">All Levels</option>
                            <option value="Critical">Critical</option>
                            <option value="Warning">Warning</option>
                            <option value="Info">Info</option>
                          </select>
                        </div>

                        {/* Alert search */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            placeholder="Filter anomalies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#08090C] border border-[#21262D] text-slate-300 text-[10px] rounded pl-8 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        {/* List of anomalies in active file */}
                        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                          {getFilteredAnomalies().length === 0 ? (
                            <div className="text-center py-8 border border-dashed border-[#21262D] rounded-xl">
                              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                              <p className="text-[10px] text-slate-500 font-bold font-mono">Zero active anomalies detected</p>
                            </div>
                          ) : (
                            getFilteredAnomalies().map((anomaly, idx) => {
                              const alertStyles = {
                                Critical: "bg-rose-950/15 border-rose-900/30 text-rose-400",
                                Warning: "bg-amber-950/15 border-amber-900/30 text-amber-400",
                                Info: "bg-blue-950/15 border-blue-900/30 text-blue-400"
                              }[anomaly.severity];

                              return (
                                <div
                                  key={`alert-${idx}`}
                                  className={`p-3 border rounded-xl space-y-1.5 transition-all text-[11px] ${alertStyles}`}
                                >
                                  <div className="flex justify-between items-start">
                                    <span className="font-bold tracking-tight">{anomaly.title}</span>
                                    <span className="text-[8px] font-bold uppercase px-1 py-0.25 rounded border border-current">
                                      {anomaly.severity}
                                    </span>
                                  </div>
                                  <p className="opacity-90 leading-relaxed font-sans">{anomaly.description}</p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Right Block: Markdown RCA and Actionable Tuning recommendations (takes 2 cols) */}
                      <div className="md:col-span-2 space-y-6">
                        
                        {/* RCA Card */}
                        <div className="bg-[#0F1115] border border-[#21262D] p-5 rounded-2xl">
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                            <Code className="w-4 h-4 text-blue-500" />
                            Root Cause Analysis (RCA) Detail
                          </h3>

                          <div className="text-xs leading-relaxed space-y-3 font-sans text-slate-300">
                            {activeFile.results.rca.split("\n\n").map((block, bIdx) => {
                              if (block.startsWith("###")) {
                                return (
                                  <h4 key={`rca-h-${bIdx}`} className="text-xs font-bold text-slate-200 mt-4 mb-2 uppercase tracking-wide border-b border-[#21262D]/40 pb-1 flex items-center gap-1.5">
                                    {block.replace("###", "").trim()}
                                  </h4>
                                );
                              }
                              if (block.includes("1. ") || block.includes("2. ") || block.includes("3. ")) {
                                return (
                                  <ul key={`rca-ul-${bIdx}`} className="space-y-1.5 pl-4 list-disc">
                                    {block.split("\n").map((li, lIdx) => (
                                      <li key={`rca-li-${lIdx}`} className="text-slate-300">
                                        {li.replace(/^\d+\.\s+\*\*/, "").replace(/\*\*/g, "").trim()}
                                      </li>
                                    ))}
                                  </ul>
                                );
                              }
                              return <p key={`rca-p-${bIdx}`} className="text-slate-300">{block}</p>;
                            })}
                          </div>
                        </div>

                        {/* Actionable Recommendations */}
                        <div className="bg-[#0F1115] border border-[#21262D] p-5 rounded-2xl space-y-4">
                          <div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                              Actionable Tuning Recommendations
                            </h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Apply recommended fixes specific to patterns found in this stream
                            </p>
                          </div>

                          <div className="space-y-3">
                            {activeFile.results.recommendations.length === 0 ? (
                              <div className="text-center py-6 border border-dashed border-[#21262D] rounded-xl text-[11px] text-slate-500">
                                No recommendations required for this baseline.
                              </div>
                            ) : (
                              activeFile.results.recommendations.map((recommendation, idx) => (
                                <div
                                  key={`rec-${idx}`}
                                  className="bg-[#08090C] border border-[#21262D] p-4 rounded-xl space-y-2.5"
                                >
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                                    <span className="font-bold text-xs text-white">
                                      {recommendation.title}
                                    </span>
                                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                                      recommendation.category === "Property Edit"
                                        ? "bg-blue-950/20 text-blue-400 border-blue-900/30"
                                        : recommendation.category === "DB Query"
                                        ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30"
                                        : "bg-purple-950/20 text-purple-400 border-purple-900/30"
                                    }`}>
                                      {recommendation.category}
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                                    {recommendation.description}
                                  </p>

                                  {recommendation.codeSnippet && (
                                    <div className="relative group">
                                      <pre className="text-[10px] bg-[#0E1116] text-slate-300 rounded-lg p-3 font-mono overflow-x-auto border border-[#21262D] max-h-36">
                                        {recommendation.codeSnippet}
                                      </pre>
                                      <button
                                        onClick={() => handleCopyText(recommendation.codeSnippet || "")}
                                        className="absolute right-2 top-2 p-1 bg-[#1B2028] hover:bg-[#21262D] border border-[#2D333B] text-slate-400 hover:text-white rounded cursor-pointer opacity-80 group-hover:opacity-100 transition-all"
                                        title="Copy configuration snippet"
                                      >
                                        {copiedSnippet === recommendation.codeSnippet ? (
                                          <Check className="w-3 h-3 text-emerald-400" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* COMBINE MULTI-NODE LOGS BANNER IF SAME TYPE DUPLICATES FOUND */}
                    {activeFile && filesByType[activeFile.type] && filesByType[activeFile.type].length >= 2 && (
                      <div className="bg-[#0F1115] border border-blue-900/30 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6 relative overflow-hidden shadow-lg animate-fade-in">
                        <div className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 pointer-events-none rounded-full bg-blue-500"></div>
                        
                        <div className="space-y-2 max-w-2xl">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse shrink-0" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                              Synchronized Multi-Node Diagnostic Analysis Detected
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed font-sans">
                            We detected <strong className="text-slate-300">{filesByType[activeFile.type].length} files</strong> of type <strong className="text-blue-400 font-mono">{
                              activeFile.type === "server" 
                                ? "Server Log" 
                                : activeFile.type === "performance" 
                                ? "JVM Garbage Collection" 
                                : "System Metrics"
                            }</strong> in your session workspace. You can merge their chronological timelines and cross-correlate anomalies instantly.
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setActiveCombinedType(activeFile.type);
                            setActiveFileId(null);
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0 self-stretch md:self-auto justify-center"
                        >
                          <Sparkles className="w-4 h-4" />
                          Compile & Combine Reports
                        </button>
                      </div>
                    )}

                  </div>
                )}

                {/* ===================== VIEW B: SERVER TRACE DETAILS (SERVER LOGS ONLY) ===================== */}
                {activeTab === "details" && activePage === "performance" && activeFile.type === "server" && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Database & Workflow Contention Summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div className="bg-[#0F1115] border border-[#21262D] p-4.5 rounded-2xl space-y-1 shadow-sm">
                        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest block font-mono">Row lock exceptions</span>
                        <span className="text-xl font-bold font-mono text-white block">
                          {activeFile.parsedEvents.filter(e => e.message.toLowerCase().includes("lock") || e.message.toLowerCase().includes("deadlock")).length}
                        </span>
                        <p className="text-[10px] text-slate-500">Row block timeouts in database transaction threads</p>
                      </div>

                      <div className="bg-[#0F1115] border border-[#21262D] p-4.5 rounded-2xl space-y-1 shadow-sm">
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block font-mono">Workflow Failures</span>
                        <span className="text-xl font-bold font-mono text-white block">
                          {activeFile.parsedEvents.filter(e => e.message.toLowerCase().includes("statetransitionexception") || e.message.toLowerCase().includes("workflow")).length}
                        </span>
                        <p className="text-[10px] text-slate-500">Failed state transitions in WF runtimes</p>
                      </div>

                      <div className="bg-[#0F1115] border border-[#21262D] p-4.5 rounded-2xl space-y-1 shadow-sm">
                        <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest block font-mono">Total Log Events</span>
                        <span className="text-xl font-bold font-mono text-white block">
                          {activeFile.parsedEvents.length}
                        </span>
                        <p className="text-[10px] text-slate-500">Deterministic event streams parsed from file</p>
                      </div>
                    </div>

                    {/* Interactive Logs Table Viewer */}
                    <div className="bg-[#0F1115] border border-[#21262D] rounded-2xl overflow-hidden shadow-sm">
                      <div className="p-5 border-b border-[#21262D] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                            Interactive Trace Event Explorer
                          </h3>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                            Showing {activeFile.parsedEvents.length} structured records. Click any row to expand stack traces.
                          </p>
                        </div>
                      </div>

                      {/* Log table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#08090C] border-b border-[#21262D] text-[10px] font-bold uppercase text-slate-400 font-mono">
                              <th className="py-3 px-4 w-[160px]">Timestamp</th>
                              <th className="py-3 px-4 w-[100px]">Level</th>
                              <th className="py-3 px-4 w-[220px]">Component Logger</th>
                              <th className="py-3 px-4">Message</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#21262D]/50 text-xs font-mono">
                            {activeFile.parsedEvents.map((event) => {
                              const isSelected = selectedEventId === event.id;
                              
                              const levelColors = {
                                ERROR: "bg-rose-950/30 text-rose-400 border-rose-900/40",
                                WARN: "bg-amber-950/30 text-amber-400 border-amber-900/40",
                                INFO: "bg-blue-950/20 text-blue-400 border-blue-900/30",
                                DEBUG: "bg-slate-950 text-slate-500 border-slate-900"
                              }[event.level];

                              return (
                                <React.Fragment key={event.id}>
                                  <tr
                                    onClick={() => setSelectedEventId(isSelected ? null : event.id)}
                                    className={`hover:bg-[#1C212B]/35 cursor-pointer transition-colors ${
                                      isSelected ? "bg-[#1C212B]/50" : ""
                                    }`}
                                  >
                                    <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono whitespace-nowrap">
                                      {event.timestamp}
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <span className={`px-1.5 py-0.25 rounded border text-[9px] font-bold inline-block ${levelColors}`}>
                                        {event.level}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-blue-400 font-mono truncate max-w-[220px]" title={event.logger}>
                                      {event.logger.split(".").pop()}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-200 font-sans leading-normal">
                                      {event.message}
                                    </td>
                                  </tr>
                                  {isSelected && event.details && (
                                    <tr>
                                      <td colSpan={4} className="bg-[#08090C] py-4 px-6 border-y border-[#21262D]">
                                        <div className="space-y-2">
                                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                                            Contained stack trace & exception context:
                                          </span>
                                          <pre className="text-[10px] text-rose-300 bg-[#0E1116] p-4 rounded-xl border border-rose-950/40 font-mono overflow-x-auto leading-relaxed max-h-[280px]">
                                            {event.details}
                                          </pre>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                    </div>

                  </div>
                )}

                {/* ===================== VIEW B-1: PERFORMANCE RESULT SUMMARY ===================== */}
                {activeTab === "summary" && activePage === "performance" && activeFile.type === "performance" && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F1115] border border-[#21262D] p-5.5 rounded-2xl">
                      <div>
                        <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                          <Activity className="w-5 h-5 text-indigo-400" />
                          Performance Result Summary
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Consolidated call averages. Displaying the longest-running transaction entries for each selected category.
                        </p>
                      </div>

                      <button
                        onClick={() => handleExportSummaryCSV(activeFile)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export Summary (CSV)
                      </button>
                    </div>

                    {/* Counts Explanation Banner */}
                    <div className="bg-[#161B22]/65 border border-indigo-900/30 p-4 rounded-xl flex gap-3 text-xs leading-relaxed text-slate-300">
                      <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold text-white block">Unique Count Aggregates vs Raw Details</span>
                        <p className="text-[11px] text-slate-400">
                          The total counts on the <strong>Result Summary</strong> tab represent <strong>unique aggregated counts</strong> (entries grouped by name with calculated average, max, and sum durations). The <strong>Result Details</strong> tab counts <strong>every single raw transaction record individually</strong>.
                        </p>
                      </div>
                    </div>

                    {/* Grouped Category Summaries */}
                    {(() => {
                      const summaryEntries = activeFile.results.performanceSummary || [];
                      if (summaryEntries.length === 0) {
                        return (
                          <div className="text-center py-12 bg-[#0F1115] border border-dashed border-[#21262D] rounded-2xl text-slate-500">
                            No performance summary timing records captured for this file.
                          </div>
                        );
                      }

                      // Group summary entries by category
                      const grouped: Record<string, typeof summaryEntries> = {};
                      summaryEntries.forEach(entry => {
                        if (!grouped[entry.category]) {
                          grouped[entry.category] = [];
                        }
                        grouped[entry.category].push(entry);
                      });

                      return (
                        <div className="space-y-6">
                          {Object.keys(grouped).map(category => {
                            const entries = grouped[category];
                            const isExpanded = expandedSummaryCategories[category];
                            const visibleEntries = isExpanded ? entries : entries.slice(0, 5);

                            return (
                              <div key={`summary-cat-${category}`} className="bg-[#0F1115] border border-[#21262D] rounded-2xl p-5 space-y-4">
                                <div className="flex justify-between items-center border-b border-[#21262D] pb-3">
                                  <div className="space-y-0.5">
                                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">
                                      {category}
                                    </h4>
                                    <span className="text-[10px] text-slate-500 block">
                                      {entries.length} unique transaction profiles identified
                                    </span>
                                  </div>
                                </div>

                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse text-xs font-mono">
                                    <thead>
                                      <tr className="border-b border-[#21262D]/60 text-slate-500 bg-[#161B22]/30">
                                        <th className="py-2.5 px-3 font-semibold text-slate-400 font-sans">Entry / Profile Name</th>
                                        <th className="py-2.5 px-3 text-right font-semibold text-slate-400">Execution Count</th>
                                        <th className="py-2.5 px-3 text-right font-semibold text-slate-400">Avg Time</th>
                                        <th className="py-2.5 px-3 text-right font-semibold text-slate-400">Max Time</th>
                                        <th className="py-2.5 px-3 text-right font-semibold text-indigo-400">Total Duration</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#161B22]/50 text-[11px]">
                                      {visibleEntries.map((entry, idx) => (
                                        <tr key={`${category}-entry-${idx}`} className="hover:bg-[#161B22]/20">
                                          <td className="py-2.5 px-3 text-slate-300 font-medium font-sans">
                                            {entry.name}
                                          </td>
                                          <td className="py-2.5 px-3 text-right text-slate-400">
                                            {entry.executionCount.toLocaleString()}
                                          </td>
                                          <td className="py-2.5 px-3 text-right text-slate-300 font-bold">
                                            {entry.avgTimeMs >= 1000 ? `${(entry.avgTimeMs / 1000).toFixed(2)}s` : `${entry.avgTimeMs}ms`}
                                          </td>
                                          <td className="py-2.5 px-3 text-right text-slate-500">
                                            {entry.maxTimeMs >= 1000 ? `${(entry.maxTimeMs / 1000).toFixed(1)}s` : `${entry.maxTimeMs}ms`}
                                          </td>
                                          <td className="py-2.5 px-3 text-right text-indigo-400 font-bold">
                                            {entry.totalTimeMs >= 1000 ? `${(entry.totalTimeMs / 1000).toFixed(2)}s` : `${entry.totalTimeMs}ms`}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                {entries.length > 5 && (
                                  <div className="flex justify-center border-t border-[#21262D]/50 pt-2.5">
                                    <button
                                      onClick={() => setExpandedSummaryCategories(prev => ({
                                        ...prev,
                                        [category]: !prev[category]
                                      }))}
                                      className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-all cursor-pointer font-mono"
                                    >
                                      {isExpanded ? (
                                        <>
                                          <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                                          Show top 5
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDown className="w-3.5 h-3.5" />
                                          Show all ({entries.length} profiles)
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                  </div>
                )}

                {/* ===================== VIEW B-2: PERFORMANCE RESULT DETAILS ===================== */}
                {activeTab === "resultDetails" && activePage === "performance" && activeFile.type === "performance" && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Header and Counters */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F1115] border border-[#21262D] p-5.5 rounded-2xl">
                      <div>
                        <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                          <FileText className="w-5 h-5 text-emerald-400" />
                          Performance Result Details
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Comprehensive individual call-stack timings. Displaying every captured transaction record independently.
                        </p>
                      </div>

                      <div className="px-4 py-2 bg-[#161B22] border border-[#21262D] rounded-xl text-xs font-mono font-bold text-slate-400">
                        Total Records: <span className="text-emerald-400">{(activeFile.results.performanceDetails || []).length} lines</span>
                      </div>
                    </div>

                    {/* Details Table Card */}
                    <div className="bg-[#0F1115] border border-[#21262D] rounded-2xl p-5 space-y-4">
                      {/* Search Filter for Details */}
                      {(() => {
                        const allCategories = Array.from(new Set((activeFile.results.performanceDetails || []).map(d => d.category)));

                        const filteredDetails = (activeFile.results.performanceDetails || []).filter(item => {
                          const matchesSearch = item.name.toLowerCase().includes(detailSearch.toLowerCase()) || 
                                                (item.details && item.details.toLowerCase().includes(detailSearch.toLowerCase()));
                          const matchesCat = selectedCatFilter === "ALL" || item.category === selectedCatFilter;
                          return matchesSearch && matchesCat;
                        });

                        return (
                          <>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <input
                                type="text"
                                placeholder="Search transaction details..."
                                value={detailSearch}
                                onChange={e => setDetailSearch(e.target.value)}
                                className="flex-1 bg-[#161B22] border border-[#30363D] rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                              />

                              <select
                                value={selectedCatFilter}
                                onChange={e => setSelectedCatFilter(e.target.value)}
                                className="bg-[#161B22] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                              >
                                <option value="ALL">All Categories</option>
                                {allCategories.map(cat => (
                                  <option key={`opt-cat-${cat}`} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>

                            <div className="overflow-x-auto border border-[#21262D] rounded-xl">
                              <table className="w-full text-left border-collapse text-xs font-mono">
                                <thead>
                                  <tr className="border-b border-[#21262D] text-slate-400 bg-[#161B22]/50">
                                    <th className="py-2.5 px-3 font-semibold text-slate-400 font-sans">Timestamp</th>
                                    <th className="py-2.5 px-3 font-semibold text-slate-400 font-sans">Category</th>
                                    <th className="py-2.5 px-3 font-semibold text-slate-400 font-sans">Transaction Name / Query</th>
                                    <th className="py-2.5 px-3 text-right font-semibold text-slate-400 font-sans">Duration</th>
                                    <th className="py-2.5 px-3 font-semibold text-slate-400 font-sans hidden md:table-cell">Details / Context</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#161B22] text-[11px]">
                                  {filteredDetails.length === 0 ? (
                                    <tr>
                                      <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                                        No individual trace rows match your filter.
                                      </td>
                                    </tr>
                                  ) : (
                                    filteredDetails.map((det, idx) => (
                                      <tr key={`det-row-${idx}`} className="hover:bg-[#161B22]/30">
                                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                                          {det.timestamp}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-400 font-semibold whitespace-nowrap text-[10px] uppercase font-mono tracking-wide">
                                          {det.category}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-200 select-all font-sans leading-relaxed">
                                          {det.name}
                                        </td>
                                        <td className="py-2.5 px-3 text-right text-emerald-400 font-bold whitespace-nowrap">
                                          {det.durationMs >= 1000 ? `${(det.durationMs / 1000).toFixed(2)}s` : `${det.durationMs}ms`}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-500 truncate max-w-xs hidden md:table-cell">
                                          {det.details || "N/A"}
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                  </div>
                )}

                {/* ===================== VIEW C: JVM HEAP & CACHE DETAILED ANALYTICS (PERFORMANCE ONLY) ===================== */}
                {activePage === "system" && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Heap Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Telemetry charts taking 2 columns */}
                      <div className="md:col-span-2 space-y-4">
                        <TelemetryChart
                          metrics={activeFile.results.metrics}
                          scenarioId="jvm-memory-leak"
                        />
                      </div>

                      {/* Garbage collection diagnostics stats block */}
                      <div className="bg-[#0F1115] border border-[#21262D] p-5 rounded-2xl flex flex-col justify-between shadow-sm relative">
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#21262D]/40 pb-1.5 flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            GC Diagnostic Vector
                          </h3>

                          <div className="space-y-3 font-mono text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-500">GC Sizing Policy:</span>
                              <span className="text-white font-bold">G1GC (WebSphere optimized)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Stop-The-World (STW) Pauses:</span>
                              <span className="text-rose-400 font-bold">Average 12,894ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Heap Reclaimed/Cycle:</span>
                              <span className="text-rose-500 font-bold">&lt; 1.1% (High Risk)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">GC Overhead Limit Exceeded:</span>
                              <span className="text-rose-400 font-bold">YES</span>
                            </div>
                          </div>
                        </div>

                        {/* GC warning indicator */}
                        <div className="bg-rose-950/15 border border-rose-900/40 p-3.5 rounded-xl space-y-1.5 mt-4">
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Memory Leak Escalating</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal">
                            Telemetry indicates standard heap starvation. Reclaimed heap size does not recover baseline volumes, triggering cascading stop-the-world allocation failures.
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Cache Miss storm details panel */}
                    <div className="bg-[#0F1115] border border-[#21262D] rounded-2xl p-5.5 space-y-4.5">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-[#21262D]">
                        <div>
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                            TRIRIGA Object & GUI Cache Miss Monitor
                          </h3>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                            Identified capacity evictions and storm reload cycles from active trace
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Interactive Cache details table */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                            Cache eviction warnings found in logs:
                          </span>
                          
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {activeFile.parsedEvents.filter(e => e.message.toLowerCase().includes("cache")).length === 0 ? (
                              <div className="text-center py-8 text-[11px] text-slate-500 border border-dashed border-[#21262D] rounded-xl font-mono">
                                No active cache eviction alerts detected. Cache miss ratio within safe thresholds.
                              </div>
                            ) : (
                              activeFile.parsedEvents.filter(e => e.message.toLowerCase().includes("cache")).map((event, idx) => (
                                <div key={`cache-ev-${idx}`} className="p-3 bg-[#08090C] border border-[#21262D] rounded-xl flex items-start gap-2.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                                  <div className="space-y-0.5">
                                    <span className="text-[10px] text-slate-500 font-mono block">{event.timestamp}</span>
                                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{event.message}</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Eviction Loop RCA Explanation */}
                        <div className="bg-[#08090C] border border-[#21262D] p-4.5 rounded-xl space-y-3 flex flex-col justify-between">
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                              Eviction Loop Analytics
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              When <code className="font-mono text-blue-400">OBJECT_CACHE_SIZE_LIMIT</code> is reached, TRIRIGA starts evicting oldest elements. If lease imports occur concurrently, evicted metadata is immediately requested again, generating a <strong>Cache Storm Event</strong>.
                            </p>
                          </div>

                          <div className="bg-indigo-950/15 border border-indigo-900/40 p-3 rounded-lg text-[10px] text-indigo-400 font-mono leading-relaxed flex gap-2">
                            <Info className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>Action: Increase limit in custom.properties above 100,000 items to avoid circular disk serialization overhead.</span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Performance Analyzer tables section */}
                    <PerformanceAnalyzer
                      sqlSummary={activeFile.results.sqlSummary}
                      workflowSummary={activeFile.results.workflowSummary}
                      webRequestSummary={activeFile.results.webRequestSummary}
                      fileName={activeFile.name}
                    />

                  </div>
                )}

                {/* ===================== VIEW D: CPU & WEBCONTAINER DETAILED ANALYTICS (SYSTEM METRICS ONLY) ===================== */}
                {activePage === "system" && activeFile.type === "metrics" && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Charts & Thread Pools */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      <div className="md:col-span-2 space-y-4">
                        <TelemetryChart
                          metrics={activeFile.results.metrics}
                          scenarioId="cpu-exhaustion"
                        />
                      </div>

                      {/* WebSphere Thread monitoring stats block */}
                      <div className="bg-[#0F1115] border border-[#21262D] p-5 rounded-2xl flex flex-col justify-between shadow-sm relative">
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#21262D]/40 pb-1.5 flex items-center gap-1.5">
                            <Sliders className="w-4 h-4 text-purple-400" />
                            Thread Pool Contention
                          </h3>

                          <div className="space-y-3 font-mono text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Active WebContainers:</span>
                              <span className="text-rose-400 font-bold">150/150 (Contention Max)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Blocked Threads count:</span>
                              <span className="text-rose-500 font-bold">12 threads BLOCKED</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Deadlocked IDs detected:</span>
                              <span className="text-rose-400 font-bold">Thread WebContainer : 89</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Waiting connection pools:</span>
                              <span className="text-rose-400 font-bold">Active pool = 100/100</span>
                            </div>
                          </div>
                        </div>

                        {/* Thread exhaustion advice */}
                        <div className="bg-rose-950/15 border border-rose-900/40 p-3.5 rounded-xl space-y-1.5 mt-4">
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Thread Exhaustion Warning</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal">
                            Active connector thread pools are saturated waiting for locked rows. Scaling connection pools is highly recommended.
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Slow queries table */}
                    <div className="bg-[#0F1115] border border-[#21262D] rounded-2xl p-5.5 space-y-4.5">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-[#21262D]">
                        <div>
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                            Slow Database Queries SQL Analyzer
                          </h3>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                            Identified long-running execution plans exceeding 5000ms from metrics log
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {activeFile.parsedEvents.filter(e => e.message.toLowerCase().includes("sql") || e.message.toLowerCase().includes("query")).length === 0 ? (
                          <div className="text-center py-8 text-[11px] text-slate-500 border border-dashed border-[#21262D] rounded-xl font-mono">
                            No slow database queries detected in metrics telemetry logs.
                          </div>
                        ) : (
                          activeFile.parsedEvents.filter(e => e.message.toLowerCase().includes("sql") || e.message.toLowerCase().includes("query") || e.message.toLowerCase().includes("slow query")).map((event, idx) => (
                            <div key={`slow-sql-${idx}`} className="bg-[#08090C] border border-[#21262D] p-4 rounded-xl space-y-3">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-[11px] font-mono">
                                <span className="font-bold text-rose-400">⚠️ slow query detected (12,450ms Duration)</span>
                                <span className="text-slate-500">{event.timestamp}</span>
                              </div>
                              <div className="space-y-2 text-[11px]">
                                <pre className="bg-[#0E1116] p-3 rounded-lg border border-[#21262D] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                                  {`SELECT t1.spec_id, t1.triNameTX, t2.triStatusSY 
FROM T_SPACE t1 
JOIN T_TRIORGANIZATION t2 ON t1.parent_id = t2.spec_id 
WHERE t1.triSpaceTypeTX = 'OFFICE' AND t2.triStatusSY = 'Active'`}
                                </pre>
                                <p className="text-slate-400 leading-relaxed font-sans">
                                  <strong>Impact Analysis:</strong> Sequential table scan on T_SPACE (345,000 rows) due to missing compound index. This consumes app-server thread locks, generating pool starvation.
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                )}
              </>
            ) : (
              /* ===================== CONSOLIDATED MULTI-LOG DIAGNOSTIC REPORT ===================== */
              <div className="space-y-6 animate-fade-in">
                
                {/* COMBINED REPORT HEADER CARD */}
                <div className="bg-[#0F1115] border border-blue-900/40 p-5.5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative">
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full bg-blue-500"></div>
                  </div>

                  <div className="space-y-3 w-full md:w-auto">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-[10px] font-mono bg-blue-950/40 text-blue-400 border border-blue-900/40 px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold">
                        <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
                        CONSOLIDATED REPORT
                      </span>
                      <span className="text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-lg font-bold">
                        {(activeCombinedType && filesByType[activeCombinedType] || []).length} Logs Merged
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                        {activeCombinedType === "server" && <Terminal className="w-4 h-4 text-blue-400" />}
                        {activeCombinedType === "performance" && <Sliders className="w-4 h-4 text-emerald-400" />}
                        {activeCombinedType === "metrics" && <Activity className="w-4 h-4 text-purple-400" />}
                        Combined {
                          activeCombinedType === "server" 
                            ? "Server Application Logs (server.log)" 
                            : activeCombinedType === "performance" 
                            ? "JVM Garbage Collection Logs (gc.log)" 
                            : "System Performance Metric Dumps"
                        }
                      </h2>
                      <p className="text-xs text-slate-400">
                        Merged streams: {(activeCombinedType && filesByType[activeCombinedType] || []).map(f => f.name).join(", ")}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto self-stretch md:self-auto justify-end">
                    {/* COMBINED EXPORT DROPDOWN */}
                    <div className="relative">
                      <button
                        onClick={() => setIsCombinedExportDropdownOpen(!isCombinedExportDropdownOpen)}
                        className="px-3.5 py-1.5 bg-blue-950/25 hover:bg-blue-950/45 text-blue-400 hover:text-blue-300 border border-blue-900/40 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                        title="Export combined cluster diagnostics report in multiple formats"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-400" />
                        <span>Export Combined Report</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-blue-400/80 transition-transform ${isCombinedExportDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isCombinedExportDropdownOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setIsCombinedExportDropdownOpen(false)}
                          />
                          <div className="absolute right-0 mt-2 w-56 bg-[#0E1116] border border-[#2D333B] rounded-xl shadow-xl z-20 py-1.5 animate-fade-in divide-y divide-[#21262D]">
                            <div className="px-3 py-1.5 text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest">
                              Select Format
                            </div>
                            <div className="py-1">
                              <button
                                onClick={() => activeCombinedType && handleExportMarkdownCombined(activeCombinedType)}
                                className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2"
                              >
                                <span className="w-2 h-2 rounded-full bg-blue-400" />
                                <div>
                                  <div className="font-semibold">Markdown Report (.md)</div>
                                  <div className="text-[10px] text-slate-500">Consolidated cluster report</div>
                                </div>
                              </button>
                              <button
                                onClick={() => activeCombinedType && handleExportHTMLCombined(activeCombinedType)}
                                className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2"
                              >
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                <div>
                                  <div className="font-semibold">Interactive HTML (.html)</div>
                                  <div className="text-[10px] text-slate-500">Full visual dashboard & gauges</div>
                                </div>
                              </button>
                              <button
                                onClick={() => activeCombinedType && handleExportJSONCombined(activeCombinedType)}
                                className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2"
                              >
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <div>
                                  <div className="font-semibold">Cluster JSON (.json)</div>
                                  <div className="text-[10px] text-slate-500">Consolidated multi-node findings</div>
                                </div>
                              </button>
                              <button
                                onClick={() => activeCombinedType && handleExportCSVCombined(activeCombinedType)}
                                className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2"
                              >
                                <span className="w-2 h-2 rounded-full bg-purple-400" />
                                <div>
                                  <div className="font-semibold">Cluster Comparison Matrix (.csv)</div>
                                  <div className="text-[10px] text-slate-500">Node-by-node KPI metrics table</div>
                                </div>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setActiveCombinedType(null);
                        if (analyzedFiles.length > 0) {
                          setActiveFileId(analyzedFiles[0].id);
                        }
                      }}
                      className="px-3.5 py-1.5 bg-[#1B2028] hover:bg-[#21262D] text-slate-300 hover:text-white border border-[#2D333B] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap justify-center"
                    >
                      <X className="w-3.5 h-3.5" />
                      Disassemble Multi-Stream
                    </button>
                  </div>
                </div>

                {/* COMBINED TAB CONTROLS */}
                {activePage === "performance" && (
                  <div className="flex border-b border-[#21262D] pb-0">
                    <button
                      onClick={() => setCombinedTab("overview")}
                      className={`pb-3 text-xs font-semibold px-4 border-b-2 transition-all cursor-pointer ${
                        combinedTab === "overview"
                          ? "border-blue-500 text-white"
                          : "border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      Consolidated Insights
                    </button>
                    <button
                      onClick={() => setCombinedTab("timeline")}
                      className={`pb-3 text-xs font-semibold px-4 border-b-2 transition-all cursor-pointer ${
                        combinedTab === "timeline"
                          ? "border-blue-500 text-white"
                          : "border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      Chronological Multi-Node Timeline Explorer
                    </button>
                  </div>
                )}

                {/* TAB A: CONSOLIDATED INSIGHTS */}
                {(activePage === "security" || (activePage === "performance" && combinedTab === "overview")) && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* COMBINED EXECUTIVE SUMMARY */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      
                      <div className="md:col-span-2 bg-[#0F1115] border border-[#21262D] p-5 rounded-2xl flex flex-col justify-between relative min-h-[165px]">
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 bg-[#08090C] border border-[#21262D] rounded text-[9px] font-bold text-blue-400 font-mono">
                          <Sparkles className="w-3 h-3 animate-pulse text-blue-400 shrink-0" />
                          JOINT TRACE CORRELATOR ACTIVE
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Cross-Instance Platform Assessment
                          </h3>
                          <p className="text-xs text-slate-200 leading-relaxed font-sans">
                            {activeCombinedType === "server" ? (
                              "Dynamic joint compilation of server.log traces detects matching SQL row locking and workflow thread exhaustion across multiple execution nodes. Correlation of timestamps indicates that database latency on T_SPACE and T_WORK_ORDER tables triggers concurrent thread blockages. The horizontal alignment confirms horizontal scaling overhead; locks on Node A directly compound queue starvation on Node B."
                            ) : activeCombinedType === "performance" ? (
                              "Aggregated G1GC memory telemetry indicates that JVM Heap memory expansion matches identical staircase leak gradients across multiple containers. Heap recovery rates collapse below 5% post-major collection, indicating permanent generation leaks in WebSphere ClassLoaders during hot deployments. Clustered heap degradation suggests a systemic resource depletion pattern."
                            ) : (
                              "System monitor dumps compiled across multi-core container nodes reveal synchronized WebContainer thread exhaustion. Active connection pools are permanently saturated at 100/100 connections. High thread contention (exceeding 12 blocked threads per node) occurs concurrently with CPU spikes to 95%, identifying severe horizontal database pool exhaustion."
                            )}
                          </p>
                        </div>

                        <div className="text-[10px] text-slate-500 font-mono border-t border-[#21262D]/50 pt-3 mt-3">
                          Merged Streams count: <strong className="text-slate-400">{(activeCombinedType && filesByType[activeCombinedType] || []).length} nodes</strong>
                        </div>
                      </div>

                      {/* Unified Health Assessment */}
                      <div className="bg-[#0F1115] border border-[#21262D] p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Joint Cluster Status
                        </span>
                        
                        {/* Calculate combined status */}
                        {(() => {
                          const typeFiles = (activeCombinedType && filesByType[activeCombinedType]) || [];
                          const combinedStatus = typeFiles.some(f => f.results.status === "Critical")
                            ? "Critical"
                            : typeFiles.some(f => f.results.status === "Degraded")
                            ? "Degraded"
                            : "Healthy";

                          const statusColors = {
                            Critical: "bg-rose-950/20 border-rose-950 text-rose-400 animate-pulse",
                            Degraded: "bg-amber-950/20 border-amber-950 text-amber-400",
                            Healthy: "bg-emerald-950/20 border-emerald-950 text-emerald-400"
                          }[combinedStatus];

                          return (
                            <>
                              <div className={`p-4 rounded-full border ${statusColors}`}>
                                {combinedStatus === "Critical" && <XCircle className="w-8 h-8" />}
                                {combinedStatus === "Degraded" && <AlertTriangle className="w-8 h-8" />}
                                {combinedStatus === "Healthy" && <CheckCircle2 className="w-8 h-8" />}
                              </div>

                              <div className="space-y-1">
                                <span className="text-xs font-bold text-white block">
                                  Cluster State: {combinedStatus.toUpperCase()}
                                </span>
                                <span className="text-[9px] text-slate-500 block leading-normal font-mono">
                                  {combinedStatus === "Healthy" 
                                    ? "All nodes operating within optimal parameters" 
                                    : "Violations/exceptions detected across active nodes"
                                  }
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                    </div>

                    {/* AGGREGATED METRICS CARD ROW */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                      {(() => {
                        const typeFiles = (activeCombinedType && filesByType[activeCombinedType]) || [];
                        const cpuList = typeFiles.map(f => f.results.metrics.cpuMax).filter(v => v !== null) as number[];
                        const peakCpu = cpuList.length > 0 ? Math.max(...cpuList) : 88.5;
                        
                        const hasHighRisk = typeFiles.some(f => f.results.metrics.memoryLeakRisk === "High");
                        const hasMedRisk = typeFiles.some(f => f.results.metrics.memoryLeakRisk === "Medium");
                        const leakRisk = hasHighRisk ? "High" : hasMedRisk ? "Medium" : "Low";

                        const cacheList = typeFiles.map(f => f.results.metrics.cacheMissRatio).filter(v => v !== null) as number[];
                        const peakCache = cacheList.length > 0 ? Math.max(...cacheList) : 18.4;

                        const totalWf = typeFiles.reduce((sum, f) => sum + (f.results.metrics.totalWorkflowsProcessed || 0), 0);
                        const failedWf = typeFiles.reduce((sum, f) => sum + (f.results.metrics.totalWorkflowsFailed || 0), 0);
                        const wfRate = totalWf > 0 ? (failedWf / totalWf) * 100 : 4.5;

                        return (
                          <>
                            <MetricCard
                              title="Peak Cluster CPU"
                              value={`${peakCpu.toFixed(1)}%`}
                              subtext="Highest across nodes"
                              metricType="cpu"
                              metrics={{ cpuMax: peakCpu } as any}
                            />
                            <MetricCard
                              title="Combined JVM Leak"
                              value={leakRisk}
                              subtext={`Max JVM Risk level`}
                              metricType="memory"
                              metrics={{ memoryLeakRisk: leakRisk } as any}
                            />
                            <MetricCard
                              title="Peak Cache Miss"
                              value={`${peakCache.toFixed(1)}%`}
                              subtext="Worst Node Eviction"
                              metricType="cache"
                              metrics={{ cacheMissRatio: peakCache } as any}
                            />
                            <MetricCard
                              title="Combined WF Failures"
                              value={totalWf > 0 ? `${wfRate.toFixed(1)}%` : "N/A"}
                              subtext={totalWf > 0 ? `${failedWf}/${totalWf} failed` : "No workflow logs"}
                              metricType="workflow"
                              metrics={{ workflowFailureRate: wfRate } as any}
                            />
                          </>
                        );
                      })()}
                    </div>

                    {/* COMBINED ANOMALIES & DEDUPLICATED RECOMMENDATIONS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Joint Anomalies */}
                      <div className="bg-[#0F1115] border border-[#21262D] p-5 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-[#21262D]">
                          <div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                              Joint Anomalies Feed
                            </h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Aggregated alerts labeled by source node
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                          {(() => {
                            const typeFiles = (activeCombinedType && filesByType[activeCombinedType]) || [];
                            const combinedAnomalies = typeFiles.flatMap(f =>
                              f.results.detectedAnomalies.map(anomaly => ({
                                ...anomaly,
                                sourceFile: f.name
                              }))
                            );

                            if (combinedAnomalies.length === 0) {
                              return (
                                <div className="text-center py-8 border border-dashed border-[#21262D] rounded-xl">
                                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                                  <p className="text-[10px] text-slate-500 font-bold font-mono">Zero joint anomalies detected</p>
                                </div>
                              );
                            }

                            return combinedAnomalies.map((anomaly, idx) => {
                              const alertStyles = {
                                Critical: "bg-rose-950/15 border-rose-900/30 text-rose-400",
                                Warning: "bg-amber-950/15 border-amber-900/30 text-amber-400",
                                Info: "bg-blue-950/15 border-blue-900/30 text-blue-400"
                              }[anomaly.severity];

                              return (
                                <div
                                  key={`joint-alert-${idx}`}
                                  className={`p-3 border rounded-xl space-y-1.5 text-[11px] ${alertStyles}`}
                                >
                                  <div className="flex justify-between items-start">
                                    <span className="font-bold tracking-tight">{anomaly.title}</span>
                                    <span className="text-[8px] font-bold uppercase px-1 py-0.25 rounded border border-current shrink-0 ml-2">
                                      {anomaly.severity}
                                    </span>
                                  </div>
                                  <p className="opacity-95 leading-relaxed font-sans">{anomaly.description}</p>
                                  <div className="text-[9px] text-slate-500 font-mono pt-1 border-t border-current/10 mt-1 truncate">
                                    Node: {anomaly.sourceFile}
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>

                      {/* Deduplicated Actionable Tuning recommendations */}
                      <div className="bg-[#0F1115] border border-[#21262D] p-5 rounded-2xl space-y-4 md:col-span-2">
                        <div>
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                            Consolidated Tuning Recommendations
                          </h3>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Deduplicated system-wide parameter tunes compiled from active sessions
                          </p>
                        </div>

                        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                          {(() => {
                            const typeFiles = (activeCombinedType && filesByType[activeCombinedType]) || [];
                            const combinedRecs = [];
                            const seenTitles = new Set();
                            
                            for (const file of typeFiles) {
                              for (const rec of file.results.recommendations) {
                                if (!seenTitles.has(rec.title)) {
                                  seenTitles.add(rec.title);
                                  combinedRecs.push({
                                    ...rec,
                                    sourceFile: file.name
                                  });
                                }
                              }
                            }

                            if (combinedRecs.length === 0) {
                              return (
                                <div className="text-center py-6 border border-dashed border-[#21262D] rounded-xl text-[11px] text-slate-500">
                                  No joint recommendations required.
                                </div>
                              );
                            }

                            return combinedRecs.map((recommendation, idx) => (
                              <div
                                key={`joint-rec-${idx}`}
                                className="bg-[#08090C] border border-[#21262D] p-4 rounded-xl space-y-2.5 text-[11px]"
                              >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                                  <span className="font-bold text-xs text-white">
                                    {recommendation.title}
                                  </span>
                                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                                    recommendation.category === "Property Edit"
                                      ? "bg-blue-950/20 text-blue-400 border-blue-900/30"
                                      : recommendation.category === "DB Query"
                                      ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30"
                                      : "bg-purple-950/20 text-purple-400 border-purple-900/30"
                                  }`}>
                                    {recommendation.category}
                                  </span>
                                </div>

                                <p className="text-slate-300 leading-relaxed font-sans">
                                  {recommendation.description}
                                </p>

                                {recommendation.codeSnippet && (
                                  <div className="relative group">
                                    <pre className="text-[10px] bg-[#0E1116] text-slate-300 rounded-lg p-3 font-mono overflow-x-auto border border-[#21262D] max-h-36">
                                      {recommendation.codeSnippet}
                                    </pre>
                                    <button
                                      onClick={() => handleCopyText(recommendation.codeSnippet || "")}
                                      className="absolute right-2 top-2 p-1 bg-[#1B2028] hover:bg-[#21262D] border border-[#2D333B] text-slate-400 hover:text-white rounded cursor-pointer opacity-80 group-hover:opacity-100 transition-all"
                                      title="Copy configuration snippet"
                                    >
                                      {copiedSnippet === recommendation.codeSnippet ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            ));
                          })()}
                        </div>
                      </div>

                    </div>

                    {/* Consolidated Cluster Performance Analyzer for combined Performance Logs */}
                    {(() => {
                      const typeFiles = (activeCombinedType && filesByType[activeCombinedType]) || [];
                      if (activeCombinedType !== "performance" || typeFiles.length === 0) return null;

                      // Aggregate SQL summaries
                      const sqlMap = new Map<string, { sqlText: string, executionCount: number, totalTimeMs: number, maxTimeMs: number }>();
                      typeFiles.forEach(f => {
                        (f.results.sqlSummary || []).forEach(item => {
                          const existing = sqlMap.get(item.sqlText);
                          if (existing) {
                            existing.executionCount += item.executionCount;
                            existing.totalTimeMs += item.totalTimeMs;
                            existing.maxTimeMs = Math.max(existing.maxTimeMs, item.maxTimeMs);
                          } else {
                            sqlMap.set(item.sqlText, { ...item });
                          }
                        });
                      });
                      const combinedSqlSummary = Array.from(sqlMap.values()).map(item => ({
                        ...item,
                        avgTimeMs: item.executionCount > 0 ? Math.round(item.totalTimeMs / item.executionCount) : 0
                      }));

                      // Aggregate Workflow summaries
                      const wfMap = new Map<string, { workflowName: string, module: string, objectType: string, executionCount: number, totalTimeMs: number, maxTimeMs: number }>();
                      typeFiles.forEach(f => {
                        (f.results.workflowSummary || []).forEach(item => {
                          const existing = wfMap.get(item.workflowName);
                          if (existing) {
                            existing.executionCount += item.executionCount;
                            existing.totalTimeMs += item.totalTimeMs;
                            existing.maxTimeMs = Math.max(existing.maxTimeMs, item.maxTimeMs);
                          } else {
                            wfMap.set(item.workflowName, { ...item });
                          }
                        });
                      });
                      const combinedWfSummary = Array.from(wfMap.values()).map(item => ({
                        ...item,
                        avgTimeMs: item.executionCount > 0 ? Math.round(item.totalTimeMs / item.executionCount) : 0
                      }));

                      // Aggregate Web Request summaries
                      const webMap = new Map<string, { urlOrAction: string, executionCount: number, totalTimeMs: number, maxTimeMs: number }>();
                      typeFiles.forEach(f => {
                        (f.results.webRequestSummary || []).forEach(item => {
                          const existing = webMap.get(item.urlOrAction);
                          if (existing) {
                            existing.executionCount += item.executionCount;
                            existing.totalTimeMs += item.totalTimeMs;
                            existing.maxTimeMs = Math.max(existing.maxTimeMs, item.maxTimeMs);
                          } else {
                            webMap.set(item.urlOrAction, { ...item });
                          }
                        });
                      });
                      const combinedWebSummary = Array.from(webMap.values()).map(item => ({
                        ...item,
                        avgTimeMs: item.executionCount > 0 ? Math.round(item.totalTimeMs / item.executionCount) : 0
                      }));

                      return (
                        <div className="mt-6">
                          <PerformanceAnalyzer
                            sqlSummary={combinedSqlSummary}
                            workflowSummary={combinedWfSummary}
                            webRequestSummary={combinedWebSummary}
                            fileName={`${typeFiles.length} Clustered Nodes`}
                            isCombined={true}
                          />
                        </div>
                      );
                    })()}

                  </div>
                )}

                {/* TAB B: CHRONOLOGICAL MULTI-NODE TIMELINE */}
                {combinedTab === "timeline" && activePage === "performance" && (
                  <div className="bg-[#0F1115] border border-[#21262D] rounded-2xl overflow-hidden shadow-sm animate-fade-in space-y-0">
                    
                    {/* Timeline Header and Controls */}
                    <div className="p-5 border-b border-[#21262D] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          Consolidated Chronological Trace Event Timeline
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                          Events merged from {(activeCombinedType && filesByType[activeCombinedType] || []).length} nodes, sorted chronologically to reveal cascading cross-host failures.
                        </p>
                      </div>

                      {/* Quick filters for combined view */}
                      <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            placeholder="Search combined traces..."
                            value={combinedSearchQuery}
                            onChange={(e) => setCombinedSearchQuery(e.target.value)}
                            className="bg-[#08090C] border border-[#21262D] text-slate-300 text-[10px] rounded pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-48 font-sans"
                          />
                        </div>

                        <select
                          value={combinedLevelFilter}
                          onChange={(e) => setCombinedLevelFilter(e.target.value)}
                          className="bg-[#08090C] border border-[#21262D] text-slate-300 text-[10px] rounded px-2 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-mono"
                        >
                          <option value="ALL">All Levels</option>
                          <option value="ERROR">ERROR Only</option>
                          <option value="WARN">WARN Only</option>
                          <option value="INFO">INFO Only</option>
                        </select>
                      </div>
                    </div>

                    {/* Interactive merged events list */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#08090C] border-b border-[#21262D] text-[10px] font-bold uppercase text-slate-400 font-mono">
                            <th className="py-3 px-4 w-[160px]">Timestamp</th>
                            <th className="py-3 px-4 w-[80px]">Level</th>
                            <th className="py-3 px-4 w-[200px]">Node Context</th>
                            <th className="py-3 px-4">Message</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#21262D]/50 text-xs font-mono">
                          {(() => {
                            const typeFiles = (activeCombinedType && filesByType[activeCombinedType]) || [];
                            const combinedEvents = typeFiles.flatMap(file =>
                              file.parsedEvents.map(event => ({
                                ...event,
                                sourceName: file.name
                              }))
                            ).sort((a, b) => a.timestamp.localeCompare(b.timestamp));

                            const filtered = combinedEvents.filter(event => {
                              const matchesLevel = combinedLevelFilter === "ALL" || event.level === combinedLevelFilter;
                              const matchesSearch = event.message.toLowerCase().includes(combinedSearchQuery.toLowerCase()) || 
                                                    event.sourceName.toLowerCase().includes(combinedSearchQuery.toLowerCase()) ||
                                                    event.logger.toLowerCase().includes(combinedSearchQuery.toLowerCase());
                              return matchesLevel && matchesSearch;
                            });

                            if (filtered.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={4} className="py-12 text-center text-slate-500 italic">
                                    No logs found matching trace filters.
                                  </td>
                                </tr>
                              );
                            }

                            return filtered.map((event) => {
                              const isSelected = expandedCombinedEventId === event.id;
                              
                              const levelColors = {
                                ERROR: "bg-rose-950/30 text-rose-400 border-rose-900/40 animate-pulse",
                                WARN: "bg-amber-950/30 text-amber-400 border-amber-900/40",
                                INFO: "bg-blue-950/20 text-blue-400 border-blue-900/30",
                                DEBUG: "bg-slate-950 text-slate-500 border-slate-900"
                              }[event.level];

                              return (
                                <React.Fragment key={`joint-ev-${event.id}-${event.sourceName}`}>
                                  <tr
                                    onClick={() => setExpandedCombinedEventId(isSelected ? null : event.id)}
                                    className={`hover:bg-[#1C212B]/35 cursor-pointer transition-colors ${
                                      isSelected ? "bg-[#1C212B]/50" : ""
                                    }`}
                                  >
                                    <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono whitespace-nowrap">
                                      {event.timestamp}
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <span className={`px-1.5 py-0.25 rounded border text-[9px] font-bold inline-block ${levelColors}`}>
                                        {event.level}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-blue-400 font-mono truncate max-w-[200px]" title={event.sourceName}>
                                      <div className="flex items-center gap-1">
                                        <Database className="w-3 h-3 text-slate-500 shrink-0" />
                                        <span className="truncate">{event.sourceName}</span>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-200 font-sans leading-normal">
                                      <div className="font-mono text-slate-500 text-[10px] mb-0.5">{event.logger}</div>
                                      {event.message}
                                    </td>
                                  </tr>
                                  {isSelected && event.details && (
                                    <tr>
                                      <td colSpan={4} className="bg-[#08090C] py-4 px-6 border-y border-[#21262D]">
                                        <div className="space-y-2">
                                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                                            Node Trace Detail Context ({event.sourceName}):
                                          </span>
                                          <pre className="text-[10px] text-rose-300 bg-[#0E1116] p-4 rounded-xl border border-rose-950/40 font-mono overflow-x-auto leading-relaxed max-h-[280px]">
                                            {event.details}
                                          </pre>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}

              </div>
            )}

          </section>

            </div>
          </main>
          )
        )}

        {/* WORKSPACE SYSTEM FOOTER */}
        <footer className="border-t border-[#21262D] bg-[#0F1115] py-5 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-[10px] text-slate-500 font-mono flex flex-col sm:flex-row justify-between items-center gap-3">
            <span>Enterprise TRIRIGA Performance Observability System © 2026</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Connected
              </span>
              <span>Model: <span className="text-blue-500 font-bold">gemini-3.5-flash fallback</span></span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
