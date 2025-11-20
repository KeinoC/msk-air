import { publicProcedure, orpcInstance } from '@/lib/orpc';
import * as measurementSchemas from '../schemas/measurements';
import { airGradientClient } from '@/lib/airgradient/client';
import { prisma } from '@/lib/prisma/client';

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

  getFromDatabase: publicProcedure
    .input(measurementSchemas.measurementListFromDatabase.request)
    .output(measurementSchemas.measurementListFromDatabase.response)
    .handler(async ({ input }) => {
      const where: any = {};

      if (input.locationId !== undefined) {
        where.locationId = input.locationId;
      }

      if (input.sensorId !== undefined) {
        where.sensorId = input.sensorId;
      }

      if (input.serialNumber !== undefined) {
        where.serialNumber = input.serialNumber;
      }

      // Note: locationName filtering could be added here if needed
      // but it's not in the schema yet, so we'll skip it for now

      if (input.startDate || input.endDate) {
        where.timestamp = {};
        if (input.startDate) {
          const startTimestamp = Math.floor(new Date(input.startDate).getTime() / 1000);
          where.timestamp.gte = startTimestamp;
        }
        if (input.endDate) {
          const endTimestamp = Math.floor(new Date(input.endDate).getTime() / 1000);
          where.timestamp.lte = endTimestamp;
        }
      }

      const measurements = await prisma.measurement.findMany({
        where,
        orderBy: {
          timestamp: 'asc',
        },
        take: input.limit,
        skip: input.offset,
      });

      return measurements;
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

