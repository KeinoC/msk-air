import { z } from 'zod';

export const hello = {
  request: z.object({
    name: z.string().min(1),
  }),
  response: z.object({
    message: z.string(),
    timestamp: z.string(),
  }),
};

export const protectedHello = {
  request: z.object({}),
  response: z.object({
    message: z.string(),
    userId: z.string(),
    timestamp: z.string(),
  }),
};

export const getUser = {
  request: z.object({
    id: z.string(),
  }),
  response: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string(),
  }),
};

