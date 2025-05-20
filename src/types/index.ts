
/**
 * Core type definitions for IngestMate
 */

// Pipeline status options
export type PipelineStatus = 'running' | 'failed' | 'completed' | 'warning';

// Remediation status
export type RemediationStatus = 'pending' | 'approved' | 'rejected' | 'applied' | 'failed';

// Agent modes
export type AgentMode = 'supervised' | 'autonomous';

// Pipeline metadata
export interface Pipeline {
  id: string;
  name: string;
  description: string;
  status: PipelineStatus;
  lastRun: Date;
  nextRun: Date | null;
  avgRuntime: number; // in seconds
  source: string;
  destination: string;
  owner: string;
  tags: string[];
  health: number; // 0-100 health score
}

// Schema change types
export type SchemaChangeType = 'add' | 'remove' | 'modify' | 'rename';

// Schema column definition
export interface SchemaColumn {
  name: string;
  type: string;
  nullable: boolean;
  description?: string;
}

// Schema version
export interface SchemaVersion {
  id: string;
  pipelineId: string;
  version: number;
  timestamp: Date;
  columns: SchemaColumn[];
}

// Schema change detection
export interface SchemaChange {
  id: string;
  pipelineId: string;
  fromVersion: number;
  toVersion: number;
  timestamp: Date;
  changeType: SchemaChangeType;
  column: SchemaColumn;
  previousColumn?: SchemaColumn; // For modifications
  impact: 'low' | 'medium' | 'high'; // Risk level
  description: string;
}

// Job run details
export interface JobRun {
  id: string;
  pipelineId: string;
  startTime: Date;
  endTime: Date | null;
  status: PipelineStatus;
  records: {
    processed: number;
    failed: number;
    skipped: number;
  };
  runtime: number; // in seconds
  errorMessage?: string;
  errorType?: string;
  errorStackTrace?: string;
  memoryUsage?: number; // in MB
  cpuUsage?: number; // percentage
}

// Latency record
export interface LatencyRecord {
  id: string;
  pipelineId: string;
  timestamp: Date;
  runtime: number; // in seconds
  expectedRuntime: number; // in seconds
  deviation: number; // percentage deviation from expected
  isAnomaly: boolean;
}

// Agent intervention record
export interface AgentIntervention {
  id: string;
  pipelineId: string;
  timestamp: Date;
  agentType: 'schema' | 'job' | 'latency';
  issue: string;
  action: string;
  confidence: number; // 0-1 confidence score
  status: RemediationStatus;
  approvedBy?: string;
  approvedAt?: Date;
  result?: string;
  reasoning: string;
}

// Agent rule
export interface AgentRule {
  id: string;
  name: string;
  description: string;
  agentType: 'schema' | 'job' | 'latency';
  triggerCondition: string;
  action: string;
  enabled: boolean;
  requiresApproval: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// System metrics
export interface SystemMetrics {
  timestamp: Date;
  totalPipelines: number;
  activePipelines: number;
  failedPipelines: number;
  warningPipelines: number;
  agentInterventions: number;
  successfulInterventions: number;
  failedInterventions: number;
  mttr: number; // Mean time to resolution in minutes
  avgLatency: number; // Average runtime across all pipelines
  avgDeviation: number; // Average deviation from expected runtime
}
