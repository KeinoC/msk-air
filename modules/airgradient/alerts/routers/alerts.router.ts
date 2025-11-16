import { publicProcedure, orpcInstance } from '@/lib/orpc';
import * as alertSchemas from '../schemas/alerts';
import { airGradientClient } from '@/lib/airgradient/client';

export const alertsRouter = orpcInstance.router({
  list: publicProcedure
    .input(alertSchemas.alertList.request)
    .output(alertSchemas.alertList.response)
    .handler(async ({ input }) => {
      const query: Record<string, string | number | boolean | undefined> = {};
      if (input.sensorId !== undefined) query.sensorId = input.sensorId;
      if (input.serialNumber !== undefined) query.serialNumber = input.serialNumber;
      if (input.type !== undefined) query.type = input.type;
      if (input.severity !== undefined) query.severity = input.severity;
      if (input.isActive !== undefined) query.isActive = input.isActive;
      if (input.limit !== undefined) query.limit = input.limit;
      if (input.offset !== undefined) query.offset = input.offset;

      return await airGradientClient.get('/alerts', query);
    }),

  get: publicProcedure
    .input(alertSchemas.alertGet.request)
    .output(alertSchemas.alertGet.response)
    .handler(async ({ input }) => {
      return await airGradientClient.get(`/alerts/${input.id}`);
    }),

  create: publicProcedure
    .input(alertSchemas.alertCreate.request)
    .output(alertSchemas.alertCreate.response)
    .handler(async ({ input }) => {
      return await airGradientClient.post('/alerts', input);
    }),

  update: publicProcedure
    .input(alertSchemas.alertUpdate.request)
    .output(alertSchemas.alertUpdate.response)
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await airGradientClient.put(`/alerts/${id}`, updateData);
    }),

  delete: publicProcedure
    .input(alertSchemas.alertDelete.request)
    .output(alertSchemas.alertDelete.response)
    .handler(async ({ input }) => {
      return await airGradientClient.delete(`/alerts/${input.id}`);
    }),
});

