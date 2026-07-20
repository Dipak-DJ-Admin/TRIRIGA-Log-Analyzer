import React, { useState, useMemo } from "react";
import {
  Database,
  Activity,
  Globe,
  Search,
  ArrowUpDown,
  Cpu,
  Clock,
  Info,
  Sparkles,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { SqlExecution, WorkflowExecution, WebRequestExecution } from "../types";

interface PerformanceAnalyzerProps {
  sqlSummary?: SqlExecution[];
  workflowSummary?: WorkflowExecution[];
  webRequestSummary?: WebRequestExecution[];
  fileName: string;
  isCombined?: boolean;
}

export default function PerformanceAnalyzer({
  sqlSummary = [],
  workflowSummary = [],
  webRequestSummary = [],
  fileName,
  isCombined = false
}: PerformanceAnalyzerProps) {
  const [subTab, setSubTab] = useState<"sql" | "workflow" | "web">("sql");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("totalTimeMs");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Sorting helper
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filter and sort SQL executions
  const sortedSql = useMemo(() => {
    const filtered = sqlSummary.filter(item =>
      item.sqlText.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.sort((a: any, b: any) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      if (typeof aVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [sqlSummary, searchQuery, sortField, sortDirection]);

  // Filter and sort Workflow executions
  const sortedWorkflows = useMemo(() => {
    const filtered = workflowSummary.filter(item =>
      item.workflowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.objectType.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.sort((a: any, b: any) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      if (typeof aVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [workflowSummary, searchQuery, sortField, sortDirection]);

  // Filter and sort Web Request executions
  const sortedWebRequests = useMemo(() => {
    const filtered = webRequestSummary.filter(item =>
      item.urlOrAction.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.sort((a: any, b: any) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      if (typeof aVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [webRequestSummary, searchQuery, sortField, sortDirection]);

  // Totals for percent calculations
  const totalSqlTime = useMemo(() => sqlSummary.reduce((sum, item) => sum + item.totalTimeMs, 0), [sqlSummary]);
  const totalWorkflowTime = useMemo(() => workflowSummary.reduce((sum, item) => sum + item.totalTimeMs, 0), [workflowSummary]);
  const totalWebTime = useMemo(() => webRequestSummary.reduce((sum, item) => sum + item.totalTimeMs, 0), [webRequestSummary]);

  const maxTotalTime = useMemo(() => {
    if (subTab === "sql") return Math.max(...sqlSummary.map(i => i.totalTimeMs), 1);
    if (subTab === "workflow") return Math.max(...workflowSummary.map(i => i.totalTimeMs), 1);
    return Math.max(...webRequestSummary.map(i => i.totalTimeMs), 1);
  }, [subTab, sqlSummary, workflowSummary, webRequestSummary]);

  return (
    <div className="bg-[#0F1115] border border-[#21262D] rounded-2xl p-6 space-y-6 shadow-xl text-slate-200">
      
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#21262D] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              {isCombined ? "COMBINED LOG ANALYZER" : "PERFORMANCE RUN REPORT"}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Source: {fileName}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            IBM TRIRIGA Performance Analyzer Output
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Detailed call stack extraction. Review SQL queries, workflow execution engines, and web page loads.
          </p>
        </div>

        {/* Sub-tabs buttons */}
        <div className="flex bg-[#161B22] p-1 rounded-lg border border-[#30363D] self-stretch lg:self-auto justify-between sm:justify-start gap-1">
          <button
            onClick={() => { setSubTab("sql"); setSortField("totalTimeMs"); setSelectedItem(null); }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === "sql"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            SQL Summary ({sqlSummary.length})
          </button>
          <button
            onClick={() => { setSubTab("workflow"); setSortField("totalTimeMs"); setSelectedItem(null); }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === "workflow"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Workflows ({workflowSummary.length})
          </button>
          <button
            onClick={() => { setSubTab("web"); setSortField("totalTimeMs"); setSelectedItem(null); }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === "web"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Web/HTTP ({webRequestSummary.length})
          </button>
        </div>
      </div>

      {/* Stats row inside the Analyzer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#161B22] border border-[#30363D] p-4 rounded-xl">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
            Total Extracted SQL Time
          </span>
          <p className="text-xl font-black font-mono text-indigo-400">
            {(totalSqlTime / 1000).toFixed(2)}s
          </p>
          <p className="text-[10px] text-slate-400">
            Across {sqlSummary.reduce((sum, i) => sum + i.executionCount, 0).toLocaleString()} statements
          </p>
        </div>
        <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-[#30363D] pt-3 sm:pt-0 sm:pl-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
            Total Workflow Time
          </span>
          <p className="text-xl font-black font-mono text-emerald-400">
            {(totalWorkflowTime / 1000).toFixed(2)}s
          </p>
          <p className="text-[10px] text-slate-400">
            Across {workflowSummary.reduce((sum, i) => sum + i.executionCount, 0).toLocaleString()} workflow threads
          </p>
        </div>
        <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-[#30363D] pt-3 sm:pt-0 sm:pl-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
            Total Web Response Time
          </span>
          <p className="text-xl font-black font-mono text-blue-400">
            {(totalWebTime / 1000).toFixed(2)}s
          </p>
          <p className="text-[10px] text-slate-400">
            Across {webRequestSummary.reduce((sum, i) => sum + i.executionCount, 0).toLocaleString()} requests
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={
              subTab === "sql"
                ? "Filter SQL by table name (e.g. T_SPACE)..."
                : subTab === "workflow"
                ? "Filter workflows by name or module..."
                : "Filter Web Requests by action URL..."
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#161B22] border border-[#30363D] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#08090C] border border-[#21262D] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-[#21262D] text-slate-400 bg-[#161B22]/50">
                <th className="py-3 px-4 font-bold font-sans">
                  {subTab === "sql" ? "SQL Statement Query" : subTab === "workflow" ? "Workflow Name" : "Request Action URL"}
                </th>
                {subTab === "workflow" && (
                  <th className="py-3 px-4 text-slate-400 font-bold font-sans hidden md:table-cell">Module / Object</th>
                )}
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort("executionCount")}>
                  <div className="flex items-center justify-end gap-1">
                    Count
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort("avgTimeMs")}>
                  <div className="flex items-center justify-end gap-1">
                    Avg Time
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white hidden sm:table-cell" onClick={() => handleSort("maxTimeMs")}>
                  <div className="flex items-center justify-end gap-1">
                    Max Time
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort("totalTimeMs")}>
                  <div className="flex items-center justify-end gap-1">
                    Total Duration
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161B22]">
              {subTab === "sql" && sortedSql.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                    No matching SQL queries found in performance log trace.
                  </td>
                </tr>
              )}
              {subTab === "workflow" && sortedWorkflows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                    No matching workflows found in performance log trace.
                  </td>
                </tr>
              )}
              {subTab === "web" && sortedWebRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                    No matching web requests found in performance log trace.
                  </td>
                </tr>
              )}

              {/* SQL Rows */}
              {subTab === "sql" && sortedSql.map((item, idx) => {
                const isSelected = selectedItem && selectedItem.sqlText === item.sqlText;
                const weight = (item.totalTimeMs / maxTotalTime) * 100;
                return (
                  <React.Fragment key={`sql-row-${idx}`}>
                    <tr
                      onClick={() => setSelectedItem(isSelected ? null : item)}
                      className={`cursor-pointer hover:bg-indigo-950/20 transition-all ${
                        isSelected ? "bg-indigo-950/35 border-l-2 border-indigo-500" : ""
                      }`}
                    >
                      <td className="py-3 px-4 max-w-xs md:max-w-md lg:max-w-xl truncate text-slate-300 font-sans">
                        <div className="space-y-1">
                          <p className="font-mono text-[11px] leading-relaxed text-indigo-300 select-all truncate">
                            {item.sqlText}
                          </p>
                          <div className="w-full bg-[#161B22] h-1 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full" style={{ width: `${weight}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 font-bold font-mono">
                        {item.executionCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 font-mono">
                        {item.avgTimeMs >= 1000 ? `${(item.avgTimeMs / 1000).toFixed(2)}s` : `${item.avgTimeMs.toLocaleString()}ms`}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono hidden sm:table-cell">
                        {item.maxTimeMs >= 1000 ? `${(item.maxTimeMs / 1000).toFixed(1)}s` : `${item.maxTimeMs.toLocaleString()}ms`}
                      </td>
                      <td className="py-3 px-4 text-right text-indigo-400 font-bold font-mono">
                        {item.totalTimeMs >= 1000 ? `${(item.totalTimeMs / 1000).toFixed(1)}s` : `${item.totalTimeMs.toLocaleString()}ms`}
                      </td>
                    </tr>
                    {isSelected && (
                      <tr className="bg-slate-900/40">
                        <td colSpan={5} className="p-4 border-t border-[#21262D]">
                          <div className="space-y-3 font-sans text-xs">
                            <h4 className="font-bold text-white uppercase tracking-wider text-[10px] text-indigo-400 font-mono">
                              🔍 Extended DB Execution RCA & Tuning
                            </h4>
                            <div className="bg-slate-950 p-3 rounded-lg border border-[#30363D] font-mono text-[11px] whitespace-pre-wrap text-slate-300 select-all overflow-x-auto">
                              {item.sqlText}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                              <div className="space-y-1">
                                <span className="font-bold text-slate-400 block">Performance Impact</span>
                                <p className="text-slate-300 leading-relaxed text-[11px]">
                                  This query is responsible for <strong className="text-white">{(item.totalTimeMs / totalSqlTime * 100).toFixed(1)}%</strong> of overall database execution overhead. Slow average time of <strong className="text-rose-400">{item.avgTimeMs.toLocaleString()}ms</strong> indicates a sequence or nested table scan.
                                </p>
                              </div>
                              <div className="bg-indigo-950/20 border border-indigo-900/30 p-3 rounded-lg flex gap-2">
                                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                <div className="space-y-1 text-[11px]">
                                  <span className="font-bold text-indigo-300 block">DBA Recommendation</span>
                                  <p className="text-indigo-400 leading-relaxed font-mono">
                                    {item.sqlText.includes("T_SPACE") 
                                      ? "CREATE INDEX IDX_SPACE_CLASS ON T_SPACE (triSpaceTypeTX, parent_id);"
                                      : item.sqlText.includes("WF_EVENT_HISTORY")
                                      ? "CREATE INDEX IDX_WF_EVENT_STATUS ON WF_EVENT_HISTORY (WF_STATUS);"
                                      : "CREATE INDEX IDX_TRIRIGA_QUERY ON T_RECORD_METADATA (spec_template_id);"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Workflow Rows */}
              {subTab === "workflow" && sortedWorkflows.map((item, idx) => {
                const isSelected = selectedItem && selectedItem.workflowName === item.workflowName;
                const weight = (item.totalTimeMs / maxTotalTime) * 100;
                return (
                  <React.Fragment key={`wf-row-${idx}`}>
                    <tr
                      onClick={() => setSelectedItem(isSelected ? null : item)}
                      className={`cursor-pointer hover:bg-emerald-950/10 transition-all ${
                        isSelected ? "bg-emerald-950/20 border-l-2 border-emerald-500" : ""
                      }`}
                    >
                      <td className="py-3 px-4 max-w-xs md:max-w-md truncate text-slate-300 font-sans">
                        <div className="space-y-1">
                          <p className="font-mono text-[11px] leading-relaxed text-emerald-300 font-bold select-all truncate">
                            {item.workflowName}
                          </p>
                          <div className="w-full bg-[#161B22] h-1 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: `${weight}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono hidden md:table-cell">
                        {item.module} / {item.objectType}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 font-bold font-mono">
                        {item.executionCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 font-mono">
                        {item.avgTimeMs >= 1000 ? `${(item.avgTimeMs / 1000).toFixed(2)}s` : `${item.avgTimeMs.toLocaleString()}ms`}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono hidden sm:table-cell">
                        {item.maxTimeMs >= 1000 ? `${(item.maxTimeMs / 1000).toFixed(1)}s` : `${item.maxTimeMs.toLocaleString()}ms`}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-bold font-mono">
                        {item.totalTimeMs >= 1000 ? `${(item.totalTimeMs / 1000).toFixed(1)}s` : `${item.totalTimeMs.toLocaleString()}ms`}
                      </td>
                    </tr>
                    {isSelected && (
                      <tr className="bg-slate-900/40">
                        <td colSpan={6} className="p-4 border-t border-[#21262D]">
                          <div className="space-y-3 font-sans text-xs">
                            <h4 className="font-bold text-white uppercase tracking-wider text-[10px] text-emerald-400 font-mono">
                              ⚡ Workflow Execution Deep-Dive
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-slate-400">
                              <div className="bg-slate-950 p-3 rounded border border-[#21262D] space-y-1">
                                <span className="text-[10px] text-slate-500 font-mono">Workflow Trigger Source</span>
                                <p className="text-slate-300 text-[11px]">
                                  Trigger Module: <strong>{item.module}</strong> | Business Object Target: <strong>{item.objectType}</strong>
                                </p>
                              </div>
                              <div className="bg-slate-950 p-3 rounded border border-[#21262D] space-y-1">
                                <span className="text-[10px] text-slate-500 font-mono">Overall Impact</span>
                                <p className="text-slate-300 text-[11px]">
                                  This workflow accounts for <strong>{(item.totalTimeMs / totalWorkflowTime * 100).toFixed(1)}%</strong> of total system workflow processor runtime.
                                </p>
                              </div>
                            </div>
                            <div className="bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-lg flex gap-2">
                              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <div className="space-y-1 text-[11px]">
                                <span className="font-bold text-emerald-300 block">Performance Tuning Strategy</span>
                                <p className="text-slate-300 leading-relaxed">
                                  {item.workflowName.includes("Bulk") || item.workflowName.includes("Import")
                                    ? "This is a batch transaction. Set Workflow Agent configuration to 'Execute Asynchronously' or allocate dedicated workflow agents to isolate this run from active interactive users."
                                    : "Consider converting 'Formula' tasks inside this workflow to 'Extended Formula' or database-level views to offload evaluation tasks from the JVM thread engines."}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Web Request Rows */}
              {subTab === "web" && sortedWebRequests.map((item, idx) => {
                const isSelected = selectedItem && selectedItem.urlOrAction === item.urlOrAction;
                const weight = (item.totalTimeMs / maxTotalTime) * 100;
                return (
                  <React.Fragment key={`web-row-${idx}`}>
                    <tr
                      onClick={() => setSelectedItem(isSelected ? null : item)}
                      className={`cursor-pointer hover:bg-blue-950/10 transition-all ${
                        isSelected ? "bg-blue-950/20 border-l-2 border-blue-500" : ""
                      }`}
                    >
                      <td className="py-3 px-4 max-w-xs md:max-w-xl truncate text-slate-300 font-sans">
                        <div className="space-y-1">
                          <p className="font-mono text-[11px] leading-relaxed text-blue-300 select-all truncate">
                            {item.urlOrAction}
                          </p>
                          <div className="w-full bg-[#161B22] h-1 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${weight}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 font-bold font-mono">
                        {item.executionCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 font-mono">
                        {item.avgTimeMs >= 1000 ? `${(item.avgTimeMs / 1000).toFixed(2)}s` : `${item.avgTimeMs.toLocaleString()}ms`}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono hidden sm:table-cell">
                        {item.maxTimeMs >= 1000 ? `${(item.maxTimeMs / 1000).toFixed(1)}s` : `${item.maxTimeMs.toLocaleString()}ms`}
                      </td>
                      <td className="py-3 px-4 text-right text-blue-400 font-bold font-mono">
                        {item.totalTimeMs >= 1000 ? `${(item.totalTimeMs / 1000).toFixed(1)}s` : `${item.totalTimeMs.toLocaleString()}ms`}
                      </td>
                    </tr>
                    {isSelected && (
                      <tr className="bg-slate-900/40">
                        <td colSpan={5} className="p-4 border-t border-[#21262D]">
                          <div className="space-y-3 font-sans text-xs">
                            <h4 className="font-bold text-white uppercase tracking-wider text-[10px] text-blue-400 font-mono">
                              🌐 Interactive HTTP Request Analytics
                            </h4>
                            <div className="p-3.5 bg-slate-950 border border-[#21262D] rounded-lg">
                              <div className="flex justify-between text-slate-400 text-[11px] font-mono">
                                <span>Total Latency Overhead:</span>
                                <span className="text-white font-bold">{((item.totalTimeMs / totalWebTime) * 100).toFixed(1)}% of HTTP layer</span>
                              </div>
                            </div>
                            <div className="bg-blue-950/20 border border-blue-900/30 p-3 rounded-lg flex gap-2">
                              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                              <div className="space-y-1 text-[11px]">
                                <span className="font-bold text-blue-300 block">User Experience Impact</span>
                                <p className="text-slate-300 leading-relaxed">
                                  {item.avgTimeMs > 2000 
                                    ? "Critical threshold breach. Average response latency is above 2.0s, which will trigger visible loading spinners and page freezes on TRIRIGA portals. Optimize background queries feeding this endpoint immediately."
                                    : "Healthy portal load speed. Response time is within the standard human-interactive threshold (< 500ms). Keep cache limits tuned to preserve these response levels."}
                                </p>
                              </div>
                            </div>
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
  );
}
