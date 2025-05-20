
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Pipeline } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function PipelineList() {
  const pipelines = useAppStore((state) => state.pipelines);
  const selectPipeline = useAppStore((state) => state.selectPipeline);
  const selectedPipelineId = useAppStore((state) => state.selectedPipelineId);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter pipelines based on search query
  const filteredPipelines = pipelines.filter((pipeline) =>
    pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pipeline.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pipeline.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pipeline.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pipeline.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pipeline.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search pipelines..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pipeline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead className="hidden md:table-cell">Last Run</TableHead>
              <TableHead className="hidden md:table-cell">Owner</TableHead>
              <TableHead className="hidden md:table-cell">Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPipelines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  No pipelines found matching your search criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredPipelines.map((pipeline) => (
                <TableRow 
                  key={pipeline.id}
                  className={cn(
                    "cursor-pointer hover:bg-muted/50",
                    selectedPipelineId === pipeline.id && "bg-muted"
                  )}
                  onClick={() => selectPipeline(pipeline.id)}
                >
                  <TableCell className="font-medium">
                    <div>
                      {pipeline.name}
                      <div className="text-xs text-muted-foreground mt-1">
                        {pipeline.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <PipelineStatusBadge status={pipeline.status} />
                  </TableCell>
                  <TableCell>{pipeline.source}</TableCell>
                  <TableCell>{pipeline.destination}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(pipeline.lastRun, "MMM d, h:mm a")}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{pipeline.owner}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {pipeline.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface PipelineStatusBadgeProps {
  status: Pipeline["status"];
}

function PipelineStatusBadge({ status }: PipelineStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        status === "running" && "border-info bg-info/10 text-info",
        status === "failed" && "border-error bg-error/10 text-error",
        status === "completed" && "border-success bg-success/10 text-success",
        status === "warning" && "border-warning bg-warning/10 text-warning"
      )}
    >
      {status}
    </Badge>
  );
}
