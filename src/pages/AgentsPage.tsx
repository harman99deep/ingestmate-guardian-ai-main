
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListCollapse, Link as LinkIcon, Edit2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import LinkAgentsModal from "@/components/agents/LinkAgentsModal";
import PipelineAgentsTable from "@/components/agents/PipelineAgentsTable";

export default function AgentsPage() {
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ListCollapse className="text-primary" /> Agents Overview
        </h1>
        <Button onClick={() => setLinkModalOpen(true)} variant="default">
          <LinkIcon className="mr-2" /> Link Agents to Pipeline
        </Button>
      </div>
      <p className="text-muted-foreground max-w-xl">
        Agents monitor your data pipelines for issues and anomalies, suggest interventions, and can even auto-remediate problems. 
        Each agent specializes in certain tasks: 
        <br/><br/>
        <b>• Schema Drift Agent:</b> Tracks and manages changes in schemas.<br/>
        <b>• Job Failure Agent:</b> Detects and helps recover failed pipeline jobs.<br/>
        <b>• Latency Anomaly Agent:</b> Identifies abnormal pipeline runtimes and performance bottlenecks.<br/>
        <br />
        You can link or edit active agents to each pipeline, or connect new agents as needed.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Schema Drift Agent</CardTitle>
            <CardDescription>
              Ensures consistency by monitoring structural changes in pipeline data schemas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            - Detects and classifies schema modifications.<br />
            - Suggests/reverts changes to avoid breaking dataflows.<br />
            - Escalates high-risk changes for supervisor review.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Job Failure Agent</CardTitle>
            <CardDescription>
              Increases reliability by monitoring job runs and automating recoveries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            - Alerts for job/ETL pipeline failures.<br />
            - Proposes retry or fallback, auto-recovers if allowed.<br />
            - Provides diagnostics and error insights.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Latency Anomaly Agent</CardTitle>
            <CardDescription>
              Keeps SLAs healthy by finding slow or unusual runtimes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            - Flags pipelines running slower/faster than expected.<br />
            - Refines performance and suggests resource optimizations.<br />
            - Differentiates temporary spikes vs. systematic issues.
          </CardContent>
        </Card>
      </div>
      <section>
        <div className="flex items-center gap-2 mb-2">
          <Info className="text-primary" size={18}/>
          <span className="font-semibold text-lg">Linked Agents on Pipelines</span>
        </div>
        <PipelineAgentsTable />
      </section>
      <LinkAgentsModal open={linkModalOpen} onClose={() => setLinkModalOpen(false)} />
    </div>
  );
}
