"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart-container";
import {
  MEASUREMENT_FIELDS,
  type MeasurementFieldConfig,
} from "./measurement-field-config";

// Map field keys to chart color indices
function getChartColorIndex(fieldKey: string): number {
  const colorMap: Record<string, number> = {
    pm01: 1,
    pm02: 2,
    pm10: 3,
    pm03PCount: 4,
    pm01_corrected: 1,
    pm02_corrected: 2,
    pm10_corrected: 3,
    atmp: 1,
    rhum: 2,
    rco2: 3,
    atmp_corrected: 1,
    rhum_corrected: 2,
    rco2_corrected: 3,
    tvoc: 4,
    tvocIndex: 5,
    noxIndex: 1,
  };
  return colorMap[fieldKey] || 1;
}

// Get actual color value from CSS variables
function getChartColor(colorIndex: number): string {
  if (typeof window === 'undefined') return '#4299e1'; // SSR fallback - neutral blue

  const root = document.documentElement;
  const colorValue = getComputedStyle(root).getPropertyValue(`--chart-${colorIndex}`).trim();

  if (colorValue) {
    // The CSS variables contain HSL values in space-separated format
    // Convert to comma-separated format for recharts compatibility
    const hslValue = `hsl(${colorValue.replace(/\s+/g, ', ')})`;
    return hslValue;
  }

  // Fallback to Forge-BI neutral colors
  const fallbackColors = ['#4299e1', '#38b2ac', '#f59e0b', '#a855f7', '#ec4899'];
  return fallbackColors[colorIndex - 1] || '#4299e1';
}
import type { z } from "zod";
import type { measurementFromDatabase } from "@/modules/airgradient/measurements/schemas/measurements";

type MeasurementFromDatabase = z.infer<typeof measurementFromDatabase>;

interface MeasurementChartProps {
  data: MeasurementFromDatabase[];
  fields: string[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  dateRange?: { startDate: Date; endDate: Date };
}

function formatTimestamp(
  timestamp: number | null | undefined,
  selectedRange?: { startDate: Date; endDate: Date }
): string {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);

  // Use the SELECTED date range (what user chose) not the actual data range
  // This ensures formatting matches user intent even if data is sparse
  if (selectedRange) {
    const rangeMs = selectedRange.endDate.getTime() - selectedRange.startDate.getTime();
    const rangeHours = rangeMs / (1000 * 60 * 60);
    const rangeDays = rangeMs / (1000 * 60 * 60 * 24);

    // For ranges up to 24 hours: show hour and minute
    if (rangeHours <= 24) {
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }

    // For ranges up to 7 days: show month, day, and hour
    if (rangeDays <= 7) {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
      }).format(date);
    }

    // For longer ranges: show date only
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  }

  // Fallback to date only format
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function prepareChartData(
  measurements: MeasurementFromDatabase[],
  fields: string[],
  selectedRange?: { startDate: Date; endDate: Date }
) {
  // Log the selected range for debugging
  if (selectedRange) {
    const rangeMs = selectedRange.endDate.getTime() - selectedRange.startDate.getTime();
    const rangeDays = rangeMs / (1000 * 60 * 60 * 24);
    console.log(`Selected date range: ${rangeDays.toFixed(2)} days`);
  }

  return measurements.map((measurement) => {
    const dataPoint: Record<string, any> = {
      timestamp: measurement.timestamp,
      date: formatTimestamp(measurement.timestamp, selectedRange),
    };

    fields.forEach((fieldKey) => {
      const value = (measurement as any)[fieldKey];
      if (value !== null && value !== undefined) {
        const config = MEASUREMENT_FIELDS[fieldKey];
        if (config) {
          dataPoint[config.label] = value;
        }
      }
    });

    return dataPoint;
  });
}

export function MeasurementChart({
  data,
  fields,
  isLoading,
  error,
  onRetry,
  dateRange,
}: MeasurementChartProps) {
  const chartData = prepareChartData(data, fields, dateRange);
  const isEmpty = chartData.length === 0 || fields.length === 0;

  const selectedFieldConfigs = fields
    .map((key) => ({
      key,
      config: MEASUREMENT_FIELDS[key],
    }))
    .filter((item): item is { key: string; config: MeasurementFieldConfig } =>
      Boolean(item.config)
    );

  // Calculate optimal tick count based on chart width and data density
  // Aim for 5-8 ticks on x-axis to avoid clutter
  const optimalTickCount = Math.min(8, Math.max(5, Math.floor(chartData.length / 10)));

  return (
    <ChartContainer
      title="Measurement Trends"
      description="Air quality measurements over time"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
    >
      {isEmpty ? (
        <div className="flex h-[350px] items-center justify-center text-center">
          <p className="text-muted-foreground text-sm">
            {fields.length === 0
              ? "Select at least one measurement field to display"
              : "No measurement data available for the selected range"}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickCount={optimalTickCount}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string) => {
                const fieldConfig = selectedFieldConfigs.find(
                  (f) => f.config.label === name
                );
                if (fieldConfig) {
                  return fieldConfig.config.formatter(value);
                }
                return value;
              }}
            />
            <Legend />
            {selectedFieldConfigs.map(({ key, config }, index) => {
              const colorIndex = getChartColorIndex(key);
              const color = getChartColor(colorIndex);
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={config.label}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={700}
                  animationBegin={index * 100}
                  isAnimationActive={true}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
}

