// File: ogs-client/depot/src/components/dashboard/StatCard.jsx
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const StatCard = ({ 
  label, 
  value, 
  icon: Icon,
  trend, // "up" | "down" | "neutral"
  trendValue,
  className,
  iconClassName,
  iconContainerClassName
}) => {
  const trendColors = {
    up: "text-emerald-600 dark:text-emerald-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-muted-foreground",
  };

  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  }[trend];

  return (
    <Card className={cn(
      "bg-card border transition-all duration-200",
      "hover:shadow-md",
      className
    )}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">
              {label}
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 truncate">
              {value}
            </p>
            {trend && trendValue && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-xs sm:text-sm",
                trendColors[trend]
              )}>
                {TrendIcon && <TrendIcon className="h-3 w-3 sm:h-4 sm:w-4" />}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn("p-2 sm:p-3 rounded-lg bg-muted shrink-0", iconContainerClassName)}>
              <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground", iconClassName)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
