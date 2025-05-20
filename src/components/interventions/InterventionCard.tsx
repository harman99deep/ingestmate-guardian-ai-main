import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AgentIntervention } from "@/types";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Database, Clock, ChevronDown, ChevronUp, Check, X, Plus } from "lucide-react";
import { toast } from "sonner";

interface InterventionCardProps {
  intervention: AgentIntervention;
}

export function InterventionCard({ intervention }: InterventionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const agentMode = useAppStore((state) => state.agentMode);
  const approveIntervention = useAppStore((state) => state.approveIntervention);
  const rejectIntervention = useAppStore((state) => state.rejectIntervention);
  const markManuallyFixed = useAppStore((state) => state.markManuallyFixed);

  const handleApprove = () => {
    approveIntervention(intervention.id);
    toast.success("Intervention approved", {
      description: "The agent has been authorized to apply the remediation",
    });
  };

  const handleReject = () => {
    rejectIntervention(intervention.id);
    toast.info("Intervention rejected", {
      description: "The agent's suggestion has been rejected",
    });
  };

  const handleManualFix = () => {
    markManuallyFixed(intervention.id);
    toast.success("Marked as fixed", {
      description: "This intervention was marked as manually resolved.",
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn(
              "px-2 py-1 capitalize",
              intervention.agentType === "schema" && "border-info bg-info/10 text-info",
              intervention.agentType === "job" && "border-warning bg-warning/10 text-warning",
              intervention.agentType === "latency" && "border-agent bg-agent/10 text-agent"
            )}
          >
            {intervention.agentType === "schema" && <Database className="mr-1 h-3 w-3" />}
            {intervention.agentType === "job" && <Activity className="mr-1 h-3 w-3" />}
            {intervention.agentType === "latency" && <Clock className="mr-1 h-3 w-3" />}
            {intervention.agentType} agent
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "capitalize",
              intervention.status === "pending" && "border-info bg-info/10 text-info",
              intervention.status === "approved" && "border-success bg-success/10 text-success",
              intervention.status === "rejected" && "border-muted bg-muted/10 text-muted-foreground",
              intervention.status === "applied" && "border-success bg-success/10 text-success",
              intervention.status === "failed" && "border-error bg-error/10 text-error"
            )}
          >
            {intervention.status}
          </Badge>
        </div>
        <CardTitle className="text-base mt-2">{intervention.action}</CardTitle>
        <CardDescription className="mt-1 line-clamp-2">
          {intervention.issue}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="text-sm space-y-2">
          <div className="flex justify-between text-muted-foreground text-xs">
            <span>Confidence</span>
            <span className="font-medium">{(intervention.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className={cn(
                "h-1.5 rounded-full",
                intervention.confidence > 0.8 
                  ? "bg-success" 
                  : intervention.confidence > 0.6 
                    ? "bg-warning" 
                    : "bg-error"
              )}
              style={{ width: `${intervention.confidence * 100}%` }}
            ></div>
          </div>
          
          <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {format(new Date(intervention.timestamp), "MMM d, h:mm a")}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 -mr-2 px-2"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-3 border-t pt-3">
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium">Reasoning</span>
                <p className="text-sm mt-1">{intervention.reasoning}</p>
              </div>
              
              {intervention.result && (
                <div>
                  <span className="text-xs font-medium">Result</span>
                  <p className="text-sm mt-1">{intervention.result}</p>
                </div>
              )}
              
              {intervention.approvedBy && (
                <div className="text-xs text-muted-foreground">
                  {intervention.status === "rejected" ? "Rejected" : "Approved"} by{" "}
                  <span className="font-medium">{intervention.approvedBy}</span>
                  {intervention.approvedAt && ` on ${format(new Date(intervention.approvedAt), "MMM d, h:mm a")}`}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      {agentMode === "supervised" && intervention.status === "pending" && (
        <CardFooter className="flex gap-2 border-t px-6 py-3">
          <Button 
            variant="outline" 
            className="flex-1 border-error hover:bg-error hover:text-error-foreground"
            onClick={handleReject}
          >
            <X className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-success hover:bg-success hover:text-success-foreground"
            onClick={handleApprove}
          >
            <Check className="mr-2 h-4 w-4" />
            Approve
          </Button>
        </CardFooter>
      )}
      
      {/* Show manual fix button for failed job interventions */}
      {intervention.agentType === "job" && 
        (intervention.status === "applied" || intervention.status === "failed") &&
        (intervention.result?.toLowerCase().includes("fail") || 
         intervention.result?.toLowerCase().includes("error") ||
         intervention.result?.toLowerCase().includes("unable")) && (
        <CardFooter className="flex border-t px-6 py-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-agent hover:bg-agent hover:text-agent-foreground mx-auto"
            onClick={handleManualFix}
          >
            <Plus className="h-4 w-4" />
            Mark as Fixed Manually
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
