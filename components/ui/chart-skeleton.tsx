import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Skeleton } from "./skeleton";

interface ChartSkeletonProps {
  hasTitle?: boolean;
  hasLegend?: boolean;
  height?: string;
}

export function ChartSkeleton({
  hasTitle = true,
  hasLegend = true,
  height = "h-80",
}: ChartSkeletonProps) {
  return (
    <Card>
      {hasTitle && (
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-1/4" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-1/3" />
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <Skeleton className={`w-full ${height}`} />
        {hasLegend && (
          <div className="mt-4 flex justify-center gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`chart-skeleton-legend-item-${i + 1}`}
                className="flex items-center gap-2"
              >
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

