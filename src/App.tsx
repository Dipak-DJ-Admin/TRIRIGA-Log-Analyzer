import { useState, useEffect } from "react";
import {
  Activity,
  Sliders,
  Terminal,
  BookOpen,
  Sun,
  Moon,
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
  Info
} from "lucide-react";
import { CopilotAnalysis, ActiveTab, AlertFilter, Recommendation, Anomaly } from "./types";
import { sampleScenarios, LogScenario } from "./sampleLogs";
import TelemetryChart from "./components/TelemetryChart";
import MetricCard from "./components/MetricCard";
import { parseLogsLocally } from "./utils/logParser";

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("Dashboard");
  const [selectedScenario, setSelectedScenario] = useState<LogScenario>(sampleScenarios[1]); // Default to JVM Leak
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  
  // Log Analyzer manual states
  const [manualLogText, setManualLogText] = useState<string>(sampleScenarios[1].logText);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<CopilotAnalysis | null>(null);
  const [alertFilter, setAlertFilter] = useState<AlertFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Loading process visual messages
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  // Trigger analysis on scenario change or manual upload
  const handleAnalyzeLogs = async (logToAnalyze: string, scenarioName: string) => {
    setIsAnalyzing(true);
    setLoadingMessage("Initializing IBM TRIRIGA Copilot Engine...");
    
    // Simulate reassuring incremental messages
    const timers = [
      setTimeout(() => setLoadingMessage("Acquiring connection metrics & system state..."), 500),
      setTimeout(() => setLoadingMessage("Evaluating Cache Miss margins & Heap memory leaks..."), 1100),
    ];

    try {
      // Simulate a brief local parsing delay for realistic analyzer feedback
      await new Promise((resolve) => setTimeout(resolve, 1600));
      const data = parseLogsLocally(logToAnalyze, scenarioName);
      setAnalysisResult(data);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      timers.forEach(clearTimeout);
      setIsAnalyzing(false);
    }
  };

  // Run initial analysis on mount
  useEffect(() => {
    handleAnalyzeLogs(selectedScenario.logText, selectedScenario.name);
  }, [selectedScenario]);

  // Handle scenario switch
  const handleScenarioSelect = (scenario: LogScenario) => {
    setSelectedScenario(scenario);
    setManualLogText(scenario.logText);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(text);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  // Calculate overall platform health score
  const getHealthScore = (): number => {
    if (!analysisResult) return 100;
    const { status, metrics } = analysisResult;
    if (status === "Healthy") return 98;
    
    let score = 90;
    if (metrics.cpuMax > 80) score -= 30;
    if (metrics.memoryLeakRisk === "High") score -= 35;
    if (metrics.cacheMissRatio > 15) score -= 15;
    if (metrics.workflowFailureRate > 2) score -= 15;
    return Math.max(8, score);
  };

  // Filter alerts based on filter tab and search
  const filteredAnomalies = (): Anomaly[] => {
    if (!analysisResult) return [];
    return analysisResult.detectedAnomalies.filter(anomaly => {
      const matchesFilter = alertFilter === "ALL" || anomaly.severity === alertFilter;
      const matchesSearch = anomaly.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            anomaly.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const healthScore = getHealthScore();

  return (
    <div id="root-theme-container" className="dark">
      <div className="min-h-screen bg-[#0A0B0E] text-slate-300 font-sans transition-colors duration-300">
        
        {/* Header Section */}
        <header id="app-header" className="bg-[#161B22] border-b border-[#30363D] sticky top-0 z-50 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div id="brand-logo" className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
                T
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 id="brand-title" className="text-base font-bold text-white tracking-tight">
                    IBM TRIRIGA Copilot
                  </h1>
                  <span className="text-[10px] font-bold bg-[#30363D] text-blue-400 px-2 py-0.5 rounded border border-[#30363D] font-mono">
                    ENTERPRISE v4.8
                  </span>
                </div>
                <p id="brand-subtitle" className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  Performance Diagnostics & Platform Observability
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav id="nav-tabs" className="hidden lg:flex items-center bg-[#0A0B0E] p-1 rounded-xl border border-[#30363D]">
              <button
                id="tab-dashboard"
                onClick={() => setActiveTab("Dashboard")}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "Dashboard"
                    ? "bg-[#30363D] text-white shadow-sm border border-[#30363D]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Live Dashboard
              </button>
              <button
                id="tab-analyzer"
                onClick={() => setActiveTab("LogAnalyzer")}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "LogAnalyzer"
                    ? "bg-[#30363D] text-white shadow-sm border border-[#30363D]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Custom Log Analyzer
              </button>
              <button
                id="tab-bestpractices"
                onClick={() => setActiveTab("TRIRIGABestPractices")}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "TRIRIGABestPractices"
                    ? "bg-[#30363D] text-white shadow-sm border border-[#30363D]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Tuning Reference
              </button>
            </nav>

            {/* Right Header Actions matching Elegant Dark */}
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Primary Instance</span>
                <span className="text-xs text-blue-400 font-bold">tririga-prod-us-east-01</span>
              </div>
              <div className="hidden sm:block h-10 w-[1px] bg-[#30363D]"></div>
              {analysisResult && (
                <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 border text-[11px] font-bold ${
                  analysisResult.status === "Critical"
                    ? "bg-red-950/30 border-red-500/50 text-red-400"
                    : analysisResult.status === "Degraded"
                    ? "bg-amber-950/30 border-amber-500/50 text-amber-400"
                    : "bg-emerald-950/30 border-emerald-500/50 text-emerald-400"
                }`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    analysisResult.status === "Critical"
                      ? "bg-red-500"
                      : analysisResult.status === "Degraded"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}></div>
                  <span>{
                    analysisResult.status === "Critical"
                      ? "CRITICAL ANOMALY DETECTED"
                      : analysisResult.status === "Degraded"
                      ? "SYSTEM DEGRADED"
                      : "PLATFORM HEALTHY"
                  }</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Sticky Panel */}
        <div className="md:hidden bg-[#161B22] border-b border-[#30363D] py-3.5 px-4 flex justify-around sticky top-18 z-40 shadow-sm">
          <button
            id="mobile-tab-dash"
            onClick={() => setActiveTab("Dashboard")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === "Dashboard" ? "text-blue-400" : "text-slate-500"
            }`}
          >
            <Sliders className="w-4 h-4" />
            Dashboard
          </button>
          <button
            id="mobile-tab-analyzer"
            onClick={() => setActiveTab("LogAnalyzer")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === "LogAnalyzer" ? "text-blue-400" : "text-slate-500"
            }`}
          >
            <Terminal className="w-4 h-4" />
            Analyzer
          </button>
          <button
            id="mobile-tab-practices"
            onClick={() => setActiveTab("TRIRIGABestPractices")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === "TRIRIGABestPractices" ? "text-blue-400" : "text-slate-500"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Best Practices
          </button>
        </div>

        {/* Scenario Selection Rail */}
        <div className="bg-[#161B22]/40 border-b border-[#30363D]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                Select Diagnostic Scenario Preset:
              </span>
              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                {sampleScenarios.map((scenario) => {
                  const isActive = selectedScenario.id === scenario.id;

                  return (
                    <button
                      key={scenario.id}
                      id={`scenario-${scenario.id}`}
                      onClick={() => handleScenarioSelect(scenario)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? "bg-blue-600 border-blue-600 text-white shadow-md"
                          : `bg-[#161B22] border-[#30363D] hover:bg-[#30363D] text-slate-300`
                      }`}
                    >
                      {scenario.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isAnalyzing && (
          <div id="loading-overlay" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
            <div className="bg-[#161B22] border border-[#30363D] max-w-sm w-full rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <h3 className="text-white font-bold mb-2">Analyzing Platform Logs</h3>
              <p className="text-xs text-slate-400 font-mono min-h-6 transition-all">
                {loadingMessage}
              </p>
            </div>
          </div>
        )}

        {/* Main Workspace Frame */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === "Dashboard" && analysisResult && (
            <div id="tab-dashboard-view" className="space-y-8 animate-fade-in">
              
              {/* Executive Summary Section */}
              <section id="executive-summary" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Health Score Gauge */}
                <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#0A0B0E] px-2.5 py-1 rounded border border-[#30363D] text-[10px] font-mono text-slate-500">
                    <Activity className="w-3 h-3 text-blue-500" />
                    Overall Health Score
                  </div>

                  {/* SVG Health Ring Gauge */}
                  <div className="relative w-40 h-40 mt-4 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        className="stroke-[#30363D]"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        className={`transition-all duration-1000 ease-out ${
                          healthScore > 80 
                            ? "stroke-emerald-500" 
                            : healthScore > 40 
                            ? "stroke-amber-500" 
                            : "stroke-rose-500"
                        }`}
                        strokeWidth="8"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * healthScore) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
                        {healthScore}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                        Rating
                      </span>
                    </div>
                  </div>

                  {/* Rating Description */}
                  <div className="mt-4 text-center w-full">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold ${
                      analysisResult.status === "Healthy"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : analysisResult.status === "Degraded"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}>
                      {analysisResult.status === "Healthy" && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {analysisResult.status === "Degraded" && <AlertTriangle className="w-3.5 h-3.5" />}
                      {analysisResult.status === "Critical" && <XCircle className="w-3.5 h-3.5" />}
                      PLATFORM STATUS: {analysisResult.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* AI Executive Summary Block */}
                <div className="lg:col-span-2 bg-[#161B22] border border-[#30363D] p-6 rounded-2xl shadow-sm flex flex-col justify-between relative">
                  
                  {/* AI badge indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-[#0A0B0E] border border-blue-500/30 text-[10px] font-bold text-blue-400 rounded font-mono">
                    <Sparkles className="w-3 h-3 animate-spin" />
                    {analysisResult.isAI ? "GEMINI AI ANALYSIS" : "COPILOT DETERMINISTIC ENGINE"}
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-tight mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-500" />
                      Executive Summary & Health Analysis
                    </h2>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans">
                      {analysisResult.executiveSummary}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#30363D] flex flex-wrap justify-between items-center text-xs text-slate-500 gap-2">
                    <div>
                      <span>Server Context: </span>
                      <span className="font-bold font-mono text-slate-400">ServerNode01 (Production)</span>
                    </div>
                    <div className="font-mono text-[10px]">
                      Average Execution Latency: <span className="font-bold text-blue-400">{analysisResult.metrics.avgResponseTimeMs}ms</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Technical breakdown Metrics Row */}
              <section id="metrics-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Sustained Max CPU"
                  value={`${analysisResult.metrics.cpuMax}%`}
                  subtext="WebContainer Threads"
                  metricType="cpu"
                  metrics={analysisResult.metrics}
                />
                <MetricCard
                  title="JVM Heap Trend"
                  value={analysisResult.metrics.memoryTrend}
                  subtext={`Risk: ${analysisResult.metrics.memoryLeakRisk}`}
                  metricType="memory"
                  metrics={analysisResult.metrics}
                />
                <MetricCard
                  title="Cache Miss Ratio"
                  value={`${analysisResult.metrics.cacheMissRatio.toFixed(1)}%`}
                  subtext="Object/GUI Cache"
                  metricType="cache"
                  metrics={analysisResult.metrics}
                />
                <MetricCard
                  title="WF Failure Rate"
                  value={`${analysisResult.metrics.workflowFailureRate.toFixed(1)}%`}
                  subtext={`${analysisResult.metrics.totalWorkflowsFailed}/${analysisResult.metrics.totalWorkflowsProcessed} failed`}
                  metricType="workflow"
                  metrics={analysisResult.metrics}
                />
              </section>

              {/* Dynamic Telemetry Graphs Section */}
              <section id="telemetry-graphs">
                <TelemetryChart 
                  metrics={analysisResult.metrics} 
                  scenarioId={selectedScenario.id}
                />
              </section>

              {/* Bottom Diagnostics Grid: RCA, Alerts Feed, and Recommendations */}
              <section id="diagnostics-workspace" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left: Alerts, Anomalies, and Rules Feed */}
                <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white uppercase tracking-tight">
                        Anomalies & Alerts
                      </h3>
                      <p className="text-xs text-slate-500">
                        Real-time active alert monitors
                      </p>
                    </div>
                    {/* Alert Filter Selectors */}
                    <select
                      id="alert-filter-dropdown"
                      value={alertFilter}
                      onChange={(e) => setAlertFilter(e.target.value as AlertFilter)}
                      className="bg-[#0A0B0E] border border-[#30363D] text-slate-300 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="ALL">All Alerts</option>
                      <option value="Critical">Critical</option>
                      <option value="Warning">Warning</option>
                      <option value="Info">Info</option>
                    </select>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      id="alert-search"
                      type="text"
                      placeholder="Search alerts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#0A0B0E] border border-[#30363D] text-slate-300 text-xs rounded pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Alerts Feed */}
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {filteredAnomalies().length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-[#30363D] rounded-xl">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-medium">No alerts matching filter criteria</p>
                      </div>
                    ) : (
                      filteredAnomalies().map((anomaly, idx) => {
                        const alertStyles = {
                          Critical: "bg-red-950/20 border-red-900/50 text-red-400",
                          Warning: "bg-amber-950/20 border-amber-900/50 text-amber-400",
                          Info: "bg-blue-950/20 border-blue-900/50 text-blue-400"
                        }[anomaly.severity];

                        return (
                          <div 
                            key={`alert-${idx}`}
                            id={`anomaly-item-${idx}`}
                            className={`p-3.5 border rounded-xl space-y-1.5 transition-all hover:-translate-y-0.5 ${alertStyles}`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-xs tracking-tight">{anomaly.title}</span>
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-current">
                                {anomaly.severity}
                              </span>
                            </div>
                            <p className="text-xs opacity-90 leading-relaxed font-sans">{anomaly.description}</p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Standard Threshold Alerts List Reference Card */}
                  <div className="bg-[#0A0B0E] border border-[#30363D] p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Active Observability Threshold Config
                    </span>
                    <ul className="space-y-1.5 text-[11px] text-slate-500 font-mono">
                      <li className="flex justify-between">
                        <span>CPU Spike alert:</span>
                        <span className="font-bold text-slate-400">&gt; 80%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>JVM Memory Leak alert:</span>
                        <span className="font-bold text-slate-400">Heap Staircase</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Cache Miss Storm:</span>
                        <span className="font-bold text-slate-400">&gt; 15%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>WF Fail operational alert:</span>
                        <span className="font-bold text-slate-400">&gt; 2%</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Right: RCA & Actionable Recommendations (Take 2 Columns) */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Markdown RCA Card */}
                  <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl shadow-sm">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                      <Code className="w-4.5 h-4.5 text-blue-500" />
                      Root Cause Analysis (RCA) Detail
                    </h3>
                    <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-3 font-sans text-slate-300">
                      {/* Simple custom markdown renderer to render bold points and blocks cleanly without extra library crashes */}
                      {analysisResult.rca.split("\n\n").map((block, bIdx) => {
                        if (block.startsWith("###")) {
                          return (
                            <h4 key={`rca-h-${bIdx}`} className="text-xs font-bold text-slate-200 mt-4 mb-2 uppercase tracking-wide">
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
                        return <p key={`rca-p-${bIdx}`} className="text-slate-300 leading-relaxed">{block}</p>;
                      })}
                    </div>
                  </div>

                  {/* Recommendations with Code Copy Snippets */}
                  <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl shadow-sm space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-white uppercase tracking-tight">
                        Actionable Tuning Recommendations
                      </h3>
                      <p className="text-xs text-slate-500">
                        Remedies, SQL optimizations, and property changes generated by Copilot
                      </p>
                    </div>

                    <div className="space-y-4">
                      {analysisResult.recommendations.map((recommendation, idx) => (
                        <div 
                          key={`rec-${idx}`}
                          id={`rec-card-${idx}`}
                          className="bg-[#0A0B0E] border border-[#30363D] p-5 rounded-xl space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <span className="font-bold text-xs text-white">
                              {recommendation.title}
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              recommendation.category === "Property Edit"
                                ? "bg-blue-950/40 text-blue-400 border border-blue-900/50"
                                : recommendation.category === "DB Query"
                                ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
                                : "bg-purple-950/40 text-purple-400 border border-purple-900/50"
                            }`}>
                              {recommendation.category}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            {recommendation.description}
                          </p>

                          {recommendation.codeSnippet && (
                            <div className="relative group">
                              <pre className="text-[11px] bg-[#111827] text-slate-300 rounded-lg p-3.5 font-mono overflow-x-auto border border-[#30363D] max-h-48">
                                {recommendation.codeSnippet}
                              </pre>
                              <button
                                onClick={() => handleCopyText(recommendation.codeSnippet || "")}
                                className="absolute right-2.5 top-2.5 p-1.5 bg-[#161B22] hover:bg-[#30363D] border border-[#30363D] text-slate-400 hover:text-white rounded transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                                title="Copy configuration snippet"
                              >
                                {copiedSnippet === recommendation.codeSnippet ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </section>

            </div>
          )}

          {/* TAB 2: CUSTOM LOG ANALYZER VIEW */}
          {activeTab === "LogAnalyzer" && (
            <div id="tab-analyzer-view" className="space-y-8 animate-fade-in">
              <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-blue-950/40 text-blue-400 rounded-xl border border-blue-900/50">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Enterprise IBM TRIRIGA Log Analyzer
                    </h2>
                    <p className="text-xs text-slate-500">
                      Paste server.log, security.log, gc.log, or sql.log directly to run full root-cause evaluation.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400">Log Text Area</span>
                    <button
                      onClick={() => setManualLogText("")}
                      className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      Clear Log Output
                    </button>
                  </div>
                  
                  <textarea
                    id="log-textarea"
                    rows={12}
                    value={manualLogText}
                    onChange={(e) => setManualLogText(e.target.value)}
                    placeholder="2026-07-12 10:15:33,124 INFO [com.tririga.platform.performance.ThreadMonitor] CPU Utilization sustained..."
                    className="w-full bg-[#0A0B0E] text-slate-300 rounded-xl p-4 font-mono text-xs border border-[#30363D] focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                  />

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      We leverage advanced AI models to diagnose garbage collection parameters, locking conflicts, and database scans.
                    </span>
                    <button
                      id="trigger-analysis-btn"
                      onClick={() => {
                        handleAnalyzeLogs(manualLogText, "Manual log upload");
                        setActiveTab("Dashboard");
                      }}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-blue-900/20 flex items-center gap-2 cursor-pointer transition-all self-end"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Run Diagnostic Analysis
                    </button>
                  </div>
                </div>
              </div>

              {/* Sample Logs Cheat Sheet */}
              <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-semibold text-white uppercase tracking-tight mb-3">Diagnostic Cheatsheet</h3>
                <p className="text-xs text-slate-500 mb-4">
                  These common parameters are recognized by the TRIRIGA Copilot to trigger alerting states:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3.5 bg-[#0A0B0E] border border-[#30363D] rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">CPU SPIKE</span>
                    <span className="text-white">"Sustained CPU at 88%"</span>
                    <p className="text-[10px] text-slate-500">Trigger: CPU sustained above 80% limit</p>
                  </div>
                  <div className="p-3.5 bg-[#0A0B0E] border border-[#30363D] rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">JVM MEMORY LEAK</span>
                    <span className="text-white">"java.lang.OutOfMemoryError"</span>
                    <p className="text-[10px] text-slate-500">Trigger: JVM Heap not recovering after Full GC</p>
                  </div>
                  <div className="p-3.5 bg-[#0A0B0E] border border-[#30363D] rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">CACHE STORM</span>
                    <span className="text-white">"Cache Miss Ratio: 27.32%"</span>
                    <p className="text-[10px] text-slate-500">Trigger: Cache Miss Ratio &gt; 15.0%</p>
                  </div>
                  <div className="p-3.5 bg-[#0A0B0E] border border-[#30363D] rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">WORKFLOW LOCK</span>
                    <span className="text-white">"StateTransitionException"</span>
                    <p className="text-[10px] text-slate-500">Trigger: Asynchronous process failure &gt; 2.0%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRIRIGA BEST PRACTICES & REFERENCE VIEW */}
          {activeTab === "TRIRIGABestPractices" && (
            <div id="tab-practices-view" className="space-y-8 animate-fade-in">
              
              <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-blue-950/40 text-blue-400 rounded-xl border border-blue-900/50">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      IBM TRIRIGA Tuning & Observability Reference
                    </h2>
                    <p className="text-xs text-slate-500">
                      Standard industry best practices to prevent database lock contention and optimize WebSphere JVMs.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {/* Item 1 */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                      1. JVM Garbage Collection Configuration
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      By default, TRIRIGA application servers should utilize the Garbage First Garbage Collector (G1GC) rather than ParallelGC. This avoids prolonged, stop-the-world pauses that cascade into connection pool timeouts.
                    </p>
                    <div className="relative">
                      <pre className="text-[11px] bg-[#111827] text-slate-300 rounded-lg p-3.5 font-mono overflow-x-auto border border-[#30363D]">
{`-Xmx8g -Xms8g -XX:+UseG1GC 
-XX:MaxGCPauseMillis=200 
-XX:InitiatingHeapOccupancyPercent=45`}
                      </pre>
                      <button
                        onClick={() => handleCopyText("-Xmx8g -Xms8g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:InitiatingHeapOccupancyPercent=45")}
                        className="absolute right-2 top-2 p-1.5 bg-[#161B22] border border-[#30363D] text-slate-400 hover:text-white rounded transition-all cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                      2. Object Cache Configuration (custom.properties)
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      If the Object Cache size is too small, TRIRIGA continually evicts elements to load new record metadata. Ensure limits are scaled for enterprise portfolios (classifications and forms).
                    </p>
                    <div className="relative">
                      <pre className="text-[11px] bg-[#111827] text-slate-300 rounded-lg p-3.5 font-mono overflow-x-auto border border-[#30363D]">
{`# custom.properties
OBJECT_CACHE_SIZE_LIMIT=100000
GUI_CACHE_SIZE_LIMIT=15000
METADATA_CACHE_SIZE_LIMIT=50000`}
                      </pre>
                      <button
                        onClick={() => handleCopyText("OBJECT_CACHE_SIZE_LIMIT=100000\nGUI_CACHE_SIZE_LIMIT=15000\nMETADATA_CACHE_SIZE_LIMIT=50000")}
                        className="absolute right-2 top-2 p-1.5 bg-[#161B22] border border-[#30363D] text-slate-400 hover:text-white rounded transition-all cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                      3. Compound Database Indexing (PostgreSQL/Oracle)
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Table scans on transaction tables like <code className="font-mono text-blue-400">T_SPACE</code> or <code className="font-mono text-blue-400">T_WORK_ORDER</code> consume excessive CPU. Implement compound keys to accelerate lease/space workflows.
                    </p>
                    <div className="relative">
                      <pre className="text-[11px] bg-[#111827] text-slate-300 rounded-lg p-3.5 font-mono overflow-x-auto border border-[#30363D]">
{`-- Speed up Space allocation lookups
CREATE INDEX IX_T_SPACE_ALLOCATION 
ON T_SPACE (triSpaceTypeTX, parent_id) 
WHERE triSpaceTypeTX IS NOT NULL;`}
                      </pre>
                      <button
                        onClick={() => handleCopyText("CREATE INDEX IX_T_SPACE_ALLOCATION ON T_SPACE (triSpaceTypeTX, parent_id) WHERE triSpaceTypeTX IS NOT NULL;")}
                        className="absolute right-2 top-2 p-1.5 bg-[#161B22] border border-[#30363D] text-slate-400 hover:text-white rounded transition-all cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                      4. Workflow Lock contention Remediation
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Avoid running parallel asynchronous workflows on overlapping business objects. Check for stale locks in the workflow event queue using database state indicators.
                    </p>
                    <div className="relative">
                      <pre className="text-[11px] bg-[#111827] text-slate-300 rounded-lg p-3.5 font-mono overflow-x-auto border border-[#30363D]">
{`SELECT EVENT_ID, EVENT_NAME, WF_STATUS 
FROM WF_EVENT_HISTORY 
WHERE WF_STATUS = 'LOCKED' 
ORDER BY CREATED_DATE DESC;`}
                      </pre>
                      <button
                        onClick={() => handleCopyText("SELECT EVENT_ID, EVENT_NAME, WF_STATUS FROM WF_EVENT_HISTORY WHERE WF_STATUS = 'LOCKED' ORDER BY CREATED_DATE DESC;")}
                        className="absolute right-2 top-2 p-1.5 bg-[#161B22] border border-[#30363D] text-slate-400 hover:text-white rounded transition-all cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>

        {/* Workspace Footer */}
        <footer className="border-t border-[#30363D] bg-[#161B22] py-6 transition-colors">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row justify-between items-center gap-3">
            <span>Enterprise TRIRIGA Observability & Performance Copilot © 2026</span>
            <div className="flex gap-4">
              <span>Status: <span className="text-emerald-500 font-bold">● Connected</span></span>
              <span>Gemini Model: <span className="text-blue-400 font-bold">gemini-2.5-flash</span></span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
