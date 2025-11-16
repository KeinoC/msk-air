import { ORPCError } from '@orpc/server';
import { prisma } from '@/lib/prisma/client';
import { airGradientClient } from '@/lib/airgradient/client';
import type { Prisma } from '@prisma/client';

export type LocationCreateInput = Prisma.LocationCreateInput;
export type LocationUpdateInput = Prisma.LocationUpdateInput;

export class LocationService {
  async list(params: { limit?: number; offset?: number } = {}) {
    const { limit, offset } = params;
    
    const locations = await prisma.location.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return locations.map(this.mapToSchema);
  }

  async get(id: string) {
    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new ORPCError('NOT_FOUND', {
        message: `Location with id ${id} not found`,
      });
    }

    return this.mapToSchema(location);
  }

  async create(data: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  }) {
    const location = await prisma.location.create({
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        zipCode: data.zipCode,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
      },
    });

    return this.mapToSchema(location);
  }

  async update(id: string, data: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  }) {
    try {
      const location = await prisma.location.update({
        where: { id },
        data: {
          name: data.name,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          zipCode: data.zipCode,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
        },
      });

      return this.mapToSchema(location);
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new ORPCError('NOT_FOUND', {
          message: `Location with id ${id} not found`,
        });
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await prisma.location.delete({
        where: { id },
      });

      return {
        success: true,
        message: `Location ${id} deleted successfully`,
      };
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new ORPCError('NOT_FOUND', {
          message: `Location with id ${id} not found`,
        });
      }
      throw error;
    }
  }

  async syncFromApi() {
    try {
      const measures = await airGradientClient.get<Array<{
        locationId?: number;
        locationName?: string;
        latitude?: number | null;
        longitude?: number | null;
      }>>('/locations/measures/current');

      const locationMap = new Map<number, {
        id: string;
        name?: string;
        latitude?: number;
        longitude?: number;
      }>();

      for (const measure of measures) {
        if (measure.locationId && !locationMap.has(measure.locationId)) {
          locationMap.set(measure.locationId, {
            id: String(measure.locationId),
            name: measure.locationName,
            latitude: measure.latitude ?? undefined,
            longitude: measure.longitude ?? undefined,
          });
        }
      }

      const syncedLocations = [];

      for (const [, apiLocation] of locationMap) {
        try {
          const location = await prisma.location.upsert({
            where: { id: apiLocation.id },
            update: {
              name: apiLocation.name,
              latitude: apiLocation.latitude,
              longitude: apiLocation.longitude,
            },
            create: {
              id: apiLocation.id,
              name: apiLocation.name,
              latitude: apiLocation.latitude,
              longitude: apiLocation.longitude,
            },
          });

          syncedLocations.push(this.mapToSchema(location));
        } catch (error: any) {
          console.error(`Failed to upsert location ${apiLocation.id}:`, error);
          if (error?.code !== 'P2002') {
            throw error;
          }
        }
      }

      return syncedLocations;
    } catch (error) {
      console.error('Error in syncFromApi:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: `Failed to sync locations from API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  private mapToSchema(location: {
    id: string;
    name: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    zipCode: string | null;
    latitude: number | null;
    longitude: number | null;
    timezone: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: location.id,
      name: location.name ?? undefined,
      address: location.address ?? undefined,
      city: location.city ?? undefined,
      state: location.state ?? undefined,
      country: location.country ?? undefined,
      zipCode: location.zipCode ?? undefined,
      latitude: location.latitude ?? undefined,
      longitude: location.longitude ?? undefined,
      timezone: location.timezone ?? undefined,
      createdAt: location.createdAt.toISOString(),
      updatedAt: location.updatedAt.toISOString(),
    };
  }
}

export const locationService = new LocationService();

