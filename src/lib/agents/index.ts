import { 
  Pipeline, 
  SchemaChange, 
  JobRun, 
  LatencyRecord, 
  AgentIntervention,
  AgentRule,
  RemediationStatus,
  AgentMode
} from '@/types';

// Agent interface
export interface Agent {
  name: string;
  description: string;
  detect: (data: any) => DetectionResult[];
  remediate: (issue: DetectionResult, mode: AgentMode) => RemediationResult;
}

// Detection result
export interface DetectionResult {
  pipelineId: string;
  timestamp: Date;
  issueType: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  data: any;
}

// Remediation result
export interface RemediationResult {
  action: string;
  confidence: number;
  status: RemediationStatus;
  reasoning: string;
  appliedActions?: string[];
}

// Schema Drift Agent
export const SchemaAgent: Agent = {
  name: 'Schema Drift Agent',
  description: 'Detects and remediates schema changes across pipelines',
  
  detect: (data: { changes: SchemaChange[], rules: AgentRule[] }) => {
    const { changes } = data;
    
    return changes.map(change => {
      // Determine severity based on change impact and type
      let severity: 'low' | 'medium' | 'high' = change.impact;
      
      // Add more logic for severity if needed
      if (change.changeType === 'remove' && change.impact === 'high') {
        severity = 'high';
      }
      
      return {
        pipelineId: change.pipelineId,
        timestamp: change.timestamp,
        issueType: `schema_drift_${change.changeType}`,
        description: change.description,
        severity,
        data: change
      };
    });
  },
  
  remediate: (issue: DetectionResult, mode: AgentMode) => {
    const change = issue.data as SchemaChange;
    let action = '';
    let reasoning = '';
    let confidence = 0.85;
    const appliedActions: string[] = [];
    
    // Different remediation strategies based on change type
    if (change.changeType === 'add') {
      action = `Add mapping for new column ${change.column.name}`;
      reasoning = `New column detected in schema. Added mapping to downstream tables and processes.`;
      confidence = 0.9;
      
      if (mode === 'autonomous') {
        appliedActions.push(`Created mapping for column ${change.column.name}`);
        appliedActions.push(`Updated downstream dependencies`);
      }
    } else if (change.changeType === 'remove') {
      action = `Remove references to deleted column ${change.column.name}`;
      reasoning = `Column was removed from source schema. Updated downstream dependencies to handle missing field.`;
      confidence = 0.85;
      
      if (mode === 'autonomous') {
        appliedActions.push(`Removed references to column ${change.column.name}`);
        appliedActions.push(`Applied null handling for downstream consumers`);
      }
    } else if (change.changeType === 'modify') {
      action = `Update data transformations for modified column ${change.column.name}`;
      reasoning = `Column type changed from ${change.previousColumn?.type} to ${change.column.type}. Adjusted transformations accordingly.`;
      confidence = 0.75;
      
      if (mode === 'autonomous') {
        appliedActions.push(`Updated transformation logic for column ${change.column.name}`);
        appliedActions.push(`Added data type validation`);
      }
    } else {
      action = `Investigate schema change for column ${change.column.name}`;
      reasoning = `Unrecognized schema change pattern. Needs manual review.`;
      confidence = 0.6;
    }
    
    return {
      action,
      confidence,
      status: mode === 'autonomous' ? 'applied' : 'pending',
      reasoning,
      appliedActions: mode === 'autonomous' ? appliedActions : undefined
    };
  }
};

