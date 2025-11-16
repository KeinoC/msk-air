import { z } from 'zod';
import { publicProcedure, orpcInstance } from '@/lib/orpc';
import * as locationSchemas from '../schemas/locations';
import { locationService } from '@/features/locations/service/location.service';
import { airGradientClient } from '@/lib/airgradient/client';

export const locationsRouter = orpcInstance.router({
  list: publicProcedure
    .input(locationSchemas.locationList.request)
    .output(locationSchemas.locationList.response)
    .handler(async ({ input }) => {
      try {
        console.log('Fetching measures from API...');
        const measures = await airGradientClient.get<Array<{
          locationId?: number;
          locationName?: string;
          latitude?: number | null;
          longitude?: number | null;
        }>>('/locations/measures/current');

        console.log('Measures received:', Array.isArray(measures) ? measures.length : 'not an array', measures);

        if (!Array.isArray(measures)) {
          console.error('Measures response is not an array:', measures);
          return [];
        }

        const locationMap = new Map<number, {
          id: string;
          name?: string;
          latitude?: number;
          longitude?: number;
        }>();

        measures.forEach((measure: any) => {
          if (measure.locationId && !locationMap.has(measure.locationId)) {
            locationMap.set(measure.locationId, {
              id: String(measure.locationId),
              name: measure.locationName,
              latitude: measure.latitude ?? undefined,
              longitude: measure.longitude ?? undefined,
            });
          }
        });

        const locations = Array.from(locationMap.values()).map((loc) => ({
          id: loc.id,
          name: loc.name ?? undefined,
          latitude: loc.latitude ?? undefined,
          longitude: loc.longitude ?? undefined,
        }));

        console.log('Returning locations:', locations.length, locations);
        return locations;
      } catch (error) {
        console.error('Error fetching locations:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
        throw error;
      }
    }),

  sync: publicProcedure
    .input(z.object({}).optional().default({}))
    .output(locationSchemas.locationList.response)
    .handler(async () => {
      return await locationService.syncFromApi();
    }),

  get: publicProcedure
    .input(locationSchemas.locationGet.request)
    .output(locationSchemas.locationGet.response)
    .handler(async ({ input }) => {
      return await locationService.get(input.id);
    }),

  create: publicProcedure
    .input(locationSchemas.locationCreate.request)
    .output(locationSchemas.locationCreate.response)
    .handler(async ({ input }) => {
      return await locationService.create(input);
    }),

  update: publicProcedure
    .input(locationSchemas.locationUpdate.request)
    .output(locationSchemas.locationUpdate.response)
    .handler(async ({ input }) => {
      const { id, ...updateData } = input;
      return await locationService.update(id, updateData);
    }),

  delete: publicProcedure
    .input(locationSchemas.locationDelete.request)
    .output(locationSchemas.locationDelete.response)
    .handler(async ({ input }) => {
      return await locationService.delete(input.id);
    }),
});

