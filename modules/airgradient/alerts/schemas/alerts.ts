import { z } from 'zod';

export const alert = z.object({
  id: z.string(),
  sensorId: z.string().optional(),
  serialNumber: z.string().optional(),
  type: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  message: z.string().optional(),
  threshold: z.number().optional(),
  currentValue: z.number().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
  resolvedAt: z.string().optional(),
});

export const alertList = {
  request: z.object({
    sensorId: z.string().optional(),
    serialNumber: z.string().optional(),
    type: z.string().optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    isActive: z.boolean().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }),
  response: z.array(alert),
};

export const alertGet = {
  request: z.object({
    id: z.string(),
  }),
  response: alert,
};

export const alertCreate = {
  request: z.object({
    sensorId: z.string().optional(),
    serialNumber: z.string().optional(),
    type: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    message: z.string().optional(),
    threshold: z.number().optional(),
  }),
  response: alert,
};

export const alertUpdate = {
  request: z.object({
    id: z.string(),
    isActive: z.boolean().optional(),
    resolvedAt: z.string().optional(),
  }),
  response: alert,
};

export const alertDelete = {
  request: z.object({
    id: z.string(),
  }),
  response: z.object({
    success: z.boolean(),
    message: z.string().optional(),
  }),
};

