
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  className?: string;
  onClick?: () => void;
}

export function StatusCard({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  className,
  onClick,
}: StatusCardProps) {
  const clickable = typeof onClick === "function";
  return (
    <Card 
      className={cn("overflow-hidden", clickable && "cursor-pointer hover:shadow-md transition-shadow", className)} 
      onClick={onClick}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? "button" : undefined}
      aria-pressed={false}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && trendValue && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className={cn(
                "text-xs",
                trend === "up" && "text-success",
                trend === "down" && "text-error",
                trend === "stable" && "text-muted-foreground"
              )}
            >
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {trend === "stable" && "→"}
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

