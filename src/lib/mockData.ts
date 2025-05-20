
import { 
  Pipeline, 
  SchemaVersion, 
  SchemaChange, 
  JobRun, 
  LatencyRecord, 
  AgentIntervention,
  AgentRule,
  SystemMetrics,
  PipelineStatus,
  SchemaColumn,
  SchemaChangeType,
  RemediationStatus
} from '@/types';

// Helper to generate a random integer within a range
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper to generate a random date within a range
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper to pick a random item from an array
const randomPick = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

// Helper to generate a UUID-like id
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Seed data for data sources
const dataSources = [
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Kafka',
  'S3',
  'Salesforce',
  'REST API',
  'SFTP',
  'Oracle DB',
  'Google Analytics'
];

// Seed data for data destinations
const dataDestinations = [
  'Snowflake',
  'BigQuery',
  'Redshift',
  'S3 Data Lake',
  'Azure Synapse',
  'Databricks',
  'Elasticsearch',
  'PostgreSQL DW',
  'PowerBI',
  'Tableau'
];

// Seed data for owners
const owners = [
  'Data Engineering',
  'Analytics',
  'Sales Operations',
  'Marketing',
  'Product',
  'Finance',
  'Customer Success'
];

// Seed data for tags
const allTags = [
  'critical',
  'etl',
  'analytics',
  'reporting',
  'real-time',
  'batch',
  'experimental',
  'deprecated',
  'finance',
  'marketing',
  'sales',
  'product',
  'customer',
  'high-volume'
];

// Seed data for column types
const columnTypes = [
  'string',
  'integer',
  'float',
  'boolean',
  'date',
  'timestamp',
  'array',
  'json',
  'uuid',
  'enum'
];

// Seed data for error types
const errorTypes = [
  'NullPointerException',
  'OutOfMemoryError',
  'ConnectionError',
  'TimeoutError',
  'ValidationError',
  'ParseError',
  'AuthenticationError',
  'RateLimitError',
  'DataTypeError',
  'DuplicateKeyError'
];

// Generate mock pipelines
export const generateMockPipelines = (count: number): Pipeline[] => {
  const now = new Date();
  const pipelines: Pipeline[] = [];
  
  for (let i = 0; i < count; i++) {
    const status: PipelineStatus = randomPick(['running', 'failed', 'completed', 'warning']);
    const health = status === 'completed' ? randomInt(80, 100) :
                  status === 'warning' ? randomInt(50, 79) :
                  status === 'failed' ? randomInt(0, 49) : randomInt(70, 95);
    
    const lastRun = randomDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), now);
    const nextRunOffset = randomInt(1, 24) * 60 * 60 * 1000;
    
    pipelines.push({
      id: generateId(),
      name: `pipeline-${i + 1}`,
      description: `Data pipeline from ${randomPick(dataSources)} to ${randomPick(dataDestinations)}`,
      status,
      lastRun,
      nextRun: status === 'failed' ? null : new Date(now.getTime() + nextRunOffset),
      avgRuntime: randomInt(60, 3600), // 1 minute to 1 hour
      source: randomPick(dataSources),
      destination: randomPick(dataDestinations),
      owner: randomPick(owners),
      tags: Array.from(new Set([
        randomPick(allTags),
        randomPick(allTags),
        randomPick(allTags)
      ])),
      health
    });
  }
  
  return pipelines;
};

// Generate mock schema columns
export const generateMockColumns = (count: number): SchemaColumn[] => {
  const columns: SchemaColumn[] = [];
  const columnPrefixes = ['user', 'product', 'order', 'transaction', 'event', 'customer', 'item', 'location'];
  
  for (let i = 0; i < count; i++) {
    const prefix = randomPick(columnPrefixes);
    columns.push({
      name: `${prefix}_${['id', 'name', 'date', 'amount', 'status', 'type', 'desc'][i % 7]}`,
      type: randomPick(columnTypes),
      nullable: Math.random() > 0.7,
      description: Math.random() > 0.5 ? `Description for ${prefix} column` : undefined
    });
  }
  
  return columns;
};

