import { z } from 'zod';

export const configuration = z.object({
  id: z.string(),
  sensorId: z.string().optional(),
  serialNumber: z.string().optional(),
  key: z.string().optional(),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const configurationList = {
  request: z.object({
    sensorId: z.string().optional(),
    serialNumber: z.string().optional(),
    key: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }),
  response: z.array(configuration),
};

export const configurationGet = {
  request: z.object({
    id: z.string(),
  }),
  response: configuration,
};

export const configurationCreate = {
  request: z.object({
    sensorId: z.string().optional(),
    serialNumber: z.string().optional(),
    key: z.string(),
    value: z.union([z.string(), z.number(), z.boolean()]),
    description: z.string().optional(),
  }),
  response: configuration,
};

export const configurationUpdate = {
  request: z.object({
    id: z.string(),
    value: z.union([z.string(), z.number(), z.boolean()]).optional(),
    description: z.string().optional(),
  }),
  response: configuration,
};

export const configurationDelete = {
  request: z.object({
    id: z.string(),
  }),
  response: z.object({
    success: z.boolean(),
    message: z.string().optional(),
  }),
};

