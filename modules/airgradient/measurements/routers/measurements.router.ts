import { publicProcedure, orpcInstance } from '@/lib/orpc';
import * as measurementSchemas from '../schemas/measurements';
import { airGradientClient } from '@/lib/airgradient/client';

export const measurementsRouter = orpcInstance.router({
  list: publicProcedure
    .input(measurementSchemas.measurementList.request)
    .output(measurementSchemas.measurementList.response)
    .handler(async ({ input }) => {
      const query: Record<string, string | number | undefined> = {};
      if (input.sensorId !== undefined) query.sensorId = input.sensorId;
      if (input.serialNumber !== undefined) query.serialNumber = input.serialNumber;
      if (input.limit !== undefined) query.limit = input.limit;
      if (input.offset !== undefined) query.offset = input.offset;
      if (input.startDate !== undefined) query.startDate = input.startDate;
      if (input.endDate !== undefined) query.endDate = input.endDate;

      return await airGradientClient.get('/measurements', query);
    }),

  get: publicProcedure
    .input(measurementSchemas.measurementGet.request)
    .output(measurementSchemas.measurementGet.response)
    .handler(async ({ input }) => {
      return await airGradientClient.get(`/measurements/${input.id}`);
    }),

  create: publicProcedure
    .input(measurementSchemas.measurementCreate.request)
    .output(measurementSchemas.measurementCreate.response)
    .handler(async ({ input }) => {
      return await airGradientClient.post('/measurements', input);
    }),
});