// Generate mock schema versions for a pipeline
export const generateMockSchemaVersions = (pipelineId: string, count: number): SchemaVersion[] => {
  const versions: SchemaVersion[] = [];
  const now = new Date();
  
  let baseColumns = generateMockColumns(randomInt(5, 10));
  
  for (let i = 0; i < count; i++) {
    // For each new version, potentially modify the columns
    if (i > 0 && Math.random() > 0.5) {
      const change = randomPick(['add', 'remove', 'modify']);
      
      if (change === 'add' && baseColumns.length < 15) {
        const newColumn = generateMockColumns(1)[0];
        baseColumns = [...baseColumns, newColumn];
      } else if (change === 'remove' && baseColumns.length > 3) {
        const indexToRemove = randomInt(0, baseColumns.length - 1);
        baseColumns = baseColumns.filter((_, index) => index !== indexToRemove);
      } else if (change === 'modify') {
        const indexToModify = randomInt(0, baseColumns.length - 1);
        baseColumns = baseColumns.map((col, index) => 
          index === indexToModify 
            ? { ...col, type: randomPick(columnTypes), nullable: Math.random() > 0.7 }
            : col
        );
      }
    }
    
    versions.push({
      id: generateId(),
      pipelineId,
      version: i + 1,
      timestamp: new Date(now.getTime() - (count - i) * 24 * 60 * 60 * 1000),
      columns: [...baseColumns]
    });
  }
  
  return versions;
};

// Generate mock schema changes based on versions
export const generateMockSchemaChanges = (pipelineId: string, versions: SchemaVersion[]): SchemaChange[] => {
  const changes: SchemaChange[] = [];
  
  for (let i = 1; i < versions.length; i++) {
    const fromVersion = versions[i-1];
    const toVersion = versions[i];
    
    // Find added columns
    toVersion.columns.forEach(newCol => {
      if (!fromVersion.columns.find(oldCol => oldCol.name === newCol.name)) {
        changes.push({
          id: generateId(),
          pipelineId,
          fromVersion: fromVersion.version,
          toVersion: toVersion.version,
          timestamp: toVersion.timestamp,
          changeType: 'add',
          column: newCol,
          impact: randomPick(['low', 'medium', 'high']),
          description: `Added new column ${newCol.name} of type ${newCol.type}`
        });
      }
    });
    
    // Find removed columns
    fromVersion.columns.forEach(oldCol => {
      if (!toVersion.columns.find(newCol => newCol.name === oldCol.name)) {
        changes.push({
          id: generateId(),
          pipelineId,
          fromVersion: fromVersion.version,
          toVersion: toVersion.version,
          timestamp: toVersion.timestamp,
          changeType: 'remove',
          column: oldCol,
          impact: randomPick(['low', 'medium', 'high']),
          description: `Removed column ${oldCol.name} of type ${oldCol.type}`
        });
      }
    });
    
    // Find modified columns
    fromVersion.columns.forEach(oldCol => {
      const newCol = toVersion.columns.find(col => col.name === oldCol.name);
      if (newCol && (newCol.type !== oldCol.type || newCol.nullable !== oldCol.nullable)) {
        changes.push({
          id: generateId(),
          pipelineId,
          fromVersion: fromVersion.version,
          toVersion: toVersion.version,
          timestamp: toVersion.timestamp,
          changeType: 'modify',
          column: newCol,
          previousColumn: oldCol,
          impact: randomPick(['low', 'medium', 'high']),
          description: `Modified column ${newCol.name}: ${oldCol.type}${oldCol.nullable ? ' (nullable)' : ''} → ${newCol.type}${newCol.nullable ? ' (nullable)' : ''}`
        });
      }
    });
  }
  
  return changes;
};

