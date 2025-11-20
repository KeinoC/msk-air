import { publicProcedure, orpcInstance } from '@/lib/orpc';
import * as measureSchemas from '../schemas/measures';
import { airGradientClient } from '@/lib/airgradient/client';

export const measuresRouter = {
  ping: publicProcedure
    .input(measureSchemas.ping.request)
    .output(measureSchemas.ping.response)
    .handler(async () => {
      return await airGradientClient.get('/ping');
    }),

  getCurrentMeasures: publicProcedure
    .input(measureSchemas.getCurrentMeasures.request)
    .output(measureSchemas.getCurrentMeasures.response)
    .handler(async () => {
      return await airGradientClient.get('/locations/measures/current');
    }),

  getLocationCurrentMeasures: publicProcedure
    .input(measureSchemas.getLocationCurrentMeasures.request)
    .output(measureSchemas.getLocationCurrentMeasures.response)
    .handler(async ({ input }) => {
      try {
        const result = await airGradientClient.get(`/locations/${input.locationId}/measures/current`);
        console.log('AirGradient API response for location', input.locationId, ':', result);

        // If result is not an array, return empty array
        if (!Array.isArray(result)) {
          console.warn('Expected array from AirGradient API, got:', typeof result, result);
          return [];
        }

        return result;
      } catch (error) {
        console.error('Error fetching location measures:', error);
        // Return empty array instead of throwing
        return [];
      }
    }),

  getLocationRawMeasures: publicProcedure
    .input(measureSchemas.getLocationRawMeasures.request)
    .output(measureSchemas.getLocationRawMeasures.response)
    .handler(async ({ input }) => {
      const query: Record<string, string | undefined> = {};
      if (input.from !== undefined) query.from = input.from;
      if (input.to !== undefined) query.to = input.to;

      return await airGradientClient.get(`/locations/${input.locationId}/measures/raw`, query);
    }),

  getLocationPastMeasures: publicProcedure
    .input(measureSchemas.getLocationPastMeasures.request)
    .output(measureSchemas.getLocationPastMeasures.response)
    .handler(async ({ input }) => {
      const query: Record<string, string | undefined> = {};
      if (input.from !== undefined) query.from = input.from;
      if (input.to !== undefined) query.to = input.to;

      return await airGradientClient.get(`/locations/${input.locationId}/measures/past`, query);
    }),

  getLocationBuckets: publicProcedure
    .input(measureSchemas.getLocationBuckets.request)
    .output(measureSchemas.getLocationBuckets.response)
    .handler(async ({ input }) => {
      const query: Record<string, string | undefined> = {};
      if (input.from !== undefined) query.from = input.from;
      if (input.to !== undefined) query.to = input.to;

      return await airGradientClient.get(`/locations/${input.locationIds}/measures/buckets/${input.bucketSize}`, query);
    }),

  getLocationLedMode: publicProcedure
    .input(measureSchemas.getLocationLedMode.request)
    .output(measureSchemas.getLocationLedMode.response)
    .handler(async ({ input }) => {
      return await airGradientClient.get(`/locations/${input.locationId}/sensor/config/leds/mode`);
    }),

  updateLocationLedMode: publicProcedure
    .input(measureSchemas.updateLocationLedMode.request)
    .output(measureSchemas.updateLocationLedMode.response)
    .handler(async ({ input }) => {
      const { locationId, ...body } = input;
      return await airGradientClient.put(`/locations/${locationId}/sensor/config/leds/mode`, body);
    }),

  getSensorLedMode: publicProcedure
    .input(measureSchemas.getSensorLedMode.request)
    .output(measureSchemas.getSensorLedMode.response)
    .handler(async ({ input }) => {
      return await airGradientClient.get(`/sensors/${input.serialno}/config/leds/mode`);
    }),

  updateSensorLedMode: publicProcedure
    .input(measureSchemas.updateSensorLedMode.request)
    .output(measureSchemas.updateSensorLedMode.response)
    .handler(async ({ input }) => {
      const { serialno, ...body } = input;
      return await airGradientClient.put(`/sensors/${serialno}/config/leds/mode`, body);
    }),

  calibrateLocationCo2: publicProcedure
    .input(measureSchemas.calibrateLocationCo2.request)
    .output(measureSchemas.calibrateLocationCo2.response)
    .handler(async ({ input }) => {
      return await airGradientClient.post(`/locations/${input.locationId}/sensor/co2/calibration`);
    }),

  calibrateSensorCo2: publicProcedure
    .input(measureSchemas.calibrateSensorCo2.request)
    .output(measureSchemas.calibrateSensorCo2.response)
    .handler(async ({ input }) => {
      return await airGradientClient.post(`/sensors/${input.serialno}/co2/calibration`);
    }),
};

