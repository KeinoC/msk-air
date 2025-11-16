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