// Generate mock job runs
export const generateMockJobRuns = (pipelineId: string, count: number, failureRate = 0.2): JobRun[] => {
  const runs: JobRun[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const isFailed = Math.random() < failureRate;
    const isRunning = !isFailed && i === 0 && Math.random() < 0.3;
    const status: PipelineStatus = isRunning ? 'running' : (isFailed ? 'failed' : 'completed');
    
    const startTime = new Date(now.getTime() - (count - i) * 3600 * 1000);
    const runtime = randomInt(60, 3600);
    const endTime = isRunning ? null : new Date(startTime.getTime() + runtime * 1000);
    
    const recordsProcessed = randomInt(1000, 100000);
    
    runs.push({
      id: generateId(),
      pipelineId,
      startTime,
      endTime,
      status,
      records: {
        processed: recordsProcessed,
        failed: isFailed ? randomInt(1, recordsProcessed * 0.2) : 0,
        skipped: randomInt(0, recordsProcessed * 0.05)
      },
      runtime: isRunning ? (now.getTime() - startTime.getTime()) / 1000 : runtime,
      errorMessage: isFailed ? `Error processing data: ${randomPick(errorTypes)}` : undefined,
      errorType: isFailed ? randomPick(errorTypes) : undefined,
      errorStackTrace: isFailed ? `at Pipeline.process (pipeline.js:42:15)\nat Runner.execute (runner.js:101:22)` : undefined,
      memoryUsage: randomInt(100, 8000),
      cpuUsage: randomInt(10, 90)
    });
  }
  
  return runs;
};

// Generate mock latency records
export const generateMockLatencyRecords = (pipelineId: string, count: number, anomalyRate = 0.15): LatencyRecord[] => {
  const records: LatencyRecord[] = [];
  const now = new Date();
  const baseExpectedRuntime = randomInt(300, 1800); // 5-30 minutes
  
  for (let i = 0; i < count; i++) {
    const isAnomaly = Math.random() < anomalyRate;
    const expectedRuntime = baseExpectedRuntime + randomInt(-60, 60);
    const deviation = isAnomaly ? randomInt(30, 200) : randomInt(1, 29);
    const direction = Math.random() > 0.5 ? 1 : -1;
    const runtime = expectedRuntime * (1 + (direction * deviation / 100));
    
    records.push({
      id: generateId(),
      pipelineId,
      timestamp: new Date(now.getTime() - (count - i) * 3600 * 1000),
      runtime,
      expectedRuntime,
      deviation: direction * deviation,
      isAnomaly
    });
  }
  
  return records;
};

