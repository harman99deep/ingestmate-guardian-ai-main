
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InterventionStatChartProps {
  data: Array<{
    agentType: "schema" | "job" | "latency";
    status: "applied" | "pending" | "rejected" | "failed";
    count: number;
  }>;
  title?: string;
  description?: string;
}

export function InterventionStatChart({
  data,
  title = "Agent Interventions",
  description = "Breakdown of agent interventions by type and status",
}: InterventionStatChartProps) {
  // Group and transform data for the chart
  const chartData = useMemo(() => {
    // Group by agent type
    const groupedByType = data.reduce<Record<string, any>>((acc, curr) => {
      if (!acc[curr.agentType]) {
        acc[curr.agentType] = {
          name: curr.agentType,
          applied: 0,
          pending: 0,
          rejected: 0,
          failed: 0,
          total: 0,
        };
      }
      
      acc[curr.agentType][curr.status] += curr.count;
      acc[curr.agentType].total += curr.count;
      
      return acc;
    }, {});
    
    return Object.values(groupedByType);
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="applied" 
                stackId="a" 
                fill="#10B981" 
                name="Applied"
              />
              <Bar 
                dataKey="pending" 
                stackId="a" 
                fill="#3B82F6" 
                name="Pending"
              />
              <Bar 
                dataKey="rejected" 
                stackId="a" 
                fill="#6B7280" 
                name="Rejected"
              />
              <Bar 
                dataKey="failed" 
                stackId="a" 
                fill="#EF4444" 
                name="Failed"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-sm p-3">
        <p className="mb-2 font-medium capitalize">{label} Agent</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={`tooltip-${index}`} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm">{entry.name}: {entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
