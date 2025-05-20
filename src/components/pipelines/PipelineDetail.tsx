import { useAppStore } from "@/lib/store";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PipelineHealthChart } from "@/components/charts/PipelineHealthChart";
import { InterventionCard } from "@/components/interventions/InterventionCard";
import { Separator } from "@/components/ui/separator";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { Activity, Database, Clock, FileBarChart, ListChecks, BarChart4 } from "lucide-react";
import { useMemo } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

export function PipelineDetail() {
  const selectedPipelineId = useAppStore((state) => state.selectedPipelineId);
  const pipeline = useMemo(() => {
    return useAppStore.getState().getSelectedPipeline();
  }, [selectedPipelineId]);
  
  const schemaChanges = useMemo(() => {
    return useAppStore.getState().getSelectedPipelineSchemaChanges();
  }, [selectedPipelineId]);
  
  const jobRuns = useMemo(() => {
    return useAppStore.getState().getSelectedPipelineJobRuns();
  }, [selectedPipelineId]);
  
  const latencyRecords = useMemo(() => {
    return useAppStore.getState().getSelectedPipelineLatencyRecords();
  }, [selectedPipelineId]);
  
  const interventions = useMemo(() => {
    return useAppStore.getState().getSelectedPipelineInterventions();
  }, [selectedPipelineId]);

  if (!pipeline) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg">
        <p className="text-muted-foreground">Select a pipeline to view details</p>
      </div>
    );
  }

  const failedJobsCount = jobRuns.filter(job => job.status === 'failed').length;
  const recentSchemaChangesCount = schemaChanges.filter(
    change => (new Date().getTime() - new Date(change.timestamp).getTime()) < 7 * 24 * 60 * 60 * 1000
  ).length;
  const latencyAnomaliesCount = latencyRecords.filter(record => record.isAnomaly).length;
  const successfulInterventionsCount = interventions.filter(i => i.status === 'applied').length;
  
  const healthTrendData = latencyRecords
    .slice(0, 20)
    .map(record => {
      const healthScore = Math.max(0, Math.min(100, 100 - (record.deviation > 0 ? record.deviation : 0)));
      return {
        timestamp: record.timestamp,
        health: Math.round(healthScore)
      };
    })
    .reverse();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{pipeline.name}</h1>
          <p className="text-muted-foreground mt-1">{pipeline.description}</p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "capitalize px-3 py-1 text-base",
            pipeline.status === "running" && "border-info bg-info/10 text-info",
            pipeline.status === "failed" && "border-error bg-error/10 text-error",
            pipeline.status === "completed" && "border-success bg-success/10 text-success",
            pipeline.status === "warning" && "border-warning bg-warning/10 text-warning"
          )}
        >
          {pipeline.status}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Failed Jobs"
          value={failedJobsCount}
          icon={<Activity />}
          description={`Out of ${jobRuns.length} total runs`}
        />
        <StatusCard
          title="Schema Changes"
          value={recentSchemaChangesCount}
          icon={<Database />}
          description="In the last 7 days"
        />
        <StatusCard
          title="Latency Anomalies"
          value={latencyAnomaliesCount}
          icon={<Clock />}
          description={`${Math.round((latencyAnomaliesCount / latencyRecords.length) * 100)}% of runs`}
        />
        <StatusCard
          title="Agent Interventions"
          value={successfulInterventionsCount}
          icon={<FileBarChart />}
          description={`${interventions.length} total interventions`}
        />
      </div>
      
      <ResizablePanelGroup direction="horizontal" className="w-full">
        <ResizablePanel defaultSize={65} minSize={30} maxSize={90}>
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <PipelineHealthChart 
              data={healthTrendData}
              title="Pipeline Health"
              description="Based on runtime and success rate"
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={35} minSize={10} maxSize={70}>
          <div className="border rounded-lg p-4 h-full">
            <h3 className="font-medium mb-4">Pipeline Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source</span>
                <span className="font-medium">{pipeline.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destination</span>
                <span className="font-medium">{pipeline.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner</span>
                <span className="font-medium">{pipeline.owner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Run</span>
                <span className="font-medium">{format(pipeline.lastRun, "MMM d, h:mm a")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Run</span>
                <span className="font-medium">
                  {pipeline.nextRun ? format(pipeline.nextRun, "MMM d, h:mm a") : "Not scheduled"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Runtime</span>
                <span className="font-medium">
                  {pipeline.avgRuntime > 60
                    ? `${Math.floor(pipeline.avgRuntime / 60)}m ${pipeline.avgRuntime % 60}s`
                    : `${pipeline.avgRuntime}s`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Health Score</span>
                <span className={cn(
                  "font-medium",
                  pipeline.health >= 80 && "text-success",
                  pipeline.health >= 50 && pipeline.health < 80 && "text-warning",
                  pipeline.health < 50 && "text-error"
                )}>
                  {pipeline.health}%
                </span>
              </div>
              <Separator />
              <div>
                <span className="text-muted-foreground">Tags</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {pipeline.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      <Tabs defaultValue="interventions" className="mt-6">
        <TabsList>
          <TabsTrigger value="interventions" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            <span>Interventions</span>
          </TabsTrigger>
          <TabsTrigger value="schema" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Schema Changes</span>
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Job Runs</span>
          </TabsTrigger>
          <TabsTrigger value="latency" className="flex items-center gap-2">
            <BarChart4 className="h-4 w-4" />
            <span>Latency</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="interventions" className="mt-6">
          {interventions.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-muted-foreground">No interventions for this pipeline.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {interventions
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 6)
                .map((intervention) => (
                  <InterventionCard
                    key={intervention.id}
                    intervention={intervention}
                  />
                ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="schema" className="mt-6">
          {schemaChanges.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-muted-foreground">No schema changes for this pipeline.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Change Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Column
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Impact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {schemaChanges
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((change) => (
                        <tr key={change.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {format(new Date(change.timestamp), "MMM d, h:mm a")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge
                              variant="outline"
                              className={cn(
                                "capitalize",
                                change.changeType === "add" && "border-success bg-success/10 text-success",
                                change.changeType === "remove" && "border-error bg-error/10 text-error",
                                change.changeType === "modify" && "border-warning bg-warning/10 text-warning"
                              )}
                            >
                              {change.changeType}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {change.column.name}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({change.column.type})
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge
                              variant="outline"
                              className={cn(
                                "capitalize",
                                change.impact === "low" && "border-success bg-success/10 text-success",
                                change.impact === "medium" && "border-warning bg-warning/10 text-warning",
                                change.impact === "high" && "border-error bg-error/10 text-error"
                              )}
                            >
                              {change.impact}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {change.description}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="jobs" className="mt-6">
          {jobRuns.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-muted-foreground">No job runs for this pipeline.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        End Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Records
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Runtime
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {jobRuns
                      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                      .slice(0, 10)
                      .map((run) => (
                        <tr key={run.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {format(new Date(run.startTime), "MMM d, h:mm a")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {run.endTime
                              ? format(new Date(run.endTime), "MMM d, h:mm a")
                              : "Running..."}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge
                              variant="outline"
                              className={cn(
                                "capitalize",
                                run.status === "running" && "border-info bg-info/10 text-info",
                                run.status === "failed" && "border-error bg-error/10 text-error",
                                run.status === "completed" && "border-success bg-success/10 text-success",
                                run.status === "warning" && "border-warning bg-warning/10 text-warning"
                              )}
                            >
                              {run.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {run.records.processed.toLocaleString()}
                            {run.records.failed > 0 && (
                              <span className="text-error ml-1">
                                ({run.records.failed.toLocaleString()} failed)
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {run.runtime > 60
                              ? `${Math.floor(run.runtime / 60)}m ${Math.round(run.runtime % 60)}s`
                              : `${Math.round(run.runtime)}s`}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {run.errorMessage || "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="latency" className="mt-6">
          {latencyRecords.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-muted-foreground">No latency data for this pipeline.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Runtime
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Expected
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Deviation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {latencyRecords
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .slice(0, 10)
                      .map((record) => (
                        <tr key={record.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {format(new Date(record.timestamp), "MMM d, h:mm a")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {record.runtime > 60
                              ? `${Math.floor(record.runtime / 60)}m ${Math.round(record.runtime % 60)}s`
                              : `${Math.round(record.runtime)}s`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {record.expectedRuntime > 60
                              ? `${Math.floor(record.expectedRuntime / 60)}m ${Math.round(record.expectedRuntime % 60)}s`
                              : `${Math.round(record.expectedRuntime)}s`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={cn(
                                record.deviation > 30 && "text-error",
                                record.deviation > 10 && record.deviation <= 30 && "text-warning",
                                record.deviation <= 10 && record.deviation >= -10 && "text-success",
                                record.deviation < -10 && record.deviation >= -30 && "text-warning",
                                record.deviation < -30 && "text-error"
                              )}
                            >
                              {record.deviation > 0 ? "+" : ""}
                              {record.deviation.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge
                              variant="outline"
                              className={cn(
                                record.isAnomaly
                                  ? "border-error bg-error/10 text-error"
                                  : "border-success bg-success/10 text-success"
                              )}
                            >
                              {record.isAnomaly ? "Anomaly" : "Normal"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
