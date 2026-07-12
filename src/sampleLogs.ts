export interface LogScenario {
  id: string;
  name: string;
  description: string;
  expectedStatus: "Healthy" | "Degraded" | "Critical";
  logText: string;
  metrics: {
    cpuMax: number;
    memoryTrend: "Stable" | "Upward" | "Downward" | "Fluctuating";
    memoryLeakRisk: "Low" | "Medium" | "High";
    cacheMissRatio: number;
    workflowFailureRate: number;
    totalWorkflowsProcessed: number;
    totalWorkflowsFailed: number;
    avgResponseTimeMs: number;
  };
}

export const sampleScenarios: LogScenario[] = [
  {
    id: "cpu-exhaustion",
    name: "Sustained CPU Spike & Thread Pool Exhaustion",
    description: "High CPU utilization (> 85%) across multiple app nodes, with WebContainer threads blocked by heavy DB lookups.",
    expectedStatus: "Critical",
    metrics: {
      cpuMax: 88.5,
      memoryTrend: "Stable",
      memoryLeakRisk: "Low",
      cacheMissRatio: 4.8,
      workflowFailureRate: 0.5,
      totalWorkflowsProcessed: 420,
      totalWorkflowsFailed: 2,
      avgResponseTimeMs: 3120
    },
    logText: `2026-07-12 10:15:33,124 INFO  [com.tririga.platform.performance.ThreadMonitor] CPU Utilization sustained at 88.5% for last 180 seconds on ServerNode01.
2026-07-12 10:15:34,445 WARN  [com.tririga.platform.performance.ThreadMonitor] Active WebContainer thread pool count is at maximum (150/150). 12 threads in state BLOCKED.
2026-07-12 10:15:35,901 INFO  [com.tririga.platform.performance.SlowQueryLogger] Slow SQL Query detected: Duration = 12450ms.
    Query: SELECT t1.spec_id, t1.triNameTX, t2.triStatusSY FROM T_SPACE t1 JOIN T_TRIORGANIZATION t2 ON t1.parent_id = t2.spec_id WHERE t1.triSpaceTypeTX = 'OFFICE' AND t2.triStatusSY = 'Active'
    Execution Plan: Sequential table scan on T_SPACE (345,000 rows) - Missing compound index on triSpaceTypeTX, parent_id.
2026-07-12 10:15:38,203 WARN  [com.tririga.platform.performance.ThreadMonitor] WebContainer : 42 locked on [com.ibm.ws.rs.webcontainer.WebContainer] waiting for Database connection pool to release connections (current active connections = 100/100).
2026-07-12 10:15:40,510 ERROR [com.tririga.platform.performance.ThreadMonitor] Thread WebContainer : 89 has been running for 120,000ms. Possible thread deadlock.
    Stack Trace:
    at java.net.SocketInputStream.socketRead0(Native Method)
    at java.net.SocketInputStream.socketRead(SocketInputStream.java:116)
    at oracle.jdbc.driver.T4CMAccess.receive(T4CMAccess.java:747)
    at oracle.jdbc.driver.T4CStatement.doOall8(T4CStatement.java:257)
    at oracle.jdbc.driver.T4CPreparedStatement.doOall8(T4CPreparedStatement.java:237)
    at oracle.jdbc.driver.T4CPreparedStatement.executeForDescribe(T4CPreparedStatement.java:940)
    at oracle.jdbc.driver.OracleStatement.executeMaybeDescribe(OracleStatement.java:1625)
    at oracle.jdbc.driver.OracleStatement.doExecuteWithTimeout(OracleStatement.java:1810)
    at oracle.jdbc.driver.OraclePreparedStatement.executeInternal(OraclePreparedStatement.java:4790)
    at com.tririga.platform.persistence.StatementWrapper.execute(StatementWrapper.java:204)
    at com.tririga.platform.persistence.TransactionManager.query(TransactionManager.java:312)`
  },
  {
    id: "jvm-memory-leak",
    name: "JVM Heap Memory Leak & GC Overhead",
    description: "Telemetry detects a persistent upward heap usage staircase pattern with minimal memory reclaimed during full GC cycles.",
    expectedStatus: "Critical",
    metrics: {
      cpuMax: 76.2,
      memoryTrend: "Upward",
      memoryLeakRisk: "High",
      cacheMissRatio: 3.1,
      workflowFailureRate: 1.1,
      totalWorkflowsProcessed: 680,
      totalWorkflowsFailed: 7,
      avgResponseTimeMs: 4200
    },
    logText: `2026-07-12 11:42:01,902 INFO  [com.ibm.virtualization.management.GcMonitor] [GC (Allocation Failure)  921342K->910243K(1048576K), 0.2312912 secs]
2026-07-12 11:42:15,412 INFO  [com.ibm.virtualization.management.GcMonitor] [Full GC (System.gc())  1012391K->1001243K(1048576K), 12.8943012 secs] - Heap memory recovered < 1.1%
2026-07-12 11:42:28,103 WARN  [com.tririga.platform.performance.MemoryLogger] Heap Utilization is at 95.48% (1001MB / 1024MB). Memory Leak Risk: HIGH.
2026-07-12 11:42:30,224 ERROR [com.tririga.platform.error.PlatformException] java.lang.OutOfMemoryError: GC overhead limit exceeded.
    at java.util.HashMap.newNode(HashMap.java:1747)
    at java.util.HashMap.putVal(HashMap.java:631)
    at java.util.HashMap.put(HashMap.java:612)
    at com.tririga.platform.metadata.domain.MetadataRepositoryImpl.getRecordData(MetadataRepositoryImpl.java:541)
    at com.tririga.platform.workflow.runtime.WorkflowRuntimeEngine.executeWorkflowStep(WorkflowRuntimeEngine.java:231)
2026-07-12 11:42:35,662 ERROR [com.tririga.platform.workflow.runtime.WorkflowRuntimeEngine] Persistent Leak Candidate Identified: com.tririga.platform.workflow.runtime.context.ContextScopeContainer holding 124,500 active references on StateTransition objects.
2026-07-12 11:42:40,119 INFO  [com.tririga.platform.performance.MemoryLogger] JVM Statistics:
    - Initial Heap Size: 512MB
    - Max Heap Size: 1024MB
    - Used Heap: 1004MB
    - Garbage Collection Policy: ParallelGC (Stop-The-World duration average exceeds 8500ms)`
  },
  {
    id: "cache-miss-storm",
    name: "Cache Storm Event (Cache Miss Ratio > 15%)",
    description: "The Object Cache size is insufficient, causing continuous eviction and reloading. This triggers massive DB metadata roundtrips.",
    expectedStatus: "Degraded",
    metrics: {
      cpuMax: 54.0,
      memoryTrend: "Stable",
      memoryLeakRisk: "Low",
      cacheMissRatio: 26.4,
      workflowFailureRate: 1.5,
      totalWorkflowsProcessed: 1420,
      totalWorkflowsFailed: 21,
      avgResponseTimeMs: 1450
    },
    logText: `2026-07-12 12:01:10,042 INFO  [com.tririga.platform.cache.CacheManager] ObjectCache: GUI_CACHE misses: 4,212 | hits: 11,200 | Miss Ratio: 27.32% (Threshold: 15%)
2026-07-12 12:01:11,551 WARN  [com.tririga.platform.cache.CacheManager] Cache 'RecordMetadataCache' capacity reached limit (20,000 items). Initiating eviction of 1,000 items.
2026-07-12 12:01:15,310 INFO  [com.tririga.platform.cache.CacheManager] ObjectCache 'ClassificationCache' cache miss storm occurring on Classification hierarchy 'triSpaceClass'. Continuous reload occurring.
2026-07-12 12:01:18,992 DEBUG [com.tririga.platform.persistence.QueryManager] Cache MISS on Record ID: 12459124. Fetching Metadata from Database.
2026-07-12 12:01:21,120 WARN  [com.tririga.platform.cache.CacheManager] Cache invalidation event received from node ServerNode02. Purging 5,000 elements from cache 'ClassificationCache'.
2026-07-12 12:01:23,450 INFO  [com.tririga.platform.performance.PerformanceStats] Cache Statistics summary:
    - Object Cache Capacity: 20000
    - Cache Miss Ratio: 26.4%
    - Cache Reload Times: avg 450ms per metadata record
    - Impact: 45% of WebContainer processing latency spent waiting on metadata deserialization.`
  },
  {
    id: "workflow-deadlock",
    name: "Workflow Deadlock & operational Failure Rate",
    description: "Workflow failure rates rise to 4.5% due to record-locking collisions on transaction-heavy operations.",
    expectedStatus: "Degraded",
    metrics: {
      cpuMax: 62.1,
      memoryTrend: "Stable",
      memoryLeakRisk: "Low",
      cacheMissRatio: 5.1,
      workflowFailureRate: 4.47,
      totalWorkflowsProcessed: 850,
      totalWorkflowsFailed: 38,
      avgResponseTimeMs: 1180
    },
    logText: `2026-07-12 13:30:15,102 ERROR [com.tririga.platform.workflow.runtime.WorkflowRuntimeEngine] Error executing Workflow 'triCalculateSpaceAllocation' ID: 29481249 step: 'Update Allocation Status'.
    StateTransitionException: Failed to transition object 14921049 using action 'Activate'. Object is locked by transaction thread WorkflowAgentQueue_9.
2026-07-12 13:30:18,443 WARN  [com.tririga.platform.persistence.TransactionManager] LockTimeoutException: Timeout waiting to acquire lock on T_WORK_ORDER row (ID: 15410291) after 15,000ms.
2026-07-12 13:30:20,511 ERROR [com.tririga.platform.workflow.runtime.WorkflowRuntimeEngine] Workflow Agent Queue thread WorkflowAgentQueue_4 has failed on task 'Update Space Record'.
    Exception:
    com.tririga.platform.workflow.runtime.WorkflowException: Error locked business object with key 15410291
    at com.tririga.platform.workflow.runtime.WorkflowRuntimeEngine.executeStep(WorkflowRuntimeEngine.java:491)
    at com.tririga.platform.workflow.runtime.WorkflowRuntimeEngine.run(WorkflowRuntimeEngine.java:120)
2026-07-12 13:30:22,891 WARN  [com.tririga.platform.workflow.queue.WorkflowQueueManager] Workflow failure rates: 4.47% (38 failed tasks / 850 total processed in the last hour).
2026-07-12 13:30:25,121 INFO  [com.tririga.platform.workflow.queue.WorkflowQueueManager] Identified locked business objects count: 12. Locked Tables: T_SPACE, T_WORK_ORDER.`
  },
  {
    id: "optimal-health",
    name: "Optimal Platform Performance (Healthy)",
    description: "System baseline showing optimal TRIRIGA operations. Cache Hit Ratio is > 98%, CPU and JVM memory metrics are completely healthy.",
    expectedStatus: "Healthy",
    metrics: {
      cpuMax: 24.5,
      memoryTrend: "Stable",
      memoryLeakRisk: "Low",
      cacheMissRatio: 1.6,
      workflowFailureRate: 0.1,
      totalWorkflowsProcessed: 1500,
      totalWorkflowsFailed: 1,
      avgResponseTimeMs: 145
    },
    logText: `2026-07-12 14:00:00,001 INFO  [com.tririga.platform.performance.ThreadMonitor] CPU Utilization is running at 24.5% on ServerNode01. Completely within optimal bounds (< 50%).
2026-07-12 14:00:01,230 INFO  [com.tririga.platform.cache.CacheManager] ObjectCache stats: GUI_CACHE hits: 45,212 | misses: 121 | Miss Ratio: 0.26%. RecordMetadataCache is healthy.
2026-07-12 14:00:02,450 INFO  [com.ibm.virtualization.management.GcMonitor] [GC (Allocation Failure)  412K->140K(1048576K), 0.012 secs] - Heap reclaimed 95%.
2026-07-12 14:00:05,901 INFO  [com.tririga.platform.workflow.queue.WorkflowQueueManager] Total active queue size: 2. Processed 1,500 workflows with 1 failure in last 60 minutes. Failure rate is 0.06%.
2026-07-12 14:00:08,124 INFO  [com.tririga.platform.performance.PerformanceStats] Overall DB connections: 12 active, 0 waiting. Response times: WebContainer avg = 145ms.`
  }
];
