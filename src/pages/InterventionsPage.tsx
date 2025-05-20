
import { InterventionList } from "@/components/interventions/InterventionList";

export default function InterventionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Agent Interventions</h1>
      <p className="text-muted-foreground">
        View and manage all agent interventions across your pipelines
      </p>
      <InterventionList />
    </div>
  );
}
