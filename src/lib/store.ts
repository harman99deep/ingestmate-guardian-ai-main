import { create } from 'zustand';
import { 
  Pipeline, 
  SchemaVersion, 
  SchemaChange, 
  JobRun, 
  LatencyRecord, 
  AgentIntervention,
  AgentRule,
  AgentMode,
  SystemMetrics,
  RemediationStatus
} from '@/types';
import { getMockData } from './mockData';
import { RemediationEngine } from './agents';

interface AppState {
  // Data
  pipelines: Pipeline[];
  selectedPipelineId: string | null;
  schemaVersions: SchemaVersion[];
  schemaChanges: SchemaChange[];
  jobRuns: JobRun[];
  latencyRecords: LatencyRecord[];
  interventions: AgentIntervention[];
  rules: AgentRule[];
  metrics: SystemMetrics;
  
  // Agent mode
  agentMode: AgentMode;
  
  // UI state
  dashboardTab: 'overview' | 'agents' | 'logs' | 'settings';
  
  // Actions
  initialize: () => void;
  selectPipeline: (id: string | null) => void;
  setAgentMode: (mode: AgentMode) => void;
  setDashboardTab: (tab: 'overview' | 'agents' | 'logs' | 'settings') => void;
  approveIntervention: (id: string) => void;
  rejectIntervention: (id: string) => void;
  markManuallyFixed: (id: string) => void;
  
  // Filtered data selectors
  getSelectedPipeline: () => Pipeline | null;
  getSelectedPipelineInterventions: () => AgentIntervention[];
  getSelectedPipelineSchemaChanges: () => SchemaChange[];
  getSelectedPipelineJobRuns: () => JobRun[];
  getSelectedPipelineLatencyRecords: () => LatencyRecord[];
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial data
  pipelines: [],
  selectedPipelineId: null,
  schemaVersions: [],
  schemaChanges: [],
  jobRuns: [],
  latencyRecords: [],
  interventions: [],
  rules: [],
  metrics: {} as SystemMetrics,
  
  // Default agent mode (autonomous by default now)
  agentMode: 'autonomous',
  
  // Default UI state
  dashboardTab: 'overview',
  
  // Initialize application data
  initialize: () => {
    const mockData = getMockData();
    
    set({
      pipelines: mockData.pipelines,
      schemaVersions: mockData.schemaVersions,
      schemaChanges: mockData.schemaChanges,
      jobRuns: mockData.jobRuns,
      latencyRecords: mockData.latencyRecords,
      interventions: mockData.interventions,
      rules: mockData.rules,
      metrics: mockData.metrics,
      selectedPipelineId: mockData.pipelines.length > 0 ? mockData.pipelines[0].id : null
    });
  },
  
  // Select a pipeline
  selectPipeline: (id: string | null) => {
    set({ selectedPipelineId: id });
  },
  
  // Set agent mode
  setAgentMode: (mode: AgentMode) => {
    set({ agentMode: mode });
  },
  
  // Set dashboard tab
  setDashboardTab: (tab: 'overview' | 'agents' | 'logs' | 'settings') => {
    set({ dashboardTab: tab });
  },
  
  // Approve an intervention
  approveIntervention: (id: string) => {
    set(state => {
      // Update the intervention status
      const updatedInterventions = state.interventions.map(intervention => {
        if (intervention.id === id) {
          // Simulate success with 90% probability
          const isSuccessful = Math.random() < 0.9;
          
          return {
            ...intervention,
            status: isSuccessful ? 'applied' as RemediationStatus : 'failed' as RemediationStatus,
            approvedBy: 'Current User',
            approvedAt: new Date(),
            result: isSuccessful ? 'Successfully applied remediation' : 'Failed to apply remediation'
          };
        }
        return intervention;
      });
      
      return { interventions: updatedInterventions };
    });
  },
  
  // Reject an intervention
  rejectIntervention: (id: string) => {
    set(state => {
      // Update the intervention status
      const updatedInterventions = state.interventions.map(intervention => {
        if (intervention.id === id) {
          return {
            ...intervention,
            status: 'rejected' as RemediationStatus,
            approvedBy: 'Current User',
            approvedAt: new Date()
          };
        }
        return intervention;
      });
      
      return { interventions: updatedInterventions };
    });
  },
  
  // Mark intervention as fixed manually
  markManuallyFixed: (id: string) => {
    set(state => {
      const updatedInterventions = state.interventions.map(intervention => {
        if (intervention.id === id) {
          return {
            ...intervention,
            status: "applied" as RemediationStatus,
            result: "Issue was fixed manually by user",
            approvedBy: "Current User",
            approvedAt: new Date(),
          };
        }
        return intervention;
      });
      return { interventions: updatedInterventions };
    });
  },
  
  // Get the currently selected pipeline
  getSelectedPipeline: () => {
    const { pipelines, selectedPipelineId } = get();
    return pipelines.find(p => p.id === selectedPipelineId) || null;
  },
  
  // Get interventions for the selected pipeline
  getSelectedPipelineInterventions: () => {
    const { interventions, selectedPipelineId } = get();
    return selectedPipelineId 
      ? interventions.filter(i => i.pipelineId === selectedPipelineId)
      : interventions;
  },
  
  // Get schema changes for the selected pipeline
  getSelectedPipelineSchemaChanges: () => {
    const { schemaChanges, selectedPipelineId } = get();
    return selectedPipelineId 
      ? schemaChanges.filter(c => c.pipelineId === selectedPipelineId)
      : schemaChanges;
  },
  
  // Get job runs for the selected pipeline
  getSelectedPipelineJobRuns: () => {
    const { jobRuns, selectedPipelineId } = get();
    return selectedPipelineId 
      ? jobRuns.filter(r => r.pipelineId === selectedPipelineId)
      : jobRuns;
  },
  
  // Get latency records for the selected pipeline
  getSelectedPipelineLatencyRecords: () => {
    const { latencyRecords, selectedPipelineId } = get();
    return selectedPipelineId 
      ? latencyRecords.filter(r => r.pipelineId === selectedPipelineId)
      : latencyRecords;
  }
}));
