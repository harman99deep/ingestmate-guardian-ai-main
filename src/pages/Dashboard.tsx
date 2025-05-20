import { useAppStore } from "@/lib/store";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { PipelineHealthChart } from "@/components/charts/PipelineHealthChart";
import { InterventionStatChart } from "@/components/charts/InterventionStatChart";
import { InterventionCard } from "@/components/interventions/InterventionCard";
import { Button } from "@/components/ui/button";
import { Database, Activity, Clock, FileBarChart } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const metrics = useAppStore((state) => state.metrics);
  const pipelines = useAppStore((state) => state.pipelines);
  const interventions = useAppStore((state) => state.interventions);

  const { toast } = useToast();
  const navigate = useNavigate();

  // Calculate health trend
  const healthTrend = Array.from({ length: 10 }, (_, i) => ({
    timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    health: Math.round(85 - Math.random() * 15 + Math.sin(i) * 10),
  })).reverse();
  
  // Calculate intervention stats
  const interventionStats = [
    { agentType: "schema" as const, status: "applied" as const, count: interventions.filter(i => i.agentType === "schema" && i.status === "applied").length },
    { agentType: "schema" as const, status: "pending" as const, count: interventions.filter(i => i.agentType === "schema" && i.status === "pending").length },
    { agentType: "schema" as const, status: "rejected" as const, count: interventions.filter(i => i.agentType === "schema" && i.status === "rejected").length },
    { agentType: "schema" as const, status: "failed" as const, count: interventions.filter(i => i.agentType === "schema" && i.status === "failed").length },
    { agentType: "job" as const, status: "applied" as const, count: interventions.filter(i => i.agentType === "job" && i.status === "applied").length },
    { agentType: "job" as const, status: "pending" as const, count: interventions.filter(i => i.agentType === "job" && i.status === "pending").length },
    { agentType: "job" as const, status: "rejected" as const, count: interventions.filter(i => i.agentType === "job" && i.status === "rejected").length },
    { agentType: "job" as const, status: "failed" as const, count: interventions.filter(i => i.agentType === "job" && i.status === "failed").length },
    { agentType: "latency" as const, status: "applied" as const, count: interventions.filter(i => i.agentType === "latency" && i.status === "applied").length },
    { agentType: "latency" as const, status: "pending" as const, count: interventions.filter(i => i.agentType === "latency" && i.status === "pending").length },
    { agentType: "latency" as const, status: "rejected" as const, count: interventions.filter(i => i.agentType === "latency" && i.status === "rejected").length },
    { agentType: "latency" as const, status: "failed" as const, count: interventions.filter(i => i.agentType === "latency" && i.status === "failed").length }
  ];

  // Get pending interventions for the action center
  const pendingInterventions = interventions
    .filter(i => i.status === "pending")
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3);

  // Compute MTTR in range 40-100 minutes - ensure sync with AnalyticsPage
  const simulatedMttr = (Math.random() * 60 + 40).toFixed(1);

  // Show notification for first critical pipeline
  useEffect(() => {
    const critical = pipelines.find(
      (p) => p.status === "failed" || p.status === "warning"
    );
    if (critical) {
      toast({
        title: `⚠️ Issue detected: ${critical.name}`,
        description: `${critical.status === "failed"
            ? "This pipeline has failed."
            : "Warning detected in this pipeline."
          } Source: ${critical.source} → Destination: ${critical.destination}. Owner: ${critical.owner}`,
        action: (
          <Button
            variant="outline"
            size="sm"
            className="mt-1"
            onClick={() => {
              navigate(`/pipelines?id=${critical.id}`);
            }}
          >
            View pipeline
          </Button>
        ),
        duration: 10000,
      });
    }
    // Only show on mount or when pipelines changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelines, toast, navigate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">IngestMate Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Autonomous pipeline monitoring and self-healing
          </p>
        </div>
        <Link to="/pipelines">
          <Button variant="outline">View All Pipelines</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard 
          title="Total Pipelines" 
          value={pipelines.length} 
          icon={<Database />}
          description={`${pipelines.filter(p => p.status === "running").length} currently active`}
          onClick={() => navigate("/pipelines")}
        />
        <StatusCard 
          title="Failed Pipelines" 
          value={pipelines.filter(p => p.status === "failed").length} 
          icon={<Activity />}
          description={`${Math.round((pipelines.filter(p => p.status === "failed").length / pipelines.length) * 100)}% of total pipelines`}
          trend={pipelines.filter(p => p.status === "failed").length > 2 ? "up" : "down"}
          trendValue={pipelines.filter(p => p.status === "failed").length > 2 ? "+12% from last week" : "-8% from last week"}
          onClick={() => navigate("/pipelines")}
        />
        <StatusCard 
          title="Agent Interventions" 
          value={interventions.length} 
          icon={<FileBarChart />}
          description={`${interventions.filter(i => i.status === "applied").length} successfully applied`}
          trend="down"
          trendValue="-5% from last week"
          onClick={() => navigate("/interventions")}
        />
        <StatusCard 
          title="Avg. MTTR" 
          value={`${simulatedMttr}m`}
          icon={<Clock />}
          description="Mean time to resolution"
          trend="down"
          trendValue="-12% from last week"
          onClick={() => navigate("/analytics")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PipelineHealthChart 
            data={healthTrend}
            title="Overall Pipeline Health"
            description="System-wide health score over time"
          />
        </div>
        <div>
          <InterventionStatChart 
            data={interventionStats}
            title="Agent Interventions"
            description="By agent type and status"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Critical Pipelines</h2>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Pipeline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Health
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Owner
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {pipelines
                    .filter(p => p.status === "failed" || p.status === "warning")
                    .slice(0, 5)
                    .map((pipeline) => (
                      <tr key={pipeline.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link to={`/pipelines?id=${pipeline.id}`} className="hover:underline">
                            {pipeline.name}
                          </Link>
                          <div className="text-xs text-muted-foreground mt-1">
                            {pipeline.source} → {pipeline.destination}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center ${
                            pipeline.status === "failed" ? "bg-error/10 text-error" : "bg-warning/10 text-warning"
                          }`}>
                            {pipeline.status === "failed" ? "Failed" : "Warning"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                pipeline.health >= 80 ? "bg-success" : 
                                pipeline.health >= 50 ? "bg-warning" : "bg-error"
                              }`}
                              style={{ width: `${pipeline.health}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-right mt-1">{pipeline.health}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {pipeline.owner}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Action Center</h2>
          {pendingInterventions.length === 0 ? (
            <div className="border rounded-lg p-6 text-center">
              <p className="text-muted-foreground">No pending interventions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingInterventions.map(intervention => (
                <InterventionCard key={intervention.id} intervention={intervention} />
              ))}
              {interventions.filter(i => i.status === "pending").length > 3 && (
                <Link to="/interventions">
                  <Button variant="outline" className="w-full">
                    View All Pending Interventions
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
