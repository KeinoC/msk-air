import { z } from 'zod';

export const measurement = z.object({
  id: z.string().optional(),
  sensorId: z.string().optional(),
  serialNumber: z.string().optional(),
  pm25: z.number().optional(),
  pm01: z.number().optional(),
  pm10: z.number().optional(),
  pm03PCount: z.number().optional(),
  atmp: z.number().optional(),
  rhum: z.number().optional(),
  rco2: z.number().optional(),
  tvoc: z.number().optional(),
  nox: z.number().optional(),
  wifi: z.number().optional(),
  boot: z.number().optional(),
  date: z.string().optional(),
  timestamp: z.number().optional(),
  createdAt: z.string().optional(),
});

export const measurementFromDatabase = z.object({
  id: z.string(),
  sensorId: z.string().nullable().optional(),
  serialNumber: z.string().nullable().optional(),
  
  locationId: z.number().nullable().optional(),
  locationName: z.string().nullable().optional(),
  locationType: z.string().nullable().optional(),
  
  pm01: z.number().nullable().optional(),
  pm02: z.number().nullable().optional(),
  pm10: z.number().nullable().optional(),
  pm03PCount: z.number().nullable().optional(),
  
  pm01_corrected: z.number().nullable().optional(),
  pm02_corrected: z.number().nullable().optional(),
  pm10_corrected: z.number().nullable().optional(),
  
  atmp: z.number().nullable().optional(),
  rhum: z.number().nullable().optional(),
  rco2: z.number().nullable().optional(),
  
  atmp_corrected: z.number().nullable().optional(),
  rhum_corrected: z.number().nullable().optional(),
  rco2_corrected: z.number().nullable().optional(),
  
  tvoc: z.number().nullable().optional(),
  tvocIndex: z.number().nullable().optional(),
  noxIndex: z.number().nullable().optional(),
  
  wifi: z.number().nullable().optional(),
  boot: z.number().nullable().optional(),
  model: z.string().nullable().optional(),
  firmwareVersion: z.string().nullable().optional(),
  datapoints: z.number().nullable().optional(),
  
  longitude: z.number().nullable().optional(),
  latitude: z.number().nullable().optional(),
  
  date: z.string().nullable().optional(),
  timestamp: z.number().nullable().optional(),
  createdAt: z.date(),
});

export const measurementList = {
  request: z.object({
    sensorId: z.string().optional(),
    serialNumber: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
  response: z.array(measurement),
};

export const measurementGet = {
  request: z.object({
    id: z.string(),
  }),
  response: measurement,
};

export const measurementCreate = {
  request: z.object({
    sensorId: z.string().optional(),
    serialNumber: z.string().optional(),
    pm25: z.number().optional(),
    pm01: z.number().optional(),
    pm10: z.number().optional(),
    pm03PCount: z.number().optional(),
    atmp: z.number().optional(),
    rhum: z.number().optional(),
    rco2: z.number().optional(),
    tvoc: z.number().optional(),
    nox: z.number().optional(),
    wifi: z.number().optional(),
    boot: z.number().optional(),
    date: z.string().optional(),
    timestamp: z.number().optional(),
  }),
  response: measurement,
};

export const measurementListFromDatabase = {
  request: z.object({
    locationId: z.number().optional(),
    sensorId: z.string().optional(),
    serialNumber: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
  response: z.array(measurementFromDatabase),
};

