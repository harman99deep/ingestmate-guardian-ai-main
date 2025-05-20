
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { useState } from "react";

const agentOptions = [
  { key: "schema", name: "Schema Drift Agent" },
  { key: "job", name: "Job Failure Agent" },
  { key: "latency", name: "Latency Anomaly Agent" }
];

export default function LinkAgentsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pipelines = useAppStore((s) => s.pipelines);
  const [pipelineId, setPipelineId] = useState<string>("");
  const [selectedAgents, setSelectedAgents] = useState<{ [key: string]: boolean }>({});

  const handleToggle = (key: string) => {
    setSelectedAgents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = () => {
    // Here you'd normally update the agents/pipeline in store or backend.
    // For now, just close modal
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Agents to Pipeline</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="block mb-1 font-medium text-sm">Select Pipeline</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={pipelineId}
              onChange={(e) => setPipelineId(e.target.value)}
            >
              <option value="">-- Select a pipeline --</option>
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium text-sm">Agents to Link</label>
            {agentOptions.map((agent) => (
              <label key={agent.key} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  checked={!!selectedAgents[agent.key]}
                  onChange={() => handleToggle(agent.key)}
                />
                <span>{agent.name}</span>
              </label>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!pipelineId || !Object.values(selectedAgents).some(Boolean)}>Save</Button>
          <Button onClick={onClose} variant="ghost">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
