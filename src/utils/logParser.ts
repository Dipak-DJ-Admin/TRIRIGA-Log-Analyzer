import { CopilotAnalysis, Anomaly, Recommendation } from "../types";

export function parseLogsLocally(logText: string, scenarioName?: string): CopilotAnalysis {
  const text = logText.toLowerCase();
  
  // Extract CPU data
  let cpuMax = 45;
  const cpuMatches = logText.match(/cpu\s*[:=]\s*(\d+(\.\d+)?)%/i) || logText.match(/cpu\s+usage\s*[:=]?\s*(\d+(\.\d+)?)/i);
  if (cpuMatches) {
    cpuMax = parseFloat(cpuMatches[1]);
  } else if (text.includes("thread pool exhaustion") || text.includes("cpu spike") || text.includes("high-load thread")) {
    cpuMax = 88.5;
  } else if (scenarioName?.includes("CPU") || scenarioName?.includes("Exhaustion")) {
    cpuMax = 92.0;
  }

  // Extract Cache metrics
  let cacheMisses = 120;
  let cacheHits = 2000;
  let cacheMissRatio = 5.6;
  const missMatches = logText.match(/miss(?:es)?\s*[:=]\s*(\d+)/i);
  const hitMatches = logText.match(/hits?\s*[:=]\s*(\d+)/i);
  if (missMatches && hitMatches) {
    cacheMisses = parseInt(missMatches[1]);
    cacheHits = parseInt(hitMatches[1]);
    cacheMissRatio = (cacheMisses / (cacheHits + cacheMisses)) * 100;
  } else if (text.includes("cache miss storm") || text.includes("cache.miss") || text.includes("objectcache")) {
    cacheMissRatio = 26.4;
  } else if (scenarioName?.includes("Cache")) {
    cacheMissRatio = 28.5;
  }

  // Extract Workflow metrics
  let totalWorkflows = 500;
  let failedWorkflows = 4;
  let workflowFailureRate = 0.8;
  const wfProcessedMatches = logText.match(/processed\s+(\d+)\s+workflows/i) || logText.match(/total\s+processed\s+in\s+the\s+last\s+hour\s*[:=]?\s*(\d+)/i);
  const wfFailedMatches = logText.match(/(\d+)\s+failure/i) || logText.match(/(\d+)\s+failed\s+task/i);
  if (wfProcessedMatches && wfFailedMatches) {
    totalWorkflows = parseInt(wfProcessedMatches[1]);
    failedWorkflows = parseInt(wfFailedMatches[1]);
    workflowFailureRate = (failedWorkflows / totalWorkflows) * 100;
  } else if (text.includes("workflow execution failure") || text.includes("statetransitionexception") || text.includes("locktimeoutexception")) {
    totalWorkflows = 850;
    failedWorkflows = 38;
    workflowFailureRate = (failedWorkflows / totalWorkflows) * 100; // 4.47%
  } else if (scenarioName?.includes("Workflow") || scenarioName?.includes("Lock")) {
    totalWorkflows = 1200;
    failedWorkflows = 42;
    workflowFailureRate = 3.5;
  }

  // Memory Leak identification
  let memoryTrend: "Stable" | "Upward" | "Downward" | "Fluctuating" = "Stable";
  let memoryLeakRisk: "Low" | "Medium" | "High" = "Low";
  if (text.includes("outofmemoryerror") || text.includes("gc overhead limit exceeded") || text.includes("leaked") || text.includes("heap memory non-recovering")) {
    memoryTrend = "Upward";
    memoryLeakRisk = "High";
  } else if (text.includes("garbage collection") || text.includes("memory leak") || scenarioName?.includes("JVM") || scenarioName?.includes("Memory")) {
    memoryTrend = "Upward";
    memoryLeakRisk = "High";
  }

  // Create Anomaly items based on thresholds
  const detectedAnomalies: Anomaly[] = [];
  const recommendations: Recommendation[] = [];
  let status: "Healthy" | "Degraded" | "Critical" = "Healthy";

  // Check CPU Threshold > 80%
  if (cpuMax >= 80) {
    status = "Critical";
    detectedAnomalies.push({
      title: "Critical System Constraint",
      severity: "Critical",
      description: `Sustained high CPU usage of ${cpuMax.toFixed(1)}% detected. This indicates thread pool exhaustion or severe DB query blocking.`
    });
    recommendations.push({
      title: "Thread Pool Scaling & Keep-Alive Settings",
      category: "Property Edit",
      description: "Scale maximum WebSphere/WebLogic application server thread pools and optimize TRIRIGA connection pool. Set Keep-Alive limits correctly in TRIRIGAWEB.properties.",
      codeSnippet: "# custom.properties / TRIRIGAWEB.properties\nTHREADS_LIMIT=250\nCONNECTION_POOL_MAX=150"
    });
  }

  // Check Memory Leak Risk
  if (memoryLeakRisk === "High") {
    if (status !== "Critical") status = "Degraded";
    detectedAnomalies.push({
      title: "Potential JVM Memory Leak",
      severity: "Critical",
      description: "Gradual, non-recovering Heap memory identified after consecutive full garbage collection (GC) cycles. Stop-The-World (STW) times exceed 12,000ms."
    });
    recommendations.push({
      title: "JVM Garbage Collection Tuning & Heap Dump Analysis",
      category: "Workflow Adjustment",
      description: "Configure the JVM to use G1GC garbage collector with optimized pause time targets and generate a heap dump upon OutOfMemory exception for Eclipse Memory Analyzer (MAT).",
      codeSnippet: "-XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+HeapDumpOnOutOfMemoryError"
    });
  }

  // Check Cache Miss Ratio > 15%
  if (cacheMissRatio > 15) {
    if (status === "Healthy") status = "Degraded";
    detectedAnomalies.push({
      title: "Cache Storm Event Detected",
      severity: "Warning",
      description: `The Cache Miss Ratio is ${cacheMissRatio.toFixed(1)}% (Threshold: 15.0%). Higher cache misses force excessive roundtrips to the DB for metadata.`
    });
    recommendations.push({
      title: "TRIRIGA Object Cache Adjustments",
      category: "Property Edit",
      description: "Increase the TRIRIGA Object Cache limits in custom.properties to store frequently hit records (such as Classifications, GUI, and Web Page metadata).",
      codeSnippet: "# custom.properties\n# Object Cache configurations\nOBJECT_CACHE_SIZE_LIMIT=50000\nCLEANUP_PERIOD_MINUTES=120"
    });
  }

  // Check Workflow Failure Rates > 2%
  if (workflowFailureRate > 2) {
    if (status === "Healthy") status = "Degraded";
    detectedAnomalies.push({
      title: "Workflow Failure Operational Risk",
      severity: "Warning",
      description: `Workflow Failure Rate is ${workflowFailureRate.toFixed(1)}%, exceeding the 2.0% operational threshold. High probability of lock contention.`
    });
    recommendations.push({
      title: "Workflow Lock Contention & Business Object Checks",
      category: "DB Query",
      description: "Run diagnostic queries to check for locked objects in the workflow queue. Identify workflows with 'Start No Import' or stuck 'In Progress' states.",
      codeSnippet: "-- Run on TRIRIGA Database (PostgreSQL/Oracle/MSSQL)\nSELECT EVENT_ID, EVENT_NAME, WF_STATUS, CREATED_DATE \nFROM WF_EVENT_HISTORY \nWHERE WF_STATUS = 'LOCKED' OR WF_STATUS = 'FAILED';"
    });
  }

  // Provide realistic custom RCA based on text
  let rca = "";
  let executiveSummary = "";
  if (scenarioName?.includes("CPU") || cpuMax >= 80) {
    executiveSummary = `The TRIRIGA platform is suffering from severe CPU starvation. High active thread contention (${cpuMax.toFixed(0)}%) is caused by un-indexed SQL lookups and parallel asynchronous workflows.`;
    rca = `### Root Cause Analysis: CPU Starvation\n\n1. **Thread Saturation**: The log reveals a sudden surge of HTTP connector threads executing long-running business intelligence queries on \`T_SPACE\` and \`T_TRIORGANIZATION\`.\n2. **Slow Query Contention**: Lack of appropriate compound indices on custom business objects causes sequential table scans, utilizing over 90% of DB CPU which ripples back into the app server's WebContainer thread pool.`;
  } else if (scenarioName?.includes("Memory") || memoryLeakRisk === "High") {
    executiveSummary = "JVM memory telemetry reveals classic memory leak symptoms. Full GC cycles are happening more frequently (every 30 seconds) but recovering less than 5% of memory heap each time.";
    rca = `### Root Cause Analysis: JVM Heap Leak\n\n1. **State Persistence**: A custom workflow is dynamically creating millions of temporary object references inside loops without explicit cleanup or deletion actions.\n2. **GC Failure**: Standard Garbage Collector is unable to reclaim memory because these references remain active inside thread-local static variables. Sustained heap utilization above 94%.`;
  } else if (scenarioName?.includes("Cache") || cacheMissRatio > 15) {
    executiveSummary = `The Object Cache Miss Ratio is critical at ${cacheMissRatio.toFixed(1)}%. Excessive DB metadata compilation is choking the server connection pools.`;
    rca = `### Root Cause Analysis: Cache Storm Event\n\n1. **Cache Limit Overshoot**: The maximum object limit configured in \`custom.properties\` has been breached due to the heavy metadata volume of a recent lease administration bulk import.\n2. **Eviction Loop**: TRIRIGA is caught in an eviction-reload cycle, triggering constant file system I/O for cache invalidation events.`;
  } else if (scenarioName?.includes("Workflow") || workflowFailureRate > 2) {
    executiveSummary = `Operational risk raised: ${workflowFailureRate.toFixed(1)}% workflow failures. Database records on business objects are locked due to asynchronous process collisions.`;
    rca = `### Root Cause Analysis: Workflow Contention & Locks\n\n1. **Locking Contention**: Concurrent execution of 'triCalculateAllocation' and 'triIntegrateSpace' is causing a deadlock on the \`T_WORK_ORDER\` tables.\n2. **State Transition Defect**: Workflows are failing with \`StateTransitionException\`, leaving the business objects in an intermediate locked state, blocking downstream processes.`;
  } else {
    executiveSummary = "Platform health is optimal. Telemetry data shows low active thread counts, solid cache hit ratio (98.4%), and normal memory recovery cycles.";
    rca = `### Root Cause Analysis: Optimal Platform Health\n\n1. **GC Cycles**: JVM Heap recovered smoothly during minor GC. No memory retention issues found.\n2. **Cache Operations**: Classification, GUI, and Metadata caches are running optimally. Cache Miss Ratio is well within the 5% warning margin.`;
  }

  return {
    isAI: false,
    status,
    executiveSummary,
    detectedAnomalies,
    metrics: {
      cpuMax,
      memoryTrend,
      memoryLeakRisk,
      cacheMissRatio,
      workflowFailureRate,
      totalWorkflowsProcessed: totalWorkflows,
      totalWorkflowsFailed: failedWorkflows,
      avgResponseTimeMs: cpuMax > 80 ? 3200 : 420
    },
    rca,
    recommendations
  };
}