// Generate mock agent interventions
export const generateMockAgentInterventions = (
  pipelineId: string, 
  schemaChanges: SchemaChange[], 
  jobRuns: JobRun[],
  latencyRecords: LatencyRecord[], 
  interventionRate = 0.7
): AgentIntervention[] => {
  const interventions: AgentIntervention[] = [];
  
  // Schema-related interventions
  schemaChanges.forEach(change => {
    if (Math.random() < interventionRate) {
      const isSupervisedMode = Math.random() < 0.5;
      const isApproved = isSupervisedMode && Math.random() < 0.8;
      const isSuccessful = isApproved && Math.random() < 0.9;
      
      const status: RemediationStatus = !isSupervisedMode ? 'applied' :
                                      (isApproved ? (isSuccessful ? 'applied' : 'failed') : 
                                                   (Math.random() < 0.5 ? 'rejected' : 'pending'));
      
      let action = '';
      let reasoning = '';
      
      if (change.changeType === 'add') {
        action = `Add mapping for new column ${change.column.name}`;
        reasoning = `New column detected in schema. Added mapping to downstream tables and processes.`;
      } else if (change.changeType === 'remove') {
        action = `Remove references to deleted column ${change.column.name}`;
        reasoning = `Column was removed from source schema. Updated downstream dependencies to handle missing field.`;
      } else {
        action = `Update data transformations for modified column ${change.column.name}`;
        reasoning = `Column type changed from ${change.previousColumn?.type} to ${change.column.type}. Adjusted transformations accordingly.`;
      }
      
      interventions.push({
        id: generateId(),
        pipelineId,
        timestamp: new Date(change.timestamp.getTime() + randomInt(5, 60) * 60 * 1000),
        agentType: 'schema',
        issue: `Schema change: ${change.changeType} column ${change.column.name}`,
        action,
        confidence: randomInt(70, 98) / 100,
        status,
        approvedBy: isApproved ? randomPick(owners) : undefined,
        approvedAt: isApproved ? new Date(change.timestamp.getTime() + randomInt(10, 120) * 60 * 1000) : undefined,
        result: status === 'applied' ? 'Successfully updated dependencies' : 
               status === 'failed' ? 'Failed to update some dependencies' : undefined,
        reasoning
      });
    }
  });
  
  // Job failure interventions
  jobRuns.filter(run => run.status === 'failed').forEach(run => {
    if (Math.random() < interventionRate) {
      const isSupervisedMode = Math.random() < 0.5;
      const isApproved = isSupervisedMode && Math.random() < 0.8;
      const isSuccessful = isApproved && Math.random() < 0.9;
      
      const status: RemediationStatus = !isSupervisedMode ? 'applied' :
                                      (isApproved ? (isSuccessful ? 'applied' : 'failed') : 
                                                   (Math.random() < 0.5 ? 'rejected' : 'pending'));
      
      let action = '';
      let reasoning = '';
      
      if (run.errorType === 'OutOfMemoryError') {
        action = 'Increase memory allocation and retry job';
        reasoning = 'Job failed due to memory constraints. Temporarily increasing allocation to handle peak loads.';
      } else if (run.errorType === 'TimeoutError') {
        action = 'Increase timeout threshold and retry job';
        reasoning = 'Job exceeded timeout limits. Adjusting timeout settings to accommodate larger data volume.';
      } else if (run.errorType === 'ConnectionError') {
        action = 'Retry connection with exponential backoff';
        reasoning = 'Detected transient connection issue. Implementing retry mechanism with exponential backoff.';
      } else {
        action = 'Apply error handling logic and retry job';
        reasoning = `Detected ${run.errorType}. Implementing appropriate error handling and resubmitting job.`;
      }
      
      interventions.push({
        id: generateId(),
        pipelineId,
        timestamp: new Date(run.endTime ? run.endTime.getTime() + randomInt(5, 30) * 60 * 1000 : Date.now()),
        agentType: 'job',
        issue: `Job failure: ${run.errorType}`,
        action,
        confidence: randomInt(65, 95) / 100,
        status,
        approvedBy: isApproved ? randomPick(owners) : undefined,
        approvedAt: isApproved ? new Date(Date.now() - randomInt(10, 60) * 60 * 1000) : undefined,
        result: status === 'applied' ? 'Job successfully rerun' : 
               status === 'failed' ? 'Failed to resolve issue' : undefined,
        reasoning
      });
    }
  });
  
  // Latency anomaly interventions
  latencyRecords.filter(record => record.isAnomaly).forEach(record => {
    if (Math.random() < interventionRate) {
      const isSupervisedMode = Math.random() < 0.5;
      const isApproved = isSupervisedMode && Math.random() < 0.8;
      const isSuccessful = isApproved && Math.random() < 0.9;
      
      const status: RemediationStatus = !isSupervisedMode ? 'applied' :
                                      (isApproved ? (isSuccessful ? 'applied' : 'failed') : 
                                                   (Math.random() < 0.5 ? 'rejected' : 'pending'));
      
      const isTooSlow = record.deviation > 0;
      
      let action = '';
      let reasoning = '';
      
      if (isTooSlow) {
        action = 'Optimize query and increase parallelism';
        reasoning = `Pipeline runtime exceeded expected duration by ${record.deviation.toFixed(1)}%. Identified inefficient query patterns and applying optimization.`;
      } else {
        action = 'Investigate abnormally fast completion';
        reasoning = `Pipeline completed ${Math.abs(record.deviation).toFixed(1)}% faster than expected. Verifying data completeness and quality.`;
      }
      
      interventions.push({
        id: generateId(),
        pipelineId,
        timestamp: new Date(record.timestamp.getTime() + randomInt(5, 30) * 60 * 1000),
        agentType: 'latency',
        issue: `Latency anomaly: ${isTooSlow ? 'slower' : 'faster'} than expected by ${Math.abs(record.deviation).toFixed(1)}%`,
        action,
        confidence: randomInt(60, 90) / 100,
        status,
        approvedBy: isApproved ? randomPick(owners) : undefined,
        approvedAt: isApproved ? new Date(Date.now() - randomInt(10, 60) * 60 * 1000) : undefined,
        result: status === 'applied' ? (isTooSlow ? 'Reduced runtime by 35%' : 'Verified data integrity') : 
               status === 'failed' ? 'Failed to optimize performance' : undefined,
        reasoning
      });
    }
  });
  
  return interventions;
};

