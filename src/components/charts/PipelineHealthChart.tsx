
import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PipelineHealthChartProps {
  data: Array<{
    timestamp: Date;
    health: number;
  }>;
  title?: string;
  description?: string;
}

export function PipelineHealthChart({
  data,
  title = "Pipeline Health Trend",
  description = "Health score over time",
}: PipelineHealthChartProps) {
  // Format data for the chart
  const chartData = useMemo(() => {
    return data.map((item) => ({
      timestamp: item.timestamp,
      health: item.health,
      formattedTime: format(new Date(item.timestamp), "MMM d, HH:mm"),
    }));
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
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="formattedTime"
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickMargin={10}
                domain={[0, 100]}
                tickCount={6}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="health"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#healthGradient)"
              />
            </AreaChart>
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
    const health = payload[0].value;
    return (
      <div className="bg-background border rounded-md shadow-sm p-3">
        <p className="mb-1 text-sm">{label}</p>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              health >= 80 && "bg-success",
              health >= 50 && health < 80 && "bg-warning",
              health < 50 && "bg-error"
            )}
          />
          <p className="font-semibold">
            Health: {health}%
          </p>
        </div>
      </div>
    );
  }

  return null;
}
