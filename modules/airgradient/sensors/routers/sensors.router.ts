import { publicProcedure, orpcInstance } from '@/lib/orpc';
import * as sensorSchemas from '../schemas/sensors';
import { airGradientClient } from '@/lib/airgradient/client';

export const sensorsRouter = orpcInstance.router({
  list: publicProcedure
    .input(sensorSchemas.sensorList.request)
    .output(sensorSchemas.sensorList.response)
    .handler(async ({ input }) => {
      const query: Record<string, string | number | undefined> = {};
      if (input.limit !== undefined) query.limit = input.limit;
      if (input.offset !== undefined) query.offset = input.offset;
      if (input.locationId !== undefined) query.locationId = input.locationId;

      return await airGradientClient.get('/sensors', query);
    }),

  get: publicProcedure
    .input(sensorSchemas.sensorGet.request)
    .output(sensorSchemas.sensorGet.response)
    .handler(async ({ input }) => {
      return await airGradientClient.get(`/sensors/${input.id}`);
    }),

  create: publicProcedure
    .input(sensorSchemas.sensorCreate.request)
    .output(sensorSchemas.sensorCreate.response)
    .handler(async ({ input }) => {
      return await airGradientClient.post('/sensors', input);
    }),

  update: publicProcedure
    .input(sensorSchemas.sensorUpdate.request)
    .output(sensorSchemas.sensorUpdate.response)
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await airGradientClient.put(`/sensors/${id}`, updateData);
    }),

  delete: publicProcedure
    .input(sensorSchemas.sensorDelete.request)
    .output(sensorSchemas.sensorDelete.response)
    .handler(async ({ input }) => {
      return await airGradientClient.delete(`/sensors/${input.id}`);
    }),
});