// Job Failure Agent
export const JobAgent: Agent = {
  name: 'Job Failure Agent',
  description: 'Detects and remediates failed pipeline jobs',
  
  detect: (data: { runs: JobRun[], rules: AgentRule[] }) => {
    const { runs } = data;
    const failedRuns = runs.filter(run => run.status === 'failed');
    
    return failedRuns.map(run => {
      // Determine severity based on error type and failure impact
      let severity: 'low' | 'medium' | 'high' = 'medium';
      
      if (run.errorType === 'OutOfMemoryError' || run.errorType === 'ConnectionError') {
        severity = 'high';
      } else if (run.errorType === 'ValidationError' || run.errorType === 'ParseError') {
        severity = 'medium';
      } else {
        severity = 'low';
      }
      
      return {
        pipelineId: run.pipelineId,
        timestamp: run.endTime || new Date(),
        issueType: `job_failure_${run.errorType?.toLowerCase().replace(/error$/i, '')}`,
        description: `Job failed with error: ${run.errorMessage}`,
        severity,
        data: run
      };
    });
  },
  
  remediate: (issue: DetectionResult, mode: AgentMode) => {
    const run = issue.data as JobRun;
    let action = '';
    let reasoning = '';
    let confidence = 0.8;
    const appliedActions: string[] = [];
    
    // Different remediation strategies based on error type
    if (run.errorType?.includes('OutOfMemory')) {
      action = 'Increase memory allocation and retry job';
      reasoning = 'Job failed due to memory constraints. Temporarily increasing allocation to handle peak loads.';
      confidence = 0.9;
      
      if (mode === 'autonomous') {
        appliedActions.push(`Increased memory allocation by 50%`);
        appliedActions.push(`Resubmitted job with new configuration`);
      }
    } else if (run.errorType?.includes('Timeout')) {
      action = 'Increase timeout threshold and retry job';
      reasoning = 'Job exceeded timeout limits. Adjusting timeout settings to accommodate larger data volume.';
      confidence = 0.85;
      
      if (mode === 'autonomous') {
        appliedActions.push(`Doubled timeout threshold`);
        appliedActions.push(`Resubmitted job with new configuration`);
      }
    } else if (run.errorType?.includes('Connection')) {
      action = 'Retry connection with exponential backoff';
      reasoning = 'Detected transient connection issue. Implementing retry mechanism with exponential backoff.';
      confidence = 0.8;
      
      if (mode === 'autonomous') {
        appliedActions.push(`Implemented exponential backoff strategy`);
        appliedActions.push(`Resubmitted job with retry logic`);
      }
    } else if (run.errorType?.includes('Validation') || run.errorType?.includes('Parse')) {
      action = 'Add data validation and error handling';
      reasoning = 'Input data quality issues detected. Adding validation checks and error handling for bad records.';
      confidence = 0.75;
      
      if (mode === 'autonomous') {
        appliedActions.push(`Added data validation checks`);
        appliedActions.push(`Implemented error handling for malformed records`);
        appliedActions.push(`Resubmitted job with updated logic`);
      }
    } else {
      action = 'Apply generic error handling and retry';
      reasoning = `Unrecognized error pattern: ${run.errorType}. Applying generic recovery strategy.`;
      confidence = 0.6;
      
      if (mode === 'autonomous') {
        appliedActions.push(`Applied generic error handling`);
        appliedActions.push(`Resubmitted job with recovery logic`);
      }
    }
    
    return {
      action,
      confidence,
      status: mode === 'autonomous' ? 'applied' : 'pending',
      reasoning,
      appliedActions: mode === 'autonomous' ? appliedActions : undefined
    };
  }
};

