
import { useAppStore } from "@/lib/store";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const agentsByKey: Record<string, string> = {
  schema: "Schema Drift Agent",
  job: "Job Failure Agent",
  latency: "Latency Anomaly Agent"
};

export default function PipelineAgentsTable() {
  const pipelines = useAppStore((s) => s.pipelines);

  // For demo: every pipeline has all three agents, "edit" is stub only
  return (
    <table className="min-w-full rounded border text-sm">
      <thead>
        <tr className="border-b">
          <th className="py-2 px-4 text-left">Pipeline</th>
          <th className="py-2 px-4 text-left">Agents Linked</th>
          <th className="py-2 px-4 text-left">Action</th>
        </tr>
      </thead>
      <tbody>
        {pipelines.map((pl) => (
          <tr key={pl.id} className="border-b hover:bg-muted/30">
            <td className="py-2 px-4">{pl.name}</td>
            <td className="py-2 px-4">
              {Object.values(agentsByKey).map((agent, idx) => (
                <span key={agent} className="bg-secondary text-secondary-foreground px-2 py-1 rounded mr-2">{agent}</span>
              ))}
            </td>
            <td className="py-2 px-4">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Edit2 size={14} /> Edit
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
