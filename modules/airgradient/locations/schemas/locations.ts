import { z } from 'zod';

export const location = z.object({
  id: z.string(),
  name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const locationList = {
  request: z.object({
    limit: z.number().optional(),
    offset: z.number().optional(),
  }),
  response: z.array(location),
};

export const locationGet = {
  request: z.object({
    id: z.string(),
  }),
  response: location,
};

export const locationCreate = {
  request: z.object({
    name: z.string(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    timezone: z.string().optional(),
  }),
  response: location,
};

export const locationUpdate = {
  request: z.object({
    id: z.string(),
    name: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    timezone: z.string().optional(),
  }),
  response: location,
};

export const locationDelete = {
  request: z.object({
    id: z.string(),
  }),
  response: z.object({
    success: z.boolean(),
    message: z.string().optional(),
  }),
};

