
import { PipelineDetail } from "@/components/pipelines/PipelineDetail";
import { PipelineList } from "@/components/dashboard/PipelineList";

export default function PipelinesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pipelines</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <PipelineList />
        </div>
        <div className="lg:col-span-2">
          <PipelineDetail />
        </div>
      </div>
    </div>
  );
}