// Latency Anomaly Agent
export const LatencyAgent: Agent = {
  name: 'Latency Anomaly Agent',
  description: 'Detects and remediates pipeline latency anomalies',
  
  detect: (data: { records: LatencyRecord[], rules: AgentRule[] }) => {
    const { records } = data;
    const anomalies = records.filter(record => record.isAnomaly);
    
    return anomalies.map(record => {
      // Determine severity based on deviation magnitude
      let severity: 'low' | 'medium' | 'high' = 'low';
      const absDeviation = Math.abs(record.deviation);
      
      if (absDeviation > 50) {
        severity = 'high';
      } else if (absDeviation > 20) {
        severity = 'medium';
      }
      
      const isTooSlow = record.deviation > 0;
      
      return {
        pipelineId: record.pipelineId,
        timestamp: record.timestamp,
        issueType: isTooSlow ? 'latency_slow' : 'latency_fast',
        description: `Pipeline runtime ${isTooSlow ? 'exceeded' : 'undercut'} expected duration by ${absDeviation.toFixed(1)}%`,
        severity,
        data: record
      };
    });
  },
  
  remediate: (issue: DetectionResult, mode: AgentMode) => {
    const record = issue.data as LatencyRecord;
    let action = '';
    let reasoning = '';
    let confidence = 0.75;
    const appliedActions: string[] = [];
    
    const isTooSlow = record.deviation > 0;
    const absDeviation = Math.abs(record.deviation);
    
    if (isTooSlow) {
      if (absDeviation > 50) {
        action = 'Apply comprehensive performance optimization';
        reasoning = `Severe performance degradation detected (${absDeviation.toFixed(1)}% slower). Applying multiple optimization techniques.`;
        confidence = 0.85;
        
        if (mode === 'autonomous') {
          appliedActions.push(`Optimized query execution plan`);
          appliedActions.push(`Increased parallelism`);
          appliedActions.push(`Added performance monitoring`);
        }
      } else {
        action = 'Optimize query and adjust resource allocation';
        reasoning = `Pipeline runtime exceeded expected duration by ${absDeviation.toFixed(1)}%. Applying targeted optimizations.`;
        confidence = 0.8;
        
        if (mode === 'autonomous') {
          appliedActions.push(`Applied query optimization`);
          appliedActions.push(`Adjusted resource allocation`);
        }
      }
    } else {
      if (absDeviation > 30) {
        action = 'Verify data completeness and integrity';
        reasoning = `Pipeline completed ${absDeviation.toFixed(1)}% faster than expected. This significant deviation requires data completeness verification.`;
        confidence = 0.7;
        
        if (mode === 'autonomous') {
          appliedActions.push(`Ran data integrity checks`);
          appliedActions.push(`Verified record counts against source`);
          appliedActions.push(`Updated runtime expectations`);
        }
      } else {
        action = 'Update runtime expectations';
        reasoning = `Pipeline consistently running ${absDeviation.toFixed(1)}% faster than expected. Adjusting baseline performance metrics.`;
        confidence = 0.9;
        
        if (mode === 'autonomous') {
          appliedActions.push(`Updated expected runtime baseline`);
        }
      }
    }
    
    return {
      action,
      confidence,
      status: mode === 'autonomous' ? 'applied' : 'pending',
      reasoning,
      appliedActions: mode === 'autonomous' ? appliedActions : undefined
    };
  }
};

// Remediation engine
export const RemediationEngine = {
  // Process detection results and generate interventions
  processDetections: (
    detections: DetectionResult[], 
    mode: AgentMode,
    existingInterventions: AgentIntervention[] = []
  ): AgentIntervention[] => {
    const interventions: AgentIntervention[] = [];
    
    // Group detections by pipeline and issue type to avoid duplicate interventions
    const groupedDetections = new Map<string, DetectionResult>();
    
    detections.forEach(detection => {
      const key = `${detection.pipelineId}_${detection.issueType}`;
      
      // Only keep the most recent detection for each issue type on each pipeline
      if (!groupedDetections.has(key) || 
          groupedDetections.get(key)!.timestamp < detection.timestamp) {
        groupedDetections.set(key, detection);
      }
    });
    
    // Process each unique detection
    Array.from(groupedDetections.values()).forEach(detection => {
      // Check if there's already an intervention for this issue
      const existingIntervention = existingInterventions.find(
        i => i.pipelineId === detection.pipelineId && 
             i.issue.includes(detection.issueType) &&
             i.status !== 'failed' && 
             i.status !== 'rejected'
      );
      
      // Skip if there's already a pending or applied intervention
      if (existingIntervention) {
        return;
      }
      
      // Select the appropriate agent
      let agent: Agent;
      if (detection.issueType.startsWith('schema_drift')) {
        agent = SchemaAgent;
      } else if (detection.issueType.startsWith('job_failure')) {
        agent = JobAgent;
      } else if (detection.issueType.startsWith('latency')) {
        agent = LatencyAgent;
      } else {
        return; // Skip unknown issue types
      }
      
      // Generate remediation
      const remediation = agent.remediate(detection, mode);
      
      // Create intervention
      const intervention: AgentIntervention = {
        id: Math.random().toString(36).substring(2, 15),
        pipelineId: detection.pipelineId,
        timestamp: new Date(),
        agentType: detection.issueType.startsWith('schema_drift') ? 'schema' :
                  detection.issueType.startsWith('job_failure') ? 'job' : 'latency',
        issue: detection.description,
        action: remediation.action,
        confidence: remediation.confidence,
        status: remediation.status,
        reasoning: remediation.reasoning,
        result: mode === 'autonomous' ? 
                `Applied actions: ${remediation.appliedActions?.join(', ')}` : 
                undefined
      };
      
      interventions.push(intervention);
    });
    
    return interventions;
  }
};

// Export all agents
export const agents = {
  schema: SchemaAgent,
  job: JobAgent,
  latency: LatencyAgent
};