// Generate mock agent rules
export const generateMockAgentRules = (): AgentRule[] => {
  const now = new Date();
  
  return [
    {
      id: generateId(),
      name: 'Schema Drift - New Column',
      description: 'Automatically map newly added columns to downstream targets',
      agentType: 'schema',
      triggerCondition: 'Schema change type is ADD',
      action: 'Create mapping for new column and apply to downstream targets',
      enabled: true,
      requiresApproval: true,
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: generateId(),
      name: 'Schema Drift - Removed Column',
      description: 'Update downstream dependencies when a column is removed',
      agentType: 'schema',
      triggerCondition: 'Schema change type is REMOVE',
      action: 'Remove references to deleted column in downstream processes',
      enabled: true,
      requiresApproval: true,
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: generateId(),
      name: 'Schema Drift - Type Change',
      description: 'Update transformations when a column type changes',
      agentType: 'schema',
      triggerCondition: 'Schema change type is MODIFY and column.type has changed',
      action: 'Update data type conversions in transformations',
      enabled: true,
      requiresApproval: true,
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: generateId(),
      name: 'Job Failure - Out of Memory',
      description: 'Increase memory allocation when OOM errors occur',
      agentType: 'job',
      triggerCondition: 'Job status is FAILED and error type contains "OutOfMemory"',
      action: 'Increase memory allocation by 50% and retry job',
      enabled: true,
      requiresApproval: false,
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: generateId(),
      name: 'Job Failure - Timeout',
      description: 'Increase timeout threshold for long-running jobs',
      agentType: 'job',
      triggerCondition: 'Job status is FAILED and error type contains "Timeout"',
      action: 'Double timeout threshold and retry job',
      enabled: true,
      requiresApproval: false,
      createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: generateId(),
      name: 'Job Failure - Connection Error',
      description: 'Implement exponential backoff for connection issues',
      agentType: 'job',
      triggerCondition: 'Job status is FAILED and error type contains "Connection"',
      action: 'Retry with exponential backoff strategy',
      enabled: true,
      requiresApproval: false,
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: generateId(),
      name: 'Latency - Slow Performance',
      description: 'Optimize query performance for slow pipelines',
      agentType: 'latency',
      triggerCondition: 'Runtime > 1.3 * Expected Runtime',
      action: 'Apply query optimization techniques and increase concurrency',
      enabled: true,
      requiresApproval: true,
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      id: generateId(),
      name: 'Latency - Suspiciously Fast',
      description: 'Verify data completeness for abnormally fast pipelines',
      agentType: 'latency',
      triggerCondition: 'Runtime < 0.7 * Expected Runtime',
      action: 'Validate data completeness and quality',
      enabled: true,
      requiresApproval: true,
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
    }
  ];
};

