import { z } from 'zod';

export const measure = z.object({
  locationId: z.number().optional(),
  locationName: z.string().optional(),
  locationType: z.string().optional(),
  serialno: z.string().optional(),
  model: z.string().optional(),
  pm01: z.number().optional(),
  pm02: z.number().optional(),
  pm10: z.number().optional(),
  pm01_corrected: z.number().optional(),
  pm02_corrected: z.number().optional(),
  pm10_corrected: z.number().optional(),
  pm003Count: z.number().optional(),
  atmp: z.number().optional(),
  rhum: z.number().optional(),
  rco2: z.number().optional(),
  atmp_corrected: z.number().optional(),
  rhum_corrected: z.number().optional(),
  rco2_corrected: z.number().optional(),
  tvoc: z.number().optional(),
  tvocIndex: z.number().optional(),
  noxIndex: z.number().optional(),
  wifi: z.number().optional(),
  datapoints: z.number().optional(),
  timestamp: z.string(),
  firmwareVersion: z.string().optional(),
  longitude: z.number().nullable().optional(),
  latitude: z.number().nullable().optional(),
});

export const measuresArray = z.array(measure);

export const LedMode = z.enum(['off', 'aqi', 'pm25', 'co2']);

export const ledModeResponse = z.object({
  mode: LedMode,
});

export const ping = {
  request: z.object({}).optional().default({}),
  response: z.object({
    status: z.string().optional(),
  }),
};

export const getCurrentMeasures = {
  request: z.object({}).optional().default({}),
  response: measuresArray,
};

export const getLocationCurrentMeasures = {
  request: z.object({
    locationId: z.number(),
  }),
  response: z.array(measure),
};

export const getLocationRawMeasures = {
  request: z.object({
    locationId: z.number(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
  response: measuresArray,
};

export const getLocationPastMeasures = {
  request: z.object({
    locationId: z.number(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
  response: measuresArray,
};

export const getLocationBuckets = {
  request: z.object({
    locationIds: z.string(),
    bucketSize: z.enum(['1h', '3h', '1d', '1w', '1m']),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
  response: measuresArray,
};

export const getLocationLedMode = {
  request: z.object({
    locationId: z.number(),
  }),
  response: ledModeResponse,
};

export const updateLocationLedMode = {
  request: z.object({
    locationId: z.number(),
    mode: LedMode,
  }),
  response: ledModeResponse,
};

export const getSensorLedMode = {
  request: z.object({
    serialno: z.string(),
  }),
  response: ledModeResponse,
};

export const updateSensorLedMode = {
  request: z.object({
    serialno: z.string(),
    mode: LedMode,
  }),
  response: ledModeResponse,
};

export const calibrateLocationCo2 = {
  request: z.object({
    locationId: z.number(),
  }),
  response: z.object({
    message: z.string(),
  }),
};

export const calibrateSensorCo2 = {
  request: z.object({
    serialno: z.string(),
  }),
  response: z.object({
    message: z.string(),
  }),
};

