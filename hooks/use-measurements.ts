"use client";

import { useState, useEffect } from "react";
import { orpcClient } from "@/lib/orpc/client";
import type { z } from "zod";
import type { measurementFromDatabase } from "@/modules/airgradient/measurements/schemas/measurements";

type MeasurementFromDatabase = z.infer<typeof measurementFromDatabase>;

interface UseMeasurementsOptions {
  locationId?: number;
  sensorId?: string;
  serialNumber?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

interface UseMeasurementsResult {
  data: MeasurementFromDatabase[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMeasurements(
  options: UseMeasurementsOptions
): UseMeasurementsResult {
  const [data, setData] = useState<MeasurementFromDatabase[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeasurements = async () => {
    if (options.enabled === false) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const startDateStr =
        options.startDate instanceof Date
          ? options.startDate.toISOString()
          : options.startDate;
      const endDateStr =
        options.endDate instanceof Date
          ? options.endDate.toISOString()
          : options.endDate;

      const result = await (orpcClient.airgradient.measurements
        .getFromDatabase as any)({
        locationId: options.locationId,
        sensorId: options.sensorId,
        serialNumber: options.serialNumber,
        startDate: startDateStr,
        endDate: endDateStr,
        limit: options.limit,
        offset: options.offset,
      });

      setData(result || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch measurements";
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, [
    options.locationId,
    options.sensorId,
    options.serialNumber,
    options.startDate,
    options.endDate,
    options.limit,
    options.offset,
    options.enabled,
  ]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchMeasurements,
  };
}