// Generate system metrics
export const generateMockSystemMetrics = (pipelines: Pipeline[], interventions: AgentIntervention[]): SystemMetrics => {
  const now = new Date();
  
  const activePipelines = pipelines.filter(p => p.status === 'running').length;
  const failedPipelines = pipelines.filter(p => p.status === 'failed').length;
  const warningPipelines = pipelines.filter(p => p.status === 'warning').length;
  
  const totalInterventions = interventions.length;
  const successfulInterventions = interventions.filter(i => i.status === 'applied').length;
  const failedInterventions = interventions.filter(i => i.status === 'failed').length;
  
  // Calculate MTTR (mean time to resolution)
  const resolutionTimes: number[] = interventions
    .filter(i => i.status === 'applied' && i.approvedAt)
    .map(i => {
      const approvalTime = i.approvedAt as Date;
      const issueTime = i.timestamp;
      return (approvalTime.getTime() - issueTime.getTime()) / (60 * 1000); // in minutes
    });
  
  const mttr = resolutionTimes.length > 0 
    ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length 
    : 0;
  
  // Calculate average latency and deviation
  const avgLatency = pipelines.reduce((sum, p) => sum + p.avgRuntime, 0) / pipelines.length;
  
  return {
    timestamp: now,
    totalPipelines: pipelines.length,
    activePipelines,
    failedPipelines,
    warningPipelines,
    agentInterventions: totalInterventions,
    successfulInterventions,
    failedInterventions,
    mttr,
    avgLatency,
    avgDeviation: randomInt(5, 15) // Simplified for demo
  };
};

// Generate a complete mock dataset
export const generateMockData = () => {
  const pipelines = generateMockPipelines(10);
  const schemaVersionsMap = new Map<string, SchemaVersion[]>();
  const schemaChangesMap = new Map<string, SchemaChange[]>();
  const jobRunsMap = new Map<string, JobRun[]>();
  const latencyRecordsMap = new Map<string, LatencyRecord[]>();
  const interventionsMap = new Map<string, AgentIntervention[]>();
  
  pipelines.forEach(pipeline => {
    const schemaVersions = generateMockSchemaVersions(pipeline.id, randomInt(3, 8));
    schemaVersionsMap.set(pipeline.id, schemaVersions);
    
    const schemaChanges = generateMockSchemaChanges(pipeline.id, schemaVersions);
    schemaChangesMap.set(pipeline.id, schemaChanges);
    
    const jobRuns = generateMockJobRuns(pipeline.id, randomInt(20, 50));
    jobRunsMap.set(pipeline.id, jobRuns);
    
    const latencyRecords = generateMockLatencyRecords(pipeline.id, randomInt(30, 60));
    latencyRecordsMap.set(pipeline.id, latencyRecords);
  });
  
  // Generate interventions after all other data is created
  pipelines.forEach(pipeline => {
    const schemaChanges = schemaChangesMap.get(pipeline.id) || [];
    const jobRuns = jobRunsMap.get(pipeline.id) || [];
    const latencyRecords = latencyRecordsMap.get(pipeline.id) || [];
    
    const interventions = generateMockAgentInterventions(
      pipeline.id,
      schemaChanges,
      jobRuns,
      latencyRecords
    );
    
    interventionsMap.set(pipeline.id, interventions);
  });
  
  // Flatten all interventions
  const allInterventions = Array.from(interventionsMap.values()).flat();
  
  // Generate rules and metrics
  const rules = generateMockAgentRules();
  const metrics = generateMockSystemMetrics(pipelines, allInterventions);
  
  return {
    pipelines,
    schemaVersions: Array.from(schemaVersionsMap.values()).flat(),
    schemaChanges: Array.from(schemaChangesMap.values()).flat(),
    jobRuns: Array.from(jobRunsMap.values()).flat(),
    latencyRecords: Array.from(latencyRecordsMap.values()).flat(),
    interventions: allInterventions,
    rules,
    metrics
  };
};

// Create singleton instance of mock data
let mockDataInstance: ReturnType<typeof generateMockData> | null = null;

// Export a function to get or create mock data
export const getMockData = () => {
  if (!mockDataInstance) {
    mockDataInstance = generateMockData();
  }
  return mockDataInstance;
};
