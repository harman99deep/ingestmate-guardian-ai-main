
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListFilter, BarChart4, ChartBar, Gauge, Info } from "lucide-react";

export default function AnalyticsPage() {
  const mttr = (Math.random() * 60 + 40).toFixed(1); // 40-100 min
  const uptime = (98 + Math.random()).toFixed(2);
  const interventionSuccess = (90 + Math.random() * 10).toFixed(1);
  const driftEvents = Math.floor(5 + Math.random() * 7);
  const avgLatency = (Math.random() * 3 + 2).toFixed(2);
  const agentCoverage = (80 + Math.random() * 15).toFixed(1);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <ListFilter className="text-primary" /> Analytics
      </h1>
      <p className="text-muted-foreground">
        Visualize trends and KPIs across your pipelines and agents. Use these analytics to measure uptime, error rates, agent validation, mean time to resolution (MTTR), and more.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-success">{uptime}%</div>
            <div className="text-xs text-muted-foreground mt-2">Rolling 30 day uptime</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Intervention Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-primary">{interventionSuccess}%</div>
            <div className="text-xs text-muted-foreground mt-2">Across all agent remediations</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg MTTR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-warning">{mttr}min</div>
            <div className="text-xs text-muted-foreground mt-2">Mean time to remediation</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Agent Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-blue-500">{agentCoverage}%</div>
            <div className="text-xs text-muted-foreground mt-2">Pipelines managed by agents</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Schema Drift Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-error">{driftEvents}</div>
            <div className="text-xs text-muted-foreground mt-2">Detected this month</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg Pipeline Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-purple-500">{avgLatency} min</div>
            <div className="text-xs text-muted-foreground mt-2">Mean runtime (last 7 days)</div>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground mt-2">Detailed analytics and custom reports coming soon!</p>
    </div>
  );
}
