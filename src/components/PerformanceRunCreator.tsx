import React, { useState } from "react";
import {
  Play,
  X,
  ChevronDown,
  ChevronRight,
  Settings,
  HelpCircle,
  FileText,
  Activity,
  CheckSquare,
  Square,
  MinusSquare,
  Sparkles,
  Zap
} from "lucide-react";

interface PerformanceRunCreatorProps {
  onCancel: () => void;
  onFinish: (selectedIds: string[]) => void;
}

interface TreeNode {
  id: string;
  label: string;
  level: number;
  parent: string | null;
  children: string[];
}

export default function PerformanceRunCreator({
  onCancel,
  onFinish
}: PerformanceRunCreatorProps) {
  // 18 nodes including root "root"
  const nodes: TreeNode[] = [
    { id: "root", label: "Performance Timings", level: 0, parent: null, children: ["cba", "extFormula", "report", "sql", "birt", "stateTransition", "workflow", "cad"] },
    { id: "cba", label: "Connector for Business Applications", level: 1, parent: "root", children: [] },
    { id: "extFormula", label: "Extended Formula", level: 1, parent: "root", children: ["extFormulaCalc", "extFormulaQueue"] },
    { id: "extFormulaCalc", label: "Calculation", level: 2, parent: "extFormula", children: ["extFormulaCalcNormal", "extFormulaCalcLabels"] },
    { id: "extFormulaCalcNormal", label: "Normal", level: 3, parent: "extFormulaCalc", children: [] },
    { id: "extFormulaCalcLabels", label: "Add Object Labels", level: 3, parent: "extFormulaCalc", children: [] },
    { id: "extFormulaQueue", label: "Queue", level: 2, parent: "extFormula", children: [] },
    { id: "report", label: "Report", level: 1, parent: "root", children: [] },
    { id: "sql", label: "SQL", level: 1, parent: "root", children: ["sqlNormal", "sqlBind"] },
    { id: "sqlNormal", label: "Normal", level: 2, parent: "sql", children: [] },
    { id: "sqlBind", label: "Add Bind Variables", level: 2, parent: "sql", children: [] },
    { id: "birt", label: "BIRT", level: 1, parent: "root", children: [] },
    { id: "stateTransition", label: "State Transition", level: 1, parent: "root", children: [] },
    { id: "workflow", label: "Workflow", level: 1, parent: "root", children: ["workflowAsync", "workflowSync", "workflowStep"] },
    { id: "workflowAsync", label: "Asynchronous", level: 2, parent: "workflow", children: [] },
    { id: "workflowSync", label: "Synchronous", level: 2, parent: "workflow", children: [] },
    { id: "workflowStep", label: "Step Trace", level: 2, parent: "workflow", children: [] },
    { id: "cad", label: "CAD Integrator (Server)", level: 1, parent: "root", children: [] }
  ];

  // Map to speed up lookups
  const nodesMap = new Map<string, TreeNode>();
  nodes.forEach(node => nodesMap.set(node.id, node));

  // Default checked nodes from screenshot
  const [checkedIds, setCheckedIds] = useState<string[]>([
    "report",
    "workflow",
    "workflowAsync",
    "workflowSync",
    "workflowStep",
    "root" // Root is checked if children are checked
  ]);

  // Track expanded folder nodes
  const [expandedIds, setExpandedIds] = useState<string[]>([
    "root",
    "extFormula",
    "extFormulaCalc",
    "sql",
    "workflow"
  ]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Check state helpers
  const getAllDescendants = (id: string): string[] => {
    const node = nodesMap.get(id);
    if (!node) return [];
    let descendants: string[] = [];
    node.children.forEach(childId => {
      descendants.push(childId);
      descendants = descendants.concat(getAllDescendants(childId));
    });
    return descendants;
  };

  const getAllAncestors = (id: string): string[] => {
    const node = nodesMap.get(id);
    if (!node || !node.parent) return [];
    return [node.parent].concat(getAllAncestors(node.parent));
  };

  const handleCheckboxChange = (id: string) => {
    const isCurrentlyChecked = checkedIds.includes(id);
    let nextChecked = [...checkedIds];

    if (isCurrentlyChecked) {
      // Uncheck node and all its descendants
      const descendants = getAllDescendants(id);
      nextChecked = nextChecked.filter(x => x !== id && !descendants.includes(x));

      // Uncheck ancestors because a child was unchecked
      const ancestors = getAllAncestors(id);
      nextChecked = nextChecked.filter(x => !ancestors.includes(x));
    } else {
      // Check node and all its descendants
      const descendants = getAllDescendants(id);
      nextChecked = Array.from(new Set([...nextChecked, id, ...descendants]));

      // For every ancestor, check if all its children are checked, if so check the ancestor
      const ancestors = getAllAncestors(id);
      ancestors.forEach(ancId => {
        const ancNode = nodesMap.get(ancId);
        if (ancNode) {
          const allChildrenChecked = ancNode.children.every(childId =>
            nextChecked.includes(childId)
          );
          if (allChildrenChecked) {
            nextChecked.push(ancId);
          }
        }
      });
      nextChecked = Array.from(new Set(nextChecked));
    }

    setCheckedIds(nextChecked);
  };

  const renderIcon = (node: TreeNode) => {
    if (node.children.length === 0) return <FileText className="w-3.5 h-3.5 text-slate-500 mr-1.5 shrink-0" />;
    
    const isExpanded = expandedIds.includes(node.id);
    return (
      <button
        onClick={() => toggleExpand(node.id)}
        className="p-0.5 hover:bg-[#21262D] rounded text-slate-400 mr-1 cursor-pointer"
      >
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>
    );
  };

  const renderCheckbox = (node: TreeNode) => {
    const isChecked = checkedIds.includes(node.id);
    const descendants = getAllDescendants(node.id);
    const checkedDescendants = descendants.filter(d => checkedIds.includes(d));
    const isIndeterminate =
      !isChecked &&
      checkedDescendants.length > 0 &&
      checkedDescendants.length < descendants.length;

    return (
      <button
        onClick={() => handleCheckboxChange(node.id)}
        className="mr-2 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
      >
        {isChecked ? (
          <CheckSquare className="w-4 h-4 shrink-0" />
        ) : isIndeterminate ? (
          <MinusSquare className="w-4 h-4 shrink-0 text-slate-500" />
        ) : (
          <Square className="w-4 h-4 shrink-0 text-slate-600" />
        )}
      </button>
    );
  };

  // Filter out nodes whose parents are collapsed
  const isNodeVisible = (node: TreeNode): boolean => {
    if (!node.parent) return true;
    let current = node.parent;
    while (current) {
      if (!expandedIds.includes(current)) return false;
      const parentNode = nodesMap.get(current);
      current = parentNode?.parent || "";
    }
    return true;
  };

  const handleFinish = () => {
    // Only pass leaf nodes that are actually checked, or checked ids that represent actual categories
    // Excluding root
    const selectedLeaves = checkedIds.filter(id => id !== "root");
    onFinish(selectedLeaves);
  };

  return (
    <div className="bg-[#0F1115] border border-[#21262D] rounded-2xl p-6.5 space-y-6 shadow-2xl relative overflow-hidden animate-fade-in">
      
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start border-b border-[#21262D] pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              DIAGNOSTIC TESTBED
            </span>
            <span className="text-slate-500 text-xs font-mono">
              TRIRIGA Administrator Console v3.8
            </span>
          </div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-5.5 h-5.5 text-emerald-400" />
            Generate New Performance Run
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Configure your Performance Timings parameters below. Selected categories will generate transaction call trace logs to measure load times, lock contentions, and JVM overhead.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 hover:bg-[#21262D] text-slate-400 hover:text-white rounded-lg border border-[#21262D] transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Checklist Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Checkbox tree panel (takes 7 columns) */}
        <div className="lg:col-span-7 bg-[#08090C] border border-[#21262D] rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider font-mono font-bold pb-2 border-b border-[#21262D]/60">
            <span>Performance Timing Parameters</span>
            <span>{checkedIds.filter(id => id !== "root").length} / 17 Categories</span>
          </div>

          <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar font-sans text-xs">
            {nodes.map(node => {
              if (!isNodeVisible(node)) return null;
              
              const isRoot = node.id === "root";
              
              return (
                <div
                  key={node.id}
                  style={{ paddingLeft: `${node.level * 20}px` }}
                  className={`flex items-center py-1.5 rounded-lg transition-colors group ${
                    isRoot 
                      ? "bg-[#161B22]/65 px-2 border border-[#21262D]/30" 
                      : "hover:bg-[#161B22]/30"
                  }`}
                >
                  {renderIcon(node)}
                  {renderCheckbox(node)}
                  <span className={`text-slate-300 font-medium ${isRoot ? "font-bold text-white text-xs" : ""}`}>
                    {node.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Documentation / Info panel (takes 5 columns) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="bg-[#161B22]/50 border border-[#21262D] rounded-xl p-4.5 space-y-3.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-[#21262D]/60 pb-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              Monitoring Guide
            </h3>

            <div className="space-y-3 text-[11px] leading-relaxed text-slate-400">
              <div className="space-y-1">
                <span className="font-bold text-slate-300 block">Extended Formula:</span>
                <p>Captures asynchronous and synchronous JVM-evaluated calculations, including normal rent pay lists, allocations, and queuing rates.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-300 block">Workflow Engine:</span>
                <p>Registers Asynchronous Event Queue processors and Synchronous pre-validation threads along with Step Tracing call hierarchies.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-300 block">SQL Tracing:</span>
                <p>Isolates DB execution durations. "Add Bind Variables" records query templates alongside active index parameters for full DBA audit.</p>
              </div>
            </div>
          </div>

          {/* Quick Stats Block */}
          <div className="bg-[#1B2028]/35 border border-[#21262D] p-4.5 rounded-xl space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block font-mono">
              Estimated Run Footprint
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-[#08090C] p-2 rounded border border-[#21262D]/60">
                <span className="text-[9px] text-slate-500 block">Est. Raw Log Size</span>
                <span className="text-white font-bold">
                  {(checkedIds.filter(id => id !== "root").length * 8.5).toFixed(1)} KB
                </span>
              </div>
              <div className="bg-[#08090C] p-2 rounded border border-[#21262D]/60">
                <span className="text-[9px] text-slate-500 block">Est. Trace Lines</span>
                <span className="text-white font-bold">
                  {checkedIds.filter(id => id !== "root").length * 35} entries
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer controls */}
      <div className="flex justify-between items-center border-t border-[#21262D] pt-5 mt-4">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Creates an interactive diagnostic log in your active list</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-[#1B2028] hover:bg-[#21262D] text-slate-300 hover:text-white border border-[#2D333B] rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleFinish}
            disabled={checkedIds.filter(id => id !== "root").length === 0}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer ${
              checkedIds.filter(id => id !== "root").length === 0
                ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/20"
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Finish Complete Performance Run
          </button>
        </div>
      </div>

    </div>
  );
}
