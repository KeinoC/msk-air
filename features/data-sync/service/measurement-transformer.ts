import type { MeasureFromAPI } from '../types/sync.types';
import type { Prisma } from '@prisma/client';

/**
 * Transforms an Air Gradient API measure to Prisma Measurement format
 */
export function transformMeasureToPrisma(
  measure: MeasureFromAPI,
  sensorId?: string
): Prisma.MeasurementCreateInput {
  // Convert ISO timestamp string to number (Unix timestamp in seconds)
  const timestamp = measure.timestamp
    ? Math.floor(new Date(measure.timestamp).getTime() / 1000)
    : undefined;

  // Extract date string from ISO timestamp
  const date = measure.timestamp
    ? new Date(measure.timestamp).toISOString().split('T')[0]
    : undefined;

  const data: Prisma.MeasurementCreateInput = {
    serialNumber: measure.serialno,
    locationId: measure.locationId,
    locationName: measure.locationName,
    locationType: measure.locationType,
    model: measure.model,
    firmwareVersion: measure.firmwareVersion,
    
    // PM measurements - raw
    pm01: measure.pm01,
    pm02: measure.pm02, // This is PM2.5
    pm10: measure.pm10,
    pm03PCount: measure.pm003Count,
    
    // PM measurements - corrected
    pm01_corrected: measure.pm01_corrected,
    pm02_corrected: measure.pm02_corrected,
    pm10_corrected: measure.pm10_corrected,
    
    // Environmental - raw
    atmp: measure.atmp,
    rhum: measure.rhum,
    rco2: measure.rco2,
    
    // Environmental - corrected
    atmp_corrected: measure.atmp_corrected,
    rhum_corrected: measure.rhum_corrected,
    rco2_corrected: measure.rco2_corrected,
    
    // VOC and indices
    tvoc: measure.tvoc,
    tvocIndex: measure.tvocIndex,
    noxIndex: measure.noxIndex,
    
    // Sensor info
    wifi: measure.wifi,
    datapoints: measure.datapoints,
    
    // Location coordinates
    longitude: measure.longitude ?? undefined,
    latitude: measure.latitude ?? undefined,
    
    // Timestamps
    timestamp,
    date,
  };

  // Add sensor relation if sensorId is provided
  if (sensorId) {
    data.sensor = {
      connect: { id: sensorId },
    };
  }

  return data;
}

