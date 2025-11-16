"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { orpcClient } from "@/lib/orpc/client";

interface Location {
  id: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocations() {
      try {
        setLoading(true);
        setError(null);
        const locationsData = await (orpcClient.airgradient.locations.list as any)({});
        setLocations(locationsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch locations");
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading locations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading locations</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Locations</h1>

      {locations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No locations found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <Link
              key={location.id}
              href={`/dashboard/locations/${location.id}`}
              className="block bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary transition-all"
            >
              <h2 className="text-xl font-semibold text-card-foreground mb-2">
                {location.name || "Unnamed Location"}
              </h2>
              <div className="space-y-1 text-sm text-muted-foreground">
                {location.address && (
                  <p>{location.address}</p>
                )}
                {(location.city || location.state || location.country) && (
                  <p>
                    {[location.city, location.state, location.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {location.zipCode && <p>{location.zipCode}</p>}
                {(location.latitude != null && location.longitude != null) && (
                  <p className="text-xs text-muted-foreground/70 mt-2">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

