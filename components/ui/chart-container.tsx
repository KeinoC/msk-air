"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  actions?: React.ReactNode;
}

export function ChartContainer({
  title,
  description,
  children,
  isLoading = false,
  error,
  onRetry,
  actions,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <Card className={cn("", className)} {...props}>
      {(title || description || actions) && (
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent>
        {isLoading ? (
          <div className="flex h-[350px] items-center justify-center">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-[350px] items-center justify-center">
            <div className="text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Error loading chart</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                >
                  Try again
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div>{children}</div>
        )}
      </CardContent>
    </Card>
  );
}

