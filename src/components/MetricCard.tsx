import { Cpu, Database, RefreshCw, AlertTriangle, CheckCircle, Flame } from "lucide-react";
import { PlatformMetrics } from "../types";

interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  metricType: "cpu" | "memory" | "cache" | "workflow";
  metrics: PlatformMetrics;
}

export default function MetricCard({ title, value, subtext, metricType, metrics }: MetricCardProps) {
  // Check alerting rules & thresholds based on requirements
  let isAlert = false;
  let severity: "Critical" | "Warning" | "Normal" = "Normal";
  let thresholdText = "";
  let progressPercentage = 0;

  switch (metricType) {
    case "cpu":
      isAlert = metrics.cpuMax !== null && metrics.cpuMax >= 80;
      severity = isAlert ? "Critical" : "Normal";
      thresholdText = "Limit: 80.0%";
      progressPercentage = metrics.cpuMax !== null ? metrics.cpuMax : 0;
      break;
    case "memory":
      isAlert = metrics.memoryLeakRisk === "High";
      severity = isAlert ? "Critical" : metrics.memoryLeakRisk === "Medium" ? "Warning" : "Normal";
      thresholdText = "Leak Risk Limit: Med";
      progressPercentage = metrics.memoryLeakRisk === "High" ? 95 : metrics.memoryLeakRisk === "Medium" ? 60 : metrics.memoryLeakRisk === "Unknown" ? 0 : 25;
      break;
    case "cache":
      isAlert = metrics.cacheMissRatio !== null && metrics.cacheMissRatio > 15;
      severity = isAlert ? "Warning" : "Normal";
      thresholdText = "Warning Limit: 15.0%";
      progressPercentage = metrics.cacheMissRatio !== null ? (metrics.cacheMissRatio / 40) * 100 : 0; // Scaled to 40% max for visual bar
      break;
    case "workflow":
      isAlert = metrics.workflowFailureRate !== null && metrics.workflowFailureRate > 2;
      severity = isAlert ? "Warning" : "Normal";
      thresholdText = "Error Limit: 2.0%";
      progressPercentage = metrics.workflowFailureRate !== null ? (metrics.workflowFailureRate / 10) * 100 : 0; // Scaled to 10% max
      break;
  }

  // Cap progress percentage at 100%
  progressPercentage = Math.min(100, Math.max(0, progressPercentage));

  // Visual classes based on severity
  const severityColors = {
    Critical: {
      border: "border-red-900/50",
      bg: "bg-[#161B22]",
      text: "text-red-400",
      bar: "bg-red-500",
      iconContainer: "bg-red-950/50 text-red-400"
    },
    Warning: {
      border: "border-orange-900/50",
      bg: "bg-[#161B22]",
      text: "text-orange-400",
      bar: "bg-orange-500",
      iconContainer: "bg-orange-950/50 text-orange-400"
    },
    Normal: {
      border: "border-[#30363D]",
      bg: "bg-[#161B22]",
      text: "text-emerald-400",
      bar: "bg-emerald-500",
      iconContainer: "bg-emerald-950/30 text-emerald-400"
    }
  }[severity];

  const renderIcon = () => {
    switch (metricType) {
      case "cpu":
        return <Cpu className="w-5 h-5" />;
      case "memory":
        return <Database className="w-5 h-5" />;
      case "cache":
        return <RefreshCw className="w-5 h-5" />;
      case "workflow":
        return <Flame className="w-5 h-5" />;
    }
  };

  return (
    <div 
      id={`metric-${metricType}`}
      className={`border rounded-xl p-5 ${severityColors.border} ${severityColors.bg} transition-all duration-300 shadow-sm flex flex-col justify-between`}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
            {title}
          </span>
          <span className="text-2xl font-bold font-mono text-white mt-1">
            {value}
          </span>
        </div>
        <div className={`p-2.5 rounded-lg ${severityColors.iconContainer}`}>
          {renderIcon()}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[11px] text-slate-500 mb-1.5 font-mono">
          <span>{subtext}</span>
          <span className={severity !== "Normal" ? severityColors.text : ""}>
            {thresholdText}
          </span>
        </div>
        
        {/* Dynamic Telemetry Status Bar */}
        <div className="w-full bg-[#30363D] h-1 rounded-full overflow-hidden">
          <div 
            className={`h-full ${severityColors.bar} transition-all duration-1000 ease-out`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Threshold Violations Badge */}
      <div className="mt-3.5 pt-3 border-t border-[#30363D] flex items-center gap-1.5">
        {severity === "Critical" ? (
          <>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
              Critical Constraint
            </span>
          </>
        ) : severity === "Warning" ? (
          <>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
              Warning Breach
            </span>
          </>
        ) : (
          <>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
              Operating Optimal
            </span>
          </>
        )}
      </div>
    </div>
  );
}
