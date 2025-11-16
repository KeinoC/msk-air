import { z } from 'zod';

export const sensor = z.object({
  id: z.string(),
  serialNumber: z.string().optional(),
  name: z.string().optional(),
  locationId: z.string().optional(),
  locationName: z.string().optional(),
  wifiSsid: z.string().optional(),
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
  model: z.string().optional(),
  firmwareVersion: z.string().optional(),
  ledBarTest: z.string().optional(),
  date: z.string().optional(),
  timestamp: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const sensorList = {
  request: z.object({
    limit: z.number().optional(),
    offset: z.number().optional(),
    locationId: z.string().optional(),
  }),
  response: z.array(sensor),
};

export const sensorGet = {
  request: z.object({
    id: z.string(),
  }),
  response: sensor,
};

export const sensorCreate = {
  request: z.object({
    serialNumber: z.string().optional(),
    name: z.string().optional(),
    locationId: z.string().optional(),
    wifiSsid: z.string().optional(),
    model: z.string().optional(),
    firmwareVersion: z.string().optional(),
  }),
  response: sensor,
};

export const sensorUpdate = {
  request: z.object({
    id: z.string(),
    name: z.string().optional(),
    locationId: z.string().optional(),
    wifiSsid: z.string().optional(),
    model: z.string().optional(),
    firmwareVersion: z.string().optional(),
  }),
  response: sensor,
};

export const sensorDelete = {
  request: z.object({
    id: z.string(),
  }),
  response: z.object({
    success: z.boolean(),
    message: z.string().optional(),
  }),
};

