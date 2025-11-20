export interface SyncOptions {
  locationId: number;
  from?: string; // ISO date string
  to?: string; // ISO date string
}

export interface SyncResult {
  success: boolean;
  totalFetched: number;
  totalSaved: number;
  totalUpdated: number;
  totalSkipped: number;
  errors: SyncError[];
  duration: number; // milliseconds
}

export interface SyncError {
  message: string;
  measure?: unknown;
  error?: unknown;
}

export interface MeasureFromAPI {
  locationId?: number;
  locationName?: string;
  locationType?: string;
  serialno?: string;
  model?: string;
  pm01?: number;
  pm02?: number;
  pm10?: number;
  pm01_corrected?: number;
  pm02_corrected?: number;
  pm10_corrected?: number;
  pm003Count?: number;
  atmp?: number;
  rhum?: number;
  rco2?: number;
  atmp_corrected?: number;
  rhum_corrected?: number;
  rco2_corrected?: number;
  tvoc?: number;
  tvocIndex?: number;
  noxIndex?: number;
  wifi?: number;
  datapoints?: number;
  timestamp: string; // ISO string
  firmwareVersion?: string;
  longitude?: number | null;
  latitude?: number | null;
}

