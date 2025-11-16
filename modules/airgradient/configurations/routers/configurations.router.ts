import { publicProcedure, orpcInstance } from '@/lib/orpc';
import * as configurationSchemas from '../schemas/configurations';
import { airGradientClient } from '@/lib/airgradient/client';

export const configurationsRouter = orpcInstance.router({
  list: publicProcedure
    .input(configurationSchemas.configurationList.request)
    .output(configurationSchemas.configurationList.response)
    .handler(async ({ input }) => {
      const query: Record<string, string | number | undefined> = {};
      if (input.sensorId !== undefined) query.sensorId = input.sensorId;
      if (input.serialNumber !== undefined) query.serialNumber = input.serialNumber;
      if (input.key !== undefined) query.key = input.key;
      if (input.limit !== undefined) query.limit = input.limit;
      if (input.offset !== undefined) query.offset = input.offset;

      return await airGradientClient.get('/configurations', query);
    }),

  get: publicProcedure
    .input(configurationSchemas.configurationGet.request)
    .output(configurationSchemas.configurationGet.response)
    .handler(async ({ input }) => {
      return await airGradientClient.get(`/configurations/${input.id}`);
    }),

  create: publicProcedure
    .input(configurationSchemas.configurationCreate.request)
    .output(configurationSchemas.configurationCreate.response)
    .handler(async ({ input }) => {
      return await airGradientClient.post('/configurations', input);
    }),

  update: publicProcedure
    .input(configurationSchemas.configurationUpdate.request)
    .output(configurationSchemas.configurationUpdate.response)
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await airGradientClient.put(`/configurations/${id}`, updateData);
    }),

  delete: publicProcedure
    .input(configurationSchemas.configurationDelete.request)
    .output(configurationSchemas.configurationDelete.response)
    .handler(async ({ input }) => {
      return await airGradientClient.delete(`/configurations/${input.id}`);
    }),
});

