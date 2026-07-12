import { useState } from "react";
import { PlatformMetrics } from "../types";

interface TelemetryChartProps {
  metrics: PlatformMetrics;
  scenarioId: string;
}

interface DataPoint {
  time: string;
  cpu: number;
  memory: number; // in MB
  cacheMiss: number;
  workflowFailure: number;
}

export default function TelemetryChart({ metrics, scenarioId }: TelemetryChartProps) {
  const [activeMetric, setActiveMetric] = useState<"cpu" | "memory" | "cacheMiss" | "workflowFailure">("cpu");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate realistic sequential data based on the selected scenario metrics to simulate 10 telemetry intervals
  const generateTelemetryData = (): DataPoint[] => {
    const dataPoints: DataPoint[] = [];
    const baseCpu = metrics.cpuMax;
    const isLeak = metrics.memoryTrend === "Upward";
    const cacheMiss = metrics.cacheMissRatio;
    const wfFailure = metrics.workflowFailureRate;

    // Fixed historical timestamps
    const timestamps = [
      "10:00", "10:10", "10:20", "10:30", "10:40", "10:50", "11:00", "11:10", "11:20", "11:30"
    ];

    for (let i = 0; i < 10; i++) {
      let cpuVal = baseCpu;
      let memVal = 512; // Start from 512MB heap
      let cacheVal = cacheMiss;
      let wfVal = wfFailure;

      // Add controlled variance/trends depending on metrics
      if (scenarioId === "cpu-exhaustion" || baseCpu > 80) {
        // Sustained high CPU spike
        cpuVal = baseCpu - 15 + (i * 3.5) + Math.sin(i) * 3;
        if (cpuVal > 98) cpuVal = 98;
      } else {
        // Normal variable CPU
        cpuVal = baseCpu - 8 + Math.sin(i) * 5 + (i % 2 === 0 ? 3 : -2);
        if (cpuVal < 5) cpuVal = 5;
      }

      if (isLeak) {
        // Classic memory leak escalator pattern
        memVal = 620 + (i * 42) + (i % 2 === 0 ? 15 : -5);
      } else if (scenarioId === "optimal-health") {
        // Sawtooth healthy GC recovery pattern
        memVal = 400 + (i % 3 === 0 ? -120 : (i % 3) * 60) + Math.sin(i) * 15;
      } else {
        // Steady standard heap
        memVal = 550 + Math.sin(i) * 30 + (i * 2);
      }

      if (scenarioId === "cache-miss-storm" || cacheMiss > 15) {
        // High unstable miss rates
        cacheVal = cacheMiss - 5 + Math.cos(i) * 4 + (i * 0.8);
      } else {
        cacheVal = Math.max(0.5, cacheMiss - 1 + Math.sin(i) * 0.8);
      }

      if (scenarioId === "workflow-deadlock" || wfFailure > 2) {
        // Rising failure rates as queue gets locked
        wfVal = Math.max(0.2, wfFailure - 1.5 + (i * 0.4) + Math.sin(i) * 0.5);
      } else {
        wfVal = Math.max(0, wfFailure - 0.2 + Math.cos(i) * 0.1);
      }

      dataPoints.push({
        time: timestamps[i],
        cpu: Math.min(100, Math.max(0, parseFloat(cpuVal.toFixed(1)))),
        memory: Math.min(1024, Math.max(128, Math.round(memVal))),
        cacheMiss: Math.min(100, Math.max(0, parseFloat(cacheVal.toFixed(1)))),
        workflowFailure: Math.min(100, Math.max(0, parseFloat(wfVal.toFixed(1))))
      });
    }

    return dataPoints;
  };

  const chartData = generateTelemetryData();

  // Find dynamic values for chart rendering
  const values = chartData.map(d => {
    if (activeMetric === "cpu") return d.cpu;
    if (activeMetric === "memory") return d.memory;
    if (activeMetric === "cacheMiss") return d.cacheMiss;
    return d.workflowFailure;
  });

  const maxValue = activeMetric === "memory" ? 1024 : 100;
  const threshold = activeMetric === "cpu" ? 80 
                  : activeMetric === "memory" ? 850 
                  : activeMetric === "cacheMiss" ? 15 
                  : 2; // threshold for failure rate

  // SVG parameters
  const width = 600;
  const height = 240;
  const paddingX = 45;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Generate coordinates for SVG polyline/path
  const points = chartData.map((d, index) => {
    const val = activeMetric === "cpu" ? d.cpu 
              : activeMetric === "memory" ? d.memory 
              : activeMetric === "cacheMiss" ? d.cacheMiss 
              : d.workflowFailure;
              
    const x = paddingX + (index / (chartData.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - (val / maxValue) * chartHeight;
    return { x, y, val, time: d.time };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(" ");
  
  // Area path under line
  const areaPoints = [
    `${paddingX},${paddingY + chartHeight}`,
    ...points.map(p => `${p.x},${p.y}`),
    `${paddingX + chartWidth},${paddingY + chartHeight}`
  ].join(" ");

  // Y axis labels (4 steps)
  const yLabels = Array.from({ length: 5 }).map((_, i) => {
    const val = Math.round((maxValue / 4) * i);
    const y = paddingY + chartHeight - (val / maxValue) * chartHeight;
    return { val, y };
  });

  // Threshold line coordinate
  const thresholdY = paddingY + chartHeight - (threshold / maxValue) * chartHeight;

  return (
    <div id="telemetry-chart-container" className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 shadow-sm transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 id="telemetry-title" className="text-sm font-semibold text-slate-200 uppercase tracking-tight">
            Platform Telemetry Graphs (24h)
          </h3>
          <p id="telemetry-sub" className="text-xs text-slate-500">
            Historical timeseries metrics mapped over 10-minute reporting frames
          </p>
        </div>

        {/* Tab Selectors */}
        <div id="metric-toggles" className="flex flex-wrap gap-1 p-1 bg-[#0A0B0E] rounded-lg">
          <button
            id="toggle-cpu"
            onClick={() => { setActiveMetric("cpu"); setHoveredIndex(null); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeMetric === "cpu"
                ? "bg-[#30363D] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-200"
            }`}
          >
            CPU (%)
          </button>
          <button
            id="toggle-memory"
            onClick={() => { setActiveMetric("memory"); setHoveredIndex(null); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeMetric === "memory"
                ? "bg-[#30363D] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-200"
            }`}
          >
            JVM Heap (MB)
          </button>
          <button
            id="toggle-cache"
            onClick={() => { setActiveMetric("cacheMiss"); setHoveredIndex(null); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeMetric === "cacheMiss"
                ? "bg-[#30363D] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-200"
            }`}
          >
            Cache Miss (%)
          </button>
          <button
            id="toggle-workflow"
            onClick={() => { setActiveMetric("workflowFailure"); setHoveredIndex(null); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeMetric === "workflowFailure"
                ? "bg-[#30363D] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-200"
            }`}
          >
            Workflow Fail (%)
          </button>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div id="svg-canvas-container" className="relative w-full overflow-hidden">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto select-none overflow-visible"
        >
          <defs>
            {/* Area Gradient Fill */}
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            
            {/* Alarm Glow Filter for critical threshold crossing */}
            <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          {yLabels.map((lbl, idx) => (
            <g key={`grid-${idx}`}>
              <line 
                x1={paddingX} 
                y1={lbl.y} 
                x2={width - paddingX} 
                y2={lbl.y} 
                className="stroke-[#30363D]/60" 
                strokeWidth="1"
              />
              <text 
                x={paddingX - 10} 
                y={lbl.y + 4} 
                className="text-[10px] font-mono fill-slate-500 text-right" 
                textAnchor="end"
              >
                {lbl.val}
                {activeMetric !== "memory" && idx === yLabels.length - 1 ? "%" : ""}
                {activeMetric === "memory" && idx === yLabels.length - 1 ? "MB" : ""}
              </text>
            </g>
          ))}

          {/* X axis line */}
          <line 
            x1={paddingX} 
            y1={height - paddingY} 
            x2={width - paddingX} 
            y2={height - paddingY} 
            className="stroke-[#30363D]" 
            strokeWidth="1.5"
          />

          {/* X axis labels */}
          {points.map((p, idx) => (
            <text 
              key={`x-lbl-${idx}`} 
              x={p.x} 
              y={height - paddingY + 16} 
              className="text-[10px] font-mono fill-slate-500" 
              textAnchor="middle"
            >
              {p.time}
            </text>
          ))}

          {/* Area Fill */}
          <polygon points={areaPoints} fill="url(#areaGrad)" />

          {/* Alert Threshold Indicator Line */}
          {thresholdY >= paddingY && thresholdY <= height - paddingY && (
            <g>
              <line 
                x1={paddingX} 
                y1={thresholdY} 
                x2={width - paddingX} 
                y2={thresholdY} 
                className="stroke-[#ef4444]/80" 
                strokeDasharray="4 4" 
                strokeWidth="1.5"
              />
              <rect 
                x={width - paddingX - 110} 
                y={thresholdY - 18} 
                width="110" 
                height="14" 
                rx="3" 
                className="fill-[#161B22] stroke-red-500/50" 
                strokeWidth="0.5"
              />
              <text 
                x={width - paddingX - 5} 
                y={thresholdY - 8} 
                className="text-[8px] font-bold fill-red-400 text-right" 
                textAnchor="end"
              >
                THRESHOLD: {threshold}{activeMetric === "memory" ? "MB" : "%"}
              </text>
            </g>
          )}

          {/* Main Polyline Trace */}
          <polyline 
            points={polylinePoints} 
            fill="none" 
            className="stroke-blue-500" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />

          {/* Data Nodes / Hit boxes */}
          {points.map((p, idx) => {
            const isCritical = p.val >= threshold;
            const isHovered = hoveredIndex === idx;

            return (
              <g key={`pt-${idx}`}>
                {/* Visual Circle */}
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={isHovered ? 6 : 4} 
                  className={`${
                    isCritical 
                      ? "fill-red-500 stroke-[#161B22]" 
                      : "fill-blue-500 stroke-[#161B22]"
                  } transition-all duration-150 cursor-pointer`}
                  strokeWidth="1.5"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                
                {/* Hover Aura */}
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="14" 
                  className="fill-transparent cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Dynamic HTML Tooltip Layer */}
        {hoveredIndex !== null && (
          <div 
            id="tooltip-box"
            className="absolute bg-[#161B22]/95 text-slate-300 text-xs rounded-lg p-2.5 shadow-xl border border-[#30363D] font-mono flex flex-col pointer-events-none transition-all duration-150"
            style={{
              left: `${Math.min(width - 150, Math.max(10, points[hoveredIndex].x - 60))}px`,
              top: `${Math.min(height - 100, Math.max(10, points[hoveredIndex].y - 70))}px`
            }}
          >
            <span className="text-slate-500 text-[10px]">Time: {points[hoveredIndex].time}</span>
            <span className="font-bold text-blue-400 mt-0.5">
              {activeMetric === "cpu" && "Sustained CPU: "}
              {activeMetric === "memory" && "JVM Heap: "}
              {activeMetric === "cacheMiss" && "Cache Miss: "}
              {activeMetric === "workflowFailure" && "Workflow Failures: "}
              {points[hoveredIndex].val}
              {activeMetric === "memory" ? " MB" : "%"}
            </span>
            <span className="text-[10px] mt-1 flex items-center gap-1">
              Status:{" "}
              {points[hoveredIndex].val >= threshold ? (
                <span className="text-red-400 font-semibold">⚠️ BREACH</span>
              ) : (
                <span className="text-emerald-400 font-semibold">✓ NORMAL</span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Metrics Card Legend & Threshold Status Details */}
      <div id="chart-legend" className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-500 border-t border-[#30363D] pt-3 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            Active Telemetry Series
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-red-500 inline-block"></span>
            Anomaly Threshold Line
          </span>
        </div>
        <div className="font-mono text-[10px]">
          Max Observed in Frame: <span className="font-bold text-slate-300">{Math.max(...values)}{activeMetric === "memory" ? "MB" : "%"}</span>
        </div>
      </div>
    </div>
  );
}
