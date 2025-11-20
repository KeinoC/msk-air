import { orpcClient } from '@/lib/orpc/client';
import { prisma } from '@/lib/prisma/client';
import type { MeasureFromAPI, SyncOptions, SyncResult, SyncError } from '../types/sync.types';
import { transformMeasureToPrisma } from './measurement-transformer';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches measurements from Air Gradient API by date range with retry logic
 */
export async function fetchMeasurementsByRange(
  options: SyncOptions,
  retries = MAX_RETRIES
): Promise<MeasureFromAPI[]> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const measures = await (orpcClient.airgradient.measures.getLocationRawMeasures as any)({
        locationId: options.locationId,
        from: options.from,
        to: options.to,
      });

      // Handle case where API returns wrapped response
      if (measures && typeof measures === 'object' && 'json' in measures) {
        return (measures as any).json || [];
      }

      return Array.isArray(measures) ? measures : [];
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          throw error;
        }
      }

      if (attempt < retries) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt); // Exponential backoff
        console.warn(`Fetch attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error);
        await sleep(delay);
      }
    }
  }

  console.error('Error fetching measurements after retries:', lastError);
  throw lastError;
}

/**
 * Looks up or creates a sensor by serial number
 */
async function getOrCreateSensor(serialNumber?: string, locationId?: number): Promise<string | undefined> {
  if (!serialNumber) {
    return undefined;
  }

  try {
    // Try to find existing sensor
    let sensor = await prisma.sensor.findUnique({
      where: { id: serialNumber },
    });

    if (!sensor) {
      // Create new sensor if it doesn't exist
      sensor = await prisma.sensor.create({
        data: {
          id: serialNumber,
          serialNumber: serialNumber,
          locationId: locationId?.toString(),
        },
      });
    }

    return sensor.id;
  } catch (error) {
    console.error(`Error getting/creating sensor ${serialNumber}:`, error);
    return undefined;
  }
}

/**
 * Saves measurements to database with deduplication
 * Uses timestamp + serialNumber as unique key
 * Processes in batches for better performance
 */
export async function saveMeasurements(
  measures: MeasureFromAPI[],
  onProgress?: (processed: number, total: number) => void
): Promise<{ saved: number; updated: number; skipped: number; errors: SyncError[] }> {
  let saved = 0;
  let updated = 0;
  let skipped = 0;
  const errors: SyncError[] = [];
  const BATCH_SIZE = 50; // Process in batches to avoid overwhelming the database

  for (let i = 0; i < measures.length; i += BATCH_SIZE) {
    const batch = measures.slice(i, i + BATCH_SIZE);
    
    for (const measure of batch) {
      try {
      if (!measure.serialno || !measure.timestamp) {
        skipped++;
        errors.push({
          message: 'Missing serialno or timestamp',
          measure,
        });
        continue;
      }

      // Get or create sensor
      const sensorId = await getOrCreateSensor(
        measure.serialno,
        measure.locationId
      );

      // Transform measure to Prisma format
      const measurementData = transformMeasureToPrisma(measure, sensorId);

      // Convert timestamp to number for lookup
      const timestamp = measurementData.timestamp;

      if (!timestamp) {
        skipped++;
        errors.push({
          message: 'Invalid timestamp',
          measure,
        });
        continue;
      }

      // Check if measurement already exists
      const existing = await prisma.measurement.findFirst({
        where: {
          timestamp: timestamp,
          serialNumber: measure.serialno,
        },
      });

      if (existing) {
        // Update existing measurement
        // Remove sensor relation for update (use sensorId directly)
        const { sensor, ...updateData } = measurementData;
        await prisma.measurement.update({
          where: { id: existing.id },
          data: {
            ...updateData,
            sensorId: sensorId || null,
          },
        });
        updated++;
      } else {
        // Create new measurement
        await prisma.measurement.create({
          data: measurementData,
        });
        saved++;
      }
    } catch (error) {
      errors.push({
        message: `Failed to save measurement: ${error instanceof Error ? error.message : 'Unknown error'}`,
        measure,
        error,
      });
        skipped++;
      }
    }

    // Report progress
    if (onProgress) {
      onProgress(Math.min(i + BATCH_SIZE, measures.length), measures.length);
    }
  }

  return { saved, updated, skipped, errors };
}

/**
 * Syncs all measurement data for a location by date range
 */
export async function syncLocationData(
  options: SyncOptions,
  onProgress?: (message: string, processed?: number, total?: number) => void
): Promise<SyncResult> {
  const startTime = Date.now();
  const errors: SyncError[] = [];

  try {
    onProgress?.(`Fetching measurements for location ${options.locationId}...`);

    // Fetch measurements from API
    const measures = await fetchMeasurementsByRange(options);

    onProgress?.(`Fetched ${measures.length} measurements`);

    if (measures.length === 0) {
      return {
        success: true,
        totalFetched: 0,
        totalSaved: 0,
        totalUpdated: 0,
        totalSkipped: 0,
        errors: [],
        duration: Date.now() - startTime,
      };
    }

    onProgress?.(`Saving measurements to database...`);

    // Save measurements to database with progress tracking
    const result = await saveMeasurements(measures, (processed, total) => {
      onProgress?.(`Processing measurements...`, processed, total);
    });

    onProgress?.(`Sync complete: ${result.saved} saved, ${result.updated} updated, ${result.skipped} skipped`);

    return {
      success: result.errors.length === 0,
      totalFetched: measures.length,
      totalSaved: result.saved,
      totalUpdated: result.updated,
      totalSkipped: result.skipped,
      errors: result.errors,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    errors.push({
      message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error,
    });

    return {
      success: false,
      totalFetched: 0,
      totalSaved: 0,
      totalUpdated: 0,
      totalSkipped: 0,
      errors,
      duration: Date.now() - startTime,
    };
  }
}

